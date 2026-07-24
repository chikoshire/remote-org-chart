"use client";

import type { OrgFilters } from "@/lib/org/filters";
import { filtersAreActive } from "@/lib/org/filters";
import { DepartmentFilterSelect } from "@/components/org/DepartmentFilterSelect";

type OrgFiltersBarProps = {
  filters: OrgFilters;
  departments: string[];
  countries: string[];
  jobTitles: string[];
  onChange: (next: OrgFilters) => void;
  onReset: () => void;
};

export function OrgFiltersBar({
  filters,
  departments,
  countries,
  jobTitles,
  onChange,
  onReset,
}: OrgFiltersBarProps) {
  const active = filtersAreActive(filters);

  return (
    <div className="flex flex-col gap-2">
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
      <DepartmentFilterSelect
        size="sm"
        departments={departments}
        value={filters.department}
        onChange={(department) => onChange({ ...filters, department })}
      />
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
      <label className="flex flex-col gap-0.5 text-[11px] text-norma-ink-muted">
        Job title
        <select
          className="rounded-norma-sm border border-norma-border bg-norma-surface px-2 py-1.5 text-sm text-norma-prussian"
          value={filters.jobTitle ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              jobTitle: e.target.value || null,
            })
          }
        >
          <option value="">All titles</option>
          {jobTitles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
