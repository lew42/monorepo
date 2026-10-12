# Session buckets: 7,765 sessions rolled up into a few rows (2026-10-12)

`ai/AISession/AISessionBuckets.js` (class `AISessionBuckets`, plain data, runs in node and browser) puts every session in exactly one bucket per index, each bucket with its own running totals `{ n, usd, tokens, wall_ms, last }`. `node Server/session-buckets.mjs` builds it from the day `index.json` files and writes `sessions/session-buckets.json`.

## Four indexes, four cuts of the same rows
- **kind** (the roll-up): prompt-cleaning, short-run, clarity, reviewer, helper (routine, hidden behind one bucket row) · minion, mastermind, owner-tab, other (shown).
- **task**: the parent task, or the mastermind's own name. **system**: a keyword seed table. **role**: the agent name's first word.

## Can a row sit in more than one bucket?
Across indexes yes (it is a minion, in task X, in system Y). Within one index never, so totals add up: `check()` sums each index and all four give 7,765 rows and $12,281. Never add two indexes together; combine them as a filter.

## Measured (node, 7,765 unique sessions)
| | before | after |
|---|---|---|
| Rows the grid would draw | 7,765 | 1,233 rows + 5 bucket rows |
| Recompute totals after one session changes | 1.34 ms (rescan all) | 0.002 ms (`put()` touches 4 buckets) |
| Full build | | 7 ms |
| Bucket file | | 27 KB |

Nothing is deleted: `rollup(rows, { expand })` only swaps routine rows for their bucket row; expanding a kind shows its rows again.

## Hand-off
@mastermind-data-grid owns the grid and Sessions adoption: it calls `new AISessionBuckets(rows)` once, `put(row)` on each live update, and `rollup()` for the visible list. The kind rules are heuristics from folder slugs and agent names; tune `KINDS`, not the callers.

## In the Sessions grid (2026-10-12)
![The five routine buckets on top of the Sessions table](/framework/ai/2026-10-12/data-grid/sessions-perf/buckets-table-1920.png)

`AISessionsPage.arrange()` (the grid's sort hook) keeps one `AISessionBuckets`, keyed by the grid's row id, reading each session's index record (`of: r => AISession.all.get(id).ix`; a row not indexed yet is never hidden). Each redraw calls `sync(rows)`, so only a new, changed or gone session touches its buckets, then `rollup()`. The routine buckets draw on top as one row each (`AISessionBucketView`, a card in the rail); a click shows or hides the sessions inside it. Totals follow the filters, since the buckets hold the filtered rows.

Measured, same scripts, worktree, 6,044 sessions in the window ([redraw.jsonl](/framework/ai/2026-10-12/data-grid/sessions-perf/redraw.jsonl), [results.jsonl](/framework/ai/2026-10-12/data-grid/sessions-perf/results.jsonl)):

| | before | after |
|---|---|---|
| Rows the grid sorts, nests and pages | 5,810 | 324 (5 bucket rows + 319) |
| One full redraw (`DataGrid.apply`, median of 6) | 36–39 ms | 25–27 ms |
| Load: first row, long tasks, DOM nodes (4 widths) | ~850 ms, 1 × 50 ms, 2,702 | ~850 ms, 0–1 × 50 ms, 2,628 |

Load barely moves because the grid already draws only the first 50 rows; the win is every redraw after it.
