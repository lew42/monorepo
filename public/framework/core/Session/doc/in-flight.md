# In flight: the simplest dashboard of a session

A short block that shows, for one session: what is being worked on now, what waits on the owner, what is next, and how many are done. Nothing else (no log, no history).

## What it shows

- **In flight**: at most 5 running top-level tasks, newest activity first. Each row has the title (a link), a progress bar (`completion`), a percent, and the task's current line. A Process shows its current step; any other task shows its own `now`. If more than 5 run, a "+ N more running" line says so.
- **Waiting on you**: tasks in the `waiting` state whose `waiting_on` is the owner or the creator (or unset), with `waiting_what` as the one thing needed. Tasks waiting on another agent are not shown.
- **Next**: up to 3 idle or paused tasks, by priority.
- **Done**: a count. Stopped (dropped) tasks and Prompts are never shown.

## Files

| File | What |
| --- | --- |
| [InFlight.js](../InFlight.js) | `InFlight.pick(session)` chooses the rows; `InFlight.now_of(task)` is the current line. DOM-free. |
| [InFlightView.js](../InFlightView.js) | The view. One `SessionTasks` reader per session record (`.live()`), so it follows `session.jsonl` with no polling timer. `{url}` is one session; `{urls, all: true}` is many, showing only sessions with something in flight or waiting. |
| [InFlight.css](../InFlight.css) | Styles, in `@layer site`. |
| [InFlight.test.mjs](../InFlight.test.mjs) | `node public/framework/core/Session/InFlight.test.mjs` |
| [InFlight.real.test.mjs](../InFlight.real.test.mjs) | The same over copies of real folders in [fixtures/](../fixtures/): a running process, a running agent folder, a complete task. |
| [Task/legacy-open.test.mjs](../../Task/legacy-open.test.mjs) | Reading a legacy log infers its state and appends 0 lines. |

While a session's file or its task files are still being read, the block says "Reading the session…" / "Reading N tasks…", not "Nothing is in flight." ([in-flight-real-400.png](in-flight-real-400.png)). `Task.open_ref` ends each opened reference with `replay_end`, so a spawned agent's folder (no `start` verb) reads running in the browser as in node; `Task.replay_end` never saves what it infers.

## Where it is used

- The top of every tab of a session page: [ai/AISession/AISessionDetail.js](/framework/ai/AISession/AISessionDetail.js).
- The top of [/framework/ai/](/framework/ai/): [ai/AIDashboard/AIDashboard.js](/framework/ai/AIDashboard/AIDashboard.js), over the sessions the `inflight` query reports active.

Not a new task card: the rows are plain links and bars over the same `Session` replay the Tasks tab uses.

## Choices

- **Done is a count of every completed task**, not only today's, because a Task has no completion date the view can rely on; it reads "N done". It is hidden on `/framework/ai/`.
- **`/framework/ai/` leaves out Next and Done**: across sessions the point is what is moving and what needs the owner. A session with only Next tasks is not listed there. The session page shows all four.
- **The row is not `core/Task/TaskView.js`**: that is a full task card with its own state and actions; this row is one title, one bar and one line, so reusing it would have meant hiding most of it.
- The `/framework/ai/` block asks the same `inflight` query as `ai/now/AINow.js` (`state`, `last_activity`, `url` per row). It draws nothing if the query fails.
- **Which five** are shown: running tasks that have a current line or some progress first, then by most recent activity.

- **Built, not merged**: a session's page also lists its `worktree/*` branches whose commits are not on `michael/dev` and are more than 6 hours old, when the branch's task folder is inside that session (`InFlight.unmerged(rows, dir)`). The rows come from `public/framework/ai/unmerged.json`, written by `node Server/unmerged.mjs --write` (about 30 s; derived, gitignored; run it on a schedule or by hand). The table, `--json` and what the columns mean: [Server/doc/unmerged.md](/Server/doc/unmerged.md).
