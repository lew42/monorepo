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
