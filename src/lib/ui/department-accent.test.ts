import { describe, expect, it } from "vitest";
import { departmentAccent } from "@/lib/ui/department-accent";

describe("departmentAccent", () => {
  it("returns a stable color for the same department", () => {
    expect(departmentAccent("Engineering")).toBe(
      departmentAccent("Engineering"),
    );
  });

  it("differs across distinct departments and falls back without a name", () => {
    expect(departmentAccent("Engineering")).not.toBe(
      departmentAccent("Finance"),
    );
    expect(departmentAccent(null)).toBe("#2a9d8f");
    expect(departmentAccent("")).toBe("#2a9d8f");
  });
});
