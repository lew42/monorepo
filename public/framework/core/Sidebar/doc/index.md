# The search index

`Sidebar.index()` walks the page tree once and caches `{ text, href, trail }` per page; a query filters it and `ranked()` sorts it.

## Size (2026-10-12, headless, `node Server/sidebar-index-check.mjs`)

| | pages | bytes | first walk |
|---|---|---|---|
| before | 1715 | 169 KB | about 0.9 s |
| after | 2019 | 196 KB | about 3.4 s (cold dev server) |

## Why `/framework/ui/card/` was missing

`ux/Tree` draws a `leaf: true` page as a flat link and gives it no children, and `index()` walked only the tree's nodes. So every child of `ui/`, `audit/`, `sandbox/` and the other leaf pages was unreachable (304 pages). `index()` now also opens the declared children of a leaf page. Three guards: a leaf with data-fed children (`child_source`) is not expanded, a url is indexed once, and a url containing `//` is dropped (one page resolved a child back up the tree and the walk looped, with the url growing forever).

## Ranking

Exact title, then title starts with the query, then contains it, then trail-only matches; ties go to the shallowest url. "card" now opens with `/framework/ui/card/` and `/framework/ux/Card/`.

## Check

`node Server/sidebar-index-check.mjs [base-url]` prints the size and lists every declared child of a leaf page that is missing from the index (exit 1 if any). Before: 10+ missing under `ui/`, `audit/`, `sandbox/`; after: none.
