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
} from "@/lib/org/dashboard-insights";
import { mapOrgChartHttpError } from "@/lib/org/chart-state";
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
};

function InsightCard({
  label,
  value,
  hint,
  href,
  hrefLabel,
  onNavigate,
}: InsightCardProps) {
  return (
    <article className="bloom-enter rounded-norma-lg border border-norma-border bg-norma-surface p-4 shadow-norma-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian">
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
        if (session?.ok && session.nodes?.length) return;
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
      setLastSyncedAt(body.lastSyncedAt ?? new Date().toISOString());
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
    () =>
      computeDashboardInsights(people, { lastSyncedAt }),
    [lastSyncedAt, people],
  );

  const syncedLabel = insights.lastSyncedAt
    ? new Date(insights.lastSyncedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not synced yet";

  if (status === "loading") {
    return <ChartLoadingState title="Loading organisation insights…" />;
  }
  if (status === "error") {
    return (
      <ChartErrorState
        title="Couldn’t load the dashboard"
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
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-norma-ink-subtle">
          Organisational intelligence
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-norma-ink-muted">
          Not just an org chart. A quick read on how Acme is structured and how
          complete the people data is.
        </p>
        <p className="mt-2 text-xs text-norma-ink-subtle">
          Last updated {syncedLabel}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InsightCard
            label="People"
            value={String(insights.headcount)}
            hint="Active employments in Remote"
            href="/app/people"
            hrefLabel="Browse People"
            onNavigate={navigate}
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
            label="Data completeness"
            value={`${insights.completenessScore}%`}
            hint="Share of people with title, department, and country"
            href="/app/data-health"
            hrefLabel="Fix incomplete profiles"
            onNavigate={navigate}
          />
        </div>

        {insights.cycleMemberCount > 0 ? (
          <p className="mt-6 rounded-norma-md border border-norma-danger/30 bg-norma-danger-soft px-4 py-3 text-sm text-norma-danger">
            {insights.cycleMemberCount}{" "}
            {insights.cycleMemberCount === 1 ? "person sits" : "people sit"} on
            a reporting cycle.{" "}
            <Link href="/app/data-health" className="font-semibold underline">
              Open Data Health
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
