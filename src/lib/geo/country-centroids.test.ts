import { describe, expect, it } from "vitest";
import {
  countryCentroid,
  projectToMapPercent,
} from "@/lib/geo/country-centroids";

describe("country map geo", () => {
  it("resolves common ISO codes", () => {
    expect(countryCentroid("USA")?.lat).toBeCloseTo(39.8, 0);
    expect(countryCentroid("gbr")?.lng).toBeCloseTo(-2.9, 0);
    expect(countryCentroid(null)).toBeNull();
    expect(countryCentroid("ZZZ")).toBeNull();
  });

  it("projects lat/lng into map percents", () => {
    const mid = projectToMapPercent(0, 0);
    expect(mid.x).toBeCloseTo(50, 0);
    expect(mid.y).toBeCloseTo(50, 0);
  });
});
