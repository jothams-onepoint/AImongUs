import React, { useState } from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';

export default function JoinScreen() {
  const { createRoom, joinRoom, joinError } = useGame();
  const [mode, setMode] = useState('join');
  const [hostName, setHostName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    await createRoom(hostName.trim());
    setBusy(false);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setBusy(true);
    await joinRoom(roomCode.trim().toUpperCase(), name.trim());
    setBusy(false);
  };

  return (
    <div className="screen join-screen">
      <h1>AImong Us</h1>
      <div className="tabs">
        <button className={mode === 'join' ? 'tab active' : 'tab'} onClick={() => setMode('join')}>
          Join a game
        </button>
        <button className={mode === 'create' ? 'tab active' : 'tab'} onClick={() => setMode('create')}>
          Host a new game
        </button>
      </div>

      {mode === 'join' ? (
        <form className="card" onSubmit={handleJoin}>
          <label>
            Room code
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              maxLength={4}
              placeholder="ABCD"
              autoCapitalize="characters"
              required
            />
          </label>
          <label>
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} required />
          </label>
          <button type="submit" disabled={busy}>Join</button>
        </form>
      ) : (
        <form className="card" onSubmit={handleCreate}>
          <label>
            Your name
            <input value={hostName} onChange={(e) => setHostName(e.target.value)} maxLength={24} required />
          </label>
          <button type="submit" disabled={busy}>Create room</button>
        </form>
      )}

      {joinError && <p className="error">{joinError}</p>}
    </div>
  );
}
