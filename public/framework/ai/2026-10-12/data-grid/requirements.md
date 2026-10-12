# DataGrid: one grid, table or rail

In short: three grids become one `ext/DataGrid`; Sessions runs on it with no regression; the same data shows as a table or a rail (preview → detail), chosen by a setting, not a new class.

**Owner (2026-10-12, dictated):** "I'm feeling the need for a data grid extension… if it's not being used for the sessions thing, it should be, but we don't want to backtrack on the sessions data grid." Sessions are like pages; we want one consistent system for design, data, files, routing and navigation, especially the **preview → detail** transition. "We don't want to have to create a new class every time we want a little bit different layout."

**What exists (found 2026-10-12):** three grids, which breaks law 6:
- `ext/DataGrid/DataGrid.js` (346 lines; used only by `ai/AIOverview.js`)
- `ui/datagrid/datagrid.js` (142 lines)
- `ui/table/` (table.js 24 lines)

The Sessions page (`ai/sessions/`, @mastermind-sessions-grid's latest round) uses none of them. Past work: `ai/2026-10-03/data-grid`, `ai/2026-10-02/sessions-grid-v2`, `ai/2026-08-26/grids-lab` (check, don't trust).

## Done when (tick each with proof)
- [ ] **One grid:** fold `ui/datagrid` and `ui/table` into `ext/DataGrid` (or the reverse; pick the better base and record why). Old paths re-export or redirect; never delete.
- [ ] **Sessions on it without regression:** keep every feature the current sessions grid has (recency sort, live stream, month loading, column widths, resize, flags). Screenshots at 400/1200/1920/3440 and load/lag numbers (long tasks, DOM nodes) before and after; it must be no worse, ideally faster (render only visible rows).
- [ ] **Think it through: the class architecture page first** (CLAUDE.md), at `ext/DataGrid/doc/architecture.md`, shown on its page. Questions:
  - Is the preview → detail transition part of DataGrid, or of Page?
  - Owner's lean: Page organises this. A data grid is "just another type of page content". A page can change its layout, background and colour scheme, and can be a card inside a page.
  - Where do those settings live, and how do they persist?
  - When is extending Page for a mode right, vs a setting?
- [ ] **Two views of the same data, as a setting, not two classes:**
  - (a) the table it is now;
  - (b) a **rail**, like the AI inbox: flush with the left nav, filling the page; the rail itself has no padding, each item is a padded card in a stack (a quick snapshot per item), click → the detail view.
  
  The owner is drawing pictures to choose; build both as a toggle so the drawing only picks the default. Use the [style-system](../style-system/requirements.md) card word.
- [ ] Coordinate with @mastermind-sessions-grid and @mastermind-sessions-detail (they own sessions files: agree on a seam, one worktree if needed) and @mastermind-style-system.
- [ ] Smoke clean; `hold.mjs` around live batches; commit each step; merge.

Opus 5.5 for the architecture, Sonnet to build. Worktree; `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open: keep going through all of it.
