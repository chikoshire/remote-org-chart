# Interviewer handoff (Org Intelligence)

Paste-ready notes for Clara / Remote interviewers.

## Live demo

**https://remote-org-chart.shirechiko.workers.dev**

| Step | Detail |
|------|--------|
| Open marketing | `/` — Log in CTA |
| Demo credentials | `demo@acme.example` / `acme-org-demo` |
| After login | Lands in the product shell at `/app` |

## Product map (authenticated)

**Dashboard · Org Chart · People · Settings (gear)**  
Department inventory lives on Dashboard (headcount by department). People uses Grid | List plus a department filter.
Data Health lives under Settings → Data Health.

| Surface | Why look |
|---------|----------|
| Dashboard | Headcount, departments, managers, completeness, deep links |
| Org Chart | React Flow hierarchy; Chart \| Tree \| Map; Cycle / Unlinked / Incomplete badges |
| People | Grid / List directory + department filter; profile drawer |
| Data Health | Reporting cycles, manager missing, incomplete profiles (Settings) |
| Settings | Connect / disconnect Remote (no secrets in UI); light / dark theme |
| ⌘K / Ctrl+K | Command bar: jump to people or primary routes |

## What to say in the walkthrough

1. Marketing → demo login → product shell.
2. Dashboard insights (incl. departments) → jump to Data Health or People.
3. Org Chart: search Jordan (fixture locally) or a real sandbox person; path-to-root highlight; no export chrome.
4. People: open a profile (soft bloom / morph where supported); filter by department.
5. Settings: theme toggle; Disconnect / Connect wizard (token stays server-side).
6. Log out → back to marketing.

## Credentials vs API token

- **Demo login** is an app session for the assessment UI only.
- **Remote data** uses a server-side read-only sandbox token (`REMOTE_API_TOKEN`). Interviewers never paste or see that token.

## Docs

- README, [SECURITY.md](../SECURITY.md), [PRODUCTION.md](../PRODUCTION.md), [DECISIONS.md](../DECISIONS.md)
- Morph pattern: [morph-bloom.md](./morph-bloom.md)
