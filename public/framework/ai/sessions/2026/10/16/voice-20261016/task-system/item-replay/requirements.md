# Item owns replay: step 13 of the task system plan

Budget: $3

The owner's third note ([owner-2026-10-16-top-down.md](/framework/core/Task/doc/owner-2026-10-16-top-down.md), "Item, not Task, owns replay") says loading an item from its log must be the same for every Item. Today there are three copies:
- `Task.replay` (`core/Task/Task.js`, around line 268) has the legacy mapping.
- `Session.replay` (`core/Session/Session.js`) has a smaller copy.
- `Item.Store.read()` (`core/Item/Store.js`, around line 75) calls `host.set(entry)` for each line in the browser, and so never applies Task's legacy mapping.

Read the [plan](../plan.md), "Amendments 2" and step 13; the plan is at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`. **Build only step 13.**

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/item-replay`, branch `worktree/item-replay`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge; `mastermind-task-system` reviews and merges.
- **Your files:** `public/framework/core/Item/` (`Item.js`, `Store.js`, `Item.test.mjs`, `readme.md`), `public/framework/core/Task/` (`Task.js`, `TaskView.js`, `Task.test.mjs`, `readme.md`), `public/framework/core/Session/Session.js` and its test. Callers of `Task.replay` / `Session.replay` (Servex `page_tools.js`, TaskLoop, TaskState, AskIndex) keep calling the same names, so they shouldn't need changes; if one does, keep that change minimal.

## What to build

1. **One replay, on Item.**
   - `replay_line(line)`, an instance method on Item, defaults to `this.set(line)`.
   - `static replay(lines)` on Item builds `new this(…)` from what line 1 needs, calls `replay_line` for each line, then calls an optional `replay_end()` hook, and returns the item.
   - `Store.read()` calls `host.replay_line(entry)` instead of `host.set(entry)`, so the browser and node take the same path. Keep the `replaying` flag around it exactly as now.
2. **Task keeps only its legacy mapping.**
   - Task overrides `replay_line` (and `replay_end` for the "no explicit verb line, infer from `landed_at` / `closed_by`" pass) with today's mapping, unchanged in behaviour: `assign` lines, `finished_at`, the numeric `complete`, `session_id`, `commit`, `priority`, the verb lines and the clock pinning (`_at`).
   - `Task.replay` becomes Item's static, inherited. Remove the separate `Task.replay = function…`.
   - Session drops its copy and inherits Item's, overriding `replay_line` only if it truly needs to.
   - Every existing test must pass unchanged in what it asserts: Task 42/42, Session 5/5, `node Servex/agents/item_tool.test.mjs` 15/15, `node Server/AskIndex-tasks.test.mjs`.
3. **`tags`:** a getter that returns `[module, ...own tags, ...parent's tags]`, with no duplicates and no empties. "Parent" is the task that owns the `tasks` List it sits in. Own tags are a `tags` field, a string array. Add `tags` to `FIELDS`.
4. **`expected`:** accept a string or an array of strings, keeping the type through replay. `TaskView.card()` draws each string as its own line. The yes/no check at `complete()` is a later step; leave a one-line comment pointing at the plan.
5. **`approve(note?)` starts the task:** waiting → running, not idle. A queue that delays it doesn't exist yet; leave a one-line comment. Update the approve tests and the readme line, and check that TaskLoop and TaskState don't depend on approve → idle (grep `approve`).

## Check before the commit

- All the suites above pass, plus `node public/framework/core/Item/Item.test.mjs`.
- Add tests:
  - A Task opened through a Store-style path, calling `replay_line` per line, gives the same state as `Task.replay(lines)` on an old folder's lines (`assign` with `landed_at` and `outcome`).
  - `tags` inherits from the parent.
  - `expected` as an array survives replay.
  - `approve` goes to running.
- **Headless only:** load `/framework/core/Task/` and `/framework/core/Task/live/` from the worktree's `public/` on a private static port (or intercept requests in Playwright), with no console errors. Stop the server when you are done. Never drive the owner's tabs.
- If the worktree has no `node_modules`, don't copy or link the main tree's. Run only the tests that don't need it, and say which ones you couldn't run; the mastermind runs them after the merge.
- Never call `restart_servex`.

## Landing

- Log as you go: `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>`, where the lines file is a JSON array.
- When the commit passes, send one message to `mastermind-task-system` with the hash, what you checked, and what you left undone. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl`.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
