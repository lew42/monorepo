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

## Real-page fix (2026-11-02)

On a real session the block said "Nothing is in flight." for up to ~15 s: the session file had not arrived, and each `{task}` reference reads its own file afterwards. It now says "Reading the session…" / "Reading N tasks…" until they have. Also, a spawned agent's folder (no `start` verb) read `idle` in the browser but `running` in node; `Task.open_ref` now calls `replay_end` after attaching, so both agree. Test over a copy of real lines: `InFlight.real.test.mjs` (fixtures in `fixtures/`). Shot: `in-flight-real-400.png`.
