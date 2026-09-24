import React, { useEffect, useState } from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';
import QuestionBankEditor from './QuestionBankEditor.jsx';

const MIN_PLAYERS_TO_START = 3;
const RANDOM_OPTION_VALUE = '__random__';

export default function HostControlPanel() {
  const { room, assignAI, randomizeAI, startRound, updateSettings } = useGame();
  // Reflects the host's choice immediately, rather than waiting on the
  // server round-trip - otherwise a re-render in between can snap the
  // controlled <select> back to the placeholder before the real update lands.
  const [localAiChoice, setLocalAiChoice] = useState(null);

  const connectedPlayers = room.players.filter((p) => p.connected);
  const canStart = room.pendingAiAssigned && connectedPlayers.length >= MIN_PLAYERS_TO_START;

  // A fresh round-setup cycle (nothing assigned yet) clears any local override
  // so it doesn't leak into the next round.
  useEffect(() => {
    if (!room.pendingAiAssigned) setLocalAiChoice(null);
  }, [room.pendingAiAssigned]);

  // Never let the select's displayed value reveal identity for a random pick -
  // even if the host themselves was the one chosen, the dropdown must still
  // just show "Random" so nobody glancing at the host's screen can tell.
  const serverAiSelectValue = room.pendingAiIsRandom
    ? RANDOM_OPTION_VALUE
    : (room.pendingAiPlayerId || '');
  const aiSelectValue = localAiChoice ?? serverAiSelectValue;

  const handleAnswerersChange = (e) => {
    const value = e.target.value;
    updateSettings({ answerersPerRound: value === 'all' ? 'all' : Number(value) });
  };

  const handleAiChange = (e) => {
    const value = e.target.value;
    setLocalAiChoice(value);
    if (value === RANDOM_OPTION_VALUE) {
      randomizeAI();
    } else if (value) {
      assignAI(value);
    }
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
        <select value={aiSelectValue} onChange={handleAiChange}>
          <option value="" disabled>Choose a player…</option>
          <option value={RANDOM_OPTION_VALUE}>{'\u{1F3B2}'} Random (hidden from you)</option>
          {connectedPlayers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {aiSelectValue === RANDOM_OPTION_VALUE && (
          <p className="hint">
            Randomly assigned — it's a surprise to you too, even if it turns out to be you.
            Pick a name above to override with a known choice.
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
