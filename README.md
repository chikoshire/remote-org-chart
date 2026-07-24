# Remote Org Chart (Acme Sandbox Corp)

Interactive org chart for **Acme Sandbox Corp**, built against the **Remote sandbox** REST API. Server-side Bearer auth, manager→reports hierarchy, Norma-inspired product chrome, and a public Cloudflare Workers deploy.

## Live demo

**https://remote-org-chart.shirechiko.workers.dev**

| Check | Expected |
|-------|----------|
| Home | Interactive React Flow chart (~149 people, ~10 roots) |
| `/api/health/remote` | `{ "ok": true, "remote": "reachable", … }` |
| `/api/org-chart` | Hierarchy JSON (emails stripped); cold build ~15–25s |

> First load of `/api/org-chart` fans out employment detail fetches (list responses omit manager IDs). Give it a moment on a cold Worker.

### Links for the interview team

- **Live app:** https://remote-org-chart.shirechiko.workers.dev  
- **Source:** https://github.com/chikoshire/remote-org-chart  
- **Security notes:** [SECURITY.md](./SECURITY.md)  
- **Decision log:** [DECISIONS.md](./DECISIONS.md)

---

## What it does

1. Authenticates to Remote sandbox with a **read-only** customer token (`ra_test_…`) — **server-side only**
2. Paginates `GET /v1/employments`, then enriches each employment for `manager_employment_id`
3. Builds a manager→reports forest (cycles / orphan managers surfaced as warnings)
4. Renders an interactive chart (name, title, department, country, reporting edges)
5. Search focuses a person and their path to root; pan/zoom works on desktop and mobile

---

## Quick start (local)

**Requirements:** Node 20+, a Remote sandbox API token with employment read access.

```bash
git clone https://github.com/chikoshire/remote-org-chart.git
cd remote-org-chart
npm install
cp .env.example .env.local
# Edit .env.local — paste your ra_test_… token
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js local server |
| `npm test` | Vitest (hierarchy, redaction, schema) |
| `npm run build` | Production Next build |
| `npm run deploy` | OpenNext → Cloudflare Workers |
| `npm run dev:tunnel` | Local Next + cloudflared public URL (optional) |

### Environment

```bash
REMOTE_API_TOKEN=ra_test_…
REMOTE_API_BASE_URL=https://gateway.remote-sandbox.com
```

Token source: sandbox Company settings → Integrations & APIs → Remote API (read-only).  
**Never** commit `.env.local` or paste tokens into issues/PRs.

---

## Architecture

```
Browser  →  Next.js /api/*  →  gateway.remote-sandbox.com
              │
              ├─ /api/health/remote     smoke Remote reachability
              ├─ /api/employments       count + redacted sample (dev)
              ├─ /api/org-chart         forest JSON for the UI
              └─ /api/org-chart/enrich-batch
                                        internal fan-out (Workers Free)
```

| Layer | Location | Role |
|-------|----------|------|
| Remote client | `src/lib/remote/` | Env, Bearer fetch, Zod schemas, PII redaction |
| Hierarchy | `src/lib/org/` | `buildOrgForest`, Dagre layout helpers, search |
| UI | `src/components/` | AppShell, PersonNode, ReportingEdge, chart states |
| Chart page | `src/app/page.tsx` | Fetches `/api/org-chart`, React Flow canvas |

**Data note:** `GET /v1/employments` list items do **not** include manager fields. Hierarchy requires `GET /v1/employments/:id` per active employment.

**Cloudflare Free constraint:** Workers allow **50 subrequests** per invocation. Production fans enrichment through a `WORKER_SELF` service binding into `/api/org-chart/enrich-batch` (batches of 40), gated by `x-org-enrich-secret` (same value as the server token — never exposed to the browser).

---

## Edge cases (UI)

| Situation | Behavior |
|-----------|----------|
| Missing title / department | Node still renders; fields omitted or shown as soft placeholders |
| Orphan manager ID | Counted in API payload; warning surface when present |
| Reporting cycles | Detected in forest build; nodes marked `inCycle` |
| Empty active set | Empty state copy |
| Remote / network errors | Error surface with retryable vs fatal mapping |
| Auth / rate limit | Mapped to chart error codes (retryable where appropriate) |

---

## Security

- Token only in server routes / Wrangler **secrets** — never in client bundles
- Browser talks **only** to same-origin `/api/*`
- `/api/org-chart` strips work emails from the payload
- Chart UI shows name / title / department / country — not emails or addresses
- See [SECURITY.md](./SECURITY.md) for the checklist

---

## Stack (and why)

| Choice | Why |
|--------|-----|
| **Next.js + TypeScript** | App Router keeps the token off the client; typed Remote contracts |
| **Tailwind + Norma tokens** | Matches sandbox product chrome (Royal `#624DE3`, Prussian `#00234B`, Spray `#75E8F0`) |
| **React Flow + Dagre** | Interactive pan/zoom + hierarchical layout |
| **Zod** | Runtime validation of Remote JSON |
| **Vitest** | Hierarchy + redaction tests without a browser |
| **Cloudflare Workers (OpenNext + Wrangler)** | Public host with secrets; brief’s Vercel mention is a suggestion, not a requirement |

Supabase is **off** by default — Remote is the source of truth. Stretch ideas for KV/D1/webhooks live in [DECISIONS.md](./DECISIONS.md) and the issue backlog.

---

## Deploy (Cloudflare)

```bash
# One-time: wrangler login, then set the secret
npx wrangler secret put REMOTE_API_TOKEN

npm run deploy
```

`wrangler.jsonc` sets `REMOTE_API_BASE_URL` and the `WORKER_SELF` service binding.  
Public URL pattern: `https://remote-org-chart.<account>.workers.dev`

---

## Brand

- Royal Blue `#624DE3` · Prussian Blue `#00234B` · Spray `#75E8F0`
- Design system nickname: **Norma** — sandbox product chrome, not marketing site

---

## Tracking / backlog

| Surface | Purpose |
|---------|---------|
| [GitHub Issues](https://github.com/chikoshire/remote-org-chart/issues) | Executable backlog |
| [ISSUES.md](./ISSUES.md) | Serial build order |
| [DECISIONS.md](./DECISIONS.md) | Living “why we chose X” log |
| [Linear project](https://linear.app/orbit-linear/project/remote-org-chart-assessment-7304d7d0af9a) | Project mirror |

Core ship path: **#1–#8** (scaffold → data → chart → UI → deploy) + **#9** (this handoff). Stretch / polish: a11y (#30), Playwright (#31), motion (#16), wow UX (#17–#29).

---

## Docs / refs

- [Remote developer docs](https://developer.remote.com)
- [Getting started](https://developer.remote.com/docs/getting-started-with-remote)
- [Sandbox UI](https://employ.remote-sandbox.com)
- Gateway: `https://gateway.remote-sandbox.com`
- Demo reference: [remoteoss/remote-api-demo](https://github.com/remoteoss/remote-api-demo)

## License

Private assessment work unless otherwise noted.
