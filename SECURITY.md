# Security & PII checklist (GH#32)

Canonical for the Remote org-chart assessment. Re-check before every public deploy (#8).

## Token & secrets

- [x] `REMOTE_API_TOKEN` only on the server (route handlers / `remoteFetch`) — never imported into client components
- [x] `.env.local` gitignored; `.env.example` has empty placeholders only
- [x] Cloudflare Workers secrets (prod) for `REMOTE_API_TOKEN` / `REMOTE_API_BASE_URL` — not baked into the client bundle
- [x] Error paths run through `redactSecrets` / `toClientSafeMessage` before JSON responses

## PII minimization

- [x] `/api/org-chart` strips `workEmail` from roots and flat nodes
- [x] Chart UI shows name / title / department / country only — no emails, phones, or addresses
- [x] Client logs must not dump employment payloads (fetch results stay in React state, not `console.log`)

## Transport & runtime

- [x] Browser talks only to same-origin `/api/*` proxies — not directly to `gateway.remote-sandbox.com`
- [x] Sandbox token is read-only (`ra_test_…`) against `gateway.remote-sandbox.com`
- [x] Public preview tunnels (cloudflared / localtunnel) are for development; production uses Cloudflare Workers URL from #8

## Audit commands

```bash
npm test                 # includes redaction + org-chart PII tests
rg -n "REMOTE_API_TOKEN" src --glob '!**/env.ts' --glob '!**/client.ts'
# Expect: no client/component hits; only server env + remoteFetch
```

## Sign-off

| Check | Date | Notes |
|-------|------|-------|
| Local audit green | 2026-07-24 | Vitest redaction + email strip |
| Pre-deploy (#8) | _pending_ | Confirm Wrangler secrets set |
