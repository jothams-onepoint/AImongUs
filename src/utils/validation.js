const MIN_PLAYERS_TO_START = 3;
const MAX_NAME_LENGTH = 24;
const MAX_MESSAGE_LENGTH = 500;

function isHost(room, playerId) {
  return room.hostPlayerId === playerId;
}

function sanitizeText(text, maxLength) {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
}

function isValidName(name) {
  return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= MAX_NAME_LENGTH;
}

module.exports = {
  MIN_PLAYERS_TO_START,
  MAX_NAME_LENGTH,
  MAX_MESSAGE_LENGTH,
  isHost,
  sanitizeText,
  isValidName,
};
