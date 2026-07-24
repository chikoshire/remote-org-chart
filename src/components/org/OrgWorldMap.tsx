"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { geoNaturalEarth1, geoGraticule10, geoPath } from "d3-geo";
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

type MapView = {
  x: number;
  y: number;
  w: number;
  h: number;
};

const MAP_WIDTH = 960;
const MAP_HEIGHT = 480;
const MAX_ZOOM = 8;
const WORLD_VIEW: MapView = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };

function clampView(view: MapView): MapView {
  const w = Math.min(MAP_WIDTH, Math.max(MAP_WIDTH / MAX_ZOOM, view.w));
  const h = Math.min(MAP_HEIGHT, Math.max(MAP_HEIGHT / MAX_ZOOM, view.h));
  const x = Math.min(MAP_WIDTH - w, Math.max(0, view.x));
  const y = Math.min(MAP_HEIGHT - h, Math.max(0, view.y));
  return { x, y, w, h };
}

function zoomAtPoint(
  view: MapView,
  factor: number,
  anchorX: number,
  anchorY: number,
): MapView {
  const nextW = view.w / factor;
  const nextH = view.h / factor;
  const rx = (anchorX - view.x) / view.w;
  const ry = (anchorY - view.y) / view.h;
  return clampView({
    x: anchorX - nextW * rx,
    y: anchorY - nextH * ry,
    w: nextW,
    h: nextH,
  });
}

export function OrgWorldMap({ people, selectedId, onSelect }: OrgWorldMapProps) {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [view, setView] = useState<MapView>(WORLD_VIEW);
  const [hoverCode, setHoverCode] = useState<string | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origin: MapView;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

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
  const zoomLevel = MAP_WIDTH / view.w;
  const screenScale = 1 / zoomLevel;

  const clientToMap = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const scale = Math.min(rect.width / MAP_WIDTH, rect.height / MAP_HEIGHT);
    const offsetX = (rect.width - MAP_WIDTH * scale) / 2;
    const offsetY = (rect.height - MAP_HEIGHT * scale) / 2;
    const svgX = (clientX - rect.left - offsetX) / scale;
    const svgY = (clientY - rect.top - offsetY) / scale;
    return {
      x: view.x + (svgX / MAP_WIDTH) * view.w,
      y: view.y + (svgY / MAP_HEIGHT) * view.h,
    };
  }, [view]);

  const focusCluster = useCallback(
    (cluster: CountryCluster, zoomFactor = 3.2) => {
      const point = projection([cluster.lng, cluster.lat]);
      if (!point) {
        setActiveCode(cluster.code);
        return;
      }
      const [cx, cy] = point;
      const nextW = MAP_WIDTH / zoomFactor;
      const nextH = MAP_HEIGHT / zoomFactor;
      setView(
        clampView({
          x: cx - nextW / 2,
          y: cy - nextH / 2,
          w: nextW,
          h: nextH,
        }),
      );
      setActiveCode(cluster.code);
    },
    [projection],
  );

  const onWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const anchor = clientToMap(event.clientX, event.clientY);
    if (!anchor) return;
    const factor = event.deltaY < 0 ? 1.18 : 1 / 1.18;
    setView((prev) => zoomAtPoint(prev, factor, anchor.x, anchor.y));
  };

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest("[data-map-pin], [data-map-country]")) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: view,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scale = Math.min(rect.width / MAP_WIDTH, rect.height / MAP_HEIGHT);
    const dx = ((event.clientX - drag.startX) / scale) * (drag.origin.w / MAP_WIDTH);
    const dy = ((event.clientY - drag.startY) / scale) * (drag.origin.h / MAP_HEIGHT);
    setView(
      clampView({
        ...drag.origin,
        x: drag.origin.x - dx,
        y: drag.origin.y - dy,
      }),
    );
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const zoomBy = (factor: number) => {
    setView((prev) =>
      zoomAtPoint(prev, factor, prev.x + prev.w / 2, prev.y + prev.h / 2),
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(165deg,#e8f4f1_0%,#f4f7f5_48%,#eef3f8_100%)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-norma-border/70 bg-white/75 px-4 py-3 backdrop-blur-sm md:px-6">
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
        <div className="flex flex-wrap items-center gap-2">
          <p className="hidden text-xs text-norma-ink-subtle sm:block">
            Scroll to zoom · drag to pan · click a pin to zoom in
          </p>
          <div
            className="flex items-center gap-1 rounded-norma-md border border-norma-border bg-white p-1 shadow-norma-sm"
            role="group"
            aria-label="Map zoom"
          >
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-norma-sm text-sm font-semibold text-norma-prussian hover:bg-norma-surface-muted"
              aria-label="Zoom out"
              onClick={() => zoomBy(1 / 1.35)}
            >
              −
            </button>
            <span className="min-w-[3rem] text-center text-[11px] font-semibold text-norma-ink-muted">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-norma-sm text-sm font-semibold text-norma-prussian hover:bg-norma-surface-muted"
              aria-label="Zoom in"
              onClick={() => zoomBy(1.35)}
            >
              +
            </button>
            <button
              type="button"
              className="rounded-norma-sm px-2 py-1.5 text-[11px] font-semibold text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-prussian"
              onClick={() => setView(WORLD_VIEW)}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden p-3 md:p-5">
        <div
          className="relative h-full min-h-[320px] w-full overflow-hidden rounded-norma-lg border border-norma-border/80 bg-[#c9e4ee] shadow-norma-sm"
          role="img"
          aria-label="World map of people by country"
        >
          <svg
            ref={svgRef}
            viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
            className="absolute inset-0 h-full w-full touch-none [&_*:focus]:outline-none [&_*:focus-visible]:outline-none"
            style={{ outline: "none" }}
            preserveAspectRatio="xMidYMid meet"
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
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
                  floodColor="#121212"
                  floodOpacity="0.12"
                />
              </filter>
            </defs>

            <path d={spherePath} fill="url(#oceanFill)" />
            <path
              d={graticulePath}
              fill="none"
              stroke="#7eb6c8"
              strokeWidth={0.35 / Math.sqrt(zoomLevel)}
              opacity={0.35}
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
                  data-map-country={hasPeople ? "true" : undefined}
                  data-map-interactive={hasPeople ? "true" : undefined}
                  d={d}
                  fill={
                    isActive || selectedHere
                      ? "#6aae96"
                      : hasPeople
                        ? "#121212"
                        : "#d7e4d2"
                  }
                  fillOpacity={
                    isActive || selectedHere ? 0.92 : hasPeople ? 0.82 : 1
                  }
                  stroke={
                    isActive || selectedHere
                      ? "#121212"
                      : hasPeople
                        ? "#75E8F0"
                        : "#7a9578"
                  }
                  strokeWidth={
                    (isActive || selectedHere ? 1.6 : hasPeople ? 1 : 0.5) /
                    Math.sqrt(zoomLevel)
                  }
                  className={
                    hasPeople
                      ? "cursor-pointer outline-none focus:outline-none focus-visible:outline-none"
                      : undefined
                  }
                  style={hasPeople ? { outline: "none" } : undefined}
                  tabIndex={hasPeople ? 0 : undefined}
                  role={hasPeople ? "button" : undefined}
                  aria-label={
                    cluster
                      ? `${cluster.label}: ${cluster.count} people`
                      : undefined
                  }
                  onClick={(event) => {
                    if (!cluster) return;
                    (event.currentTarget as SVGPathElement).blur();
                    if (activeCode === cluster.code) {
                      setActiveCode(null);
                      return;
                    }
                    focusCluster(cluster);
                  }}
                  onKeyDown={(event) => {
                    if (!cluster) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      focusCluster(cluster);
                    }
                  }}
                />
              );
            })}

            <path
              d={spherePath}
              fill="none"
              stroke="#121212"
              strokeOpacity={0.18}
              strokeWidth={1.2 / Math.sqrt(zoomLevel)}
            />

            {clusters.map((cluster) => {
              const point = projection([cluster.lng, cluster.lat]);
              if (!point) return null;
              const [x, y] = point;
              const open = activeCode === cluster.code;
              const hovered = hoverCode === cluster.code;
              const selectedHere = cluster.people.some(
                (p) => p.id === selectedId,
              );
              const emphasized = open || selectedHere || hovered;
              const size = (8 + Math.sqrt(cluster.count) * 2.6) * screenScale;
              const ring = size + 5 * screenScale;
              const label = emphasized ? cluster.label : null;

              const activate = () => {
                if (activeCode === cluster.code && zoomLevel > 1.4) {
                  setActiveCode(null);
                  return;
                }
                focusCluster(cluster);
              };

              return (
                <g
                  key={`pin-${cluster.code}`}
                  data-map-pin="true"
                  transform={`translate(${x},${y})`}
                >
                  {emphasized ? (
                    <circle
                      r={ring}
                      fill="none"
                      stroke="#121212"
                      strokeWidth={2.4 * screenScale}
                      opacity={0.95}
                      className="pointer-events-none"
                    />
                  ) : null}
                  <circle
                    r={size + 2.2 * screenScale}
                    fill="#ffffff"
                    className="pointer-events-none"
                  />
                  <circle
                    r={size}
                    fill={open || selectedHere ? "#121212" : "#121212"}
                    role="button"
                    tabIndex={0}
                    data-map-interactive="true"
                    aria-label={`${cluster.label}: ${cluster.count} people`}
                    aria-pressed={open}
                    className="cursor-pointer"
                    style={{ outline: "none" }}
                    onMouseEnter={() => setHoverCode(cluster.code)}
                    onMouseLeave={() =>
                      setHoverCode((prev) =>
                        prev === cluster.code ? null : prev,
                      )
                    }
                    onFocus={() => setHoverCode(cluster.code)}
                    onBlur={() =>
                      setHoverCode((prev) =>
                        prev === cluster.code ? null : prev,
                      )
                    }
                    onClick={(event) => {
                      event.currentTarget.blur();
                      activate();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        activate();
                      }
                    }}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={Math.max(7 * screenScale, size * 0.9)}
                    fontWeight={700}
                    className="pointer-events-none select-none"
                  >
                    {cluster.count}
                  </text>
                  {label ? (
                    <g
                      transform={`translate(0, ${size + 11 * screenScale})`}
                      className="pointer-events-none"
                    >
                      <rect
                        x={-Math.min(52, label.length * 3.2) * screenScale}
                        y={-7.5 * screenScale}
                        width={Math.min(104, label.length * 6.4) * screenScale}
                        height={15 * screenScale}
                        rx={7.5 * screenScale}
                        fill="#ffffff"
                        opacity={0.96}
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#121212"
                        fontSize={9 * screenScale}
                        fontWeight={600}
                        className="select-none"
                      >
                        {label.length > 16 ? `${label.slice(0, 14)}…` : label}
                      </text>
                    </g>
                  ) : null}
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
        <div className="max-h-[38%] shrink-0 border-t border-norma-border bg-norma-surface">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div>
              <h2 className="font-[family-name:var(--font-norma-display)] text-base font-semibold text-norma-prussian">
                {active.label}
              </h2>
              <p className="text-xs text-norma-ink-muted">
                {active.count} {active.count === 1 ? "person" : "people"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-xs font-semibold text-norma-ink-muted hover:text-norma-prussian"
                onClick={() => focusCluster(active, 4.2)}
              >
                Zoom here
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-norma-ink-muted hover:text-norma-prussian"
                onClick={() => setActiveCode(null)}
              >
                Close
              </button>
            </div>
          </div>
          <ul
            className="max-h-52 overflow-auto divide-y divide-norma-border/70 px-2 pb-3 md:px-4"
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
