# page-columns-asks: layout-columns-spacing, checked against code (2026-10-12)

Every open point was already built; nothing needed building tonight, so each is ticked with proof.

- ✅ **N even columns, auto-computed**: `columns({ even: true, fit })`, `core/Page/Page.class.js:1551` (opt-in), `:1736` (`even_columns`: N = floor or round of row / recommended). Numbers in `core/Page/doc/columns.md` (N = 1/2/3 at 1280/1920/3440). The Finder runs it.
- ✅ **Sometimes fill**: the `fill` width word (a leaf claims the leftover, yields to an open child) and `fit: "round"`, same doc.
- ✅ **No padding gaps**: `node Server/padding-check.mjs` clean at 400, 1200, 1920, 3440 on `/framework/core/Page/overview/columns/finder/` and `.../uses/workbench/`.
- ✅ **Layout at four widths**: `layout-check --bands` on finder, workbench and docs: layout `columns`, no overflow, no console errors; sheets in `check2/`.
- ✅ **Mobile tabs**: `ext/tabs/tabs.css:288`, `@media (max-width: 64em)` flips the vertical rail to a horizontal tab row. Columns use the `< 32em` one-column-at-a-time regime (400 measured).
- ⬜ **Owner's call, not built**: switch `/imagine/` to even columns. Smallest next step: set `--page-column-recommended` to ~32em on it first (columns.md, "What floor costs").
- The 2026-10-09 "3440" prompt is the framework readme's tagline ("every layout works from mobile to 3440"), not a new ask.

No code changed, so no worktree or merge; the only edit is the cluster entry in `core/Page/doc/asks.md`.
