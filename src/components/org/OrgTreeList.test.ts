import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { collectIdsToDepth } from "@/components/org/OrgTreeList";
import type { OrgChartPayloadNode } from "@/lib/org/layout-flow";

const tree = readFileSync(
  join(process.cwd(), "src/components/org/OrgTreeList.tsx"),
  "utf8",
);
const canvas = readFileSync(
  join(process.cwd(), "src/components/org/OrgChartCanvas.tsx"),
  "utf8",
);

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

describe("OrgTreeList optional wow", () => {
  it("ships expand/collapse tree with chart toggle", () => {
    expect(tree).toContain("Organization tree list");
    expect(tree).toContain("aria-expanded");
    expect(tree).toContain("left to right hierarchy");
    expect(tree).toContain("Tree density");
    expect(tree).toContain("collectIdsToDepth");
    expect(canvas).toContain('viewMode === "tree"');
    expect(canvas).toContain('viewMode === "map"');
    expect(canvas).toContain("OrgTreeList");
    expect(canvas).toContain("OrgWorldMap");
    expect(canvas).toContain("Chart");
    expect(canvas).toContain("Tree");
  });

  it("defaults expansion to two levels of managers", () => {
    const forest = [
      node({
        id: "root",
        children: [
          node({
            id: "mgr",
            children: [node({ id: "leaf" })],
          }),
          node({ id: "solo" }),
        ],
      }),
    ];
    expect(collectIdsToDepth(forest, 1).sort()).toEqual(["mgr", "root"]);
    expect(collectIdsToDepth(forest, 0)).toEqual(["root"]);
  });
});
