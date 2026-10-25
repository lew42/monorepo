# Task queue `ai/queue/`

The queue of accepted tasks, ranked, at `/framework/ai/queue/`. The page opens on one screen: the count as one big number with its split by big thing, then the top 8 as preview cards (rank, title, state, cost, the big thing's name, a why only when the task has one of its own). A card opens that task. One click down: `?view=all` (every task, one row each) and `?view=ranking` (how the score is worked out). Read only; every number is computed from records.

Linked from the AI tab bar and page, the rail's footer words (`queue`, on the day and card pages), the day page under Ready to merge, and the session page's tab row. Those links carry no count: a second `QueryClient` on a page steals the host's live pushes (the server keeps one watcher per browser).

| Piece | Job |
|---|---|
| `core/Task/TaskQueue.js` (`class TaskQueue`) | the one ranking: estimate, re-asks, score, `build(open, ctx)`. No DOM, no node imports |
| `Server/TaskQueue.mjs` | the adapter: reads each open task's `task.jsonl`, the landed tasks' `usd` (from `SessionIndex`) and `ext/Refine/queue/asks.jsonl`; registers the `taskqueue` query source. `node Server/TaskQueue.mjs --check` prints the top 20 |
| `TaskQueueView.js` (`extends View`) | the page's view: the three views by `mode` (`top`, `all`, `ranking`, from `?view=`); asks the source, retries while it is cold, repaints on pushed rows; rows are keyed by `url` (two tasks can share a slug) |
| `TaskQueueView.css` | `tq-` rules: preview cards, the side column, table columns when the list is 60em wide |

**The score:** `importance × (1 + 0.5 × re-asks) ÷ (1 + estimated cost ÷ $2)`. Importance is the big thing in [priority.md](../priority.md) (1 → 3, 2 → 2, 3 → 1, none → 1). The estimate is the median real cost of the 5 landed tasks whose titles share the most words with this one (filler words like "with" or "make" don't count; at least 2 shared, at least 3 such tasks); with fewer it falls back to the module median, then all landed, then $1.50. Hover the Cost cell for the basis. Re-asks are the other sessions that asked for it again. The numbers are statics on `TaskQueue`.

**A task is in the queue** when it is open (idle, waiting or running, not landed) and has a `priority` line in its `task.jsonl`. Plan, alternatives and the order of what exists: [plan.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/queue/plan.md).

## Watch out

- Cold start: a freshly started dev server needs about 10 s to read the task records, so the page says "Reading the task records…" and asks again (1, 2, 4, 8 s) and never draws a count before an answer; after the last try it says what is wrong, with no number.
- Needs the dev server (the source is a socket); a change to `Server/TaskQueue.mjs` needs a dev-server restart.
- TaskLoop and the Dispatcher do not read this queue yet.

## Next

- ✅ A per-task cost estimate (title similarity), so the score separates rows.
- ⬜ Drop a task from the live list when it lands (`TaskQueueView.change()` only ever sets rows; a reload clears it).
