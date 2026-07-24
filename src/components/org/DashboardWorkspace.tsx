"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
import { CHART_BAR_ACCENT } from "@/lib/ui/department-accent";
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

type KpiTone = "default" | "accent" | "warn" | "success";

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  href: string;
  onNavigate: (href: string) => void;
  icon: ReactNode;
  tone?: KpiTone;
};

function KpiCard({
  label,
  value,
  hint,
  href,
  onNavigate,
  icon,
  tone = "default",
}: KpiCardProps) {
  const toneClass =
    tone === "accent"
      ? "border-[#e85d04]/20 bg-gradient-to-br from-white to-[#faf6f2]"
      : tone === "warn"
        ? "border-amber-200/70 bg-gradient-to-br from-white to-amber-50/50"
        : tone === "success"
          ? "border-norma-prussian/10 bg-gradient-to-br from-white to-[#f0f4f5]"
          : "border-norma-border bg-norma-surface";

  return (
    <button
      type="button"
      onClick={() => onNavigate(href)}
      className={`bloom-enter group flex min-h-[7.5rem] flex-col rounded-norma-lg border p-4 text-left shadow-norma-sm transition hover:-translate-y-0.5 hover:shadow-norma-md ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-norma-md bg-norma-prussian/5 text-norma-prussian group-hover:bg-[#e85d04]/12 group-hover:text-[#e85d04]">
          {icon}
        </span>
        <span className="font-[family-name:var(--font-norma-display)] text-3xl font-semibold tracking-tight text-norma-prussian tabular-nums">
          {value}
        </span>
      </div>
      <p className="mt-auto pt-3 text-sm font-semibold text-norma-prussian">
        {label}
      </p>
      {hint ? (
        <p className="mt-0.5 line-clamp-1 text-xs text-norma-ink-muted">{hint}</p>
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

function CountBars({
  title,
  items,
  empty,
}: {
  title: string;
  items: NamedCount[];
  empty: string;
}) {
  const max = items[0]?.count ?? 1;
  return (
    <section className="bloom-enter rounded-norma-lg border border-norma-border bg-norma-surface/95 p-5 shadow-norma-sm backdrop-blur-sm">
      <h2 className="text-sm font-semibold text-norma-prussian">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-norma-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3" aria-label={title}>
          {items.slice(0, 8).map((item, index) => {
            const width = Math.max(8, Math.round((item.count / max) * 100));
            // Soften lower ranks with opacity — one hue, ranked intensity
            const opacity = Math.max(0.45, 1 - index * 0.07);
            return (
              <li key={item.name}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate font-medium text-norma-prussian">
                    {item.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-norma-ink-muted">
                    {item.count}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-norma-surface-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${width}%`,
                      backgroundColor: CHART_BAR_ACCENT,
                      opacity,
                    }}
                  />
                </div>
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

  const load = useCallback(async () => {
    if (!readRemoteConnected()) {
      setStatus("empty");
      setPeople([]);
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    try {
      const session = readSessionOrgPayload() as OrgChartResponse | null;
      if (session?.ok && session.nodes?.length) {
        setPeople(session.nodes);
        setLastSyncedAt(session.lastSyncedAt ?? null);
        setStatus("ready");
      }
      const res = await fetch("/api/org-chart");
      const body = (await res.json()) as OrgChartResponse;
      if (!res.ok || !body.ok) {
        const mapped = mapOrgChartHttpError(res.status, body);
        if (session?.ok && session.nodes?.length) {
          return;
        }
        setStatus("error");
        setErrorMessage(mapped.message);
        return;
      }
      const nodes = body.nodes ?? [];
      if (nodes.length === 0) {
        setStatus("empty");
        setPeople([]);
        return;
      }
      setPeople(nodes);
      setLastSyncedAt(body.lastSyncedAt ?? null);
      writeSessionOrgPayload(body);
      setStatus("ready");
    } catch (err) {
      const mapped = mapOrgChartHttpError(0, {
        code: "network",
        message: err instanceof Error ? err.message : "Network error",
      });
      setStatus("error");
      setErrorMessage(mapped.message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
        href: "/app/people?incomplete=1",
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

  const completenessTone: KpiTone =
    insights.completenessScore >= 90
      ? "success"
      : insights.completenessScore >= 70
        ? "default"
        : "warn";

  return (
    <ProductPageFrame>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-norma-ink-muted">
            Acme structure at a glance · synced {syncedLabel}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="People"
          value={String(insights.headcount)}
          hint="Active employments"
          href="/app/people"
          onNavigate={navigate}
          icon={<IconPeople />}
          tone="accent"
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
        />
        <KpiCard
          label="Managers"
          value={String(insights.managerCount)}
          hint={`${insights.individualContributorCount} ICs`}
          href="/app"
          onNavigate={navigate}
          icon={<IconNetwork />}
        />
        <KpiCard
          label="Completeness"
          value={`${insights.completenessScore}%`}
          hint="Title · dept · country"
          href="/app/people?incomplete=1"
          onNavigate={navigate}
          icon={<IconShield />}
          tone={completenessTone}
        />
      </div>

      <div className="mt-5 grid scroll-mt-4 gap-4 lg:grid-cols-2" id="departments">
        <CountBars
          title="Headcount by department"
          items={insights.departments}
          empty="No departments on file yet."
        />
        <CountBars
          title="Headcount by country"
          items={insights.countries}
          empty="No countries on file yet."
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="bloom-enter rounded-norma-lg border border-norma-border bg-norma-surface/95 p-5 shadow-norma-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-norma-prussian">
              Largest teams
            </h2>
            <Link
              href="/app"
              className="text-xs font-semibold text-[#e85d04] hover:underline"
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
            <ul className="mt-3 divide-y divide-norma-border/70" aria-label="Largest teams">
              {insights.topManagers.map((manager) => (
                <li key={manager.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-norma-prussian">
                      {manager.fullName}
                    </p>
                    <p className="truncate text-xs text-norma-ink-muted">
                      {manager.jobTitle || "Not set"}
                      {manager.department ? ` · ${manager.department}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-norma-sm bg-norma-surface-muted px-2 py-1 text-[11px] font-semibold tabular-nums text-norma-prussian">
                    {manager.directReports}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bloom-enter rounded-norma-lg border border-norma-border bg-norma-surface/95 p-5 shadow-norma-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-norma-prussian">
              Needs attention
            </h2>
            <Link
              href="/settings/data-health"
              className="text-xs font-semibold text-[#e85d04] hover:underline"
              onClick={(event) => {
                event.preventDefault();
                navigate("/settings/data-health");
              }}
            >
              Review
            </Link>
          </div>
          {attentionItems.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 rounded-norma-md bg-norma-success-soft px-3 py-3 text-sm text-norma-success">
              <IconShield />
              All clear — no flags right now.
            </p>
          ) : (
            <ul className="mt-3 space-y-2" aria-label="Needs attention">
              {attentionItems.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-norma-md border border-norma-border/80 bg-norma-surface-muted/30 px-3 py-2.5 text-left transition hover:border-[#e85d04]/40 hover:bg-white"
                    onClick={() => navigate(item.href)}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-norma-md ${
                        item.tone === "danger"
                          ? "bg-norma-danger-soft text-norma-danger"
                          : item.tone === "warn"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-norma-surface-muted text-norma-prussian"
                      }`}
                    >
                      <IconAlert />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-norma-prussian">
                      {item.label}
                    </span>
                    <span className="tabular-nums text-sm font-semibold text-[#e85d04]">
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
