"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  computeDepartments,
  type DepartmentPerson,
} from "@/lib/org/departments";
import { departmentAccent } from "@/lib/ui/department-accent";
import { formatCountryLabel } from "@/lib/ui/format-country";
import { personMorphName } from "@/lib/ui/motion";
import { PersonAvatar } from "@/components/org/PersonAvatar";

/** Directory-shaped person; normalized before department aggregation. */
export type DepartmentsBrowsePerson = {
  id: string;
  fullName?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  directReports?: number;
  managerEmploymentId: string | null;
  inCycle?: boolean;
};

type DepartmentsBrowseProps = {
  people: DepartmentsBrowsePerson[];
  selectedId: string | null;
  query: string;
  onSelect: (id: string) => void;
  onOpenInChart: (id: string) => void;
};

function toDepartmentPerson(person: DepartmentsBrowsePerson): DepartmentPerson {
  return {
    id: person.id,
    fullName: person.fullName ?? null,
    jobTitle: person.jobTitle ?? null,
    department: person.department ?? null,
    country: person.country ?? null,
    avatarUrl: person.avatarUrl ?? null,
    directReports: person.directReports,
    managerEmploymentId: person.managerEmploymentId,
    inCycle: person.inCycle,
  };
}

export function DepartmentsBrowse({
  people,
  selectedId,
  query,
  onSelect,
  onOpenInChart,
}: DepartmentsBrowseProps) {
  const departments = useMemo(
    () => computeDepartments(people.map(toDepartmentPerson)),
    [people],
  );
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const q = query.trim().toLocaleLowerCase();

  const visibleDepartments = useMemo(() => {
    if (!q) return departments;
    return departments.filter((dept) => {
      if (dept.name.toLocaleLowerCase().includes(q)) return true;
      return dept.people.some((person) => {
        const hay = [person.fullName, person.jobTitle, person.country]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        return hay.includes(q);
      });
    });
  }, [departments, q]);

  useEffect(() => {
    if (
      selectedDept &&
      visibleDepartments.some((d) => d.name === selectedDept)
    ) {
      return;
    }
    setSelectedDept(visibleDepartments[0]?.name ?? null);
  }, [selectedDept, visibleDepartments]);

  const active =
    visibleDepartments.find((d) => d.name === selectedDept) ??
    visibleDepartments[0] ??
    null;

  const activePeople = useMemo(() => {
    if (!active) return [];
    if (!q) return active.people;
    return active.people.filter((person) => {
      const hay = [
        person.fullName,
        person.jobTitle,
        person.department,
        person.country,
        active.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return hay.includes(q);
    });
  }, [active, q]);

  const accent = departmentAccent(
    active?.name === "Unassigned" ? null : active?.name,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <aside className="flex max-h-[40%] w-full shrink-0 flex-col border-b border-norma-border bg-norma-surface/90 md:max-h-none md:w-72 md:border-b-0 md:border-r">
        <div className="border-b border-norma-border px-4 py-3">
          <p className="text-xs font-medium text-norma-ink-subtle">
            {visibleDepartments.length}{" "}
            {visibleDepartments.length === 1 ? "department" : "departments"}
          </p>
        </div>
        <ul
          className="min-h-0 flex-1 overflow-auto p-2"
          aria-label="Departments"
        >
          {visibleDepartments.map((dept) => {
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

      <div className="min-h-0 flex-1 overflow-auto">
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
                  {activePeople.length}{" "}
                  {activePeople.length === 1 ? "person" : "people"}
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

            {activePeople.length === 0 ? (
              <p className="mt-8 text-center text-sm text-norma-ink-muted">
                No people match this search in {active.name}.
              </p>
            ) : (
              <ul
                className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                aria-label={`${active.name} people`}
              >
                {activePeople.map((person) => {
                  const name = person.fullName?.trim() || "Unknown person";
                  const countryLabel = formatCountryLabel(person.country);
                  const isLead = active.lead?.id === person.id;
                  const isSelected = selectedId === person.id;
                  return (
                    <li key={person.id}>
                      <article
                        className="relative flex h-full flex-col overflow-hidden rounded-norma-lg border border-norma-border bg-white shadow-norma-sm"
                        style={
                          isSelected
                            ? undefined
                            : {
                                viewTransitionName: personMorphName(person.id),
                              }
                        }
                        data-morph-person={person.id}
                      >
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-1.5"
                          style={{ backgroundColor: accent }}
                        />
                        <button
                          type="button"
                          className="flex w-full items-start gap-3 px-4 py-4 pl-5 text-left"
                          onClick={() => onSelect(person.id)}
                        >
                          <PersonAvatar
                            personId={person.id}
                            fullName={person.fullName}
                            department={person.department}
                            avatarUrl={person.avatarUrl}
                            size="md"
                          />
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
        ) : (
          <p className="px-4 py-12 text-center text-sm text-norma-ink-muted">
            No departments match this search.
          </p>
        )}
      </div>
    </div>
  );
}
