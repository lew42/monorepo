Budget: $20

# Sessions on DataGrid, table or rail, no regression (minion brief)

You are a Sonnet minion for @mastermind-data-grid. Load `minion`, `code`, then `css` before CSS and `layout` before the rail's sizing.

**Work only in the worktree `C:\Code\lew42\worktrees\data-grid-3`** (branch `worktree/data-grid-3`, served at `http://data-grid-3.localhost/`; already merged with michael/dev at `137750706`). Run `git merge michael/dev` first to be current. Commit each working step, message ending `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. The mastermind merges.

**Read first:** `public/framework/ext/DataGrid/doc/architecture.md` (the design) and `ext/DataGrid/readme.md` + `DataGrid.js` / `DataGridTable.js` / `DataGridRail.js` (the API that landed). Then `public/framework/ai/sessions/readme.md`.

## Your files
`public/framework/ai/AISession/AISessionsPage.js` (the drawing half: `render_head`, `resize_col`, `unfreeze_cols`, the row loop in `render_rows`), `public/framework/ai/sessions/sessions.css` (the `.sessions-grid` / `.sessions-head` / row rules), an ADDITIVE `render_card()` on `AISessionView.js`, and `ext/DataGrid/*` only for a small generic fix the Sessions page needs (say what and why in the commit). **Keep untouched:** `AISessionRows.js` (data: merge, sort_rows, filters, nesting), `AISessionDetail.js`, the feeds and the live stream in `activated()`/`follow_live()`. Other masterminds own those (seam note on `/framework/ai/sessions/`).

## Build
1. **The table on DataGrid.** Replace the hand-built `.sessions-grid` (head, `ext/grip` per column, row loop) with one `new DataGrid({...})`: columns from `AISessionRows.COLUMNS` (give each the width/min that `sessions.css` has today so it looks the same), `filters: false` (the page keeps its own controls), `row_height: null` (rows vary), `page_size` 100–200, `row: r => <the AISessionView for r, with its nest>`, `href` to `this.url + id + "/"`, `settings: this.settings`. The live feed calls `grid.set_rows(rows)` (scroll position and sort must survive a live redraw). Remove `ext/grip` from this page.
2. **Keep every feature.** Default order newest activity first (running sessions on top); header sort with natural directions and nulls last (`AISessionRows.sort_rows`, `natural_dir`); children nested under their parent, collapsed until opened (the ▸ N toggle), also under a sort; month loading (`set_from`, "show 30 more days", the From box); column resize (one listener, widths saved per reader, double-click resets); red flags, cost lines, role/resume tier, the narrow-screen card layout at 400; a row's own live update (`AISessionView` subscribes to its session: keep it, it's what makes a live change redraw one row).
3. **The rail view.** `AISessionView.render_card()` draws a quick snapshot of one session for a rail card: the state dot and name on the first line, cost and "updated" age on the second, role · source · model muted on the third, flags inline. The grid's `card` hook calls it. In rail view the page arrangement changes (architecture.md, "The view setting"): the list is flush with the left nav, full height, no padding of its own, each card padded, and a click opens the session's detail beside it (the page's existing `route(id)` + `columns()`). Set the page's own width from the view (`fill` for table, `small` for rail) and `reshape()`; check the detail still opens beside the rail at 1200/1920/3440 and replaces it at 400.
4. **The owner picks the default later.** Add `{"settings":{"tab":true,"weight":3,"view":"table"}}`-style default through the existing `ai/sessions/settings.jsonl` (append with `node .claude/hooks/append.mjs`, never hand-write a .jsonl); the toggle works either way.

## Proof before done
- `MSYS_NO_PATHCONV=1 node Server/smoke.mjs C:/Code/lew42/worktrees/data-grid-3 /framework/ai/sessions/ /framework/ai/sessions/<a real session id>/` — the seeds ok.
- After numbers: `node public/framework/ai/sessions/2026/10/12/session-6d3ef407/data-grid/sessions-perf/perf-sessions.mjs http://data-grid-3.localhost after` three times (the script's selectors may need `.datagrid-row`/`.card` added; keep its measurements identical). Print the before/after median table (before = the last 12 lines labelled `before` in `results.jsonl`). It must be no worse on first row, long-task ms and DOM nodes; say honestly if any number is worse and why.
- Screenshots `after-table-<w>.png` and `after-rail-<w>.png` at 400/1200/1920/3440 beside the script (rail with a session's detail open at 1920).
- Update `ai/sessions/readme.md` in one line (the grid is `ext/DataGrid`, table or rail) and `ext/DataGrid/readme.md`'s "who uses it".
- Final message: commits, the before/after table, anything left.
