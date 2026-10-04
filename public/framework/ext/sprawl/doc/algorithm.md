# The balancing algorithm, and the two things that look like it but aren't

`sprawl(sections)` hands back a CSS grid — `repeat(auto-fit, minmax(min(100%, 60rem), 1fr))`,
one column under ~60rem of room, about three at 3440 — and decides which column each block
goes in, so the columns come out roughly the same height instead of "first third of the list,
second third, third third" the way plain source order would.

## The algorithm — small on purpose

The owner's own 2026-10-02 follow-up correction asked for exactly this, no more: walk the
blocks in order, and drop each one into whichever column is **currently shortest so far**.
That's it — no sorting the blocks by size first, no trying every arrangement.

"Shortest so far" tracks each column's **real rendered height in px** (the correction's own
first choice — a cheaper count-of-blocks-placed proxy was explicitly allowed too, "if measuring
real height is awkward"; it wasn't, once the staging box below made measuring as cheap as
counting, so this uses the exact version). Measured by a one-time staging pass (`measure()` in
[`sprawl.js`](../sprawl.js)): every block is mounted, invisibly, at the width ONE column will
actually have, its real `offsetHeight` read back, then moved into whichever real column the
running tally says is shortest. Nothing is rendered twice — a block's own View/el is built once
by its caller; this only moves that same element, first into a hidden box to measure it, then
into its real column.

## Why a whole JS pass, and not just CSS

Two CSS-only ways to balance columns were tried first and rejected — written down here because
both look like the obvious fix until you watch them run:

- **Equal-height grid rows** (`align-items: stretch` and friends) don't solve this at all: they
  make the cards inside one ROW match each other's height, not whole COLUMNS of a different
  number of sections. A grid has no idea "column 1 has 2 sections and column 2 has 5" — that is
  exactly the fact this function computes instead.
- **CSS `columns: <width>`** (the multi-column layout property) DOES auto-balance column
  height, with zero JavaScript — but it re-flows every item into a possibly different column on
  every reflow: an image finishing its own load, or a line wrapping differently a few pixels
  either side of a breakpoint, can visibly jump a block from column 2 to column 1 while someone
  is reading it. That breaks this site's own rule that a layout never jumps under a reader
  ([design/layout's rules](/framework/design/layout/doc/rules.md)). `sprawl()` places each block
  exactly ONCE and leaves it there until a real column-count change (below) — `columns:`
  recomputes the whole thing constantly. [`/framework/design/layout/`](/framework/design/layout/)
  records this same rejection as its own one-line pointer back here.

## When it re-runs

On load, and again only when the number of COLUMNS changes (a `ResizeObserver` on the grid
itself, not a `window.resize` listener — the same "built while still detached from the
document" problem `core/Page/Page.class.js`'s `reveal_column()` solves the same way: the
observer fires the moment the grid gets a size). A debounce (150ms) on every firing after the
first keeps a window drag from re-laying-out every pixel. A resize that does NOT cross a
column-count breakpoint changes nothing — the one check, `n === last_n`, is what makes "never
re-run for anything else" (not a hover, not an unrelated reflow elsewhere on the page) literally
true: nothing else on the page ever calls `place()` at all.

⚠ **A background/unfocused tab's `ResizeObserver` never fires at all** (hidden tabs don't lay
out), which once left the whole grid empty until the tab was focused — fixed 2026-10-02 (review
round 4) by running the placement pass once, synchronously, before the observer is even
attached. `host.el` has no width yet at that point (every `sprawl()` is built detached, same as
any other page-level View), so the first pass falls back to `column_count()`'s own
under-the-breakpoint answer (1) — every section in one column, same as a narrow screen, never
nothing on screen. The real column count then settles on the observer's first real callback.

## Below the breakpoint

`column_count()` returns 1 the moment the grid is narrower than one track, and placing N blocks
into 1 column is just appending them in order — so "one column, everything stacks, no placement
logic" falls out of the same code path rather than needing its own branch.

## The leak that isn't one anymore

Nothing ever disconnected the `ResizeObserver` once its host left the document — review round 4,
2026-10-02. Fixed the same way every other recurring callback in this codebase notices it has
outlived its element (`ext/AITask/dashboard.js`, `ext/files/files.js`, …): the observer's own
callback checks `host.el.isConnected` first and disconnects itself the moment it isn't, rather
than adding a second teardown mechanism nothing else here uses.
