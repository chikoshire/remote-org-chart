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
    markdown: "# Acme Org Chart overview\n\nAcme Org Chart helps you explore how **Acme** is organised. It reads employments from the **Remote** API and builds a manager-to-reports hierarchy you can open in the browser.\n\n{{shot:chrome-health}}\n\n## Sign in\n\nSign in with your Acme credentials. After login you land on the Dashboard and a short **product tour** highlights the header (nav, search, Health, Help, Settings). You can restart the tour from this Help index, any Help topic, or the chat assistant (\"Restart tour\").\n\nRemote API tokens never appear in the login form. They stay on the server.\n\n## Source of truth\n\n- Live org data comes from Remote (read-only for everyday chart loads).\n- The app caches a snapshot so later loads stay fast.\n- **Refresh from Remote** on Org Chart, Dashboard, or Data Health forces a fresh rebuild.\n- Local profile edits: department/manager can write back to Remote (write token). Title/country often stay as browser overlays on active employments.\n\n## Where to go\n\n| Surface | Path |\n|---------|------|\n| Dashboard | `/app/dashboard` |\n| Org Chart | `/app` |\n| People | `/app/people` |\n| Data Health (Health in the header) | `/settings/data-health` |\n| Help (Help in the header) | `/help` |\n| Settings | `/settings` |\n\nPress **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) for the command bar: callout **1** in the header shot above.\n",
  },
  "dashboard": {
    slug: "dashboard",
    title: "Dashboard",
    markdown: "# Dashboard\n\nThe Dashboard is the at-a-glance view of Acme’s organisation.\n\n{{shot:dashboard-overview}}\n\n## What you see\n\n- **People (callout 1):** active employment headcount — opens People\n- **Departments (callout 1):** how many teams appear — opens Org Chart with the Department menu expanded\n- **Managers (callout 1):** people with direct reports\n- **Completeness (callout 1):** share of profiles with title, department, and country — opens Data Health\n- **Headcount by department / country (callouts 3–4):** visual breakdowns with deep links into Chart / Map\n- **Attention:** shortcuts into Data Health or incomplete People filters\n\n## Refresh from Remote\n\nNext to the synced timestamp (**callout 2**), use **Refresh from Remote** to bypass the cache and rebuild the org snapshot. The timestamp means the last successful Remote pull. While refreshing, the previous dashboard data stays on screen. If refresh fails, you keep that snapshot and see an error note.\n\n## Jumping elsewhere\n\nKPI cards and attention rows navigate into Org Chart, People, or Data Health. The Departments card opens Org Chart with the Department filter menu already expanded so you can pick a team right away.\n",
  },
  "org-chart": {
    slug: "org-chart",
    title: "Org Chart",
    markdown: "# Org Chart\n\nInteractive reporting hierarchy for Acme.\n\n{{shot:org-chart-workspace}}\n\n## Views\n\n- **Chart (callout 1):** canvas with pan, zoom, and collapse\n- **Tree (callout 1):** indented list of the same hierarchy\n- **Map (callout 1):** people by country (scroll-zoom stays on the map)\n\n## Find someone\n\n- Use the search box (**callout 3**, or `/` to focus it)\n- Selecting a person highlights their **path to root**\n- **Copy link** shares a deep link (`?person=…`)\n- Keyboard: ↑ manager, ↓ first report, ←/→ siblings, Esc clears search then selection\n- Incomplete badges on cards (**callout 5**) match issues listed under **Health**\n\n## Compare reporting distance\n\nOpen **Compare** (**callout 4**, or `?compare=1`, or ⌘K then Compare). Pick Person 1 and Person 2 to see how they connect through the tree. Clear or Exit when done.\n\n## Refresh and live updates\n\n- **Refresh (callout 2)** pulls a fresh snapshot from Remote\n- Live update badges and the sync log reflect webhook or cache activity when available\n- Incomplete, Unlinked, and Cycle badges flag data-quality issues. Open **Health** in the header for the full lists.\n",
  },
  "people": {
    slug: "people",
    title: "People",
    markdown: "# People\n\nDirectory of everyone in the active employment set.\n\n{{shot:people-directory}}\n\n## Browse\n\n- **Grid** or **List** layout (**callout 1**)\n- Filter by **department**\n- Incomplete filter (**callout 2**, from Dashboard / Data Health) focuses thin profiles\n- Search (**callout 3**) by name, title, or department\n\n## Profiles\n\nOpen a person via **Full profile** (**callout 4**) for title, department, country, manager, and avatar. From Data Health, **Fix in profile** deep-links here.\n\n## Local profile fixes\n\n**Save to Remote** writes department and manager through a server-side write token (`REMOTE_API_WRITE_TOKEN`). Job title and country are often blocked on **active** Global Payroll employments (Remote expects a contract amendment), so those fields fall back to a **local browser overlay** until Remote allows the change. Clearing local overlays restores the last Remote snapshot for those fields only.\n",
  },
  "data-health": {
    slug: "data-health",
    title: "Data Health",
    markdown: "# Data Health\n\nTrust view for reporting edges and thin profiles. Open it from the **Health** control in the header (between search and Help / Settings).\n\n{{shot:data-health}}\n\n## Issue types\n\n- **Reporting cycles (callout 1):** looped manager chains\n- **Manager missing (callout 1):** manager id set but person not in the active set\n- **Incomplete profiles (callout 1):** missing title, department, and/or country\n\n## Fix in profile\n\nEach card (**callout 3**) links to the People profile where you can fill missing fields. **Save to Remote** persists department and manager when a write token is configured. Title and country may stay as local overlays on active employments.\n\n## Refresh from Remote\n\nUse **Refresh from Remote** (**callout 2**) beside the intro copy to force a new Remote sync. The Sync KPI shows the last successful pull. Refresh keeps prior data if the rebuild fails.\n",
  },
  "settings": {
    slug: "settings",
    title: "Settings",
    markdown: "# Settings\n\nPreferences and Remote connection. Open the **gear** after Health and Help in the header.\n\n{{shot:settings}}\n\n## Remote connect\n\nThe Connect wizard (**callout 2**) resumes org data using the **server-side** Remote token. You never paste an API token in the browser. Disconnect pauses org fetch in this session. Connect turns it back on.\n\n## Appearance\n\nToggle density preferences (**callout 3**). Preferences persist on this device.\n\n## Session\n\n**Log out** lives under Settings → Session (**callout 1 / 3**, not in the main header). Logout clears the session cookie and returns to the marketing landing.\n\nData Health is not under Settings. Open it from the **Health** control in the header.\n",
  },
  "sync": {
    slug: "sync",
    title: "Sync and Refresh",
    markdown: "# Sync and Refresh\n\n{{shot:dashboard-overview}}\n\n## What “synced …” means\n\nThe timestamp is the last time the app successfully built (or served) an org snapshot from Remote. Cached responses still show that snapshot’s time — see **callout 2** on the Dashboard (Refresh from Remote).\n\n## Cache\n\nProduction stores the hierarchy in **Cloudflare KV** (about 15 minutes of typical reuse). Cold builds take longer because each employment is enriched for manager IDs.\n\n## Refresh from Remote\n\nAvailable on:\n\n1. **Org Chart:** Refresh control in the sidebar\n2. **Dashboard:** Refresh from Remote next to the synced line (**callout 2**)\n3. **Data Health / Health:** same control next to the intro\n\nAll three call `/api/org-chart?refresh=1`, rewrite the snapshot, and update the session cache used by other surfaces. If refresh fails, the previous chart or data stays visible.\n",
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
