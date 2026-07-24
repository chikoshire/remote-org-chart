import { NextResponse } from "next/server";
import { listSyncRuns } from "@/lib/org/sync-runs";

export const runtime = "nodejs";

/**
 * Last N sync attempts (GH#26). Summaries only — tokens already redacted at write.
 * Query: `?limit=20` (max 50). Empty when D1 is unbound (local next dev).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const runs = await listSyncRuns(Number.isFinite(limit) ? limit : 20);
  return NextResponse.json({
    ok: true,
    count: runs.length,
    runs,
  });
}
