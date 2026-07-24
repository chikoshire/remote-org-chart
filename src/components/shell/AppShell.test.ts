import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const shell = readFileSync(
  join(process.cwd(), "src/components/shell/ProductShell.tsx"),
  "utf8",
);

describe("ProductShell", () => {
  it("uses solid nav chrome with Org and Settings icon", () => {
    expect(shell).toContain("AcmeLogo");
    expect(shell).toContain("<main");
    expect(shell).toContain("Skip to organization chart");
    expect(shell).toContain('role="banner"');
    expect(shell).toContain('role="contentinfo"');
    expect(shell).toContain('href="/app"');
    expect(shell).toContain('href="/settings"');
    expect(shell).toContain('aria-label="Settings"');
    expect(shell).not.toContain('href="/welcome"');
    expect(shell).toContain("h-dvh");
    expect(shell).toContain("#1a1a1a");
    expect(shell).not.toContain("radial-gradient(ellipse 60% 120%");
  });
});
