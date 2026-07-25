# Org Chart

Interactive reporting hierarchy for Acme.

{{shot:org-chart-workspace}}

## Views

- **Chart (callout 1):** canvas with pan, zoom, and collapse
- **Tree (callout 1):** indented list of the same hierarchy
- **Map (callout 1):** people by country (scroll-zoom stays on the map)

## Find someone

- Use the search box (**callout 3**, or `/` to focus it)
- Selecting a person highlights their **path to root**
- **Copy link** shares a deep link (`?person=…`)
- Keyboard: ↑ manager, ↓ first report, ←/→ siblings, Esc clears search then selection
- Incomplete badges on cards (**callout 5**) match issues listed under **Health**

## Compare reporting distance

Open **Compare** (**callout 4**, or `?compare=1`, or ⌘K then Compare). Pick Person 1 and Person 2 to see how they connect through the tree. Clear or Exit when done.

## Refresh and live updates

- **Refresh (callout 2)** pulls a fresh snapshot from Remote
- Live update badges and the sync log reflect webhook or cache activity when available
- Incomplete, Unlinked, and Cycle badges flag data-quality issues. Open **Health** in the header for the full lists.
