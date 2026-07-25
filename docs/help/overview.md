# Acme Org Chart overview

Acme Org Chart helps you explore how **Acme** is organised. It reads employments from the **Remote** API and builds a manager-to-reports hierarchy you can open in the browser.

{{shot:chrome-health}}

## Sign in

Sign in with your Acme credentials. After login you land on the Dashboard and a short **product tour** highlights the header (nav, search, Health, Help, Settings). You can restart the tour from this Help index, any Help topic, or the chat assistant ("Restart tour").

Remote API tokens never appear in the login form. They stay on the server.

## Source of truth

- Live org data comes from Remote (read-only for everyday chart loads).
- The app caches a snapshot so later loads stay fast.
- **Refresh from Remote** on Org Chart, Dashboard, or Data Health forces a fresh rebuild.
- Local profile edits: department/manager can write back to Remote (write token). Title/country often stay as browser overlays on active employments.

## Where to go

| Surface | Path |
|---------|------|
| Dashboard | `/app/dashboard` |
| Org Chart | `/app` |
| People | `/app/people` |
| Data Health (Health in the header) | `/settings/data-health` |
| Help (Help in the header) | `/help` |
| Settings | `/settings` |

Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) for the command bar: callout **1** in the header shot above.
