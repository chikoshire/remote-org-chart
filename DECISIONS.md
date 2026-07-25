# Decision log

Living document for the Remote org-chart assessment.  
Update this file whenever we lock (or reverse) a meaningful choice. Prefer **why** over **what**.

Format for new entries:

```md
## YYYY-MM-DD — Short title
**Status:** Accepted | Superseded | Proposed  
**Context:** …  
**Decision:** …  
**Consequences:** …  
**Revisit when:** …
```

---

## 2026-07-23 — Public host: Cloudflare (not Vercel)

**Status:** Accepted  

**Context:**  
The assessment brief lists a *suggested* stack that includes Vercel. The hard requirement is a **public deploy** the interview team can open — not a specific CDN vendor. Preference is Cloudflare / Wrangler over Vercel.

**Decision:**  
Ship on **Cloudflare** (Pages/Workers via Wrangler, Next.js via the Cloudflare/OpenNext path). Store `REMOTE_API_TOKEN` and `REMOTE_API_BASE_URL` as Cloudflare secrets. Branch: `feat/deploy-cloudflare` ([#8](https://github.com/chikoshire/remote-org-chart/issues/8)).

**Consequences:**  
- Slightly more setup than `vercel deploy`, but matches preferred tooling and existing Cloudflare skills/MCP.  
- Need to validate Next.js App Router + server routes behave correctly on the Cloudflare adapter early (smoke during scaffold or a thin deploy spike).  
- README and handoff links point at a `*.pages.dev` / custom Cloudflare URL, not Vercel.

**Revisit when:**  
Cloudflare adapter blocks a must-have Next.js feature with no workaround — only then reconsider Vercel as a fallback host (still not “required by brief”).

---

## 2026-07-23 — No Supabase for the core product (for now)

**Status:** Accepted  

**Context:**  
We considered a free Supabase project for “extra” capabilities. The org chart’s source of truth is the **Remote sandbox REST API** (employments → manager hierarchy). Hosting and secrets are already covered by Cloudflare. Adding Supabase without a concrete job creates another account, another secret surface, and another failure mode for a time-boxed assessment.

**Decision:**  
**Do not** provision Supabase for the MVP / brief path or for Tier 1 stretch UX.  

If we need persistence for employment **snapshots**, sync timestamps, or sync-run logs, prefer **Cloudflare-native storage** first:

| Need | Prefer |
|------|--------|
| Cached employment JSON / ETag | **KV** |
| Structured sync runs, counts, errors | **D1** |
| Strong consistency / multi-row events | **D1** (or Supabase later) |

**Why not Supabase yet (detailed):**

1. **Remote already is the HRIS database.** Duplicating people/managers into Postgres without a sync story invites stale UI and “which source is right?” confusion in a demo.  
2. **Hosting doesn’t need it.** Cloudflare secrets + Workers/Pages replace the usual “Vercel + Supabase” tutorial pairing.  
3. **Cache ≠ Postgres.** A read-through cache with TTL / manual refresh is an edge/KV problem, not a relational schema problem.  
4. **Assessment signal.** Interviewers care that we integrate Remote correctly (auth, paging, edge cases). A second BaaS that isn’t doing Remote-shaped work looks like scope padding unless it enables webhooks/realtime.  
5. **Operational cost.** Free tier is fine until it isn’t (paused projects, JWT rotation). Fewer moving parts = more reliable live demo.  
6. **We already hit Orbit’s Supabase JWT elsewhere** — proof that extra Supabase sessions are real operational friction.

**When Supabase *would* earn a seat (Tier 3):**

- Verified **Remote webhooks** (`employment.*`) with HMAC, idempotent event inbox, and queryable delivery history.  
- **Realtime fanout** to open browser tabs when the org changes (Supabase Realtime), *or* we consciously choose Worker SSE instead.  
- We want SQL-shaped ops debugging that outgrows a thin D1 log.

Until we explicitly commit to that webhook + live-update story, Supabase stays **out**.

**Consequences:**  
- Stretch “snapshot / last synced” work targets KV/D1 issues, not Supabase.  
- Decision must be revisited in this file if we open Tier 3 webhook work.  
- README states “Supabase: default off” so reviewers don’t look for a `.env` they won’t find.

**Revisit when:**  
We schedule Tier 3 webhook + live chart work, or KV/D1 proves insufficient for event idempotency/history.

---

## 2026-07-23 — App data path: Remote REST only (MCP is not runtime)

**Status:** Accepted  

**Context:**  
Remote MCP is excellent for exploration during development. The assessment asks for a headless HRIS app with a Bearer token.

**Decision:**  
Runtime data path = **REST** via server routes (`REMOTE_API_*`). MCP is for AI-assisted exploration only, never wired into production request handlers.

**Consequences:**  
Clearer security story; works on Cloudflare without depending on MCP OAuth; matches customer-integration patterns from Remote’s docs.

**Revisit when:**  
Never for this assessment deliverable.

---

## 2026-07-23 — Auth: customer sandbox API token, read-only

**Status:** Accepted  

**Context:**  
Org chart is read-only. Token is generated in Company settings → Integrations & APIs → Remote API.

**Decision:**  
Use a **read-only** customer token (`ra_test_…`) against `https://gateway.remote-sandbox.com`. Never expose it to the browser. Prefer verifying with `/v1/employments`, not partner-only `/v1/companies`.

**Consequences:**  
Least privilege; avoids accidental writes; aligns with assessment scope.

**Revisit when:**  
Tier 3 webhooks need a token/scopes that can manage webhook subscriptions (may still be the same admin token with broader scopes — document then).

---

## 2026-07-23 — UI stack: Next.js + React Flow + Dagre + Zod + Vitest

**Status:** Accepted  

**Context:**  
Brief suggests Next.js, TypeScript, Tailwind, React Flow (+ Dagre/ELK), Zod, Vitest. Fits interactive org charts and typed API boundaries.

**Decision:**  
Adopt that application stack. Start with **Dagre**; evaluate **ELK** only if layout quality fails on sandbox volume. Zod validates Remote payloads at the boundary. Vitest covers pure hierarchy logic (cycles, orphans, multi-root).

**Consequences:**  
Fast path to a credible interactive chart; tests prove edge cases without Playwright for the core algorithm.

**Revisit when:**  
Layout failures at real Acme Sandbox Corp scale, or Cloudflare adapter forces a different React server model.

---

## 2026-07-23 — Feature branches vs UX/UI branches

**Status:** Accepted  

**Context:**  
Want reviewable PRs and clear issue tracking across GitHub / Linear / Orbit.

**Decision:**  
Separate `feat/*` / `chore/*` / `docs/*` from `ui/*`. Behavior and data land on feature branches; Norma chrome, nodes, edges, motion on UI branches. Stretch “brief + wow” work uses `feat/*` or `stretch/*` branches labeled `stretch`.

**Consequences:**  
More PRs, clearer diffs, comments stay human and product-focused (no agent slash-commands in public notes).

**Revisit when:**  
Never unless PR overhead becomes absurd for tiny token-only changes.

---

## 2026-07-23 — Product ambition: brief + wow tiers

**Status:** Accepted  

**Context:**  
Goal is not “minimum checklist.” Hit the brief excellently, then add memorable HRIS product depth.

**Decision:**  
Work in tiers (tracked as GitHub issues):

| Tier | Intent | Persistence |
|------|--------|-------------|
| **0** | Brief excellence (proxy, hierarchy, chart, edge cases, Cloudflare, README) | None beyond Remote |
| **1** | Insights, filters, drawer, deep links, collapse, export, LCA | None |
| **2** | Snapshot cache, refresh, sync log | Cloudflare KV/D1 |
| **3** | Webhooks, live updates, rich event history | D1 and/or Supabase (only if Realtime/SQL wins) |

**Consequences:**  
Ship Tier 0 before polish addiction. Tier 1 is the main “blow them away” UX. Tier 2 protects the live demo. Tier 3 is the API flex — scheduled deliberately.

**Revisit when:**  
Time pressure forces cutting Tier 1 items — cut Tier 3 first, then lowest-ROI Tier 1 (export before insights).

---

## 2026-07-23 — Tracking surfaces

**Status:** Accepted (updated)  

**Context:**  
Want Linear + Orbit + GitHub visibility. Linear quota was restored; Orbit JWT refreshes via Orbit Main `/mcp/session`. Day-to-day preference is **Linear** as the board of record.

**Decision:**  
- **Canonical work ID = GitHub `#N` (`GH#N`)** — titles on Linear/Orbit include `· GH#N` so search matches across tools.  
- Linear/Orbit auto-IDs (`TUXX-…`, `TUX-…`) will **never** numerically equal `1…32`; do not expect that.  
- Sub-work lives as **Linear children** (`[sub · GH#N] Layer — …`); GitHub + Orbit parents get checklist comments.  
- Living map: [`ISSUES.md`](./ISSUES.md). This `DECISIONS.md` remains the durable “why” log.

**Consequences:**  
Cross-tool sync is by `GH#N` string, not by matching integers. Interviewers can still follow GitHub; you can drive status from Linear.

**Revisit when:**  
Only if we adopt a formal Linear↔GitHub sync product that remaps IDs.

---

## 2026-07-23 — Git identity: personal GitHub author only

**Status:** Accepted  

**Context:**  
Early commits on `main` were authored as “Night Shift Agent” (`nightshift@openclaw.ai`) and included a `Co-authored-by: Cursor <cursoragent@cursor.com>` trailer. That surfaced on the GitHub repo as agent activity, which we do not want for this assessment.

**Decision:**  
- Rewrite existing `main` history so every commit is **Chiko Shire** `<97911688+chikoshire@users.noreply.github.com>`, with Cursor co-author trailers removed.  
- Future commits in this repo must use that same author/committer identity (via per-command env overrides if the machine gitconfig still points at an agent).  
- Do not add `Co-authored-by: Cursor` (or similar agent trailers) to commit messages.

**Consequences:**  
History was force-pushed once to correct attribution. Machine-level `~/.gitconfig` may still name an agent — fix that locally so everyday `git commit` stays clean without overrides.

**Revisit when:**  
Never for agent branding; only if the GitHub noreply address should be replaced with a verified personal email.

---

## 2026-07-24 — Acme brand + dual view (polish later)

**Status:** Accepted (shipped GH#43)

**Context:**  
Norma / Remote product chrome was an early convenience choice, not a brief requirement. The app is an **Acme Sandbox Corp** headless HRIS surface that reads Remote — not a Remote marketing skin. Visual feedback: current chart hits the brief but feels thin; desired brand direction is Markel / Neuro (warm orange, deep teal–navy, soft grain gradients, geometric sans). LinkedIn is UX inspiration for *people discovery*, not a replacement for the org graph.

**Decision:**  
- Keep the **interactive org graph** as the primary, brief-compliant view.  
- Re-theme CSS variables (class prefix still `norma-*`) to Acme Markel/Neuro: orange `#e85d04`, teal–navy `#0b2a32`, spray teal `#2a9d8f`, grain canvas. Fonts: Outfit + DM Sans.  
- **Chart | Directory** toggle — directory is LinkedIn-style people cards over the same employment payload; “Show in chart” returns to the graph.  
- Profile photos / work history only where Remote actually returns them; otherwise initials + available fields.

**Consequences:**  
Welcome + chart chrome share Acme cues. Interviewers get both hierarchy and people-browse without a second data source.

**Revisit when:**  
Remote exposes avatars or richer profile fields worth surfacing in the directory.

---

## 2026-07-24 — Org chart snapshot cache in Cloudflare KV

**Status:** Accepted  

**Context:**  
Cold `/api/org-chart` builds take 15–25s (employment detail fan-out under Workers Free). Interviewers and demos need a fast second load without adding Supabase.

**Decision:**  
Store the **derived hierarchy JSON** (emails already stripped) in Cloudflare KV binding `ORG_CHART_CACHE`, key `org-chart:v1:active`.

| Policy | Value |
|--------|-------|
| TTL | **15 minutes** (`expirationTtl`) |
| Cache miss | Fetch Remote → write snapshot → return `source: "remote"` |
| Cache hit | Return snapshot with `lastSyncedAt`, `cached: true` |
| Manual refresh | `GET /api/org-chart?refresh=1` bypasses KV read, rewrites on success; failed refresh leaves prior KV entry intact |
| Local `next dev` | No KV binding → always live Remote (same as miss) |

**Consequences:**  
UI shows last-synced + **Refresh from Remote**. Tier 3 webhooks (#27+) can invalidate/rewrite this key later.

**Revisit when:**  
TTL feels wrong in demos, or we add D1 sync-run history (#26).

---

## 2026-07-24 — Sync run log in Cloudflare D1

**Status:** Accepted  

**Context:**  
After KV snapshot caching, we still need an ops trail of cold fetches, refreshes, cache hits, and failures — without Supabase.

**Decision:**  
D1 database `remote-org-chart-sync` (binding `SYNC_RUNS_DB`), table `sync_runs`:

| Column | Notes |
|--------|-------|
| `started_at` / `finished_at` | ISO timestamps |
| `ok` | 0/1 |
| `employment_count` | nullable on failure |
| `error_summary` | sanitized (tokens redacted), max ~400 chars |
| `trigger` | `cold` \| `refresh` \| `cache_hit` |

`GET /api/sync-runs` returns the last N rows (summaries only). UI: **Sync log** panel on the chart.

**Consequences:**  
Local `next dev` without D1 returns an empty list. Migrations live in `/migrations`.

**Revisit when:**  
Webhooks (#27) need a richer event inbox (#29).

---

## 2026-07-24 — Webhook inbox in D1 (not Supabase)

**Status:** Accepted  

**Context:**  
Tier 3 employment webhooks need HMAC verification, idempotent storage, and snapshot invalidation. Supabase was previously deferred; D1 already powers sync runs.

**Decision:**  
- Receiver: `POST /api/webhooks/remote` — verify `X-Remote-Signature` before parse.  
- Secret: `REMOTE_WEBHOOK_SIGNING_KEY` (Wrangler secret / `.env.local`) — never in git.  
- Inbox: D1 table `webhook_events` (same DB as sync runs), unique `delivery_key`.  
- On `employment.*`: delete KV org-chart snapshot so the next load rebuilds.  
- Live updates (#28): optional **Live** toggle uses SSE `/api/org-chart/stream` (KV notify stamp), not Supabase Realtime.  
- Event UI (#29): **Webhook events** panel + `GET /api/webhooks/events`.

**Consequences:**  
Subscription (`POST /v1/webhook-callbacks`) needs a **write-scoped** company token (`webhook:write` / `company_admin` / `all:write`). The app’s read-only `REMOTE_API_TOKEN` (`all:read`) correctly 403s. Use a separate short-lived `REMOTE_WEBHOOK_ADMIN_TOKEN` with `./scripts/subscribe-remote-webhook.sh` (GH#44). Signing key is shown once at subscribe time — store as Wrangler `REMOTE_WEBHOOK_SIGNING_KEY`.

**Revisit when:**  
Write-scoped sandbox token is available and subscription is created for the live Workers URL.

---

## 2026-07-24 — Product shell overhaul; drop PNG/SVG from UI

**Status:** Accepted  

**Context:**  
Stretch export (#22) and other tools lived in a floating stack over React Flow. That made the chart cramped, default `fitView` unreadably small at ~149 nodes, and branding repeated across header/page/footer. PNG/SVG export was interview flex, not core to the brief.

**Decision:**  
Ship a fuller **product shell**: top nav (Acme once · Org · Welcome · Settings) + side panel (Chart|Directory, search, filters including job title, Tools disclosure) + dedicated `/app`, `/welcome`, `/settings`. Preferences (density, Live default) persist in `localStorage`. **Remove PNG/SVG from the product UI** (helper code may remain unused). Secondary surfaces (Compare, Live, Sync, Webhooks, Insights) live under side-panel Tools — not a second floating pile.

**Consequences:**  
- Chart stage is never covered by primary controls; initial fit uses higher `maxZoom` / `minZoom` for readability.  
- Directory is first-class with manager context and shared side-panel filters.  
- Tracking: GH #50–#54 / Linear TUXX-1587–1591.

**Revisit when:**  
Interview feedback asks for image export as a headline feature — then re-expose under Tools, not chrome.

---

## 2026-07-24 — Markel chrome: solid nav, editorial washes, Acme mark

**Status:** Accepted  

**Context:**  
Gradient washes in the top nav read wrong against Markel/Neuro references. Welcome as a primary tab confused the IA (it is bonus GH#33, not core). Chart stage still didn’t fill the viewport; Tools panels floated over React Flow.

**Decision:**  
- **Nav:** solid charcoal (`#1a1a1a`), no gradient overlay; **Acme** ascending-bars mark + wordmark; primary link = Org only; **Settings** as far-right icon.  
- **Gradients:** editorial background washes on page canvas only.  
- **Layout:** `h-dvh` shell so chart fills the viewport; hideable side panel (persisted); Insights / Sync / Webhooks dock **inside** the side panel — never as floating buttons on the stage.  
- **Settings:** Integrations section documents Remote connection + “Add integration” placeholder for production-shaped IA.  
- `/welcome` stays as optional marketing URL, not primary nav.

**Consequences:**  
Interviewers land on `/app` for the brief deliverable; marketing link can stay in README.

**Revisit when:**  
Design system expands beyond Acme assessment chrome.

---

## 2026-07-24 — Org intelligence IA (brief + wow)

**Status:** Accepted  

**Context:**  
Core Remote brief is already met. Next goal is to impress: treat Acme as an organisational intelligence product (Dashboard, Org Chart, People, Departments, Data Health), with marketing login, honest Remote connect UX, and stronger edge-case visuals. Reference UIs (Org Mapper, pastel trees, light SaaS shells) beat our current chrome consistency.

**Decision:**  
Ship the serial wow track GH#58–#68 plus morph polish #70 (Linear TUXX-1593–1603, TUXX-1609). Top nav after auth: Dashboard · Org Chart · People · Departments · Data Health · Settings gear. Marketing + demo app login/logout. Visual system pass on chart + People. Edge-case badges + Data Health. Theme preference in Settings only. No em dashes in product copy. Command bar and tree-list view tracked as stretch wow (#66–#67). Shared-element morph + bloom (#70) is the last wow step before/with #68 QA.

**Consequences:**  
- One parent at a time; dedicated `feat/` / `ui/` / `cross/` branches named on each issue.  
- Brief React Flow chart remains the Org Chart primary; tree list is optional add-on.  
- Morph/bloom only where the same entity continues across views; honour `prefers-reduced-motion`.  

**Revisit when:**  
Interview handoff date forces cutting optional #66–#67 or #70. (Update 2026-07-24: #66–#70 and #68 QA shipped; interviewer handoff lives privately outside the repo.)

---

## 2026-07-24 — Org Intelligence visual system (chart + People)

**Status:** Accepted  

**Context:**  
After product IA routes (#58), chart cards and the People directory still mixed black chrome and tight spacing.

**Decision:**  
Shared light card recipe: white surfaces, department pastel accent strip + avatar, report badge, friendly country labels. Generous dagre spacing (`260×152` comfortable). People at `/app/people` is the directory surface (search-first, no black header). Chart workspace stays graph-only.

**Revisit when:**  
Theme toggle (#63) needs dark variants of the same recipe.

---

## 2026-07-24 — Tree list as optional Org Chart mode

**Status:** Accepted  

**Context:**  
React Flow already satisfies Clara’s interactive chart brief. A third presentation can impress without replacing the primary.

**Decision:**  
Ship an optional Chart | Tree toggle on the Org Chart workspace. Tree is an indented expand/collapse list sharing the same selection/profile drawer. React Flow remains the brief primary and default.

**Revisit when:**  
Interviewers prefer tree as default (unlikely).

---

## 2026-07-24 — Marketing landing + demo app session

**Status:** Accepted  

**Context:**  
Interviewers need a public story and a gated product without exposing `REMOTE_API_TOKEN`.

**Decision:**  
`/` is marketing. Demo login (credentials via `DEMO_APP_EMAIL` / `DEMO_APP_PASSWORD`, with local defaults for boot) sets an httpOnly signed cookie. Middleware gates `/app/*`, `/settings`, and `/help`. Logout clears the cookie and returns to marketing. Remote Bearer remains server-only. Demo passwords are not published in README — shared privately with interviewers.

**Revisit when:**  
Real identity provider is required beyond demo credentials.

---

## 2026-07-24 — Remote Connect Option B; OAuth scaffolded but off

**Status:** Accepted  

**Context:**  
Ideal product UX would be Connect → Remote OAuth → redirect back. The assessment architecture uses a **server-side read-only Bearer token** (`REMOTE_API_TOKEN`). Faking a Remote login redirect that cannot complete would break the brief path and confuse interviewers.

**Decision:**  
1. **Ship Option B:** Settings Connect wizard / Disconnect pauses org fetch in the browser (or session); Connect resumes using the existing server token. One-click reconnect, no secrets in the client.  
2. **Scaffold OAuth** behind `REMOTE_OAUTH_ENABLED` (default off): stub authorize/callback types and routes so flipping the flag + registering a Remote OAuth client can turn it on later without a redesign.  
3. Document this explicitly so we never claim live OAuth while the flag is off.

**Consequences:**  
- Demo path stays reliable for Clara’s team.  
- Codebase stays ready if the ask becomes real OAuth.  
- Tracking: GH#62 / TUXX-1598 (+ subs TUXX-1606–1608).

**Revisit when:**  
Remote provides a sandbox OAuth client for this assessment app, or the brief explicitly requires end-user OAuth.

---

## 2026-07-24 — Profile avatars + world map org view

**Status:** Accepted (avatars corrected same day; **photos blocked on customer API as of 2026-07-24 re-probe**)  

**Context:**  
Remote’s product UI (employ.remote-sandbox.com) shows real profile photos. The public customer REST path we use for the assessment does not expose them.

**Exhaustive probe (sandbox `ra_test_` Bearer, gateway.remote-sandbox.com):**  
- `GET /v1/employments` + `:id` — no `profile_picture` / CDN URL on list or detail (re-sampled; `include`/`expand=user` → 422).  
- Detail has `user_id` / `user_status` only — no nested `user` object.  
- `GET …/files` — contracts/expense PDFs only, not photos.  
- SCIM / people / accounts user paths — 404 for this token.  
- OpenAPI: `profile_picture` exists on `MinimalUser`, but only wired to bulk-import `inserted_by`, **not** Employment responses. No documented GET returns it for company people.

**Decision:**  
1. Pass through Remote photo URLs when the API provides them (`profile_picture` / `profilePicture` / nested `user`, allowlisted HTTPS hosts including `cdn.employ-assets.remote.com`). Grid, list, drawer, chart cards, tree, and map all use the same `PersonAvatar` → initials when `avatarUrl` is null.  
2. **Do not** invent third-party portraits (no DiceBear / fake faces). Department-colored initials are the honest fallback.  
3. **Do not** scrape employ.remote-sandbox.com session/GraphQL for photos — undocumented, ToS-fragile, and outside the assessment’s customer-REST brief.  
4. Keep Org Chart **Map** mode for country pins — Natural Earth (`world-atlas` + `d3-geo`).

**Consequences:**  
- Side panel and directory both show initials today because `avatarUrl` is always null from REST — not a missing UI wire.  
- Real photos appear automatically the day Remote adds the field to employment payloads (extraction already shipped).  
- Partner OAuth on the same gateway does not fix this if the schema still omits the field.

**Revisit when:**  
Remote documents `profile_picture` on employment (or a customer-readable Users endpoint), or the brief explicitly allows a product-session integration.

---

## 2026-07-24 — Tree view visual polish

**Status:** Accepted  

**Context:**  
The optional Tree mode read like a bare file browser (`+/-`, flat rows). Chart cards already had stronger Norma chrome.

**Decision:**  
Treat Tree as nested **person cards** with department accent rails, department/country chips, report + team-size pills, chevron expand, Expand/Collapse all, and soft team wells — still a list hierarchy (not a second React Flow canvas).

**Consequences:**  
- Tree feels closer to Chart card language while staying scannable for deep hierarchies.  
- Photos still depend on REST `avatarUrl` (same avatar policy as elsewhere).

---

## 2026-07-24 — Data Health under Settings + wider layout

**Status:** Superseded (2026-07-24 — primary nav restore)  

**Context:**  
Data Health was a primary nav item with a narrow `max-w-3xl` column that left large empty side margins. Trust tooling fits better with Remote connect / preferences than with day-to-day org browsing.

**Decision:**  
1. Move Data Health to **Settings → Data Health** (`/settings/data-health`) with Preferences / Data Health subnav.  
2. Remove it from primary top nav.  
3. Keep `/app/data-health` as a redirect for old links.  
4. Widen the health layout (`max-w-7xl`, 4-up summary, 2-column issue sections, person card grid).

**Consequences:**  
- Primary IA is Dashboard · Org Chart · People · Departments · Settings.  
- Dashboard / command bar deep links point at `/settings/data-health`.

---

## 2026-07-24 — Shell layout consistency (full width + one primary nav)

**Status:** Superseded (2026-07-24 — Settings-owned Data Health)  

**Context:**  
Settings subnav (Preferences / Data Health) sat above the title on Preferences and in a separate strip on Data Health. Dashboard / Preferences used narrow `max-w-*` columns while Org Chart / People were full bleed. Dashboard also repeated Org Chart · People · Data Health under the page title.

**Decision:**  
1. Restore **Data Health** to primary nav (`/app/data-health`). Settings gear opens Preferences only.  
2. Redirect `/settings/data-health` → `/app/data-health`. Remove `SettingsSubnav`.  
3. Shared `ProductPageFrame` — full-width padding, no content max-width — for Dashboard, Preferences, and Data Health.  
4. Drop redundant under-title quick links that duplicate primary nav.

**Consequences:**  
- One stable primary IA: Dashboard · Org Chart · People · Data Health · Settings.  
- Scrolled product pages share the same edge-to-edge width language as canvas surfaces.

---

## 2026-07-24 — Data Health back under Settings (stable subnav)

**Status:** Accepted  

**Context:**  
Product intent is Data Health as a Settings trust surface, not a day-to-day primary tab. Moving it into primary nav fixed bouncing subnav placement but broke the intended IA. Person cards at `xl:grid-cols-4` truncated names.

**Decision:**  
1. Primary nav: Dashboard · Org Chart · People · Settings gear.  
2. Settings secondary (fixed sticky strip under header via `SettingsChrome`): Preferences · Data Health.  
3. Canonical `/settings/data-health`; `/app/data-health` redirects.  
4. Keep full-width `ProductPageFrame`. Cap health person grids at 3 columns with roomier padding.  

**Consequences:**  
- Subnav no longer changes position between Preferences and Data Health.  
- Deep links (Dashboard, ⌘K, People) point at `/settings/data-health`.

---

## 2026-07-24 — Map zoom, pan, and clearer pin selection

**Status:** Accepted  

**Context:**  
Europe pins overlapped at world scale; selected pins showed a rectangular focus ring; country identity was unclear from numbers alone.

**Decision:**  
1. Add scroll-wheel zoom, drag pan, +/- / Reset controls, and click-to-zoom on a country.  
2. Scale pin/label geometry by zoom so markers stay readable.  
3. Show country label only for hover/active pins; selected state is a circular orange ring (no square focus chrome).

**Consequences:**  
- Dense regions become readable after zooming.  
- Map interaction is slightly richer than a static SVG.

---

## 2026-07-24 — Horizontal Tree + density

**Status:** Accepted  

**Context:**  
Vertical list Tree still felt file-browser-like; users wanted chart-like left→right branching, deeper default expand, and a compact mode for ~149 people.

**Decision:**  
1. Render Tree as a **left-to-right** branching hierarchy with spray rails.  
2. Default expand **two levels** (`collectIdsToDepth(..., 1)`); keep Expand all / Collapse all / “2 levels”.  
3. Add Comfortable | Compact density for card size.

**Consequences:**  
- Tree is horizontally scrollable for wide orgs.  
- Chart (React Flow) remains the primary interactive layout.

---

## 2026-07-24 — Departments inside People

**Status:** Superseded (same day — browse removed)  

**Context:**  
Primary nav had both People and Departments, while People already filtered by department. Two pages duplicated the same employment set.

**Decision:**  
1. Remove Departments from primary nav.  
2. Add a **Departments** layout toggle on People (Grid | List | Departments).  
3. Keep `/app/departments` as a redirect to `/app/people?view=departments`.

**Consequences:**  
- One directory surface; department sidebar only when that view is active.  
- Dashboard / command bar deep-link the People Departments view.

---

## 2026-07-24 — Drop People Departments browse

**Status:** Accepted  

**Context:**  
The Departments layout under People still felt like a thin catalog (sidebar + cards) duplicated by the department filter and by Dashboard “Headcount by department.” Moving it into Settings would mix reference data with Connect/theme/Data Health.

**Decision:**  
1. Remove the Departments layout from People (Grid | List only + department dropdown).  
2. Delete `DepartmentsBrowse`.  
3. Redirect `/app/departments` to `/app/dashboard`.  
4. Point department deep links at Dashboard.

**Consequences:**  
- People stays a person directory.  
- Department inventory lives on Dashboard where insights already are.

---

## 2026-07-24 — Map display landmasses (no overseas surprises)

**Status:** Accepted  

**Context:**  
Natural Earth / world-atlas country MultiPolygons include overseas territories. Selecting France also highlighted French Guiana in South America — correct ISO membership, confusing for an org location map.

**Decision:**  
For map fills, keep only landmass polygons within ~5200km of the country’s largest polygon centroid. That drops far overseas fragments while keeping nearby large regions (e.g. Alaska with the US). Pins still use our mainland-ish centroids.

**Consequences:**  
- Clicking France highlights metropolitan France only.  
- Tiny distant territories are not click targets.

---

## 2026-07-24 — Dual search roles (⌘K vs filter)

**Status:** Accepted  

**Context:**  
Global ⌘K and page-level search fields read the same (“search people”), so the IA felt duplicated.

**Decision:**  
- ⌘K / header = **jump** to a person or page (command palette).  
- People / Chart fields = **filter** the current surface. Copy and placeholders say so explicitly.

**Consequences:**  
- One story for interviewers: jump vs filter.  
- No second search product — just clearer roles.

---

## 2026-07-24 — People profile dock (not overlay)

**Status:** Accepted  

**Context:**  
The profile drawer covered directory cards on desktop even after raising the header z-index.

**Decision:**  
On People, use a **docked** rail (`placement="dock"`) that shares horizontal space with the grid. Chart keeps the overlay sheet so the canvas stays full-bleed.

**Consequences:**  
- Grid stays readable with a profile open.  
- Mobile still uses a bottom sheet height cap inside the dock layout.

---

## 2026-07-24 — Incomplete profile filter on People

**Status:** Accepted  

**Context:**  
Many sandbox people lack title/department/country; Data Health listed them but the directory didn’t surface incompleteness.

**Decision:**  
Add an **Incomplete only** filter (+ badge on cards) on People, deep-linked from Dashboard via `?incomplete=1`. Keep Data Health for cycles/missing managers.

**Consequences:**  
- Interviewers can jump from completeness score → filtered People list.

---

## 2026-07-24 — Skeleton loaders + empty illustration

**Status:** Accepted  

**Context:**  
Full-page spinners felt abrupt; empty states used a bare “∅” glyph.

**Decision:**  
Replace loading with pulsed org-card skeletons; empty uses a light SVG tree illustration. Error stays alert-styled.

**Consequences:**  
- Loading reads as “structure incoming,” not a stalled spinner.

---

## 2026-07-24 — Compare-mode discovery

**Status:** Accepted  

**Context:**  
Reporting-distance compare lived only under a collapsed Tools accordion.

**Decision:**  
Surface a **Start compare** callout in the Org Chart workspace (plus ⌘K nav hint). Exit remains in Tools when active.

**Consequences:**  
- Interviewers can find compare without hunting Tools.

---

## 2026-07-24 — Color restraint (premium, not rainbow)

**Status:** Accepted  

**Context:**  
Department hash pastels painted charts and avatars in unrelated hues (purple, pink, cobalt, teal, orange). Read as cartoonish next to Aurum-style craft references that use one accent and mute everything else.

**Decision:**  
1. Chart bars use a single Acme orange (`CHART_BAR_ACCENT`), with opacity by rank — not per-department colors.  
2. `departmentAccent` limited to a muted Prussian/Spray family for initials and thin strips.  
3. Cooler canvas (`#e8eef0`) and quieter shell glow (orange + Prussian only, lower opacity).  
4. Keep Acme orange / Prussian / Spray — do not adopt Aurum gold or dark-first shell.

**Consequences:**  
- Color means brand or status; charts read as one system, not a sticker pack.

---

## 2026-07-24 — Full people profiles + prefs that actually apply

**Status:** Accepted  

**Context:**  
People cards used left color chips and left-aligned avatars (felt AI-slop). Profile detail lived only in a side dock. Settings Dark / Comfortable / Compact looked broken: theme class toggled but CSS tokens stayed light (`html.dark` buried in `@layer`), and density only persisted on Save. Remote employment detail exposes more than the chart merge used.

**Decision:**  
1. LinkedIn-style People grid cards (centered avatar over a soft header strip, details below); remove left color chips from directory, chart nodes, and tree cards.  
2. Full profile route `/app/people/[id]` + `/api/people/[id]` with sanitized Remote fields (emails, model/type/status/lifecycle, dates, pronouns, manager) — never salary/bank/emergency contact. Dock remains a quick peek with “Open full profile.”  
3. Theme/density/live prefs persist on toggle and emit `PREFS_CHANGED_EVENT`; dark tokens live outside `@layer` so they win over `:root`.  
4. Liquid-glass (`.norma-glass`) + soft gradient blurs on People/profile/shell — Acme palette only.  
5. Local `next dev` skips Worker fan-out when `WORKER_SELF` is a broken stub (`Failed to parse URL from [object Request]`).

**Consequences:**  
- Richer interviewer-facing profiles without leaking sensitive contract PII.  
- Dark mode and density are browser-smoke verified (`scripts/browser-smoke.mjs`, 25/25).

**Revisit when:**  
Remote adds stable public photo URLs or we need salary-safe compensation bands for a stretch demo.

---

## 2026-07-24 — Pastel liquid-glass visual identity

**Status:** Accepted (supersedes product chrome use of Acme orange / Prussian)

**Context:**  
References (soft cream canvases, pastel card fills, black pill CTAs, glass panels) fit the product better than orange/Prussian chrome. Assessment still says “Acme” and Remote remains the data source.

**Decision:**  
1. Cream canvas `#f4f1eb`, black ink/CTAs `#121212`, pastel fills (lavender / mint / peach / sky / rose).  
2. ACME wordmark stays — black mark, no orange plate.  
3. Norma CSS aliases (`norma-royal` / `norma-prussian`) remap to black so existing utilities pick up the system.  
4. Keep Remote-as-source; no emoji status badges; no photographic landscape backgrounds.

**Consequences:**  
- Every product and marketing surface shares one soft / glass language.  
- Earlier “color restraint” orange chart bars become black/quiet progress bars.

**Revisit when:**  
Interview feedback asks for stronger Remote/Acme orange recognition in the UI.

---

## 2026-07-24 — Light-only + pastel polish (spacing, charts, motion)

**Status:** Accepted  

**Context:**  
After the pastel swap, muted text on cream was too faint (tree toolbar “Collapse all”, active density labels black-on-black via `text-norma-prussian`). Controls felt squashed vs references. Dark mode fought the cream/pastel system. Dashboard KPI cards read as one colour; two identical bar charts were redundant. Marketing needed more hover life and editorial colour panels.

**Decision:**  
1. **Light only** — remove Appearance Light/Dark; `forceLightTheme()` clears `html.dark` and legacy storage.  
2. Darker muted ink (`#4a4640` / `#6b6660`); active pills use `text-norma-ink-inverse`; more shell/page/toolbar padding.  
3. Dashboard: distinct pastel gradient KPI cards, completeness ring meter, department **donut** + country **dot ranks** (not twin bars), staggered bloom-in.  
4. Marketing: hover lifts, editorial gradient panels, richer surface cards.

**Consequences:**  
- No OS/Settings dark path.  
- Chart viz variety is intentional for demo readability.

**Revisit when:**  
Accessibility review wants even stronger contrast, or interviewers prefer photographic editorial imagery.

---

## 2026-07-24 — Morph partners, profile return, department avatar legend

**Status:** Superseded (legend placement)  

**Context:**  
Full profile always linked “← People” even when opened from the org chart. Shared-element morph (#70) existed on drawer shells but not avatar→profile. Initials already used `departmentAccent`, but there was no key explaining the colours.

**Decision:**  
1. Capture return href + scroll in `sessionStorage` when opening a profile; back label is Org Chart or People; People restores list scroll; chart restores via `?person=`.  
2. Morph on **avatar** + **name** across chart node ↔ drawer ↔ profile; wrap selection/navigation in `withViewTransition`. Soft-load profile header from session org snapshot.  
3. Quiet `DepartmentColorLegend` on chart workspace + People directory; photo avatars get a department-coloured ring.

**Consequences:**  
- Hard refresh on a profile loses return context (falls back to People).  
- View Transitions need Chromium; reduced-motion skips morph.

**Revisit when:**  
Safari/Firefox VT support matures or we add a fallback FLIP morph.

---

## 2026-07-24 — Department colours live in the filter (not a side legend)

**Status:** Accepted (supersedes always-visible DepartmentColorLegend)  

**Context:**  
The People/chart colour key sat on the left, was always visible, and “+N more” did nothing. Users want colours as part of filtering, not a decorative strip.

**Decision:**  
1. Remove the always-on `DepartmentColorLegend`.  
2. Replace native Department `<select>` with `DepartmentFilterSelect` — closed by default; opening the menu shows every department with its avatar swatch and applies the filter.  
3. Widen the pastel palette so neighbouring teams collide less often.

**Consequences:**  
- Colour meaning is discovered when filtering (and on avatars), not via a permanent key.  
- Native select accessibility is replaced by a listbox button pattern.

**Revisit when:**  
We need multi-select department filters.

---

## 2026-07-24 — Map selection fill is a department-colour mix

**Status:** Accepted  

**Context:**  
Clicked countries used a flat mint fill. The map should reflect which departments sit in that country, but only when the country is selected.

**Decision:**  
On country click, fill with an SVG gradient of unique `departmentAccent` colours for people in that country. Unselected countries keep the neutral charcoal / land treatment — no department tint until clicked.

**Consequences:**  
- Single-department countries show a solid-ish pastel; multi-department countries blend.  
- Closing the country panel clears the gradient fill.

**Revisit when:**  
We want proportional stop weights by headcount instead of equal spacing.

---

## 2026-07-24 — Settings density live preview + official Remote mark

**Status:** Accepted  

**Context:**  
Chart preferences left empty space beside Comfortable/Compact with no visual of the outcome. The Integrations row used a generic “R” tile instead of Remote’s mark.

**Decision:**  
1. Add `DensityPreview` on Settings using real `PersonNodeCard` samples that switch with the density toggle (prefs already write on click so the org chart matches).  
2. Ship `public/brand/remote-mark.svg` — the black lowercase “r” from Remote’s official `remote-logo.svg` wordmark (not the gradient product glyph).

**Consequences:**  
- Preview is illustrative sample people, not live Remote data.  
- Remote trademark used only as attribution for the integration.

**Revisit when:**  
Remote publishes a formal press-kit URL we should prefer.

---

## 2026-07-24 — Marketing landing motion inspired by remote.com

**Status:** Accepted  

**Context:**  
Our `/` marketing page felt static next to remote.com’s homepage (atmospheric washes, staged hero, marquee, scroll reveals, product stage).

**Decision:**  
Rebuild `/` with remote.com *composition and motion language* while keeping Acme/Norma branding (not a Remote marketing skin): centered brand-forward hero, full-bleed product mock stage, capability marquee, IntersectionObserver reveals, CSS grain/mesh atmosphere, path-draw + node pop on the mock. No Remote CDN backgrounds.

**Consequences:**  
- More client JS on marketing (`MarketingHeader`, `MarketingReveal`, `MarketingMarquee`).  
- Prefer `prefers-reduced-motion` cutoffs for all new animations.

**Revisit when:**  
Interviewers want a darker Prussian Remote chrome instead of cream pastels.

---

## 2026-07-24 — Expand-all default + C-suite landing zoom + official Remote mark

**Status:** Accepted  

**Context:**  
Landing on Org Chart fit the entire expanded company into view (tiny nodes). Branches past depth one started collapsed. Integrations used the gradient product glyph (`Union.svg`), not the black wordmark “r” from remote.com.

**Decision:**  
1. Default `collapsedIds` empty (full chart expanded); tree view also expands all by default.  
2. Initial `fitView` targets `cSuiteFocusNodeIds` (largest root only, with padding) after nodes are measured.  
3. Ship `remote-logo.svg` + extracted black `remote-mark.svg` from Remote’s Contentstack `remote-logo.svg`.

**Consequences:**  
- Large orgs still lay out fully; users pan/zoom or Fit for the whole graph.  
- Collapse remains available per-node and via tree Collapse all.

**Revisit when:**  
We want remembered collapse/zoom per device.

---

## 2026-07-24 — Marketing page mirrors remote.com structure + real screenshots

**Status:** Accepted  

**Context:**  
Earlier marketing borrowed remote.com *motifs* (marquee, atmosphere) but kept a centered stack and an invented org-chart mock that didn’t match the shipped app.

**Decision:**  
Rebuild `/` to follow remote.com’s section map: left-copy / right-visual hero, labelled capability marquee, “How we do it” accordion + sticky product panel, screenshot surface cards, closing CTA. Hero and panels use captured screenshots from the live Acme app (`public/marketing/*.png`).

**Consequences:**  
- Screenshot assets need occasional refresh when UI chrome changes.  
- `MarketingProductMock` is no longer used on `/`.

**Revisit when:**  
We automate screenshot refresh in CI.

---

## 2026-07-24 — Help KB + Workers AI assistant; secrets scrub

**Status:** Accepted  

**Context:**  
Interviewers need product how-tos without reading the engineering decision log. Demo passwords were in README / handoff docs while the GitHub repo was public. Dashboard and Data Health showed “synced …” without a Refresh action (only Org Chart had one).

**Decision:**  
1. Markdown Help under `docs/help/` + authenticated `/help` routes; floating Help assistant calls `POST /api/help/chat` with Workers AI (`AI` binding, Llama 3.1 8B) grounded on KB chunks + org snapshot people search; rate-limited.  
2. **Refresh from Remote** on Dashboard and Data Health (same `?refresh=1` path as Org Chart).  
3. Scrub demo credentials from README / `.env.example` / DECISIONS prose; delete `docs/interviewer-handoff.md` from the repo; private handoff lives at `~/Downloads/acme-org-chart-interviewer-handoff.md` for email. Keep GitHub repo **private**; live Workers URL is the demo path.  
4. Code defaults for demo login remain overridable via Wrangler / `.env.local` — never publish passwords in git-facing docs.

**Consequences:**  
- Chat uses free Workers AI neuron allowance; offline/local falls back to Help links.  
- Git history may still contain old password strings — private repo + optional password rotation via env is the practical mitigation.

**Revisit when:**  
Vectorize RAG is needed, or demo password rotation after broader exposure.

---

## 2026-07-24 — Copy: no em dashes; Remote-like tone; drop HRIS jargon

**Status:** Accepted  

**Context:**  
Marketing and product copy used em dashes and jargon like “shadow HRIS.” Remote.com writing is short, confident, and plain (“One system of record…”). Interviewers should not need acronyms expanded mid-demo.

**Decision:**  
1. Ban typographic em/en dashes in product, marketing, Help, and public docs. Prefer periods, commas, or colons. Empty fields show “Not set,” not “—.”  
2. Match Remote-like tone: clear benefit, system-of-record framing, no “Hire clarity” filler.  
3. Replace HRIS with plain language (“No second employee database”).

**Consequences:**  
- Marketing source section and hero subcopy rewritten.  
- Help KB regenerated without em dashes.

**Revisit when:**  
A brand/editorial pass asks for a different voice.

---

## 2026-07-25 — Marketing + app scale, color, rounded accordion

**Status:** Accepted  

**Context:**  
Side-by-side with remote.com, Acme marketing read small and cramped: sharp black “How we do it” rows, tight section padding, muted color. The product shell and org nodes felt similarly undersized next to Remote’s breathing room.

**Decision:**  
Bump marketing type, CTAs, and section padding; give the How-we-do-it accordion rounded pastel panels with icons (not sharp black rectangles); colorize marquee and surface cards with Norma pastels; loosen app chrome (header, page frame, command bar) and enlarge comfortable org-node cards + layout metrics for readability.

**Consequences:**  
- Marketing feels closer to Remote’s spacing personality while staying cream + pastel, not Remote maroon/blue.  
- Chart layout uses larger node footprints (`densityMetrics` / card widths).  
- Global type and radius tokens nudged up slightly for the whole product.

**Revisit when:**  
Interview feedback prefers denser chrome, or Remote brand cues need a stronger primary accent on marketing.

---

## 2026-07-25 — Demo credentials scrub + rotate + pre-commit gate

**Status:** Accepted  

**Context:**  
Demo password had lived in README / handoff / e2e scripts / `session.ts` defaults while the repo was briefly public. HEAD scrub alone is not enough for history; production Wrangler also had no `DEMO_APP_*` secrets and fell back to source defaults.

**Decision:**  
1. Keep the GitHub repo **private**. No history rewrite unless explicitly requested.  
2. Remove the published password from source; local/CI use a non-production fallback string; interviewer password lives only in Wrangler secrets + private Downloads handoff + `.env.local`.  
3. E2E / browser smoke read `DEMO_APP_EMAIL` / `DEMO_APP_PASSWORD` from env.  
4. Add `scripts/check-secrets.sh` (pre-commit via `prepare` + CI) to block the previously published demo password and long `ra_test_` / `ra_live_` tokens from re-entering the tree.  
5. Rotate `DEMO_APP_PASSWORD` and set `APP_SESSION_SECRET` on Wrangler.

**Consequences:**  
- Live login uses the rotated secret after deploy.  
- Contributors must run with `.env.local` or accept the local-dev fallback (not the interviewer password).  
- History may still contain the old password until a consented rewrite; private + rotate mitigates.

**Revisit when:**  
Making the repo public, or interviewers report login failure after rotate.

---

## 2026-07-25 — Persist profile edits to Remote (hybrid)

**Status:** Accepted  

**Context:**  
People / Data Health “fix” previously only wrote `localStorage` overlays because the app token is read-only. A Full Access token already existed for webhook subscribe. Interview demo needs department/manager changes to stick in sandbox Remote when possible.

**Decision:**  
1. Keep `REMOTE_API_TOKEN` read-only for everyday GET/org-chart.  
2. Add optional `REMOTE_API_WRITE_TOKEN` (Full Access / `employment:write`; `REMOTE_WEBHOOK_ADMIN_TOKEN` still accepted as alias).  
3. `PATCH /api/people/:id` maps department → `department_id` (create dept if needed) and manager employment → `manager_id` (user id), then `PATCH /v1/employments/:id`.  
4. Job title / country are attempted but usually blocked on **active** Global Payroll employments; those fields fall back to local overlays with an explicit note.  
5. Successful Remote writes invalidate the org-chart KV snapshot.

**Consequences:**  
- Department + manager can persist across browsers after Refresh from Remote.  
- Title/country may remain overlay-only until Remote allows amendments via API.  
- Workers need `REMOTE_API_WRITE_TOKEN` set for production writes.

**Revisit when:**  
Remote exposes a supported active-employment path for job title / country, or we add contract-amendment flow.

---

## 2026-07-25 — Help in utilities; annotated shots; first-login tour

**Status:** Accepted  

**Context:**  
Help sat in the primary nav (crowding Dashboard / Org Chart / People). KB screenshots needed clearer callouts. First-time users needed an onboarding path without a separate welcome page.

**Decision:**  
1. Move **Help** into the header utilities cluster: Search → Health → Help → Settings. Primary nav stays Dashboard / Org Chart / People.  
2. Help shots use numbered pins, spray highlight rings, and optional compass pointer arrows (`HelpShot` + `{{shot:id}}`).  
3. Ship a first-login **product tour** (`localStorage` `acme-org-chart:product-tour-v1`). Restart via Help index / topic, chat “Restart tour”, or saying “start the product tour”.

**Consequences:**  
- Header matches the Health-between-search-and-settings brief plus Help as docs entry.  
- Tour is client-only; clearing site data re-triggers it.

**Revisit when:**  
We want a multi-page deep tour (Chart filters, Compare) or remote-synced “seen tour” per user.

---

## 2026-07-25 — Mobile chart density + site-wide phone chrome

**Status:** Accepted  

**Context:**  
GH#106 / TUXX-1622: phone org chart was cramped (side panel open by default, comfortable nodes, Help FAB over zoom). Marketing lacked a mobile nav. Command palette had no phone affordance.

**Decision:**  
1. Default side panel closed below `md` when unset; cap open panel at `40dvh` with internal scroll.  
2. Force compact React Flow / Tree density on mobile; safer initial fit padding/zoom.  
3. Mobile search icon, tighter header pills, Help FAB raised, zoom controls bottom-left.  
4. Marketing hamburger, stacked hero CTAs; People/Settings drawers and density preview stack on small widths.  
5. Settings Keyboard shortcuts sheet + product tour restart (covers GH#102 scope lightly).

**Consequences:**  
- Phone chart starts with maximum canvas height.  
- Desktop prefs unchanged; density toggle still saved for desktop.

**Revisit when:**  
Native bottom-tab shell or PWA install prompts.

---

## 2026-07-25 — Clear polish backlog (OG, live, export)

**Status:** Accepted  

**Context:**  
GH#101 / #104 / #105 remained open under the production polish epic.

**Decision:**  
1. Shared-link previews via `sharePreviewMetadata` (Open Graph + Twitter) on root, marketing home, and login; `NEXT_PUBLIC_SITE_URL` optional override.  
2. Live updates: SSE hello/status flash, `acme:org-updated` broadcast so Dashboard and People soft-refresh with the chart.  
3. Print/export: Tools → PNG/SVG (html-to-image) + Print with print CSS that hides chrome.

**Consequences:**  
- Crawlers get large-image cards for the public Workers URL.  
- Live toggle remains opt-in; when on, other surfaces stay in sync.  
- Export only from Chart view (Tree/Map print still available via Print).

**Revisit when:**  
Custom domain for OG, or public unauthenticated person preview cards.

---

## Template for future entries


Copy from the top of this file. Keep tone first-person / team voice. No tooling slash-commands. Link related issues and PRs.
