## What this file is

`Sortable extends Draggable`: the ghost-and-placeholder visuals, and
`locate(e)` → `{ list, before }`, a **position** rather than a target — the one
idea that lets reorder, cross-list move, and nest share a single `release()`
override. 83 lines. Full walkthrough: [`doc/sortable.md`](/framework/ext/Draggable/docs/sortable/).

## The comment at the top is load-bearing

"Imports neither Item nor List: the only thing it calls is `item.move()`." That
line is the whole contract between this file and the tree it reorders — nothing
below it should ever need to import either class, and if it does, the coupling
has grown past what the comment claims.

## Two methods most likely to surprise a reader

- **`release()` is a full override, not a call to `super`.** `Draggable.release()`
  finds a single target and calls `drop()`/`restore()`; this one finds a
  *position* via `locate()` and calls `item.move()` directly. `Draggable.drop()`
  is unreachable from a `Sortable` instance.
- **`show(where)` moves the placeholder, never the real node.** The live element
  stays exactly where the DOM put it (hidden via `.drag-source`) for the whole
  gesture — `show()`'s only job is to insert or remove one placeholder
  `<div class="drag-placeholder">`.

## Improvements

1. **`before()` is vertical-only** (`e.clientY` against each child's midpoint).
   A horizontal list silently reorders wrong rather than refusing — worth at
   least a guard or a documented assumption at the top of the method.
   *(medium, important — the readme already tracks this as deferred)*
2. **`row(item)` is a linear scan over `$items.el.children` on every call**, and
   `before()` does its own separate scan — for a very large list these could
   share one pass. Not worth it below "very large," which nothing on this site
   currently is. *(simple, speculative)*
3. **`locate()`'s comment explaining why `Draggable.drop()` is unused** lives on
   `release()`, one method away from the thing it explains. Moving it onto
   `release()` itself (where it partly already is) or duplicating one line onto
   `locate()` would save the "why is this empty" moment. *(simple, useful)*
