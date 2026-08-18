# Masonry — decisions and record
*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Two ragged walls with no gaps at the bottom of the columns, and **the only difference
that matters is reading order**. Both read `--column` and `--gap`, so a `grid auto gap`
wall converts to either by swapping one word. The pair exists to make the trade
visible, because it is the whole decision:

| | reading order | cost |
|---|---|---|
| `masonry` | **down each column** — item 2 sits *below* item 1 | three declarations, no JS |
| `packed` | **left to right**, DOM order kept | one `ResizeObserver` and a measuring pass |

Pick `masonry` unless the sequence means something. A gallery of screenshots nobody
reads in order is the first; anything ranked, dated or alphabetical is the second —
column-major order also **reshuffles every time the column count changes**, so the same
list reads differently on a phone and a monitor.

## The words are in `framework.css`, the behaviour is here

Masonry needed CSS no utility had. Rather than the first stylesheet in a layout
directory — which `../readme.md` forbids, and the tier's whole claim rests on — the two
words joined the vocabulary in `framework.css` beside `.grid.auto`. What lives here is
`masonry.js`: `pack($wall)`, the measuring pass `.packed` needs. That is behaviour, not
a look, and it sat beside its one caller because `util/`'s own bar for promotion is
*two callers that must agree*.

**That bar is now met** (2026-08-16): `framework/ui/page.js` packs its nineteen
component cards and imports `pack` across the tree. Two callers, and they must agree —
so `pack()` is due a move to `util/`, which is the owner's call, not this file's.

## Why not `grid-template-rows: masonry`

Because it is still flagged everywhere. Neither word blocks it: when it ships,
`.masonry` grows an `@supports` block and `.packed` is deleted outright — the JS exists
only to buy reading order, which native masonry gives away.

## How `packed` works, and the one declaration holding it up

A grid whose rows are 4px tall. Each item is measured and given
`grid-row-end: span ceil((height + gap) / 4)`, so a 57px note claims 19 rows and the
slack under it is the gap. The row gap is `0` because the span already carries it,
which is why `pack()` reads **`columnGap`** for the vertical spacing — the only resolved
pixel value the wall has.

**`align-self: start` is load-bearing, not tidiness.** It keeps an item's height
independent of the span it was handed, so re-measuring can never feed back on itself.
Take it off and the item stretches to its rows, the next measurement reads the stretched
height, and the wall oscillates.

For the same reason the observer watches the **items and never the wall**: a width
change reaches the items as a height change anyway, and observing the wall feeds its own
span writes back in as a resize.

**Unwired, `.packed` degrades to a plain grid**, not to 4px of clipped nothing —
`.packed > *` ships `grid-row-end: span 40`, so a wall nobody called `pack()` on is
merely roomy. That is deliberate: a class that silently does nothing is the inert marker
CLAUDE.md's RULE#8 forbids.

## Traps

- **`offsetHeight`, never `getBoundingClientRect()`.** A rect is viewport space and
  every card and stage on this site zooms; the computed `grid-auto-rows` beside it is
  author space. Measured at `zoom: 1.8`: `offsetHeight: 57` against `rect.height:
  102.59`, with computed lengths coming back **unzoomed**. Mixing the two left a
  note-sized hole under every note in the twin's 400px pane. `ext/demo/two.js`'s
  `level()` records the same fact for the same reason.
- **`pack()` runs synchronously, inside the captor.** It reads `el.children`, so a call
  after an `await` hands it a box the captor has since drifted away from — empty, and
  nothing throws.
- **Detached at the first frame is not dead.** A page builds its wall and the *router*
  appends it, so the first `requestAnimationFrame` can land in between. `measure()` used
  to read that as "the wall is gone" and disconnect itself for good: `/framework/ui/`'s
  nineteen cards sat on the `span 40` fallback, looking like a merely roomy grid, with
  nothing in the console. It now waits until it has been connected **once** before
  treating detachment as the end — the observer refires the moment the items get a box.
- **A hidden tab never packs, and that is correct.** `rAF` does not run in a background
  tab, so a wall built there stays on the fallback until the tab is looked at — which is
  also when the frame fires. Measuring one over the `site` MCP `eval` reads `0/19` spans
  and means nothing; take a headless `shot` instead.
- **A wrapping row hands slack to its LINES.** Both pages declare
  `alignContent: "start"`; without it a band taller than its content pushed the wall
  ~390px down its own line at 400.

## The content is `web.js`'s, like every layout here

`site.notes(24)` is the one **ragged** part of the shared content object, and the only
reason it exists: every other part is uniform by design, and a masonry wall of uniform
children is a grid with extra steps. The lengths are a **fixed cycle, never random** —
a twin card renders the wall twice, and a wall that reshuffles per render cannot be
compared between two widths.

## Open

- **`--column: 15em` gives ~13 columns at 3440**, where a note is a few words wide. A
  masonry wall genuinely wants many columns, so this is not obviously wrong — but nobody
  has decided what the right count is at the top end, and `packed` and `masonry` should
  answer it the same way.
- **`pack()` never re-observes.** Items added after the call are unmeasured. No caller
  adds any, and a `MutationObserver` for a case nobody has is API surface for free.
