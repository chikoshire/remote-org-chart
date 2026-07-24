import { describe, expect, it } from "vitest";
import {
  collectFilterOptions,
  filterOrgForest,
  filtersAreActive,
  type OrgFilters,
} from "@/lib/org/filters";
import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

function person(
  partial: Partial<OrgChartPayloadNode> & { id: string },
): OrgChartPayloadNode {
  return {
    fullName: partial.id,
    jobTitle: null,
    department: null,
    departmentId: null,
    status: "active",
    country: null,
    workEmail: null,
    managerEmploymentId: null,
    inCycle: false,
    directReports: partial.children?.length ?? 0,
    children: [],
    ...partial,
  };
}

const forest: OrgChartPayloadNode[] = [
  person({
    id: "ceo",
    department: "Exec",
    country: "USA",
    children: [
      person({
        id: "eng",
        department: "Engineering",
        country: "GBR",
        managerEmploymentId: "ceo",
        children: [
          person({
            id: "ic",
            department: "Engineering",
            country: "GBR",
            managerEmploymentId: "eng",
          }),
        ],
      }),
      person({
        id: "sales",
        department: "Sales",
        country: "USA",
        managerEmploymentId: "ceo",
      }),
    ],
  }),
];

describe("org filters", () => {
  it("detects active filters", () => {
    expect(filtersAreActive({ department: null, country: null })).toBe(false);
    expect(filtersAreActive({ department: "Sales", country: null })).toBe(true);
  });

  it("collects sorted options", () => {
    expect(collectFilterOptions(forest)).toEqual({
      departments: ["Engineering", "Exec", "Sales"],
      countries: ["GBR", "USA"],
    });
  });

  it("keeps matching nodes and ancestors for path continuity", () => {
    const filters: OrgFilters = { department: "Engineering", country: null };
    const filtered = filterOrgForest(forest, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.id).toBe("ceo");
    expect(filtered[0]!.children).toHaveLength(1);
    expect(filtered[0]!.children![0]!.id).toBe("eng");
    expect(filtered[0]!.children![0]!.children![0]!.id).toBe("ic");
  });

  it("returns empty when nothing matches", () => {
    expect(
      filterOrgForest(forest, { department: "Legal", country: null }),
    ).toEqual([]);
  });
});
