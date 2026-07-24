import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const card = readFileSync(
  join(process.cwd(), "src/components/org/PersonNodeCard.tsx"),
  "utf8",
);
const edge = readFileSync(
  join(process.cwd(), "src/components/org/ReportingEdge.tsx"),
  "utf8",
);
const canvas = readFileSync(
  join(process.cwd(), "src/components/org/OrgChartCanvas.tsx"),
  "utf8",
);

describe("motion polish (#16)", () => {
  it("gates decorative motion behind reduced-motion media query", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
  });

  it("animates person selection and edge path highlight", () => {
    expect(card).toContain("transition-[");
    expect(edge).toContain("transition:");
  });

  it("short-circuits fitView duration when reduced motion is preferred", () => {
    expect(canvas).toContain("usePrefersReducedMotion");
    expect(canvas).toContain("reducedMotion");
  });
});
