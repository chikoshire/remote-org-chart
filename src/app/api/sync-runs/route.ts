import { NextResponse } from "next/server";
import { listSyncRuns } from "@/lib/org/sync-runs";
import { listWebhookEvents } from "@/lib/org/webhook-inbox";

export const runtime = "nodejs";

/**
 * Ops history (GH#26 / #29): sync runs + webhook deliveries.
 * Summaries only (no emails / tokens). `Cache-Control: private`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const capped = Number.isFinite(limit) ? limit : 20;
  const [runs, events] = await Promise.all([
    listSyncRuns(capped),
    listWebhookEvents(capped),
  ]);
  return NextResponse.json(
    {
      ok: true,
      count: runs.length,
      runs,
      webhookEvents: events,
      webhookCount: events.length,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
