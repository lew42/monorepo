# Task — a DOM-free unit of work: id, title, a state machine, a computed duration and progress, a List of subtasks

## What it is

A `Task` is anything with a start, a middle and an end — a build step, a chore, a
process. It's an `Item` (core/Item/) plus five states (`idle running paused stopped
finished`), timestamps, a running-time clock that pauses with the task, and a
`tasks: List` of subtasks whose own finish gates the parent's.

## Use

```js
import Task from "/framework/core/Task/Task.js";

const build = new Task({ id: "build", data: { title: "Build the thing" } });
const step1 = new Task({ id: "s1", data: { title: "Compile" } });
build.tasks.add(step1);

build.start();
step1.start(); step1.finish();
build.finish();           // only works once every subtask is finished

build.progress();         // { done: 1, total: 1 } — computed from tasks, never stored
build.duration();         // ms of RUNNING time — pausing stops the clock
```

Watch it live: [core/Task/live/](/framework/core/Task/live/).

## Watch out

- **`finish()` refuses while a subtask is open** — it warns ("… isn't finished yet —
  finish that first") and leaves the state unchanged, never throws. Every illegal
  transition (`pause()` on an idle task) behaves the same way.
- **Every transition is one `set()` call**, so it's one replayable delta line and
  fires the same `change`/`delta` events `Item.set_one()` already does — nothing
  hand-rolls a second emit path.
- **`duration()` counts running time only.** Time spent paused never counts; the
  open running span lives in memory (`_ran_since`), not in the saved data, so a
  reload mid-run loses only that open span's few seconds, never the banked total.
- **`progress()` is always computed**, never a stored number (CLAUDE.md law 7). No
  subtasks yet reads as `{done: 0, total: 1}` (or `1/1` once finished), so a progress
  bar still means something before the first subtask exists.
- **This is the base class only.** `AITask extends Task` (brief, asks, agents,
  sessions, cost vs budget, review) is a later pass — see
  `ai/2026-10-02/task-class/requirements.md` for what's deliberately left: folding
  in `ai/objects.js`'s display `Task`, `ext/AITask`'s page renderer, `ext/JSONL`'s
  `TaskJSONL`, and `ext/AITask/nested.js`'s `TaskTree`.

## More

- [Overview](/framework/core/Task/) · [Live](/framework/core/Task/live/) — start, pause,
  stop and finish a task with subtasks, live, no reload
- [`Task.js`](./Task.js) · [`Task.test.mjs`](./Task.test.mjs) — the state machine, the
  subtask-blocks-finish rule, duration math; `node Task.test.mjs`, 11/11 passing
- [Item](/framework/core/Item/) — the base class · [List](/framework/core/List/) — what `tasks` is
