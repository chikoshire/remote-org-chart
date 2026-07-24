import { describe, expect, it } from "vitest";
import {
  CHART_BAR_ACCENT,
  departmentAccent,
} from "@/lib/ui/department-accent";

describe("departmentAccent", () => {
  it("returns a stable color for the same department", () => {
    expect(departmentAccent("Engineering")).toBe(
      departmentAccent("Engineering"),
    );
  });

  it("stays within the muted Prussian family", () => {
    const samples = [
      "Engineering",
      "Finance",
      "Design",
      "Marketing",
      "Sales",
      "HR",
    ].map((name) => departmentAccent(name));
    for (const color of samples) {
      expect(color.startsWith("#")).toBe(true);
      // No bright purple / pink / indigo leftovers from the old pastel set
      expect(color).not.toMatch(/ae3ec9|c2255c|4c6ef5|1971c2/i);
    }
    expect(departmentAccent(null)).toBe("#0b2a32");
    expect(departmentAccent("")).toBe("#0b2a32");
  });

  it("exposes a single chart bar accent", () => {
    expect(CHART_BAR_ACCENT).toBe("#e85d04");
  });
});
