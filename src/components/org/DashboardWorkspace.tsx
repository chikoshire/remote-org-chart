"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
  RetryButton,
} from "@/components/org/ChartStateSurfaces";
import {
  computeDashboardInsights,
  type DashboardPerson,
  type NamedCount,
} from "@/lib/org/dashboard-insights";
import { mapOrgChartHttpError } from "@/lib/org/chart-state";
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

type InsightCardProps = {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  hrefLabel?: string;
  onNavigate?: (href: string) => void;
  emphasize?: boolean;
};

function InsightCard({
  label,
  value,
  hint,
  href,
  hrefLabel,
  onNavigate,
  emphasize,
}: InsightCardProps) {
  return (
    <article
      className={`bloom-enter rounded-norma-lg border border-norma-border bg-norma-surface p-4 shadow-norma-sm ${
        emphasize ? "sm:col-span-2 lg:col-span-1" : ""
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian md:text-3xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-norma-ink-muted">{hint}</p>
      ) : null}
      {href && hrefLabel ? (
        <Link
          href={href}
          className="mt-3 inline-block text-xs font-semibold text-norma-royal hover:underline"
          onClick={(event) => {
            if (!onNavigate) return;
            event.preventDefault();
            onNavigate(href);
          }}
        >
          {hrefLabel}
        </Link>
      ) : null}
    </article>
  );
}

function CountBars({
  title,
  items,
  empty,
  accentFor,
}: {
  title: string;
  items: NamedCount[];
  empty: string;
  accentFor?: (name: string) => string;
}) {
  const max = items[0]?.count ?? 1;
  return (
    <section className="bloom-enter rounded-norma-lg border border-norma-border bg-norma-surface p-5 shadow-norma-sm">
      <h2 className="text-sm font-semibold text-norma-prussian">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-norma-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3" aria-label={title}>
          {items.slice(0, 8).map((item) => {
            const width = Math.max(8, Math.round((item.count / max) * 100));
            const accent = accentFor?.(item.name) ?? "#624DE3";
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
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-norma-surface-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${width}%`,
                      backgroundColor: accent,
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
    const items: { label: string; count: number; href: string }[] = [];
    if (insights.managerMissingCount > 0) {
      items.push({
        label: "Manager missing",
        count: insights.managerMissingCount,
        href: "/app/data-health",
      });
    }
    if (insights.incompleteCount > 0) {
      items.push({
        label: "Incomplete profiles",
        count: insights.incompleteCount,
        href: "/app/data-health",
      });
    }
    if (insights.cycleMemberCount > 0) {
      items.push({
        label: "Reporting cycle",
        count: insights.cycleMemberCount,
        href: "/app/data-health",
      });
    }
    if (insights.rootCount > 1) {
      items.push({
        label: "Leadership roots",
        count: insights.rootCount,
        href: "/app",
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

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-norma-ink-subtle">
              Organisational intelligence
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian md:text-3xl">
              Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-norma-ink-muted">
              A live read on how Acme is structured: headcount, teams, managers,
              and where people data needs attention.
            </p>
            <p className="mt-2 text-xs text-norma-ink-subtle">
              Last updated {syncedLabel}
            </p>
          </div>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Quick links"
          >
            {[
              { href: "/app", label: "Org Chart" },
              { href: "/app/people", label: "People" },
              { href: "/app/departments", label: "Departments" },
              { href: "/app/data-health", label: "Data Health" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2 text-xs font-semibold text-norma-prussian shadow-norma-sm hover:border-norma-royal"
                onClick={(event) => {
                  event.preventDefault();
                  navigate(link.href);
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            label="People"
            value={String(insights.headcount)}
            hint="Active employments in Remote"
            href="/app/people"
            hrefLabel="Browse People"
            onNavigate={navigate}
            emphasize
          />
          <InsightCard
            label="Departments"
            value={String(insights.departmentCount)}
            hint={
              insights.largestDepartment
                ? `Largest: ${insights.largestDepartment.name} (${insights.largestDepartment.count})`
                : "No departments on file"
            }
            href="/app/departments"
            hrefLabel="Open Departments"
            onNavigate={navigate}
          />
          <InsightCard
            label="Managers"
            value={String(insights.managerCount)}
            hint={`${insights.individualContributorCount} individual contributors`}
            href="/app"
            hrefLabel="Open Org Chart"
            onNavigate={navigate}
          />
          <InsightCard
            label="Data completeness"
            value={`${insights.completenessScore}%`}
            hint="Share of people with title, department, and country"
            href="/app/data-health"
            hrefLabel="Fix incomplete profiles"
            onNavigate={navigate}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InsightCard
            label="Leadership roots"
            value={String(insights.rootCount)}
            hint={
              insights.rootCount > 1
                ? "More than one top of tree"
                : "Single leadership root"
            }
            href="/app"
            hrefLabel="View chart"
            onNavigate={navigate}
          />
          <InsightCard
            label="Manager missing"
            value={String(insights.managerMissingCount)}
            hint="Manager id set but not in the active set"
            href="/app/data-health"
            hrefLabel="Review Data Health"
            onNavigate={navigate}
          />
          <InsightCard
            label="Incomplete profiles"
            value={String(insights.incompleteCount)}
            hint="Missing title, department, or country"
            href="/app/data-health"
            hrefLabel="Open incomplete list"
            onNavigate={navigate}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <CountBars
            title="Headcount by department"
            items={insights.departments}
            empty="No departments on file yet."
            accentFor={departmentAccent}
          />
          <CountBars
            title="Headcount by country"
            items={insights.countries}
            empty="No countries on file yet."
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="bloom-enter rounded-norma-lg border border-norma-border bg-norma-surface p-5 shadow-norma-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-norma-prussian">
                Largest teams
              </h2>
              <Link
                href="/app"
                className="text-xs font-semibold text-norma-royal hover:underline"
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/app");
                }}
              >
                See in chart
              </Link>
            </div>
            {insights.topManagers.length === 0 ? (
              <p className="mt-4 text-sm text-norma-ink-muted">
                No managers with direct reports yet.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-norma-border/70" aria-label="Largest teams">
                {insights.topManagers.map((manager) => (
                  <li key={manager.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-norma-prussian">
                        {manager.fullName}
                      </p>
                      <p className="truncate text-xs text-norma-ink-muted">
                        {manager.jobTitle || "Not set"}
                        {manager.department ? ` · ${manager.department}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-norma-sm bg-norma-surface-muted px-2 py-1 text-[11px] font-semibold text-norma-prussian">
                      {manager.directReports === 1
                        ? "1 report"
                        : `${manager.directReports} reports`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bloom-enter rounded-norma-lg border border-norma-border bg-norma-surface p-5 shadow-norma-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-norma-prussian">
                Needs attention
              </h2>
              <Link
                href="/app/data-health"
                className="text-xs font-semibold text-norma-royal hover:underline"
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/app/data-health");
                }}
              >
                Data Health
              </Link>
            </div>
            {attentionItems.length === 0 ? (
              <p className="mt-4 rounded-norma-md bg-norma-success-soft px-3 py-3 text-sm text-norma-success">
                No reporting cycles, missing managers, or incomplete profiles
                flagged right now.
              </p>
            ) : (
              <ul className="mt-4 space-y-2" aria-label="Needs attention">
                {attentionItems.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 rounded-norma-md border border-norma-border bg-norma-surface-muted/40 px-3 py-3 text-left hover:border-norma-royal"
                      onClick={() => navigate(item.href)}
                    >
                      <span className="text-sm font-medium text-norma-prussian">
                        {item.label}
                      </span>
                      <span className="tabular-nums text-sm font-semibold text-norma-royal">
                        {item.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
