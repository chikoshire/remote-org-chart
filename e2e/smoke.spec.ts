import { expect, test, type Page } from "@playwright/test";
import {
  orgChartEdgeFixture,
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
    ]) {
      await expect(primary.getByRole("link", { name })).toBeVisible();
    }
    await expect(primary.getByRole("link", { name: "Data Health" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  });

  test("primary tabs tour covers each org intelligence surface", async ({
    page,
  }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await loginAsDemo(page);
    const primary = page.getByRole("navigation", { name: "Primary" });

    await primary.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/app\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    await primary.getByRole("link", { name: "Org Chart" }).click();
    await expect(page).toHaveURL(/\/app\/?$/);
    await expect(page.getByText(/2 people/)).toBeVisible({ timeout: 20_000 });

    await primary.getByRole("link", { name: "People" }).click();
    await expect(page).toHaveURL(/\/app\/people/);
    await expect(
      page.getByRole("heading", { name: "People", exact: true }),
    ).toBeVisible();

    await primary.getByRole("link", { name: "Departments" }).click();
    await expect(page).toHaveURL(/\/app\/departments/);
    await expect(
      page.getByRole("heading", { name: "Departments", exact: true }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(
      page.getByRole("heading", { name: "Preferences", exact: true }),
    ).toBeVisible();

    await page.getByRole("navigation", { name: "Settings sections" })
      .getByRole("link", { name: "Data Health" })
      .click();
    await expect(page).toHaveURL(/\/settings\/data-health/);
    await expect(
      page.getByRole("heading", { name: "Data Health", exact: true }),
    ).toBeVisible();
  });

  test("command bar opens with keyboard shortcut", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await loginAsDemo(page);
    await page.goto("/app");
    await page.keyboard.press("Meta+k");
    await expect(
      page.getByRole("dialog", { name: "Command bar" }),
    ).toBeVisible();
    await page.getByPlaceholder(/search people or jump/i).fill("Jordan");
    await expect(page.getByRole("option").filter({ hasText: "Jordan Report" })).toBeVisible();
    await page.getByRole("option").filter({ hasText: "Jordan Report" }).click();
    await expect(page).toHaveURL(/person=emp_report/);
  });

  test("dashboard shows organisational insight cards", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await loginAsDemo(page);
    await page.goto("/app/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Organisational intelligence")).toBeVisible();
    await expect(page.getByText("Data completeness")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse People" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Review Data Health" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Headcount by department" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Needs attention" }),
    ).toBeVisible();
  });

  test("people departments view lists headcount and people", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await loginAsDemo(page);
    await page.goto("/app/people?view=departments");
    await expect(
      page.getByRole("heading", { name: "People", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("button", { name: "Departments", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("list", { name: "Departments" }).getByText("Operations"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Operations", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Operations people" }).getByText("Alex Root"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Show in chart" }).first()).toBeVisible();
  });

  test("data health route lists trust sections", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await loginAsDemo(page);
    await page.goto("/settings/data-health");
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

  test("settings theme preference and connect wizard", async ({ page }) => {
    await loginAsDemo(page);
    await page.goto("/settings");

    const theme = page.getByRole("group", { name: "Color theme" });
    await expect(theme).toBeVisible();
    await theme.getByRole("button", { name: "Dark" }).click();
    await expect(theme.getByRole("button", { name: "Dark" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("html")).toHaveClass(/dark/);
    await theme.getByRole("button", { name: "Light" }).click();
    await expect(theme.getByRole("button", { name: "Light" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.getByRole("button", { name: "Disconnect" }).click();
    await expect(page.getByText("Disconnected")).toBeVisible();
    await page.getByRole("button", { name: "Connect" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Connect Remote" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await page
      .getByLabel("Connect Remote")
      .getByRole("button", { name: "Connect", exact: true })
      .click();
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

    await page.getByRole("button", { name: "Tree" }).click();
    await expect(
      page.getByRole("list", { name: "Organization tree list" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Map" }).click();
    await expect(
      page.getByRole("img", { name: /world map of people/i }),
    ).toBeVisible();
    await expect(page.getByText(/countr(?:y|ies) with people/i)).toBeVisible();
    await page.getByRole("button", { name: /United States|USA/i }).click();
    await expect(page.getByText("Alex Root")).toBeVisible();
    await page.getByRole("button", { name: "Chart" }).click();

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

  test("edge badges surface Cycle, Unlinked, and Incomplete", async ({ page }) => {
    await mockOrgChart(page, orgChartEdgeFixture);
    await loginAsDemo(page);
    await page.goto("/app");

    await expect(page.getByText(/2 people/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Cycle", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Unlinked", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Incomplete", { exact: true }).first()).toBeVisible();

    await page.goto("/settings/data-health");
    await expect(
      page.getByRole("heading", { name: "Reporting cycles" }),
    ).toBeVisible();
    await expect(page.getByText("Casey Cycle").first()).toBeVisible();
    await expect(page.getByText("Riley Orphan").first()).toBeVisible();
  });

  test("people directory morph partners and profile drawer", async ({
    page,
  }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await loginAsDemo(page);
    await page.goto("/app/people");

    await expect(
      page.getByRole("heading", { name: "People", exact: true }),
    ).toBeVisible({ timeout: 20_000 });

    await expect(page.getByText("Reports to Alex Root")).toBeVisible();
    await expect(page.locator("[data-morph-person]").first()).toBeAttached();

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
    await expect(
      page.locator('[data-morph-person="emp_report"].bloom-enter'),
    ).toBeVisible();

    await page.getByRole("button", { name: "Close person details" }).click();
    await page.getByRole("button", { name: "List" }).click();
    await expect(page.getByRole("button", { name: "List" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page.getByRole("list", { name: "People directory" }).getByText("Jordan Report"),
    ).toBeVisible();
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

test.describe("mobile smoke", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("marketing and app shell fit narrow viewport", async ({ page }) => {
    await mockOrgChart(page, orgChartReadyFixture);
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /see how acme is organised/i }),
    ).toBeVisible();

    await loginAsDemo(page);
    await page.goto("/app/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeVisible();
    await page.goto("/app");
    await expect(page.getByText(/2 people/)).toBeVisible({ timeout: 20_000 });
  });
});
