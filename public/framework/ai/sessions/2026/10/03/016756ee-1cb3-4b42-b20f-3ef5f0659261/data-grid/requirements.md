# A data grid, built once: columns, resize, sort, filter, fast with thousands of rows

## The ask (owner, 2026-10-03, ~5:40 pm, on /framework/ai/sessions/)
> Many columns are too narrow. The resize handle between columns is lagging my computer: it tries to follow the mouse, appears only at the right edge of each heading, slow to appear as I move between columns, then frozen. We need to work on the data grid. This doesn't look bad, but I don't want to spend time updating this one on the sessions page when we should turn it into a reusable component and fix it once, the right way, across all instances. We're probably going to need a lot of them, maybe different types.
> UI vs UX: if it's pure HTML and CSS (even if rendered by JavaScript), it's UI: a good starting point; UI things are not classes and should not need JavaScript. If it needs JavaScript, it's UX. An ext can combine several UX and UI pieces into one package, more like a plugin. A data grid may be an ext: resizing, sorting, filtering and what it filters all have to flow properly. And the ability to create new data sets quickly, like this sessions table with all its properties, rendered quickly, with useful filters designed automatically (by AI or programmatically).
> Layout: table, grid, flex, or each row a plain div with a flex inside, column widths from a token: not the top priority; test it. Figure out how to test performance so we can run drag-to-resize and measure it.

## Measured while the owner was on that page
One Chrome renderer at **108% CPU and 1.37 GB** (the sessions tab with ~1,876 rows).

## Do
1. **Find what exists first:** `ui/table` (a function), the sessions tab's grid (`ai/sessions/page.js`), any sort/resize code elsewhere (`ext/Panel` seams, `ext/Draggable`). One grid, not a second (law 6).
2. **`ext/DataGrid/` (class `DataGrid`):** columns declared as data (`{key, label, width, format, sort, filter}`), rows from any array or a jsonl source. Built from a `ui/` markup layer (the plain rows and cells, styled with toolbox classes) plus the behaviours (resize, sort, filter) as UX.
3. **Fast:** only the visible rows are in the DOM (windowing) past a few hundred rows; resize writes one CSS variable per column during the drag (no layout per row). Prove it with a perf script (Server/browser.mjs, CDP tracing): drag a column handle across 300px on 2,000 rows, report frame times and CPU; target 60 fps.
4. **Handles:** a full-height hit area between columns, visible on hover at once (no hover-intent delay).
5. **Auto filters:** from the column types (dates → a range, small sets → chips, numbers → min/max), so a new data set gets useful filters with no extra code.
6. **Adopt it on the sessions tab** as the first instance, then list the other tables on the site that should move to it (don't move them yet).
7. **One line in `ui/readme.md`:** UI = HTML + CSS only, no JavaScript needed (a function that only renders markup is fine); behaviour lives in `ux/`; an `ext/` may bundle both.

## Fence
ext/DataGrid/ (new), ai/sessions/page.js (adopting it; coordinate with @task-mastermind-sessions-tab-polish, which keeps the stat cards and numbers), ui/readme.md (one line), this task dir. NEVER the mcp__playwright tools.
Model: Sonnet. Budget $12.
