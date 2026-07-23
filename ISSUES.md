# Issue map (canonical IDs)

**Canonical key = GitHub issue number (`GH#N`).**
Linear (`TUXX-…`) and Orbit (`TUX-…`) auto-assign their own IDs — they will **not** equal `1…32`.
Every parent title includes `· GH#N`. Search Linear (or Orbit) for `GH#5` to land on the matching work item.

## Serial build order (one parent at a time)

Rule: move parent **Backlog → In Progress → Review** (all children done) before starting the next parent. No parallel parent hopping.

| Seq | GH | Priority | Why this slot |
|-----|----|----------|---------------|
| 1 | #1 | Urgent | Scaffold + OpenNext + Vitest |
| 2 | #2 | Urgent | Server proxy + token safety |
| 3 | #3 | Urgent | Employments fetch + Zod |
| 4 | #4 | Urgent | Hierarchy builder + tests |
| 5 | #10 | High | Norma tokens before chart chrome |
| 6 | #11 | High | App shell slots |
| 7 | #12 | High | Person node |
| 8 | #13 | High | Edges + path highlight |
| 9 | #14 | High | Loading/empty/error surfaces |
| 10 | #5 | High | React Flow chart (integrates 10–14) |
| 11 | #6 | High | Edge-case states |
| 12 | #7 | High | Search + focus path |
| 13 | #15 | Medium | Responsive / touch |
| 14 | #32 | High | Security/PII checklist before public URL |
| 15 | #8 | High | Cloudflare deploy |
| 16 | #9 | High | README + handoff |
| 17 | #30 | Medium | A11y pass |
| 18 | #31 | Medium | Playwright smoke |
| 19 | #16 | Low | Motion polish |
| 20–26 | #17–#23 | Med/Low | Stretch UX |
| 27–29 | #24–#26 | Med/Low | Stretch cache/sync |
| 30–32 | #27–#29 | Low | Stretch webhooks/live |
| 33 | #33 | Low | **Bonus** marketing landing (after #31) |
| 34 | #34 | Medium | **Bonus** production-readiness gate (after #8/#31) |

**Coverage check (2026-07-23):** 34 parents. Tier 0 / UX / stretch / cross + bonus #33–#34. Marketing landing is **not** in Clara’s core brief — tracked as stretch wow.

| GH | Linear | Orbit | Branch | Lane | Subs |
|----|--------|-------|--------|------|------|
| #1 | TUXX-1468 | TUX-16894271 | `chore/scaffold-next-app` | Tier 0 | 3 |
| #2 | TUXX-1469 | TUX-16894401 | `feat/remote-api-proxy` | Tier 0 | 3 |
| #3 | TUXX-1470 | TUX-16894419 | `feat/employments-client` | Tier 0 | 3 |
| #4 | TUXX-1471 | TUX-16894440 | `feat/org-hierarchy` | Tier 0 | 3 |
| #5 | TUXX-1472 | TUX-16894454 | `feat/org-chart-react-flow` | Tier 0 | 4 |
| #6 | TUXX-1473 | TUX-16894476 | `feat/edge-case-handling` | Tier 0 | 3 |
| #7 | TUXX-1474 | TUX-16894502 | `feat/search-and-focus` | Tier 0 | 3 |
| #8 | TUXX-1476 | TUX-16894503 | `feat/deploy-cloudflare` | Tier 0 | 3 |
| #9 | TUXX-1475 | TUX-16894504 | `docs/readme-and-handoff` | Tier 0 | 3 |
| #10 | TUXX-1477 | TUX-16894639 | `ui/norma-design-tokens` | UX | 2 |
| #11 | TUXX-1478 | TUX-16894663 | `ui/app-chrome` | UX | 2 |
| #12 | TUXX-1479 | TUX-16894683 | `ui/person-node` | UX | 2 |
| #13 | TUXX-1480 | TUX-16894684 | `ui/reporting-edges` | UX | 2 |
| #14 | TUXX-1481 | TUX-16894697 | `ui/state-surfaces` | UX | 2 |
| #15 | TUXX-1482 | TUX-16894723 | `ui/responsive-interaction` | UX | 2 |
| #16 | TUXX-1483 | TUX-16894727 | `ui/motion-polish` | UX | 2 |
| #17 | TUXX-1484 | TUX-16894849 | `feat/org-insights` | Stretch 1 | 2 |
| #18 | TUXX-1485 | TUX-16894852 | `feat/person-detail-drawer` | Stretch 1 | 2 |
| #19 | TUXX-1486 | TUX-16894872 | `feat/org-filters` | Stretch 1 | 2 |
| #20 | TUXX-1487 | TUX-16894898 | `feat/deep-links` | Stretch 1 | 2 |
| #21 | TUXX-1489 | TUX-16894930 | `feat/collapse-density` | Stretch 1 | 2 |
| #22 | TUXX-1488 | TUX-16894917 | `feat/export-keyboard` | Stretch 1 | 3 |
| #23 | TUXX-1490 | TUX-16894947 | `feat/reporting-distance` | Stretch 1 | 2 |
| #24 | TUXX-1491 | TUX-16894952 | `feat/employment-snapshot-cache` | Stretch 2 | 3 |
| #25 | TUXX-1492 | TUX-16894956 | `feat/manual-remote-refresh` | Stretch 2 | 2 |
| #26 | TUXX-1493 | TUX-16894970 | `feat/sync-run-log` | Stretch 2 | 2 |
| #27 | TUXX-1494 | TUX-16894980 | `feat/remote-webhooks` | Stretch 3 | 2 |
| #28 | TUXX-1495 | TUX-16895005 | `feat/live-org-updates` | Stretch 3 | 2 |
| #29 | TUXX-1496 | TUX-16895009 | `feat/event-history-ui` | Stretch 3 | 2 |
| #30 | TUXX-1498 | TUX-16896896 | `cross/a11y-pass` | Cross | 2 |
| #31 | TUXX-1497 | TUX-16896875 | `cross/playwright-smoke` | Cross | 2 |
| #32 | TUXX-1499 | TUX-16896903 | `cross/security-pii` | Cross | 2 |

## How IDs relate

1. **GitHub `#N`** is the shared handle across tools (this is what “matching numbers” means in practice).
2. **Linear** parents: `TUXX-1468`…`TUXX-1499`; children: `TUXX-1500`…
3. **Orbit** parents: real keys in the table above (not the same integer as GH).
4. Sub-issues are **Linear children** first; GitHub + Orbit get checklist comments on the parent (Orbit also mirrors many `[sub · GH#N]` cards via the Linear bridge).

## How to use Linear day-to-day

1. Open [Remote Org Chart Assessment](https://linear.app/orbit-linear/project/remote-org-chart-assessment-7304d7d0af9a).
2. Search `GH#N` or expand parent → children.
3. Update **Linear first**, then mirror a short comment on GitHub + Orbit (or ask the agent to sync).

## Sub-issue convention

- Title: `[sub · GH#N] Layer — short name`
- Layers: `BE` | `FE` | `UX` | `Test` | `Infra` | `Docs` | `Sec`
- Linear: real child (`parentId`)
- GitHub: parent comment checklist
- Orbit: parent comment + bridged sub cards where available

## Coverage checklist (deep dive)

For each feature parent we required at least one of each relevant layer:
- **Tier 0 (#1–#9):** Infra/BE/FE/Test/Docs/Sec as applicable
- **UX (#10–#16):** UX design + FE implementation bridge
- **Stretch (#17–#29):** BE (or pure helpers) + FE/UX
- **Cross (#30–#32):** a11y, Playwright/CI, security/PII

## Sub-issue inventory (by parent)

### GH#1 — TUXX-1468 · TUX-16894271
_[feat] Scaffold Next.js app (TS, Tailwind, Vitest) · GH#1_
- `TUXX-1500` — [sub · GH#1] Infra — OpenNext/Cloudflare baseline
- `TUXX-1501` — [sub · GH#1] FE — App Router layout stub
- `TUXX-1502` — [sub · GH#1] Test — Vitest smoke wired

### GH#2 — TUXX-1469 · TUX-16894401
_[feat] Remote API server proxy + auth · GH#2_
- `TUXX-1503` — [sub · GH#2] BE — remoteFetch + env Zod
- `TUXX-1504` — [sub · GH#2] BE — /api/health/remote smoke
- `TUXX-1505` — [sub · GH#2] Sec — token redaction + error map

### GH#3 — TUXX-1470 · TUX-16894419
_[feat] Fetch + validate employments · GH#3_
- `TUXX-1506` — [sub · GH#3] Docs — OpenAPI field inventory
- `TUXX-1507` — [sub · GH#3] BE — pagination + status policy
- `TUXX-1508` — [sub · GH#3] BE/Test — Zod schema + fixtures

### GH#4 — TUXX-1471 · TUX-16894440
_[feat] Build manager→reports hierarchy · GH#4_
- `TUXX-1509` — [sub · GH#4] BE — forest builder + cycles
- `TUXX-1510` — [sub · GH#4] Test — edge fixture matrix
- `TUXX-1511` — [sub · GH#4] Types — OrgNode shared contract

### GH#5 — TUXX-1472 · TUX-16894454
_[feat] Interactive React Flow org chart · GH#5_
- `TUXX-1512` — [sub · GH#5] BE — GET /api/org-chart
- `TUXX-1513` — [sub · GH#5] FE — React Flow + Dagre
- `TUXX-1514` — [sub · GH#5] FE — selection + path-to-root state
- `TUXX-1518` — [sub · GH#5] UX — integrate tokens/nodes/edges

### GH#6 — TUXX-1473 · TUX-16894476
_[feat] Edge-case handling (data + API) · GH#6_
- `TUXX-1515` — [sub · GH#6] BE/FE — API error → UI codes + retry
- `TUXX-1516` — [sub · GH#6] UX — copy + state surfaces
- `TUXX-1517` — [sub · GH#6] FE — edge-case state machine

### GH#7 — TUXX-1474 · TUX-16894502
_[feat] Search and focus reporting path · GH#7_
- `TUXX-1519` — [sub · GH#7] UX — search in chrome
- `TUXX-1520` — [sub · GH#7] FE — search control + results
- `TUXX-1521` — [sub · GH#7] FE — focus/center from search

### GH#8 — TUXX-1476 · TUX-16894503
_[feat] Public Cloudflare deploy (Wrangler) · GH#8_
- `TUXX-1522` — [sub · GH#8] Infra — wrangler + OpenNext prod build
- `TUXX-1523` — [sub · GH#8] Infra — Cloudflare secrets
- `TUXX-1524` — [sub · GH#8] BE — verify proxy on Cloudflare runtime

### GH#9 — TUXX-1475 · TUX-16894504
_[docs] README + interview handoff · GH#9_
- `TUXX-1532` — [sub · GH#9] Docs — README setup + architecture
- `TUXX-1533` — [sub · GH#9] Docs — decisions + interviewer notes
- `TUXX-1575` — [sub · GH#9] Docs — deploy URL + screenshots

### GH#10 — TUXX-1477 · TUX-16894639
_[ui] Norma design tokens · GH#10_
- `TUXX-1525` — [sub · GH#10] UX — CSS vars + type scale
- `TUXX-1568` — [sub · GH#10] FE — Tailwind theme bridge

### GH#11 — TUXX-1478 · TUX-16894663
_[ui] App chrome shell · GH#11_
- `TUXX-1526` — [sub · GH#11] UX — shell composition + slots
- `TUXX-1569` — [sub · GH#11] FE — shell layout components

### GH#12 — TUXX-1479 · TUX-16894683
_[ui] Person node design · GH#12_
- `TUXX-1527` — [sub · GH#12] UX — node variants + contrast
- `TUXX-1570` — [sub · GH#12] FE — PersonNode React Flow component

### GH#13 — TUXX-1480 · TUX-16894684
_[ui] Reporting edges + path highlight · GH#13_
- `TUXX-1528` — [sub · GH#13] UX — edge + highlight styles
- `TUXX-1571` — [sub · GH#13] FE — edge renderer + highlight toggle

### GH#14 — TUXX-1481 · TUX-16894697
_[ui] State surfaces · GH#14_
- `TUXX-1529` — [sub · GH#14] UX — loading/empty/error components
- `TUXX-1572` — [sub · GH#14] FE — state surface components

### GH#15 — TUXX-1482 · TUX-16894723
_[ui] Responsive pan/zoom · GH#15_
- `TUXX-1534` — [sub · GH#15] UX — responsive + touch interactions
- `TUXX-1573` — [sub · GH#15] FE — RF interaction + mobile chrome

### GH#16 — TUXX-1483 · TUX-16894727
_[ui] Motion polish · GH#16_
- `TUXX-1535` — [sub · GH#16] UX — intentional motion + reduced-motion
- `TUXX-1574` — [sub · GH#16] FE — motion hooks + reduced-motion

### GH#17 — TUXX-1484 · TUX-16894849
_[stretch] Org insights panel · GH#17_
- `TUXX-1530` — [sub · GH#17] BE/Test — insight metrics helpers
- `TUXX-1531` — [sub · GH#17] FE/UX — insights panel UI

### GH#18 — TUXX-1485 · TUX-16894852
_[stretch] Person detail drawer · GH#18_
- `TUXX-1538` — [sub · GH#18] FE — person detail panel binding
- `TUXX-1539` — [sub · GH#18] UX — detail panel layout

### GH#19 — TUXX-1486 · TUX-16894872
_[stretch] Filters · GH#19_
- `TUXX-1536` — [sub · GH#19] FE — filter state + tree apply
- `TUXX-1537` — [sub · GH#19] UX — filter controls UI

### GH#20 — TUXX-1487 · TUX-16894898
_[stretch] Deep links · GH#20_
- `TUXX-1542` — [sub · GH#20] FE — deep-link parse + hydrate
- `TUXX-1543` — [sub · GH#20] UX — share link affordance

### GH#21 — TUXX-1489 · TUX-16894930
_[stretch] Collapse + density · GH#21_
- `TUXX-1544` — [sub · GH#21] FE — collapse + density state
- `TUXX-1545` — [sub · GH#21] UX — collapse + density controls

### GH#22 — TUXX-1488 · TUX-16894917
_[stretch] Export + keyboard · GH#22_
- `TUXX-1540` — [sub · GH#22] UX — export affordance
- `TUXX-1541` — [sub · GH#22] FE — export chart image
- `TUXX-1546` — [sub · GH#22] FE — keyboard navigation

### GH#23 — TUXX-1490 · TUX-16894947
_[stretch] Reporting distance / LCA · GH#23_
- `TUXX-1547` — [sub · GH#23] BE/Test — LCA distance helpers
- `TUXX-1548` — [sub · GH#23] FE/UX — pick-two + path UI

### GH#24 — TUXX-1491 · TUX-16894952
_[stretch] Employment snapshot cache · GH#24_
- `TUXX-1549` — [sub · GH#24] BE — snapshot store (KV/D1)
- `TUXX-1550` — [sub · GH#24] BE — cache read path + TTL
- `TUXX-1551` — [sub · GH#24] UX — cache freshness indicator

### GH#25 — TUXX-1492 · TUX-16894956
_[stretch] Manual refresh from Remote · GH#25_
- `TUXX-1552` — [sub · GH#25] BE — manual refresh API
- `TUXX-1553` — [sub · GH#25] FE/UX — refresh control

### GH#26 — TUXX-1493 · TUX-16894970
_[stretch] Sync run log · GH#26_
- `TUXX-1554` — [sub · GH#26] BE — sync run log store
- `TUXX-1555` — [sub · GH#26] FE/UX — sync log list

### GH#27 — TUXX-1494 · TUX-16894980
_[stretch] Remote webhooks inbox · GH#27_
- `TUXX-1556` — [sub · GH#27] BE — webhook ingress + verify
- `TUXX-1557` — [sub · GH#27] Docs/Sec — webhook setup + secrets

### GH#28 — TUXX-1495 · TUX-16895005
_[stretch] Live chart updates · GH#28_
- `TUXX-1558` — [sub · GH#28] BE — live update channel
- `TUXX-1559` — [sub · GH#28] FE/UX — live indicator + soft refresh

### GH#29 — TUXX-1496 · TUX-16895009
_[stretch] Event / sync history UI · GH#29_
- `TUXX-1560` — [sub · GH#29] FE/UX — event history UI
- `TUXX-1561` — [sub · GH#29] BE — event history query API

### GH#30 — TUXX-1498 · TUX-16896896
_[cross] Accessibility pass · GH#30_
- `TUXX-1562` — [sub · GH#30] UX — a11y pass chart + chrome
- `TUXX-1563` — [sub · GH#30] FE — focus management + ARIA

### GH#31 — TUXX-1497 · TUX-16896875
_[cross] Playwright smoke E2E · GH#31_
- `TUXX-1564` — [sub · GH#31] Infra — wire Playwright in CI
- `TUXX-1565` — [sub · GH#31] Test — Playwright smoke suite

### GH#32 — TUXX-1499 · TUX-16896903
_[cross] Security & PII checklist · GH#32_
- `TUXX-1566` — [sub · GH#32] Sec — PII + token checklist
- `TUXX-1567` — [sub · GH#32] BE — response/error redaction audit

