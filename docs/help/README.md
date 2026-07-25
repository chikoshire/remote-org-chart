# In-app Help

Markdown how-tos for Acme Org Chart. These pages also ground the floating Help assistant.

Annotated screenshots live in `public/help/` and are referenced from markdown with `{{shot:id}}` (see `src/lib/help/shots.ts`). After editing `docs/help/*.md`, run `npm run help:sync` to refresh `src/lib/help/content.ts`.

| Page | File |
|------|------|
| [Overview](./overview.md) | Product intro and navigation |
| [Dashboard](./dashboard.md) | KPIs and Refresh |
| [Org Chart](./org-chart.md) | Chart / Tree / Map, compare |
| [People](./people.md) | Directory and local profile fixes |
| [Data Health](./data-health.md) | Issues and Fix in profile |
| [Settings](./settings.md) | Connect, theme, Log out |
| [Sync](./sync.md) | Cache + Refresh everywhere |

Engineering rationale lives in [`DECISIONS.md`](../../DECISIONS.md) (not required for end users).
