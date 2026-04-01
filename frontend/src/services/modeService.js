const MODE_KEY = 'placeflow-mode';

export function getMode() {
  const mode = localStorage.getItem(MODE_KEY);
  return mode === 'online' ? 'online' : 'offline';
}

export function setMode(mode) {
  const next = mode === 'online' ? 'online' : 'offline';
  localStorage.setItem(MODE_KEY, next);
  return next;
}

export function isOnlineMode() {
  return getMode() === 'online';
}
