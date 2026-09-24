import React from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function QuestionBanner() {
  const { room } = useGame();
  if (!room?.round) return null;

  return (
    <div className="question-banner">
      <span className="round-index">Round {room.round.index}</span>
      <p>{room.round.questionText}</p>
    </div>
  );
}
