const { v4: uuidv4 } = require('uuid');
const { PHASES } = require('../../rooms/roomFactory');
const store = require('../../rooms/store');
const phaseMachine = require('../../game/phaseMachine');
const { sanitizeText, MAX_MESSAGE_LENGTH } = require('../../utils/validation');
const events = require('../events');
const { broadcastToRoom } = require('../broadcast');

function registerChatHandlers(io, socket) {
  socket.on(events.CHAT_SEND_DISCUSSION_MESSAGE, ({ text } = {}, cb) => {
    const entry = store.lookupSocket(socket.id);
    if (!entry) { if (cb) cb({ error: 'Not in a room.' }); return; }
    const room = store.getRoom(entry.roomCode);
    if (!room || room.phase !== PHASES.DISCUSSION_VOTING) {
      if (cb) cb({ error: 'Discussion is not open right now.' });
      return;
    }
    const player = room.players.get(entry.playerId);
    const round = phaseMachine.currentRound(room);
    const messageText = sanitizeText(text, MAX_MESSAGE_LENGTH);
    if (!player || !round || !messageText) {
      if (cb) cb({ error: 'Message cannot be empty.' });
      return;
    }

    const message = {
      id: uuidv4(),
      playerId: player.id,
      name: player.name,
      text: messageText,
      sentAt: Date.now(),
    };
    round.discussionMessages.push(message);
    broadcastToRoom(io, room, events.CHAT_NEW_DISCUSSION_MESSAGE, message);
    if (cb) cb({ ok: true });
  });
}

module.exports = { registerChatHandlers };
