"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
  RetryButton,
} from "@/components/org/ChartStateSurfaces";
import { ProductPageFrame } from "@/components/shell/ProductPageFrame";
import {
  computeDashboardInsights,
  type DashboardPerson,
  type NamedCount,
} from "@/lib/org/dashboard-insights";
import { mapOrgChartHttpError } from "@/lib/org/chart-state";
import {
  PERSON_OVERRIDES_CHANGED_EVENT,
  applyPersonOverrides,
} from "@/lib/org/person-overrides";
import {
  mapCountryHref,
  peopleDepartmentHref,
} from "@/lib/org/deep-links";
import { departmentAccent } from "@/lib/ui/department-accent";
import { withViewTransition } from "@/lib/ui/motion";
import {
  readRemoteConnected,
  readSessionOrgPayload,
  writeSessionOrgPayload,
} from "@/lib/ui/remote-connection";

type OrgChartResponse = {
  ok: boolean;
  nodes?: DashboardPerson[];
  lastSyncedAt?: string;
  message?: string;
  code?: string;
};

type KpiTone = "lavender" | "peach" | "mint" | "sky" | "rose";

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  href: string;
  onNavigate: (href: string) => void;
  icon: ReactNode;
  tone: KpiTone;
  delayClass?: string;
  tall?: boolean;
  meter?: number;
};

const TONE_STYLES: Record<KpiTone, string> = {
  lavender:
    "border-norma-lavender/80 bg-gradient-to-br from-norma-lavender via-norma-lavender/80 to-white/70",
  peach:
    "border-norma-peach/80 bg-gradient-to-br from-norma-peach via-norma-peach/75 to-white/70",
  mint: "border-norma-mint/80 bg-gradient-to-br from-norma-mint via-norma-mint/80 to-white/65",
  sky: "border-norma-sky/80 bg-gradient-to-br from-norma-sky via-norma-sky/75 to-white/70",
  rose: "border-norma-rose/80 bg-gradient-to-br from-norma-rose via-norma-rose/75 to-white/70",
};

function CompletenessMeter({ score }: { score: number }) {
  const size = 52;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, score)) / 100) * c;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 -rotate-90"
      aria-hidden
      style={{ ["--meter-circumference" as string]: String(c) }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgb(18 18 18 / 0.12)"
        strokeWidth={stroke}
      />
      <circle
        className="meter-ring-progress"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  hint,
  href,
  onNavigate,
  icon,
  tone,
  delayClass = "",
  tall = false,
  meter,
}: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(href)}
      className={`bloom-enter group flex cursor-pointer flex-col rounded-norma-lg border p-6 text-left shadow-norma-sm transition hover:-translate-y-1 hover:shadow-norma-md ${
        tall ? "min-h-[9.5rem]" : "min-h-[8.25rem]"
      } ${TONE_STYLES[tone]} ${delayClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-norma-ink text-norma-ink-inverse shadow-norma-sm">
          {icon}
        </span>
        {typeof meter === "number" ? (
          <span className="relative inline-flex h-[52px] w-[52px] items-center justify-center text-norma-ink">
            <CompletenessMeter score={meter} />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums">
              {value}
            </span>
          </span>
        ) : (
          <span className="font-[family-name:var(--font-norma-display)] text-3xl font-semibold tracking-tight text-norma-ink tabular-nums md:text-4xl">
            {value}
          </span>
        )}
      </div>
      <p className="mt-auto pt-4 text-sm font-semibold text-norma-ink">{label}</p>
      {hint ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-norma-ink-muted">
          {hint}
        </p>
      ) : null}
    </button>
  );
}

function IconPeople() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    </svg>
  );
}

function IconNetwork() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path strokeLinecap="round" d="M12 7.5v4M12 11.5 6.5 16M12 11.5l5.5 4.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4.5 6v5c0 5 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.5 7.5-9.5V6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

/** Donut share for departments - not another bar list. */
function DepartmentShare({
  items,
  empty,
  onSelect,
}: {
  items: NamedCount[];
  empty: string;
  onSelect: (department: string) => void;
}) {
  const top = items.slice(0, 6);
  const total = top.reduce((sum, item) => sum + item.count, 0) || 1;
  const size = 168;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  let offset = 0;
  const arcs = top.map((item) => {
    const share = item.count / total;
    const length = share * c;
    const arc = {
      ...item,
      length,
      offset,
      color: departmentAccent(item.name),
      pct: Math.round(share * 100),
    };
    offset += length;
    return arc;
  });

  return (
    <section className="bloom-enter bloom-enter-delay-4 flex min-h-[22rem] flex-col rounded-norma-lg border border-norma-border/70 bg-gradient-to-br from-white/90 via-norma-lavender/25 to-norma-surface p-6 shadow-norma-sm">
      <h2 className="text-sm font-semibold text-norma-ink">
        Headcount by department
      </h2>
      <p className="mt-1 text-xs text-norma-ink-muted">Share of people · top teams</p>
      {top.length === 0 ? (
        <p className="mt-6 text-sm text-norma-ink-muted">{empty}</p>
      ) : (
        <div className="mt-6 flex flex-1 flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="rgb(18 18 18 / 0.06)"
                strokeWidth={stroke}
              />
              {arcs.map((arc) => (
                <circle
                  key={arc.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${arc.length} ${c - arc.length}`}
                  strokeDashoffset={-arc.offset}
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex rotate-0 flex-col items-center justify-center">
              <span className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tabular-nums text-norma-ink">
                {total}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-norma-ink-muted">
                people
              </span>
            </div>
          </div>
          <ul className="w-full space-y-2.5" aria-label="Headcount by department">
            {arcs.map((arc) => (
              <li key={arc.name}>
                <button
                  type="button"
                  onClick={() => onSelect(arc.name)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-norma-md px-1 py-1 text-left text-sm transition hover:bg-white/70"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: arc.color }}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-norma-ink">
                    {arc.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-norma-ink-muted">
                    {arc.count}
                    <span className="ml-1 text-[11px] text-norma-ink-subtle">
                      ({arc.pct}%)
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Mid-tone country dots - richer than soft fills so they read on cream/white. */
const COUNTRY_DOT_PALETTE = [
  "#5a9ec8", // sky
  "#4f9f82", // mint
  "#d4924a", // peach
  "#8b7bc4", // lavender
  "#c97892", // rose
  "#4a8fb8", // deep sky
  "#5aab8e", // seafoam
  "#c9a04a", // gold
] as const;

/** Proportional dots for countries - distinct from the department donut. */
function CountryDots({
  items,
  empty,
  onSelect,
}: {
  items: NamedCount[];
  empty: string;
  onSelect: (country: string) => void;
}) {
  const top = items.slice(0, 8);
  const max = top[0]?.count ?? 1;

  return (
    <section className="bloom-enter bloom-enter-delay-5 flex min-h-[22rem] flex-col rounded-norma-lg border border-norma-border/70 bg-gradient-to-br from-white/90 via-norma-mint/30 to-norma-sky/20 p-6 shadow-norma-sm">
      <h2 className="text-sm font-semibold text-norma-ink">Headcount by country</h2>
      <p className="mt-1 text-xs text-norma-ink-muted">
        Each dot ≈ relative size · denser = larger team
      </p>
      {top.length === 0 ? (
        <p className="mt-6 text-sm text-norma-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-5 space-y-4" aria-label="Headcount by country">
          {top.map((item, index) => {
            const dots = Math.max(1, Math.round((item.count / max) * 12));
            const color =
              COUNTRY_DOT_PALETTE[index % COUNTRY_DOT_PALETTE.length]!;
            return (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => onSelect(item.name)}
                  className="w-full cursor-pointer rounded-norma-md px-1 py-1 text-left transition hover:bg-white/70"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-norma-ink">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-norma-ink-muted">
                      {item.count}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5" aria-hidden>
                    {Array.from({ length: dots }).map((_, i) => (
                      <span
                        key={i}
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                        style={{
                          backgroundColor: color,
                          opacity: 0.78 + (i / Math.max(dots - 1, 1)) * 0.22,
                        }}
                      />
                    ))}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function DashboardWorkspace() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [people, setPeople] = useState<DashboardPerson[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [remoteConnected, setRemoteConnected] = useState(true);
  const hasReadyData = useRef(false);

  const navigate = useCallback(
    (href: string) => {
      const hashIndex = href.indexOf("#");
      if (hashIndex >= 0) {
        const path = href.slice(0, hashIndex) || "/app/dashboard";
        const hash = href.slice(hashIndex + 1);
        const onDashboard =
          typeof window !== "undefined" &&
          (window.location.pathname === "/app/dashboard" ||
            path === "/app/dashboard");
        if (onDashboard && hash) {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.classList.add("ring-2", "ring-norma-ink/25", "ring-offset-2");
            window.setTimeout(() => {
              el.classList.remove(
                "ring-2",
                "ring-norma-ink/25",
                "ring-offset-2",
              );
            }, 1400);
            return;
          }
        }
      }
      void withViewTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  const load = useCallback(async (opts?: { refresh?: boolean }) => {
    const isRefresh = opts?.refresh === true;
    setRefreshError(null);
    if (!readRemoteConnected()) {
      setRemoteConnected(false);
      setStatus("empty");
      setPeople([]);
      hasReadyData.current = false;
      return;
    }
    setRemoteConnected(true);
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setStatus("loading");
      setErrorMessage(null);
    }
    try {
      const session = readSessionOrgPayload() as OrgChartResponse | null;
      if (!isRefresh && session?.ok && session.nodes?.length) {
        setPeople(applyPersonOverrides(session.nodes));
        setLastSyncedAt(session.lastSyncedAt ?? null);
        setStatus("ready");
        hasReadyData.current = true;
      }
      const res = await fetch(
        isRefresh ? "/api/org-chart?refresh=1" : "/api/org-chart",
      );
      const body = (await res.json()) as OrgChartResponse;
      if (!res.ok || !body.ok) {
        const mapped = mapOrgChartHttpError(res.status, body);
        if (isRefresh && hasReadyData.current) {
          setRefreshError(mapped.message);
          return;
        }
        if (!isRefresh && session?.ok && session.nodes?.length) {
          return;
        }
        setStatus("error");
        setErrorMessage(mapped.message);
        return;
      }
      const nodes = body.nodes ?? [];
      if (nodes.length === 0) {
        if (isRefresh && hasReadyData.current) {
          setRefreshError(
            "Remote returned an empty org chart; kept the previous snapshot.",
          );
          return;
        }
        setStatus("empty");
        setPeople([]);
        hasReadyData.current = false;
        return;
      }
      setPeople(applyPersonOverrides(nodes));
      setLastSyncedAt(body.lastSyncedAt ?? new Date().toISOString());
      writeSessionOrgPayload(body);
      hasReadyData.current = true;
      setStatus("ready");
    } catch (err) {
      const mapped = mapOrgChartHttpError(0, {
        code: "network",
        message: err instanceof Error ? err.message : "Network error",
      });
      if (isRefresh && hasReadyData.current) {
        setRefreshError(mapped.message);
        return;
      }
      setStatus("error");
      setErrorMessage(mapped.message);
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onOverrides = () => {
      const session = readSessionOrgPayload() as OrgChartResponse | null;
      if (session?.ok && session.nodes?.length) {
        setPeople(applyPersonOverrides(session.nodes));
      }
    };
    window.addEventListener(PERSON_OVERRIDES_CHANGED_EVENT, onOverrides);
    return () =>
      window.removeEventListener(PERSON_OVERRIDES_CHANGED_EVENT, onOverrides);
  }, []);
  const insights = useMemo(
    () => computeDashboardInsights(people, { lastSyncedAt }),
    [lastSyncedAt, people],
  );

  const syncedLabel = useMemo(() => {
    if (!insights.lastSyncedAt) return "Just now";
    try {
      return new Date(insights.lastSyncedAt).toLocaleString();
    } catch {
      return insights.lastSyncedAt;
    }
  }, [insights.lastSyncedAt]);

  const attentionItems = useMemo(() => {
    const items: {
      label: string;
      count: number;
      href: string;
      tone: "warn" | "danger" | "neutral";
    }[] = [];
    if (insights.managerMissingCount > 0) {
      items.push({
        label: "Manager missing",
        count: insights.managerMissingCount,
        href: "/settings/data-health",
        tone: "warn",
      });
    }
    if (insights.incompleteCount > 0) {
      items.push({
        label: "Incomplete profiles",
        count: insights.incompleteCount,
        href: "/settings/data-health",
        tone: "neutral",
      });
    }
    if (insights.cycleMemberCount > 0) {
      items.push({
        label: "Reporting cycle",
        count: insights.cycleMemberCount,
        href: "/settings/data-health",
        tone: "danger",
      });
    }
    if (insights.rootCount > 1) {
      items.push({
        label: "Leadership roots",
        count: insights.rootCount,
        href: "/app",
        tone: "warn",
      });
    }
    return items;
  }, [insights]);

  if (status === "loading") {
    return <ChartLoadingState />;
  }
  if (status === "error") {
    return (
      <ChartErrorState
        title="Couldn’t load dashboard"
        description={errorMessage ?? "Something went wrong."}
        action={<RetryButton label="Try again" onClick={() => void load()} />}
      />
    );
  }
  if (status === "empty") {
    return (
      <ChartEmptyState
        title="No organisation data yet"
        description="Connect Remote in Settings to see headcount, departments, and data health at a glance."
        action={<RetryButton label="Try again" onClick={() => void load()} />}
      />
    );
  }

  // Keep Completeness off `sky` so it doesn’t twin the Managers card.
  const completenessTone: KpiTone =
    insights.completenessScore >= 70 ? "mint" : "rose";

  return (
    <ProductPageFrame>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-ink md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-norma-ink-muted">
            Acme structure at a glance · synced {syncedLabel}
            {refreshing ? " · refreshing…" : ""}
          </p>
          {refreshError ? (
            <p className="mt-2 text-sm text-norma-danger" role="alert">
              Refresh failed. Kept the previous data. {refreshError}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={refreshing || !remoteConnected}
          className="cursor-pointer rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2 text-xs font-medium text-norma-ink-muted shadow-norma-sm hover:text-norma-prussian disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void load({ refresh: true })}
        >
          {refreshing ? "Refreshing…" : "Refresh from Remote"}
        </button>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="People"
          value={String(insights.headcount)}
          hint="Active employments"
          href="/app/people"
          onNavigate={navigate}
          icon={<IconPeople />}
          tone="peach"
          delayClass="bloom-enter-delay-1"
          tall
        />
        <KpiCard
          label="Departments"
          value={String(insights.departmentCount)}
          hint={
            insights.largestDepartment
              ? `Largest · ${insights.largestDepartment.name}`
              : "No departments yet"
          }
          href="/app/dashboard#departments"
          onNavigate={navigate}
          icon={<IconBuilding />}
          tone="lavender"
          delayClass="bloom-enter-delay-2"
        />
        <KpiCard
          label="Managers"
          value={String(insights.managerCount)}
          hint={`${insights.individualContributorCount} ICs`}
          href="/app"
          onNavigate={navigate}
          icon={<IconNetwork />}
          tone="sky"
          delayClass="bloom-enter-delay-3"
        />
        <KpiCard
          label="Completeness"
          value={`${insights.completenessScore}%`}
          hint="Title · dept · country"
          href="/app/people?incomplete=1"
          onNavigate={navigate}
          icon={<IconShield />}
          tone={completenessTone}
          delayClass="bloom-enter-delay-4"
          tall
          meter={insights.completenessScore}
        />
      </div>

      <div className="mt-6 grid scroll-mt-4 gap-5 rounded-norma-lg lg:grid-cols-2" id="departments">
        <DepartmentShare
          items={insights.departments}
          empty="No departments on file yet."
          onSelect={(department) => navigate(peopleDepartmentHref(department))}
        />
        <CountryDots
          items={insights.countries}
          empty="No countries on file yet."
          onSelect={(country) => navigate(mapCountryHref(country))}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="bloom-enter bloom-enter-delay-5 min-h-[18rem] rounded-norma-lg border border-norma-peach/50 bg-gradient-to-br from-norma-peach/40 via-white/80 to-norma-surface p-6 shadow-norma-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-norma-ink">Largest teams</h2>
            <Link
              href="/app"
              className="cursor-pointer text-xs font-semibold text-norma-ink hover:underline"
              onClick={(event) => {
                event.preventDefault();
                navigate("/app");
              }}
            >
              Chart
            </Link>
          </div>
          {insights.topManagers.length === 0 ? (
            <p className="mt-4 text-sm text-norma-ink-muted">
              No managers with direct reports yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-norma-border/60" aria-label="Largest teams">
              {insights.topManagers.map((manager) => (
                <li key={manager.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/people/${manager.id}`)}
                    className="flex w-full cursor-pointer items-center gap-3 py-3 text-left transition hover:bg-white/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-norma-ink">
                        {manager.fullName}
                      </p>
                      <p className="truncate text-xs text-norma-ink-muted">
                        {manager.jobTitle || "Not set"}
                        {manager.department ? ` · ${manager.department}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-norma-ink px-2.5 py-1 text-[11px] font-semibold tabular-nums text-norma-ink-inverse">
                      {manager.directReports}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bloom-enter bloom-enter-delay-6 min-h-[18rem] rounded-norma-lg border border-norma-rose/45 bg-gradient-to-br from-norma-rose/35 via-white/85 to-norma-surface p-6 shadow-norma-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-norma-ink">Needs attention</h2>
            <Link
              href="/settings/data-health"
              className="cursor-pointer text-xs font-semibold text-norma-ink hover:underline"
              onClick={(event) => {
                event.preventDefault();
                navigate("/settings/data-health");
              }}
            >
              Review
            </Link>
          </div>
          {attentionItems.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 rounded-norma-md bg-norma-success-soft px-4 py-4 text-sm text-norma-success">
              <IconShield />
              All clear. No flags right now.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5" aria-label="Needs attention">
              {attentionItems.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-norma-md border border-white/70 bg-white/70 px-3.5 py-3 text-left shadow-norma-sm transition hover:-translate-y-0.5 hover:border-norma-ink/20 hover:shadow-norma-md"
                    onClick={() => navigate(item.href)}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        item.tone === "danger"
                          ? "bg-norma-danger-soft text-norma-danger"
                          : item.tone === "warn"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-norma-lavender text-norma-ink"
                      }`}
                    >
                      <IconAlert />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-norma-ink">
                      {item.label}
                    </span>
                    <span className="tabular-nums text-sm font-semibold text-norma-ink">
                      {item.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ProductPageFrame>
  );
}
