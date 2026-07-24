import { NextResponse } from "next/server";
import { RemoteApiError } from "@/lib/remote/client";
import { getRemoteEnv } from "@/lib/remote/env";
import {
  ENRICH_BATCH_SIZE,
  ENRICH_DETAIL_CONCURRENCY,
  enrichEmploymentsWithManagers,
} from "@/lib/remote/employments";
import {
  employmentListItemSchema,
  type EmploymentListItem,
} from "@/lib/remote/employment-schema";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  items: z.array(employmentListItemSchema).max(ENRICH_BATCH_SIZE),
});

/**
 * Internal batch enrichment for Cloudflare fan-out (GH#8).
 * Each invocation stays under the Workers Free subrequest cap.
 * Auth: `x-org-enrich-secret` must match the server-side Remote token.
 */
export async function POST(request: Request) {
  let expected: string;
  try {
    expected = getRemoteEnv().REMOTE_API_TOKEN;
  } catch {
    return NextResponse.json(
      { ok: false, code: "config", message: "Remote API env is invalid" },
      { status: 500 },
    );
  }

  const secret = request.headers.get("x-org-enrich-secret");
  if (!secret || secret !== expected) {
    return NextResponse.json(
      { ok: false, code: "unauthorized", message: "Invalid enrich secret" },
      { status: 401 },
    );
  }

  let items: EmploymentListItem[];
  try {
    const json: unknown = await request.json();
    items = bodySchema.parse(json).items;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "bad_request",
        message: `Body must be { items: EmploymentListItem[1..${ENRICH_BATCH_SIZE}] }`,
      },
      { status: 400 },
    );
  }

  try {
    const records = await enrichEmploymentsWithManagers(
      items,
      ENRICH_DETAIL_CONCURRENCY,
    );
    return NextResponse.json({ ok: true, records });
  } catch (err) {
    if (err instanceof RemoteApiError) {
      return NextResponse.json(err.body, {
        status: err.body.status && err.body.status >= 400 ? err.body.status : 502,
      });
    }
    return NextResponse.json(
      { ok: false, code: "unknown", message: "Enrich batch failed" },
      { status: 500 },
    );
  }
}
