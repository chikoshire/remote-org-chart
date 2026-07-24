# Morph + bloom transitions

Shared-element feel for Org Intelligence navigation. Optional wow polish (#70).

## Principles

1. **Morph** when the same entity continues across views (person card → detail drawer → full profile).
2. **Bloom** when a new surface appears without a morph partner (panels, profile sections).
3. **Respect `prefers-reduced-motion: reduce`** — skip View Transitions and bloom animations.

## Hooks

| Piece | Usage |
|-------|--------|
| `withViewTransition(update)` | Wrap `router.push` / selection updates |
| `personAvatarMorphName(id)` | Stable `view-transition-name` for the avatar |
| `personNameMorphName(id)` | Stable name for the display name |
| `personMorphName(id)` | Legacy whole-card name (prefer avatar/name) |
| `.bloom-enter` | Soft scale/fade on mount |
| `captureProfileReturn` / `consumeReturnScrollIfMatching` | Back from profile to chart or people with scroll |

## Apply

- Chart nodes and People cards set avatar/name morph when that person is **not** the open selection.
- `PersonDetailDrawer` owns avatar + name morph while open.
- Full profile owns the same morph partners; open via `withViewTransition` + `captureProfileReturn`.
- Back label is **← Org Chart** or **← People** based on where the user came from; People restores list scroll.

## Skip

- React Flow pan/zoom physics
- Primary nav chrome (unless it clearly continues)
