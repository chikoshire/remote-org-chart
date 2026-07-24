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
  managerName?: string | null;
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
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#eef3f2_0%,#f7faf9_40%,#ffffff_100%)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-norma-border bg-[#1a1a1a] px-4 py-3 text-[#f4f7f5]">
        <div>
          <p className="font-[family-name:var(--font-norma-display)] text-sm font-semibold tracking-tight">
            People directory
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9fd5de]">
            {filtered.length} {filtered.length === 1 ? "person" : "people"}
          </p>
          <p className="mt-1 text-[11px] text-[#9fd5de]/90">
            Search and filters live in the side panel.
          </p>
        </div>
        <label className="ml-auto flex items-center gap-2 text-xs text-[#9fd5de]">
          <span className="sr-only">Filter directory by department</span>
          <select
            value={deptOnly}
            onChange={(e) =>
              setDeptOnly(e.target.value === "all" ? "all" : e.target.value)
            }
            className="rounded-norma-sm border border-white/20 bg-white/10 px-2 py-1.5 text-xs text-[#f4f7f5]"
          >
            <option value="all">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d} className="text-norma-prussian">
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
                  className={`relative flex h-full flex-col overflow-hidden rounded-norma-lg border bg-norma-surface shadow-norma-sm transition ${
                    selected
                      ? "border-norma-royal ring-2 ring-norma-royal/30"
                      : "border-norma-border hover:border-[#2a9d8f]/70 hover:shadow-norma-md"
                  }`}
                >
                  <div
                    aria-hidden
                    className="h-14 bg-[linear-gradient(135deg,#0b2a32_0%,#1a6b7a_55%,#e85d04_140%)]"
                  />
                  <button
                    type="button"
                    className="flex w-full -mt-7 items-start gap-3 px-4 text-left"
                    onClick={() => onSelect(person.id)}
                    aria-pressed={selected}
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-norma-surface bg-norma-accent-soft text-base font-semibold text-norma-royal shadow-norma-sm"
                    >
                      {initials(person.fullName)}
                    </span>
                    <span className="min-w-0 flex-1 pt-8">
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
                      {person.managerName ? (
                        <span className="mt-1 block truncate text-xs text-norma-ink-muted">
                          Reports to {person.managerName}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-xs text-norma-ink-subtle">
                        {person.directReports ?? 0} direct{" "}
                        {(person.directReports ?? 0) === 1
                          ? "report"
                          : "reports"}
                      </span>
                    </span>
                  </button>
                  <div className="mt-auto flex gap-3 border-t border-norma-border px-4 py-3">
                    <button
                      type="button"
                      className="text-xs font-semibold text-norma-royal hover:underline"
                      onClick={() => onSelect(person.id)}
                    >
                      Open profile
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
