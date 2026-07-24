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
    "border-norma-border/90 bg-norma-surface shadow-norma-sm hover:border-[#2a9d8f]/60 hover:shadow-norma-md",
  selected:
    "border-norma-royal bg-norma-surface shadow-norma-md ring-2 ring-norma-royal/35",
  path: "border-[#2a9d8f] bg-[#e8f6f3] shadow-norma-sm",
  root: "border-[#e85d04] bg-white shadow-norma-md ring-1 ring-[#e85d04]/25",
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
  const metaLine = [department, countryLabel].filter(Boolean).join(" · ") || "—";
  const reportsLabel =
    directReports === 1 ? "1 direct report" : `${directReports} direct reports`;
  const accessibleName = [
    name,
    jobTitle?.trim() || "No title",
    metaLine !== "—" ? metaLine : null,
    reportsLabel,
    collapsed ? `${collapsedCount} hidden in collapsed branch` : null,
    inCycle ? "reporting cycle" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      aria-label={accessibleName}
      className={`relative overflow-hidden rounded-norma-md border transition-[border-color,box-shadow,background-color,transform] duration-200 ease-out motion-safe:data-[variant=selected]:scale-[1.02] ${
        compact ? "w-[180px] px-2.5 py-2.5" : "w-[240px] px-3.5 py-3.5"
      } ${variantClass[variant]}`}
      data-variant={variant}
      data-density={density}
      data-in-cycle={inCycle ? "true" : "false"}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 ${
          isRoot || variant === "selected"
            ? "bg-norma-royal"
            : variant === "path"
              ? "bg-[#2a9d8f]"
              : "bg-[#2a9d8f]/50"
        }`}
      />
      <div className="flex items-start gap-3 pl-1">
        <span
          aria-hidden
          className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            compact ? "h-8 w-8" : "h-10 w-10"
          } bg-norma-accent-soft text-norma-royal`}
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
            <p className="mt-1.5 truncate text-[11px] leading-relaxed text-norma-ink-subtle">
              {metaLine}
            </p>
          ) : null}
        </div>
      </div>
      <div
        className={`mt-3 flex items-center justify-between gap-2 border-t border-norma-border/70 pl-1 ${
          compact ? "pt-1.5" : "pt-2"
        }`}
      >
        <span className="text-[11px] text-norma-ink-subtle">
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
              className="nodrag nopan rounded-norma-sm border border-norma-border bg-norma-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-norma-prussian hover:border-norma-royal"
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
