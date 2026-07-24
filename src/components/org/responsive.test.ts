import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const canvas = readFileSync(
  join(process.cwd(), "src/components/org/OrgChartCanvas.tsx"),
  "utf8",
);
const page = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");

describe("responsive org chart chrome", () => {
  it("enables pinch zoom and touch-friendly pan modes", () => {
    expect(canvas).toContain("zoomOnPinch");
    expect(canvas).toContain("panOnScroll");
    expect(canvas).toContain("panOnDrag");
    expect(canvas).toContain("useMediaQuery");
  });

  it("uses a denser mobile page layout for the canvas", () => {
    expect(page).toContain("min-h-[100dvh]");
    expect(page).toMatch(/p-2|md:p-6/);
  });
});
