import type { HealthPerson } from "@/lib/org/data-health";

export const UNASSIGNED_DEPARTMENT = "Unassigned";

export type DepartmentPerson = HealthPerson & {
  directReports?: number;
};

export type DepartmentSummary = {
  name: string;
  headcount: number;
  lead: DepartmentPerson | null;
  people: DepartmentPerson[];
};

function sortPeople(a: DepartmentPerson, b: DepartmentPerson): number {
  return (a.fullName ?? a.id).localeCompare(b.fullName ?? b.id);
}

/** Pick lead: highest direct-report span; ties break by name. */
export function pickDepartmentLead(
  people: DepartmentPerson[],
): DepartmentPerson | null {
  if (people.length === 0) return null;
  return [...people].sort((a, b) => {
    const spanDiff = (b.directReports ?? 0) - (a.directReports ?? 0);
    if (spanDiff !== 0) return spanDiff;
    return sortPeople(a, b);
  })[0]!;
}

export function departmentKey(person: DepartmentPerson): string {
  const raw = person.department?.trim();
  return raw && raw.length > 0 ? raw : UNASSIGNED_DEPARTMENT;
}

/** Aggregate employments into department buckets (includes Unassigned). */
export function computeDepartments(
  people: DepartmentPerson[],
): DepartmentSummary[] {
  const buckets = new Map<string, DepartmentPerson[]>();
  for (const person of people) {
    const key = departmentKey(person);
    const list = buckets.get(key) ?? [];
    list.push(person);
    buckets.set(key, list);
  }

  const summaries: DepartmentSummary[] = [];
  for (const [name, members] of buckets) {
    const sorted = [...members].sort(sortPeople);
    summaries.push({
      name,
      headcount: sorted.length,
      lead: pickDepartmentLead(sorted),
      people: sorted,
    });
  }

  return summaries.sort((a, b) => {
    if (a.name === UNASSIGNED_DEPARTMENT) return 1;
    if (b.name === UNASSIGNED_DEPARTMENT) return -1;
    return a.name.localeCompare(b.name);
  });
}
