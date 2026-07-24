# Org Chart

Interactive reporting hierarchy for Acme Sandbox Corp.

## Views

- **Chart:** canvas with pan, zoom, and collapse
- **Tree:** indented list of the same hierarchy
- **Map:** people by country (scroll-zoom stays on the map)

## Find someone

- Use the search box (or `/` to focus it)
- Selecting a person highlights their **path to root**
- **Copy link** shares a deep link (`?person=…`)
- Keyboard: ↑ manager, ↓ first report, ←/→ siblings, Esc clears search then selection

## Compare reporting distance

Open **Compare** (or `?compare=1`, or ⌘K then Compare). Pick Person 1 and Person 2 to see how they connect through the tree. Clear or Exit when done.

## Refresh and live updates

- **Refresh** pulls a fresh snapshot from Remote
- Live update badges and the sync log reflect webhook or cache activity when available
- Incomplete, Unlinked, and Cycle badges flag data-quality issues. Open Data Health for the full lists.
