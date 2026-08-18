# Masonry — a ragged wall with no gaps at the column bottoms, for anyone laying out cards, notes or screenshots: `masonry` reads down each column for free; `packed` keeps DOM order for one `ResizeObserver`.

## Use
```js
div.c("masonry", () => site.notes(24)).style("--column", "15em");         // CSS columns, no JS — the default

import { pack } from "/framework/styles/layouts/masonry/masonry.js";
pack(div.c("packed", () => site.notes(24)).style("--column", "15em"));   // left-to-right order, measured
```
Both read `--column` and `--gap`; a `grid auto gap` wall converts by swapping one word. Pick `masonry` unless the sequence means something — column-major order reshuffles whenever the column count changes.

## Watch out
- `pack()` measures synchronously inside the captor — call it right after the wall is built, never after an `await` — [`doc/decisions.md`](./doc/decisions.md)
- `offsetHeight`, never `getBoundingClientRect()`: a rect is viewport space and every stage zooms — mixing them left a note-sized hole under every note — [`doc/decisions.md`](./doc/decisions.md)
- A hidden tab never packs (no rAF); MCP `eval` reads `0/N` spans and means nothing — take a headless `shot` — [`doc/decisions.md`](./doc/decisions.md)
- A wall the router mounts later is detached at the first frame — `measure()` waits until connected once before treating detachment as the end — [`doc/decisions.md`](./doc/decisions.md)
- `align-self: start` on `.packed > *` is load-bearing: without it re-measuring feeds back and the wall oscillates — [`doc/decisions.md`](./doc/decisions.md)
- A wrapping row hands slack to its LINES: give the row `alignContent: "start"` or the wall drops ~390px at 400 — [`doc/decisions.md`](./doc/decisions.md)
- Unwired, `.packed` degrades to a roomy grid (`span 40`), never to clipped nothing — [`doc/decisions.md`](./doc/decisions.md)
- `pack()` never re-observes; items added after the call stay unmeasured — [`doc/decisions.md`](./doc/decisions.md)

## More
- [Masonry](/framework/styles/layouts/masonry/) · [Packed](/framework/styles/layouts/masonry/packed/)
- [`doc/decisions.md`](./doc/decisions.md) — the record: the reading-order trade, why the words live in `framework.css` and the JS here, why not native `grid-template-rows: masonry`, how `packed` spans 4px rows, the traps in full, the open column-count and `pack()`→`util/` questions
- Files that matter: `masonry.js` (`pack()`, the measuring pass) · `framework.css` `.masonry`/`.packed` (the two words) · `page.js` / `packed/page.js` (the twin demos)
