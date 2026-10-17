# Task complete: step 3b of the task system plan

Budget: $4

This task builds step 3b of the [task system plan](../plan.md). Read its **Amendments** section first: every name you need is decided there. Steps 1 to 4 already landed in [core/Task](/framework/core/Task/): `Task.replay(lines)`, the states, the fields, `TaskView` (chip, row and card) and `AITask.task`. **Build only step 3b.** The plan file is at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`; read it there, because it isn't in your worktree yet.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-complete`, on branch `worktree/task-complete`, made from `michael/dev`. Edit only inside it.
- **One commit**, with the tests passing first. Do not merge: your mastermind (`mastermind-task-system`) reviews the diff and merges it.
- **Your files:**
  - `public/framework/core/Task/`: `Task.js`, `TaskView.js`, `Task.test.mjs`, `page.js`, `live/page.js`, `readme.md`
  - `public/framework/ai/AITask/AITask.js` (only the two `this.task` uses)
  - `Servex/TaskLoop.js` and `Server/TaskState.mjs` (only where they read `finished`)

## What to build (the plan's Amendments, items 1 to 6)

1. **The word is complete.**
   - The state `finished` becomes `complete`, `finish()` becomes `complete()`, and `finished_at` becomes `completed_at`.
   - The 0-to-1 getter `complete` becomes `completion`.
   - Replay maps the old forms: `{"finish":…}` lines, `state: "finished"`, `finished_at`, and a numeric `complete`.
   - `finish()` stays as an alias that calls `complete()`.
   - Grep every reader of `"finished"`, `.finish(` and `.complete` in your files, and change them.
2. **The verdicts:** `approve(note?)`, `improve(note)` and `reject(note)`.
   - Each writes a `verdict` field `{is, note, by}` and moves the state: approve goes waiting → idle, improve goes waiting → running, and reject goes waiting → stopped.
   - Each one is a verb that replay accepts.
3. **`mode`:** the value is `"parallel"` (the default) or `"series"`.
   - `start()` on a parent starts its children: in series, the first child that isn't complete; in parallel, every idle child.
   - A parent listens to its children's change events, wired when a child is added to `tasks`. Use the existing `Events`/`List` emits, and don't poll.
   - When a child completes, a series parent starts the next child, and when the last child completes, the parent completes itself.
   - `completion` stays computed on read.
4. **`content`:** a `List` made on first use, like `tasks`.
   - A replay line `{"content":{"add":{…}}}` adds to it, using the same grammar as `page.jsonl`. Look at how `Page` handles `content` and reuse that, rather than writing a second version.
   - `TaskView.card()` draws each content item below the facts, as its `text` or `title`, kept simple.
5. **`settled()`:** returns a Promise that resolves with the task when it reaches `complete` or `stopped`. It resolves at once if the task is already there.
6. **Tests:** the existing tests are renamed to the new words and must still pass. Add:
   - **Never drop a task:** every value in `Task.STATES` is either closed (`complete`, `stopped`) or in one of TaskState's open groups.
   - **Node drives every step:**
     - A series parent with three children: starting it starts child 1 only. Completing child 1 starts child 2, and so on. After child 3 completes, the parent is `complete`.
     - A parallel parent with two children: starting it starts both. The parent completes after both do.
   - **Replay of an old folder:** lines with `finish` and `finished_at` replay to `complete` and `completed_at`.
   - The three verdicts, `content.add` through replay, and `settled()`.
   - Also run `node Servex/TaskLoop-steps.test.mjs`. It already fails with EPERM while cleaning up its temp dir on Windows, on `michael/dev` too, so ignore that one failure, but every assertion must pass.

## Check before the commit

- `node public/framework/core/Task/Task.test.mjs` passes.
- **Headless only.** Never drive the owner's tabs. Shoot `http://monorepo.localhost/framework/core/Task/` and `/framework/core/Task/live/` (`mcp__site__shot`). That site serves `michael/dev`, not your worktree. So also load your changed files under a private static server on a free port rooted at the worktree's `public/`, and stop it when you are done. Or intercept requests in Playwright, as the step 4 helper did.
- Say in your report what you checked, and how.

## Landing

- **Log as you go:** append `log` lines to your own `task.jsonl` with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`, where the lines file is a JSON array.
- **When the commit passes, send one message to `mastermind-task-system`:** the hash, what you checked, and what you left undone. Then stop. If that agent isn't reachable, write the same report as a `log` line in your own `task.jsonl` and stop.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
