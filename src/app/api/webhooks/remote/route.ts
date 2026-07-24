import { NextResponse } from "next/server";
import { invalidateOrgChartSnapshot } from "@/lib/org/snapshot-cache";
import {
  getWebhookSigningKey,
  insertWebhookEvent,
} from "@/lib/org/webhook-inbox";
import {
  verifyRemoteWebhookSignature,
  webhookDeliveryKey,
} from "@/lib/remote/webhook-verify";

export const runtime = "nodejs";

type RemoteWebhookPayload = {
  event_type?: string;
  company_id?: string;
  employment_id?: string;
  [key: string]: unknown;
};

/**
 * Remote webhook receiver (GH#27).
 * Verify HMAC first; store idempotent D1 row; invalidate KV snapshot.
 */
export async function POST(request: Request) {
  const signingKey = getWebhookSigningKey();
  if (!signingKey) {
    return NextResponse.json(
      {
        ok: false,
        code: "webhook_not_configured",
        message:
          "REMOTE_WEBHOOK_SIGNING_KEY is not set. Subscribe via Remote API and store the signing_key as a Wrangler secret.",
      },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const verified = verifyRemoteWebhookSignature({
    rawBody,
    signatureHeader: request.headers.get("x-remote-signature"),
    timestampHeader: request.headers.get("x-remote-timestamp"),
    signingKey,
  });

  if (!verified.ok) {
    return NextResponse.json(
      { ok: false, code: "invalid_signature", reason: verified.reason },
      { status: 401 },
    );
  }

  let payload: RemoteWebhookPayload = {};
  try {
    payload = JSON.parse(rawBody) as RemoteWebhookPayload;
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_json" },
      { status: 400 },
    );
  }

  const eventType =
    typeof payload.event_type === "string" && payload.event_type.trim()
      ? payload.event_type.trim()
      : "unknown";
  const employmentId =
    typeof payload.employment_id === "string" ? payload.employment_id : null;
  const companyId =
    typeof payload.company_id === "string" ? payload.company_id : null;
  const deliveryKey = webhookDeliveryKey(
    request.headers.get("x-remote-signature") ?? "",
    verified.timestampMs,
  );
  const receivedAt = new Date().toISOString();

  const { inserted } = await insertWebhookEvent({
    deliveryKey,
    eventType,
    companyId,
    employmentId,
    receivedAt,
    processed: true,
    duplicate: false,
    payloadSummary: `${eventType}${employmentId ? ` · ${employmentId}` : ""}`,
  });

  if (!inserted) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      deliveryKey,
    });
  }

  const notifyAt = await invalidateOrgChartSnapshot();

  return NextResponse.json({
    ok: true,
    duplicate: false,
    deliveryKey,
    eventType,
    cacheInvalidated: Boolean(notifyAt),
    notifyAt,
  });
}
