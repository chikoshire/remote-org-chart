import { NextResponse } from "next/server";
import { isRemoteOAuthEnabled } from "@/lib/remote/oauth";

/**
 * OAuth callback stub. Does not exchange codes while the flag is off.
 */
export async function GET(request: Request) {
  if (!isRemoteOAuthEnabled()) {
    return NextResponse.redirect(new URL("/settings?oauth=disabled", request.url));
  }
  return NextResponse.json(
    {
      ok: false,
      code: "oauth_callback_stub",
      message:
        "Callback received, but token exchange is not implemented until a Remote OAuth client is registered.",
    },
    { status: 501 },
  );
}
