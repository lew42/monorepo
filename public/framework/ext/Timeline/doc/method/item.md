# item(it, base, lane)

Renders one item: computes its own `start`/`end`/`instant`, builds an `<a>`
(if `url`) or `<div>` with `timeline-item` plus a shape class (`dot`/`bar`)
plus `kind`, writes `--t`/`--d`/`--lane`, and recurses into `children`
(positioned relative to **this item's own `from`**, not the top-level
`base`).

`labeled` suppresses the inline label for an unlabeled instant dot unless its
`kind` is `window` or `day` — a bare dot is meant to read from its `title`
attribute (set unconditionally below, so hover always shows the label even
when the inline span doesn't render).

`end` comes from `end(it, start)` — the same call `lay()` makes to know when
a lane frees. See `doc/method/end.md`.

## Improvements

1. **`children` recursion passes `lane: 0` unconditionally** — nested items
   are never packed against each other (phase 2, per the readme and
   `doc/phase-2.md`). Documented as deferred, not a bug.
