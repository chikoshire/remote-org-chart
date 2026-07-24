import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const directory = readFileSync(
  join(process.cwd(), "src/components/org/PeopleDirectory.tsx"),
  "utf8",
);

describe("PeopleDirectory visuals", () => {
  it("uses light chrome and shared card language", () => {
    expect(directory).toContain("bg-white/90");
    expect(directory).toContain("departmentAccent");
    expect(directory).toContain("formatCountryLabel");
    expect(directory).toContain("Reports to");
    expect(directory).toContain('aria-label="Directory layout"');
    expect(directory).toContain('aria-pressed={view === "list"}');
    expect(directory).not.toContain("DepartmentsBrowse");
    expect(directory).not.toContain('"departments"');
    expect(directory).not.toContain("#1a1a1a");
  });
});
