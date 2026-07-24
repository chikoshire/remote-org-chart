import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const tree = readFileSync(
  join(process.cwd(), "src/components/org/OrgTreeList.tsx"),
  "utf8",
);
const canvas = readFileSync(
  join(process.cwd(), "src/components/org/OrgChartCanvas.tsx"),
  "utf8",
);

describe("OrgTreeList optional wow", () => {
  it("ships expand/collapse tree with chart toggle", () => {
    expect(tree).toContain("Organization tree list");
    expect(tree).toContain("aria-expanded");
    expect(canvas).toContain('viewMode === "tree"');
    expect(canvas).toContain('viewMode === "map"');
    expect(canvas).toContain("OrgTreeList");
    expect(canvas).toContain("OrgWorldMap");
    expect(canvas).toContain("Chart");
    expect(canvas).toContain("Tree");
  });
});
