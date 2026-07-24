import { describe, expect, it } from "vitest";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { FeatureCollection, Geometry, MultiPolygon } from "geojson";
import countriesTopology from "world-atlas/countries-110m.json";
import {
  toDisplayLandmass,
  type CountryFeature,
} from "@/lib/geo/world-features";

type WorldTopology = Topology<{
  countries: GeometryCollection;
  land: GeometryCollection;
}>;

describe("toDisplayLandmass", () => {
  it("drops French Guiana when simplifying France", () => {
    const topology = countriesTopology as unknown as WorldTopology;
    const collection = feature(
      topology,
      topology.objects.countries,
    ) as unknown as FeatureCollection<Geometry>;
    const france = collection.features.find((f) => String(f.id) === "250");
    expect(france).toBeTruthy();
    expect(france!.geometry.type).toBe("MultiPolygon");

    const before = (france!.geometry as MultiPolygon).coordinates.length;
    expect(before).toBeGreaterThan(1);

    const simplified = toDisplayLandmass({
      type: "Feature",
      id: france!.id,
      properties: { id: "250" },
      geometry: france!.geometry as CountryFeature["geometry"],
    });

    const coords =
      simplified.geometry.type === "Polygon"
        ? [simplified.geometry.coordinates]
        : simplified.geometry.coordinates;
    expect(coords.length).toBeLessThan(before);

    // Guiana sits near lon -53; metropolitan France does not.
    const hasGuianaLon = coords.some((poly) =>
      poly.some((ring) => ring.some((pos) => (pos[0] ?? 0) < -40)),
    );
    expect(hasGuianaLon).toBe(false);
  });
});
