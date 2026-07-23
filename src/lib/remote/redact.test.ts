import { describe, expect, it } from "vitest";
import { redactSecrets, mapRemoteHttpStatus } from "@/lib/remote/redact";
import { getRemoteEnv } from "@/lib/remote/env";

describe("redactSecrets", () => {
  it("redacts ra_test tokens and Bearer headers", () => {
    const input =
      'Authorization: Bearer ra_test_abc123XYZ and token ra_live_should_go';
    const out = redactSecrets(input);
    expect(out).not.toContain("ra_test_");
    expect(out).not.toContain("ra_live_");
    expect(out).toContain("[REDACTED]");
  });
});

describe("mapRemoteHttpStatus", () => {
  it("maps known statuses", () => {
    expect(mapRemoteHttpStatus(401)).toBe("unauthorized");
    expect(mapRemoteHttpStatus(403)).toBe("forbidden");
    expect(mapRemoteHttpStatus(429)).toBe("rate_limited");
    expect(mapRemoteHttpStatus(503)).toBe("upstream");
  });
});

describe("getRemoteEnv", () => {
  it("parses valid env", () => {
    const env = getRemoteEnv({
      REMOTE_API_TOKEN: "ra_test_example",
      REMOTE_API_BASE_URL: "https://gateway.remote-sandbox.com",
    });
    expect(env.REMOTE_API_TOKEN).toBe("ra_test_example");
  });

  it("rejects missing token", () => {
    expect(() =>
      getRemoteEnv({
        REMOTE_API_TOKEN: "",
        REMOTE_API_BASE_URL: "https://gateway.remote-sandbox.com",
      }),
    ).toThrow();
  });
});
