A right aside of links to other pages: **one row per url, its icon and title read live.**

```js
related: "/layouts/practice/ /layouts/shell/ /layouts/tag/"
```

One string, urls separated by whitespace — the same shape `children:` takes as a
string. Nothing is fetched at import: `related_aside()` (`Page.class.js`) resolves
each url the first time the page actually renders, never before.

**Usage** — the two first consumers: `/framework/ux/Tree/` and `/layouts/browse/`,
each with one `related:` line in its `page.js`. Read by `render()`, `render_column()`
and `activate()` (Page.class.js) — three call sites because a page's own shape
decides where the aside can go; see "Three shapes, one aside" below.

**Necessity** — the owner asked for exactly this (2026-09-18): *"related links to
other things, maybe just an icon and the title... we probably want to import that
thing so the title and icon update when we update the other thing."* A hand-typed
title copied from the target page goes stale the first time someone renames it; a
live resolve cannot.

## The resolve: `Page.load()`, not `Page.from()`

The owner's own words named `Page.from(url)` as the loader to use. It was tried
first and does not work here: `Page.from()` reads a **`page.json`** file beside the
url and returns `null` when there is none — which is every ordinary `page.js`-backed
page on the site, both consumers included (`Page.from("/layouts/shell/")` is `null`;
there is no `layouts/shell/page.json`). `Page.from()` is for the OTHER kind of page —
one whose whole shape lives in data (the CMS pattern `imagine/paging/make/made.js`
writes), where a real `page.json` is there to read.

What a `related:` row actually needs already exists, one method up:
**`Page.load(url, 0)`** — the same call `child()` makes on a filesystem probe. It is
a **dynamic** `import(url + "page.js")`, so:

- **No import cycle.** A dynamic import inside a method body is resolved lazily, at
  render time — never a static `import` at the top of `Page.class.js`, which is the
  one thing that really would create a cycle (core importing a page that might import
  core back). This is the same reasoning `Page.load()`'s own comment gives for why
  core can safely call it on a would-be-404.
- **The target's REAL, CURRENT title and icon.** The module runs, its `new Page({
  title: …, icon: … })` (or `new Doc({...})`) executes, and `related_aside()` reads
  `.title` / `.icon` / `.url` straight off the result — so renaming the target's own
  `title:` updates every page that links to it, with nothing to edit on this end. A
  `page.json` snapshot could not do this without someone also updating the snapshot.
- **`0`** for the depth budget: `load_all_children(0)` returns immediately without
  fetching the target's own children — a related row costs one page, not its subtree.

## The alternative: import the target's config

**Resolve `related:` by importing each target's config directly** (a real, static
`import Target from "/a/page.js"` at the top of the linking page, or the config
object literal shared between the two) instead of a dynamic per-render fetch.

**Why it loses today:** it is a real static import, so it is exactly the import
**cycle** risk `Page.load()`'s dynamic form exists to avoid — two pages that relate
to each other (a realistic case: `A` links to `B`, `B` links back to `A`) would
import each other's modules at top level, and whichever module's evaluation starts
second sees the other only half-constructed. It also could not update itself the
way the resolve above does when a target's title changes at a *different* import
specifier (a moved file) — the import would 404 at build/parse time, loudly, rather
than the row quietly dropping.

**When it would win:** the owner's own sentence about `Page.from()` names the actual
case for it — a page that should **break loudly, not silently**, when its target
moves. A related link is a nicety (`related:` never having a row is not a page
being wrong); a citation, a canonical "see also" a reader is expected to be able to
follow, or a cross-reference a build should refuse to ship broken, is not — and for
that, a static import that 404s the whole page at load time is the correct, loud
failure, trading the "keeps working degraded" property this feature deliberately
chose for "cannot ship broken." No caller on the site needs that yet.

## Resolved, and resolved-nowhere: what happens to a bad url

A url that 404s, or whose module throws on import, **drops its row silently** —
`related_aside()` wraps the load in its own `.catch(() => null)`, on top of
`Page.load()`'s own (which still `console.error`s a real syntax error, not a 404).
`related:` must never be the reason a page's console turns red; a missing related
link is a smaller mistake than a loud one.

## Three shapes, one aside

A page's own `render()` decides where the aside can physically go, and core owns
exactly two of the three shapes a page can be:

1. **The ordinary page grid** (`render()`) — the aside is `.page-related`, a
   direct child of `.page`, placed by CSS in a dedicated fourth grid track past
   `wide` above a `70em` breakpoint, and folded into the ordinary `main` column
   below it (`Page.css`, "RELATED"). `/layouts/browse/` is this shape.
2. **A columns host** (`column()`) — there is no page grid under a columns host
   (the layout skill's Q1), so the aside is a short list appended at the end of the
   column's own prose instead of a second pinned region.
3. **A page whose OWN `render()` replaces core's** — `ext/Doc`'s well-and-tabs shell
   is the one on the site today, and `/framework/ux/Tree/` (a `Doc`) is this shape.
   Core cannot reach inside chrome it does not own (outside this task's fence:
   `ext/Doc/**`), so `activate()` — generic, and Doc does not override it — appends
   the aside after whatever that chrome already built. `.page-related`'s own `flex:
   1 0 100%` is for exactly this case: inert under `display: grid` (shape 1), and a
   full-width row instead of a stray narrow block under Doc's `display: flex`
   (`ext/Doc/Doc.css`'s `.page.doc-page`). A `related_drawn` flag is how the three
   call sites agree on which one of them already drew it, so `activate()`'s fallback
   never double-draws shape 1 or 2. `../decisions.md` has the fuller record.
