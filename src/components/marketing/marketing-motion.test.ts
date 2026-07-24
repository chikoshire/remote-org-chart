import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("marketing remote-inspired motion", () => {
  it("ships atmosphere, marquee, reveal, and staged hero pieces", () => {
    const page = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(page).toContain("MarketingAtmosphere");
    expect(page).toContain("MarketingMarquee");
    expect(page).toContain("MarketingReveal");
    expect(page).toContain("MarketingHeader");
    expect(page).toContain("See how Acme is organised");
    expect(css).toContain("marketing-marquee");
    expect(css).toContain("marketing-reveal");
    expect(css).toContain("marketing-path-draw");
    expect(
      existsSync(
        join(process.cwd(), "src/components/marketing/MarketingReveal.tsx"),
      ),
    ).toBe(true);
  });
});
