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
  PersonDetailDrawer,
  type PersonDetail,
} from "@/components/org/PersonDetailDrawer";
import {
  computeDepartments,
  type DepartmentPerson,
  type DepartmentSummary,
} from "@/lib/org/departments";
import { withPersonSearchParam } from "@/lib/org/deep-links";
import { mapOrgChartHttpError } from "@/lib/org/chart-state";
import { departmentAccent } from "@/lib/ui/department-accent";
import { formatCountryLabel } from "@/lib/ui/format-country";
import {
  readRemoteConnected,
  readSessionOrgPayload,
  writeSessionOrgPayload,
} from "@/lib/ui/remote-connection";

type OrgChartResponse = {
  ok: boolean;
  nodes?: DepartmentPerson[];
  message?: string;
  code?: string;
};

function toDetail(
  person: DepartmentPerson,
  byId: Map<string, DepartmentPerson>,
): PersonDetail {
  return {
    id: person.id,
    fullName: person.fullName,
    jobTitle: person.jobTitle,
    department: person.department,
    country: person.country,
    directReports: person.directReports ?? 0,
    inCycle: person.inCycle,
    isRoot: !person.managerEmploymentId,
    managerMissing: Boolean(
      person.managerEmploymentId && !byId.has(person.managerEmploymentId),
    ),
  };
}

function initials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function DepartmentsWorkspace() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [people, setPeople] = useState<DepartmentPerson[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const departments = useMemo(() => computeDepartments(people), [people]);

  useEffect(() => {
    if (!selectedDept && departments[0]) {
      setSelectedDept(departments[0].name);
    }
  }, [departments, selectedDept]);

  const active: DepartmentSummary | null =
    departments.find((d) => d.name === selectedDept) ?? departments[0] ?? null;

  const byId = useMemo(
    () => new Map(people.map((p) => [p.id, p])),
    [people],
  );

  const selected = useMemo(() => {
    if (!selectedId) return null;
    const person = byId.get(selectedId);
    if (!person) return null;
    const path: PersonDetail[] = [];
    let current: string | null = selectedId;
    const guard = new Set<string>();
    while (current && !guard.has(current)) {
      guard.add(current);
      const node = byId.get(current);
      if (!node) break;
      path.push(toDetail(node, byId));
      current = node.managerEmploymentId;
    }
    path.reverse();
    const reports = people
      .filter((p) => p.managerEmploymentId === selectedId)
      .map((p) => toDetail(p, byId));
    return { person: toDetail(person, byId), pathToRoot: path, reports };
  }, [byId, people, selectedId]);

  if (status === "loading") {
    return <ChartLoadingState title="Loading departments…" />;
  }
  if (status === "error") {
    return (
      <ChartErrorState
        title="Couldn’t load departments"
        description={errorMessage ?? "Something went wrong."}
        action={<RetryButton label="Try again" onClick={() => void load()} />}
      />
    );
  }
  if (status === "empty") {
    return (
      <ChartEmptyState
        title="No departments to show"
        description="Connect Remote in Settings to group people by department."
        action={<RetryButton label="Try again" onClick={() => void load()} />}
      />
    );
  }

  const accent = departmentAccent(
    active?.name === "Unassigned" ? null : active?.name,
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <aside className="flex max-h-[40%] w-full shrink-0 flex-col border-b border-norma-border bg-norma-surface/90 md:max-h-none md:w-72 md:border-b-0 md:border-r">
        <div className="border-b border-norma-border px-4 py-4">
          <h1 className="font-[family-name:var(--font-norma-display)] text-xl font-semibold tracking-tight text-norma-prussian">
            Departments
          </h1>
          <p className="mt-1 text-sm text-norma-ink-muted">
            {departments.length}{" "}
            {departments.length === 1 ? "department" : "departments"}
          </p>
        </div>
        <ul className="min-h-0 flex-1 overflow-auto p-2" aria-label="Departments">
          {departments.map((dept) => {
            const selected = dept.name === active?.name;
            const strip = departmentAccent(
              dept.name === "Unassigned" ? null : dept.name,
            );
            return (
              <li key={dept.name}>
                <button
                  type="button"
                  onClick={() => setSelectedDept(dept.name)}
                  className={`flex w-full items-center gap-3 rounded-norma-md px-3 py-2.5 text-left ${
                    selected
                      ? "bg-norma-accent-soft text-norma-prussian"
                      : "text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-prussian"
                  }`}
                  aria-current={selected ? "true" : undefined}
                >
                  <span
                    aria-hidden
                    className="h-8 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: strip }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {dept.name}
                    </span>
                    <span className="block text-xs opacity-80">
                      {dept.headcount}{" "}
                      {dept.headcount === 1 ? "person" : "people"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="relative min-h-0 flex-1 overflow-auto">
        {active ? (
          <div className="px-4 py-6 md:px-6 md:py-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p
                  className="inline-flex rounded-norma-sm px-2 py-0.5 text-[10px] font-semibold text-norma-prussian"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accent} 16%, white)`,
                  }}
                >
                  Department
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-prussian">
                  {active.name}
                </h2>
                <p className="mt-1 text-sm text-norma-ink-muted">
                  {active.headcount}{" "}
                  {active.headcount === 1 ? "person" : "people"}
                  {active.lead
                    ? ` · Lead: ${active.lead.fullName?.trim() || "Unknown"}`
                    : ""}
                </p>
              </div>
              <Link
                href="/app"
                className="text-sm font-semibold text-norma-royal hover:underline"
              >
                Open Org Chart
              </Link>
            </div>

            <ul
              className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              aria-label={`${active.name} people`}
            >
              {active.people.map((person) => {
                const name = person.fullName?.trim() || "Unknown person";
                const countryLabel = formatCountryLabel(person.country);
                const isLead = active.lead?.id === person.id;
                return (
                  <li key={person.id}>
                    <article className="relative flex h-full flex-col overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-sm">
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-1.5"
                        style={{ backgroundColor: accent }}
                      />
                      <button
                        type="button"
                        className="flex w-full items-start gap-3 px-4 py-4 pl-5 text-left"
                        onClick={() => setSelectedId(person.id)}
                      >
                        <span
                          aria-hidden
                          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                          style={{ backgroundColor: accent }}
                        >
                          {initials(person.fullName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-[family-name:var(--font-norma-display)] text-base font-semibold text-norma-prussian">
                            {name}
                            {isLead ? (
                              <span className="ml-2 rounded-norma-sm bg-norma-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-norma-royal">
                                Lead
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-norma-ink-muted">
                            {person.jobTitle?.trim() || "Not set"}
                          </span>
                          {countryLabel ? (
                            <span className="mt-1 block text-xs text-norma-ink-subtle">
                              {countryLabel}
                            </span>
                          ) : null}
                          <span className="mt-2 inline-flex rounded-norma-sm bg-norma-surface-muted px-2 py-0.5 text-[11px] font-semibold text-norma-prussian">
                            {(person.directReports ?? 0) === 1
                              ? "1 report"
                              : `${person.directReports ?? 0} reports`}
                          </span>
                        </span>
                      </button>
                      <div className="mt-auto flex gap-4 border-t border-norma-border/70 px-4 py-3 pl-5">
                        <button
                          type="button"
                          className="text-xs font-semibold text-norma-royal hover:underline"
                          onClick={() => setSelectedId(person.id)}
                        >
                          Open profile
                        </button>
                        <button
                          type="button"
                          className="text-xs font-medium text-norma-ink-muted hover:text-norma-prussian hover:underline"
                          onClick={() =>
                            router.push(
                              `/app${withPersonSearchParam("", person.id)}`,
                            )
                          }
                        >
                          Show in chart
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {selected ? (
          <PersonDetailDrawer
            person={selected.person}
            pathToRoot={selected.pathToRoot}
            reports={selected.reports}
            onClose={() => setSelectedId(null)}
            onSelectPerson={setSelectedId}
          />
        ) : null}
      </div>
    </div>
  );
}
