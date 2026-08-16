Every listed member of **one** subject, as pages. Properties first, then methods —
what a thing *is* before what it *does*.

It takes its subject as an argument rather than reading `this.subject`, which is the
entire reason a module with two classes needs no new config: [`api()`](/framework/ext/doc/api/api/)
calls this once for the declared subject, and an override calls it again for
whatever else the module exports.

## What each kind shows

A **method** shows its real source, held via `member()` — a descriptor, never
`subject.prototype[name]`, because reading an accessor executes it. A **property**
shows only what [`declaration()`](/framework/ext/doc/api/declaration/) can produce
without running anything, which for an instance field is nothing at all; the prose
is then the whole page, and that is the honest answer rather than a gap.

## ⚠ A missing member warns and continues

A name in `methods:` that the subject does not have prints a console warning naming
the App trap (`/app.js`'s default export is the app *instance*, which has no
prototype) and adds no page. It does not throw: one stale name in a list should not
take the module's whole doc page down with it.

## Improvements

1. **The warning fires at construction, not at view.** `page.js` runs on import, so a
   stale name warns whenever the page is *loaded* — good. But nothing collects those
   warnings, so a site-wide "which lists have gone stale" answer still needs a crawl.
   A `Doc.stale` array pushed to here would make it one console read. *(simple, useful)*
2. **`prefix` is not applied to the `call` string**, deliberately — the Overrides line
   reads `new History({ push(){ … } })`, which is correct, while the page is named
   `History.push`. Worth a second look if it ever confuses anyone. *(simple, speculative)*
