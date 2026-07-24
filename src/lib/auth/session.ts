/** App session cookie (demo login). Separate from REMOTE_API_TOKEN. */
export const APP_SESSION_COOKIE = "acme_app_session";

const DEFAULT_DEMO_EMAIL = "demo@acme.example";
const DEFAULT_DEMO_PASSWORD = "<scrubbed-old-demo-password>";

export function getDemoCredentials(): { email: string; password: string } {
  return {
    email: (process.env.DEMO_APP_EMAIL ?? DEFAULT_DEMO_EMAIL).trim().toLowerCase(),
    password: process.env.DEMO_APP_PASSWORD ?? DEFAULT_DEMO_PASSWORD,
  };
}

function sessionSecret(): string {
  return (
    process.env.APP_SESSION_SECRET?.trim() ||
    process.env.DEMO_APP_PASSWORD ||
    DEFAULT_DEMO_PASSWORD
  );
}

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return toBase64Url(binary);
}

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return bufferToBase64Url(sig);
}

export async function createSessionToken(email: string): Promise<string> {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = toBase64Url(
    JSON.stringify({ email: email.trim().toLowerCase(), exp }),
  );
  const sig = await hmacSign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<{ ok: true; email: string } | { ok: false }> {
  if (!token?.trim()) return { ok: false };
  const dot = token.trim().lastIndexOf(".");
  if (dot <= 0) return { ok: false };
  const payload = token.trim().slice(0, dot);
  const sig = token.trim().slice(dot + 1);
  if (!payload || !sig) return { ok: false };
  const expected = await hmacSign(payload);
  if (expected !== sig) return { ok: false };
  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as {
      email?: string;
      exp?: number;
    };
    if (!parsed.email || !Number.isFinite(parsed.exp)) return { ok: false };
    if ((parsed.exp as number) < Date.now()) return { ok: false };
    return { ok: true, email: parsed.email };
  } catch {
    return { ok: false };
  }
}

export function credentialsMatch(email: string, password: string): boolean {
  const demo = getDemoCredentials();
  return (
    email.trim().toLowerCase() === demo.email && password === demo.password
  );
}
