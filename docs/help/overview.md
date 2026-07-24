# Acme Org Chart — overview

Acme Org Chart is an organisational intelligence app for **Acme Sandbox Corp**. It reads employments from the **Remote sandbox** HRIS API and builds a manager → reports hierarchy you can explore in the browser.

## Sign in

Use the **demo credentials shared privately** with your interview invite (not published in the public README). After login you land on the Dashboard. Remote API tokens never appear in the login form — they stay on the server.

## Source of truth

- Live org data comes from Remote (read-only).
- The app caches a snapshot (Cloudflare KV) so subsequent loads are fast.
- **Refresh from Remote** on Org Chart, Dashboard, or Data Health forces a fresh rebuild.
- Local profile edits (People / Data Health “Fix in profile”) stay on this browser only — they are **not** written back to Remote.

## Where to go

| Surface | Path |
|---------|------|
| Dashboard | `/app/dashboard` |
| Org Chart | `/app` |
| People | `/app/people` |
| Data Health | `/settings/data-health` |
| Settings | `/settings` |
| Help | `/help` |

Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) for the command bar.
