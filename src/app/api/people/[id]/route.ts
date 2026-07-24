import { NextResponse } from "next/server";
import { RemoteApiError } from "@/lib/remote/client";
import { fetchEmploymentDetail } from "@/lib/remote/employments";
import { toPersonProfilePayload } from "@/lib/remote/person-profile";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json(
      { ok: false, code: "bad_request", message: "Missing person id" },
      { status: 400 },
    );
  }

  try {
    const detail = await fetchEmploymentDetail(id);
    const profile = toPersonProfilePayload(detail);
    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    if (err instanceof RemoteApiError) {
      return NextResponse.json(err.body, {
        status:
          err.body.status && err.body.status >= 400 ? err.body.status : 502,
      });
    }
    return NextResponse.json(
      { ok: false, code: "unknown", message: "Person profile fetch failed" },
      { status: 500 },
    );
  }
}
