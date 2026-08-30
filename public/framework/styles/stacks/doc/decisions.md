# stacks — the record

## Why this page ships a stylesheet when no sibling does

`styles/page.js` states that nothing under it ships CSS, because a section arguing for less
CSS that needed its own would be arguing against itself. This page is the exception and the
reason is its subject: it **proposes a token ladder**, and a proposal you cannot see is a
paragraph. `stacks.css` holds the proposed tokens and the grid that renders them, and
nothing else.

## Why the tokens live on `.stacks-lab` and not in the theme

The task landed the lab and the evidence, not the flip. Putting `--fill-aNN` in `lew42.css`
would change every page on the site in the same commit that first argues for it. The flip
is two lines of `framework.css` and is its own wave — [`stacking.md`](/framework/styles/doc/stacking.md)
carries the bill.

## Why four rungs, doubling

`04 · 08 · 16 · 32`. A *ratio* ladder, so adjacent rungs are the same relative step wherever
they sit — which means one question at a call site (*how many steps up*) instead of two
(*which grey, and does it still work on that floor*). Measured on `--wash`, the rungs land at
ΔL\* 3.4 / 6.8 / 13.7 / 27.9: every rung is separable from its neighbour, and the faintest is
still over the visibility bar.

Rejected: a five- or six-rung linear scale. `framework.css` already carries the census
argument against a ladder nobody asked for (`.zoom-*`), and 4/8/16/32 covers every existing
hand-written value on the site — imagine.css's 6/10/12/22 and framework.css's 3.5/8/15 all
round to a rung.

## Why literal `rgba()` rather than `color-mix()`

Two reasons. The interpolation-space question **disappears**: source-over compositing is
defined in sRGB and is arithmetic, not a mix, so there is no `in srgb` / `in oklab` decision
to get wrong. And the ladder becomes theme-independent — deriving it from `--ink` would make
every rung drift the day a theme retunes its ink, and `--ink` is not black (`#3f3f3f` on
lew42), so the rungs would not be the fractions their names claim.

Where a rung genuinely must come from a theme colour, `in srgb`: mixing toward `transparent`
in `oklab` travels through premultiplied oklab and the hue drifts on the way.

## Why `color-scheme: dark` is the always-dark primitive

`light-dark()` resolves against `color-scheme` at the element it is **used** on, not where
the custom property was declared. So one line on a dark island flips every rung inside it —
and `--ink` and `--line` with them. The alternative was a third ladder at every call site
(`--paper-aNN` typed by hand on dark surfaces), which is the "which grey" question coming
back in a different hat. Verified live: the same `--fill-a08` reads `rgba(0,0,0,0.08)` in the
light half of the matrix and `rgba(255,255,255,0.08)` in the dark half, on one page.

## Why the metric is `max(fill, border, inset ring)`

A button whose fill matches the card but whose hairline does not is **faint**, not invisible.
Scoring the fill alone flags every default button on the site and teaches nothing. The
framework already knows this — `framework.css` bolted an inset ring onto inline `code`
precisely because its `--wash` fill vanishes on a `--wash` floor.

The corollary bit us in the other direction: lew42 sets `border: none` on every `button` at
(0,1,1), beating framework.css's `border: 1px solid var(--line)` at (0,1,0). So on this
theme a default button on a card has no fill delta **and** no hairline.

## Why the two halves of a cell sit together

The brief asked for the same grid rendered twice, opaque beside alpha. In-cell pairing is
the same argument with less eye travel: identical floor, identical lighting, and half the
width — which is what lets the matrix side-scroll at 400 instead of being unreadable there.

## What the ladder does not fix

- `button.prim` on a `--prim` band stays ΔL\* 0.0. An accent is a hue, not a rung. It can
  only be invisible on one floor — its own — and the answer there is a rung with white ink.
- A card at `--fill-a04` on `--prim` measures 2.1. Alpha **compresses on a saturated floor**:
  `#FF8F60`'s red channel is already 255, so a white rung moves only green and blue. On an
  accent, start one rung higher.

## Open

- The hunt ran **light mode only**. A dark pass is a re-run with one flag; nobody has looked.
- Whether `--fill-a32` is the right rung for `button.bg`'s replacement is a taste call, not a
  measurement — it clears the bar at 23.7 on `--bg` but its white-ink twin was 8.9:1 and the
  ink version is 3.0:1, which is over the non-text bar and under the text one.
