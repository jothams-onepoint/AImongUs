const { PHASES } = require('../rooms/roomFactory');

function serializePlayer(player, { includeToken }) {
  return {
    id: player.id,
    name: player.name,
    connected: player.connected,
    isHost: player.isHost,
    ...(includeToken ? { rejoinToken: player.rejoinToken } : {}),
  };
}

function serializeRound(round, room, forPlayerId) {
  if (!round) return null;

  const isHost = forPlayerId === room.hostPlayerId;
  const isAiPlayer = forPlayerId === round.aiPlayerId;
  const revealed = room.phase === PHASES.REVEAL || room.phase === PHASES.ENDED;
  const canSeeAiIdentity = (isHost && !round.hideAiFromHost) || isAiPlayer || revealed;

  const voteTally = {};
  for (const [voterId, targetId] of round.votes.entries()) {
    if (!voteTally[targetId]) voteTally[targetId] = [];
    voteTally[targetId].push(voterId);
  }

  return {
    index: round.index,
    questionText: round.questionText,
    aiPlayerId: canSeeAiIdentity ? round.aiPlayerId : null,
    answererIds: round.answererIds,
    isAnswerer: round.answererIds.includes(forPlayerId),
    canVote: round.eligibleVoterIds.includes(forPlayerId),
    answers: round.answers,
    discussionMessages: round.discussionMessages,
    voteTally,
    myVoteTargetId: round.votes.get(forPlayerId) || null,
    writingEndsAt: round.writingEndsAt,
    discussionEndsAt: round.discussionEndsAt,
    result: round.result,
  };
}

function buildRoomSnapshot(room, forPlayerId) {
  const currentRound = room.rounds[room.rounds.length - 1] || null;
  const isHost = forPlayerId === room.hostPlayerId;
  const canSeePendingAi = (isHost && !room.hideAiFromHost) || forPlayerId === room.pendingAiPlayerId;

  return {
    code: room.code,
    hostPlayerId: room.hostPlayerId,
    players: Array.from(room.players.values()).map((p) =>
      serializePlayer(p, { includeToken: p.id === forPlayerId })),
    settings: room.settings,
    questionBank: isHost ? room.questionBank : undefined,
    phase: room.phase,
    phaseEndsAt: room.phaseEndsAt,
    pendingAiPlayerId: canSeePendingAi ? room.pendingAiPlayerId : null,
    pendingAiAssigned: Boolean(room.pendingAiPlayerId),
    pendingAiIsRandom: room.hideAiFromHost,
    scoreboard: Object.fromEntries(room.scoreboard.entries()),
    round: serializeRound(currentRound, room, forPlayerId),
    you: { playerId: forPlayerId },
  };
}

module.exports = { buildRoomSnapshot, serializeRound };
