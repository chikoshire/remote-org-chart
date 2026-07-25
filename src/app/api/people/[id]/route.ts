import { NextResponse } from "next/server";
import { z } from "zod";
import { invalidateOrgChartSnapshot } from "@/lib/org/snapshot-cache";
import { RemoteApiError } from "@/lib/remote/client";
import { fetchEmploymentDetail } from "@/lib/remote/employments";
import { writeEmploymentProfile } from "@/lib/remote/employment-updates";
import { toPersonProfilePayload } from "@/lib/remote/person-profile";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patchBodySchema = z
  .object({
    jobTitle: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    managerEmploymentId: z.string().nullable().optional(),
  })
  .refine(
    (body) =>
      "jobTitle" in body ||
      "department" in body ||
      "country" in body ||
      "managerEmploymentId" in body,
    { message: "Provide at least one profile field to update" },
  );

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

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json(
      { ok: false, code: "bad_request", message: "Missing person id" },
      { status: 400 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "bad_request", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = patchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "bad_request",
        message: parsed.error.issues[0]?.message ?? "Invalid body",
      },
      { status: 400 },
    );
  }

  try {
    const result = await writeEmploymentProfile(id.trim(), parsed.data);
    if (result.persisted.length > 0) {
      await invalidateOrgChartSnapshot();
    }
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof RemoteApiError) {
      return NextResponse.json(err.body, {
        status:
          err.body.code === "config"
            ? 503
            : err.body.status && err.body.status >= 400
              ? err.body.status
              : 502,
      });
    }
    return NextResponse.json(
      { ok: false, code: "unknown", message: "Profile update failed" },
      { status: 500 },
    );
  }
}
