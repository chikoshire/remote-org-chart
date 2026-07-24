import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const card = readFileSync(
  join(process.cwd(), "src/components/org/PersonNodeCard.tsx"),
  "utf8",
);

describe("PersonNodeCard", () => {
  it("defines Acme variants for selection and path highlight", () => {
    expect(card).toContain('"default"');
    expect(card).toContain('"selected"');
    expect(card).toContain('"path"');
    expect(card).toContain('"root"');
    expect(card).toContain("norma-royal");
    expect(card).toContain("#0b2a32");
    expect(card).toContain("#2a9d8f");
  });

  it("exposes an accessible name on the person article", () => {
    expect(card).toContain("aria-label={accessibleName}");
  });
});
