import type { HelpShotProps } from "@/components/help/HelpShot";

/**
 * Annotated product screenshots referenced from Help markdown via `{{shot:id}}`.
 * Positions are % of the image box (left/top) for full viewport captures (~1440×900),
 * except `chrome-health` which is a header-only crop.
 */
export const HELP_SHOTS: Record<string, HelpShotProps> = {
  "chrome-health": {
    src: "/help/chrome-search-health-settings.png",
    alt: "Top bar with search, Health, Help, and Settings",
    lead: "Header utilities — search, Health, Help, then Settings.",
    marks: [
      {
        x: 68,
        y: 50,
        label: "1",
        caption: "Command search (⌘K) — jump to a person or page.",
        pointer: "s",
      },
      {
        x: 82,
        y: 50,
        label: "2",
        caption:
          "Health — opens Data Health (cycles, missing managers, incomplete profiles).",
        pointer: "s",
      },
      {
        x: 88,
        y: 50,
        label: "3",
        caption:
          "Help — annotated how-tos and the product tour restart entry point.",
        pointer: "s",
      },
      {
        x: 95,
        y: 50,
        label: "4",
        caption: "Settings gear — Connect, appearance, and Log out.",
        pointer: "s",
      },
    ],
  },
  "dashboard-overview": {
    src: "/help/dashboard.png",
    alt: "Dashboard with KPI cards and headcount charts",
    lead: "Dashboard — headcount, completeness, and charts.",
    marks: [
      {
        x: 22,
        y: 34,
        label: "1",
        caption:
          "KPI row — People, Departments, Managers, Completeness. Click to jump into Chart, People, or Health.",
        pointer: "n",
      },
      {
        x: 90,
        y: 18,
        label: "2",
        caption:
          "Refresh from Remote — bypasses cache and rebuilds the org snapshot.",
        pointer: "ne",
      },
      {
        x: 28,
        y: 68,
        label: "3",
        caption:
          "Headcount by department — open Org Chart with Department filter ready.",
        pointer: "sw",
      },
      {
        x: 72,
        y: 68,
        label: "4",
        caption:
          "Headcount by country — deep-links into Map with that country selected.",
        pointer: "se",
      },
    ],
  },
  "org-chart-workspace": {
    src: "/help/org-chart.png",
    alt: "Org Chart workspace with Chart view and person cards",
    lead: "Org Chart — Chart / Tree / Map workspace.",
    marks: [
      {
        x: 10,
        y: 16,
        label: "1",
        caption: "View switcher — Chart, Tree, or Map.",
        pointer: "w",
      },
      {
        x: 10,
        y: 26,
        label: "2",
        caption: "Refresh — rebuild the org snapshot from Remote.",
        pointer: "w",
      },
      {
        x: 12,
        y: 46,
        label: "3",
        caption:
          "Filters + search — department, country, title, or name (`/` focuses search).",
        pointer: "w",
      },
      {
        x: 12,
        y: 70,
        label: "4",
        caption: "Compare — pick two people to see reporting distance.",
        pointer: "sw",
      },
      {
        x: 55,
        y: 48,
        label: "5",
        caption:
          "Person cards — Incomplete / Dept not set badges flag Data Health issues.",
        pointer: "n",
      },
    ],
  },
  "people-directory": {
    src: "/help/people.png",
    alt: "People directory grid with filters",
    lead: "People — browse and open profiles.",
    marks: [
      {
        x: 72,
        y: 16,
        label: "1",
        caption: "Grid / List layout toggle.",
        pointer: "n",
      },
      {
        x: 82,
        y: 16,
        label: "2",
        caption:
          "Incomplete filter — thin profiles missing title, department, or country.",
        pointer: "ne",
      },
      {
        x: 40,
        y: 24,
        label: "3",
        caption: "Filter by name, title, or department.",
        pointer: "n",
      },
      {
        x: 22,
        y: 72,
        label: "4",
        caption:
          "Full profile — Save to Remote (department/manager) with local overlay fallback for blocked fields.",
        pointer: "sw",
      },
    ],
  },
  "data-health": {
    src: "/help/data-health.png",
    alt: "Data Health issue lists and Fix in profile links",
    lead: "Data Health — trust view for reporting edges.",
    marks: [
      {
        x: 55,
        y: 34,
        label: "1",
        caption: "Issue counts — people, roots, open issues, last sync.",
        pointer: "n",
      },
      {
        x: 90,
        y: 22,
        label: "2",
        caption: "Refresh from Remote — same rebuild as Dashboard / Org Chart.",
        pointer: "ne",
      },
      {
        x: 30,
        y: 68,
        label: "3",
        caption:
          "Issue cards — Fix in profile opens People with that person selected.",
        pointer: "sw",
      },
    ],
  },
  "settings": {
    src: "/help/settings.png",
    alt: "Settings with Remote connect and appearance",
    lead: "Settings — connection, density, and session.",
    marks: [
      {
        x: 18,
        y: 14,
        label: "1",
        caption: "Settings subnav — Preferences and Data Health.",
        pointer: "nw",
      },
      {
        x: 40,
        y: 40,
        label: "2",
        caption:
          "Remote Connect — uses the server-side token; nothing pasted in the browser.",
        pointer: "n",
      },
      {
        x: 30,
        y: 72,
        label: "3",
        caption: "Chart preferences — density, live updates, Save.",
        pointer: "sw",
      },
    ],
  },
};

export function getHelpShot(id: string): HelpShotProps | null {
  return HELP_SHOTS[id] ?? null;
}
