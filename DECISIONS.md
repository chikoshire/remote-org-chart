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

**Status:** Accepted  

**Context:**  
Want Linear + Orbit + GitHub visibility. Linear free-tier issue create is currently blocked; Orbit MCP JWT expired pending Orbit Main refresh.

**Decision:**  
**GitHub Issues** are the executable backlog. Linear holds the project + backlog/decision documents. Orbit Kanban mirrors when auth works. This `DECISIONS.md` is the durable “why” log in-repo.

**Consequences:**  
Interviewers can read rationale on GitHub even if Linear/Orbit are messy.

**Revisit when:**  
Linear quota restored or Orbit session healthy — then mirror issue IDs into this section.

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

## Template for future entries


Copy from the top of this file. Keep tone first-person / team voice. No tooling slash-commands. Link related issues and PRs.
