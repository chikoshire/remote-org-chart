import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("Org Intelligence IA routes", () => {
  it("has /app/dashboard page", () => {
    const path = join(process.cwd(), "src/app/app/dashboard/page.tsx");
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, "utf8")).toContain("DashboardWorkspace");
  });

  it("has /app/people page with directory views", () => {
    const path = join(process.cwd(), "src/app/app/people/page.tsx");
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, "utf8")).toContain("PeopleWorkspace");
  });

  it("redirects legacy /app/departments into People Departments view", () => {
    const path = join(process.cwd(), "src/app/app/departments/page.tsx");
    expect(existsSync(path)).toBe(true);
    const src = readFileSync(path, "utf8");
    expect(src).toContain('redirect("/app/people?view=departments")');
    expect(src).not.toContain("DepartmentsWorkspace");
  });

  it("keeps Data Health under Settings with redirect from old path", () => {
    const settingsHealth = join(
      process.cwd(),
      "src/app/settings/data-health/page.tsx",
    );
    const legacy = join(process.cwd(), "src/app/app/data-health/page.tsx");
    expect(existsSync(settingsHealth)).toBe(true);
    expect(existsSync(legacy)).toBe(true);
    expect(readFileSync(settingsHealth, "utf8")).toContain("DataHealthWorkspace");
    expect(readFileSync(legacy, "utf8")).toContain(
      'redirect("/settings/data-health")',
    );
  });
});
