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

  it("offers a copy-link control for deep links", () => {
    expect(drawer).toContain("Copy link");
    expect(drawer).toContain("personDeepLinkHref");
  });

  it("supports docked People layout without covering the grid", () => {
    expect(drawer).toContain('placement?: "overlay" | "dock"');
    expect(drawer).toContain('data-drawer-placement');
    const people = readFileSync(
      join(process.cwd(), "src/components/org/PeopleWorkspace.tsx"),
      "utf8",
    );
    expect(people).toContain('placement="dock"');
    expect(people).toContain("md:flex-row");
  });
});
