import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson";
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

export const worldCountries: CountryFeature[] = countriesCollection.features.map(
  (f) =>
    ({
      type: "Feature",
      id: f.id,
      properties: { id: String(f.id ?? "") },
      geometry: f.geometry as Polygon | MultiPolygon,
    }) satisfies CountryFeature,
);
