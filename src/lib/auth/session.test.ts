import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  credentialsMatch,
  getDemoCredentials,
  verifySessionToken,
} from "@/lib/auth/session";

describe("app session auth", () => {
  it("accepts demo credentials and rejects bad ones", () => {
    const demo = getDemoCredentials();
    expect(credentialsMatch(demo.email, demo.password)).toBe(true);
    expect(credentialsMatch(demo.email, "wrong")).toBe(false);
  });

  it("round-trips a signed session token", async () => {
    const token = await createSessionToken("demo@acme.example");
    const verified = await verifySessionToken(token);
    expect(verified).toEqual({ ok: true, email: "demo@acme.example" });
    expect(await verifySessionToken("tampered")).toEqual({ ok: false });
  });
});
