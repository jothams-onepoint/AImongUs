import React from 'react';
import { useGame } from '../hooks/useCurrentPlayer.js';
import PlayerList from './PlayerList.jsx';
import ScoreboardOverlay from './ScoreboardOverlay.jsx';
import HostControlPanel from './HostControlPanel.jsx';

export default function LobbyWaitingRoom() {
  const { room, isHost } = useGame();
  const inviteLink = `${window.location.origin}?room=${room.code}`;
  const hasPlayedARound = room.round != null;

  return (
    <div className="screen lobby-screen">
      <h2>Room {room.code}</h2>
      <p className="invite-link">Share this link or code: <code>{inviteLink}</code></p>

      <PlayerList />
      {hasPlayedARound && <ScoreboardOverlay />}

      {isHost ? (
        <HostControlPanel />
      ) : (
        <p className="waiting">Waiting for the host to start the round…</p>
      )}
    </div>
  );
}
