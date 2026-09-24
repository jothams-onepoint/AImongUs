const rooms = new Map(); // roomCode -> Room
const socketIndex = new Map(); // socketId -> { roomCode, playerId }

function getRoom(roomCode) {
  return rooms.get(roomCode);
}

function setRoom(roomCode, room) {
  rooms.set(roomCode, room);
}

function deleteRoom(roomCode) {
  const room = rooms.get(roomCode);
  if (room && room.phaseTimerHandle) {
    clearTimeout(room.phaseTimerHandle);
  }
  rooms.delete(roomCode);
}

function hasRoomCode(roomCode) {
  return rooms.has(roomCode);
}

function indexSocket(socketId, roomCode, playerId) {
  socketIndex.set(socketId, { roomCode, playerId });
}

function lookupSocket(socketId) {
  return socketIndex.get(socketId);
}

function removeSocketIndex(socketId) {
  socketIndex.delete(socketId);
}

module.exports = {
  rooms,
  getRoom,
  setRoom,
  deleteRoom,
  hasRoomCode,
  indexSocket,
  lookupSocket,
  removeSocketIndex,
};
