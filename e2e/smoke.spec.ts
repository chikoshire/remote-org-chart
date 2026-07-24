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
  test("home shell loads", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Organization", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Remote Org Chart")).toBeVisible();
    await expect(page.getByText("Acme Sandbox Corp").first()).toBeVisible();
    await expect(page.locator("#org-chart")).toBeVisible();
  });

  test("renders chart from fixture and supports search", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await page.goto("/");

    await expect(page.getByText("2 people · 1 roots · 0 cycles")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: "Alex Root" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Jordan Report" })).toBeVisible();

    const search = page.getByRole("combobox", {
      name: /search people/i,
    });
    await search.fill("Jordan");
    await expect(
      page.getByRole("listbox", { name: "Matching people" }),
    ).toBeVisible();
    await page.getByRole("option").filter({ hasText: "Jordan Report" }).click();
    await expect(page.getByText(/path highlighted/i)).toBeVisible();
  });

  test("shows empty state when API returns no people", async ({ page }) => {
    await mockOrgChart(page, orgChartEmptyFixture);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "No people to chart" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("shows error state when API fails", async ({ page }) => {
    await mockOrgChart(page, orgChartErrorFixture, 401);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /couldn’t load the org chart/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/sandbox rejected the token/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });
});
