import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("DepartmentFilterSelect", () => {
  it("puts department colour swatches in the filter menu", () => {
    const select = readFileSync(
      join(process.cwd(), "src/components/org/DepartmentFilterSelect.tsx"),
      "utf8",
    );
    const filters = readFileSync(
      join(process.cwd(), "src/components/org/OrgFiltersBar.tsx"),
      "utf8",
    );
    const people = readFileSync(
      join(process.cwd(), "src/components/org/PeopleDirectory.tsx"),
      "utf8",
    );
    const canvas = readFileSync(
      join(process.cwd(), "src/components/org/OrgChartCanvas.tsx"),
      "utf8",
    );

    expect(select).toContain("departmentAccent");
    expect(select).toContain('role="listbox"');
    expect(select).toContain("defaultOpen");
    expect(filters).toContain("formatCountryLabel");
    expect(filters).toContain("openDepartmentMenu");
    expect(people).toContain("DepartmentFilterSelect");
    expect(people).not.toContain("DepartmentColorLegend");
    expect(canvas).not.toContain("DepartmentColorLegend");
    expect(canvas).toContain("openDepartmentMenu");
    expect(canvas).toContain("readOpenDepartmentsFromSearch");
  });
});
