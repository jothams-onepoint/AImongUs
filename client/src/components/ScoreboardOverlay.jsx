import React from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function ScoreboardOverlay() {
  const { room } = useGame();
  if (!room) return null;

  const ranked = [...room.players]
    .map((p) => ({ ...p, points: room.scoreboard[p.id] ?? 0 }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="scoreboard">
      <h3>Scoreboard</h3>
      <ol>
        {ranked.map((p) => (
          <li key={p.id}>
            <span>{p.name}</span>
            <span>{p.points}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
