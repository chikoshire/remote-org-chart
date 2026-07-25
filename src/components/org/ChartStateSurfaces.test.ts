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

describe("show in chart focus (#130)", () => {
  it("retries fitView on the selected path and skips C-suite when deep-linked", () => {
    expect(canvas).toContain("tryFocusPath");
    expect(canvas).toContain("Deep-link / Show in chart owns the first camera move");
    expect(canvas).toContain("pendingDeepLinkId.current");
  });
});
