import { NextResponse } from "next/server";
import { listWebhookEvents } from "@/lib/org/webhook-inbox";

export const runtime = "nodejs";

/** Recent webhook deliveries (GH#27 / #29). Summaries only. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const events = await listWebhookEvents(Number.isFinite(limit) ? limit : 20);
  return NextResponse.json({ ok: true, count: events.length, events });
}
