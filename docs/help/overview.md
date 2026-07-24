# Acme Org Chart overview

Acme Org Chart helps you explore how **Acme Sandbox Corp** is organised. It reads employments from the **Remote sandbox** API and builds a manager-to-reports hierarchy you can open in the browser.

## Sign in

Use the **demo credentials shared privately** with your interview invite. After login you land on the Dashboard. Remote API tokens never appear in the login form. They stay on the server.

## Source of truth

- Live org data comes from Remote (read-only).
- The app caches a snapshot so later loads stay fast.
- **Refresh from Remote** on Org Chart, Dashboard, or Data Health forces a fresh rebuild.
- Local profile edits (People / Data Health “Fix in profile”) stay on this browser only. They are **not** written back to Remote.

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
