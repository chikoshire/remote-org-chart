import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);

describe("Acme design tokens", () => {
  it("defines Markel/Neuro brand cues", () => {
    expect(css).toMatch(/--norma-royal:\s*#e85d04/i);
    expect(css).toMatch(/--norma-prussian:\s*#0b2a32/i);
    expect(css).toMatch(/--norma-spray:\s*#2a9d8f/i);
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
