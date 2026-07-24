import { departmentAccent } from "@/lib/ui/department-accent";

type DepartmentColorLegendProps = {
  departments: Array<string | null | undefined>;
  /** Max chips before “+N more”. */
  limit?: number;
  className?: string;
};

/** Quiet swatch row explaining avatar department colours. */
export function DepartmentColorLegend({
  departments,
  limit = 8,
  className = "",
}: DepartmentColorLegendProps) {
  const unique = Array.from(
    new Set(
      departments
        .map((d) => d?.trim())
        .filter((d): d is string => Boolean(d)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  if (unique.length === 0) return null;

  const shown = unique.slice(0, limit);
  const overflow = unique.length - shown.length;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${className}`}
      aria-label="Department colour key"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-norma-ink-muted">
        Departments
      </span>
      {shown.map((name) => (
        <span
          key={name}
          className="inline-flex items-center gap-1.5 text-[11px] text-norma-ink-muted"
        >
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: departmentAccent(name) }}
          />
          <span className="max-w-[9rem] truncate">{name}</span>
        </span>
      ))}
      {overflow > 0 ? (
        <span className="text-[11px] text-norma-ink-subtle">+{overflow} more</span>
      ) : null}
    </div>
  );
}
