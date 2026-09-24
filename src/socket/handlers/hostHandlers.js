const { v4: uuidv4 } = require('uuid');
const { PHASES } = require('../../rooms/roomFactory');
const store = require('../../rooms/store');
const { isHost, sanitizeText, MIN_PLAYERS_TO_START, MAX_MESSAGE_LENGTH } = require('../../utils/validation');
const phaseMachine = require('../../game/phaseMachine');
const events = require('../events');
const { broadcastRoomState } = require('../broadcast');

function getRoomForHostAction(socket, cb) {
  const entry = store.lookupSocket(socket.id);
  if (!entry) {
    if (cb) cb({ error: 'Not in a room.' });
    return null;
  }
  const room = store.getRoom(entry.roomCode);
  if (!room || !isHost(room, entry.playerId)) {
    if (cb) cb({ error: 'Only the host can do that.' });
    return null;
  }
  return room;
}

function registerHostHandlers(io, socket) {
  socket.on(events.HOST_UPDATE_SETTINGS, (settings = {}, cb) => {
    const room = getRoomForHostAction(socket, cb);
    if (!room) return;

    const connectedCount = phaseMachine.connectedPlayerIds(room).length;
    if (settings.answerersPerRound !== undefined) {
      if (settings.answerersPerRound === 'all') {
        room.settings.answerersPerRound = 'all';
      } else {
        const n = Number(settings.answerersPerRound);
        if (Number.isInteger(n) && n >= 1 && n <= Math.max(connectedCount, 1)) {
          room.settings.answerersPerRound = n;
        }
      }
    }
    if (settings.writingDurationSec !== undefined) {
      const n = Number(settings.writingDurationSec);
      if (Number.isInteger(n) && n >= 15 && n <= 900) room.settings.writingDurationSec = n;
    }
    if (settings.discussionDurationSec !== undefined) {
      const n = Number(settings.discussionDurationSec);
      if (Number.isInteger(n) && n >= 15 && n <= 900) room.settings.discussionDurationSec = n;
    }

    broadcastRoomState(io, room);
    if (cb) cb({ ok: true });
  });

  socket.on(events.HOST_ADD_QUESTION, ({ text } = {}, cb) => {
    const room = getRoomForHostAction(socket, cb);
    if (!room) return;
    const questionText = sanitizeText(text, MAX_MESSAGE_LENGTH);
    if (!questionText) {
      if (cb) cb({ error: 'Question text is required.' });
      return;
    }
    room.questionBank.push({ id: uuidv4(), text: questionText, isCustom: true, used: false });
    broadcastRoomState(io, room);
    if (cb) cb({ ok: true });
  });

  socket.on(events.HOST_REMOVE_QUESTION, ({ questionId } = {}, cb) => {
    const room = getRoomForHostAction(socket, cb);
    if (!room) return;
    room.questionBank = room.questionBank.filter((q) => q.id !== questionId);
    broadcastRoomState(io, room);
    if (cb) cb({ ok: true });
  });

  socket.on(events.HOST_ASSIGN_AI, ({ playerId } = {}, cb) => {
    const room = getRoomForHostAction(socket, cb);
    if (!room) return;
    if (room.phase !== PHASES.LOBBY && room.phase !== PHASES.ROUND_SETUP) {
      if (cb) cb({ error: 'Cannot assign the AI player right now.' });
      return;
    }
    const player = room.players.get(playerId);
    if (!player || !player.connected) {
      if (cb) cb({ error: 'Player not found or not connected.' });
      return;
    }
    room.pendingAiPlayerId = playerId;
    broadcastRoomState(io, room);
    if (cb) cb({ ok: true });
  });

  socket.on(events.HOST_START_ROUND, ({ questionId } = {}, cb) => {
    const room = getRoomForHostAction(socket, cb);
    if (!room) return;
    if (room.phase !== PHASES.LOBBY && room.phase !== PHASES.ROUND_SETUP) {
      if (cb) cb({ error: 'Cannot start a round right now.' });
      return;
    }
    if (!room.pendingAiPlayerId) {
      if (cb) cb({ error: 'Assign a player as the AI first.' });
      return;
    }
    const aiPlayer = room.players.get(room.pendingAiPlayerId);
    if (!aiPlayer || !aiPlayer.connected) {
      room.pendingAiPlayerId = null;
      if (cb) cb({ error: 'The assigned AI player disconnected. Please assign someone else.' });
      return;
    }
    if (phaseMachine.connectedPlayerIds(room).length < MIN_PLAYERS_TO_START) {
      if (cb) cb({ error: `Need at least ${MIN_PLAYERS_TO_START} connected players.` });
      return;
    }
    phaseMachine.startRound(io, room, { questionId });
    if (cb) cb({ ok: true });
  });

  socket.on(events.HOST_FORCE_ADVANCE_PHASE, (_payload, cb) => {
    const room = getRoomForHostAction(socket, cb);
    if (!room) return;
    phaseMachine.forceAdvancePhase(io, room);
    if (cb) cb({ ok: true });
  });

  socket.on(events.HOST_NEXT_ROUND, (_payload, cb) => {
    const room = getRoomForHostAction(socket, cb);
    if (!room) return;
    if (room.phase !== PHASES.REVEAL) {
      if (cb) cb({ error: 'Cannot start next round right now.' });
      return;
    }
    phaseMachine.beginRoundSetup(io, room);
    if (cb) cb({ ok: true });
  });

  socket.on(events.HOST_END_GAME, (_payload, cb) => {
    const room = getRoomForHostAction(socket, cb);
    if (!room) return;
    phaseMachine.endGame(io, room);
    if (cb) cb({ ok: true });
  });
}

module.exports = { registerHostHandlers };
