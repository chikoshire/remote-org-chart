import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const welcome = readFileSync(
  join(process.cwd(), "src/app/welcome/page.tsx"),
  "utf8",
);
const marketing = readFileSync(
  join(process.cwd(), "src/app/page.tsx"),
  "utf8",
);

describe("marketing + welcome", () => {
  it("welcome redirects to marketing home", () => {
    expect(welcome).toContain('redirect("/")');
  });

  it("marketing home is brand-forward with Log in", () => {
    expect(marketing).toContain("AcmeLogo");
    expect(marketing).toContain("See how Acme is organised");
    expect(marketing).toContain('href="/login"');
    expect(marketing).toContain("Log in");
  });
});
