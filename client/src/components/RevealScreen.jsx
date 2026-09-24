import React from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function RevealScreen() {
  const { room, isHost, nextRound, endGame } = useGame();
  const round = room?.round;
  if (!round || !round.result) return null;

  const playersById = Object.fromEntries(room.players.map((p) => [p.id, p]));
  const aiPlayer = playersById[round.aiPlayerId];
  const { accusedSet, aiCaught, pointsAwarded } = round.result;

  return (
    <div className="reveal-screen">
      <h2>{aiCaught ? 'Busted! The AI was caught.' : 'The AI got away with it!'}</h2>
      <p className="ai-reveal">
        <strong>{aiPlayer?.name}</strong> was the AI this round.
      </p>
      <p className="accused">
        Most votes went to: {accusedSet.map((id) => playersById[id]?.name).join(', ') || 'nobody'}
      </p>

      <ul className="points-list">
        {room.players.map((p) => {
          const delta = pointsAwarded[p.id] || 0;
          if (!delta) return null;
          return <li key={p.id}>{p.name} <span>+{delta}</span></li>;
        })}
      </ul>

      {isHost && (
        <div className="host-actions">
          <button onClick={() => nextRound()}>Next round</button>
          <button className="secondary" onClick={() => endGame()}>End game</button>
        </div>
      )}
    </div>
  );
}
