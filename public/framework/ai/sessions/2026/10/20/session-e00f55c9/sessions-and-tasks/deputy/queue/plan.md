# Task queue: the class, the page, and the look

Brief: [requirements.md](requirements.md). What exists and why this is the one queue: [what-exists.md](what-exists.md).

## Name and home (settled first)

- **Class:** `TaskQueue`, in `public/framework/core/Task/TaskQueue.js`. DOM-free and free of node imports, so the page, TaskLoop and tests import the same one (the deputy's call, 2026-10-23). Alternative I rejected: a class in `Server/`, which the browser could not import and TaskLoop would have to copy.
- **Adapter:** `Server/TaskQueue.mjs` gathers the records and registers the `taskqueue` query source. It holds no ranking.
- **Page:** `public/framework/ai/queue/` (`page.js`, `TaskQueueView.js`, `.css`, `readme.md`), at `/framework/ai/queue/`, in the AI page's `children` list.

## Each queued item (all computed, law 7)

| Property | Where it comes from |
|---|---|
| **what** | the task's `title` line; the breadcrumb is its module plus its parent task's name |
| **why** | the task's `source` link (the owner's words); the `priority.why` line |
| **estimated cost** | the median real `usd` of landed tasks in the same module (3 or more), else of all landed tasks, else $1.50. The basis shows on hover |
| **priority** | one score: `importance × (1 + 0.5 × re_asks) ÷ (1 + est_usd ÷ 2)` |
| **state** | `running` (replayed state), `waiting` (a `wait` line and no `approve`), else `queued`; the running agent's id is shown |

Tuning numbers, all in one place (`TaskQueue` statics): `IMPORTANCE` {1: 3, 2: 2, 3: 1, none: 1} from the big thing in priority.md; `REASK_WEIGHT` 0.5 (each re-ask adds half an importance); `COST_K` $2 (a task estimated at $2 scores half of a free one); `FALLBACK_USD`; `MIN_SAME_MODULE` 3.

**Re-asks:** the number of other sessions with a refined ask that shares 3 or more words with the task's title, minus the first. Today it is mostly 0 (`--repeats` finds none at 3+ sessions); the number is real, not hidden, and the matching is crude (assumption: good enough for a first look, a task-id link on each refined ask would be exact).

**Known weakness the look shows:** the first ten rows tie at 0.74, because they share a big thing and a module, so the estimate is the same. Next step if the owner likes the look: a tie-break by oldest ask, and a per-template estimate.

## How it shows live

The page's `TaskQueueView` asks the `taskqueue` source through `QueryClient` and takes pushed row changes: no polling. The source recomputes when the task index changes. Running agents appear in the State column, so the owner sees what is spawned and what waits. The Dispatcher and TaskLoop are not changed in this slice.

## The look

Shots, built from real records on the worktree's server: [400](shots/queue-400.png) · [1200](shots/queue-1200.png) · [1920](shots/queue-1920.png). At 1920 the summary and formula sit beside the list and the list becomes table columns; below 1700 each task is a card.

Not built, waiting for the look to be approved: the review report, TaskLoop reading this order, estimates per template, the tie-break.
