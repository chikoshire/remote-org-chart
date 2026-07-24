import { describe, expect, it } from "vitest";
import { personAccessibleName } from "@/lib/org/person-a11y";

describe("personAccessibleName", () => {
  it("builds a readable label from person fields", () => {
    expect(
      personAccessibleName({
        fullName: "Ada Lovelace",
        jobTitle: "Analyst",
        department: "Engineering",
        country: "GBR",
        directReports: 2,
        variant: "default",
      }),
    ).toBe(
      "Ada Lovelace, Analyst, Engineering, GBR; 2 direct reports",
    );
  });

  it("marks roots and cycles", () => {
    const label = personAccessibleName({
      fullName: "Root",
      jobTitle: null,
      department: null,
      country: null,
      directReports: 0,
      inCycle: true,
      variant: "root",
    });
    expect(label).toContain("organization root");
    expect(label).toContain("reporting cycle");
  });
});
