## What this file is

Three weighted tables plus their supporting ones — `SHAPES` (nine bodies, the
same nine `presets.js` spends a directory each on), `ROLES` (position → what
may fill it, weighted) and `INNER` (what belongs inside what, once a track is
deep enough to split). `gen.js` draws every structural choice from here and
nowhere else; `draw.js`'s `chaos` dial is how far a draw is allowed to stray
from what these tables say.

## A role is a position; a part is what may fill it

The old generator drew a part uniformly from a flat list of eight, so a
`footer` could land in a rail and a `topbar` three levels down inside a card —
not a wilder layout, a wrong one, and the reason nothing it rolled could be
scored. `ROLES` fixes it: `masthead` is `topbar 6 · toolbar 3 · brand 1`,
`rail` is `menu 6 · toc 2`. A part with no weight in a role is not forbidden,
it is **off-model** — exactly what `chaos` reaches.

## `INNER` keeps a rail out of the middle of an article, by leaving it out entirely

When a track is deep enough to split, its children are drawn from `INNER`: a
`main` splits into prose and walls, a wall of cards splits into more walls.
`rail` is not a key in this table at all, on purpose — `gen.js` treats any
fixed-measure role as a leaf regardless of the depth dial, because a nav rail
that divides is two nav rails, not a shape anybody wants.

## The hard constraint: three lists, one commit-unit

Every name on the right of `ROLES` must exist in `spec.js`'s `PARTS` **and**
in `ext/Panel/generate.js`'s `PANELS` map — the file's own comment states it
as a rule: add roles freely, add PARTS never. `PANELS` is owned by another
session, so a new part here is a cross-module change, not a local one.

## Improvements

1. **`DEPTHS`'s keys stop at 5, so the model can never draw a depth past
   that** — `gen.js` calls `d.pick(DEPTHS)` with no `all` argument, so chaos
   blends only across the six keys already present rather than reaching a
   value outside them. The 0–10 slider is a ceiling on the *model's* output,
   never a target chaos can reach past 5, which is worth one line here since
   the readme's chaos section describes the dial as reaching "everything the
   format can say." *(simple, speculative)*
