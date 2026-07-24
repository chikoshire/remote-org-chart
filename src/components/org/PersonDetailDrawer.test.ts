import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const drawer = readFileSync(
  join(process.cwd(), "src/components/org/PersonDetailDrawer.tsx"),
  "utf8",
);
const canvas = readFileSync(
  join(process.cwd(), "src/components/org/OrgChartCanvas.tsx"),
  "utf8",
);

describe("PersonDetailDrawer", () => {
  it("is a dialog with path and reports sections", () => {
    expect(drawer).toContain('role="dialog"');
    expect(drawer).toContain("aria-modal");
    expect(drawer).toContain("Path to root");
    expect(drawer).toContain("Direct reports");
    expect(drawer).toContain("Escape");
  });

  it("is wired into the org chart canvas on selection", () => {
    expect(canvas).toContain("PersonDetailDrawer");
    expect(canvas).toContain("selectedDetail");
  });
});
