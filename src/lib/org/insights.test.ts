import { describe, expect, it } from "vitest";
import { computeOrgInsights } from "@/lib/org/insights";
import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

function person(
  partial: Partial<OrgChartPayloadNode> & { id: string },
): OrgChartPayloadNode {
  return {
    fullName: partial.fullName ?? partial.id,
    jobTitle: partial.jobTitle ?? null,
    department: partial.department ?? null,
    departmentId: null,
    status: "active",
    country: partial.country ?? null,
    workEmail: null,
    managerEmploymentId: partial.managerEmploymentId ?? null,
    inCycle: partial.inCycle ?? false,
    directReports: partial.directReports ?? (partial.children?.length ?? 0),
    children: partial.children ?? [],
    ...partial,
  };
}

describe("computeOrgInsights", () => {
  it("returns zeros for an empty forest", () => {
    expect(computeOrgInsights([])).toEqual({
      headcount: 0,
      rootCount: 0,
      maxDepth: 0,
      avgSpanOfControl: null,
      medianSpanOfControl: null,
      managerCount: 0,
      individualContributorCount: 0,
      cycleMemberCount: 0,
      departmentCount: 0,
      countryCount: 0,
    });
  });

  it("computes depth, span, and department diversity", () => {
    const forest = [
      person({
        id: "ceo",
        department: "Exec",
        country: "USA",
        directReports: 2,
        children: [
          person({
            id: "eng",
            department: "Engineering",
            country: "GBR",
            managerEmploymentId: "ceo",
            directReports: 1,
            children: [
              person({
                id: "ic",
                department: "Engineering",
                country: "GBR",
                managerEmploymentId: "eng",
                directReports: 0,
              }),
            ],
          }),
          person({
            id: "sales",
            department: "Sales",
            country: "USA",
            managerEmploymentId: "ceo",
            directReports: 0,
          }),
        ],
      }),
    ];

    const insights = computeOrgInsights(forest);
    expect(insights.headcount).toBe(4);
    expect(insights.rootCount).toBe(1);
    expect(insights.maxDepth).toBe(3);
    expect(insights.managerCount).toBe(2);
    expect(insights.individualContributorCount).toBe(2);
    expect(insights.avgSpanOfControl).toBe(1.5);
    expect(insights.medianSpanOfControl).toBe(1.5);
    expect(insights.departmentCount).toBe(3);
    expect(insights.countryCount).toBe(2);
  });

  it("counts cycle members", () => {
    const insights = computeOrgInsights([
      person({ id: "a", inCycle: true, directReports: 0 }),
      person({ id: "b", inCycle: true, directReports: 0 }),
    ]);
    expect(insights.cycleMemberCount).toBe(2);
    expect(insights.rootCount).toBe(2);
  });
});
