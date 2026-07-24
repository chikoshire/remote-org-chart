import { createHmac, timingSafeEqual } from "node:crypto";

export const WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;

export type WebhookVerifyInput = {
  rawBody: string;
  signatureHeader: string | null;
  timestampHeader: string | null;
  signingKey: string;
  nowMs?: number;
};

export type WebhookVerifyResult =
  | { ok: true; timestampMs: number }
  | { ok: false; reason: "missing_headers" | "bad_timestamp" | "stale" | "bad_signature" };

function hexTimingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length === 0 || bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Verify Remote `X-Remote-Signature` over `rawBody + ':' + timestampMs`.
 * @see remote-api-webhooks skill
 */
export function verifyRemoteWebhookSignature(
  input: WebhookVerifyInput,
): WebhookVerifyResult {
  const signature = input.signatureHeader?.trim() ?? "";
  const timestampRaw = input.timestampHeader?.trim() ?? "";
  if (!signature || !timestampRaw) {
    return { ok: false, reason: "missing_headers" };
  }

  const timestampMs = Number(timestampRaw);
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) {
    return { ok: false, reason: "bad_timestamp" };
  }

  const nowMs = input.nowMs ?? Date.now();
  if (Math.abs(nowMs - timestampMs) > WEBHOOK_MAX_AGE_MS) {
    return { ok: false, reason: "stale" };
  }

  const signedMessage = `${input.rawBody}:${timestampRaw}`;
  const expected = createHmac("sha256", input.signingKey)
    .update(signedMessage, "utf8")
    .digest("hex");

  if (!hexTimingSafeEqual(expected, signature.toLowerCase())) {
    return { ok: false, reason: "bad_signature" };
  }

  return { ok: true, timestampMs };
}

/** Stable idempotency key for a verified delivery. */
export function webhookDeliveryKey(
  signature: string,
  timestampMs: number,
): string {
  return `${timestampMs}:${signature.toLowerCase()}`;
}
