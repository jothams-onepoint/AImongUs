const { PHASES, createRound } = require('../rooms/roomFactory');
const { pickNextQuestion } = require('../questions/pickQuestion');
const { selectAnswerers } = require('./answererSelection');
const { computeRoundScores } = require('./scoring');
const events = require('../socket/events');
const { broadcastRoomState, broadcastToRoom } = require('../socket/broadcast');

function currentRound(room) {
  return room.rounds[room.rounds.length - 1] || null;
}

function connectedPlayerIds(room) {
  return Array.from(room.players.values())
    .filter((p) => p.connected)
    .map((p) => p.id);
}

function clearPhaseTimer(room) {
  if (room.phaseTimerHandle) {
    clearTimeout(room.phaseTimerHandle);
    room.phaseTimerHandle = null;
  }
}

function enterPhase(io, room, phase, durationMs) {
  clearPhaseTimer(room);
  room.phase = phase;
  room.phaseVersion += 1;
  room.phaseEndsAt = durationMs != null ? Date.now() + durationMs : null;

  const round = currentRound(room);
  if (phase === PHASES.WRITING && round) round.writingEndsAt = room.phaseEndsAt;
  if (phase === PHASES.DISCUSSION_VOTING && round) round.discussionEndsAt = room.phaseEndsAt;

  if (durationMs != null) {
    const capturedVersion = room.phaseVersion;
    room.phaseTimerHandle = setTimeout(() => {
      if (room.phaseVersion !== capturedVersion) return; // stale timer, no-op
      advancePhase(io, room);
    }, durationMs);
  }

  broadcastToRoom(io, room, events.PHASE_CHANGED, { phase: room.phase, phaseEndsAt: room.phaseEndsAt });
  broadcastRoomState(io, room);
}

function startRound(io, room, { questionId } = {}) {
  const aiPlayerId = room.pendingAiPlayerId;
  const requested = questionId ? room.questionBank.find((q) => q.id === questionId) : null;
  const question = requested || pickNextQuestion(room.questionBank);
  question.used = true;

  const answererIds = selectAnswerers({
    connectedPlayerIds: connectedPlayerIds(room),
    aiPlayerId,
    answerersPerRound: room.settings.answerersPerRound,
  });

  const round = createRound({
    index: room.rounds.length + 1,
    questionId: question.id,
    questionText: question.text,
    aiPlayerId,
    answererIds,
    eligibleVoterIds: connectedPlayerIds(room),
    hideAiFromHost: room.hideAiFromHost,
  });
  room.rounds.push(round);
  room.pendingAiPlayerId = null;

  broadcastToRoom(io, room, events.ROUND_STARTED, {
    roundIndex: round.index,
    questionText: round.questionText,
    answererIds: round.answererIds,
  });

  enterPhase(io, room, PHASES.WRITING, room.settings.writingDurationSec * 1000);
}

function advancePhase(io, room) {
  clearPhaseTimer(room);

  if (room.phase === PHASES.WRITING) {
    enterPhase(io, room, PHASES.DISCUSSION_VOTING, room.settings.discussionDurationSec * 1000);
    return;
  }

  if (room.phase === PHASES.DISCUSSION_VOTING) {
    const round = currentRound(room);
    const result = computeRoundScores(round, Array.from(room.players.keys()));
    round.result = result;
    for (const [playerId, delta] of Object.entries(result.pointsAwarded)) {
      room.scoreboard.set(playerId, (room.scoreboard.get(playerId) || 0) + delta);
    }

    enterPhase(io, room, PHASES.REVEAL, null);
    broadcastToRoom(io, room, events.ROUND_REVEAL, {
      roundIndex: round.index,
      aiPlayerId: round.aiPlayerId,
      voteCounts: result.voteCounts,
      accusedSet: result.accusedSet,
      aiCaught: result.aiCaught,
      pointsAwarded: result.pointsAwarded,
      scoreboard: Object.fromEntries(room.scoreboard.entries()),
    });
    return;
  }
}

function forceAdvancePhase(io, room) {
  if (room.phase !== PHASES.WRITING && room.phase !== PHASES.DISCUSSION_VOTING) return;
  advancePhase(io, room);
}

function beginRoundSetup(io, room) {
  room.pendingAiPlayerId = null;
  room.hideAiFromHost = false;
  enterPhase(io, room, PHASES.ROUND_SETUP, null);
}

function endGame(io, room) {
  clearPhaseTimer(room);
  room.phase = PHASES.ENDED;
  room.phaseVersion += 1;
  room.phaseEndsAt = null;
  broadcastToRoom(io, room, events.PHASE_CHANGED, { phase: room.phase, phaseEndsAt: null });
  broadcastRoomState(io, room);
}

module.exports = {
  currentRound,
  connectedPlayerIds,
  startRound,
  advancePhase,
  forceAdvancePhase,
  beginRoundSetup,
  endGame,
};
