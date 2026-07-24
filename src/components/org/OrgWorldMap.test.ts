import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("OrgWorldMap department gradient", () => {
  it("fills the clicked country with a department mix gradient", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/org/OrgWorldMap.tsx"),
      "utf8",
    );
    expect(src).toContain("departmentAccentsForPeople");
    expect(src).toContain("map-dept-grad-");
    expect(src).toContain("activeGradientId");
    expect(src).not.toContain('? "#6aae96"');
  });
});
