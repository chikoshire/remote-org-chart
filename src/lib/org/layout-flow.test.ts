import { describe, expect, it } from "vitest";
import { layoutOrgChart, pathIdsToRoot } from "@/lib/org/layout-flow";

describe("layoutOrgChart", () => {
  it("places root above reports and wires reporting edges", () => {
    const { nodes, edges } = layoutOrgChart([
      {
        id: "root",
        fullName: "Root",
        jobTitle: "CEO",
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
            id: "child",
            fullName: "Child",
            jobTitle: "IC",
            department: null,
            departmentId: null,
            status: "active",
            country: null,
            workEmail: null,
            managerEmploymentId: "root",
            inCycle: false,
            directReports: 0,
            children: [],
          },
        ],
      },
    ]);

    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
    expect(edges[0]?.source).toBe("root");
    expect(edges[0]?.target).toBe("child");
    const root = nodes.find((n) => n.id === "root")!;
    const child = nodes.find((n) => n.id === "child")!;
    expect(root.position.y).toBeLessThan(child.position.y);
    expect(root.data.variant).toBe("root");
  });
});

describe("pathIdsToRoot", () => {
  it("walks manager chain to the root", () => {
    const byId = new Map([
      ["a", { id: "a", managerEmploymentId: null }],
      ["b", { id: "b", managerEmploymentId: "a" }],
      ["c", { id: "c", managerEmploymentId: "b" }],
    ]);
    expect([...pathIdsToRoot("c", byId)].sort()).toEqual(["a", "b", "c"]);
  });
});
