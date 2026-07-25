import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const canvas = readFileSync(
  join(process.cwd(), "src/components/org/OrgChartCanvas.tsx"),
  "utf8",
);
const page = readFileSync(join(process.cwd(), "src/app/app/page.tsx"), "utf8");

describe("responsive org chart chrome", () => {
  it("enables pinch zoom and touch-friendly pan modes", () => {
    expect(canvas).toContain("zoomOnPinch");
    expect(canvas).toContain("zoomOnScroll");
    expect(canvas).toContain("panOnScroll={false}");
    expect(canvas).toContain("panOnDrag");
    expect(canvas).toContain("useMediaQuery");
  });

  it("uses a flex workspace layout for the org page", () => {
    expect(page).toContain("min-h-0 flex-1");
    expect(canvas).toContain("flex-col md:flex-row");
  });

  it("caps the side panel on phone and keeps zoom clear of Help", () => {
    expect(canvas).toContain("max-h-[40dvh]");
    expect(canvas).toContain('position="bottom-left"');
    expect(canvas).toContain('isMobile ? "compact" : density');
  });
});
