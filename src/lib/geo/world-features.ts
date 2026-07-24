import { geoArea, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopology from "world-atlas/countries-110m.json";

export type CountryFeature = Feature<Polygon | MultiPolygon, { id: string }> & {
  id?: string | number;
};

type WorldTopology = Topology<{
  countries: GeometryCollection;
  land: GeometryCollection;
}>;

const topology = countriesTopology as unknown as WorldTopology;

const countriesCollection = feature(
  topology,
  topology.objects.countries,
) as unknown as FeatureCollection<Geometry>;

export const worldLand = feature(
  topology,
  topology.objects.land,
) as unknown as Feature<Geometry>;

/** Approx great-circle distance in km between [lng, lat] points. */
function haversineKm(a: Position, b: Position): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * Drop distant overseas fragments (e.g. French Guiana when highlighting France)
 * while keeping nearby large landmasses (e.g. Alaska with the US).
 */
export function toDisplayLandmass(featureIn: CountryFeature): CountryFeature {
  const geometry = featureIn.geometry;
  if (geometry.type === "Polygon") return featureIn;
  if (geometry.type !== "MultiPolygon" || geometry.coordinates.length <= 1) {
    return featureIn;
  }

  const parts = geometry.coordinates.map((coordinates) => {
    const poly: Feature<Polygon> = {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates },
    };
    return {
      coordinates,
      area: geoArea(poly),
      centroid: geoCentroid(poly),
    };
  });

  parts.sort((a, b) => b.area - a.area);
  const primary = parts[0]!;
  // ~5200km keeps Alaska with CONUS; drops French Guiana from metropolitan France.
  const MAX_KM_FROM_PRIMARY = 5200;
  const kept = parts.filter(
    (part) => haversineKm(primary.centroid, part.centroid) <= MAX_KM_FROM_PRIMARY,
  );

  if (kept.length === 1) {
    return {
      ...featureIn,
      geometry: { type: "Polygon", coordinates: kept[0]!.coordinates },
    };
  }

  return {
    ...featureIn,
    geometry: {
      type: "MultiPolygon",
      coordinates: kept.map((part) => part.coordinates),
    },
  };
}

export const worldCountries: CountryFeature[] = countriesCollection.features.map(
  (f) =>
    toDisplayLandmass({
      type: "Feature",
      id: f.id,
      properties: { id: String(f.id ?? "") },
      geometry: f.geometry as Polygon | MultiPolygon,
    }),
);
