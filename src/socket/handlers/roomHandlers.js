const { createRoom, createPlayer, PHASES } = require('../../rooms/roomFactory');
const { generateUniqueRoomCode } = require('../../rooms/roomCode');
const store = require('../../rooms/store');
const { isValidName, sanitizeText, MAX_NAME_LENGTH } = require('../../utils/validation');
const { buildRoomSnapshot } = require('../../utils/serialize');
const events = require('../events');
const { broadcastToRoom, broadcastRoomState } = require('../broadcast');

function attachPlayerSocket(socket, room, player) {
  player.socketId = socket.id;
  player.connected = true;
  socket.join(room.code);
  store.indexSocket(socket.id, room.code, player.id);
}

function registerRoomHandlers(io, socket) {
  socket.on(events.ROOM_CREATE, ({ hostName } = {}, cb) => {
    if (typeof cb !== 'function') return;
    const name = sanitizeText(hostName, MAX_NAME_LENGTH);
    if (!isValidName(name)) {
      cb({ error: 'Please enter a name.' });
      return;
    }

    const hostPlayer = createPlayer({ name, isHost: true });
    const roomCode = generateUniqueRoomCode(store.rooms);
    const room = createRoom({ code: roomCode, hostPlayer });
    store.setRoom(roomCode, room);
    attachPlayerSocket(socket, room, hostPlayer);

    cb({
      roomCode,
      playerId: hostPlayer.id,
      rejoinToken: hostPlayer.rejoinToken,
      room: buildRoomSnapshot(room, hostPlayer.id),
    });
  });

  socket.on(events.ROOM_JOIN, ({ roomCode, name } = {}, cb) => {
    if (typeof cb !== 'function') return;
    const code = typeof roomCode === 'string' ? roomCode.trim().toUpperCase() : '';
    const room = store.getRoom(code);
    if (!room) {
      cb({ error: 'Room not found.' });
      return;
    }
    if (room.phase === PHASES.ENDED) {
      cb({ error: 'This game has already ended.' });
      return;
    }

    const trimmedName = sanitizeText(name, MAX_NAME_LENGTH);
    if (!isValidName(trimmedName)) {
      cb({ error: 'Please enter a name.' });
      return;
    }
    const nameTaken = Array.from(room.players.values())
      .some((p) => p.name.toLowerCase() === trimmedName.toLowerCase());
    if (nameTaken) {
      cb({ error: 'That name is already taken in this room.' });
      return;
    }

    const player = createPlayer({ name: trimmedName, isHost: false });
    room.players.set(player.id, player);
    room.scoreboard.set(player.id, 0);
    attachPlayerSocket(socket, room, player);

    cb({
      roomCode: room.code,
      playerId: player.id,
      rejoinToken: player.rejoinToken,
      room: buildRoomSnapshot(room, player.id),
    });
    broadcastToRoom(io, room, events.ROOM_PLAYER_JOINED, { player: { id: player.id, name: player.name } });
    broadcastRoomState(io, room);
  });

  socket.on(events.ROOM_REJOIN, ({ roomCode, playerId, rejoinToken } = {}, cb) => {
    if (typeof cb !== 'function') return;
    const code = typeof roomCode === 'string' ? roomCode.trim().toUpperCase() : '';
    const room = store.getRoom(code);
    const player = room && room.players.get(playerId);
    if (!room || !player || player.rejoinToken !== rejoinToken) {
      cb({ error: 'Could not rejoin that room.' });
      return;
    }

    attachPlayerSocket(socket, room, player);
    cb({ room: buildRoomSnapshot(room, player.id) });
    broadcastToRoom(io, room, events.ROOM_PLAYER_CONNECTION_CHANGED, { playerId: player.id, connected: true });
    broadcastRoomState(io, room);
  });

  socket.on(events.PLAYER_LEAVE, () => {
    handleDisconnectOrLeave(io, socket, { removePlayer: true });
  });

  socket.on('disconnect', () => {
    handleDisconnectOrLeave(io, socket, { removePlayer: false });
  });
}

function handleDisconnectOrLeave(io, socket, { removePlayer }) {
  const entry = store.lookupSocket(socket.id);
  if (!entry) return;
  store.removeSocketIndex(socket.id);

  const room = store.getRoom(entry.roomCode);
  if (!room) return;
  const player = room.players.get(entry.playerId);
  if (!player) return;

  if (removePlayer) {
    room.players.delete(player.id);
    broadcastToRoom(io, room, events.ROOM_PLAYER_LEFT, { playerId: player.id });
    if (room.players.size === 0) {
      store.deleteRoom(room.code);
      return;
    }
  } else {
    player.connected = false;
    player.socketId = null;
    broadcastToRoom(io, room, events.ROOM_PLAYER_CONNECTION_CHANGED, { playerId: player.id, connected: false });
  }
  broadcastRoomState(io, room);
}

module.exports = { registerRoomHandlers };
