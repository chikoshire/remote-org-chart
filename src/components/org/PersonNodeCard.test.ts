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
    expect(card).toContain("norma-lavender");
    expect(card).toContain("norma-mint");
    expect(card).toContain("norma-peach");
    expect(card).toContain("text-norma-ink");
  });

  it("exposes an accessible name on the person article", () => {
    expect(card).toContain("aria-label={accessibleName}");
  });

  it("shows a Profile affordance when selected", () => {
    expect(card).toContain('variant === "selected"');
    expect(card).toContain("Profile");
  });

  it("uses taller comfortable cards without left color chips", () => {
    expect(card).not.toContain("departmentAccent");
    expect(card).not.toContain("inset-y-0 left-0 w-1");
    expect(card).toContain("w-[260px]");
    expect(card).toContain("reports");
    expect(card).toContain("PersonAvatar");
  });

  it("surfaces Cycle, Unlinked, and Incomplete badges", () => {
    expect(card).toContain("Cycle");
    expect(card).toContain("Unlinked");
    expect(card).toContain("Incomplete");
    expect(card).toContain("Not set");
  });
});
