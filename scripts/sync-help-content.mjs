#!/usr/bin/env node
/**
 * Sync docs/help/*.md → src/lib/help/content.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "docs/help";
const order = [
  "overview",
  "dashboard",
  "org-chart",
  "people",
  "data-health",
  "settings",
  "sync",
];
const titles = {
  overview: "Overview",
  dashboard: "Dashboard",
  "org-chart": "Org Chart",
  people: "People",
  "data-health": "Data Health",
  settings: "Settings",
  sync: "Sync and Refresh",
};

function esc(s) {
  return JSON.stringify(s);
}

const pages = order.map((slug) => {
  const md = readFileSync(join(dir, `${slug}.md`), "utf8");
  return `  ${esc(slug)}: {\n    slug: ${esc(slug)},\n    title: ${esc(titles[slug])},\n    markdown: ${esc(md)},\n  }`;
});

const out = `/** Bundled Help KB (keep in sync with docs/help/*.md) */

export type HelpPage = {
  slug: string;
  title: string;
  markdown: string;
};

export const HELP_PAGE_SLUGS = ${JSON.stringify(order)} as const;

export type HelpPageSlug = (typeof HELP_PAGE_SLUGS)[number];

export const HELP_PAGES: Record<HelpPageSlug, HelpPage> = {
${pages.join(",\n")}
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
`;

writeFileSync("src/lib/help/content.ts", out);
console.log(`help:sync wrote ${order.length} pages → src/lib/help/content.ts`);
