# Task fields: step 3 of the task system plan

Budget: $3

This task builds step 3 of the [task system plan](../plan.md), section 2 ("The fields"). Steps 1 and 2 already landed (`8935e1c77`): `Task.replay(lines)` and the `waiting` state are in [core/Task/Task.js](/framework/core/Task/). **Build only step 3.**

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-fields`, on branch `worktree/task-fields`, made from `michael/dev`. Edit only inside it, and never touch the main tree, except to append log lines to your own task.jsonl.
- **One commit**, with the tests passing first. Do not merge: your mastermind (`mastermind-task-system`) reviews the diff and merges.
- **Your files:** `public/framework/core/Task/` (`Task.js`, `Task.test.mjs`, `readme.md`) and the line-1 writer in `Servex/agents/Agents.js` (around line 791).

## What to build

1. **Getters on `Task`**, all of them reading data and never storing a computed number:
   - `expected`: the outcome the task should produce, written before it starts. It is a plain data field.
   - `priority`: the latest `{"priority":{score,why,by}}` line, as `{score, why, by}`, or `null`.
   - `commits`: an array of short hashes, one per `{"commit":"<hash>"}` line, in log order, with no duplicates. Add a method `commit(hash)` that appends one.
   - `session`: `data.session ?? data.session_id`.
   - `module`: a string or an array of module paths (`"core/Task"`), as written.
2. **The `complete` getter**, a number from 0 to 1. Exactly this order:
   1. `checked_by` is set (the owner checked the task off): `1`. Add `check({by})`, which records `checked_by` and is final.
   2. The task has subtasks (`this._tasks?.length`): the share of subtasks that are `finished`. **This is the only computed form.**
   3. Old folders only: `steps` is a non-empty array (the [Server/Steps.mjs](/Server/Steps.mjs) shape, with `step` as the current one). Use steps done ÷ steps. It is a fallback for old logs, never the way a new task reports.
   4. Otherwise `data.complete` (set by the agent, 0 to 1), with `finished` meaning `1` and anything else meaning `0` when it is unset.
3. **Replay reads the new lines.** `{"commit":"…"}` calls `commit()`, and `{"priority":{…}}` stores the priority. Neither one is a state verb, so neither one switches replay out of the legacy mapping.
4. **No new task writes `steps`.** In `Servex/agents/Agents.js` around line 791, line 1 of a spawned task writes `steps: [], step: 1`. Remove both. First grep everything that reads `steps` or `step` from line 1 (`Server/Steps.mjs`, `Servex/TaskLoop.js`, `Server/TaskState.mjs`, `ai/AITask/`), and confirm that each one already handles a missing `steps`. If one doesn't, make it treat a missing value as an empty list. `Steps.mjs --plan` may still append `steps` when an agent asks for a step plan on purpose; leave that alone.
5. **Tests in `Task.test.mjs`**, and all 22 existing ones must keep passing. Cover:
   - each getter;
   - `complete` with subtasks, with legacy steps, with an agent value, with finished, and with `checked_by`;
   - replay of `commit` and `priority` lines, including a legacy open file with `commit` lines, which must stay `running`.
   Run them with `node public/framework/core/Task/Task.test.mjs`. Also run `node Servex/TaskLoop-steps.test.mjs`, `node Servex/TaskLoop-state.test.mjs` (if it exists) and `node Server/TaskState.test.mjs`, which must stay green.
6. **Readme:** add a few lines to `core/Task/readme.md` covering the fields and `complete`.

## Landing

- **Log as you go:** append `log` lines to your own task.jsonl with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` (a JSON array), at least every 5 minutes of work.
- **When the commit passes, send your mastermind one message:** the commit hash, the test commands with their pass counts, and anything you left undone.
- **Then stop.** Don't merge, and don't remove the worktree.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
