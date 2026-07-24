# Production readiness (GH#34)

Checklist for the public Cloudflare deploy. Re-verify before interviewer send.

| Check | Status | Evidence |
|-------|--------|----------|
| Cloudflare production build + secrets | Done | `npm run deploy` → `remote-org-chart.shirechiko.workers.dev`; `REMOTE_API_TOKEN` as Wrangler secret |
| Health + org-chart green on public URL | Done | `/api/health/remote` → ok; `/api/org-chart` → ~149 people (KV-cached after warm) |
| No secrets in client bundle / repo | Done | Token server-only; [SECURITY.md](./SECURITY.md); `.env*` gitignored |
| README public URL + setup + architecture | Done | [README.md](./README.md) |
| Playwright smoke | Done | `npm run test:e2e` + `.github/workflows/playwright.yml` (fixture-mocked `/api/org-chart`) |
| A11y + PII (#30 #32) | Done | Skip link, landmarks, combobox search; emails stripped on `/api/org-chart` |
| Error / empty / loading on live data | Done | Chart state surfaces; Refresh keeps prior chart on failure |
| Marketing landing (#33) | Done | [`/welcome`](https://remote-org-chart.shirechiko.workers.dev/welcome) → CTA to `/` |
| Remote webhook subscription (#44) | Done | Callback subscribed; `REMOTE_WEBHOOK_SIGNING_KEY` as Wrangler secret; unsigned POST → `401 invalid_signature` |

## Live smoke commands

```bash
curl -sS https://remote-org-chart.shirechiko.workers.dev/api/health/remote
curl -sS https://remote-org-chart.shirechiko.workers.dev/api/org-chart | head -c 200
curl -sS https://remote-org-chart.shirechiko.workers.dev/api/sync-runs?limit=3
```

## Webhook ops (GH#44)

Receiver: `POST /api/webhooks/remote`. Without `REMOTE_WEBHOOK_SIGNING_KEY` → `503 webhook_not_configured`.

1. In sandbox **Company Settings → Integrations & APIs**, create a **write / company admin** API token (or one with `webhook:write`). Keep the app’s `REMOTE_API_TOKEN` read-only.
2. Put it in `.env.local` as `REMOTE_WEBHOOK_ADMIN_TOKEN` (gitignored).
3. Run `./scripts/subscribe-remote-webhook.sh` — stores Wrangler secret + `.env.local` signing key (never prints the key).
4. Confirm: unsigned POST returns `401 invalid_signature` (not `503`); real Remote events show in **Webhook events**.
