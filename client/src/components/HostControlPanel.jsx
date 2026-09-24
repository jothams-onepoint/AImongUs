import React from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';
import QuestionBankEditor from './QuestionBankEditor.jsx';

const MIN_PLAYERS_TO_START = 3;

export default function HostControlPanel() {
  const { room, assignAI, randomizeAI, startRound, updateSettings } = useGame();

  const connectedPlayers = room.players.filter((p) => p.connected);
  const aiHiddenFromHost = room.pendingAiAssigned && !room.pendingAiPlayerId;
  const canStart = room.pendingAiAssigned && connectedPlayers.length >= MIN_PLAYERS_TO_START;

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
        <div className="ai-picker">
          <select
            value={room.pendingAiPlayerId || ''}
            onChange={(e) => assignAI(e.target.value)}
            disabled={aiHiddenFromHost}
          >
            <option value="" disabled>
              {aiHiddenFromHost ? 'Secretly assigned \u{1F3B2}' : 'Choose a player…'}
            </option>
            {connectedPlayers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="button" className="secondary" onClick={() => randomizeAI()}>
            Random (hidden from you)
          </button>
        </div>
        {aiHiddenFromHost && (
          <p className="hint">
            Someone's been randomly picked as the AI — it's a surprise to you too. Pick a name
            above to override with a known choice, or randomize again.
          </p>
        )}
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
