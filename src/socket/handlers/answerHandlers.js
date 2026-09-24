const { PHASES } = require('../../rooms/roomFactory');
const store = require('../../rooms/store');
const phaseMachine = require('../../game/phaseMachine');
const { sanitizeText, MAX_MESSAGE_LENGTH } = require('../../utils/validation');
const events = require('../events');
const { broadcastToRoom } = require('../broadcast');

function registerAnswerHandlers(io, socket) {
  socket.on(events.ANSWER_SUBMIT, ({ text } = {}, cb) => {
    const entry = store.lookupSocket(socket.id);
    if (!entry) { if (cb) cb({ error: 'Not in a room.' }); return; }
    const room = store.getRoom(entry.roomCode);
    if (!room || room.phase !== PHASES.WRITING) {
      if (cb) cb({ error: 'Not accepting answers right now.' });
      return;
    }
    const round = phaseMachine.currentRound(room);
    if (!round || !round.answererIds.includes(entry.playerId)) {
      if (cb) cb({ error: 'You are not an answerer this round.' });
      return;
    }
    const answerText = sanitizeText(text, MAX_MESSAGE_LENGTH);
    if (!answerText) {
      if (cb) cb({ error: 'Answer cannot be empty.' });
      return;
    }

    const submittedAt = Date.now();
    const existingIndex = round.answers.findIndex((a) => a.playerId === entry.playerId);
    const answer = { playerId: entry.playerId, text: answerText, submittedAt };
    if (existingIndex >= 0) {
      round.answers[existingIndex] = answer;
    } else {
      round.answers.push(answer);
    }

    broadcastToRoom(io, room, events.ANSWER_NEW, answer);
    if (cb) cb({ ok: true });
  });
}

module.exports = { registerAnswerHandlers };
