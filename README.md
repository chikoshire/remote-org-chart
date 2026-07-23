# Remote Org Chart (Acme Sandbox Corp)

Headless HRIS org chart against the **Remote sandbox** REST API. Built as an interview assessment deliverable: interactive reporting hierarchy, edge-case UI, public deploy, and clear documentation.

> **Status:** Planning complete. Implementation has not started. See Linear project [Remote Org Chart Assessment](https://linear.app/orbit-linear/project/remote-org-chart-assessment-7304d7d0af9a) and GitHub Issues for the work breakdown.

## What this ships

1. Server-side auth to Remote sandbox (`Bearer` token — never exposed to the browser)
2. Fetch employments → build manager → reports hierarchy
3. Interactive org chart (name, title, department, reporting line)
4. Edge-case UI (missing manager / department / title, cycles, API failures, empty data)
5. Local app + this README + **public deploy** + links for the interview team

## Stack (and why)

| Choice | Why |
|--------|-----|
| **Next.js + TypeScript** | App Router server routes keep the API token off the client; typed contracts with Remote payloads |
| **Tailwind CSS** | Fast iteration toward Remote sandbox / Norma product chrome |
| **React Flow + Dagre** | Interactive pan/zoom tree with automatic hierarchical layout — standard for org charts |
| **Zod** | Runtime validation of Remote responses so UI never trusts raw JSON |
| **Vitest** | Unit-test hierarchy builder (cycles, orphans, missing fields) without a browser |
| **Vercel** | Brief-aligned public host; env secrets for `REMOTE_API_*` |

### Explicit non-goals for v1

| Skipped | Why |
|---------|-----|
| **Cloudflare / Wrangler** | Hosting is covered by Vercel; no Workers-specific edge logic required |
| **Supabase** | Remote is the source of truth; no app DB, auth, or cache needed for the assessment |

Revisit only if we later need audit logging, multi-user auth, or cached snapshots.

## Environment

Copy `.env.example` → `.env.local` (never commit secrets):

```bash
REMOTE_API_TOKEN=ra_test_…
REMOTE_API_BASE_URL=https://gateway.remote-sandbox.com
```

Token is a **read-only** customer API token from Company settings → Integrations & APIs → Remote API.

## Branch strategy

Feature and UX/UI work stay on **separate** branches. One PR per issue where practical.

See **GitHub Issues** / Linear for the full list. High-level lanes:

- `feat/*` — data, API, hierarchy, chart behavior, deploy
- `ui/*` — Norma tokens, chrome, node design, states, motion
- `docs/*` — README / handoff polish
- `chore/*` — scaffolding and tooling

## Tracking

| Surface | Purpose |
|---------|---------|
| Linear (`TUXX` / Remote Org Chart Assessment) | Source of truth for issue detail |
| Orbit Kanban | Day-to-day board |
| GitHub Issues + PR comments | Visible history on the public repo |

Comments are written in first person as project notes — no tooling slash-commands or agent branding.

## Brand cues

- Royal Blue `#624DE3`
- Prussian Blue `#00234B`
- Spray `#75E8F0`
- Design system nickname: **Norma** — match **sandbox product chrome**, not the marketing site

## Docs / refs

- [Remote developer docs](https://developer.remote.com)
- [Getting started](https://developer.remote.com/docs/getting-started-with-remote)
- [Sandbox UI](https://employ.remote-sandbox.com)
- Gateway: `https://gateway.remote-sandbox.com`
- Demo reference: [remoteoss/remote-api-demo](https://github.com/remoteoss/remote-api-demo)

## License

Private assessment work unless otherwise noted.
