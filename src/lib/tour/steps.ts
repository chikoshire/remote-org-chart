export type ProductTourStep = {
  id: string;
  /** Matches `data-tour` on a shell element. Omit for centered welcome. */
  target?: string;
  title: string;
  body: string;
};

export const PRODUCT_TOUR_STEPS: ProductTourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Acme",
    body: "A short tour of the header and workspace. Restart anytime from Help, Settings shortcuts, or the chat assistant.",
  },
  {
    id: "primary-nav",
    target: "primary-nav",
    title: "Primary navigation",
    body: "Dashboard, Org Chart, and People: the three main surfaces for exploring the organisation.",
  },
  {
    id: "command-search",
    target: "command-search",
    title: "Jump anywhere",
    body: "Search for a person or page. On desktop use ⌘K (Ctrl+K); on phone tap the search icon.",
  },
  {
    id: "health",
    target: "health",
    title: "Data Health",
    body: "Opens cycles, missing managers, and incomplete profiles so you can trust the chart.",
  },
  {
    id: "help",
    target: "help",
    title: "Help",
    body: "How-tos with annotated screenshots. The floating ? opens a quick assistant.",
  },
  {
    id: "settings",
    target: "settings",
    title: "Settings",
    body: "Remote connection, chart preferences, keyboard shortcuts, and sign out.",
  },
  {
    id: "main",
    target: "main",
    title: "Your workspace",
    body: "Each page fills this area. On phones the Org Chart panel starts collapsed so the chart stays tall.",
  },
  {
    id: "help-chat",
    target: "help-chat",
    title: "Ask as you go",
    body: "The assistant answers from Help docs. Say “start the product tour” or tap Restart tour anytime.",
  },
];
