The `Doc` for this tier: a live ranges table, a bar per band showing `ok`
against `ideal`, and this very page rated against itself the moment it
settles — the demo that makes "a rating, not a rule" concrete instead of
asserted.

## The live table is built off the imported `RANGES`

`ranges_table()` iterates `RANGES` from `ranges.js` directly — never a
hand-typed copy — so the table and `band()`'s bar chart cannot drift the day a
band's `ideal`, `ok` or `weight` is retuned there. Nothing crawls the two into
agreement; importing the same array is what keeps them from needing to.

## `settle()` waits on a timer, not a mount hook

`content()` returns before the page is attached to the DOM — capturing is
synchronous — so `.page.active-page` may not exist, or be marked, yet.
`settle()` uses a plain `setTimeout`, not `requestAnimationFrame`: a
backgrounded tab never fires one, and the reading would sit at "Rating…"
forever. `DesignTool/page.js`'s own self-rating waits on the same kind of
plain timer, for the same reason.

## Improvements

1. **The 600ms settle delay is a guessed constant that exists twice** — here,
   and independently in `DesignTool/page.js`'s own self-rating — with nothing
   forcing the two to agree if either is ever retuned. A shared constant would
   make them fail together instead of drifting apart. *(simple, speculative.)*
