import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("marketing remote.com structure + real screenshots", () => {
  it("maps remote.com section structure and ships real app shots", () => {
    const page = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    const hero = readFileSync(
      join(process.cwd(), "src/components/marketing/MarketingHero.tsx"),
      "utf8",
    );
    const how = readFileSync(
      join(process.cwd(), "src/components/marketing/MarketingHowItWorks.tsx"),
      "utf8",
    );

    expect(page).toContain("MarketingHero");
    expect(page).toContain("MarketingMarquee");
    expect(page).toContain("MarketingHowItWorks");
    expect(hero).toContain("See how Acme is organised");
    expect(hero).toContain("Reporting lines, people, and data health in one place.");
    expect(hero).toContain("live employment data");
    expect(page).toContain("Built on Remote. No second employee database.");
    expect(page).not.toContain("HRIS");
    expect(page).not.toContain("github.com");
    expect(page).not.toContain("GitHub");
    expect(page).not.toContain("developer.remote.com");
    expect(page).not.toContain("View source");
    expect(page).not.toMatch(/\u2014|\u2013/);
    expect(hero).not.toMatch(/\u2014|\u2013/);
    expect(page).not.toContain("MarketingProductMock");

    const header = readFileSync(
      join(process.cwd(), "src/components/marketing/MarketingHeader.tsx"),
      "utf8",
    );
    expect(header).not.toContain("github.com");
    expect(header).not.toContain("GitHub");
    expect(header).toContain('label: "Remote"');

    expect(hero).toContain("md:grid-cols-12");
    expect(hero).toContain("/marketing/hero-org-chart.png");
    expect(how).toContain("aria-expanded");
    expect(how).toContain("/marketing/app-dashboard.png");

    for (const file of [
      "public/marketing/hero-org-chart.png",
      "public/marketing/app-dashboard.png",
      "public/marketing/app-tree.png",
      "public/marketing/app-map.png",
      "public/marketing/app-people.png",
    ]) {
      expect(existsSync(join(process.cwd(), file))).toBe(true);
    }
  });
});
