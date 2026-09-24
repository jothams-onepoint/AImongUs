import { useEffect, useState } from 'react';

// Renders a countdown from the server-authoritative phaseEndsAt timestamp.
// The client never decides when a phase actually ends -- the server does that
// regardless of any clock skew here.
export function usePhaseTimer(phaseEndsAt) {
  const [remainingMs, setRemainingMs] = useState(
    phaseEndsAt ? Math.max(0, phaseEndsAt - Date.now()) : null,
  );

  useEffect(() => {
    if (!phaseEndsAt) {
      setRemainingMs(null);
      return undefined;
    }
    setRemainingMs(Math.max(0, phaseEndsAt - Date.now()));
    const interval = setInterval(() => {
      setRemainingMs(Math.max(0, phaseEndsAt - Date.now()));
    }, 250);
    return () => clearInterval(interval);
  }, [phaseEndsAt]);

  return remainingMs;
}
