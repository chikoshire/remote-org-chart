"use client";

import { useMemo, useState } from "react";

export type DirectoryPerson = {
  id: string;
  fullName?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  country?: string | null;
  directReports?: number;
  managerEmploymentId: string | null;
};

type PeopleDirectoryProps = {
  people: DirectoryPerson[];
  selectedId: string | null;
  query: string;
  onSelect: (id: string) => void;
  onOpenInChart: (id: string) => void;
};

function initials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function sortKey(person: DirectoryPerson): string {
  return (person.fullName ?? "").trim().toLocaleLowerCase() || person.id;
}

export function PeopleDirectory({
  people,
  selectedId,
  query,
  onSelect,
  onOpenInChart,
}: PeopleDirectoryProps) {
  const [deptOnly, setDeptOnly] = useState<string | "all">("all");

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const p of people) {
      if (p.department?.trim()) set.add(p.department.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [people]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return people
      .filter((p) => {
        if (deptOnly !== "all" && (p.department?.trim() ?? "") !== deptOnly) {
          return false;
        }
        if (!q) return true;
        const hay = [p.fullName, p.jobTitle, p.department, p.country]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  }, [deptOnly, people, query]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-norma-surface-muted/40">
      <div className="flex flex-wrap items-center gap-2 border-b border-norma-border bg-norma-surface px-4 py-3">
        <p className="text-sm font-medium text-norma-prussian">
          {filtered.length}{" "}
          {filtered.length === 1 ? "person" : "people"}
        </p>
        <label className="ml-auto flex items-center gap-2 text-xs text-norma-ink-muted">
          <span className="sr-only">Filter directory by department</span>
          <select
            value={deptOnly}
            onChange={(e) =>
              setDeptOnly(e.target.value === "all" ? "all" : e.target.value)
            }
            className="rounded-norma-sm border border-norma-border bg-norma-surface px-2 py-1.5 text-xs text-norma-ink"
          >
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-norma-ink-muted">
          No people match this directory filter.
        </p>
      ) : (
        <ul
          className="grid flex-1 grid-cols-1 gap-3 overflow-auto p-4 sm:grid-cols-2 xl:grid-cols-3"
          aria-label="People directory"
        >
          {filtered.map((person) => {
            const name = person.fullName?.trim() || "Unknown person";
            const selected = person.id === selectedId;
            return (
              <li key={person.id}>
                <article
                  className={`flex h-full flex-col rounded-norma-lg border bg-norma-surface p-4 shadow-norma-sm transition ${
                    selected
                      ? "border-norma-royal ring-2 ring-norma-royal/25"
                      : "border-norma-border hover:border-norma-border-strong"
                  }`}
                >
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 text-left"
                    onClick={() => onSelect(person.id)}
                    aria-pressed={selected}
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-norma-accent-soft text-sm font-semibold text-norma-royal"
                    >
                      {initials(person.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-[family-name:var(--font-norma-display)] text-base font-semibold tracking-tight text-norma-prussian">
                        {name}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-norma-ink-muted">
                        {person.jobTitle?.trim() || "No title"}
                      </span>
                      <span className="mt-2 block truncate text-xs text-norma-ink-subtle">
                        {[person.department, person.country]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </span>
                      <span className="mt-1 block text-xs text-norma-ink-subtle">
                        {person.directReports ?? 0} direct{" "}
                        {(person.directReports ?? 0) === 1
                          ? "report"
                          : "reports"}
                      </span>
                    </span>
                  </button>
                  <div className="mt-3 flex gap-2 border-t border-norma-border pt-3">
                    <button
                      type="button"
                      className="text-xs font-medium text-norma-royal hover:underline"
                      onClick={() => onSelect(person.id)}
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      className="text-xs font-medium text-norma-ink-muted hover:text-norma-prussian hover:underline"
                      onClick={() => onOpenInChart(person.id)}
                    >
                      Show in chart
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
