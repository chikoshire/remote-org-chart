import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const src = readFileSync(
  join(process.cwd(), "src/components/org/ChartStateSurfaces.tsx"),
  "utf8",
);

describe("ChartStateSurfaces", () => {
  it("exports loading, empty, and error surfaces", () => {
    expect(src).toContain("ChartLoadingState");
    expect(src).toContain("ChartEmptyState");
    expect(src).toContain("ChartErrorState");
    expect(src).toContain('role="status"');
    expect(src).toContain('role="alert"');
  });
});
