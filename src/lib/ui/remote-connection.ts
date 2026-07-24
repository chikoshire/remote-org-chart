/**
 * App-level Remote connection toggle.
 * The API token stays server-side; disconnect pauses org data in this browser
 * so reconnect is one click (no re-entering secrets).
 */
export const REMOTE_CONNECTED_KEY = "acme-org-chart:remote-connected";
export const ORG_SESSION_CACHE_KEY = "acme-org-chart:session-payload";

export function readRemoteConnected(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(REMOTE_CONNECTED_KEY);
    if (raw === null) return true;
    return raw !== "0";
  } catch {
    return true;
  }
}

export function writeRemoteConnected(connected: boolean): void {
  try {
    window.localStorage.setItem(REMOTE_CONNECTED_KEY, connected ? "1" : "0");
  } catch {
    // ignore
  }
}

export function readSessionOrgPayload(): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ORG_SESSION_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function writeSessionOrgPayload(payload: unknown): void {
  try {
    window.sessionStorage.setItem(
      ORG_SESSION_CACHE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // ignore quota
  }
}

export function clearSessionOrgPayload(): void {
  try {
    window.sessionStorage.removeItem(ORG_SESSION_CACHE_KEY);
  } catch {
    // ignore
  }
}
