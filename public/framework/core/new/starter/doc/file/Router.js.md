# `Router.js`

The first Router in this progression: `go()` loads before it pushes history,
so a failed navigation leaves no entry; `load_segments()` walks a url one
segment at a time, awaiting `page.child(name)` on each hop, which is also the
lazy import point. `activate(page)` diffs the outgoing and incoming chains and
touches only what differs — `shared_depth()` is the whole diff.

## Marking is scoped to `$app`, never `document`

On a cold load `$app` isn't appended to `<body>` yet, so a `document` query
would find zero links; `root()` returns `this.app.$app.el` instead, which
works while still detached.

## `mark_links(here)` reads the active page's url, not `location.pathname`

`go()` pushes history only after a successful load, so mid-navigation the
browser still shows the url being left. Reading it would mark every navigation
one step behind — a bug this file's readme records being caught and fixed.

## Improvements

1. **None ranked.** Superseded by `new/1/Router.js`, which is what shipped
   line-for-line to `core/Router/Router.js`.
