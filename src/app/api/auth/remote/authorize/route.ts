import { NextResponse } from "next/server";
import { isRemoteOAuthEnabled } from "@/lib/remote/oauth";

/**
 * OAuth authorize entry. Inert unless REMOTE_OAUTH_ENABLED=true and a client is configured.
 * Option B Connect wizard remains the live assessment path.
 */
export async function GET() {
  if (!isRemoteOAuthEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        code: "oauth_disabled",
        message:
          "Remote OAuth is scaffolded but disabled. Use Settings → Connect (company link via server credentials).",
      },
      { status: 501 },
    );
  }
  return NextResponse.json(
    {
      ok: false,
      code: "oauth_not_configured",
      message:
        "REMOTE_OAUTH_ENABLED is on, but authorize redirect is not fully configured yet.",
    },
    { status: 501 },
  );
}
