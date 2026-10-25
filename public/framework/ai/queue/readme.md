# Task queue `ai/queue/`

**How the queue works, in plain words.** There are three lists, and nothing yet joins them. (1) The ranked list on `/framework/ai/queue/` is a *view*: it shows every open task that has a priority, sorted by score, and starts nothing. (2) Each mastermind keeps its own task list, which is just its tasks in `task.jsonl` files; the mastermind decides what to work on next and spawns an agent for it. A task that is open and goes quiet is only *chased* by `Servex/TaskLoop.js` (a status question every few minutes, then a flag), never started by it. (3) Servex's spawn queue is the only thing that holds work back: at most `working_cap` agents work at once (8 by default, raised from 5 on 2026-10-24; `SERVEX_WORKING_CAP`), and a spawn above that waits in `Global.admit()` until a working agent ends its turn, when the queue is drained at once ([Servex/doc/dormant.md](/Servex/doc/dormant.md), "The working cap"). A message that wakes a sleeping agent is never held, so the count can briefly pass the cap (the "6/5" of 2026-10-24).

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
- TaskLoop and the Dispatcher do not read this queue yet, so nothing is picked from it by itself. What stops it silting up unseen (the 133 stale tasks of 2026-10-24): the daily [follow-up](/framework/ai/doc/follow-up.md) counts every open task untouched for 7 days (`unworked`, `Server/FollowUp.mjs`, whole state), and its daily owner card names that count beside the flagged total. It counts every open task, not only the queue's (272 on 2026-10-24, against the queue's 133).

## Next

- ✅ A per-task cost estimate (title similarity), so the score separates rows.
- ⬜ Drop a task from the live list when it lands (`TaskQueueView.change()` only ever sets rows; a reload clears it).
