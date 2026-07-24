import {
  getHelpPage,
  listHelpPages,
  type HelpPage,
  type HelpPageSlug,
  HELP_PAGE_SLUGS,
} from "@/lib/help/content";

export type { HelpPage, HelpPageSlug };
export { HELP_PAGE_SLUGS, getHelpPage, listHelpPages };

/** Keyword overlap retrieval for the Help assistant. */
export function retrieveHelpChunks(query: string, limit = 3): HelpPage[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
  if (terms.length === 0) return listHelpPages().slice(0, limit);

  const scored = listHelpPages().map((page) => {
    const hay = `${page.title}\n${page.markdown}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (hay.includes(term)) score += 1;
      if (page.title.toLowerCase().includes(term)) score += 2;
    }
    return { page, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.page);
}
