/**
 * Remote OAuth scaffold (inert unless REMOTE_OAUTH_ENABLED=true).
 * Assessment path uses server-side REMOTE_API_TOKEN + Option B Connect wizard.
 */

export function isRemoteOAuthEnabled(): boolean {
  return process.env.REMOTE_OAUTH_ENABLED === "true";
}

export type RemoteOAuthAuthorizeRequest = {
  /** App-relative callback path after Remote authorize. */
  redirectUri: string;
  state: string;
  /** Optional scopes when a real Remote OAuth client exists. */
  scopes?: string[];
};

export type RemoteOAuthCallbackResult =
  | { ok: true; code: string; state: string }
  | { ok: false; reason: "disabled" | "missing_code" | "invalid_state" };

export function buildRemoteAuthorizeUrl(
  request: RemoteOAuthAuthorizeRequest,
): string | null {
  if (!isRemoteOAuthEnabled()) return null;
  const clientId = process.env.REMOTE_OAUTH_CLIENT_ID?.trim();
  const authorizeBase =
    process.env.REMOTE_OAUTH_AUTHORIZE_URL?.trim() ||
    "https://employ.remote-sandbox.com/oauth/authorize";
  if (!clientId) return null;
  const url = new URL(authorizeBase);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", request.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", request.state);
  if (request.scopes?.length) {
    url.searchParams.set("scope", request.scopes.join(" "));
  }
  return url.toString();
}

export function parseRemoteOAuthCallback(
  searchParams: URLSearchParams,
  expectedState: string | null,
): RemoteOAuthCallbackResult {
  if (!isRemoteOAuthEnabled()) {
    return { ok: false, reason: "disabled" };
  }
  const code = searchParams.get("code")?.trim();
  const state = searchParams.get("state")?.trim();
  if (!code) return { ok: false, reason: "missing_code" };
  if (!state || !expectedState || state !== expectedState) {
    return { ok: false, reason: "invalid_state" };
  }
  return { ok: true, code, state };
}
