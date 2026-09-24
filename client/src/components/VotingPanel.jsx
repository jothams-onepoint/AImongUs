import React from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function VotingPanel() {
  const { room, myPlayerId, castVote } = useGame();
  const round = room?.round;
  if (!round) return null;

  const playersById = Object.fromEntries(room.players.map((p) => [p.id, p]));

  return (
    <div className="voting-panel">
      <h3>Who's the AI?</h3>
      {!round.canVote && <p className="hint">You joined mid-round, so you're sitting this vote out.</p>}
      <ul className="vote-grid">
        {room.players.map((p) => {
          const isSelf = p.id === myPlayerId;
          const voters = round.voteTally[p.id] || [];
          const isMyVote = round.myVoteTargetId === p.id;
          return (
            <li key={p.id}>
              <button
                className={isMyVote ? 'vote-target selected' : 'vote-target'}
                disabled={isSelf || !round.canVote}
                onClick={() => castVote(p.id)}
              >
                {p.name}
                <span className="vote-count">{voters.length}</span>
              </button>
              {voters.length > 0 && (
                <div className="voter-names">
                  {voters.map((vId) => playersById[vId]?.name || '?').join(', ')}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
