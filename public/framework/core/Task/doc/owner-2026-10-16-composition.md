# Owner notes, 2026-10-16 (evening): compositing tasks (dictated, captured by voice-app)

Companion to `owner-2026-10-16-task-system.md`. The other voice session's vocabulary is in `public/framework/ext/Refine/doc/card-types.md` (Task, Step, Plan, Proposal, Decision, Approval, the lifecycle prompt → plan → proposal → approval → task → complete). Read both.

## Children are tasks; series vs parallel is the real distinction

- A task's children are tasks. Tasks and subtasks, recursive: not a separate step type for naming's sake.
- The distinction that matters: do the children fire one at a time (series, steps) or all at once (parallel)? Both are wanted, and they nest: series inside parallel inside series.
- Shape, undecided, to be planned by the mastermind: a flag on the task (`series` / `parallel`, one of them the default), or a subclass (`Steps extends Task`). The owner leans toward a flag, default parallel, flipped to series when order matters. When a task starts, the system runs it accordingly: fire the next child, or fire all children.
- Completion of a task with children is the share of children that are complete. Tracking that across parallel asynchronous children is the tricky part; plan it.
- Not every task has children; leaves are the norm.

## Content on a task

- A task should have a `content` list like a page does (`Page.content`, a List), so anything can go on a task card: a note, a decision, a log line, a form.
- That means a task is stored as deltas in a JSONL, like a page. Which file: a `session.jsonl` in the session folder, a `tasks.jsonl` beside a module, or a `tasks/<slug>/` folder per task. The folder gives each task a namespace that can grow (its own files later); the single file is simpler. The owner is not sure; the plan's answer (a folder with `task.jsonl`, three homes) stands unless the mastermind finds a reason to change it.

## Events vs promises

- Promises could track completion; events are the framework's way (List and Item are evented). Undecided; the mastermind picks, leaning events, with a promise wrapper if a caller wants to await a task.

## Words

- The owner's word is **complete**, not finished (card-types.md, lifecycle step 7). `core/Task` says `finished`; rename.
- TaskLoop and TaskState exist; the series/parallel flag is what they read when they fire children.
