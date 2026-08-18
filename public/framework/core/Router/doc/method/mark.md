Unmark what I marked, then mark the new chain. Two classes, and that is the
**entire** appearance API of this tier.

```
.active-page       the leaf
.active-ancestor   everything above it
```

## Usage

`Router.js:91` — `activate()`, the only caller. It calls
[`mark_links`](/framework/core/Router/api/mark_links/) in turn, which is the half that
other code does re-run.

## Necessity

Essential, and it is why there is no layout tier. Every arrangement on this site is
these two classes plus one a page opted into by name (`standard`, `full`,
`fill`) — the Router knows none of those names, which is why that list can be
rewritten, and has been.

**A page that left needs nothing undone, only its classes gone** — two `classList`
calls, not a lifecycle call. That is why there is no teardown protocol to get wrong.

## Simplicity

Right-sized. `this.marked` — the views wearing my two classes — is the whole wipe,
so it is O(chain) rather than O(diff) or O(every node in the app), and it cannot
reach a page the Router never marked. ⚠ Never widen it back to a `$app` query.
[marking](/framework/core/Router/doc/marking/) has the numbers, and the `order`
attribute this used to write and no longer does.
