const KEY = 'aimongus.session';

export function saveSession({ roomCode, playerId, rejoinToken }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ roomCode, playerId, rejoinToken }));
  } catch {
    // localStorage unavailable (private browsing, etc.) - rejoin just won't work
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
