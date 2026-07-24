"use client";

import { geoNaturalEarth1, geoGraticule10, geoPath } from "d3-geo";
import { useMemo, useState } from "react";
import { PersonAvatar } from "@/components/org/PersonAvatar";
import { countryCentroid } from "@/lib/geo/country-centroids";
import { alphaToNumericId, normalizeNumericId } from "@/lib/geo/iso-numeric";
import { worldCountries, worldLand } from "@/lib/geo/world-features";
import { formatCountryLabel } from "@/lib/ui/format-country";

export type MapPerson = {
  id: string;
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  country: string | null;
  avatarUrl?: string | null;
};

type OrgWorldMapProps = {
  people: MapPerson[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

type CountryCluster = {
  code: string;
  numericId: string | null;
  label: string;
  count: number;
  lat: number;
  lng: number;
  people: MapPerson[];
};

const MAP_WIDTH = 960;
const MAP_HEIGHT = 480;

export function OrgWorldMap({ people, selectedId, onSelect }: OrgWorldMapProps) {
  const [activeCode, setActiveCode] = useState<string | null>(null);

  const { clusters, unknownCount, byNumericId } = useMemo(() => {
    const byCode = new Map<string, MapPerson[]>();
    let unknown = 0;
    for (const person of people) {
      const centroid = countryCentroid(person.country);
      if (!centroid) {
        unknown += 1;
        continue;
      }
      const list = byCode.get(centroid.code) ?? [];
      list.push(person);
      byCode.set(centroid.code, list);
    }

    const next: CountryCluster[] = [];
    const numericIndex = new Map<string, string>();
    for (const [code, members] of byCode) {
      const centroid = countryCentroid(code)!;
      const numericId = alphaToNumericId(code);
      next.push({
        code,
        numericId,
        label: formatCountryLabel(code) || code,
        count: members.length,
        lat: centroid.lat,
        lng: centroid.lng,
        people: [...members].sort((a, b) =>
          (a.fullName ?? "").localeCompare(b.fullName ?? ""),
        ),
      });
      if (numericId) numericIndex.set(numericId, code);
    }
    next.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    return {
      clusters: next,
      unknownCount: unknown,
      byNumericId: numericIndex,
    };
  }, [people]);

  const { projection, path, graticulePath, spherePath } = useMemo(() => {
    const nextProjection = geoNaturalEarth1().fitExtent(
      [
        [4, 8],
        [MAP_WIDTH - 4, MAP_HEIGHT - 4],
      ],
      { type: "Sphere" },
    );
    const nextPath = geoPath(nextProjection);
    return {
      projection: nextProjection,
      path: nextPath,
      graticulePath: nextPath(geoGraticule10()) ?? "",
      spherePath: nextPath({ type: "Sphere" }) ?? "",
    };
  }, []);

  const landPath = useMemo(() => path(worldLand) ?? "", [path]);

  const clustersByCode = useMemo(() => {
    const map = new Map<string, CountryCluster>();
    for (const cluster of clusters) map.set(cluster.code, cluster);
    return map;
  }, [clusters]);

  const active = activeCode ? (clustersByCode.get(activeCode) ?? null) : null;
  const activeNumeric = active?.numericId ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(165deg,#e8f4f8_0%,#f4f7fb_50%,#eef6f2_100%)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-norma-border/70 bg-white/70 px-4 py-3 backdrop-blur-sm md:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
            Location view
          </p>
          <p className="text-sm text-norma-ink-muted">
            {clusters.length}{" "}
            {clusters.length === 1 ? "country" : "countries"} with people
            {unknownCount > 0
              ? ` · ${unknownCount} without a mapped country`
              : ""}
          </p>
        </div>
        <p className="text-xs text-norma-ink-subtle">
          Click a country or pin to list people
        </p>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden p-3 md:p-5">
        <div
          className="relative h-full min-h-[320px] w-full overflow-hidden rounded-norma-lg border border-norma-border/80 bg-[#c9e4ee] shadow-norma-sm"
          role="img"
          aria-label="World map of people by country"
        >
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="oceanFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b9dce8" />
                <stop offset="100%" stopColor="#cfe8f0" />
              </linearGradient>
              <filter id="landShadow" x="-2%" y="-2%" width="104%" height="104%">
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="1.2"
                  floodColor="#00234B"
                  floodOpacity="0.12"
                />
              </filter>
            </defs>

            <path d={spherePath} fill="url(#oceanFill)" />
            <path
              d={graticulePath}
              fill="none"
              stroke="#7eb6c8"
              strokeWidth={0.4}
              opacity={0.45}
            />
            <path
              d={landPath}
              fill="#c5d6c0"
              stroke="none"
              filter="url(#landShadow)"
            />

            {worldCountries.map((country) => {
              const numericId = normalizeNumericId(
                country.id ?? country.properties.id,
              );
              const code = numericId ? byNumericId.get(numericId) : undefined;
              const cluster = code ? clustersByCode.get(code) : undefined;
              const hasPeople = Boolean(cluster);
              const isActive = numericId != null && numericId === activeNumeric;
              const selectedHere = cluster?.people.some(
                (p) => p.id === selectedId,
              );
              const d = path(country) ?? "";
              if (!d) return null;

              return (
                <path
                  key={numericId ?? d.slice(0, 24)}
                  d={d}
                  fill={
                    isActive || selectedHere
                      ? "#624DE3"
                      : hasPeople
                        ? "#00234B"
                        : "#d7e4d2"
                  }
                  fillOpacity={
                    isActive || selectedHere ? 0.92 : hasPeople ? 0.85 : 1
                  }
                  stroke={hasPeople ? "#75E8F0" : "#7a9578"}
                  strokeWidth={hasPeople ? 1 : 0.5}
                  className={hasPeople ? "cursor-pointer outline-none" : undefined}
                  tabIndex={hasPeople ? 0 : undefined}
                  role={hasPeople ? "button" : undefined}
                  aria-label={
                    cluster
                      ? `${cluster.label}: ${cluster.count} people`
                      : undefined
                  }
                  onClick={() => {
                    if (!cluster) return;
                    setActiveCode((prev) =>
                      prev === cluster.code ? null : cluster.code,
                    );
                  }}
                  onKeyDown={(event) => {
                    if (!cluster) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveCode((prev) =>
                        prev === cluster.code ? null : cluster.code,
                      );
                    }
                  }}
                />
              );
            })}

            <path
              d={spherePath}
              fill="none"
              stroke="#00234B"
              strokeOpacity={0.2}
              strokeWidth={1.2}
            />

            {clusters.map((cluster) => {
              const point = projection([cluster.lng, cluster.lat]);
              if (!point) return null;
              const [x, y] = point;
              const size = Math.min(22, 9 + Math.sqrt(cluster.count) * 3.2);
              const open = activeCode === cluster.code;
              const selectedHere = cluster.people.some((p) => p.id === selectedId);
              return (
                <g key={`pin-${cluster.code}`} transform={`translate(${x},${y})`}>
                  <circle
                    r={size + 3}
                    fill="#ffffff"
                    opacity={0.9}
                  />
                  <circle
                    r={size}
                    fill={open || selectedHere ? "#624DE3" : "#e85d04"}
                    stroke="#ffffff"
                    strokeWidth={1.6}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`${cluster.label}: ${cluster.count} people`}
                    aria-pressed={open}
                    onClick={() =>
                      setActiveCode((prev) =>
                        prev === cluster.code ? null : cluster.code,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveCode((prev) =>
                          prev === cluster.code ? null : cluster.code,
                        );
                      }
                    }}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={size > 14 ? 11 : 9}
                    fontWeight={700}
                    className="pointer-events-none select-none"
                  >
                    {cluster.count}
                  </text>
                </g>
              );
            })}
          </svg>

          {clusters.length === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-norma-ink-muted">
              No mapped countries yet. Add country on employment records to see
              pins here.
            </p>
          ) : null}
        </div>
      </div>

      {active ? (
        <div className="max-h-[40%] shrink-0 border-t border-norma-border bg-norma-surface">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div>
              <h2 className="font-[family-name:var(--font-norma-display)] text-base font-semibold text-norma-prussian">
                {active.label}
              </h2>
              <p className="text-xs text-norma-ink-muted">
                {active.count} {active.count === 1 ? "person" : "people"}
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-norma-ink-muted hover:text-norma-prussian"
              onClick={() => setActiveCode(null)}
            >
              Close
            </button>
          </div>
          <ul
            className="max-h-56 overflow-auto divide-y divide-norma-border/70 px-2 pb-3 md:px-4"
            aria-label={`People in ${active.label}`}
          >
            {active.people.map((person) => {
              const name = person.fullName?.trim() || "Unknown person";
              const selected = person.id === selectedId;
              return (
                <li key={person.id}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-norma-md px-2 py-2.5 text-left ${
                      selected
                        ? "bg-norma-accent-soft"
                        : "hover:bg-norma-surface-muted"
                    }`}
                    onClick={() => onSelect(person.id)}
                  >
                    <PersonAvatar
                      personId={person.id}
                      fullName={person.fullName}
                      department={person.department}
                      avatarUrl={person.avatarUrl}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-norma-prussian">
                        {name}
                      </span>
                      <span className="block truncate text-xs text-norma-ink-muted">
                        {person.jobTitle?.trim() || "Not set"}
                        {person.department?.trim()
                          ? ` · ${person.department.trim()}`
                          : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
