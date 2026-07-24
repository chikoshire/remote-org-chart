import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { redactSecrets, toClientSafeMessage } from "@/lib/remote/redact";

describe("security & PII audit (GH#32)", () => {
  it("redacts Remote Bearer tokens from strings", () => {
    const raw =
      "Authorization: Bearer ra_test_abc123_def456 and ra_live_zzz";
    expect(redactSecrets(raw)).not.toMatch(/ra_test_|ra_live_/);
    expect(redactSecrets(raw)).toContain("[REDACTED]");
  });

  it("truncates long upstream messages without leaking tokens", () => {
    const token = `ra_test_${"x".repeat(40)}`;
    const msg = toClientSafeMessage(`${token} ${"y".repeat(400)}`, "fallback");
    expect(msg).not.toContain("ra_test_");
    expect(msg.length).toBeLessThanOrEqual(281);
  });

  it("org-chart route strips work emails from the payload", () => {
    const route = readFileSync(
      join(process.cwd(), "src/app/api/org-chart/route.ts"),
      "utf8",
    );
    expect(route).toContain("workEmail: null");
    expect(route).toContain("stripEmails");
  });

  it("keeps token env access on the server client module only", () => {
    const client = readFileSync(
      join(process.cwd(), "src/lib/remote/client.ts"),
      "utf8",
    );
    expect(client).toContain("getRemoteEnv");
    expect(client).toContain("Authorization");
    expect(client).toContain("redactSecrets");
  });

  it("gitignores local env files", () => {
    const gitignore = readFileSync(join(process.cwd(), ".gitignore"), "utf8");
    expect(gitignore).toMatch(/\.env\*/);
  });
});
