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
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
        name: "Org",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Welcome" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Settings" }),
    ).toBeVisible();
    await expect(page.locator("#org-chart")).toBeVisible();
    await expect(page.getByRole("button", { name: "Chart" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Directory" })).toBeVisible();
  });

  test("settings route loads preferences", async ({ page }) => {
    await page.goto("/settings");
    await expect(
      page.getByRole("heading", { name: "Settings", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("About this data")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save preferences" })).toBeVisible();
  });

  test("renders chart from fixture, opens profile, and has no export buttons", async ({
    page,
  }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await page.goto("/app");

    await expect(page.getByText("2 people · 1 roots · 0 cycles")).toBeVisible({
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

  test("directory search and filters with relationship context", async ({
    page,
  }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await page.goto("/app");

    await expect(page.getByText("2 people · 1 roots · 0 cycles")).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole("button", { name: "Directory" }).click();
    await expect(
      page.getByRole("heading", { name: "People directory" }).or(
        page.getByText("People directory"),
      ),
    ).toBeVisible();

    await expect(page.getByText("Reports to Alex Root")).toBeVisible();

    const search = page.getByRole("combobox", {
      name: /search people/i,
    });
    await search.fill("Jordan");

    const directory = page.getByRole("list", { name: "People directory" });
    await expect(directory.getByText("Jordan Report")).toBeVisible();
    await expect(directory.getByText("Reports to Alex Root")).toBeVisible();
    await expect(
      directory.getByRole("button", {
        name: /Alex Root.*Chief of Staff/i,
      }),
    ).toHaveCount(0);

    await directory.getByRole("button", { name: "Open profile" }).click();
    await expect(page.getByRole("dialog", { name: "Jordan Report" })).toBeVisible();
  });

  test("shows empty state when API returns no people", async ({ page }) => {
    await mockOrgChart(page, orgChartEmptyFixture);
    await page.goto("/app");

    await expect(
      page.getByRole("heading", { name: "No people to chart" }),
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
      page.getByText(/sandbox rejected the token/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });
});
