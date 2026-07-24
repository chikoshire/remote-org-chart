import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const shell = readFileSync(
  join(process.cwd(), "src/components/shell/ProductShellInner.tsx"),
  "utf8",
);

describe("ProductShell", () => {
  it("ships Org Intelligence primary IA with Settings gear", () => {
    expect(shell).toContain("AcmeLogo");
    expect(shell).toContain("<main");
    expect(shell).toContain("Skip to main content");
    expect(shell).toContain('role="banner"');
    expect(shell).toContain('role="contentinfo"');
    expect(shell).toContain('href: "/app/dashboard"');
    expect(shell).toContain('href: "/app"');
    expect(shell).toContain('href: "/app/people"');
    expect(shell).toContain('href: "/app/departments"');
    expect(shell).toContain('href: "/app/data-health"');
    expect(shell).toContain('href="/settings"');
    expect(shell).toContain("Log out");
    expect(shell).toContain('aria-label="Settings"');
    expect(shell).toContain("Dashboard");
    expect(shell).toContain("Org Chart");
    expect(shell).toContain("People");
    expect(shell).toContain("Departments");
    expect(shell).toContain("Data Health");
    expect(shell).toContain("bg-norma-surface");
    expect(shell).not.toContain('href="/welcome"');
    expect(shell).not.toContain("view=directory");
    expect(shell).toContain("h-dvh");
  });
});
