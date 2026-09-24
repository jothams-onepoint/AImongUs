import React, { createContext, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { socket } from '../socket.js';
import { saveSession, loadSession, clearSession } from '../utils/rejoinStorage.js';

export const GameContext = createContext(null);

const initialState = {
  room: null,
  myPlayerId: null,
  joinError: null,
  rejoinAttempted: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_JOINED': {
      const { room, playerId } = action.payload;
      return { ...state, room, myPlayerId: playerId, joinError: null };
    }
    case 'SET_ROOM':
      return { ...state, room: action.payload };
    case 'SET_JOIN_ERROR':
      return { ...state, joinError: action.payload };
    case 'REJOIN_DONE':
      return { ...state, rejoinAttempted: true };
    case 'UPSERT_ANSWER': {
      if (!state.room?.round) return state;
      const answers = state.room.round.answers.filter((a) => a.playerId !== action.payload.playerId);
      answers.push(action.payload);
      return { ...state, room: { ...state.room, round: { ...state.room.round, answers } } };
    }
    case 'APPEND_CHAT': {
      if (!state.room?.round) return state;
      const discussionMessages = [...state.room.round.discussionMessages, action.payload];
      return { ...state, room: { ...state.room, round: { ...state.room.round, discussionMessages } } };
    }
    case 'SET_VOTE_TALLY': {
      if (!state.room?.round) return state;
      const { tally } = action.payload;
      let myVoteTargetId = null;
      for (const [targetId, voterIds] of Object.entries(tally)) {
        if (voterIds.includes(state.myPlayerId)) myVoteTargetId = targetId;
      }
      return { ...state, room: { ...state.room, round: { ...state.room.round, voteTally: tally, myVoteTargetId } } };
    }
    case 'LEFT_ROOM':
      return { ...initialState, rejoinAttempted: true };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [connected, setConnected] = useState(socket.connected);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    const onRoomState = (room) => {
      dispatch({ type: 'SET_ROOM', payload: room });
    };
    const onAnswerNew = (answer) => dispatch({ type: 'UPSERT_ANSWER', payload: answer });
    const onChatMessage = (message) => dispatch({ type: 'APPEND_CHAT', payload: message });
    const onVoteUpdated = (payload) => dispatch({ type: 'SET_VOTE_TALLY', payload });

    socket.on('room:state', onRoomState);
    socket.on('answer:new', onAnswerNew);
    socket.on('chat:newDiscussionMessage', onChatMessage);
    socket.on('vote:updated', onVoteUpdated);

    return () => {
      socket.off('room:state', onRoomState);
      socket.off('answer:new', onAnswerNew);
      socket.off('chat:newDiscussionMessage', onChatMessage);
      socket.off('vote:updated', onVoteUpdated);
    };
  }, []);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      dispatch({ type: 'REJOIN_DONE' });
      return;
    }
    const attemptRejoin = () => {
      socket.emit('room:rejoin', session, (res) => {
        if (res?.error) {
          clearSession();
        } else {
          dispatch({ type: 'SET_JOINED', payload: { room: res.room, playerId: session.playerId } });
        }
        dispatch({ type: 'REJOIN_DONE' });
      });
    };
    if (socket.connected) attemptRejoin();
    else socket.once('connect', attemptRejoin);
  }, []);

  const createRoom = useCallback((hostName) => new Promise((resolve) => {
    socket.emit('room:create', { hostName }, (res) => {
      if (res?.error) {
        dispatch({ type: 'SET_JOIN_ERROR', payload: res.error });
        resolve({ ok: false, error: res.error });
        return;
      }
      saveSession({ roomCode: res.roomCode, playerId: res.playerId, rejoinToken: res.rejoinToken });
      dispatch({ type: 'SET_JOINED', payload: { room: res.room, playerId: res.playerId } });
      resolve({ ok: true });
    });
  }), []);

  const joinRoom = useCallback((roomCode, name) => new Promise((resolve) => {
    socket.emit('room:join', { roomCode, name }, (res) => {
      if (res?.error) {
        dispatch({ type: 'SET_JOIN_ERROR', payload: res.error });
        resolve({ ok: false, error: res.error });
        return;
      }
      saveSession({ roomCode: res.roomCode, playerId: res.playerId, rejoinToken: res.rejoinToken });
      dispatch({ type: 'SET_JOINED', payload: { room: res.room, playerId: res.playerId } });
      resolve({ ok: true });
    });
  }), []);

  const leaveRoom = useCallback(() => {
    socket.emit('player:leave');
    clearSession();
    dispatch({ type: 'LEFT_ROOM' });
  }, []);

  const emitAction = useCallback((event, payload) => new Promise((resolve) => {
    socket.emit(event, payload, (res) => resolve(res || { ok: true }));
  }), []);

  const actions = useMemo(() => ({
    createRoom,
    joinRoom,
    leaveRoom,
    updateSettings: (settings) => emitAction('host:updateSettings', settings),
    addQuestion: (text) => emitAction('host:addQuestion', { text }),
    removeQuestion: (questionId) => emitAction('host:removeQuestion', { questionId }),
    moveQuestion: (questionId, direction) => emitAction('host:moveQuestion', { questionId, direction }),
    assignAI: (playerId) => emitAction('host:assignAI', { playerId }),
    randomizeAI: () => emitAction('host:randomizeAI', {}),
    startRound: (questionId) => emitAction('host:startRound', { questionId }),
    forceAdvancePhase: () => emitAction('host:forceAdvancePhase', {}),
    nextRound: () => emitAction('host:nextRound', {}),
    endGame: () => emitAction('host:endGame', {}),
    submitAnswer: (text) => emitAction('answer:submit', { text }),
    sendDiscussionMessage: (text) => emitAction('chat:sendDiscussionMessage', { text }),
    castVote: (targetPlayerId) => emitAction('vote:cast', { targetPlayerId }),
  }), [createRoom, joinRoom, leaveRoom, emitAction]);

  const value = useMemo(() => ({
    room: state.room,
    myPlayerId: state.myPlayerId,
    isHost: Boolean(state.room && state.myPlayerId === state.room.hostPlayerId),
    joinError: state.joinError,
    rejoinAttempted: state.rejoinAttempted,
    connected,
    ...actions,
  }), [state, connected, actions]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
