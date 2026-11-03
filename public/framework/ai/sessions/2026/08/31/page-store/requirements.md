# page.store() — the ask, verbatim

> TASK — build `page.store()` in core, per the approved proposal. First: run `new-task`
> (slug `page-store`, group `pages`). THE SPEC: `/imagine/readme.md`'s "The proposal:
> page.store()" section + `/imagine/store.js` (the proven prototype). The three open
> decisions are DECIDED (mastermind, owner-approved): prefix = the app's name namespace
> (`lew42:`), failure mode = in-memory Map fallback + warn once (the prototype's
> behavior), moved pages = a `store_key` override defaulting to `url`. Storage, not
> state: no watchers, no reactivity (the readme's own verdict — do not add subscriptions).
>
> THE WORK: (1) `Page.prototype.store()` in `core/Page/Page.class.js` returning the
> handle {get(fallback), set(data), patch(part), clear()}, keyed `lew42:` +
> `this.store_key ?? this.url` — the prototype's semantics, core's house style
> (assign-based OOP, every method a seam). (2) Migrate `/imagine/store.js`'s two real
> consumers (team, game — find every `store(` call site under /imagine/) to
> `this.store()`; `store.js` becomes a 3-line re-export shim or is deleted if nothing
> else imports it (grep first). Persisted data must SURVIVE the migration — the key
> format must match what's already in the owner's localStorage (`lew42:/imagine/game/`
> etc.; verify the prototype's exact key shape and keep it byte-identical). (3) Docs:
> `core/Page/doc/method/store.md` (sibling pattern), `methods:` + `store` in
> `core/Page/page.js`, the readme's proposal section updated to "shipped".
>
> FENCE — Page.class.js, core/Page/page.js (methods line), doc/method/store.md,
> doc/decisions.md, /imagine/store.js + its call-site files, /imagine/readme.md (the one
> section).
>
> TRAPS: `opens()`-style name collisions — grep consumer pages for a `store` field
> before landing; localStorage throws whole in private mode — the fallback is the point;
> one backtick inside css(`…`); headless Playwright global.
>
> VERIFY: game persistence round-trip (take the lamp, reload, still carried) with
> PRE-migration data seeded under the old key surviving; team density/sort surviving
> reload; private-mode simulation degrades with one warning and no throw; zero console
> errors, 10-url sweep. Report: the method as shipped (paste it), consumers migrated (N),
> the key-compat proof, cuts.

## Fence

Owned by this task, nothing else:

- `public/framework/core/Page/Page.class.js`
- `public/framework/core/Page/page.js` (the `methods:` line only)
- `public/framework/core/Page/doc/method/store.md` (new)
- `public/framework/core/Page/doc/decisions.md`
- `public/imagine/store.js` (deleted or shimmed) + its call sites
  (`public/imagine/team/page.js`, `public/imagine/game/page.js`)
- `public/imagine/readme.md` (the proposal section only)

Scratch goes in the session scratchpad; the private dev server runs on `PORT=8094` and
is torn down at the end. The `:80` server the owner runs is never touched.
