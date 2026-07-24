import {
  computeDataHealth,
  isIncompletePerson,
  type HealthPerson,
} from "@/lib/org/data-health";
import { formatCountryLabel } from "@/lib/ui/format-country";

export type DashboardPerson = HealthPerson & {
  directReports?: number;
};

export type NamedCount = { name: string; count: number };

export type DashboardManager = {
  id: string;
  fullName: string;
  jobTitle: string | null;
  department: string | null;
  directReports: number;
};

export type DashboardInsights = {
  headcount: number;
  departmentCount: number;
  managerCount: number;
  individualContributorCount: number;
  largestDepartment: NamedCount | null;
  managerMissingCount: number;
  incompleteCount: number;
  rootCount: number;
  /** 0-100 share of people with title, department, and country. */
  completenessScore: number;
  lastSyncedAt: string | null;
  cycleMemberCount: number;
  /** Departments by headcount (desc). */
  departments: NamedCount[];
  /** Countries by headcount (desc). */
  countries: NamedCount[];
  /** Managers with the most direct reports. */
  topManagers: DashboardManager[];
};

function sortNamedCounts(map: Map<string, number>): NamedCount[] {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Org intelligence metrics from a flat employment snapshot (no Remote writes). */
export function computeDashboardInsights(
  people: DashboardPerson[],
  options?: { lastSyncedAt?: string | null },
): DashboardInsights {
  const health = computeDataHealth(people, {
    lastSyncedAt: options?.lastSyncedAt ?? null,
  });

  const deptCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  let managerCount = 0;
  const managers: DashboardManager[] = [];

  for (const person of people) {
    const dept = person.department?.trim();
    if (dept) {
      deptCounts.set(dept, (deptCounts.get(dept) ?? 0) + 1);
    }
    const countryRaw = person.country?.trim();
    if (countryRaw) {
      const label = formatCountryLabel(countryRaw) || countryRaw;
      countryCounts.set(label, (countryCounts.get(label) ?? 0) + 1);
    }
    const reports = person.directReports ?? 0;
    if (reports > 0) {
      managerCount += 1;
      managers.push({
        id: person.id,
        fullName: person.fullName?.trim() || "Unknown person",
        jobTitle: person.jobTitle?.trim() || null,
        department: dept || null,
        directReports: reports,
      });
    }
  }

  const departments = sortNamedCounts(deptCounts);
  const countries = sortNamedCounts(countryCounts);
  const largestDepartment = departments[0] ?? null;

  managers.sort(
    (a, b) =>
      b.directReports - a.directReports ||
      a.fullName.localeCompare(b.fullName),
  );

  const complete = people.filter((p) => !isIncompletePerson(p)).length;
  const completenessScore =
    people.length === 0
      ? 100
      : Math.round((complete / people.length) * 100);

  return {
    headcount: health.headcount,
    departmentCount: deptCounts.size,
    managerCount,
    individualContributorCount: Math.max(0, health.headcount - managerCount),
    largestDepartment,
    managerMissingCount: health.managerMissing.length,
    incompleteCount: health.incompleteFields.length,
    rootCount: health.rootCount,
    completenessScore,
    lastSyncedAt: health.lastSyncedAt,
    cycleMemberCount: health.inCycle.length,
    departments,
    countries,
    topManagers: managers.slice(0, 6),
  };
}
