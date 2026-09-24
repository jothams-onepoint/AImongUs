const events = require('./events');
const { buildRoomSnapshot } = require('../utils/serialize');

// room:state payloads differ per-recipient (only the host and the assigned AI
// player see aiPlayerId before reveal), so this can't be a single io.to(room) emit.
function broadcastRoomState(io, room) {
  for (const player of room.players.values()) {
    if (player.socketId) {
      io.to(player.socketId).emit(events.ROOM_STATE, buildRoomSnapshot(room, player.id));
    }
  }
}

function broadcastToRoom(io, room, event, payload) {
  io.to(room.code).emit(event, payload);
}

function sendToPlayer(io, room, playerId, event, payload) {
  const player = room.players.get(playerId);
  if (player && player.socketId) {
    io.to(player.socketId).emit(event, payload);
  }
}

module.exports = { broadcastRoomState, broadcastToRoom, sendToPlayer };
