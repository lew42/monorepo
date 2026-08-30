The class. Everything the framework calls "a page" is one `Page` instance: a url
derived in `naming()`, a tree of children resolved in `declare()`/`child()`, and a
single memoised `view` built by `render()`. No subclass tier — an arrangement is a
stylesheet reading `.active-page` / `.active-ancestor`, not a `Pager` type.

## The constructor is four calls, in order

`assign()` (copy in whatever was passed), `naming()` (derive `url`/`name`/`title`),
`declare()` (turn `children` into a `Map`), `initialize?.()`. Order matters twice:
`initialize()` runs *before* a url is guaranteed (a standalone page has none until
adoption), and `declare()` must run before anything reads `this.children` as a Map.

**Nothing is fetched here.** A module page constructs itself at import, so a
constructor that loaded its subtree would hand the budget to nobody — the whole site
came down from whatever url you opened. `Page.load()`, `child()` and
`load_all_children()` spend a `depth` instead (`../declaring.md`).

## `add()` is the one adoption point

Every child — declared, routed, or built by hand — passes through `add()`, which is
the only place `parent`, `name` and `app` get assigned and the only place a page's
url can be *overwritten* (`move()`, for a standalone page whose title-derived url
must yield to its new parent's).

## `child()` is the whole router

Memory, then `route()`, then a filesystem probe — three states in one `Map` entry
(`Page`, `null`, `undefined`) and one method's worth of policy. Everything else in
`core/Router/` is a consequence of walking this one segment at a time.

## `container()` is the one piece of black magic

A region my parent set aside, else the nearest ancestor's `$pages`, else the app's.
Neither side names the other — `regions` is filled by `ext/tabs`, read only here —
so `mounts_in()` exists purely to make the choice observable in the console.

## Improvements

1. **`files:` and every `doc/file/*.md` were entirely missing until this pass.**
   Every other list (`methods`, `properties`, `notes`, `overview`, `children`) was
   current and cross-checked; only the Files tab was never wired up. *(simple,
   important — done in this pass.)*
2. **`mounts_in()` is a public method whose only job is a `console.log`.** Named in
   `readme.md`'s Proposed section already: keep it while `container()` stays the
   one undebuggable step, revisit if the logging ever goes. *(simple, useful.)*
3. **Two `parent` properties, one dot apart** — `Page.parent` (tree) and
   `View.parent` (DOM, unread). Recorded in `readme.md`; the fix lives in
   `core/View`, not here. *(medium, useful.)*
