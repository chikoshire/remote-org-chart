# Sync and Refresh

{{shot:dashboard-overview}}

## What “synced …” means

The timestamp is the last time the app successfully built (or served) an org snapshot from Remote. Cached responses still show that snapshot’s time — see **callout 2** on the Dashboard (Refresh from Remote).

## Cache

Production stores the hierarchy in **Cloudflare KV** (about 15 minutes of typical reuse). Cold builds take longer because each employment is enriched for manager IDs.

## Refresh from Remote

Available on:

1. **Org Chart:** Refresh control in the sidebar
2. **Dashboard:** Refresh from Remote next to the synced line (**callout 2**)
3. **Data Health / Health:** same control next to the intro

All three call `/api/org-chart?refresh=1`, rewrite the snapshot, and update the session cache used by other surfaces. If refresh fails, the previous chart or data stays visible.
