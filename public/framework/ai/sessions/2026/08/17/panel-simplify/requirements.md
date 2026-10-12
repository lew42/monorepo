# panel-simplify

**A deletion task, not a feature.** `ext/Panel` gained ~12 capabilities on 2026-08-16
and grew to 2,582 lines of JS. Its central file, `workspace.js`, went from ~200 to 365 —
and the module's own readme flagged 200+ as a problem *before* that wave started.

Mike, 2026-08-17: *"I always want the objective to create clean, simpler solutions, not
generate hacks, bandaids, spaghetti, that I'll never understand."*

## The target

`workspace.js` under 200 lines, with **no capability removed** and no behaviour changed.

## Why it is achievable

`view()` now does eight things inline. Several are already one-line delegations to a
module that owns the concern (`align_grid`, `edges`, `text_layers`, `display_overlay`,
`insert_bar`, `repeat_layers`, `sizing`). The file also holds `mount`, `focus`, `paint`,
`repaint`, `show`, the disposer registry, the mirror repaint walk and the two doors.

## Fences

Owns `public/framework/ext/Panel/**` only. The concurrent run is in `ext/DesignTool`,
`ext/Doc` and `styles/` — do not touch those.
