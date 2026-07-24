import { describe, expect, it } from "vitest";
import {
  CHART_BAR_ACCENT,
  departmentAccent,
  departmentAccentsForPeople,
} from "@/lib/ui/department-accent";

describe("departmentAccent", () => {
  it("is stable for the same department name", () => {
    expect(departmentAccent("Engineering")).toBe(
      departmentAccent("Engineering"),
    );
  });

  it("stays in the pastel family", () => {
    const accents = [
      "Engineering",
      "Finance",
      "People",
      "Sales",
      "Legal",
      "Design",
    ].map((name) => departmentAccent(name));
    for (const accent of accents) {
      expect(accent.startsWith("#")).toBe(true);
      expect(accent).not.toBe("#e85d04");
      expect(accent).not.toBe("#0b2a32");
    }
  });

  it("falls back to muted grey for empty departments", () => {
    expect(departmentAccent(null)).toBe("#8a8580");
    expect(departmentAccent("")).toBe("#8a8580");
  });

  it("collects unique department accents for a country mix", () => {
    const colors = departmentAccentsForPeople([
      { department: "Engineering" },
      { department: "Engineering" },
      { department: "Finance" },
      { department: null },
      { department: "  finance " },
    ]);
    expect(colors).toHaveLength(2);
    expect(colors[0]).toBe(departmentAccent("Engineering"));
    expect(colors[1]).toBe(departmentAccent("Finance"));
  });

  it("uses a single quiet chart bar accent", () => {
    expect(CHART_BAR_ACCENT).toBe("#121212");
  });
});
