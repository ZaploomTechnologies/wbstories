const CLIENT_ID_STORAGE_KEY = "wbstories:clientId";

/** Lazily creates and persists a random per-browser id in localStorage. Client-side only. */
export function getOrCreateClientId(): string {
  const existing = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
  return id;
}
