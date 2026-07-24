import { describe, expect, it } from "vitest";
import {
  CHART_BAR_ACCENT,
  departmentAccent,
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

  it("falls back to black for empty departments", () => {
    expect(departmentAccent(null)).toBe("#121212");
    expect(departmentAccent("")).toBe("#121212");
  });

  it("uses a single quiet chart bar accent", () => {
    expect(CHART_BAR_ACCENT).toBe("#121212");
  });
});
