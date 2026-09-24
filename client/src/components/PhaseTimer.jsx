import React from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';
import { usePhaseTimer } from '../hooks/usePhaseTimer.js';

export default function PhaseTimer() {
  const { room } = useGame();
  const remainingMs = usePhaseTimer(room?.phaseEndsAt);
  if (remainingMs == null) return null;

  const seconds = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, '0');

  return <div className="phase-timer" data-urgent={seconds <= 10}>{mm}:{ss}</div>;
}
