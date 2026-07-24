import {
  computeDataHealth,
  isIncompletePerson,
  type HealthPerson,
} from "@/lib/org/data-health";

export type DashboardPerson = HealthPerson & {
  directReports?: number;
};

export type DashboardInsights = {
  headcount: number;
  departmentCount: number;
  managerCount: number;
  individualContributorCount: number;
  largestDepartment: { name: string; count: number } | null;
  managerMissingCount: number;
  rootCount: number;
  /** 0–100 share of people with title, department, and country. */
  completenessScore: number;
  lastSyncedAt: string | null;
  cycleMemberCount: number;
};

/** Org intelligence metrics from a flat employment snapshot (no Remote writes). */
export function computeDashboardInsights(
  people: DashboardPerson[],
  options?: { lastSyncedAt?: string | null },
): DashboardInsights {
  const health = computeDataHealth(people, {
    lastSyncedAt: options?.lastSyncedAt ?? null,
  });

  const deptCounts = new Map<string, number>();
  let managerCount = 0;
  for (const person of people) {
    const dept = person.department?.trim();
    if (dept) {
      deptCounts.set(dept, (deptCounts.get(dept) ?? 0) + 1);
    }
    if ((person.directReports ?? 0) > 0) {
      managerCount += 1;
    }
  }

  let largestDepartment: DashboardInsights["largestDepartment"] = null;
  for (const [name, count] of deptCounts) {
    if (!largestDepartment || count > largestDepartment.count) {
      largestDepartment = { name, count };
    }
  }

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
    rootCount: health.rootCount,
    completenessScore,
    lastSyncedAt: health.lastSyncedAt,
    cycleMemberCount: health.inCycle.length,
  };
}
