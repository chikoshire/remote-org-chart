import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const shell = readFileSync(
  join(process.cwd(), "src/components/shell/AppShell.tsx"),
  "utf8",
);

describe("AppShell", () => {
  it("exposes header, main canvas, and status strip", () => {
    expect(shell).toContain("Remote Org Chart");
    expect(shell).toContain("Acme Sandbox Corp");
    expect(shell).toContain("<main");
    expect(shell).toContain("AppStatus");
    expect(shell).toContain("Skip to organization chart");
    expect(shell).toContain('role="banner"');
    expect(shell).toContain('role="contentinfo"');
  });
});
