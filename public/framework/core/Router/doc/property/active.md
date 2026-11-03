The leaf `Page` of the chain currently on screen. `undefined` until the first
navigation completes.

## Usage

Written once, read four times, never by anything outside this class:

- `Router.js:90` — `activate()`, the only write.
- `Router.js:102` — `chain()`.
- `Router.js:122` — `mark()`, to tell the leaf from its ancestors.
- `Router.js:129` — `mark_links()`, as the default for `here`.

## Necessity

Essential: with [`marked`](/framework/core/Router/api/marked/) it is all the state
this class holds, and the only half a reader needs. Everything else is derived from
it or from the DOM.

**It holds the page, not the url**, and that is load-bearing. `mark_links()` reads
`active.url` rather than `location.pathname` because `go()` pushes history only
after the load succeeds — mid-navigation the address bar still shows where you
came from.

## Simplicity

Right-sized. The one thing worth knowing is that it is **not the same as
`location.pathname`** and never should be made to be.

A site reading it is reaching past the API — `app.navigated?.(page, from)` hands
the page over at the one moment it changes, which is the supported answer.
