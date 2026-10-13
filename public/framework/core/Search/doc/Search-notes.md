# Search Notes

## Class purpose
Search is the data tier for the site's corpus — no DOM, same layer as core/Item and core/List, with Omnibox.js as the only UI. It builds an index of every page the Router can reach (via Page.load), yielding them ranked by query match quality.

## The corpus: pages the Router can reach
Every row was produced by Page.load() — the exact call Page.child() makes during navigation — so the corpus promises URLs the Router can actually open.

The listing comes from `/directory.json` (every directory holding a `page.js`), because the site's root declares no `children:` and nothing else can walk it.

See `/directory.json` for which pages are indexed. Details: `doc/corpus.md`.

## Build behavior and caching
One build per instance: `build(watched)` returns the same promise on every call — the promise itself is the guard. `watched` is called every `batch` pages and once at the end, so the UI can draw partial results as they arrive.

The pool pattern, not `Promise.all()` over the whole list: firing 838 dynamic imports at once starves the navigation the reader may be making while they arrive. Parallel imports set by `workers` (default 12; reads 818 pages in ~1s).

## The corpus check: silent breaks from page modules
Lines 69–118 detect when importing a page module changes the document:
- CSS rules outside the four declared layers (`base`, `theme`, `site`, `util`) will silently outrank every framework rule at any specificity.
- Module scope code touching `<body>` or `<html>` (e.g. `app.$body.ac("theme-name")`) silently re-themes the whole site.

Both are harmless only when every rule sits in one of the four layers declared in `framework.css`. A rule outside all layers sorts AFTER them and beats every framework rule. See CLAUDE.md: "Every CSS rule inside a layer".

Examples (fixed 2026-09-06):
- `/castin/main.css` opened `@layer theme_cm` with no declaration.
- `/arya/` and `/edric/` re-themed the page with one class on `<body>` at module scope.

The `skip` list excludes known offenders; new ones are logged to console.warn.

## The corpus: reachable URLs
The Router resolves URLs one segment at a time (Router.load_segments), so a page dir whose parent has no `page.js` of its own is unreachable — 69 of them on this site, mostly in `core/new/1` (the prior-art sandbox).

The `reachable()` trap: not every directory with a `page.js` is in the corpus. The url must be walkable from root.

## Ranking: six tiers
Six tiers of match quality, best first. The rule: the TITLE answers if it can; only a title that says nothing lets the DESCRIPTION answer.

1. the title IS what you typed
2. the title starts with it
3. a word in the title starts with it
4. the title contains it
5. the description contains it
6. every word you typed is somewhere

A detailed explanation with live examples: `/framework/core/Search/`.

## Ranking: sorting after the tier
After the tier (match quality), three more sorts:
- shortest title (most exactly-about-this page)
- shallowest url (a section beats a page buried inside it)
- a-z

## An empty query: browse instead of search
Empty queries return the whole site sorted by depth then title — the omnibox is a way to browse and not only to search.

## Row structure
One row per page: `{ url, title, description, icon, tags, section, depth }`.

`section` is the first URL segment (every page has one); `tags` is the page's own `tags:` prop (none declared yet). Filters group on section and on each tag axis.

## The Filters class
The facets: groups are names and ways to read row values; chips are values. Nothing is selected by default; nothing selected means everything (filters default to all, with no special case to write).

Within a group, chips are OR (Framework or Imagine); between groups they are AND (Framework AND docs).

See `doc/filters.md`.

## Defaults on the prototype
- `source`: "/directory.json"
- `workers`: 12 (parallel imports; 12 read 818 pages in ~1s)
- `batch`: 40 (pages between progress callbacks)

## The four layers
Base, theme, site, util — declared in `framework.css` and named in `check()`.

## Exclusions: detailed history
Lines 248–273 detail why certain directories are skipped:

**`core/new/1/` (264 page.js files):** The prior-art sandbox ("read, never import"). One page throws at import on purpose. None are pages a reader is looking for.

**Fixed (2026-09-06, search-tidy):** `/castin/main.css`, `/alex/`, `/edric/`, and `/arya/lib/Page.js` are now clean. `/castin/`, `/alex/`, and `/edric/` opened undeclared `@layer`s; `/arya/` touched `<body>` at module scope. All are wrapped in `@layer base` or moved into lifecycle hooks.

**`/arya/` is OUT of skip:** It checks clean — `Search.check()` reports nothing importing all 12 pages, computed styles on `/framework/` unchanged. It adds 12 candidates but 0 rows because `/arya/lib/Page.js` is arya's own hand-rolled `Page` class, never this framework's. `page instanceof Page` is false for all of them. That is a separate, pre-existing fact about arya's pages, not a search bug.

**`/alex/`, `/castin/`, `/edric/` stay IN:** Each runs `app.$body.ac("theme-1")` (the real theme from `/styles.css`) at module scope. Same bug shape as arya's, in files this task didn't cover. Measured 2026-09-06: importing any of these still repaints the site and Search.check() names it. Move each `app.$body.ac("theme-1")` into a lifecycle hook and these three lines go too.

## Query preparation
The query object, prepared once per keystroke rather than once per row: `{ needle, start (a word-boundary regex), words (split by whitespace) }`.
