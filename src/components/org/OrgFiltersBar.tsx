"use client";

import type { OrgFilters } from "@/lib/org/filters";
import { filtersAreActive } from "@/lib/org/filters";

type OrgFiltersBarProps = {
  filters: OrgFilters;
  departments: string[];
  countries: string[];
  onChange: (next: OrgFilters) => void;
  onReset: () => void;
};

export function OrgFiltersBar({
  filters,
  departments,
  countries,
  onChange,
  onReset,
}: OrgFiltersBarProps) {
  const active = filtersAreActive(filters);

  return (
    <div className="flex flex-col gap-1 rounded-norma-md border border-norma-border bg-norma-surface p-2 shadow-norma-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
          Filters
          {active ? (
            <span className="ml-2 rounded-norma-sm bg-norma-accent-soft px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-norma-royal">
              Active
            </span>
          ) : null}
        </p>
        {active ? (
          <button
            type="button"
            className="text-[11px] font-medium text-norma-royal hover:underline"
            onClick={onReset}
          >
            Reset
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        <label className="flex flex-col gap-0.5 text-[11px] text-norma-ink-muted">
          Department
          <select
            className="rounded-norma-sm border border-norma-border bg-norma-surface px-2 py-1.5 text-sm text-norma-prussian"
            value={filters.department ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                department: e.target.value || null,
              })
            }
          >
            <option value="">All departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5 text-[11px] text-norma-ink-muted">
          Country
          <select
            className="rounded-norma-sm border border-norma-border bg-norma-surface px-2 py-1.5 text-sm text-norma-prussian"
            value={filters.country ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                country: e.target.value || null,
              })
            }
          >
            <option value="">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
