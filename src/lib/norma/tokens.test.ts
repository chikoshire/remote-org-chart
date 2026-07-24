import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);

describe("Acme design tokens", () => {
  it("defines pastel / liquid-glass brand cues", () => {
    expect(css).toMatch(/--norma-royal:\s*#121212/i);
    expect(css).toMatch(/--norma-prussian:\s*#121212/i);
    expect(css).toMatch(/--norma-canvas:\s*#f4f1eb/i);
    expect(css).toMatch(/--norma-lavender:\s*#e8e0f5/i);
    expect(css).toMatch(/--norma-mint:\s*#d8f0e6/i);
  });

  it("exposes a Tailwind theme bridge for brand colors", () => {
    expect(css).toContain("--color-norma-royal:");
    expect(css).toContain("--color-norma-prussian:");
    expect(css).toContain("--color-norma-lavender:");
    expect(css).toContain("--color-norma-canvas:");
    expect(css).toContain("--font-display:");
  });

  it("supports explicit dark class theme (Settings-driven, not OS invert)", () => {
    expect(css).toContain("color-scheme: light");
    expect(css).toContain("html.dark");
    expect(css).not.toContain("prefers-color-scheme: dark");
  });
});
