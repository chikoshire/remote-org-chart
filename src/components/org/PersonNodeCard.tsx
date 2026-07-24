import { departmentAccent } from "@/lib/ui/department-accent";
import { formatCountryLabel } from "@/lib/ui/format-country";

export type PersonNodeVariant = "default" | "selected" | "path" | "root";

export type PersonNodeData = {
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  country: string | null;
  directReports: number;
  inCycle?: boolean;
  variant?: PersonNodeVariant;
  density?: "comfortable" | "compact";
  collapsed?: boolean;
  collapsedCount?: number;
  /** Set by canvas — toggles subtree collapse for managers. */
  onToggleCollapse?: () => void;
};

function initials(name: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

const variantClass: Record<PersonNodeVariant, string> = {
  default:
    "border-norma-border/90 bg-white shadow-norma-sm hover:border-[#2a9d8f]/55 hover:shadow-norma-md",
  selected:
    "border-norma-royal bg-white shadow-norma-md ring-2 ring-norma-royal/30",
  path: "border-[#2a9d8f]/80 bg-[#f0faf8] shadow-norma-sm",
  root: "border-[#e85d04]/70 bg-white shadow-norma-md ring-1 ring-[#e85d04]/20",
};

export function PersonNodeCard({
  fullName,
  jobTitle,
  department,
  country,
  directReports,
  inCycle = false,
  variant = "default",
  density = "comfortable",
  collapsed = false,
  collapsedCount = 0,
  onToggleCollapse,
}: PersonNodeData) {
  const name = fullName?.trim() || "Unknown person";
  const compact = density === "compact";
  const isRoot = variant === "root";
  const countryLabel = formatCountryLabel(country);
  const accent = departmentAccent(department);
  const reportsLabel =
    directReports === 1 ? "1 report" : `${directReports} reports`;
  const accessibleName = [
    name,
    jobTitle?.trim() || "No title",
    department?.trim() || null,
    countryLabel,
    directReports === 1
      ? "1 direct report"
      : `${directReports} direct reports`,
    collapsed ? `${collapsedCount} hidden in collapsed branch` : null,
    inCycle ? "reporting cycle" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      aria-label={accessibleName}
      className={`relative overflow-hidden rounded-norma-lg border transition-[border-color,box-shadow,background-color,transform] duration-200 ease-out motion-safe:data-[variant=selected]:scale-[1.02] ${
        compact ? "w-[190px] px-3 py-3" : "w-[260px] px-4 py-4"
      } ${variantClass[variant]}`}
      data-variant={variant}
      data-density={density}
      data-in-cycle={inCycle ? "true" : "false"}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{
          backgroundColor:
            isRoot || variant === "selected"
              ? "var(--norma-royal)"
              : variant === "path"
                ? "#2a9d8f"
                : accent,
        }}
      />
      <div className={`flex items-start gap-3 ${compact ? "pl-1" : "pl-1.5"}`}>
        <span
          aria-hidden
          className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-norma-sm ${
            compact ? "h-9 w-9 text-[11px]" : "h-11 w-11 text-sm"
          }`}
          style={{ backgroundColor: accent }}
        >
          {initials(fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate font-[family-name:var(--font-norma-display)] font-semibold tracking-tight text-norma-prussian ${
              compact ? "text-xs" : "text-[15px] leading-snug"
            }`}
          >
            {name}
          </h3>
          <p
            className={`mt-0.5 truncate text-norma-ink-muted ${
              compact ? "text-[10px]" : "text-xs leading-relaxed"
            }`}
          >
            {jobTitle?.trim() || "No title"}
          </p>
          {!compact ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {department?.trim() ? (
                <span
                  className="max-w-full truncate rounded-norma-sm px-1.5 py-0.5 text-[10px] font-medium text-norma-prussian"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accent} 16%, white)`,
                  }}
                >
                  {department.trim()}
                </span>
              ) : null}
              {countryLabel ? (
                <span className="truncate text-[11px] text-norma-ink-subtle">
                  {countryLabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div
        className={`mt-3 flex items-center justify-between gap-2 border-t border-norma-border/60 ${
          compact ? "pt-2 pl-1" : "pt-2.5 pl-1.5"
        }`}
      >
        <span
          className={`inline-flex items-center rounded-norma-sm font-semibold text-norma-prussian ${
            compact
              ? "bg-norma-surface-muted px-1.5 py-0.5 text-[10px]"
              : "bg-norma-surface-muted px-2 py-0.5 text-[11px]"
          }`}
        >
          {reportsLabel}
          {collapsed && collapsedCount > 0 ? ` · ${collapsedCount} hidden` : ""}
        </span>
        <div className="flex items-center gap-1">
          {variant === "selected" ? (
            <span className="rounded-norma-sm bg-norma-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-norma-royal">
              Profile
            </span>
          ) : null}
          {inCycle ? (
            <span className="rounded-norma-sm bg-norma-danger-soft px-1.5 py-0.5 text-[10px] font-medium text-norma-danger">
              Cycle
            </span>
          ) : null}
          {directReports > 0 && onToggleCollapse ? (
            <button
              type="button"
              className="nodrag nopan rounded-norma-sm border border-norma-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-norma-prussian hover:border-norma-royal"
              aria-expanded={!collapsed}
              aria-label={
                collapsed
                  ? `Expand ${collapsedCount} hidden reports`
                  : "Collapse reports"
              }
              onClick={(event) => {
                event.stopPropagation();
                onToggleCollapse();
              }}
            >
              {collapsed ? `+${collapsedCount || directReports}` : "−"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
