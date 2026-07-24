import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  personAvatarMorphName,
  personNameMorphName,
} from "@/lib/ui/motion";

describe("profile return helpers", () => {
  it("ships capture + consume helpers for chart vs people back", () => {
    const src = readFileSync(
      join(process.cwd(), "src/lib/ui/profile-return.ts"),
      "utf8",
    );
    const profile = readFileSync(
      join(process.cwd(), "src/components/org/PersonProfileView.tsx"),
      "utf8",
    );
    expect(src).toContain("captureProfileReturn");
    expect(src).toContain("consumeReturnScrollIfMatching");
    expect(src).toContain("Org Chart");
    expect(profile).toContain("goBack");
    expect(profile).toContain("returnTo.label");
    expect(profile).toContain("morph");
  });

  it("uses distinct avatar and name morph partners", () => {
    expect(personAvatarMorphName("emp")).toBe("person-avatar-emp");
    expect(personNameMorphName("emp")).toBe("person-name-emp");
  });
});
