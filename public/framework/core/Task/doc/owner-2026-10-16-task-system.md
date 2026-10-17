# Owner notes, 2026-10-16: the task system (dictated, captured by voice-app)

Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; this goes for every task.

**This task system is the mechanism that tracks progress.**

## Shape

```js
class Task extends Item extends Events(Object)
  tasks      // List, on demand: created on the first add, not in the constructor
  render()   // → new Task.View; subclasses override for their kind of task
```

- A List is an evented array: use the List API, not the array API; anything (views included) subscribes.
- A task card subscribes to `tasks` only for reorder / remove / add. Each subtask renders its own changes.
- `AITask extends Page` is doubtful. A task can HAVE a page; it should not BE one. AI sessions and AI tasks use this Task.
- Sessions can be Items too. `core/Session/Session.js` is a plain class today, `AISession extends Session`; document that architecture wherever it lives.

## Fields

- `complete`: 0 to 1. For stepwise tasks, steps done / steps. For requests, a judged weight that rarely reaches 1: 1 means certain it is fully done. The judgement is "did we do everything asked?", weighed against how long and token-hungry the rest would be, and whether to ask first. The owner checking it off is final.
- an expected / desired outcome, set before the task starts (earlier dictation today).
- priority: tasks need prioritising.
- git refs: when a task commits files, the task carries the commit hash (full, or enough of it to be unique) so the actual changes can be traced from the task.

## Where tasks live

- Every task is registered to a session, but tasks can also live outside one: on the live page, or inside the module they concern. Tasks inside modules may be the better home; be more thorough with task data than with session data.
- Prompt refinement produces the tasks. Whisper → sentences → a cheap cleaner (`ext/Refine`); the step after that, turning the refined prompt into tasks, is not designed yet.

## Seen today

- `core/Task` exists (state machine, subtasks, progress), used by nothing. `AITask` extends Page and reads `task.jsonl`, which has no outcome or state verb. `TaskLoop` guesses open-ness from timestamps. Three things named Task, unconnected.
- Worktree prunes save work to `salvage/*` branches that nobody merges: ~170 branches hold commits not on `michael/dev`.

## Back burner (ideas, not tasks)

- A rough Git UI: a node script that runs the right git commands; no LLM needed. Not now.
- A system of ideas, so notes like this one have a home.

## Addendum (same day, later)

-  of a task WITH subtasks is the percentage of its subtasks that are complete. Drop the confidence-weight idea for now; keep it simple.
- Creation goes through the **item tool**, not a task tool. The item tool is a path and a method. Any class that extends Item gets its methods as tools automatically: the agent reads the class definition, sees `extends Item`, and knows it can instantiate, edit, or call anything on it through the item tool. Same tool for pages, sessions, tasks, everything.
- The owner lifted the hold: the voice-app acts as a mastermind on these notes, decides simple things itself, and keeps work moving; a plan for the task system is to be written, then approved, with follow-up if approval does not come.
