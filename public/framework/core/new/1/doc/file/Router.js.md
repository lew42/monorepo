# `Router.js`

**Line-for-line the file that shipped to `core/Router/Router.js`.** Walks a
url through `page.child(name)` one segment at a time (the import point for a
lazy child), diffs the outgoing and incoming chains, and calls `deactivate()`
deepest-first then `activate()` shallowest-first on only the pages that
differ.

## "No awaits past this point"

`activate(page)`'s diff-and-swap is fully synchronous once the chain is
resolved — the comment marking that boundary was written for a console group,
but it's also exactly the precondition `document.startViewTransition()`
requires, which is why a site can wrap the whole swap with zero framework
support for motion. `Router.load()` awaits `app.styles_loaded()` **before**
calling `activate()`, specifically to keep that guarantee intact.

## `app.navigated?.(page, from)`

Duck-typed, costs nothing until a site defines it. Requested independently by
two council seats (chrome wanted it on `Router`, the site reacting; patterns
wanted `Page.entered()`, the page reacting) — only the `App` one was built;
the `Page` one is recorded as a separate, deliberately unbuilt request, because
a11y's objection (a page is `display:none` until `mark()` runs) is correct on
the mechanism.

## `mark()` writes exactly two classes, no `order`

Pages are appended root-to-leaf and never moved, so DOM order is already chain
order — the `order` style `new/0` needed is gone because nothing here
re-appends an already-mounted page.

## Improvements

1. **None ranked.** This is the live file's ancestor; see `core/Router/`'s own
   doc for anything actionable.
