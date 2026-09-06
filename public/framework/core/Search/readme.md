# Search — the site's corpus and the ranking over it, plus the one search box that fronts it

`Search` has no DOM at all, the same as [`Item`](/framework/core/Item/) and `List`: it is the
list of every page the Router can reach, and the rules for putting them in order.
`Omnibox.js` is the picture of it — a slim field pinned to the bottom of the window that grows
upward into a wall of cards.

## Use

The box lives on **its own page** now, not the whole site — [`/framework/core/Search/`](/framework/core/Search/) mounts it in `activated()` and tears it down in `deactivated()` (2026-09-06: a site-wide box was repainting other pages). Press `/` (when you are not already typing) or `Ctrl`/`Cmd` `K` while standing on that page. `Esc` closes it.
The corpus by itself, headless:

```js
const search = new Search();
await search.build();          // ~1s: every page the Router can reach
search.rank("columns");        // best first
```

## Watch out

- **The corpus is built by `Page.load()`, one url at a time** — the Router's own call, so a
  result cannot promise a page that then fails to open. Which urls to try comes from
  `/directory.json`; two kinds of page are deliberately left out:
  [`doc/corpus.md`](/framework/core/Search/doc/corpus/).
- **Nothing is read until somebody searches.** The build is ~540 dynamic imports and it starts
  on the first open, not on a page load — so a reader who never searches pays nothing.
- **A page's `tags:` prop is what the filter chips read**, and no page declares one yet, so
  four of the five chip groups do not draw. That is the design, not a gap:
  [`doc/filters.md`](/framework/core/Search/doc/filters/).
- **Do not name a `View` subclass `Omnibox`** — `classify()` mints `.omnibox` from the class
  name, and that class is `position: fixed`, bottom-centre.
- **Importing a page module changes THIS document** — `View.stylesheet()` runs at module
  scope, and a module can touch `<body>` outright. Four personal sandboxes repainted the whole
  site the first time anybody searched; they are skipped by url, and `Search.check()` warns by
  name if a fifth appears. [`doc/corpus.md`](/framework/core/Search/doc/corpus/) has the table.
- Five url prefixes are skipped, each with its reason in `Search.prototype.skip` — `core/new/1/`
  (prior art, "read never import", one page throws on purpose) and the four sandboxes above.

## More

- [/framework/core/Search/](/framework/core/Search/) — the page: press `/` on it
- [`doc/decisions.md`](/framework/core/Search/doc/decisions/) — what graduated from `ext/Omnibox`, what was
  dropped, and the calls this made instead
- [`doc/corpus.md`](/framework/core/Search/doc/corpus/) — how the list of urls is built, and what it misses
- [`doc/filters.md`](/framework/core/Search/doc/filters/) — the facet model, and why the tag groups are empty today
- Files: `Search.js` (the corpus, the ranking, `Search.Filters`), `Omnibox.js` (the box and its
  one `omnibox(app)` installer), `Search.css` (`omnibox-`), `tags.js` (tag → axis, the only
  thing core knows about the [vocabulary](/imagine/design/vocabulary/))
