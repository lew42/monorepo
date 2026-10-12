verdict: fix
1. [fix] `ai/sessions/doc/buckets.md:26` embeds `sessions-perf/buckets-table-1920.png`, and line 30 links `sessions-perf/redraw.jsonl`. Neither file exists in the worktree or in git, so the doc shows a broken image, and its before/after redraw numbers (36–39 ms → 25–27 ms) have nothing behind them. Commit the shot and the redraw log, or drop the claims.
2. [note] The grid's row count now counts the bucket rows as rows: `DataGrid.apply()` counts the `arrange()` output. The header reads about "324 of 5,810 rows" while 5,486 sessions sit inside the 5 bucket rows. Count the sessions, or label the buckets separately.
3. [note] Opening a bucket (`AISessionsPage.js` `bucket_view` → `open_kinds`) puts its sessions back into the normal sorted list, scattered among the other rows instead of under the bucket row. You can't see which rows the click revealed. Nesting them under their bucket head would match how child sessions already nest.
4. [note] There is a simpler way in `AISessionsPage.arrange()`: `rollup()` builds the bucket objects and the next step throws them away (`.filter(r => !r.bucket)`), then `heads` rebuilds them from `index.kind`. A plain filter (`routine.has(kind) && !open_kinds.has(kind)`) would do the same work once, and `rollup()` would stay the one place that makes bucket rows.
5. [note] Sorting into buckets depends on `AISession.ix` having `agent` and `folder`. The day snapshots carry both (checked: `sessions/2026/10/12/index.json`, 708 of 708 have `folder`), but `from_index` only fills `INDEX_COLUMNS`, which has neither. A session known only from a month index has no agent name, so a cheap, short minion or mastermind run would land in "short headless" and be hidden. Check this against month loading.
6. [note] The bucket rows always sit on top, whatever column header is sorted (`return [...heads, ...out]`). That is probably what you want, but it isn't written in `doc/buckets.md`.
7. [note] The `Server/review.mjs:639` change (the raw-write scan also skips `ai/sessions/20…`) has nothing to do with this brief. It is harmless, in its own commit (`40cfe061c`), and the regex is right.
8. [note] Scope check: this diff is a follow-on step, routine sessions rolled up into bucket rows. It does not reopen the brief's five asks, which `STATE.md` records as landed earlier (`137750706`, `fa8b19bc9`). A bucket with a null `href` draws safely in both views (`DataGridTable.js:52` and `DataGridRail.js:38` fall back to a `div`). This review had no screenshots, so it covers requirements and words only.

## Requirements
- 1 "One grid" — n/a — this diff doesn't touch it; already landed per STATE.md
- 2 "Sessions on it without regression" — yes, partly — recency sort, nesting, live rows and the views are kept; the bucket rows add a count and expand regression (findings 2–3), and the claimed redraw gain has no committed evidence (finding 1)
- 3 "Architecture page first" — n/a — not touched
- 4 "Two views as a setting, not two classes" — yes — one `AISessionBucketView` draws in both views through the `card` flag, with no new grid class
- 5 "Coordinate with the sessions masterminds" — not checked — doc/buckets.md's hand-off names @mastermind-data-grid as the caller, and this diff follows that
- 6 "Smoke clean; commit each step" — yes — two separate commits (`8944fdf3d`, `40cfe061c`)

## Words
- content — yes — the readme line is one plain sentence with a link (`ai/sessions/readme.md:11`)
- content — no — doc/buckets.md links two files that are missing (finding 1)
- content — yes — the bucket label "2,914 prompt-cleaning sessions · $123 · show" reads plainly; "routine, one row" is a little jargon-y
