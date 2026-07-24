import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSyncRunsDb, type D1Like } from "@/lib/org/sync-runs";

export type WebhookEventRecord = {
  id: number;
  deliveryKey: string;
  eventType: string;
  companyId: string | null;
  employmentId: string | null;
  receivedAt: string;
  processed: boolean;
  duplicate: boolean;
  payloadSummary: string | null;
};

export type WebhookEventInput = {
  deliveryKey: string;
  eventType: string;
  companyId?: string | null;
  employmentId?: string | null;
  receivedAt: string;
  processed?: boolean;
  duplicate?: boolean;
  payloadSummary?: string | null;
};

export function getWebhookEventsDb(): D1Like | null {
  return getSyncRunsDb();
}

/**
 * Insert a delivery. Returns `{ inserted: false }` when delivery_key already exists
 * (idempotent duplicate).
 */
export async function insertWebhookEvent(
  input: WebhookEventInput,
  db: D1Like | null = getWebhookEventsDb(),
): Promise<{ inserted: boolean }> {
  if (!db) return { inserted: false };
  try {
    await db
      .prepare(
        `INSERT INTO webhook_events
          (delivery_key, event_type, company_id, employment_id, received_at, processed, duplicate, payload_summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        input.deliveryKey,
        input.eventType,
        input.companyId ?? null,
        input.employmentId ?? null,
        input.receivedAt,
        input.processed ? 1 : 0,
        input.duplicate ? 1 : 0,
        input.payloadSummary ?? null,
      )
      .run();
    return { inserted: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/UNIQUE|unique|constraint/i.test(message)) {
      return { inserted: false };
    }
    throw err;
  }
}

export async function listWebhookEvents(
  limit = 20,
  db: D1Like | null = getWebhookEventsDb(),
): Promise<WebhookEventRecord[]> {
  if (!db) return [];
  const capped = Math.min(Math.max(limit, 1), 50);
  const { results } = await db
    .prepare(
      `SELECT id, delivery_key, event_type, company_id, employment_id,
              received_at, processed, duplicate, payload_summary
       FROM webhook_events
       ORDER BY id DESC
       LIMIT ?`,
    )
    .bind(capped)
    .all();

  return results.map((row) => ({
    id: Number(row.id),
    deliveryKey: String(row.delivery_key),
    eventType: String(row.event_type),
    companyId: row.company_id == null ? null : String(row.company_id),
    employmentId:
      row.employment_id == null ? null : String(row.employment_id),
    receivedAt: String(row.received_at),
    processed: Number(row.processed) === 1,
    duplicate: Number(row.duplicate) === 1,
    payloadSummary:
      row.payload_summary == null ? null : String(row.payload_summary),
  }));
}

/** Read signing key from Cloudflare secrets / process.env — never log it. */
export function getWebhookSigningKey(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): string | null {
  try {
    if (source === process.env) {
      const { env } = getCloudflareContext();
      const fromCf = (env as { REMOTE_WEBHOOK_SIGNING_KEY?: string })
        .REMOTE_WEBHOOK_SIGNING_KEY;
      if (typeof fromCf === "string" && fromCf.trim()) return fromCf.trim();
    }
  } catch {
    // local next
  }
  const fromEnv = source.REMOTE_WEBHOOK_SIGNING_KEY;
  return typeof fromEnv === "string" && fromEnv.trim() ? fromEnv.trim() : null;
}
