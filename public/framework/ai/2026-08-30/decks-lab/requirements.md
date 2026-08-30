# P5 — presentational decks lab

## The ask (owner, verbatim, 2026-08-30)

> I want to stress the need for presentational layouts (think slide deck designs), that
> utilize the space better. try slicing the 3440 in various ratios, and trying to figure out
> what kind of content (content as navigation) works in each region. for navigation, we want
> to explore persistent navigation (the navigation stays, a different region switches) vs
> switching/swapping: when you click, the whole area swaps.

## Scope

`/imagine/decks/` — a tree of slide-grade presentational layouts, each a real navigable mock
with believable content and a verdict.

1. **The slices** — 3440 cut in deliberate ratios (50/50, golden, 70/30, 25/50/25, 20/60/20,
   2x2), each populated with the content kind that WORKS in that region. A logged failure is
   a result; a slice that fails gets cut, not polished.
2. **Persistent vs swap, head to head** — the same deck content twice: (a) a nav region that
   stays while a stage region switches, (b) the whole screen swapping per click. Same slides,
   same url shape, so the comparison is honest.
3. **One real deck** — 5-7 slides pitching the framework, built from the winning pieces.

## Stands on (read, do not rebuild)

- `/imagine/screens/` — `full` replaces / `fill` joins, golden pairs, the block composition,
  the one tone step, the keydown lesson (`screens/deck/page.js`).
- `/imagine/shells/` — chrome grid findings.
- `core/Page/doc/findings.md` — the seven labs' verdicts.

## Fence

`public/imagine/decks/**` only. The mastermind wires the `/imagine/` `children:` line.
