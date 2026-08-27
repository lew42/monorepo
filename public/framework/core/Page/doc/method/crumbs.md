The trail to me, one link per page, with a chevron between — **derived** from
`chain()`, so it cannot be wrong. `from` is where the trail starts; the site root by
default.

```js
content(){ this.crumbs(); }              // root → … → me
this.$crumbs.empty(() => page.crumbs(this));   // a columns host: the trail inside itself
```

**Usage** — two callers in `framework/`: `reveal_column()`
(`core/Page/Page.class.js:307`) redraws the columns host's strip after every
activation, and the [crumbs demo](/framework/core/Page/overview/crumbs/) draws one on
every page of a four-deep tree. `ext/demo`'s stand-in app builds its own
(`ext/demo/app.js:104`) — a box that plays app owns its own chrome.

**Necessity** — yes, and `ui/crumbs/` says why in one line: *a loop over `[text, url]`
pairs you type by hand can be wrong, which is the one thing a breadcrumb may not be.*
Typed pairs stay right for a trail that is **not** the page tree; when the trail *is*
the tree, this is the only version that cannot disagree with where you are.

**Simplicity** — five lines, no state. `from` is the one parameter, and it exists
because a columns host's trail starts at the host, not at the site root.

⚠ **Going up the chain activates nothing.** `Router.activate()` only touches what
changed, so a strip refreshed only from `activate()` keeps the departed leaf forever —
`deactivate()` has to refresh it too. That is exactly what
[`doc/columns.md`](/framework/core/Page/doc/columns/) records, and it is the trap any
other live consumer of this method will hit.
