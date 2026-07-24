import { NextResponse, type NextRequest } from "next/server";
import {
  APP_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth/session";

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/app" ||
    pathname.startsWith("/app/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(APP_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (session.ok) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/app", "/app/:path*", "/settings", "/settings/:path*"],
};
