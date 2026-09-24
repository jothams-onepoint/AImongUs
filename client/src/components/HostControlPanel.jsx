import React from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';
import QuestionBankEditor from './QuestionBankEditor.jsx';

const MIN_PLAYERS_TO_START = 3;

export default function HostControlPanel() {
  const { room, assignAI, startRound, updateSettings } = useGame();

  const connectedPlayers = room.players.filter((p) => p.connected);
  const canStart = Boolean(room.pendingAiPlayerId) && connectedPlayers.length >= MIN_PLAYERS_TO_START;

  const handleAnswerersChange = (e) => {
    const value = e.target.value;
    updateSettings({ answerersPerRound: value === 'all' ? 'all' : Number(value) });
  };

  return (
    <div className="host-control-panel">
      <h3>Host controls</h3>

      <label>
        Who answers each round?
        <select value={room.settings.answerersPerRound} onChange={handleAnswerersChange}>
          <option value="all">Everyone ({connectedPlayers.length})</option>
          {Array.from({ length: connectedPlayers.length - 1 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} random player{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </label>

      <label>
        Who's the AI this round?
        <select
          value={room.pendingAiPlayerId || ''}
          onChange={(e) => assignAI(e.target.value)}
        >
          <option value="" disabled>Choose a player…</option>
          {connectedPlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <button disabled={!canStart} onClick={() => startRound()}>
        Start round
      </button>
      {connectedPlayers.length < MIN_PLAYERS_TO_START && (
        <p className="hint">Need at least {MIN_PLAYERS_TO_START} connected players to start.</p>
      )}

      <QuestionBankEditor />
    </div>
  );
}
