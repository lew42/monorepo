## templates.css

A template's *look* is its payload — the one file in this module sanctioned
to be more than structure, because for a `T` entry the look is the entire
point. Every size in it is a percentage of its own box or a plain `em`, so one
rule set reads from a
200px sliver to a 3440 monitor. Full sizing rules and the trap that already
bit: [Templates — the T vocabulary](/framework/ext/Panel/doc/templates/).

## `block-size: 100%`, and the row that makes it resolve

`.panel-t` asks for `100%` of the body's one row, and `panel.css`'s
`.panel-body:has(> .panel-t) { grid-template-rows: 100% }` is what answers it —
the body is a grid of `min-content` rows, so without an explicit track the
percentage has nothing to resolve against and every scene with no text
(`blank`, `aurora`, `drift`, `depth`) measures 0px. In a HUGGING panel the row
is indefinite and both percentages fall back to the content, which is what hug
means now; a drawing with nothing to measure wears **`.panel-t-scene`** and takes
a 16em floor on the hugging axis instead.
[sizing](/framework/ext/Panel/doc/sizing/).

## What paints is `%`; what types is `em`

No container query survives in this module (2026-08-19). A gradient extent, a
gap, a pad, a `background-size` is a percentage of the same box the `cq` unit
read — exact, and it animates. A type size is a plain `em`, so a template reads
at the panel's own text size; scaling a whole drawing to fit its box is `zoom` on
a viewport, done once for everything, which is what the Workspace is for.

⚠ Three values may not take a percentage and became lengths instead:
`filter: blur()` (aurora) and `perspective` (depth) are `em`, and a `circle`
gradient's radius may not either, so drift's stars kept the px floor they already
had.

## No `cq` unit inside a `@keyframes`

Animations move in `%`, `opacity` or `perspective-origin`. That was always true
here, and now it is true of the whole file.

## `aurora`/`drift`/`depth` are literal colour, and stay that way in both themes

These three scenes hard-code deep, dark backgrounds (`#0b0a14`, `#05060d`,
`#07060f → #1a1136`) rather than reading `--surface`/`--wash`, because a
night sky that inverts under a light OS theme reads as a bug, not a feature.
Their glow accents still come from `--prim`, so a brand theme swap retints
them without touching the ground colour.

## Furniture is sized by its widest line, not guessed

A rail row is the longest word plus an icon, a gap and the pad (~7.4em); a toc's
is its 0.72em letter-spaced heading (~8.1em); a wordmark is ~4.9em. Those numbers
are why `rail` is `1em`, `toc` `0.9em` and `brand` `2.5em`, and they are what a
slot has to be able to hold. ⚠ Narrower than that, furniture no longer shrinks to
fit — it clips, because `.panel` is `overflow: hidden`. Fitting a drawing to its
slot is `zoom`'s job now (the Workspace, task C), not this sheet's.

## `prefers-reduced-motion` disables every `@keyframes` consumer by name

One block at the end turns off `panel-t-depth`'s own animation plus every
`.panel-t-layer` child inside `aurora`, `drift` and `depth` — declared
**after** the rules it overrides, at equal specificity, so the cascade order
alone does the work with no `!important`.

## `.panel-props` is a control surface, not a scene

The inspector's block is the one payload here that is **not** measured in `cq`
units: a picture scales with its panel, a control has to stay readable, so it
reads in `em` at the panel's own text size. One thing it has to undo about a
body built for scenes:

- ⚠ **`.panel-props .icon { width: 1em }`**, the bar's ligature clamp again: the
  template picker draws 28 icon names, and one the font does not carry would
  render as a whole word and size every column of the grid.

Two things it used to undo are gone, both to one rule elsewhere. This sheet
carried `.panel-body:has(> .panel-props) { align-content: start }` because centred
overflow spills out of *both* ends and the near end cannot be scrolled to (the
first row measured 124.8px above its own panel); `panel.css` now reads the
alignment tokens `safe`, which fixes every overflowing template at once. And it
carried a private `padding-block-start: 2.4em` to clear the bar; `properties.js`
now wears `.panel-controls` instead, and `panel.css` pads the **body** by the
bar's own `--panel-bar-h`. Both were one payload solving a problem every payload
of that shape has — which is how two mechanisms for one thing get written.

Its buttons carry three classes (`.panel .panel-props .panel-props-btn`) for the
reason `toolbar.css` spells out — a theme styles every `button` at 0-2-0. An icon
set `auto-fill`s to the width it is given; a word set keeps its declared column
count, because `align` is a 3×3 or it is not a picture of the nine placements.

## ⚠ The space dial needed the same three classes, and did not have them

`.panel-t-dial button` is `(0,1,1)`. `.theme-lew42 :is(button, .btn)` is `(0,2,0)`
and both live in `@layer theme`, so the theme's `padding: 0.7em 1.4em` won and the
module's `padding: 0 0.25em` never applied at all. Measured: each of the three
controls **39.4 × 31.1px** and the pill **180.4 × 35.5**, against **17.0 × 17.5**
and **113.2 × 26.3** once the selector reclaims the box —

```css templates.css
.panel .panel-t-space .panel-t-dial button { padding: 0 0.25em; … }
```

— the third precedent in this module for the same theme rule, after
`toolbar.css`'s `.panel > .panel-bar .panel-btn` and `.panel-props-btn` above.
Only the box is reclaimed; the small-caps voice stays the theme's.

The dial was also the one icon set in the module **without** the ligature clamp
its two siblings carry, so `.panel-t-dial .icon { width: 1em; overflow: hidden }`
joins it — a missing glyph here would render as a word and size the whole
readout.

## Improvements

1. **342 lines and climbing**, the largest file in the module and the one place the
   readme explicitly grants an exception ("a template's look is its
   payload"). Worth periodic re-reading as new scenes are added, not
   worth trimming today — three of the four over-budget blocks
   (`aurora`/`drift`/`depth`) are pure payload. *(n/a — sanctioned, watch
   rather than fix)*
2. **`.panel-t-wall`'s breakpoints (`15em`, `9/5`) are magic numbers with no
   comment explaining the choice**, unlike the file's other tuned constants
   (the radius `max()` pairs, which do explain themselves). One line naming
   *why* those two values — one column looks composed under 15em, four looks
   composed past a 9:5 aspect — would save the next reader from guessing
   whether they're tuned or arbitrary. *(simple, useful)*
