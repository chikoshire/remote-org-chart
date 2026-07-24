import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const directory = readFileSync(
  join(process.cwd(), "src/components/org/PeopleDirectory.tsx"),
  "utf8",
);

describe("PeopleDirectory visuals", () => {
  it("uses theme tokens, centered grid cards, and no left color chips", () => {
    expect(directory).toContain("bg-norma-surface/80");
    expect(directory).toContain("norma-glass");
    expect(directory).toContain("formatCountryLabel");
    expect(directory).toContain("Reports to");
    expect(directory).toContain("Full profile");
    expect(directory).toContain("DepartmentFilterSelect");
    expect(directory).toContain('aria-label="Directory layout"');
    expect(directory).toContain('aria-pressed={view === "list"}');
    expect(directory).not.toContain("DepartmentsBrowse");
    expect(directory).not.toContain("DepartmentColorLegend");
    expect(directory).not.toContain('"departments"');
    expect(directory).not.toContain("inset-y-0 left-0 w-1");
    expect(directory).toContain("isIncompletePerson");
    expect(directory).toContain("Incomplete");
    expect(directory).not.toContain("#1a1a1a");
  });
});
