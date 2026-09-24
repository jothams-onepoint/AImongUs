const { registerRoomHandlers } = require('./handlers/roomHandlers');
const { registerHostHandlers } = require('./handlers/hostHandlers');
const { registerAnswerHandlers } = require('./handlers/answerHandlers');
const { registerChatHandlers } = require('./handlers/chatHandlers');
const { registerVoteHandlers } = require('./handlers/voteHandlers');

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
    registerHostHandlers(io, socket);
    registerAnswerHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerVoteHandlers(io, socket);
  });
}

module.exports = { registerSocketHandlers };
