import { NextResponse } from "next/server";
import { RemoteApiError, remoteFetch } from "@/lib/remote/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await remoteFetch<{
      data?: { employments?: unknown[] };
      meta?: unknown;
    }>({
      path: "/v1/employments",
      searchParams: { page_size: 1, page: 1 },
    });

    const count = data?.data?.employments?.length ?? 0;

    return NextResponse.json({
      ok: true,
      remote: "reachable",
      sampleEmploymentCount: count,
    });
  } catch (err) {
    if (err instanceof RemoteApiError) {
      const status =
        err.body.code === "config"
          ? 500
          : err.body.status && err.body.status >= 400
            ? err.body.status
            : 502;
      return NextResponse.json(err.body, { status });
    }

    return NextResponse.json(
      {
        ok: false,
        code: "unknown",
        message: "Unexpected health check failure",
      },
      { status: 500 },
    );
  }
}
