import { describe, expect, it } from "vitest";
import {
  computeDepartments,
  pickDepartmentLead,
  UNASSIGNED_DEPARTMENT,
  type DepartmentPerson,
} from "@/lib/org/departments";

function person(
  partial: Partial<DepartmentPerson> & { id: string },
): DepartmentPerson {
  return {
    id: partial.id,
    fullName: partial.fullName ?? partial.id,
    jobTitle: partial.jobTitle ?? "Role",
    department: partial.department ?? null,
    country: partial.country ?? "US",
    managerEmploymentId: partial.managerEmploymentId ?? null,
    directReports: partial.directReports,
  };
}

describe("departments aggregation", () => {
  it("buckets Unassigned and picks highest-span lead", () => {
    const depts = computeDepartments([
      person({ id: "a", department: "Eng", directReports: 2, fullName: "Ada" }),
      person({ id: "b", department: "Eng", directReports: 0, fullName: "Bea" }),
      person({ id: "c", department: null, directReports: 1, fullName: "Cara" }),
    ]);
    expect(depts.map((d) => d.name)).toEqual(["Eng", UNASSIGNED_DEPARTMENT]);
    expect(depts[0]!.headcount).toBe(2);
    expect(depts[0]!.lead?.id).toBe("a");
    expect(depts[1]!.name).toBe(UNASSIGNED_DEPARTMENT);
    expect(pickDepartmentLead(depts[0]!.people)?.fullName).toBe("Ada");
  });
});
