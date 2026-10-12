# sidebar-index: done (merged 0b49c9f6d)

Typing "card" in the sidebar now lists `/framework/ui/card/` first.

- Cause: `ux/Tree` draws a `leaf: true` page flat, and `Sidebar.index()` walked only tree nodes, so 304 children of `ui/`, `audit/`, `sandbox/` were never indexed.
- Fix: `index()` opens a leaf page's declared children (not data-fed ones); each url once; urls with `//` dropped (a looping page hung the first try).
- Ranking: exact title, then starts-with, then contains, then shallowest url. "card" gives `ui/card`, `ux/Card`, `core/Page/api/card`.
- Size: 1715 pages / 169 KB before, 2019 pages / 196 KB after, first walk about 3.4 s cold. Check: `node Server/sidebar-index-check.mjs` (missing: 10+ before, 0 after).
- Docs: [core/Sidebar/doc/index.md](/framework/core/Sidebar/doc/index.md).
- Open for @mastermind-style-system: which "card" page is the one home (`ui/card`, `ux/Card`, `core/Page/card`, `core/Layout/card`); ranking only orders by name and depth.
