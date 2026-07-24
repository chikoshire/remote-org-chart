"use client";

import type { OrgInsights } from "@/lib/org/insights";

type OrgInsightsPanelProps = {
  insights: OrgInsights;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatSpan(value: number | null): string {
  if (value === null) return "Not set";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Docked insights body — open/close is owned by the side panel Tools. */
export function OrgInsightsPanel({
  insights,
  open,
  onOpenChange,
}: OrgInsightsPanelProps) {
  if (!open) return null;

  return (
    <section
      id="org-insights-panel"
      aria-label="Organization insights"
      className="rounded-norma-md border border-norma-border bg-norma-surface p-3 shadow-norma-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-norma-ink-subtle">
          Org insights
        </h2>
        <button
          type="button"
          className="text-[11px] font-medium text-norma-royal hover:underline"
          onClick={() => onOpenChange(false)}
        >
          Close
        </button>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-[11px] text-norma-ink-subtle">Headcount</dt>
          <dd className="font-semibold text-norma-prussian">
            {insights.headcount}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-norma-ink-subtle">Max depth</dt>
          <dd className="font-semibold text-norma-prussian">
            {insights.maxDepth}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-norma-ink-subtle">Roots</dt>
          <dd className="font-semibold text-norma-prussian">
            {insights.rootCount}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-norma-ink-subtle">Managers</dt>
          <dd className="font-semibold text-norma-prussian">
            {insights.managerCount}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-norma-ink-subtle">Avg span</dt>
          <dd className="font-semibold text-norma-prussian">
            {formatSpan(insights.avgSpanOfControl)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-norma-ink-subtle">Median span</dt>
          <dd className="font-semibold text-norma-prussian">
            {formatSpan(insights.medianSpanOfControl)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-norma-ink-subtle">Departments</dt>
          <dd className="font-semibold text-norma-prussian">
            {insights.departmentCount}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-norma-ink-subtle">Countries</dt>
          <dd className="font-semibold text-norma-prussian">
            {insights.countryCount}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[10px] leading-snug text-norma-ink-subtle">
        Span of control = direct reports for people who manage at least one
        person. Metrics follow the visible (filtered / collapsed) tree.
      </p>
    </section>
  );
}
