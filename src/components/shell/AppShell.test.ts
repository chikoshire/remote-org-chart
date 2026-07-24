import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const shell = readFileSync(
  join(process.cwd(), "src/components/shell/ProductShell.tsx"),
  "utf8",
);

describe("ProductShell", () => {
  it("exposes Acme nav links for Org, Welcome, and Settings", () => {
    expect(shell).toContain("Acme");
    expect(shell).toContain("<main");
    expect(shell).toContain("Skip to organization chart");
    expect(shell).toContain('role="banner"');
    expect(shell).toContain('role="contentinfo"');
    expect(shell).toContain('href="/app"');
    expect(shell).toContain('href="/welcome"');
    expect(shell).toContain('href="/settings"');
    expect(shell).toContain("#0b2a32");
    expect(shell).toContain("#e85d04");
  });
});
