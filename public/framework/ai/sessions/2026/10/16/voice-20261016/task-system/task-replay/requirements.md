# Task replay: steps 1 and 2 of the task system plan

Budget: $6

This task builds steps 1 and 2 of the [task system plan](../plan.md), sections 5, 7 and 8. Both steps were approved by voice-app on 2026-10-16, under the decisions the owner delegated to it. **Build only these two steps.** Steps 3 to 11 still wait on the owner.

**The problem being fixed:** `task.jsonl` has no state verb, so `Servex/TaskLoop.js` treats every task that hasn't landed and isn't closed as open, and it chases tasks that are idle or waiting on purpose.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-replay`, on branch `worktree/task-replay`, made from `michael/dev`. Edit only inside it, and never touch the main tree.
- **Commits:** two, one per step. Each needs its tests passing first. Do not merge: your mastermind (`mastermind-task-system`) reviews the diff and merges.
- **Your files:** `public/framework/core/Task/` (`Task.js`, `Task.test.mjs`, `readme.md`), `Servex/TaskLoop.js`, `Servex/TaskLoop-steps.test.mjs` or a new `Servex/TaskLoop-state.test.mjs`, `Server/TaskState.mjs` and `Server/TaskState.test.mjs`. Put test fixture folders beside the tests (for example `Servex/fixtures/task-state/`).

## Step 1: `core/Task` can replay a log (one commit)

1. **Add `static replay(lines)`** in `core/Task/Task.js`. It builds a `Task` from parsed `task.jsonl` objects.
   - Use each line's own time (`at`, `assign.at`, `assign.landed_at`, `assign.requested_at`), never the wall clock.
   - Replaying the same file twice must give the same task.
2. **Explicit state lines** call the method with the same name: `{"start":{}}`, `{"pause":{}}`, `{"resume":{}}`, `{"stop":{"why"}}`, `{"finish":{}}`, plus the two new ones below.
3. **The `waiting` state.**
   - Add it to `STATES`.
   - `wait({on, what})` sets `state: "waiting"` and stores `waiting_on` and `waiting_since`. It is allowed from `idle`, `running` and `paused`.
   - `approve({by, note})` is allowed only from `waiting`. It sets the state back to `idle`, clears `waiting_on`, and records `approved_by`.
   - `CAN.stop` and `CAN.finish` also accept `waiting`.
4. **Legacy mapping**, for files with no explicit state line:
   - `landed_at` together with a non-empty `outcome` means `finished`.
   - `closed_by` means `stopped`.
   - Anything else means `running`. This keeps today's chasing exactly as it is for old tasks.
   - Once an explicit state line appears, the explicit lines decide the state, and later legacy `assign` lines only add data.
   - Merge `assign` fields into data the way `TaskLoop.read_task` does today (the latest value wins). Map `session_id` to `session`, and keep `steps` and `step` as data.
5. **Make `tasks` on first use:** `get tasks(){ return this._tasks ??= new List({owner: this, name: "tasks"}); }`. `progress()` must still work when no subtask list has been made yet.
6. **Tests** go in `Task.test.mjs`, and the existing 11 must keep passing. Cover:
   - a legacy landed file, a legacy closed file, and a legacy open file;
   - an explicit `wait`, then `approve`;
   - `wait` arriving after legacy lines;
   - an illegal transition, which warns and does not throw;
   - replay being deterministic.
   Run them with `node public/framework/core/Task/Task.test.mjs`.
7. **Readme:** update `core/Task/readme.md` in a few lines covering `replay`, `waiting`, and `tasks` being made on first use.

## Step 2: TaskLoop and TaskState read state through `Task.replay` (one commit)

1. **`TaskLoop.read_task`** gets its state from `Task.replay`, and the loop acts on that state:
   - **`running`:** chased exactly as today, with the same quiet, gap and escalation rules.
   - **`idle`, `paused`, `stopped`, `finished`:** never chased, and not counted as `open`.
   - **`waiting` with `waiting_on: "owner"`:** handled as a follow-up instead of a chase.
     - **After 2 hours** (`SERVEX_TASKLOOP_FOLLOWUP_MIN`, default 120), waiting time counted from `waiting_since`: one reminder. It goes to the agent of the parent task (line 1 `parent_task`, or else the owning agent), through the same send path `chase()` uses, and it never revives a stopped agent. Use the existing escalation card path as well.
     - **After that:** one more reminder every 24 hours.
     - **Record each one** as a line `{"follow_up":{"n","to","at"}}` in that task's file. Read the lines back on the next tick, so a restart loses no count.
     - **The wording of a reminder:** "Task <slug> is waiting on the owner since <time>: <what>." It must never tell an agent to build.
   - **`waiting` on an agent id:** no chase, and no reminder.
2. **`TaskState`** adds a `waiting` group to the snapshot: `{id, title, waiting_on, since, url}` for every task waiting on the owner, from today's and yesterday's folders. Add it to `counts` and `sig()`.
3. **Tests** use fixture folders, one `task.jsonl` per case:
   - a legacy open task is still chased;
   - an idle task is not chased;
   - a waiting task under 2 hours gets nothing, and over 2 hours gets exactly one reminder;
   - a second tick inside 24 hours sends nothing new;
   - an approved task does not get a reminder.
   Stub `servex` the way `TaskLoop-steps.test.mjs` does. The existing `TaskLoop-steps.test.mjs` and `TaskState.test.mjs` must keep passing.

## Landing

- **Log as you go:** append `log` lines to your own task.jsonl with `node .claude/hooks/append.mjs`, at least every 5 minutes of work.
- **When both commits pass, send your mastermind one message:** the two commit hashes, the test commands and their pass counts, and anything you left undone.
- **Then stop.** Don't merge, and don't remove the worktree; the mastermind does both.
