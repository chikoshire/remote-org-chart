"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
  RetryButton,
} from "@/components/org/ChartStateSurfaces";
import { PersonAvatar } from "@/components/org/PersonAvatar";
import { ProductPageFrame } from "@/components/shell/ProductPageFrame";
import {
  computeDataHealth,
  type HealthPerson,
} from "@/lib/org/data-health";
import { withPersonSearchParam } from "@/lib/org/deep-links";
import { mapOrgChartHttpError } from "@/lib/org/chart-state";
import {
  PERSON_OVERRIDES_CHANGED_EVENT,
  applyPersonOverrides,
  missingProfileFields,
} from "@/lib/org/person-overrides";
import {
  captureProfileReturn,
  consumeReturnScrollIfMatching,
} from "@/lib/ui/profile-return";
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
  showMissingHints?: boolean;
};

function HealthSection({
  title,
  description,
  people,
  empty,
  tone = "neutral",
  showMissingHints = false,
}: HealthSectionProps) {
  const countClass =
    tone === "danger"
      ? "bg-norma-danger-soft text-norma-danger"
      : tone === "warn"
        ? "bg-amber-100 text-amber-900"
        : "bg-norma-surface-muted text-norma-prussian";

  const toneDot =
    tone === "danger"
      ? "bg-norma-danger"
      : tone === "warn"
        ? "bg-amber-500"
        : "bg-norma-spray";

  return (
    <section className="flex h-full flex-col rounded-norma-lg border border-norma-border bg-norma-surface/95 p-5 shadow-norma-sm backdrop-blur-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-base font-semibold text-norma-prussian">
            <span className={`h-2 w-2 shrink-0 rounded-full ${toneDot}`} aria-hidden />
            {title}
          </h2>
          <p className="mt-1 text-sm text-norma-ink-muted">{description}</p>
        </div>
        <span
          className={`rounded-norma-sm px-2.5 py-1 text-xs font-semibold tabular-nums ${countClass}`}
        >
          {people.length}
        </span>
      </div>
      {people.length === 0 ? (
        <p className="mt-5 text-sm text-norma-ink-subtle">{empty}</p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => {
            const name = person.fullName?.trim() || "Unknown person";
            const chartHref = `/app${withPersonSearchParam("", person.id)}`;
            const profileHref = `/app/people/${person.id}`;
            const missing = showMissingHints
              ? missingProfileFields(person)
              : [];
            return (
              <li key={person.id}>
                <div className="flex h-full items-center gap-3 rounded-norma-md border border-norma-border/80 bg-norma-lavender/40 px-3.5 py-3.5">
                  <PersonAvatar
                    personId={person.id}
                    fullName={person.fullName}
                    department={person.department}
                    avatarUrl={person.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-norma-prussian">
                      {name}
                    </p>
                    <p className="truncate text-xs text-norma-ink-muted">
                      {person.jobTitle?.trim() || "Title not set"}
                      {person.department?.trim()
                        ? ` · ${person.department.trim()}`
                        : ""}
                    </p>
                    {missing.length > 0 ? (
                      <p className="mt-0.5 text-[11px] text-norma-ink-subtle">
                        Missing {missing.join(", ")}
                      </p>
                    ) : null}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link
                        href={profileHref}
                        onClick={() => captureProfileReturn(person.id)}
                        className="text-xs font-semibold text-norma-royal hover:underline"
                      >
                        Fix in profile
                      </Link>
                      <Link
                        href={chartHref}
                        className="text-xs font-medium text-norma-ink-muted hover:underline"
                      >
                        Chart
                      </Link>
                    </div>
                  </div>
                </div>
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
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [remoteConnected, setRemoteConnected] = useState(true);
  const hasReadyData = useRef(false);

  const commitPeople = useCallback((nodes: HealthPerson[]) => {
    const merged = applyPersonOverrides(nodes);
    setPeople(merged);
    const byId = new Map(merged.map((n) => [n.id, n]));
    const orphans = [
      ...new Set(
        merged
          .map((n) => n.managerEmploymentId?.trim())
          .filter(
            (id): id is string =>
              typeof id === "string" && id.length > 0 && !byId.has(id),
          ),
      ),
    ];
    setOrphanManagerIds(orphans);
  }, []);

  useEffect(() => {
    consumeReturnScrollIfMatching("/settings/data-health");
  }, []);

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
        commitPeople(session.nodes);
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
        if (!isRefresh && session?.ok && session.nodes?.length) return;
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
      commitPeople(nodes);
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
  }, [commitPeople]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onOverrides = () => {
      const session = readSessionOrgPayload() as OrgChartResponse | null;
      if (session?.ok && session.nodes?.length) {
        commitPeople(session.nodes);
      }
    };
    window.addEventListener(PERSON_OVERRIDES_CHANGED_EVENT, onOverrides);
    return () =>
      window.removeEventListener(PERSON_OVERRIDES_CHANGED_EVENT, onOverrides);
  }, [commitPeople]);

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
    <ProductPageFrame>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian md:text-3xl">
              Data Health
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-norma-ink-muted">
              Cycles, missing managers, and thin profiles · synced {syncedLabel}
              {refreshing ? " · refreshing…" : ""}. Open{" "}
              <span className="font-medium text-norma-ink">Fix in profile</span>{" "}
              to fill missing fields on the People page (saved locally on this
              device — not written back to Remote).
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
            className="rounded-norma-md border border-norma-border bg-norma-surface px-3 py-2 text-xs font-medium text-norma-ink-muted shadow-norma-sm hover:text-norma-prussian disabled:opacity-50"
            onClick={() => void load({ refresh: true })}
          >
            {refreshing ? "Refreshing…" : "Refresh from Remote"}
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-norma-lg border border-norma-border bg-norma-peach/50 px-5 py-4 shadow-norma-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
              People
            </p>
            <p className="mt-2 font-[family-name:var(--font-norma-display)] text-3xl font-semibold tabular-nums text-norma-prussian">
              {report.headcount}
            </p>
          </div>
          <div className="rounded-norma-lg border border-norma-border bg-norma-surface/95 px-5 py-4 shadow-norma-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
              Roots
            </p>
            <p className="mt-2 font-[family-name:var(--font-norma-display)] text-3xl font-semibold tabular-nums text-norma-prussian">
              {report.rootCount}
            </p>
            {report.multiRoot ? (
              <p className="mt-1 text-xs text-amber-900">Multiple tops of tree</p>
            ) : null}
          </div>
          <div className="rounded-norma-lg border border-norma-border bg-norma-surface/95 px-5 py-4 shadow-norma-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
              Issues
            </p>
            <p className="mt-2 font-[family-name:var(--font-norma-display)] text-3xl font-semibold tabular-nums text-norma-prussian">
              {report.inCycle.length +
                report.managerMissing.length +
                report.incompleteFields.length}
            </p>
          </div>
          <div className="rounded-norma-lg border border-norma-border bg-norma-surface/95 px-5 py-4 shadow-norma-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
              Sync
            </p>
            <p className="mt-2 text-sm font-semibold leading-snug text-norma-prussian">
              {syncedLabel}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <HealthSection
            title="Reporting cycles"
            description="Looped reporting chains — fix by changing a manager on the profile"
            people={report.inCycle}
            empty="No reporting cycles detected."
            tone="danger"
          />
          <HealthSection
            title="Manager missing"
            description="Manager id set but person not in the active set — assign a manager on the profile"
            people={report.managerMissing}
            empty="Every manager link resolves."
            tone="warn"
          />
          <HealthSection
            title="No manager on file"
            description="Top of a reporting line (including intentional leaders). Assign a manager only if they should report up."
            people={report.noManagerOnFile}
            empty="No top-of-tree people found."
            tone="neutral"
          />
          <HealthSection
            title="Incomplete profiles"
            description="Missing title, department, or country — edit those fields on the profile"
            people={report.incompleteFields}
            empty="Every profile has title, department, and country."
            tone="neutral"
            showMissingHints
          />
        </div>

        {report.orphanManagerIds.length > 0 ? (
          <p className="mt-6 text-xs text-norma-ink-subtle">
            {report.orphanManagerIds.length} orphan manager id
            {report.orphanManagerIds.length === 1 ? "" : "s"} referenced.
          </p>
        ) : null}
    </ProductPageFrame>
  );
}
