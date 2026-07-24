import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("Org Intelligence IA routes", () => {
  it("has /app/dashboard page", () => {
    const path = join(process.cwd(), "src/app/app/dashboard/page.tsx");
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, "utf8")).toContain("DashboardWorkspace");
  });

  it("has /app/people page with directory", () => {
    const path = join(process.cwd(), "src/app/app/people/page.tsx");
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, "utf8")).toContain("PeopleWorkspace");
  });

  it("redirects legacy /app/departments to Dashboard", () => {
    const path = join(process.cwd(), "src/app/app/departments/page.tsx");
    expect(existsSync(path)).toBe(true);
    const src = readFileSync(path, "utf8");
    expect(src).toContain('redirect("/app/dashboard")');
    expect(src).not.toContain("DepartmentsWorkspace");
    expect(src).not.toContain("view=departments");
  });

  it("keeps Data Health as a primary surface with settings redirect", () => {
    const appHealth = join(process.cwd(), "src/app/app/data-health/page.tsx");
    const settingsHealth = join(
      process.cwd(),
      "src/app/settings/data-health/page.tsx",
    );
    expect(existsSync(appHealth)).toBe(true);
    expect(existsSync(settingsHealth)).toBe(true);
    expect(readFileSync(appHealth, "utf8")).toContain("DataHealthWorkspace");
    expect(readFileSync(settingsHealth, "utf8")).toContain(
      'redirect("/app/data-health")',
    );
  });
});
