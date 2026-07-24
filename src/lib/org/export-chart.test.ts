import { describe, expect, it } from "vitest";
import { chartExportFilename } from "@/lib/org/export-chart";

describe("export-chart", () => {
  it("names files with date and format", () => {
    expect(
      chartExportFilename("png", new Date("2026-07-24T12:00:00Z")),
    ).toBe("acme-org-chart-2026-07-24.png");
    expect(
      chartExportFilename("svg", new Date("2026-07-24T12:00:00Z")),
    ).toBe("acme-org-chart-2026-07-24.svg");
  });
});
