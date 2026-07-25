import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const shell = readFileSync(
  join(process.cwd(), "src/components/shell/ProductShellInner.tsx"),
  "utf8",
);

const helpShot = readFileSync(
  join(process.cwd(), "src/components/help/HelpShot.tsx"),
  "utf8",
);

const tour = readFileSync(
  join(process.cwd(), "src/components/tour/ProductTour.tsx"),
  "utf8",
);

describe("ProductShell", () => {
  it("ships Org Intelligence primary IA with Help beside Health", () => {
    expect(shell).toContain("AcmeLogo");
    expect(shell).toContain("<main");
    expect(shell).toContain("Skip to main content");
    expect(shell).toContain('role="banner"');
    expect(shell).toContain('role="contentinfo"');
    expect(shell).toContain('href: "/app/dashboard"');
    expect(shell).toContain('href: "/app"');
    expect(shell).toContain('href: "/app/people"');
    expect(shell).toContain('href="/help"');
    expect(shell).toContain("HelpChatWidget");
    expect(shell).toContain("ProductTour");
    expect(shell).not.toContain('href: "/app/departments"');
    expect(shell).not.toContain('href: "/app/data-health"');
    expect(shell).toContain('href="/settings/data-health"');
    expect(shell).toContain('title="Data Health"');
    expect(shell).toMatch(/>\s*Health\s*</);
    expect(shell).toMatch(/>\s*Help\s*</);
    expect(shell).toContain('href="/settings"');
    expect(shell).not.toContain("Log out");
    expect(shell).toContain("CommandBar");
    expect(shell).toContain('aria-label="Settings"');
    expect(shell).toContain("Dashboard");
    expect(shell).toContain("Org Chart");
    expect(shell).toContain("People");
    // Help lives in the utilities cluster, not primary nav
    expect(shell).not.toContain('label: "Help"');
    expect(shell).not.toContain('label: "Departments"');
    expect(shell).toContain("bg-norma-surface");
    expect(shell).not.toContain('href="/welcome"');
    expect(shell).not.toContain("view=directory");
    expect(shell).toContain("h-dvh");
    expect(shell).toContain('data-tour="primary-nav"');
    expect(shell).toContain('data-tour="health"');
    expect(shell).toContain('data-tour="help"');
    expect(shell).toContain('data-tour="settings"');
    expect(shell).toContain('data-tour="main"');
  });
});

describe("HelpShot", () => {
  it("supports highlight rings and pointer arrows", () => {
    expect(helpShot).toContain("pointer?");
    expect(helpShot).toContain("POINTER_TRANSFORM");
    expect(helpShot).toContain("border-norma-spray");
  });
});

describe("ProductTour", () => {
  it("persists completion and listens for restart events", () => {
    expect(tour).toContain("PRODUCT_TOUR_START_EVENT");
    expect(tour).toContain("markProductTourDone");
    expect(tour).toContain("isProductTourDone");
  });

  it("shows Done only on the final step (#145)", () => {
    expect(tour).toContain('isLast ? "Done" : "Next"');
    expect(tour).toContain("Skip tour");
    expect(tour).toContain("PRODUCT_TOUR_STEPS.length - 1");
  });
});
