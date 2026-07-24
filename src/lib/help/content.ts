/** Bundled Help KB (keep in sync with docs/help/*.md) */

export type HelpPage = {
  slug: string;
  title: string;
  markdown: string;
};

export const HELP_PAGE_SLUGS = ["overview","dashboard","org-chart","people","data-health","settings","sync"] as const;

export type HelpPageSlug = (typeof HELP_PAGE_SLUGS)[number];

export const HELP_PAGES: Record<HelpPageSlug, HelpPage> = {
  "overview": {
    slug: "overview",
    title: "Overview",
    markdown: "# Acme Org Chart overview\n\nAcme Org Chart helps you explore how **Acme Sandbox Corp** is organised. It reads employments from the **Remote sandbox** API and builds a manager-to-reports hierarchy you can open in the browser.\n\n## Sign in\n\nUse the **demo credentials shared privately** with your interview invite. After login you land on the Dashboard. Remote API tokens never appear in the login form. They stay on the server.\n\n## Source of truth\n\n- Live org data comes from Remote (read-only).\n- The app caches a snapshot so later loads stay fast.\n- **Refresh from Remote** on Org Chart, Dashboard, or Data Health forces a fresh rebuild.\n- Local profile edits (People / Data Health “Fix in profile”) stay on this browser only. They are **not** written back to Remote.\n\n## Where to go\n\n| Surface | Path |\n|---------|------|\n| Dashboard | `/app/dashboard` |\n| Org Chart | `/app` |\n| People | `/app/people` |\n| Data Health | `/settings/data-health` |\n| Settings | `/settings` |\n| Help | `/help` |\n\nPress **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) for the command bar.\n",
  },
  "dashboard": {
    slug: "dashboard",
    title: "Dashboard",
    markdown: "# Dashboard\n\nThe Dashboard is the at-a-glance view of Acme’s organisation.\n\n## What you see\n\n- **People:** active employment headcount\n- **Departments:** how many teams appear in the data\n- **Managers:** people with direct reports\n- **Completeness:** share of profiles with title, department, and country filled in\n- **Headcount by department / country:** visual breakdowns\n- **Attention:** shortcuts into Data Health or incomplete People filters\n\n## Refresh from Remote\n\nNext to the synced timestamp, use **Refresh from Remote** to bypass the cache and rebuild the org snapshot. The timestamp means the last successful Remote pull. While refreshing, the previous dashboard data stays on screen. If refresh fails, you keep that snapshot and see an error note.\n\n## Jumping elsewhere\n\nKPI cards and attention rows navigate into Org Chart, People, or Data Health. The Departments card opens Org Chart with the Department filter menu already expanded so you can pick a team right away.\n",
  },
  "org-chart": {
    slug: "org-chart",
    title: "Org Chart",
    markdown: "# Org Chart\n\nInteractive reporting hierarchy for Acme Sandbox Corp.\n\n## Views\n\n- **Chart:** canvas with pan, zoom, and collapse\n- **Tree:** indented list of the same hierarchy\n- **Map:** people by country (scroll-zoom stays on the map)\n\n## Find someone\n\n- Use the search box (or `/` to focus it)\n- Selecting a person highlights their **path to root**\n- **Copy link** shares a deep link (`?person=…`)\n- Keyboard: ↑ manager, ↓ first report, ←/→ siblings, Esc clears search then selection\n\n## Compare reporting distance\n\nOpen **Compare** (or `?compare=1`, or ⌘K then Compare). Pick Person 1 and Person 2 to see how they connect through the tree. Clear or Exit when done.\n\n## Refresh and live updates\n\n- **Refresh** pulls a fresh snapshot from Remote\n- Live update badges and the sync log reflect webhook or cache activity when available\n- Incomplete, Unlinked, and Cycle badges flag data-quality issues. Open Data Health for the full lists.\n",
  },
  "people": {
    slug: "people",
    title: "People",
    markdown: "# People\n\nDirectory of everyone in the active employment set.\n\n## Browse\n\n- **Grid** or **List** layout\n- Filter by **department**\n- Incomplete filter (from Dashboard / Data Health) focuses thin profiles\n\n## Profiles\n\nOpen a person for title, department, country, manager, and avatar. From Data Health, **Fix in profile** deep-links here.\n\n## Local profile fixes\n\nThe Remote sandbox token used by this app is **read-only**, so edits you make on a profile (title, department, country, manager) are saved **locally in this browser**. They update the chart and health views immediately, but they are not written back to Remote. Clearing site data removes local overlays.\n",
  },
  "data-health": {
    slug: "data-health",
    title: "Data Health",
    markdown: "# Data Health\n\nTrust view for reporting edges and thin profiles. Path: **Settings → Data Health** (`/settings/data-health`).\n\n## Issue types\n\n- **Reporting cycles:** looped manager chains\n- **Manager missing:** manager id set but person not in the active set\n- **Incomplete profiles:** missing title, department, and/or country\n\n## Fix in profile\n\nEach card links to the People profile where you can fill missing fields. Changes are **local overlays** (read-only Remote token). They improve the demo experience but do not update Remote.\n\n## Refresh from Remote\n\nUse **Refresh from Remote** beside the intro copy to force a new Remote sync. The Sync KPI shows the last successful pull. Refresh keeps prior data if the rebuild fails.\n",
  },
  "settings": {
    slug: "settings",
    title: "Settings",
    markdown: "# Settings\n\nPreferences and Remote connection for the demo app.\n\n## Remote connect\n\nThe Connect wizard resumes org data using the **server-side** read-only Remote token. You never paste an API token in the browser. Disconnect pauses org fetch in this session. Connect turns it back on.\n\n## Appearance\n\nToggle density preferences. Preferences persist on this device.\n\n## Session\n\n**Log out** lives under Settings → Session (not in the main header). Logout clears the demo session cookie and returns to the marketing landing.\n\n## Data Health\n\nSettings also hosts the Data Health surface for cycles, missing managers, and incomplete profiles.\n",
  },
  "sync": {
    slug: "sync",
    title: "Sync and Refresh",
    markdown: "# Sync and Refresh\n\n## What “synced …” means\n\nThe timestamp is the last time the app successfully built (or served) an org snapshot from Remote. Cached responses still show that snapshot’s time.\n\n## Cache\n\nProduction stores the hierarchy in **Cloudflare KV** (about 15 minutes of typical reuse). Cold builds take longer because each employment is enriched for manager IDs.\n\n## Refresh from Remote\n\nAvailable on:\n\n1. **Org Chart:** Refresh control in the sidebar\n2. **Dashboard:** Refresh from Remote next to the synced line\n3. **Data Health:** same control next to the intro\n\nAll three call `/api/org-chart?refresh=1`, rewrite the snapshot, and update the session cache used by other surfaces. If refresh fails, the previous chart or data stays visible.\n",
  }
};

export function listHelpPages(): HelpPage[] {
  return HELP_PAGE_SLUGS.map((slug) => HELP_PAGES[slug]);
}

export function getHelpPage(slug: string): HelpPage | null {
  if ((HELP_PAGE_SLUGS as readonly string[]).includes(slug)) {
    return HELP_PAGES[slug as HelpPageSlug];
  }
  return null;
}
