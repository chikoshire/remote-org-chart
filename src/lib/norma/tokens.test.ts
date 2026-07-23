import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);

describe("Norma design tokens", () => {
  it("defines Remote brand cues", () => {
    expect(css).toMatch(/--norma-royal:\s*#624de3/i);
    expect(css).toMatch(/--norma-prussian:\s*#00234b/i);
    expect(css).toMatch(/--norma-spray:\s*#75e8f0/i);
  });

  it("exposes a Tailwind theme bridge for brand colors", () => {
    expect(css).toContain("--color-norma-royal:");
    expect(css).toContain("--color-norma-prussian:");
    expect(css).toContain("--color-norma-spray:");
    expect(css).toContain("--color-norma-canvas:");
    expect(css).toContain("--font-display:");
  });

  it("forces light product chrome (no OS dark invert)", () => {
    expect(css).toContain("color-scheme: light");
    expect(css).not.toContain("prefers-color-scheme: dark");
  });
});
