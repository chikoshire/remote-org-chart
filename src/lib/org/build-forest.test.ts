import { describe, expect, it } from "vitest";
import { buildOrgForest, flattenOrgForest } from "@/lib/org";
import type { EmploymentRecord } from "@/lib/remote/employment-schema";

function emp(
  partial: Partial<EmploymentRecord> & Pick<EmploymentRecord, "id">,
): EmploymentRecord {
  return {
    fullName: partial.fullName ?? partial.id,
    jobTitle: partial.jobTitle ?? null,
    department: partial.department ?? null,
    departmentId: partial.departmentId ?? null,
    status: partial.status ?? "active",
    country: partial.country ?? null,
    workEmail: partial.workEmail ?? null,
    managerName: partial.managerName ?? null,
    managerEmploymentId: partial.managerEmploymentId ?? null,
    ...partial,
  };
}

describe("buildOrgForest", () => {
  it("builds a single-root tree", () => {
    const forest = buildOrgForest([
      emp({ id: "ceo", fullName: "Ceo" }),
      emp({ id: "a", fullName: "Ada", managerEmploymentId: "ceo" }),
      emp({ id: "b", fullName: "Bob", managerEmploymentId: "ceo" }),
      emp({ id: "c", fullName: "Cyd", managerEmploymentId: "a" }),
    ]);
    expect(forest.roots).toHaveLength(1);
    expect(forest.roots[0]?.id).toBe("ceo");
    expect(forest.roots[0]?.children.map((n) => n.id)).toEqual(["a", "b"]);
    expect(forest.roots[0]?.children[0]?.children.map((n) => n.id)).toEqual([
      "c",
    ]);
    expect(forest.nodeCount).toBe(4);
    expect(forest.cycleIds).toEqual([]);
  });

  it("supports multi-root forest", () => {
    const forest = buildOrgForest([
      emp({ id: "r1", fullName: "Root One" }),
      emp({ id: "r2", fullName: "Root Two" }),
      emp({ id: "x", fullName: "X", managerEmploymentId: "r1" }),
    ]);
    expect(forest.roots.map((r) => r.id).sort()).toEqual(["r1", "r2"]);
  });

  it("treats missing manager as root and records orphan id", () => {
    const forest = buildOrgForest([
      emp({ id: "orphan", fullName: "Orphan", managerEmploymentId: "gone" }),
    ]);
    expect(forest.roots).toHaveLength(1);
    expect(forest.roots[0]?.id).toBe("orphan");
    expect(forest.orphanManagerIds).toEqual(["gone"]);
  });

  it("marks self-manager as cycle + root", () => {
    const forest = buildOrgForest([
      emp({ id: "loop", fullName: "Loop", managerEmploymentId: "loop" }),
    ]);
    expect(forest.roots[0]?.inCycle).toBe(true);
    expect(forest.cycleIds).toContain("loop");
  });

  it("detects A→B→A cycles", () => {
    const forest = buildOrgForest([
      emp({ id: "a", fullName: "A", managerEmploymentId: "b" }),
      emp({ id: "b", fullName: "B", managerEmploymentId: "a" }),
    ]);
    expect(forest.cycleIds.sort()).toEqual(["a", "b"]);
    expect(flattenOrgForest(forest).every((n) => n.inCycle)).toBe(true);
  });

  it("handles empty input", () => {
    const forest = buildOrgForest([]);
    expect(forest.roots).toEqual([]);
    expect(forest.nodeCount).toBe(0);
  });
});
