import { describe, expect, it } from "vitest";
import {
  computeDataHealth,
  isIncompletePerson,
  personHasManagerMissing,
  type HealthPerson,
} from "@/lib/org/data-health";

function person(
  partial: Partial<HealthPerson> & { id: string },
): HealthPerson {
  return {
    id: partial.id,
    fullName: partial.fullName !== undefined ? partial.fullName : partial.id,
    jobTitle: partial.jobTitle !== undefined ? partial.jobTitle : "Role",
    department: partial.department !== undefined ? partial.department : "Dept",
    country: partial.country !== undefined ? partial.country : "US",
    managerEmploymentId:
      partial.managerEmploymentId !== undefined
        ? partial.managerEmploymentId
        : null,
    inCycle: partial.inCycle,
  };
}

describe("data health helpers", () => {
  it("flags incomplete fields and missing managers", () => {
    const incomplete = person({
      id: "a",
      jobTitle: null,
      department: null,
      country: null,
    });
    expect(isIncompletePerson(incomplete)).toBe(true);

    const byId = new Map([
      ["a", person({ id: "a" })],
      ["b", person({ id: "b", managerEmploymentId: "gone" })],
    ]);
    expect(personHasManagerMissing(byId.get("b")!, byId)).toBe(true);
    expect(personHasManagerMissing(byId.get("a")!, byId)).toBe(false);
  });

  it("builds actionable lists and multi-root signal", () => {
    const report = computeDataHealth(
      [
        person({ id: "ceo", managerEmploymentId: null }),
        person({ id: "orphan", managerEmploymentId: "missing-mgr" }),
        person({
          id: "cycle-a",
          managerEmploymentId: "cycle-b",
          inCycle: true,
        }),
        person({
          id: "cycle-b",
          managerEmploymentId: "cycle-a",
          inCycle: true,
        }),
        person({
          id: "thin",
          managerEmploymentId: "ceo",
          jobTitle: null,
          department: "Eng",
          country: "US",
        }),
      ],
      { orphanManagerIds: ["missing-mgr"], lastSyncedAt: "2026-07-24T12:00:00Z" },
    );

    expect(report.headcount).toBe(5);
    expect(report.multiRoot).toBe(true);
    expect(report.managerMissing.map((p) => p.id)).toEqual(["orphan"]);
    expect(report.noManagerOnFile.map((p) => p.id)).toEqual(["ceo"]);
    expect(report.inCycle.map((p) => p.id).sort()).toEqual(["cycle-a", "cycle-b"]);
    expect(report.incompleteFields.map((p) => p.id)).toContain("thin");
    expect(report.orphanManagerIds).toContain("missing-mgr");
    expect(report.lastSyncedAt).toBe("2026-07-24T12:00:00Z");
  });
});
