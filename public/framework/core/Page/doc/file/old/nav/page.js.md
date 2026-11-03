The "which navigation shape" guide — six live arrangements (Previews, a catalog
rail, a Sidebar, breadcrumbs from `chain()`, tabs, and a comparison table) run
inside `demo.app()` boxes over the same nine-page fictional site, so the reader
compares shapes rather than reading six unrelated snippets.

## The comparison table is the page's real payload

Everything above it is "here is one arrangement, working"; the table
(`Previews`/`Catalog`/`Sidebar`/`Tabs`/`Crumbs`/`A link in prose`, each with "shows"
and "reach for it when") is the decision a reader actually came here to make. The
demos earn the table's right-hand column its credibility.

## One sentence carries the whole file's thesis

"No navigation component holds state, so none of them can disagree about where you
are" — every one of the six is a real `<a href>` marked by the Router, never a
component tracking its own "active" flag. That is also why this page can show six
navigation shapes with zero navigation-specific JS of its own.

## Improvements

1. **No `doc/file/nav/page.js.md` existed.** *(simple, important — done in this
   pass.)*
2. **`Sidebar` is demonstrated here but documented in `core/Sidebar/`** — a
   reader who wants Sidebar's own API has to already know to leave this page.
   The one link to `/framework/core/Router/` at the bottom does this for Router;
   Sidebar has no equivalent pointer. *(simple, useful.)*
