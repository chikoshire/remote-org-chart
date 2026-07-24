"use client";

import { useMemo, useState } from "react";
import { PersonAvatar } from "@/components/org/PersonAvatar";
import {
  countryCentroid,
  projectToMapPercent,
} from "@/lib/geo/country-centroids";
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
  label: string;
  count: number;
  x: number;
  y: number;
  people: MapPerson[];
};

export function OrgWorldMap({ people, selectedId, onSelect }: OrgWorldMapProps) {
  const [activeCode, setActiveCode] = useState<string | null>(null);

  const { clusters, unknownCount } = useMemo(() => {
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
    for (const [code, members] of byCode) {
      const centroid = countryCentroid(code)!;
      const { x, y } = projectToMapPercent(centroid.lat, centroid.lng);
      next.push({
        code,
        label: formatCountryLabel(code) || code,
        count: members.length,
        x,
        y,
        people: [...members].sort((a, b) =>
          (a.fullName ?? "").localeCompare(b.fullName ?? ""),
        ),
      });
    }
    next.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    return { clusters: next, unknownCount: unknown };
  }, [people]);

  const active = clusters.find((c) => c.code === activeCode) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(165deg,#e8f4f8_0%,#f4f1fb_45%,#eef6f2_100%)]">
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
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden p-3 md:p-5">
        <div
          className="relative h-full min-h-[320px] w-full overflow-hidden rounded-norma-lg border border-norma-border/80 bg-[#d7ebf2] shadow-norma-sm"
          role="img"
          aria-label="World map of people by country"
        >
          <svg
            viewBox="0 0 1000 500"
            className="absolute inset-0 h-full w-full opacity-40"
            aria-hidden
          >
            <defs>
              <linearGradient id="ocean" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b9dce8" />
                <stop offset="100%" stopColor="#cfe3f0" />
              </linearGradient>
            </defs>
            <rect width="1000" height="500" fill="url(#ocean)" />
            {/* Simplified landmass silhouettes */}
            <path
              fill="#9fbf9a"
              d="M120 140c40-30 90-40 140-20 55 22 70 70 40 110-28 38-90 55-140 35-48-20-70-80-40-125z"
            />
            <path
              fill="#9fbf9a"
              d="M280 200c70-10 110 40 95 95-12 45-70 70-120 55-55-18-75-80-40-120 18-22 40-32 65-30z"
            />
            <path
              fill="#9fbf9a"
              d="M470 110c90-20 160 10 190 70 28 55-10 110-80 130-75 22-160-5-185-70-22-55 20-110 75-130z"
            />
            <path
              fill="#9fbf9a"
              d="M700 150c80-15 150 25 160 90 8 55-55 95-120 90-70-5-120-55-110-110 8-45 35-65 70-70z"
            />
            <path
              fill="#9fbf9a"
              d="M780 300c55 5 90 45 70 85-18 35-70 45-110 25-38-18-45-65-15-90 18-16 35-22 55-20z"
            />
            <path
              fill="#9fbf9a"
              d="M160 340c40 0 70 30 55 65-12 28-55 35-85 15-28-18-30-50-5-70 12-10 22-12 35-10z"
            />
          </svg>

          {clusters.map((cluster) => {
            const size = Math.min(48, 22 + cluster.count * 2);
            const selectedHere = cluster.people.some((p) => p.id === selectedId);
            const open = activeCode === cluster.code;
            return (
              <button
                key={cluster.code}
                type="button"
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 font-semibold text-white shadow-norma-md transition ${
                  open || selectedHere
                    ? "border-white bg-norma-royal ring-2 ring-norma-royal/40"
                    : "border-white/90 bg-[#e85d04] hover:scale-105"
                }`}
                style={{
                  left: `${cluster.x}%`,
                  top: `${cluster.y}%`,
                  width: size,
                  height: size,
                  fontSize: size > 34 ? 12 : 10,
                }}
                aria-label={`${cluster.label}: ${cluster.count} people`}
                aria-pressed={open}
                onClick={() =>
                  setActiveCode((prev) =>
                    prev === cluster.code ? null : cluster.code,
                  )
                }
              >
                {cluster.count}
              </button>
            );
          })}

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
