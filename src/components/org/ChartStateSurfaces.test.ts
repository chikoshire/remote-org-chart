import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const src = readFileSync(
  join(process.cwd(), "src/components/org/ChartStateSurfaces.tsx"),
  "utf8",
);

describe("ChartStateSurfaces", () => {
  it("exports loading, empty, and error surfaces", () => {
    expect(src).toContain("ChartLoadingState");
    expect(src).toContain("ChartEmptyState");
    expect(src).toContain("ChartErrorState");
    expect(src).toContain('role="status"');
    expect(src).toContain('role="alert"');
    expect(src).toContain("animate-pulse");
    expect(src).toContain("<svg");
    expect(src).not.toContain("animate-spin");
  });
});

const canvas = readFileSync(
  join(process.cwd(), "src/components/org/OrgChartCanvas.tsx"),
  "utf8",
);

describe("chart empty flash (#126)", () => {
  it("keeps a building overlay until the first fitView completes", () => {
    expect(canvas).toContain("layoutReady");
    expect(canvas).toContain("canvasBuilding");
    expect(canvas).toContain("Building chart…");
    expect(canvas).toContain("setLayoutReady(true)");
    expect(canvas).toContain('aria-busy={canvasBuilding}');
  });
});

describe("minimap render (#127)", () => {
  it("defers MiniMap until layout is ready and remounts after fits", () => {
    expect(canvas).toContain("minimapEpoch");
    expect(canvas).toContain("!isMobile && layoutReady");
    expect(canvas).toContain('key={`minimap-${minimapEpoch}`}');
    expect(canvas).toContain("bgColor=");
    expect(canvas).toContain("ariaLabel=");
  });
});
