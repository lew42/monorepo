# `App.js`

Boot and `$pages`, nothing else — the Router now owns url resolution
completely, so this file dropped `resolve()`, `mark()` and `mark_links()`
entirely; they moved to `Router.js`. `load()` awaits `Page.load("/")` for the
root, then constructs the Router and hands it the first `location.pathname`.

## `styles_loaded()` uses `allSettled`, not `all`

`loaders` only ever grows (`tabs()` pushes a `.then()` with no `.catch()`), so
awaiting it with `Promise.all` per navigation means one rejected loader kills
**every** later navigation — measured, and silent, because `click()` never
awaits `go()`. `allSettled` costs a 404 stylesheet one console warning instead
of the whole router.

## The try covers the first navigation, not just the import

`activate()` renders every page in the chain and runs every `content()` there
is; a throw in any of them would otherwise skip `inject()` and paint nothing.

## Improvements

1. **None ranked.** This is the file that shipped to `core/App/App.js` — any
   real fix belongs there, not here.
