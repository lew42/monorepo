# `App.js`

Boot, and the root page's container — 61 lines, the smallest of the three
tiers' `App.js` because the Router now owns everything url-shaped. `render()`
still owns `$pages` and sets the captor there before any page can build a view.
`start()` wraps its whole boot in one `console.group`, since every step inside
it (`render`, `load_root`, `new Router`, the first `router.load`) is
synchronous or awaited in sequence — nothing interleaves.

## `App` and `Page` are interchangeable containers

Both implement `log_label()` the same way and both own a `$pages` a child
mounts into — that symmetry is why the root page needs no special case: `App`
is just the container above it.

## Improvements

1. **None ranked.** Superseded by `new/1/App.js`, which is what shipped.
