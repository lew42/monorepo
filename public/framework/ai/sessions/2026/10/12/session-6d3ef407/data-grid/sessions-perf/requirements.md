Budget: $6

# Sessions page: the "before" numbers (minion brief)

You are a minion for @mastermind-data-grid. Load the `minion` skill first. **Read-only on the site**: you write one script and its results, nothing else.

The Sessions page (`http://monorepo.localhost/framework/ai/sessions/`) is about to move onto `ext/DataGrid`. Record how it performs **now**, with a script that can be re-run unchanged afterwards against any base url, so before and after are the same measurement.

## Build
1. `public/framework/ai/sessions/2026/10/12/session-6d3ef407/data-grid/sessions-perf/perf-sessions.mjs` — **write it in the worktree** `C:\Code\lew42\worktrees\data-grid-2` (commit it there, message ending `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`). Headless Playwright (see how `Server/layout-check.mjs` / `Server/browser.mjs` launch it; never the owner's tabs). Usage: `node perf-sessions.mjs <base-url> <label>`. For widths 400, 1200, 1920, 3440:
   - load `<base>/framework/ai/sessions/`, wait until the first session row exists (`.sessions-row`, or `.datagrid-row`/`.card` later — accept any of them; make the selector list a constant at the top);
   - record: time to first row (ms), long tasks (count and total ms, a `PerformanceObserver` for `longtask` installed with `addInitScript`), DOM node count (`document.getElementsByTagName("*").length`), rows drawn, JS heap if available;
   - then scroll the grid to the bottom in 10 steps and record long tasks during scroll;
   - screenshot each width to `<label>-<width>.png` beside the script;
   - append one JSON line per width to `results.jsonl` beside the script (`{label, width, first_row_ms, long_tasks, long_ms, dom_nodes, rows, heap_mb, scroll_long_ms, at}`).
2. Run it three times with label `before` against `http://monorepo.localhost` (the live main site) and print a small median table.

## Done
Final message: the median table (4 widths × the numbers), the commit hash, and anything that made the numbers noisy.
