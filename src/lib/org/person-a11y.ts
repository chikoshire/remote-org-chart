import type { PersonNodeData } from "@/components/org/PersonNodeCard";

/** Accessible name for a person node (screen readers + React Flow ariaLabel). */
export function personAccessibleName(data: PersonNodeData): string {
  const name = data.fullName?.trim() || "Unknown person";
  const title = data.jobTitle?.trim() || "No title";
  const dept = data.department?.trim();
  const country = data.country?.trim();
  const place = [dept, country].filter(Boolean).join(", ");
  const reports =
    data.directReports === 1
      ? "1 direct report"
      : `${data.directReports} direct reports`;
  const cycle = data.inCycle ? "; reporting cycle" : "";
  const role =
    data.variant === "root"
      ? "; organization root"
      : data.variant === "selected"
        ? "; selected"
        : data.variant === "path"
          ? "; on reporting path"
          : "";
  return place
    ? `${name}, ${title}, ${place}; ${reports}${role}${cycle}`
    : `${name}, ${title}; ${reports}${role}${cycle}`;
}
