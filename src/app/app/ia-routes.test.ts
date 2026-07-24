import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const routes = [
  "dashboard",
  "people",
  "departments",
  "data-health",
] as const;

describe("Org Intelligence IA routes", () => {
  for (const segment of routes) {
    it(`has /app/${segment} page`, () => {
      const path = join(process.cwd(), `src/app/app/${segment}/page.tsx`);
      expect(existsSync(path)).toBe(true);
      const src = readFileSync(path, "utf8");
      expect(src).toContain("ProductShell");
      if (segment === "people") {
        expect(src).toContain("PeopleWorkspace");
      } else {
        expect(src).toContain("SurfaceStub");
      }
    });
  }
});
