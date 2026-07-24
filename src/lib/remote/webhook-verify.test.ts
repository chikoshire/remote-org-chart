import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  verifyRemoteWebhookSignature,
  webhookDeliveryKey,
  WEBHOOK_MAX_AGE_MS,
} from "@/lib/remote/webhook-verify";

function sign(rawBody: string, timestamp: string, key: string) {
  return createHmac("sha256", key)
    .update(`${rawBody}:${timestamp}`, "utf8")
    .digest("hex");
}

describe("verifyRemoteWebhookSignature", () => {
  const key = "test-signing-key";
  const body = '{"event_type":"employment.updated","employment_id":"e1"}';
  const now = 1_700_000_000_000;
  const ts = String(now);

  it("accepts a valid fresh signature", () => {
    const signature = sign(body, ts, key);
    expect(
      verifyRemoteWebhookSignature({
        rawBody: body,
        signatureHeader: signature,
        timestampHeader: ts,
        signingKey: key,
        nowMs: now,
      }),
    ).toEqual({ ok: true, timestampMs: now });
  });

  it("rejects bad signature, missing headers, and stale timestamps", () => {
    expect(
      verifyRemoteWebhookSignature({
        rawBody: body,
        signatureHeader: "deadbeef",
        timestampHeader: ts,
        signingKey: key,
        nowMs: now,
      }).ok,
    ).toBe(false);

    expect(
      verifyRemoteWebhookSignature({
        rawBody: body,
        signatureHeader: null,
        timestampHeader: ts,
        signingKey: key,
        nowMs: now,
      }),
    ).toEqual({ ok: false, reason: "missing_headers" });

    expect(
      verifyRemoteWebhookSignature({
        rawBody: body,
        signatureHeader: sign(body, ts, key),
        timestampHeader: ts,
        signingKey: key,
        nowMs: now + WEBHOOK_MAX_AGE_MS + 1,
      }),
    ).toEqual({ ok: false, reason: "stale" });
  });

  it("builds a delivery key", () => {
    expect(webhookDeliveryKey("AbC", 99)).toBe("99:abc");
  });
});
