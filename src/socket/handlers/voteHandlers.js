const { PHASES } = require('../../rooms/roomFactory');
const store = require('../../rooms/store');
const phaseMachine = require('../../game/phaseMachine');
const events = require('../events');
const { broadcastToRoom } = require('../broadcast');

function registerVoteHandlers(io, socket) {
  socket.on(events.VOTE_CAST, ({ targetPlayerId } = {}, cb) => {
    const entry = store.lookupSocket(socket.id);
    if (!entry) { if (cb) cb({ error: 'Not in a room.' }); return; }
    const room = store.getRoom(entry.roomCode);
    if (!room || room.phase !== PHASES.DISCUSSION_VOTING) {
      if (cb) cb({ error: 'Voting is not open right now.' });
      return;
    }
    const round = phaseMachine.currentRound(room);
    if (!round || !round.eligibleVoterIds.includes(entry.playerId)) {
      if (cb) cb({ error: 'You cannot vote this round.' });
      return;
    }
    if (targetPlayerId === entry.playerId) {
      if (cb) cb({ error: 'You cannot vote for yourself.' });
      return;
    }
    if (!round.answererIds.includes(targetPlayerId)) {
      if (cb) cb({ error: 'You can only vote for a player who answered this round.' });
      return;
    }

    round.votes.set(entry.playerId, targetPlayerId);

    const tally = {};
    for (const [voterId, tId] of round.votes.entries()) {
      if (!tally[tId]) tally[tId] = [];
      tally[tId].push(voterId);
    }
    broadcastToRoom(io, room, events.VOTE_UPDATED, { tally });
    if (cb) cb({ ok: true });
  });
}

module.exports = { registerVoteHandlers };
