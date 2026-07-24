import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("theme preference", () => {
  it("forces light only - no dark mode controls", () => {
    const prefs = readFileSync(
      join(process.cwd(), "src/lib/ui/prefs.ts"),
      "utf8",
    );
    const settings = readFileSync(
      join(process.cwd(), "src/app/settings/page.tsx"),
      "utf8",
    );
    const bootstrap = readFileSync(
      join(process.cwd(), "src/components/shell/ThemeBootstrap.tsx"),
      "utf8",
    );

    expect(prefs).toContain("forceLightTheme");
    expect(prefs).not.toContain("AppTheme");
    expect(bootstrap).toContain("forceLightTheme");
    expect(settings).not.toContain('aria-label="Color theme"');
    expect(settings).not.toContain(">Dark<");
    expect(settings).not.toContain("writeThemePref");
  });
});
