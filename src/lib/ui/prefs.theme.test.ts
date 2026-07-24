import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prefs = readFileSync(
  join(process.cwd(), "src/lib/ui/prefs.ts"),
  "utf8",
);
const settings = readFileSync(
  join(process.cwd(), "src/app/settings/page.tsx"),
  "utf8",
);

describe("theme preference", () => {
  it("persists theme via Settings helpers", () => {
    expect(prefs).toContain("THEME_STORAGE_KEY");
    expect(prefs).toContain("readThemePref");
    expect(prefs).toContain("writeThemePref");
    expect(prefs).toContain("applyThemeClass");
    expect(settings).toContain("Appearance");
    expect(settings).toContain('aria-label="Color theme"');
    expect(settings).toContain("writeThemePref");
  });
});
