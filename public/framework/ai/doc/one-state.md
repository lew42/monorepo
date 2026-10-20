# One state of everything

**What you asked for (2026-10-17, 22:50):** one coherent data structure, sessions plus module tasks, that represents the current state of everything. It does not matter what the UI looks like or whether a UI or a model reads it. Rock solid: no misinterpretation, no mis-accounting, no miscounting.

## Why it is not solid today

There are **two stores** and **three readers**, and they disagree.

| Store | What lives there | Written by |
|---|---|---|
| `public/framework/ai/sessions/<y>/<m>/<d>/<session>/<task>/task.jsonl` | every task an agent ran (1,491 on 10-13), the session's own `session.jsonl` | Servex, the hooks, the masterminds |
| `public/framework/<module>/tasks/<slug>/task.jsonl` | the task system's homes: 211 migrated tasks, 241 idle tasks from undone asks, tasks filed from the sheet; indexed by `/tasks/task.jsonl` | the item tool, `Server/TaskHomes.mjs` |

| Reader | Used by | What it gets wrong |
|---|---|---|
| `Server/SessionIndex.mjs` `reduce()` ("the one task.jsonl reader") | the Sessions grid, `PastWork`, `Asked`, the undone-asks pipeline | did not count a `finish`/`complete` line as landed until 10-17 (fixed) |
| `Server/TaskState.mjs` `facts()` | the tasks dashboard `/framework/ai/tasks/` (`index.jsonl`, live) | walked only today's and yesterday's date folders, so a task landed today in a session started days ago never showed: **0 of 27 on 10-17**; fixed the same night, but it still does not read the module homes, and its idea of "today" (local clock) differs from SessionIndex's (the stamp's own offset) by one or two tasks a day |
| `public/framework/core/Task/Task.js` (`Task extends Item`, replay) | the task pages, `/tasks/`, the item tool | the browser-side truth; a third set of rules for state and landing |

Three readers means three answers. The counts on 10-17 at 22:45: SessionIndex 27 landed today, TaskState 26, the old TaskState 0.

## The rule

**One reader, one structure, one self-check.** Every surface, UI or model, reads the same computed state; nothing re-derives it. The structure must carry a number that must agree with another number (landed + open + idle = all), and refuse to publish when they do not.

## The plan (an Opus task mastermind, brief in the run task `one-state/`)

1. **Name and home it first** (law 8): `class AIIndex` in `Server/AIIndex.mjs`, writing `public/framework/ai/index.json` (the whole picture) and appending `index.jsonl` lines on change (the stream the pages tail). One structure: `{ at, today, tasks: [...], sessions: [...], agents: [...], counts: {...}, check: {...} }`, where every task row has `{ id, home: "session"|"module", dir, url, title, state, started, landed_at, day, agent, session, module, line }`.
2. **One reader.** `Task.js`'s replay rules are the truth for a task's state (it already runs in node for the item tool); `SessionIndex.reduce` and `TaskState.facts` become callers of it or are retired. Both stores are walked, every time, with a cache keyed by file mtime so a full rebuild is seconds and a tick is milliseconds.
3. **Self-checks that fail loudly:** `check.total === landed + in_flight + queued + idle + waiting + stopped`; `check.today_landed` equals a count made a second way (the `/tasks/` index plus the sessions store); a mismatch is written into the state as `check.ok: false` with the two numbers, and the page shows it in red instead of a wrong count.
4. **Every surface reads it:** the tasks dashboard, the Lanes, the Inbox's "landed" rows, `/tasks/`, `/live/`, `PastWork`, the handover NOW block, `Asked`. Then delete the readers it replaced.
5. **The proof:** a test that plants six task folders (session home, module home, assign.landed_at, finish line, complete line, idle) and asserts the one structure counts all six correctly, by day, in local time.

What this is not: a new page. The UI stays what it is until the state is right; then any view is a filter over `index.json`.

## Built (2026-10-17, 23:10)

[`Server/AIIndex.mjs`](/Server/AIIndex.mjs) is the one reader ([design](/Server/doc/ai-index.md), test `Server/State.test.mjs`). It folds all 2,276 task logs in both stores through `Task.replay` and writes `ai/index.json`; the tasks dashboard's stream (`ai/index.jsonl`) now comes from it, and `TaskState`, `SessionIndex`'s landed answer and `TaskHomes.sync` call it.

- **Landed, counted two separate ways:** today 43 vs 44, then 52, 19, 18, 66, 71, 0 for 10-16 back to 10-11, the same both ways. The one difference today is `sheet-handoff-proof`: it filed a module task, `Task.replay` makes that its subtask and refuses the worker's finish. The dashboard shows it in red until the `Task.js` edit lands.
- **Every task in one bucket:** 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale (started, never landed, nobody on it); 211 more logs are old copies of tasks that moved to a module home, counted once.
- **What the old readers got wrong:** `TaskState` said 26 today (it missed the 18 module tasks); `SessionIndex` said 56 today because it grouped by the UTC day (34 now, in its ai/-only scope), and it counted 24 tasks landed that `Task.js` does not. Three `Task.js` rules need an edit, all in core/Task's inbox: the item tool's `ts` is not read as a time (37 module tasks got the wall clock as their landing), `landed_at` with no outcome is not landed, and a recorded finish is refused when the task filed another.
- Full build 5.7 s, a tick 4.6 ms.
