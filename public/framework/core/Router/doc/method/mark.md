Wipe, then reapply down the new chain. Two classes, and that is the **entire**
appearance API of this tier.

```
.active-page       the leaf
.active-ancestor   everything above it
```

## Usage

`Router.js:103` — `activate()`, the only caller. It calls
[`mark_links`](/framework/core/Router/api/mark_links/) in turn, which is the half that
other code does re-run.

## Necessity

Essential, and it is why there is no layout tier. Every arrangement on this site is
these two classes plus one a page opted into by name (`grid`, `pad`, `full`,
`fill`) — the Router knows none of those names, which is why that list can be
rewritten, and has been.

**A page that left needs nothing undone, only its classes gone** — a query, not a
lifecycle call. That is why there is no teardown protocol to get wrong.

## Simplicity

Right-sized. Wipe-then-reapply is O(marked nodes) rather than O(diff), and at 89µs
over 49 anchors that is not a trade worth revisiting.
[marking](/framework/core/Router/docs/marking/) has the numbers, and the `order`
attribute this used to write and no longer does.
