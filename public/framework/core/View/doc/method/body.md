**Usage** — 2 live call sites, both the same line of the same method:
`App.render()` (`framework/core/App/App.js:40`) and this site's `app.js:51`.
Memoised in `View._body`, so the second call is free.

**Necessity** — yes. `<body>` already exists, so it is the one element a View must
adopt rather than create, and something has to be the root of the tree.

**Simplicity** — the memo and the `{ el: document.body, capture: false }` pair are
right. **The `init()` key is dead code**: the constructor calls `initialize()`, not
`init()`, so the `View.set_captor(this)` it promises never runs. Both callers set
the captor explicitly on the next line, which is why nothing ever noticed — and
which is also the argument for deleting the key rather than renaming it. A rename
would make the body the captor and then immediately have it replaced, silently
pushing a stale entry onto `previous_captors`. Proposed in `readme.md`.

