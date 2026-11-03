# live.js — notes and design reasons

## THE LIVE CARD (`/framework/ai2/live/`)

The first card that does not come from `ai/board.jsonl` (the owner, 2026-09-23). It shows what is going on right now: the usage limits, every agent Servex is running, and today's tasks. It rises to the top of the rail whenever any of that changes, and its page ends in a chat — every update, one line, and anything you say.

Where each part comes from:
- usage — `/framework/ai/usage.json`, the same snapshot the overview reads; the page draws it with the first dashboard's pace meters (`ai/AITask/usage.js`), all three limits, always
- agents — Servex's live map (`GET /api/agents`), then every agent moment it pushes over the page's one `EventSource`
- tasks — today's `day.jsonl` (opened, not yet landed) and the `task` lines on Servex's `prompts` log (the Dispatcher's own)
- chat — Servex's `cards/live` log: the updates Servex writes there, your words, the assistant's replies, and every `clear`

## CLEARING

One line on that same log, `{type: "clear", ref: <id>}`, which you or any agent can write (`POST /log/cards/live`). It hides the item until something new happens to it — a cleared task that moves again comes back. Only TASKS carry a ✕: hiding an agent that is still running would make "Running now" lie.

## TALKING TO AN AGENT

Click a row in "Running now" and its conversation opens in the agent column beside the list (a wide card), or takes over the card's body with "← Live" to go back (a narrow one) — its own log, live, and a box that sends it a message (`AgentTalk`, below; `POST /api/agents/<id>/message` in Servex.js). The composer at the bottom of the page still talks to the assistant, as before.

## A NOT STARTED TASK

A NOT STARTED task was spoken while `dispatch.off` existed. The Dispatcher answers it with "dispatch is paused…" and never replays it (Servex/agents/Dispatcher.js), so it is not queued — it will never run unless said again.

## FINISHED TASK NEVER STAYS PINNED

The owner, 2026-10-04: "a weird task mastermind, something about the data grid, pinned... taking up a huge amount of space". `tasks()` below reads its `state` from the Dispatcher's own `{type:"task"}` lines on the `prompts` log — but that log is NEVER scoped to a day and a task-mastermind that lands WITHOUT also posting a final `state:"landed"` line back to it (it can land purely through its own `task.jsonl`'s `landed_at`, which this log never sees) stays "working" there forever, so the Live card's task list only ever grows. `tasks.json` is the one place that already computes "landed" the RIGHT way — `Servex/asks/tasks.js`'s own `facts.landed`, straight from each task's `task.jsonl` — so this reads it too and a task's OWN directory is the final word, no matter what the Dispatcher's log still says.

## TALK TO ONE RUNNING AGENT

The Live page redraws with `$box.empty()` whenever anything changes. This panel is built ONCE and put back by `place()`, so the typed text survives; if the box had focus, it gets it back.

## process monitor performance

⚠ `wide()` forces a synchronous layout (`getComputedStyle` reads a container-query custom property) — cheap once, but this used to run on EVERY call to `place()`: every redraw, every click, every "← Live". The Live card is the page's own default view, and a CPU profile of `/framework/ai2/` found this one line costing more self-time than any other function on the page (ai2-hang, 2026-09-30, ai/sessions/2026/09/30/inbox-ext/ai2-hang/profile.md). The card's own ResizeObserver already says exactly when the width category CAN have changed, so only that path (and the first-ever call) remeasures; an ordinary redraw reuses the last known answer.
