import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const bar = readFileSync(
  join(process.cwd(), "src/components/shell/CommandBar.tsx"),
  "utf8",
);
const shell = readFileSync(
  join(process.cwd(), "src/components/shell/ProductShellInner.tsx"),
  "utf8",
);

describe("CommandBar", () => {
  it("wires ⌘K palette into the product shell", () => {
    expect(bar).toContain('event.key.toLowerCase() === "k"');
    expect(bar).toContain('role="dialog"');
    expect(bar).toContain("withPersonSearchParam");
    expect(bar).toContain("Go to Data Health");
    expect(bar).toContain("Search people or pages…");
    expect(bar).toContain("min-w-[14rem]");
    expect(bar).toContain("max-w-2xl");
    expect(shell).toContain("CommandBar");
  });
});
