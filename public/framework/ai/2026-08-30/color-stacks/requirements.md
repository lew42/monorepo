# color-stacks — the colour-stacking lab + the transparent-scale proposal

## The ask, verbatim

> I want to explore color variations of all our UI. we have buttons, and tags, and cards,
> and the color permutations of stacking certain colors on certain colors (text color, pill
> color, card bg color, bg behind card color...). I don't think we've properly documented
> this. I want to lean into transparent black and white colors, so that they stack properly.
> there are many instances of buttons and pills on the site that have the same bg color, and
> you can't even see them.

## Deliverables

1. **The stack matrix, live** — every fill on every surface, light + dark, each cell
   annotated with contrast computed *in the page* from the composited colours.
2. **The transparent scale** — an alpha ladder as tokens, proved in the matrix by rendering
   the shipping component beside its alpha twin on the same floor.
3. **The invisible-pairs hunt** — a headless scan of ~60 pages → `hunt.json`; the count in
   the report must equal the count in the file.
4. **The adoption note** — `styles/doc/stacking.md`: the rules in ≤10 lines, the migration
   cost, the top-10 fix list. **No site-wide token flip in this task.**

## Fence

`public/framework/styles/stacks/**` (new) · `public/framework/styles/doc/stacking.md` (new)
· the one `children:` line in `styles/page.js` · `css-scopes.txt` for the prefix · this task
dir. **Not** `lew42.css`, **not** any component css.

Later additions, both documentation and both in scope by the `documentation` skill:
`styles/readme.md` (two lines) and `styles/doc/decisions.md` (one record).

## Where things landed

- Lab: `/framework/styles/stacks/` — `page.js`, `stacks.css` (the proposed tokens),
  `stacks.js` (the colour maths), `readme.md`, `doc/decisions.md`, `hunt.json`
- Doc: `/framework/styles/doc/stacking.md`
- Scanner: `hunt.mjs`, here. Needs a dev server; it imports its maths from the page's
  `stacks.js`, so the scan's number and the matrix's number cannot drift.
- Shots: `matrix-1920.png`, `matrix-400.png`, `matrix-1920-appdark.png`, `hero-1920.png`,
  `hunt-1920.png`, `ladder-1920.png`

## Traps that cost time

- Playwright `fullPage: true` is blind on this site — `.pages` is the scroller, not the
  document, so a "full page" shot is a viewport crop. Shoot the element.
- `[class*=tag]` matches `.demo-stage` — s-**tag**-e. Three of the first calibration's worst
  twenty were region floors wearing no chip at all. The badge half of the selector is a
  class-**token** regex.
- `append_fn` appends a callback's return value, so `() => chip(…)` appends the chip twice
  and moves it past its own annotation. Every builder ends in a statement.
