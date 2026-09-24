import React from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function PlayerList() {
  const { room, myPlayerId } = useGame();
  if (!room) return null;

  return (
    <ul className="player-list">
      {room.players.map((p) => (
        <li key={p.id} className={p.connected ? '' : 'disconnected'}>
          <span className="dot" data-connected={p.connected} />
          {p.name}
          {p.isHost && <span className="badge">host</span>}
          {p.id === myPlayerId && <span className="badge">you</span>}
          <span className="score">{room.scoreboard[p.id] ?? 0} pts</span>
        </li>
      ))}
    </ul>
  );
}
