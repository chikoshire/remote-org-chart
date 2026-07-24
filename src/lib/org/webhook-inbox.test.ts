import { describe, expect, it } from "vitest";
import { insertWebhookEvent, listWebhookEvents } from "@/lib/org/webhook-inbox";

describe("webhook-inbox", () => {
  it("inserts once and treats duplicates as idempotent", async () => {
    const rows: Array<Record<string, unknown>> = [];
    const db = {
      prepare(query: string) {
        return {
          bind(...values: unknown[]) {
            return {
              async run() {
                if (query.includes("INSERT")) {
                  const key = values[0];
                  if (rows.some((r) => r.delivery_key === key)) {
                    throw new Error("UNIQUE constraint failed: delivery_key");
                  }
                  rows.unshift({
                    id: rows.length + 1,
                    delivery_key: values[0],
                    event_type: values[1],
                    company_id: values[2],
                    employment_id: values[3],
                    received_at: values[4],
                    processed: values[5],
                    duplicate: values[6],
                    payload_summary: values[7],
                  });
                }
              },
              async all() {
                return { results: rows.slice(0, Number(values[0] ?? 20)) };
              },
            };
          },
        };
      },
    };

    const first = await insertWebhookEvent(
      {
        deliveryKey: "1:abc",
        eventType: "employment.updated",
        employmentId: "e1",
        receivedAt: "2026-07-24T12:00:00.000Z",
        payloadSummary: "employment.updated · e1",
      },
      db,
    );
    const second = await insertWebhookEvent(
      {
        deliveryKey: "1:abc",
        eventType: "employment.updated",
        employmentId: "e1",
        receivedAt: "2026-07-24T12:00:01.000Z",
      },
      db,
    );

    expect(first).toEqual({ inserted: true });
    expect(second).toEqual({ inserted: false });
    expect(await listWebhookEvents(10, db)).toHaveLength(1);
  });
});
