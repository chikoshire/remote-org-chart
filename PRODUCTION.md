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

## Live smoke commands

```bash
curl -sS https://remote-org-chart.shirechiko.workers.dev/api/health/remote
curl -sS https://remote-org-chart.shirechiko.workers.dev/api/org-chart | head -c 200
curl -sS https://remote-org-chart.shirechiko.workers.dev/api/sync-runs?limit=3
```
