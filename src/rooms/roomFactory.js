const { v4: uuidv4 } = require('uuid');
const { createDefaultQuestionBank } = require('../questions/defaultQuestions');

const PHASES = {
  LOBBY: 'lobby',
  ROUND_SETUP: 'round_setup',
  WRITING: 'writing',
  DISCUSSION_VOTING: 'discussion_voting',
  REVEAL: 'reveal',
  ENDED: 'ended',
};

function createPlayer({ name, isHost }) {
  return {
    id: uuidv4(),
    name,
    socketId: null,
    connected: true,
    isHost: Boolean(isHost),
    rejoinToken: uuidv4(),
    joinedAt: Date.now(),
  };
}

function createRoom({ code, hostPlayer }) {
  return {
    code,
    createdAt: Date.now(),
    hostPlayerId: hostPlayer.id,
    players: new Map([[hostPlayer.id, hostPlayer]]),
    settings: {
      answerersPerRound: 'all',
      writingDurationSec: 120,
      discussionDurationSec: 120,
    },
    questionBank: createDefaultQuestionBank(),
    phase: PHASES.LOBBY,
    phaseVersion: 0,
    phaseEndsAt: null,
    phaseTimerHandle: null,
    pendingAiPlayerId: null,
    hideAiFromHost: false,
    rounds: [],
    scoreboard: new Map([[hostPlayer.id, 0]]),
  };
}

function createRound({ index, questionId, questionText, aiPlayerId, answererIds, eligibleVoterIds, hideAiFromHost }) {
  return {
    index,
    questionId,
    questionText,
    aiPlayerId,
    answererIds,
    eligibleVoterIds,
    hideAiFromHost,
    answers: [],
    discussionMessages: [],
    votes: new Map(),
    writingEndsAt: null,
    discussionEndsAt: null,
    result: null,
  };
}

module.exports = { PHASES, createPlayer, createRoom, createRound };
