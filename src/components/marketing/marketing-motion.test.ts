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
    expect(hero).toContain("Reporting lines, people, and data health in one Acme workspace.");
    expect(hero).toContain("live employment data");
    expect(page).toContain("Acme product. HRIS connected.");
    expect(page).toContain("standalone organisational intelligence app");
    expect(page).toContain("Remote integration");
    expect(page).not.toContain("Powered by Remote");
    expect(page).not.toContain("Built on Remote");
    expect(page).not.toContain("Organisational intelligence on Remote");
    expect(page).not.toContain("github.com");
    expect(page).not.toContain("GitHub");
    expect(page).not.toContain("developer.remote.com");
    expect(page).not.toContain("View source");
    expect(page).not.toMatch(/\u2014|\u2013/);
    expect(hero).not.toMatch(/\u2014|\u2013/);
    expect(page).not.toContain("MarketingProductMock");
    expect(page).not.toContain("interview");
    expect(page).not.toContain("demo credentials");
    expect(page).not.toContain("sandbox");
    expect(page).toContain("Ready to explore Acme?");
    expect(page).toContain("HRIS integration");
    expect(page).toContain("Try now");

    const marquee = readFileSync(
      join(process.cwd(), "src/components/marketing/MarketingMarquee.tsx"),
      "utf8",
    );
    expect(marquee).not.toContain("sandbox");
    expect(marquee).not.toContain("Sandbox");
    expect(marquee).toContain("Organisational intelligence");
    expect(marquee).not.toContain("on Remote");
    expect(marquee).toContain("HRIS integration");

    const header = readFileSync(
      join(process.cwd(), "src/components/marketing/MarketingHeader.tsx"),
      "utf8",
    );
    expect(header).not.toContain("github.com");
    expect(header).not.toContain("GitHub");
    expect(header).toContain('label: "Integrations"');
    expect(header).toContain('aria-label={menuOpen ? "Close menu" : "Open menu"}');
    expect(header).toContain("md:hidden");
    expect(header).toContain('if (event.key === "Escape") setMenuOpen(false)');
    expect(header).toContain("onClick={() => setMenuOpen(false)}");
    expect(header).toContain("Marketing mobile");

    expect(hero).toContain("md:grid-cols-12");
    expect(hero).toContain("/marketing/hero-org-chart.png");
    expect(how).toContain("aria-expanded");
    expect(how).toContain("/marketing/app-dashboard.png");
    expect(how).toContain("rounded-[1.35rem]");
    expect(how).toContain("bg-norma-peach");
    expect(how).toContain("bg-norma-lavender");
    expect(how).not.toContain("divide-y");
    expect(how).not.toContain("bg-norma-ink text-norma-ink-inverse");

    const shot = readFileSync(
      join(process.cwd(), "src/components/marketing/MarketingAppShot.tsx"),
      "utf8",
    );
    expect(shot).toContain("object-cover");
    expect(shot).not.toContain("p-3 sm:p-4");
    expect(shot).not.toContain("object-contain");

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
