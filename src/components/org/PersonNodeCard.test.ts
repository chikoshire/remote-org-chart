import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const card = readFileSync(
  join(process.cwd(), "src/components/org/PersonNodeCard.tsx"),
  "utf8",
);

describe("PersonNodeCard", () => {
  it("defines Norma variants for selection and path highlight", () => {
    expect(card).toContain('"default"');
    expect(card).toContain('"selected"');
    expect(card).toContain('"path"');
    expect(card).toContain('"root"');
    expect(card).toContain("norma-royal");
    expect(card).toContain("norma-spray");
  });
});
