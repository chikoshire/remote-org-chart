import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  personAvatarMorphName,
  personMorphName,
  personNameMorphName,
} from "@/lib/ui/motion";

describe("morph bloom motion", () => {
  it("builds stable person morph names", () => {
    expect(personMorphName("emp_root")).toBe("person-emp_root");
    expect(personMorphName("a b")).toBe("person-a_b");
    expect(personAvatarMorphName("emp_root")).toBe("person-avatar-emp_root");
    expect(personNameMorphName("a b")).toBe("person-name-a_b");
  });

  it("documents the pattern and CSS hooks", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    const docs = readFileSync(
      join(process.cwd(), "docs/morph-bloom.md"),
      "utf8",
    );
    expect(css).toContain("bloom-enter");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(docs).toContain("view-transition-name");
    expect(docs).toContain("prefers-reduced-motion");
    expect(docs).toContain("captureProfileReturn");
  });
});
