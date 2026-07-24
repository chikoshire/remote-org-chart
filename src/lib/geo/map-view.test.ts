import { describe, expect, it } from "vitest";
import {
  MAP_WIDTH,
  MAX_ZOOM,
  WORLD_VIEW,
  clampView,
  wheelZoomFactor,
  zoomAtPoint,
} from "@/lib/geo/map-view";

describe("zoomAtPoint", () => {
  it("zooms in around the anchor without drifting when within limits", () => {
    const view = { x: 100, y: 50, w: 480, h: 240 };
    const next = zoomAtPoint(view, 1.18, 340, 170);
    expect(next.w).toBeCloseTo(480 / 1.18, 5);
    expect(next.h).toBeCloseTo(240 / 1.18, 5);
    // Anchor stays under the same relative point.
    const rx = (340 - view.x) / view.w;
    expect(340 - next.w * rx).toBeCloseTo(next.x, 5);
  });

  it("does not pan when already at max zoom", () => {
    const max = clampView({
      x: 400,
      y: 200,
      w: MAP_WIDTH / MAX_ZOOM,
      h: (MAP_WIDTH / MAX_ZOOM) * (WORLD_VIEW.h / WORLD_VIEW.w),
    });
    const again = zoomAtPoint(max, 1.18, max.x + max.w * 0.9, max.y + max.h / 2);
    expect(again).toEqual(max);
  });

  it("does not pan when already at world zoom", () => {
    const again = zoomAtPoint(WORLD_VIEW, 1 / 1.18, 800, 100);
    expect(again).toEqual(WORLD_VIEW);
  });
});

describe("wheelZoomFactor", () => {
  it("zooms in on negative deltaY and out on positive", () => {
    expect(wheelZoomFactor(0, -40)).toBe(1.18);
    expect(wheelZoomFactor(0, 40)).toBeCloseTo(1 / 1.18);
  });

  it("ignores horizontal-dominant or empty wheel deltas", () => {
    expect(wheelZoomFactor(30, 0)).toBeNull();
    expect(wheelZoomFactor(40, 10)).toBeNull();
  });
});
