# Shells — ten app layouts, each at its own url

What the chrome around a page can be: rails, bars, a canvas, and chrome inside chrome. Every
shell hides the site's own strip and brings its own, so what you see is the whole app.

## Use

```js /imagine/shells/left/page.js
import { Shell } from "../Shell.js";

export default new Shell({
    meta: import.meta,
    title: "Left rail",
    left(){ return this.rail("left"); },       // head() left() right() foot() — declare what you have
    finding: "the one line this shell is for",
});
```

Open [/imagine/shells/](/imagine/shells/) and click a card. Once you are inside, the chrome
itself is the nav — every shell links to every other one, at real urls, cold-loadable.

## The findings

- **The six outer permutations are ONE grid.** A 3×3 of named areas (`head` / `left main
  right` / `foot`); a part you don't declare costs an `auto` track of **0px**. There is no
  per-shell rule in `Shell.css` at all.
- **A stage needs no arithmetic.** Chrome as `auto` tracks, the surface as `minmax(0, 1fr)`
  in both directions, and it is the region minus the chrome by construction — measured at
  1920: 1920−208−208 = **1504** wide, 1080−52−40 = **988** tall, and the canvas prints its
  own readout in the corner.
- **Inner chrome is a RULE; outer chrome is a FILL.** Same paper, a hairline, one type step
  down — and it navigates *inside* the area. Chrome that moves you between screens is the
  outer chrome wearing a disguise. [`doc/decisions.md`](/imagine/shells/doc/decisions.md)
- **A footer and a full-height columns row can share a shell**, but only as the app's floor:
  spanning under the rail, with the content region clipped so the row has a definite height.
  A bar *inside* the content area under the row draws a second hairline 1px below the row's
  own — the family `columns and tabs — do not` belongs to.

## Watch out

- A shell is **not a column**. `/imagine/` is a columns host and `column_host()` returns the
  *shallowest* columnar ancestor, so a nested host can never win — a shell escapes by
  overriding `container()` and `render()`, and `demo.app()` is the only way to put a real
  row inside one. `Shell.js` says it at the seam.
- `.pages` reserves a scrollbar gutter forever; a shell needs the region not to scroll, so
  `Shell.css` opens with one `:has()` rule keyed on its own class — the `hides-nav` idiom.
- An index in a columns row lists its children **twice** (cards, then core's row list); the
  word is `index: true` (core, 2026-08-29 — this page was the third site to need it and now
  uses it; [doc/columns.md](/framework/core/Page/doc/columns/)).

## More

- [`doc/decisions.md`](/imagine/shells/doc/decisions.md) — every measurement, what was
  rejected, and the two questions left for the owner
- Files: `Shell.js` (the class and the two seams), `Shell.css` (the one grid, the three
  tones), one `page.js` per shell
- Related: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md) ·
  [`core/Page/doc/panels.md`](/framework/core/Page/doc/panels.md) ·
  [`core/Sidebar/readme.md`](/framework/core/Sidebar/readme.md)
