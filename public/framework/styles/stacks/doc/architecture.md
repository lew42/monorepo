# Stacking architecture — floors are opaque, fills are alpha

Stacking is the rule for what a fill paints on top of: a floor is opaque, a fill is a transparent black or white rung, so one word works on every floor. The tokens live in [`framework.css`](/framework/framework.css); the page that measures them is [`stacks.js`](../stacks.js) (colour maths) plus [`page.js`](../page.js) (the matrix). Both the page and the scan read the same maths.

## Floors are opaque, fills are alpha

**Decided:** a surface you stand a thing on is an opaque token (`--wash`, `--tint`, `--surface`, `--bg`); anything that sits on a floor, such as a button, chip, hover or inline code, uses `--fill-aNN`.
**Why:** one token painted twice (`.btn` and `.surface` both on `--surface`) made every default button on a card a zero-delta fill: 101 invisible pairs across 76 pages.
**Instead:** a second opaque ladder per floor (one name per floor per step), which multiplies the "which grey, and does it work here" question.
**Detail:** [doc/decisions.md](./decisions.md#why-the-metric-is-maxfill-border-inset-ring)

## Four rungs that double

**Decided:** `--fill-a04`, `a08`, `a16`, `a32`, each rung double the last.
**Why:** a ratio ladder means one question at a call site ("how many steps up") and every adjacent step is equally separable. Measured on `--wash` the rungs land at ΔL\* 3.4 / 6.8 / 13.7 / 27.9.
**Instead:** a five- or six-rung linear scale, rejected: 4/8/16/32 already covers the hand-written values on the site.
**Detail:** [doc/decisions.md](./decisions.md#why-four-rungs-doubling)

## Literal `rgba()`, not `color-mix()`

**Decided:** the two primitives are literal `rgba(0,0,0,a)` (`--shade-aNN`) and `rgba(255,255,255,a)` (`--paper-aNN`), so no interpolation space is involved.
**Why:** source-over compositing is arithmetic in sRGB, and deriving rungs from `--ink` would make them drift whenever a theme retunes its ink.
**Instead:** `color-mix(in srgb, …)`, kept only where a rung must come from a theme colour. Mixing toward `transparent` in `oklab` shifts the hue.
**Detail:** [doc/decisions.md](./decisions.md#why-literal-rgba-rather-than-color-mix)

## `light-dark()` plus `color-scheme: dark` is the always-dark primitive

**Decided:** `--fill-aNN` is `light-dark(shade, paper)`; an island that is dark in both modes declares `color-scheme: dark` and every rung inside it flips with `--ink` and `--line`.
**Why:** `light-dark()` reads `color-scheme` at the element where the token is used, not where it is declared.
**Instead:** a third ladder typed by hand on dark surfaces, which brings the "which grey" question back.
**Detail:** [doc/decisions.md](./decisions.md#why-color-scheme-dark-is-the-always-dark-primitive)

## The metric is `max(fill, border, inset ring)`

**Decided:** `visibility()` in [`stacks.js`](../stacks.js) scores an element by the largest ΔL\* of its fill, its border, or an inset ring; the bar is `BAR = 3`.
**Why:** a button whose fill matches its card but whose hairline does not is faint, not invisible. Scoring the fill alone flags every default button and teaches nothing.
**Instead:** fill-only scoring (rejected for the reason above).
**Detail:** [doc/decisions.md](./decisions.md#why-the-metric-is-maxfill-border-inset-ring)

## Two halves per cell: opaque beside alpha

**Decided:** the matrix shows each fill twice in one cell: the real site class on the left, the `.stacks-a` alpha version on the right.
**Why:** same floor, same lighting, half the eye travel, and the matrix can side-scroll at 400.
**Detail:** [doc/decisions.md](./decisions.md#why-the-two-halves-of-a-cell-sit-together)

## What the ladder does not fix

**Decided:** an accent (`--prime`) is a hue, not a rung. A `button.prim` on `--prime` stays ΔL\* 0.0, and the answer is a rung with white ink.
**Why:** alpha compresses on a saturated floor, so a white rung moves only some channels.
**Detail:** [doc/decisions.md](./decisions.md#what-the-ladder-does-not-fix)

## More

- [`decisions.md`](./decisions.md) — the full record, including what was reversed
- [`/framework/styles/doc/stacking.md`](/framework/styles/doc/stacking.md) — the rules and fix list
