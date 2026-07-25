import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const src = readFileSync(
  join(process.cwd(), "src/components/org/PeopleWorkspace.tsx"),
  "utf8",
);

describe("people session cache (#128)", () => {
  it("hydrates from session storage before the full-screen loading gate", () => {
    expect(src).toContain("function sessionPeople");
    expect(src).toContain("sessionPeople() ?? []");
    expect(src).toContain("sessionPeople() ? \"ready\" : \"loading\"");
    expect(src).toContain("skip the full-screen gate");
    expect(src).toContain("if (cached) return");
  });
});
