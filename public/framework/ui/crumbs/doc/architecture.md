# Crumbs architecture — the trail is markup, not a function

Crumbs is a breadcrumb trail of real links. It has no JavaScript API: the trail is a template written in [`page.js`](./page.js), and the only code this module owns is one CSS rule in [`crumbs.js`](./crumbs.js). The one alternative the framework does provide is `page.crumbs(from)` on `Page`, which derives the trail from the page tree.

## There is no `ui.crumbs()` function

**Decided:** a trail is written by hand as markup, and `page.js` shows it verbatim.
**Why:** a loop over `[text, url]` pairs typed by hand can be wrong, and a breadcrumb must not be. Writing the five lines out keeps the reader's eye on what the trail actually says.
**Instead:** a `ui.crumbs(pairs)` helper, which would make a wrong trail look right. Rejected.
**Detail:** [the Overview demo](/framework/ui/crumbs/)

## A derived trail comes from `Page`, not from pairs

**Decided:** when the trail must match where the reader is, use `page.crumbs(from)`, which walks `Page.chain()`.
**Why:** a derived trail cannot disagree with the current page. `Columns` calls it to redraw the strip above the row whenever a column opens or closes.
**Instead:** typed pairs, which are right only for a trail that is not the page tree.
**Detail:** [Columns: the trail](/framework/core/Page/doc/columns/) — code: [`Page.class.js`](../../../core/Page/Page.class.js) (`crumbs(from)`)

## Links are real anchors; nothing here compares the URL

**Decided:** every crumb is an `<a href>` with class `page-link`, and the router marks the active one.
**Why:** `Router.mark_links()` already adds `.active` (this exact URL) and `.in-path` (an ancestor) after each navigation. A breadcrumb is `.in-path` all the way down, which is what a breadcrumb means. No view needs `window.location`.
**Instead:** each crumb reads `window.location` itself. Rejected: it duplicates the router and breaks on every new route.
**Detail:** code — [`Router.js`](../../../core/Router/Router.js) (`mark_links`)

## One CSS rule, in the theme layer

**Decided:** the only style is `.ui-crumbs a { text-decoration: none }`, inside `@layer theme`.
**Why:** `framework.css` has no rule for a bare `a`, so a trail's links keep the browser underline. The rule must be a descendant selector, which the markup cannot express on itself.
**Instead:** a class on every link (`.nounderline`). Rejected: every trail would repeat the same class.
**Detail:** [`crumbs.js`](./crumbs.js) — the layer order lives once in `framework.css`.

## Checked against the code

- Every entry above was verified in source: `crumbs.js` (the one rule), `page.js` (the template), `Page.class.js` (`crumbs(from)`), `Router.js` (`mark_links`). No mismatch found.
- `doc/decisions.md` does not exist and the census found no decision lines for this module, so nothing was reversed or dropped.
- Next row with a current item: [Pagination](/framework/ui/pagination/).
