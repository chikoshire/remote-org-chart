/**
 * Manual browser smoke against local Next.js (user-path flows).
 * Run: node scripts/browser-smoke.mjs
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const CHROME =
  process.env.PLAYWRIGHT_CHROME ??
  "/Users/chikoshire/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const results = [];

function ok(name, detail = "") {
  results.push({ name, pass: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  results.push({ name, pass: false, detail });
  console.error(`FAIL  ${name} — ${detail}`);
}

async function expect(name, cond, detail = "") {
  if (cond) ok(name, detail);
  else fail(name, detail || "assertion failed");
}

async function main() {
  if (!existsSync(CHROME)) {
    throw new Error(`Chrome for Testing not found at ${CHROME}`);
  }

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  try {
    // --- Login ---
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/email/i).fill("demo@acme.example");
    await page.getByLabel(/password/i).fill("acme-org-demo");
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForURL(/\/app/, { timeout: 25000 });
    await expect("login lands in app", page.url().includes("/app"), page.url());

    // --- Dashboard scroll + nav ---
    await page.goto(`${BASE}/app/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));
    ok("dashboard scrolls");

    await page.getByRole("link", { name: "Org Chart" }).click();
    await page.waitForURL(/\/app\/?(\?|$)/);
    ok("nav → Org Chart", page.url());

    await page.getByRole("link", { name: "People" }).click();
    await page.waitForURL(/\/app\/people\/?$/);
    await page.waitForSelector('[aria-label="People directory"]', { timeout: 45000 });
    ok("nav → People");

    const firstCard = page.locator('[data-morph-person]').first();
    await expect("people cards render", (await firstCard.count()) > 0);
    const fullProfileLinks = page.getByRole("link", { name: "Full profile" });
    await expect(
      "Full profile links present",
      (await fullProfileLinks.count()) > 0,
      String(await fullProfileLinks.count()),
    );

    // Side dock via card body click (not Full profile link)
    await firstCard.locator("button").first().click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    await expect("side dock opens", await dialog.isVisible());
    await expect(
      "Open full profile in dock",
      await dialog.getByRole("link", { name: "Open full profile" }).isVisible(),
    );

    // Full profile page
    await dialog.getByRole("link", { name: "Open full profile" }).click();
    await page.waitForURL(/\/app\/people\/[^/]+/);
    await expect("full profile route", /\/app\/people\/[^/]+$/.test(new URL(page.url()).pathname), page.url());
    await page.getByRole("heading", { name: "About" }).waitFor({ state: "visible", timeout: 30000 });
    await expect("profile About section", await page.getByRole("heading", { name: "About" }).isVisible());
    await expect(
      "profile Reporting section",
      await page.getByRole("heading", { name: "Reporting" }).isVisible(),
    );
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const profileId = page.url().match(/\/app\/people\/([^/?#]+)/)?.[1];
    if (profileId) {
      const api = await page.request.get(`${BASE}/api/people/${profileId}`);
      const body = await api.json();
      await expect(
        "profile API returns ok",
        api.ok() && body.ok === true,
        JSON.stringify({
          status: api.status(),
          keys: body.profile ? Object.keys(body.profile) : null,
        }),
      );
      await expect(
        "profile API has workEmail field",
        body.profile && "workEmail" in body.profile,
      );
    }

    await page.getByRole("button", { name: "Show in chart" }).click();
    await page.waitForURL((url) => {
      const path = url.pathname.replace(/\/$/, "");
      return path === "/app" || path.endsWith("/app");
    });
    ok("Show in chart from profile", page.url());

    // --- Settings: density only (light mode locked) ---
    await page.goto(`${BASE}/settings`);
    await page.waitForLoadState("domcontentloaded");

    const themeControls = await page.getByRole("button", { name: "Dark" }).count();
    await expect("dark mode control removed", themeControls === 0, String(themeControls));

    const lightOnly = await page.evaluate(() => ({
      dark: document.documentElement.classList.contains("dark"),
      scheme: document.documentElement.style.colorScheme || "unset",
    }));
    await expect("html is not dark", !lightOnly.dark);
    ok("light-only theme", lightOnly.scheme);

    await page.getByRole("button", { name: "Compact" }).click();
    await page.waitForTimeout(150);
    const density = await page.evaluate(() =>
      localStorage.getItem("remote-org-chart:density"),
    );
    await expect("compact density persisted", density === "compact", density ?? "null");

    await page.getByRole("button", { name: "Comfortable" }).click();
    await page.waitForTimeout(150);
    const density2 = await page.evaluate(() =>
      localStorage.getItem("remote-org-chart:density"),
    );
    await expect(
      "comfortable density persisted",
      density2 === "comfortable",
      density2 ?? "null",
    );

    await page.getByRole("link", { name: "Data Health" }).click();
    await page.waitForURL(/\/settings\/data-health/);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    ok("settings data-health scrolls", page.url());

    // --- Disconnect / reconnect ---
    await page.goto(`${BASE}/settings`);
    const disconnect = page.getByRole("button", { name: "Disconnect" });
    if (await disconnect.isVisible()) {
      await disconnect.click();
      await page.waitForTimeout(400);
      await expect(
        "disconnect shows Connect",
        await page.getByRole("button", { name: "Connect" }).isVisible(),
      );

      await page.goto(`${BASE}/app/people`);
      await page.waitForTimeout(1000);
      const emptyOrConnect = await page
        .getByText(/no people|connect remote|connect/i)
        .first()
        .isVisible()
        .catch(() => false);
      await expect("people empty after disconnect", emptyOrConnect);

      await page.goto(`${BASE}/settings`);
      await page.getByRole("button", { name: "Connect" }).click();
      const wizard = page.getByRole("dialog", { name: "Connect Remote" });
      await wizard.waitFor({ state: "visible" });
      await wizard.getByRole("button", { name: "Continue" }).click();
      await wizard.getByRole("button", { name: "Connect" }).click();
      // Connecting flips `connected` and unmounts the wizard (Done is optional).
      await page.waitForTimeout(500);
      const reconnected = await page
        .getByRole("button", { name: "Disconnect" })
        .isVisible();
      await expect("reconnect restores connection", reconnected);
    } else {
      fail("disconnect button", "not visible — already disconnected?");
    }

    await page.goto(`${BASE}/app/dashboard`);
    await page.waitForTimeout(400);

    // --- Logout ---
    await page.getByRole("button", { name: "Log out" }).click();
    await page.waitForTimeout(1000);
    await expect(
      "logout leaves product",
      !page.url().includes("/app/dashboard"),
      page.url(),
    );

    await page.goto(`${BASE}/app/people`);
    await page.waitForTimeout(1000);
    const bounced =
      page.url().includes("/login") ||
      page.url().includes("/welcome") ||
      (await page.getByLabel(/email/i).isVisible().catch(() => false));
    await expect("logged-out people redirects", bounced, page.url());
  } catch (err) {
    fail("smoke crashed", err instanceof Error ? err.message : String(err));
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.pass);
  console.log("\n--- summary ---");
  console.log(`${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    for (const f of failed) console.log(`  × ${f.name}: ${f.detail}`);
    process.exit(1);
  }
}

main();
