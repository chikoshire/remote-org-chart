import { describe, expect, it } from "vitest";
import {
  applyCollapseToForest,
  countDescendants,
  densityMetrics,
} from "@/lib/org/collapse";
import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

const sample: OrgChartPayloadNode[] = [
  {
    id: "a",
    fullName: "A",
    jobTitle: "Root",
    department: null,
    departmentId: null,
    status: "active",
    country: null,
    workEmail: null,
    managerEmploymentId: null,
    inCycle: false,
    directReports: 1,
    children: [
      {
        id: "b",
        fullName: "B",
        jobTitle: "Mgr",
        department: null,
        departmentId: null,
        status: "active",
        country: null,
        workEmail: null,
        managerEmploymentId: "a",
        inCycle: false,
        directReports: 1,
        children: [
          {
            id: "c",
            fullName: "C",
            jobTitle: "IC",
            department: null,
            departmentId: null,
            status: "active",
            country: null,
            workEmail: null,
            managerEmploymentId: "b",
            inCycle: false,
            directReports: 0,
            children: [],
          },
        ],
      },
    ],
  },
];

describe("collapse + density", () => {
  it("counts descendants", () => {
    expect(countDescendants(sample[0]!.children ?? [])).toBe(2);
  });

  it("prunes children under collapsed managers and stamps count", () => {
    const pruned = applyCollapseToForest(sample, new Set(["b"]));
    const b = pruned[0]!.children![0] as OrgChartPayloadNode & {
      collapsedCount?: number;
    };
    expect(b.children).toEqual([]);
    expect(b.collapsedCount).toBe(1);
  });

  it("returns tighter metrics for compact density", () => {
    expect(densityMetrics("compact").width).toBeLessThan(
      densityMetrics("comfortable").width,
    );
  });
});
