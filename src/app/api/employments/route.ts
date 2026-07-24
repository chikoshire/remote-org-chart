import { NextResponse } from "next/server";
import { RemoteApiError } from "@/lib/remote/client";
import { getRemoteEnv } from "@/lib/remote/env";
import {
  ENRICH_DETAIL_CONCURRENCY,
  fetchEmploymentsForOrgChart,
} from "@/lib/remote/employments";

export const runtime = "nodejs";

/**
 * Dev/inspection route — returns counts only (no PII dump by default).
 * Pass ?sample=1 to include a redacted sample of field presence.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sample = url.searchParams.get("sample") === "1";

  try {
    const env = getRemoteEnv();
    const records = await fetchEmploymentsForOrgChart({
      statusPolicy: "active_only",
      pageSize: 100,
      detailConcurrency: ENRICH_DETAIL_CONCURRENCY,
      fanOut: {
        origin: new URL(request.url).origin,
        secret: env.REMOTE_API_TOKEN,
      },
    });

    const withManager = records.filter((r) => r.managerEmploymentId).length;
    const missingName = records.filter((r) => !r.fullName).length;

    return NextResponse.json({
      ok: true,
      count: records.length,
      withManager,
      missingName,
      statusPolicy: "active_only",
      note: "List endpoint omits manager_*; details are fetched per employment.",
      ...(sample
        ? {
            sample: records.slice(0, 3).map((r) => ({
              id: r.id,
              hasName: Boolean(r.fullName),
              hasTitle: Boolean(r.jobTitle),
              hasManager: Boolean(r.managerEmploymentId),
            })),
          }
        : {}),
    });
  } catch (err) {
    if (err instanceof RemoteApiError) {
      return NextResponse.json(err.body, {
        status: err.body.status && err.body.status >= 400 ? err.body.status : 502,
      });
    }
    return NextResponse.json(
      { ok: false, code: "unknown", message: "Employment fetch failed" },
      { status: 500 },
    );
  }
}
