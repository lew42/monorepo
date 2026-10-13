Budget: $15

# DataGrid core: one grid, table or rail as a setting (minion brief)

You are a Sonnet minion for @mastermind-data-grid. Load the `minion` and `code` skills first, then `css` before any CSS.

**Work only in the worktree `C:\Code\lew42\worktrees\data-grid-2`** (branch `worktree/data-grid-2`). Never edit the main tree at `C:\Code\lew42\monorepo`. Commit each working step there with a clear message ending `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. The mastermind merges; you don't.

**Read first:** the architecture you are building, `public/framework/ext/DataGrid/doc/architecture.md` (in the worktree). Follow it; if something in it can't work, build the closest thing that does and say why in your final message.

## Your files (nobody else edits them)
`public/framework/ext/DataGrid/**`, `public/framework/ui/datagrid/**`, `public/framework/ui/table/**`, and the `datagrid`/`table` export lines in `public/framework/ui/ui.js` if needed. Do NOT touch `ai/AISession/*` or `ai/sessions/*` — a second minion moves Sessions onto your API after you land.

## Build, in order (commit after each)
1. **Fold the markup in.** Move `ui/datagrid/datagrid.js`'s markup + its css into `ext/DataGrid` as statics `DataGrid.head(columns)`, `DataGrid.body(columns, rows)`, `DataGrid.template(columns)`, and `ui/table/table.js` as `DataGrid.table(head, rows)` (still a native `<table>`, same look, same `.c("num")`). The old files become re-exports so every existing import keeps working (`/app.js`'s `datagrid` and `table`, `core/Page/audit/page.js`, `imagine/codrops/page.js`). Watch the import direction: `ext/` may import `core/`; `ui/` re-exporting from `ext/` must not create a cycle — check `ui/parts.js`'s `component()`/`css()` and keep `table()`'s capture behaviour identical. Never delete a file.
2. **Drawers.** `class DataGridTable` (`DataGridTable.js`) and `class DataGridRail` (`DataGridRail.js`), attached as `DataGrid.Table` / `DataGrid.Rail`. Each draws the current `view_rows` its own way. DataGrid picks one from `this.view` (`"table"` default, `"rail"`); `grid.set_view(name)` swaps without refetching.
3. **Hooks a page passes instead of subclassing:**
   - `href(row)` → a row/card is an `<a>` to it when given (no click handlers: the Router navigates).
   - `cells(row)` → table: draws a row's cells (default: one `.datagrid-cell` per column via `format`). A caller may instead pass `row(row)` that returns a whole row View (Sessions' `AISessionView` is an `<a class="sessions-row">` whose cells are positional with `display: contents`).
   - `card(row)` → rail: draws one card's inside (default: the first column as the title, the rest as one muted line of `label value`).
   - `sort_rows(rows, sort)` and `natural_dir(key)` → override the default comparator (Sessions sorts nulls last with natural directions); header click cycles natural → reversed → off, same as now.
   - `filters: false` → no auto filter bar (Sessions has its own controls).
   - `set_rows(rows)` → replace the rows (a live feed redraws through this), keeping sort, scroll position and view.
4. **The rail look:** the rail is flush (no padding of its own), full height of its box, one `.card` per row inside a `.flush-stack`-style stack (find both in `framework.css` / `ux/Inbox/Inbox.css`; reuse, no new card class). Each card is padded, a quick snapshot of the row; the `.active` row (Router marks it) is visibly selected.
5. **The view setting** (architecture.md, "The view setting"): url `?view=` > `PagePrefs` (core/Page/Prefs.js) > the page's `settings.view` > `"table"`. A small toggle (two buttons, Table / Rail, `ui` skill) in the grid's own header bar writes the url (`history.replaceState`) and the pref. Column widths save to `PagePrefs` on drag end; double-click a grip resets.
6. **Fast:** keep windowing for fixed-height rows (`row_height` option; the current 36px default stays for the demo). For variable-height rows (`row_height: null`), render the first `page_size` (default 100) rows and load the next page when a sentinel at the end scrolls into view (IntersectionObserver), with a "show more" link as the keyboard fallback.
7. **The demo page** (`ext/DataGrid/page.js`): the 2,000-row grid with the toggle working, and beside or under it a debug view of the live instance (view, sort, row counts, widths) that updates as you click. Show, don't tell; keep text short. Update `readme.md` (index shape, under ~100 lines) and `ui/datagrid`/`ui/table` readmes to say they now live in `ext/DataGrid`.

## Proof before you say done
- `node Server/smoke.mjs C:\Code\lew42\worktrees\data-grid-2` (or what the smoke script expects) clean for your pages, and `mcp__servex__check_page` on the worktree's own url for `/framework/ext/DataGrid/`, `/framework/ui/datagrid/`, `/framework/ui/table/`, `/framework/core/Page/audit/`: zero page errors.
- Screenshots of the demo in table and rail view at 1200 (`mcp__site__shot`), saved to `public/framework/ai/sessions/2026/10/12/session-6d3ef407/data-grid/grid-core/` in the worktree.
- Final message: the commits, the new API in 6 lines (signatures only), anything you could not do.
