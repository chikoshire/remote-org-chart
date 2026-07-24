import { describe, expect, it } from "vitest";
import {
  buildRemoteAuthorizeUrl,
  isRemoteOAuthEnabled,
  parseRemoteOAuthCallback,
} from "@/lib/remote/oauth";

describe("Remote OAuth scaffold", () => {
  it("stays disabled by default", () => {
    expect(isRemoteOAuthEnabled()).toBe(false);
    expect(
      buildRemoteAuthorizeUrl({
        redirectUri: "https://example.com/api/auth/remote/callback",
        state: "abc",
      }),
    ).toBeNull();
    expect(
      parseRemoteOAuthCallback(new URLSearchParams("code=x&state=abc"), "abc"),
    ).toEqual({ ok: false, reason: "disabled" });
  });
});
