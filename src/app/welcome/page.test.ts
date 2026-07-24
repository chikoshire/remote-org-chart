import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const welcome = readFileSync(
  join(process.cwd(), "src/app/welcome/page.tsx"),
  "utf8",
);

describe("welcome landing", () => {
  it("is brand-forward with a CTA into the chart", () => {
    expect(welcome).toContain("ProductShell");
    expect(welcome).toContain("Sandbox Corp");
    expect(welcome).toContain('href="/app"');
    expect(welcome).toContain("Open organization chart");
  });
});
