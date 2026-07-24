import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const shell = readFileSync(
  join(process.cwd(), "src/components/shell/ProductShellInner.tsx"),
  "utf8",
);

describe("ProductShell", () => {
  it("uses light nav chrome with Org chart, People, and Settings icon", () => {
    expect(shell).toContain("AcmeLogo");
    expect(shell).toContain("<main");
    expect(shell).toContain("Skip to organization chart");
    expect(shell).toContain('role="banner"');
    expect(shell).toContain('role="contentinfo"');
    expect(shell).toContain('href="/app"');
    expect(shell).toContain('href="/app?view=directory"');
    expect(shell).toContain('href="/settings"');
    expect(shell).toContain('aria-label="Settings"');
    expect(shell).toContain("Org chart");
    expect(shell).toContain("People");
    expect(shell).toContain("bg-white");
    expect(shell).not.toContain('href="/welcome"');
    expect(shell).toContain("h-dvh");
  });
});
