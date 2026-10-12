# Grid guide notes

`public/framework/styles/layouts/grid/page.js` (79 lines). Screenshots: `grid-guide-1280.png`, `grid-guide-400.png`.

## Already does well
- `stack`/`auto`/`three` as three real, clickable, draggable demos — show-don't-tell, not a wall of prose.
- The `auto-fit` vs `auto-fill` section names both and shows the difference, with the exact rule beside it.
- The span demo states a real measured number (94px overflow at 320px) instead of a vague warning.
- One CSS line repeated verbatim at the top and bottom — the reader sees the same rule before and after the explanation.

## Missing steps, in the order a 5-year-old would need them
1. **What is a track** — before `fr`, before anything: a grid is a table with no lines drawn. One picture, one word.
2. **`fr` vs a fixed length** — `1fr` divides the leftover; `200px` doesn't share. The guide jumps straight to `minmax()` without this.
3. **`auto-fit` vs `auto-fill`** exists (good) but arrives *after* the reader has already seen `auto-fit` used three times — move it up front.
4. **`gap`** — never explained on its own; it's inside every class string already, unexamined.
5. **`span`** — present, but only as "don't, it overflows." No "here's when a span is fine" (a hero cell, a fixed count).
6. **Template areas** — absent entirely. Even one `grid-template-areas: "a a" "b c";` picture would double what a beginner can build.
7. **`min-width:0` / `minmax(0,1fr)`** — the guide never says why a long word blows out a track; this repo just spent a whole task finding that exact trap (`ext/Panel`'s leaf/template wrapper).
8. **`dense`** — not mentioned; masonry-adjacent, ties back to `notes`'s ragged-part comment in `spec.js`.
9. **Alignment inside one cell** (`justify-self`/`place-self`) — the page never places content *inside* a track, only the tracks themselves.
10. **A nested grid** — a grid cell that is itself a grid. Zero examples; this task found the panel system can't do it at all (leaf XOR children), so the CSS guide is the one place left to show it works in plain HTML.

## Extend or rebuild?
**Extend in place, now** — it's 79 lines and structurally sound (three real demos, one token). A step-through-inside-a-Panel rebuild is real value *once* a panel can nest actual grid children with real per-track controls — today `ext/Panel`'s `display:grid` is one hardcoded `auto-fit` shape with no width/gap/span/areas exposed (this task's own findings), so a Panel-hosted version would just wrap the same three demos in more chrome for no new teaching power. Revisit the rebuild call after `panel-complexity`'s strategy lands.
