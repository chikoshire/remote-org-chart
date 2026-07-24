import { expect, test, type Page } from "@playwright/test";
import {
  orgChartEmptyFixture,
  orgChartErrorFixture,
  orgChartReadyFixture,
} from "./fixtures/org-chart";

async function mockOrgChart(page: Page, body: unknown, status = 200) {
  await page.route("**/api/org-chart", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test.describe("org chart smoke", () => {
  test("home redirects to /app with product shell", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await page.goto("/");

    await expect(page).toHaveURL(/\/app/);
    await expect(page.getByRole("banner")).toContainText("Acme");
    const primary = page.getByRole("navigation", { name: "Primary" });
    await expect(primary).toBeVisible();
    for (const name of [
      "Dashboard",
      "Org Chart",
      "People",
      "Departments",
      "Data Health",
    ]) {
      await expect(primary.getByRole("link", { name })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(primary.getByRole("link", { name: "Welcome" })).toHaveCount(0);
    await expect(page.locator("#org-chart")).toBeVisible();
  });

  test("IA stub routes render under product shell", async ({ page }) => {
    for (const { path, heading } of [
      { path: "/app/dashboard", heading: "Dashboard" },
      { path: "/app/people", heading: "People" },
      { path: "/app/departments", heading: "Departments" },
      { path: "/app/data-health", heading: "Data Health" },
    ]) {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
          name: heading,
        }),
      ).toHaveAttribute("aria-current", "page");
    }
  });

  test("settings route loads preferences and integrations", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "Settings", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Integrations")).toBeVisible();
    await expect(page.getByRole("button", { name: "Disconnect" }).or(
      page.getByRole("button", { name: "Connect" }),
    )).toBeVisible();
    await expect(page.getByRole("button", { name: "Save preferences" })).toBeVisible();
  });

  test("renders chart from fixture, opens profile, and has no export buttons", async ({
    page,
  }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await page.goto("/app");

    await expect(page.getByText(/2 people · 1 teams/)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: "Alex Root" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Jordan Report" })).toBeVisible();

    await expect(page.getByRole("button", { name: /export.*png/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /export.*svg/i })).toHaveCount(0);
    await expect(page.getByText(/download png/i)).toHaveCount(0);
    await expect(page.getByText(/download svg/i)).toHaveCount(0);

    const search = page.getByRole("combobox", {
      name: /search people/i,
    });
    await search.fill("Jordan");
    await expect(
      page.getByRole("listbox", { name: "Matching people" }),
    ).toBeVisible();
    await page.getByRole("option").filter({ hasText: "Jordan Report" }).click();
    await expect(page.getByText(/path highlighted/i)).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Jordan Report" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Path to root" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Direct reports" })).toBeVisible();
    await page.getByRole("button", { name: "Close person details" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("people route is primary directory surface", async ({ page }) => {
    await page.goto("/app/people");
    await expect(
      page.getByRole("heading", { name: "People", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open Org Chart" }),
    ).toBeVisible();
  });

  test("shows empty state when API returns no people", async ({ page }) => {
    await mockOrgChart(page, orgChartEmptyFixture);
    await page.goto("/app");

    await expect(
      page.getByRole("heading", { name: "No people to show" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("shows error state when API fails", async ({ page }) => {
    await mockOrgChart(page, orgChartErrorFixture, 401);
    await page.goto("/app");

    await expect(
      page.getByRole("heading", { name: /couldn’t load the org chart/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/couldn’t authorize this connection/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });
});
