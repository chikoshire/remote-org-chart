import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const edge = readFileSync(
  join(process.cwd(), "src/components/org/ReportingEdge.tsx"),
  "utf8",
);

describe("ReportingEdge", () => {
  it("uses Norma stroke tokens for default and highlight", () => {
    expect(edge).toContain("--norma-royal");
    expect(edge).toContain("--norma-border-strong");
    expect(edge).toContain("highlighted");
  });
});
