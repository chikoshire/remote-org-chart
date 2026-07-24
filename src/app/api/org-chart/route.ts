import { NextResponse } from "next/server";
import { RemoteApiError } from "@/lib/remote/client";
import { getRemoteEnv } from "@/lib/remote/env";
import { fetchEmploymentsForOrgChart } from "@/lib/remote/employments";
import { buildOrgForest, flattenOrgForest } from "@/lib/org";
import {
  readOrgChartSnapshot,
  writeOrgChartSnapshot,
} from "@/lib/org/snapshot-cache";
import { writeSyncRun } from "@/lib/org/sync-runs";

export const runtime = "nodejs";

/**
 * Hierarchy JSON for the chart (GH#4/5).
 * Strips work emails from the payload by default (PII minimization).
 *
 * On Cloudflare, detail enrichment fans out across sibling Worker invocations
 * so we stay under the free-plan subrequest limit (GH#8).
 *
 * Snapshot cache (GH#24): KV hit returns lastSyncedAt quickly; `?refresh=1`
 * bypasses cache and rewrites the snapshot (GH#25).
 * Sync runs (GH#26): every Remote sync (and cache hit) writes a D1 row.
 */
export async function GET(request: Request) {
  const startedAt = new Date().toISOString();
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  try {
    if (!forceRefresh) {
      const cached = await readOrgChartSnapshot();
      if (cached) {
        await writeSyncRun({
          startedAt,
          finishedAt: new Date().toISOString(),
          ok: true,
          employmentCount: cached.nodeCount,
          trigger: "cache_hit",
        });
        return NextResponse.json({
          ...cached,
          cached: true,
          source: "cache",
        });
      }
    }

    const env = getRemoteEnv();
    const records = await fetchEmploymentsForOrgChart({
      statusPolicy: "active_only",
      fanOut: {
        origin: new URL(request.url).origin,
        secret: env.REMOTE_API_TOKEN,
      },
    });
    const forest = buildOrgForest(records);
    const flat = flattenOrgForest(forest).map((n) => ({
      ...n,
      workEmail: null,
      children: undefined,
    }));

    const snapshot = await writeOrgChartSnapshot({
      ok: true,
      nodeCount: forest.nodeCount,
      rootCount: forest.roots.length,
      cycleCount: forest.cycleIds.length,
      orphanManagerCount: forest.orphanManagerIds.length,
      roots: stripEmails(forest.roots),
      nodes: flat,
    });

    await writeSyncRun({
      startedAt,
      finishedAt: new Date().toISOString(),
      ok: true,
      employmentCount: forest.nodeCount,
      trigger: forceRefresh ? "refresh" : "cold",
    });

    return NextResponse.json({
      ...snapshot,
      cached: false,
      source: "remote",
    });
  } catch (err) {
    const message =
      err instanceof RemoteApiError
        ? err.body.message
        : err instanceof Error
          ? err.message
          : "Org chart build failed";

    await writeSyncRun({
      startedAt,
      finishedAt: new Date().toISOString(),
      ok: false,
      errorSummary: message,
      trigger: forceRefresh ? "refresh" : "cold",
    });

    if (err instanceof RemoteApiError) {
      return NextResponse.json(err.body, {
        status: err.body.status && err.body.status >= 400 ? err.body.status : 502,
      });
    }
    return NextResponse.json(
      { ok: false, code: "unknown", message: "Org chart build failed" },
      { status: 500 },
    );
  }
}

function stripEmails(
  nodes: ReturnType<typeof buildOrgForest>["roots"],
): unknown[] {
  return nodes.map((n) => ({
    id: n.id,
    fullName: n.fullName,
    jobTitle: n.jobTitle,
    department: n.department,
    departmentId: n.departmentId,
    status: n.status,
    country: n.country,
    managerEmploymentId: n.managerEmploymentId,
    inCycle: n.inCycle,
    directReports: n.directReports,
    children: stripEmails(n.children),
  }));
}
