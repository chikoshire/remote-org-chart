import { describe, expect, it } from "vitest";
import {
  computeDashboardInsights,
  type DashboardPerson,
} from "@/lib/org/dashboard-insights";

function person(
  partial: Partial<DashboardPerson> & { id: string },
): DashboardPerson {
  return {
    id: partial.id,
    fullName: partial.fullName !== undefined ? partial.fullName : partial.id,
    jobTitle: partial.jobTitle !== undefined ? partial.jobTitle : "Role",
    department: partial.department !== undefined ? partial.department : "Eng",
    country: partial.country !== undefined ? partial.country : "US",
    managerEmploymentId:
      partial.managerEmploymentId !== undefined
        ? partial.managerEmploymentId
        : null,
    directReports: partial.directReports,
    inCycle: partial.inCycle,
  };
}

describe("computeDashboardInsights", () => {
  it("summarises headcount, depts, managers, completeness, and missing managers", () => {
    const insights = computeDashboardInsights(
      [
        person({ id: "ceo", directReports: 2, department: "Exec" }),
        person({
          id: "a",
          managerEmploymentId: "ceo",
          directReports: 0,
          department: "Eng",
        }),
        person({
          id: "b",
          managerEmploymentId: "ceo",
          directReports: 0,
          department: "Eng",
        }),
        person({
          id: "orphan",
          managerEmploymentId: "gone",
          directReports: 0,
          department: "Sales",
          jobTitle: null,
        }),
      ],
      { lastSyncedAt: "2026-07-24T12:00:00Z" },
    );

    expect(insights.headcount).toBe(4);
    expect(insights.departmentCount).toBe(3);
    expect(insights.managerCount).toBe(1);
    expect(insights.individualContributorCount).toBe(3);
    expect(insights.largestDepartment).toEqual({ name: "Eng", count: 2 });
    expect(insights.managerMissingCount).toBe(1);
    expect(insights.rootCount).toBe(2);
    expect(insights.completenessScore).toBe(75);
    expect(insights.lastSyncedAt).toBe("2026-07-24T12:00:00Z");
    expect(insights.incompleteCount).toBe(1);
    expect(insights.departments[0]).toEqual({ name: "Eng", count: 2 });
    expect(insights.countries[0]?.count).toBeGreaterThanOrEqual(1);
    expect(insights.topManagers[0]?.id).toBe("ceo");
    expect(insights.topManagers[0]?.directReports).toBe(2);
  });
});
