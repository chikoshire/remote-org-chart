# Morph + bloom transitions

Shared-element feel for Org Intelligence navigation. Optional wow polish (#70).

## Principles

1. **Morph** when the same entity continues across views (person card → detail drawer, dashboard card → destination).
2. **Bloom** when a new surface appears without a morph partner (panels, drawers).
3. **Respect `prefers-reduced-motion: reduce`** — skip View Transitions and bloom animations.

## Hooks

| Piece | Usage |
|-------|--------|
| `withViewTransition(update)` | Wrap `router.push` / state updates for supported browsers |
| `personMorphName(id)` | Stable `view-transition-name` for a person |
| `.bloom-enter` | Soft scale/fade on mount (disabled under reduced motion) |
| `[data-morph-person]` | Marks a morph partner in CSS / View Transitions |

## Apply

- People / department cards set `viewTransitionName` when that person is **not** the open selection (source for the morph).
- `PersonDetailDrawer` owns the same name + `.bloom-enter` while open.
- Open/close selection and dashboard / command-bar navigations use `withViewTransition(...)`.

## Skip

- React Flow pan/zoom physics
- Primary nav chrome (unless it clearly continues)
