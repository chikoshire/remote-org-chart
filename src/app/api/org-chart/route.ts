import { NextResponse } from "next/server";
import { RemoteApiError } from "@/lib/remote/client";
import { fetchEmploymentsForOrgChart } from "@/lib/remote/employments";
import { buildOrgForest, flattenOrgForest } from "@/lib/org";

export const runtime = "nodejs";

/**
 * Hierarchy JSON for the chart (GH#4/5).
 * Strips work emails from the payload by default (PII minimization).
 */
export async function GET() {
  try {
    const records = await fetchEmploymentsForOrgChart({
      statusPolicy: "active_only",
    });
    const forest = buildOrgForest(records);
    const flat = flattenOrgForest(forest).map((n) => ({
      ...n,
      workEmail: null,
      children: undefined,
    }));

    return NextResponse.json({
      ok: true,
      nodeCount: forest.nodeCount,
      rootCount: forest.roots.length,
      cycleCount: forest.cycleIds.length,
      orphanManagerCount: forest.orphanManagerIds.length,
      roots: stripEmails(forest.roots),
      // flat index aids search (#7) without walking twice client-side
      nodes: flat,
    });
  } catch (err) {
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
