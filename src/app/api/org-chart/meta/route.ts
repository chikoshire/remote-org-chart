import { NextResponse } from "next/server";
import { readOrgChartSnapshot } from "@/lib/org/snapshot-cache";
import { listWebhookEvents } from "@/lib/org/webhook-inbox";

export const runtime = "nodejs";

/**
 * Lightweight org-chart freshness signal for live polling (GH#28).
 * Clients compare `lastSyncedAt` / `latestWebhookAt` without pulling the full forest.
 */
export async function GET() {
  const snapshot = await readOrgChartSnapshot();
  const events = await listWebhookEvents(1);
  const latestWebhookAt = events[0]?.receivedAt ?? null;

  return NextResponse.json({
    ok: true,
    lastSyncedAt: snapshot?.lastSyncedAt ?? null,
    latestWebhookAt,
    nodeCount: snapshot?.nodeCount ?? null,
  });
}
