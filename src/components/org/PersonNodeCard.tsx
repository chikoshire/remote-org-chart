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
    "border-norma-border bg-norma-surface shadow-norma-sm hover:border-norma-border-strong",
  selected:
    "border-norma-royal bg-norma-surface shadow-norma-md ring-2 ring-norma-royal/30",
  path: "border-norma-spray bg-norma-highlight-soft shadow-norma-sm",
  root: "border-norma-prussian bg-norma-surface shadow-norma-md",
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
  const accessibleName = [
    name,
    jobTitle?.trim() || "No title",
    [department, country].filter(Boolean).join(" · ") || null,
    `${directReports} direct report${directReports === 1 ? "" : "s"}`,
    collapsed ? `${collapsedCount} hidden in collapsed branch` : null,
    inCycle ? "reporting cycle" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      aria-label={accessibleName}
      className={`rounded-norma-md border transition-[border-color,box-shadow,background-color,transform] duration-200 ease-out motion-safe:data-[variant=selected]:scale-[1.02] ${
        compact ? "w-[168px] px-2 py-1.5" : "w-[220px] px-3 py-2.5"
      } ${variantClass[variant]}`}
      data-variant={variant}
      data-density={density}
      data-in-cycle={inCycle ? "true" : "false"}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            compact ? "h-7 w-7" : "h-9 w-9"
          } ${
            variant === "root"
              ? "bg-norma-prussian text-norma-ink-inverse"
              : "bg-norma-accent-soft text-norma-royal"
          }`}
        >
          {initials(fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate font-semibold text-norma-prussian ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {name}
          </h3>
          <p
            className={`truncate text-norma-ink-muted ${
              compact ? "text-[10px]" : "text-xs"
            }`}
          >
            {jobTitle?.trim() || "No title"}
          </p>
          {!compact ? (
            <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wide text-norma-ink-subtle">
              {[department, country].filter(Boolean).join(" · ") || "—"}
            </p>
          ) : null}
        </div>
      </div>
      <div
        className={`mt-2 flex items-center justify-between gap-2 border-t border-norma-border/70 ${
          compact ? "pt-1" : "pt-1.5"
        }`}
      >
        <span className="text-[11px] text-norma-ink-subtle">
          {directReports} direct
          {collapsed && collapsedCount > 0 ? ` · ${collapsedCount} hidden` : ""}
        </span>
        <div className="flex items-center gap-1">
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
