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

async function loginAsDemo(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("demo@acme.example");
  await page.getByLabel("Password").fill("<scrubbed-old-demo-password>");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/app/);
}

test.describe("org chart smoke", () => {
  test("marketing home offers log in", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /see how acme is organised/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
  });

  test("login gates the app and shows product shell", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login/);

    await loginAsDemo(page);
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
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  });

  test("IA stub routes render under product shell", async ({ page }) => {
    await loginAsDemo(page);
    for (const { path, heading } of [
      { path: "/app/dashboard", heading: "Dashboard" },
      { path: "/app/departments", heading: "Departments" },
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

  test("data health route lists trust sections", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await loginAsDemo(page);
    await page.goto("/app/data-health");
    await expect(
      page.getByRole("heading", { name: "Data Health", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/trust the org chart/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Reporting cycles" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Manager missing" }),
    ).toBeVisible();
  });

  test("settings connect wizard reconnects without secrets", async ({ page }) => {
    await loginAsDemo(page);
    await page.goto("/settings");
    await page.getByRole("button", { name: "Disconnect" }).click();
    await expect(page.getByText("Disconnected")).toBeVisible();
    await page.getByRole("button", { name: "Connect" }).click();
    await expect(
      page.getByRole("heading", { name: "Connect Remote" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Connect", exact: true }).click();
    await expect(page.getByText("Connected", { exact: true }).first()).toBeVisible();
  });

  test("renders chart from fixture, opens profile, and has no export buttons", async ({
    page,
  }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await loginAsDemo(page);
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

  test("people directory search and filters with relationship context", async ({
    page,
  }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await loginAsDemo(page);
    await page.goto("/app/people");

    await expect(
      page.getByRole("heading", { name: "People", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

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
    await loginAsDemo(page);
    await page.goto("/app");

    await expect(
      page.getByRole("heading", { name: "No people to show" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("shows error state when API fails", async ({ page }) => {
    await mockOrgChart(page, orgChartErrorFixture, 401);
    await loginAsDemo(page);
    await page.goto("/app");

    await expect(
      page.getByRole("heading", { name: /couldn’t load the org chart/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/couldn’t authorize this connection/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("logout returns to marketing", async ({ page }) => {
    await loginAsDemo(page);
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: /see how acme is organised/i }),
    ).toBeVisible();
  });
});
