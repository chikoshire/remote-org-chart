export type PersonNodeVariant = "default" | "selected" | "path" | "root";

export type PersonNodeData = {
  fullName: string | null;
  jobTitle: string | null;
  department: string | null;
  country: string | null;
  directReports: number;
  inCycle?: boolean;
  variant?: PersonNodeVariant;
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
}: PersonNodeData) {
  const name = fullName?.trim() || "Unknown person";

  return (
    <article
      className={`w-[220px] rounded-norma-md border px-3 py-2.5 transition-colors ${variantClass[variant]}`}
      data-variant={variant}
      data-in-cycle={inCycle ? "true" : "false"}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            variant === "root"
              ? "bg-norma-prussian text-norma-ink-inverse"
              : "bg-norma-accent-soft text-norma-royal"
          }`}
        >
          {initials(fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-norma-prussian">
            {name}
          </h3>
          <p className="truncate text-xs text-norma-ink-muted">
            {jobTitle?.trim() || "No title"}
          </p>
          <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wide text-norma-ink-subtle">
            {[department, country].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-norma-border/70 pt-1.5">
        <span className="text-[11px] text-norma-ink-subtle">
          {directReports} direct
        </span>
        {inCycle ? (
          <span className="rounded-norma-sm bg-norma-danger-soft px-1.5 py-0.5 text-[10px] font-medium text-norma-danger">
            Cycle
          </span>
        ) : null}
      </div>
    </article>
  );
}
