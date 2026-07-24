# Org Chart

Interactive reporting hierarchy for Acme Sandbox Corp.

## Views

- **Chart** — React Flow canvas (pan, zoom, collapse branches)
- **Tree** — indented list of the same forest
- **Map** — people by country (scroll-zoom stays on the map; it won’t pan the page when zoom is maxed)

## Find someone

- Use the search box (or `/` to focus it)
- Selecting a person highlights their **path to root**
- **Copy link** shares a deep link (`?person=…`)
- Keyboard: ↑ manager, ↓ first report, ←/→ siblings, Esc clears search then selection

## Compare reporting distance

Open **Compare** (or `?compare=1`, or ⌘K → Compare). Pick Person 1 and Person 2 to see how they connect through the tree. Clear or Exit when done.

## Refresh and live updates

- **Refresh** pulls a fresh snapshot from Remote (`?refresh=1`)
- Live update badges / sync log reflect webhook or cache activity when available
- Incomplete / Unlinked / Cycle badges flag data-quality issues — dig into Data Health for lists
