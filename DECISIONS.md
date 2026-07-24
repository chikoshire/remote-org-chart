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
Interview handoff date forces cutting optional #66–#67 or #70. (Update 2026-07-24: #66–#70 and #68 QA shipped; see `docs/interviewer-handoff.md`.)

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
`/` is marketing. Demo login (`demo@acme.example` / `<scrubbed-old-demo-password>`, overridable via env) sets an httpOnly signed cookie. Middleware gates `/app/*` and `/settings`. Logout clears the cookie and returns to marketing. Remote Bearer remains server-only.

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

**Status:** Accepted (avatars corrected same day)  

**Context:**  
Remote’s product surfaces people with profile photos via `employment.user.profilePicture` on the **employ session/GraphQL API**. The public customer REST employment endpoints (`GET /v1/employments`, `GET /v1/employments/:id`) for this sandbox return `user_id` / `user_status` but **not** `profile_picture` (sampled 176 employments; include/expand rejected).

**Decision:**  
1. Pass through Remote photo URLs when the API provides them (`profile_picture` / `profilePicture` / nested `user`, allowlisted HTTPS hosts including `cdn.employ-assets.remote.com`).  
2. **Do not** invent third-party portraits (no DiceBear). When no photo URL exists, show department-colored initials — the same honest fallback Remote uses without a photo.  
3. Keep Org Chart **Map** mode for country pins — rendered as a real Natural Earth world map (`world-atlas` + `d3-geo`), not decorative blob silhouettes. Highlight countries with people; pins use the same projection.

**Consequences:**  
- Avatars match Remote only when the REST payload includes a picture URL.  
- Sandbox demo people currently render as initials until Remote exposes photos on the customer API (or we gain an authenticated employ-API path).  
- Map depends on country being set on employments.  
- Tiny territories missing from countries-110m (e.g. Singapore) still get pins via centroids even without a filled polygon.

**Revisit when:**  
Remote documents a customer-API way to read `employment.user.profilePicture`, or interviewers accept a session-based employ API integration.

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

**Status:** Accepted  

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

## Template for future entries


Copy from the top of this file. Keep tone first-person / team voice. No tooling slash-commands. Link related issues and PRs.
