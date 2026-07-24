import { formatCountryLabel } from "@/lib/ui/format-country";
import { isIncompletePerson } from "@/lib/org/data-health";
import { PersonAvatar } from "@/components/org/PersonAvatar";
import { personNameMorphName } from "@/lib/ui/motion";

export type PersonNodeVariant = "default" | "selected" | "path" | "root";

export type PersonNodeData = {
  id?: string;
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  country: string | null;
  directReports: number;
  inCycle?: boolean;
  managerMissing?: boolean;
  incompleteFields?: boolean;
  avatarUrl?: string | null;
  variant?: PersonNodeVariant;
  density?: "comfortable" | "compact";
  collapsed?: boolean;
  collapsedCount?: number;
  /** Set by canvas — toggles subtree collapse for managers. */
  onToggleCollapse?: () => void;
  /** Owns shared-element morph when this node is the transition source. */
  morphActive?: boolean;
};

const variantClass: Record<PersonNodeVariant, string> = {
  default:
    "border-norma-border/80 bg-norma-surface/95 shadow-norma-sm hover:border-norma-ink/20 hover:shadow-norma-md",
  selected:
    "border-norma-ink bg-norma-peach/50 shadow-[0_0_0_2px_rgb(18_18_18/0.14),0_8px_24px_rgb(18_18_18/0.08)]",
  path: "border-norma-lavender bg-norma-lavender/70 shadow-norma-sm",
  root: "border-norma-ink/30 bg-norma-mint/60 shadow-norma-md ring-1 ring-norma-ink/10",
};

export function PersonNodeCard({
  id,
  fullName,
  jobTitle,
  department,
  country,
  directReports,
  inCycle = false,
  managerMissing = false,
  incompleteFields,
  avatarUrl = null,
  variant = "default",
  density = "comfortable",
  collapsed = false,
  collapsedCount = 0,
  onToggleCollapse,
  morphActive = false,
}: PersonNodeData) {
  const name = fullName?.trim() || "Unknown person";
  const compact = density === "compact";
  const countryLabel = formatCountryLabel(country);
  const incomplete =
    incompleteFields ??
    isIncompletePerson({
      id: "card",
      fullName,
      jobTitle,
      department,
      country,
      managerEmploymentId: null,
    });
  const titleLabel = jobTitle?.trim() || "Not set";
  const reportsLabel =
    directReports === 1 ? "1 report" : `${directReports} reports`;
  const accessibleName = [
    name,
    titleLabel,
    department?.trim() || null,
    countryLabel,
    directReports === 1
      ? "1 direct report"
      : `${directReports} direct reports`,
    collapsed ? `${collapsedCount} hidden in collapsed branch` : null,
    inCycle ? "reporting cycle" : null,
    managerMissing ? "manager missing" : null,
    incomplete ? "incomplete fields" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      aria-label={accessibleName}
      className={`selection-fade relative overflow-hidden rounded-norma-lg border ${
        compact ? "w-[190px] px-3 py-3" : "w-[260px] px-4 py-4"
      } ${variantClass[variant]}`}
      data-variant={variant}
      data-density={density}
      data-in-cycle={inCycle ? "true" : "false"}
      data-manager-missing={managerMissing ? "true" : "false"}
      data-incomplete={incomplete ? "true" : "false"}
    >
      <div className="flex items-start gap-3">
        <PersonAvatar
          personId={id || fullName || "person"}
          fullName={fullName}
          department={department}
          avatarUrl={avatarUrl}
          size={compact ? "sm" : "md"}
          className="mt-0.5"
          morph={morphActive}
        />
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate font-[family-name:var(--font-norma-display)] font-semibold tracking-tight text-norma-ink ${
              compact ? "text-xs" : "text-[15px] leading-snug"
            }`}
            style={
              morphActive && id
                ? { viewTransitionName: personNameMorphName(id) }
                : undefined
            }
            data-morph-name={morphActive && id ? id : undefined}
          >
            {name}
          </h3>
          <p
            className={`mt-0.5 truncate text-norma-ink-muted ${
              compact ? "text-[10px]" : "text-xs leading-relaxed"
            }`}
          >
            {titleLabel}
          </p>
          {!compact ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {department?.trim() ? (
                <span className="max-w-full truncate rounded-norma-sm bg-norma-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-norma-ink">
                  {department.trim()}
                </span>
              ) : (
                <span className="rounded-norma-sm bg-norma-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-norma-ink-muted">
                  Dept not set
                </span>
              )}
              {countryLabel ? (
                <span className="truncate text-[11px] text-norma-ink-subtle">
                  {countryLabel}
                </span>
              ) : (
                <span className="truncate text-[11px] text-norma-ink-muted">
                  Country not set
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div
        className={`mt-3 flex items-center justify-between gap-2 border-t border-norma-border/60 ${
          compact ? "pt-2" : "pt-2.5"
        }`}
      >
        <span
          className={`inline-flex items-center rounded-norma-sm font-semibold text-norma-ink ${
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
          {managerMissing ? (
            <span className="rounded-norma-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900">
              Unlinked
            </span>
          ) : null}
          {incomplete ? (
            <span className="rounded-norma-sm bg-norma-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-norma-ink-muted">
              Incomplete
            </span>
          ) : null}
          {directReports > 0 && onToggleCollapse ? (
            <button
              type="button"
              className="nodrag nopan rounded-norma-sm border border-norma-border bg-norma-surface px-1.5 py-0.5 text-[10px] font-medium text-norma-ink hover:border-norma-royal"
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
