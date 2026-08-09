A card per child, from the children themselves.

**Usage** — 20 call sites, and it is what an index page *is* on this site:
`framework/core/page.js:21`, `framework/ext/page.js:17`, `framework/page.js:44`,
`framework/styles/page.js:19`, `framework/ui/page.js:46`, `framework/util/page.js:16`,
and the rest of the section indexes.

```js
content(){ this.previews(); }
```

**Necessity** — yes. One declaration (`children`), and every menu on the site
follows it. Removing this would put a hand-typed card list on twenty pages.

**Simplicity** — right-sized *now*. It reads `nav_for(name)` per child, so the
cards, the sidebar and the tab bar structurally cannot name a child three ways —
and because declared children are imported at construction and `Router.load()`
awaits them, the cards draw **once**, with real titles. The redraw machinery this
used to need is gone.

One duplication remains: **this does not call `preview()`.** It builds a richer card
inline (icon + `.page-preview-title` span) while `preview()` emits a bare
`a.page-preview` with the title. Two shapes of one class. See `readme.md` §Proposed.

Note the shape of the callback — `div.c("page-previews", () => …)` captures the
wall synchronously and fills it inside the capture function. This method is the
worked example in `View`'s capturing note for exactly that reason.

