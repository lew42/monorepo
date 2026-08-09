**Usage** — 4 live call sites: `append_fn()` (`View.js:106`), `lazy()`
(`View.js:289`), `App.render()` (`framework/core/App/App.js:48`) and the site's
own `app.js:75`. The last two are the same statement — *pages mount into
`$pages`, so the captor has to end up there* — because a page's view is built by
an element factory, and a factory appends to the captor.

**Necessity** — yes, and it is the one piece of global state in the framework.

**Simplicity** — right-sized: push the current captor, take over. Two lines, and a
**stack** rather than a single slot, which is what makes nesting work.

The pairing with `restore_captor()` is manual and unguarded — nothing enforces it,
and an exception thrown between the two leaves the captor pointing at a dead view
for the rest of the page. `append_fn` is the only caller that could reasonably wrap
it in `try`/`finally`; it does not, deliberately, since a throw mid-render is
already a broken page.

