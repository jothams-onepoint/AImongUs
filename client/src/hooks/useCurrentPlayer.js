import { useContext, useMemo } from 'react';
import { GameContext } from '../context/GameContext.jsx';

export function useGame() {
  return useContext(GameContext);
}

export function useCurrentPlayer() {
  const { room, myPlayerId } = useGame();
  return useMemo(
    () => room?.players.find((p) => p.id === myPlayerId) || null,
    [room, myPlayerId],
  );
}
