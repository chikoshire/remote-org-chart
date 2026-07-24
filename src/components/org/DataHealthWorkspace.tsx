"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
  RetryButton,
} from "@/components/org/ChartStateSurfaces";
import {
  computeDataHealth,
  type HealthPerson,
} from "@/lib/org/data-health";
import { withPersonSearchParam } from "@/lib/org/deep-links";
import { mapOrgChartHttpError } from "@/lib/org/chart-state";
import {
  readRemoteConnected,
  readSessionOrgPayload,
  writeSessionOrgPayload,
} from "@/lib/ui/remote-connection";

type OrgChartResponse = {
  ok: boolean;
  nodes?: HealthPerson[];
  orphanManagerCount?: number;
  rootCount?: number;
  lastSyncedAt?: string;
  message?: string;
  code?: string;
};

type HealthSectionProps = {
  title: string;
  description: string;
  people: HealthPerson[];
  empty: string;
  tone?: "danger" | "warn" | "neutral";
};

function HealthSection({
  title,
  description,
  people,
  empty,
  tone = "neutral",
}: HealthSectionProps) {
  const countClass =
    tone === "danger"
      ? "bg-norma-danger-soft text-norma-danger"
      : tone === "warn"
        ? "bg-amber-100 text-amber-900"
        : "bg-norma-surface-muted text-norma-prussian";

  return (
    <section className="rounded-norma-lg border border-norma-border bg-white p-5 shadow-norma-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-norma-prussian">{title}</h2>
          <p className="mt-1 text-sm text-norma-ink-muted">{description}</p>
        </div>
        <span
          className={`rounded-norma-sm px-2.5 py-1 text-xs font-semibold ${countClass}`}
        >
          {people.length}
        </span>
      </div>
      {people.length === 0 ? (
        <p className="mt-4 text-sm text-norma-ink-subtle">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-norma-border/70">
          {people.map((person) => {
            const name = person.fullName?.trim() || "Unknown person";
            const href = `/app${withPersonSearchParam("", person.id)}`;
            return (
              <li
                key={person.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-norma-prussian">
                    {name}
                  </p>
                  <p className="truncate text-xs text-norma-ink-muted">
                    {person.jobTitle?.trim() || "Not set"}
                    {person.department?.trim()
                      ? ` · ${person.department.trim()}`
                      : " · Dept not set"}
                  </p>
                </div>
                <Link
                  href={href}
                  className="shrink-0 text-xs font-semibold text-norma-royal hover:underline"
                >
                  Open in chart
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function DataHealthWorkspace() {
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [people, setPeople] = useState<HealthPerson[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [orphanManagerIds, setOrphanManagerIds] = useState<string[]>([]);

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
      // Reconstruct orphan ids from manager-missing people when API only returns counts.
      const byId = new Map(nodes.map((n) => [n.id, n]));
      const orphans = [
        ...new Set(
          nodes
            .map((n) => n.managerEmploymentId?.trim())
            .filter(
              (id): id is string =>
                typeof id === "string" && id.length > 0 && !byId.has(id),
            ),
        ),
      ];
      setOrphanManagerIds(orphans);
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

  const report = useMemo(
    () =>
      computeDataHealth(people, {
        orphanManagerIds,
        lastSyncedAt,
      }),
    [lastSyncedAt, orphanManagerIds, people],
  );

  const syncedLabel = report.lastSyncedAt
    ? new Date(report.lastSyncedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not synced yet";

  if (status === "loading") {
    return <ChartLoadingState title="Checking data health…" />;
  }
  if (status === "error") {
    return (
      <ChartErrorState
        title="Couldn’t load data health"
        description={errorMessage ?? "Something went wrong."}
        action={<RetryButton label="Try again" onClick={() => void load()} />}
      />
    );
  }
  if (status === "empty") {
    return (
      <ChartEmptyState
        title="No people to review"
        description="Connect Remote in Settings so we can check reporting lines and missing fields."
        action={<RetryButton label="Try again" onClick={() => void load()} />}
      />
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-norma-ink-subtle">
          Trust the org data
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian md:text-3xl">
          Data Health
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-norma-ink-muted">
          Spot cycles, missing managers, and incomplete profiles so teams can
          trust the org chart. Jump into the chart to fix each person in Remote.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-norma-lg border border-norma-border bg-white px-4 py-3 shadow-norma-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
              People
            </p>
            <p className="mt-1 text-2xl font-semibold text-norma-prussian">
              {report.headcount}
            </p>
          </div>
          <div className="rounded-norma-lg border border-norma-border bg-white px-4 py-3 shadow-norma-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
              Leadership roots
            </p>
            <p className="mt-1 text-2xl font-semibold text-norma-prussian">
              {report.rootCount}
            </p>
            {report.multiRoot ? (
              <p className="mt-1 text-xs text-amber-900">
                More than one top of tree
              </p>
            ) : null}
          </div>
          <div className="rounded-norma-lg border border-norma-border bg-white px-4 py-3 shadow-norma-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
              Last sync
            </p>
            <p className="mt-1 text-sm font-medium text-norma-prussian">
              {syncedLabel}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <HealthSection
            title="Reporting cycles"
            description="These people sit on a looped reporting chain."
            people={report.inCycle}
            empty="No reporting cycles detected."
            tone="danger"
          />
          <HealthSection
            title="Manager missing"
            description="Manager id is set in Remote but that person is not in the active set."
            people={report.managerMissing}
            empty="Every manager link resolves."
            tone="warn"
          />
          <HealthSection
            title="No manager on file"
            description="People at the top of a reporting line (including intentional leaders)."
            people={report.noManagerOnFile}
            empty="No top-of-tree people found."
            tone="neutral"
          />
          <HealthSection
            title="Incomplete profiles"
            description="Missing job title, department, or country."
            people={report.incompleteFields}
            empty="Every profile has title, department, and country."
            tone="neutral"
          />
        </div>

        {report.orphanManagerIds.length > 0 ? (
          <p className="mt-6 text-xs text-norma-ink-subtle">
            {report.orphanManagerIds.length} orphan manager id
            {report.orphanManagerIds.length === 1 ? "" : "s"} referenced.
          </p>
        ) : null}
      </div>
    </div>
  );
}
