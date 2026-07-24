import { describe, expect, it } from "vitest";
import { cSuiteFocusNodeIds } from "@/lib/org/csuite-focus";
import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

function node(
  partial: Partial<OrgChartPayloadNode> & { id: string },
): OrgChartPayloadNode {
  return {
    id: partial.id,
    fullName: partial.fullName ?? partial.id,
    jobTitle: partial.jobTitle ?? null,
    department: partial.department ?? null,
    departmentId: null,
    status: "active",
    country: null,
    workEmail: null,
    avatarUrl: null,
    managerEmploymentId: partial.managerEmploymentId ?? null,
    inCycle: false,
    directReports: partial.children?.length ?? 0,
    children: partial.children ?? [],
  };
}

describe("cSuiteFocusNodeIds", () => {
  it("prefers roots then direct reports up to the cap", () => {
    const roots = [
      node({
        id: "ceo",
        children: [
          node({ id: "cto", managerEmploymentId: "ceo" }),
          node({ id: "cfo", managerEmploymentId: "ceo" }),
          node({ id: "cpo", managerEmploymentId: "ceo" }),
        ],
      }),
    ];
    expect(cSuiteFocusNodeIds(roots, 3)).toEqual(["ceo", "cto", "cfo"]);
  });
});
