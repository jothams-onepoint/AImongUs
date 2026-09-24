import React from 'react';
import { useGame } from './hooks/useCurrentPlayer.js';
import JoinScreen from './components/JoinScreen.jsx';
import LobbyWaitingRoom from './components/LobbyWaitingRoom.jsx';
import QuestionBanner from './components/QuestionBanner.jsx';
import PhaseTimer from './components/PhaseTimer.jsx';
import AnswerFeed from './components/AnswerFeed.jsx';
import DiscussionFeed from './components/DiscussionFeed.jsx';
import VotingPanel from './components/VotingPanel.jsx';
import ScoreboardOverlay from './components/ScoreboardOverlay.jsx';
import RevealScreen from './components/RevealScreen.jsx';
import PlayerList from './components/PlayerList.jsx';

export default function App() {
  const { room, rejoinAttempted, aiNotice, dismissAiNotice, isHost, forceAdvancePhase } = useGame();

  if (!rejoinAttempted) {
    return <div className="screen"><p>Loading…</p></div>;
  }

  if (!room) {
    return <JoinScreen />;
  }

  return (
    <div className="app-shell">
      {aiNotice && (
        <div className="ai-notice" onClick={dismissAiNotice}>
          {aiNotice} <span className="dismiss">(tap to dismiss)</span>
        </div>
      )}

      {(room.phase === 'lobby' || room.phase === 'round_setup') && <LobbyWaitingRoom />}

      {(room.phase === 'writing' || room.phase === 'discussion_voting') && (
        <div className="round-screen">
          <div className="round-main">
            <QuestionBanner />
            <PhaseTimer />
            <AnswerFeed />
            {room.phase === 'discussion_voting' && (
              <>
                <DiscussionFeed />
                <VotingPanel />
              </>
            )}
            {isHost && (
              <button className="secondary" onClick={() => forceAdvancePhase()}>
                Skip to next phase
              </button>
            )}
          </div>
          <aside className="round-sidebar">
            <PlayerList />
            <ScoreboardOverlay />
          </aside>
        </div>
      )}

      {room.phase === 'reveal' && <RevealScreen />}

      {room.phase === 'ended' && (
        <div className="screen">
          <h2>Game over!</h2>
          <ScoreboardOverlay />
        </div>
      )}
    </div>
  );
}
