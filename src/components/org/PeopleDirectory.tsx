"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PersonAvatar } from "@/components/org/PersonAvatar";
import { isIncompletePerson } from "@/lib/org/data-health";
import { departmentAccent } from "@/lib/ui/department-accent";
import { formatCountryLabel } from "@/lib/ui/format-country";
import { personMorphName } from "@/lib/ui/motion";

export type DirectoryPerson = {
  id: string;
  fullName?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  directReports?: number;
  managerEmploymentId: string | null;
  managerName?: string | null;
};

type DirectoryView = "grid" | "list";

type PeopleDirectoryProps = {
  people: DirectoryPerson[];
  selectedId: string | null;
  /** Optional controlled query; when omitted, directory owns search. */
  query?: string;
  onQueryChange?: (query: string) => void;
  onSelect: (id: string) => void;
  onOpenInChart: (id: string) => void;
};

function sortKey(person: DirectoryPerson): string {
  return (person.fullName ?? "").trim().toLocaleLowerCase() || person.id;
}

export function PeopleDirectory({
  people,
  selectedId,
  query: controlledQuery,
  onQueryChange,
  onSelect,
  onOpenInChart,
}: PeopleDirectoryProps) {
  const searchParams = useSearchParams();
  const [localQuery, setLocalQuery] = useState("");
  const [deptOnly, setDeptOnly] = useState<string | "all">("all");
  const [incompleteOnly, setIncompleteOnly] = useState(
    () => searchParams.get("incomplete") === "1",
  );
  const [view, setView] = useState<DirectoryView>("grid");
  const query = controlledQuery ?? localQuery;
  const setQuery = onQueryChange ?? setLocalQuery;

  useEffect(() => {
    if (searchParams.get("incomplete") === "1") {
      setIncompleteOnly(true);
    }
  }, [searchParams]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const p of people) {
      if (p.department?.trim()) set.add(p.department.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [people]);

  const incompleteCount = useMemo(
    () =>
      people.filter((p) =>
        isIncompletePerson({
          id: p.id,
          fullName: p.fullName ?? null,
          jobTitle: p.jobTitle ?? null,
          department: p.department ?? null,
          country: p.country ?? null,
          managerEmploymentId: p.managerEmploymentId,
        }),
      ).length,
    [people],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return people
      .filter((p) => {
        if (deptOnly !== "all" && (p.department?.trim() ?? "") !== deptOnly) {
          return false;
        }
        if (
          incompleteOnly &&
          !isIncompletePerson({
            id: p.id,
            fullName: p.fullName ?? null,
            jobTitle: p.jobTitle ?? null,
            department: p.department ?? null,
            country: p.country ?? null,
            managerEmploymentId: p.managerEmploymentId,
          })
        ) {
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
  }, [deptOnly, incompleteOnly, people, query]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <div className="relative z-40 border-b border-norma-border/80 bg-white/90 px-4 py-4 backdrop-blur-sm md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-norma-display)] text-xl font-semibold tracking-tight text-norma-prussian md:text-2xl">
              People
            </h1>
            <p className="mt-1 text-sm text-norma-ink-muted">
              {filtered.length}{" "}
              {filtered.length === 1 ? "person" : "people"}
              {deptOnly !== "all" ? ` in ${deptOnly}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div
              className="flex items-center gap-0.5 rounded-norma-md border border-norma-border bg-norma-surface-muted/60 p-1"
              role="group"
              aria-label="Directory layout"
            >
              <button
                type="button"
                aria-pressed={view === "grid"}
                className={`rounded-norma-sm px-3 py-1.5 text-[11px] font-semibold tracking-wide ${
                  view === "grid"
                    ? "bg-[#e85d04] text-white shadow-norma-sm"
                    : "text-norma-ink-muted hover:text-norma-prussian"
                }`}
                onClick={() => setView("grid")}
              >
                Grid
              </button>
              <button
                type="button"
                aria-pressed={view === "list"}
                className={`rounded-norma-sm px-3 py-1.5 text-[11px] font-semibold tracking-wide ${
                  view === "list"
                    ? "bg-[#e85d04] text-white shadow-norma-sm"
                    : "text-norma-ink-muted hover:text-norma-prussian"
                }`}
                onClick={() => setView("list")}
              >
                List
              </button>
            </div>
            <label className="flex flex-col gap-1 text-xs font-medium text-norma-ink-subtle">
              Department
              <select
                value={deptOnly}
                onChange={(e) =>
                  setDeptOnly(
                    e.target.value === "all" ? "all" : e.target.value,
                  )
                }
                className="min-w-[10rem] rounded-norma-md border border-norma-border bg-white px-2.5 py-2 text-sm font-normal text-norma-prussian shadow-norma-sm outline-none focus:border-norma-royal"
              >
                <option value="all">All departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-xs font-medium text-norma-ink-muted">
              <input
                type="checkbox"
                checked={incompleteOnly}
                onChange={(e) => setIncompleteOnly(e.target.checked)}
                className="rounded border-norma-border text-norma-royal focus:ring-norma-royal"
              />
              Incomplete
              {incompleteCount > 0 ? (
                <span className="rounded-norma-sm bg-norma-surface-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-norma-prussian">
                  {incompleteCount}
                </span>
              ) : null}
            </label>
          </div>
        </div>
        <label className="mt-3 block">
          <span className="sr-only">Filter this directory</span>
          <input
            type="search"
            role="combobox"
            aria-label="Filter this directory"
            aria-expanded={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, title, or department…"
            className="w-full rounded-norma-md border border-norma-border bg-white px-3.5 py-2.5 text-sm text-norma-ink shadow-norma-sm outline-none focus:border-norma-royal"
            autoComplete="off"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-norma-ink-muted">
          No people match this directory filter.
        </p>
      ) : view === "grid" ? (
        <ul
          className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4 sm:grid-cols-2 md:p-6 xl:grid-cols-3"
          aria-label="People directory"
        >
          {filtered.map((person) => (
            <li key={person.id}>
              <PersonCard
                person={person}
                selected={person.id === selectedId}
                layout="grid"
                onSelect={onSelect}
                onOpenInChart={onOpenInChart}
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul
          className="flex-1 divide-y divide-norma-border/70 overflow-auto"
          aria-label="People directory"
        >
          {filtered.map((person) => (
            <li key={person.id} className="px-4 md:px-6">
              <PersonCard
                person={person}
                selected={person.id === selectedId}
                layout="list"
                onSelect={onSelect}
                onOpenInChart={onOpenInChart}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PersonCard({
  person,
  selected,
  layout,
  onSelect,
  onOpenInChart,
}: {
  person: DirectoryPerson;
  selected: boolean;
  layout: DirectoryView;
  onSelect: (id: string) => void;
  onOpenInChart: (id: string) => void;
}) {
  const name = person.fullName?.trim() || "Unknown person";
  const accent = departmentAccent(person.department);
  const countryLabel = formatCountryLabel(person.country);
  const reports = person.directReports ?? 0;
  const isList = layout === "list";
  const incomplete = isIncompletePerson({
    id: person.id,
    fullName: person.fullName ?? null,
    jobTitle: person.jobTitle ?? null,
    department: person.department ?? null,
    country: person.country ?? null,
    managerEmploymentId: person.managerEmploymentId,
  });

  return (
    <article
      className={`relative flex overflow-hidden transition ${
        isList
          ? `flex-row items-center gap-3 border-b-0 py-3 ${
              selected ? "bg-norma-accent-soft/40" : ""
            }`
          : `h-full flex-col rounded-norma-lg border bg-white shadow-norma-sm ${
              selected
                ? "border-norma-royal ring-2 ring-norma-royal/25"
                : "border-norma-border hover:border-[#2a9d8f]/50 hover:shadow-norma-md"
            }`
      }`}
      style={
        selected
          ? undefined
          : { viewTransitionName: personMorphName(person.id) }
      }
      data-morph-person={person.id}
    >
      {!isList ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1.5"
          style={{ backgroundColor: accent }}
        />
      ) : null}
      <button
        type="button"
        className={`flex min-w-0 flex-1 items-start gap-3 text-left ${
          isList ? "py-1" : "w-full px-4 py-4 pl-5"
        }`}
        onClick={() => onSelect(person.id)}
        aria-pressed={selected}
      >
        <PersonAvatar
          personId={person.id}
          fullName={person.fullName}
          department={person.department}
          avatarUrl={person.avatarUrl}
          size={isList ? "sm" : "md"}
        />
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate font-[family-name:var(--font-norma-display)] font-semibold tracking-tight text-norma-prussian ${
              isList ? "text-sm" : "text-base"
            }`}
          >
            {name}
          </span>
          <span className="mt-0.5 block truncate text-sm text-norma-ink-muted">
            {person.jobTitle?.trim() || "No title"}
          </span>
          {isList ? (
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-norma-ink-subtle">
              <span className="truncate">
                {person.department?.trim() || "Not set"}
              </span>
              {countryLabel ? (
                <span className="truncate">{countryLabel}</span>
              ) : null}
              <span className="truncate">
                {person.managerName
                  ? `Reports to ${person.managerName}`
                  : "Top of reporting line"}
              </span>
              <span className="font-semibold text-norma-prussian">
                {reports === 1 ? "1 report" : `${reports} reports`}
              </span>
              {incomplete ? (
                <span className="font-semibold text-norma-ink-muted">
                  Incomplete
                </span>
              ) : null}
            </span>
          ) : (
            <>
              <span className="mt-2 flex flex-wrap items-center gap-1.5">
                {person.department?.trim() ? (
                  <span
                    className="max-w-full truncate rounded-norma-sm px-1.5 py-0.5 text-[10px] font-medium text-norma-prussian"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accent} 16%, white)`,
                    }}
                  >
                    {person.department.trim()}
                  </span>
                ) : null}
                {countryLabel ? (
                  <span className="truncate text-xs text-norma-ink-subtle">
                    {countryLabel}
                  </span>
                ) : null}
              </span>
              {person.managerName ? (
                <span className="mt-2 block truncate text-xs text-norma-ink-muted">
                  Reports to {person.managerName}
                </span>
              ) : (
                <span className="mt-2 block truncate text-xs text-norma-ink-subtle">
                  Top of reporting line
                </span>
              )}
              <span className="mt-2 inline-flex flex-wrap items-center gap-1.5">
                <span className="inline-flex rounded-norma-sm bg-norma-surface-muted px-2 py-0.5 text-[11px] font-semibold text-norma-prussian">
                  {reports === 1 ? "1 report" : `${reports} reports`}
                </span>
                {incomplete ? (
                  <span className="inline-flex rounded-norma-sm bg-norma-surface-muted px-2 py-0.5 text-[11px] font-semibold text-norma-ink-muted">
                    Incomplete
                  </span>
                ) : null}
              </span>
            </>
          )}
        </span>
      </button>
      <div
        className={`flex shrink-0 gap-3 ${
          isList
            ? "items-center"
            : "mt-auto gap-4 border-t border-norma-border/70 px-4 py-3 pl-5"
        }`}
      >
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
  );
}
