import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("health vs save-to-remote copy (#132)", () => {
  it("keeps Data Health and profile on the same write/overlay story", () => {
    const health = readFileSync(
      join(process.cwd(), "src/components/org/DataHealthWorkspace.tsx"),
      "utf8",
    );
    const profile = readFileSync(
      join(process.cwd(), "src/components/org/PersonProfileView.tsx"),
      "utf8",
    );
    const help = readFileSync(
      join(process.cwd(), "src/lib/help/content.ts"),
      "utf8",
    );

    expect(health).toContain("Save to Remote");
    expect(health).toContain("local browser overlays");
    expect(health).not.toContain("not written back to Remote");
    expect(profile).toContain("Save to Remote");
    expect(profile).toContain("local overlays for fields Remote could not accept");
    expect(help).toContain("Save to Remote");
    expect(help).toContain("local browser overlay");
  });
});
