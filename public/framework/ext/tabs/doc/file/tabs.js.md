The whole module: one function, `Page.prototype.tabs`, plus its private `reveal()`
helper. 67 lines including the stylesheet import — the CSS is roughly twice this
file, which is unusual for the framework and is the reason `readme.md` opens with a
design record rather than a method list.

## Synchronous build, async fill

`$tabs` is captured **synchronously** — while the caller's captor is still ours —
and only the bar's links and the default panel are filled inside a `.then()`. This
is the canonical shape the framework's own capturing trap demands: a factory call
after an `await` lands on whatever the captor has since become, so everything that
must nest inside `$tabs` happens in a callback, not after a bare `await`.

## `regions` and `default_tab` are written here, owned elsewhere

Both live as plain properties on `Page`, not on this module — `tabs()` is only ever
one of their writers, and `Page.container()` is the only reader. That split is why
this file can be deleted without `Page` losing any concept, only the one component
that currently writes to it.

## Everything defensive is optional chaining, not a branch

`this.app?.router?.mark_links()`, `this.app?.loaders?.push(...)`,
`this.loading ?? this.child(...)` — every place this method touches `app` degrades
silently for a stand-in app (`ext/demo`'s `DemoApp`) that has no Router or
first-paint queue. There is no `if (this.app)` anywhere; the `?.` chain **is** the
branch.

## Improvements

1. **`reveal()` has no guard against `$bar.el` being mid-transition.** A rail whose
   height is still animating when `this.app.ready` resolves could measure a
   rect that's about to change. Untested — no page currently animates a tab bar's
   entrance. *(medium, speculative — nothing has hit this yet.)*
2. **`label()`'s fallback (`i === 0`) assumes the first tab is always safe to guess
   before `this.loading` resolves.** True today because every caller's first child
   is either declared or resolves fast, but nothing enforces it. *(simple, useful.)*
