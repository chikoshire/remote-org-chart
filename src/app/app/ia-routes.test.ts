import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const routes = ["dashboard", "people", "departments"] as const;

describe("Org Intelligence IA routes", () => {
  for (const segment of routes) {
    it(`has /app/${segment} page`, () => {
      const path = join(process.cwd(), `src/app/app/${segment}/page.tsx`);
      expect(existsSync(path)).toBe(true);
      const src = readFileSync(path, "utf8");
      expect(src).toContain("ProductShell");
      if (segment === "people") {
        expect(src).toContain("PeopleWorkspace");
      } else if (segment === "dashboard") {
        expect(src).toContain("DashboardWorkspace");
      } else if (segment === "departments") {
        expect(src).toContain("DepartmentsWorkspace");
      } else {
        expect(src).toContain("SurfaceStub");
      }
    });
  }

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
