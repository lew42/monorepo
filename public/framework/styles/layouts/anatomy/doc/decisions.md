# Anatomy — decisions and record

*Written 2026-08-18, Figma wave 1, Minion B.*

## Why one directory and not seven

The brief's own test: if most of the seven collapse into `stack`/`flex`/`grid`
restated, ship one Reference page, not seven dirs. They do — more completely than
[Wire](/framework/styles/layouts/wire/)'s eight, which still needed seven distinct
class strings and found one genuine gap (the bento seam). Here there are exactly
**two** primitives, `flex v` (Burger) and `flex auto` + `--grow: 2` (Columns), and
the seven Figma children are every nesting of the two, in either order, one to three
levels deep. Burger with Columns *is* [App shell](/framework/styles/layouts/shell/)'s
own header/rail-content-aside/footer row with a real nav instead of a placeholder
band. **Verdict: one `Reference` card, seven inline children** — same shape `wire/`
and `400/` already use, for the same reason.

## `--grow` fits this design better than the pattern it replaces

[Shell](/framework/styles/layouts/shell/) and [Sidebar](/framework/styles/layouts/sidebar/)
predate `--grow` (shipped hours before this task) and reach for a fixed `basis` rail
plus an inline `flex: 1 1 24em`/`26em` for a fluid-but-uneven row. The Figma's own
"Columns" ratio (354.5 : 736 : 354.5 px, ≈ 1 : 2.07 : 1) is close enough to 1:2:1 that
`--grow: 2` on the centre is a truer read of the design than a fixed rail would be —
none of the three tracks in the Figma look like a nav rail that refuses to grow. No
inline `flex` appears anywhere in `specs.js`.

## Two spacing values, converged

`--pad` is never set (every box a plain `.pad` at 1em); `--gap: 0.4em` is the only
other value, between a band's label and its line. `--column: 12em` is the one wrap
threshold, on the Columns row — a threshold is the layout decision itself, per the
same reasoning `wire/doc/decisions.md` already recorded, and does not converge with
the other layouts' `--column` values on purpose.

## Measured

Seven shapes × four widths (400 / 1280 / 1920 / 3440), read at the bare `/full/` url:
`document.documentElement.scrollWidth === clientWidth` at all 28, zero console errors
once `readme.md` existed (a missing doc file 404s `md.details()`'s fetch — not a
layout defect, and the same trap the `documentation` skill exists to catch before
`finish-task`). `.tint` computed to a non-transparent background
(`rgb(248, 248, 248)`) and `--grow: 2` computed to `flex-grow: 2` on the probed
centre track — both confirmed live, not assumed, per the "class that paints nothing"
trap the pilot named.

## Dilemmas logged, none blocking

- **"3× Burgers" is peers, not a `--grow` row.** The Figma's three burgers are equal
  width, so this shape uses `flex three` (matching
  [Wire → Three Full Columns](/framework/styles/layouts/wire/columns/)), not the
  Columns primitive — the two "three things side by side" shapes in this frame are
  not the same word, and picking the wrong one would have made the peers uneven for
  no reason. Assumption: equal Figma widths mean equal peers; asymmetric widths mean
  `--grow`.
- **No header/footer variant of Columns was in the Figma**, but 3× Columns needed
  three rows sharing the page's height evenly, so each row carries `flex-1` — a
  one-word addition already established by every other layout in this tier
  (`shell`, `hero`, `document`), not a new decision.
