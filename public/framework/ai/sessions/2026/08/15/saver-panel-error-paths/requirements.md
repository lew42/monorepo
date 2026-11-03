# Fix Saver.drain() error path + Panel workspace() load-failure ambiguity

Verbatim ask:

> Two related bugs in the lew42 framework. Your files:
> `public/framework/ext/Saver/*.js`, `public/framework/ext/Panel/workspace.js`,
> and those two modules' `doc/**/*.md`. Nothing else.
>
> Bug 1 — `Saver.drain()` has no error path. A rejecting `write()` skips the
> reset of `this.writing`, so every future `save()` on that instance returns
> the same dead promise, forever, silently. `LocalStorageSaver.write()`'s
> `setItem` can already throw on quota with nothing guarding it.
>
> Bug 2 — a failed load looks exactly like an absent one. `FileSaver.load()`
> cannot distinguish "the file isn't there" from "the read failed", so
> `ext/Panel`'s `workspace()` treats a read error as first-run and seeds over
> the user's real saved layout. That is silent data loss.
>
> Fix both. Bug 2 needs a deliberate design call — an absent file and a failed
> read must become distinguishable, and the seeding path must refuse to
> overwrite on the error case. Update every `doc/*.md` and `readme.md` claim
> these change. Verify with `node --check` and a Playwright console-error pass
> against the already-running dev server on port 80.

Source: `public/framework/audit/modules/ext-Saver.md` (Recommendation 1) and
`public/framework/audit/modules/ext-Panel.md` (Recommendation 2).

## Proposal / steps

1. Read `ext/Saver/*.js` and `ext/Panel/workspace.js` in full.
2. Fix Bug 1: `try/finally` in `Saver.drain()`; `try/catch` around
   `LocalStorageSaver.write()`'s `setItem`.
3. Fix Bug 2: `FileSaver.load()` rejects on any non-404 failure instead of
   folding it into `null`; `workspace()` adds a `.catch()` that refuses to
   seed/save and shows an inline error instead.
4. Update `ext/Saver/readme.md` + its `doc/*.md`, and `ext/Panel/readme.md` +
   `doc/decisions.md` + `doc/file/workspace.js.md` to record both as applied.
5. `node --check` each changed file via scratchpad copies.
6. Playwright console-error pass on `/framework/ext/Saver/` and
   `/framework/ext/Panel/` against the running port-80 dev server.
