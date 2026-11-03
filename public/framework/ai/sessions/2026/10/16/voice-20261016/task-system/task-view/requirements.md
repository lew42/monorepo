# Task view: step 4 of the task system plan

Budget: $4

This task builds step 4 of the [task system plan](../plan.md) (sections 1 and 2, the `render()` row). Steps 1 to 3 already landed: [core/Task/Task.js](/framework/core/Task/) has `replay(lines)`, the states (including `waiting`), and the fields `expected`, `priority`, `commits`, `session`, `module` and `complete`. **Build only step 4.**

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-view`, on branch `worktree/task-view`, made from `michael/dev`. Edit only inside it.
- **One commit**, with the tests passing and the pages checked first. Do not merge: your mastermind (`mastermind-task-system`) reviews the diff and merges.
- **Your files:**
  - `public/framework/core/Task/`: a new `TaskView.js`, plus `Task.js`, `page.js` and `readme.md`.
  - `public/framework/ai/objects.js`
  - `public/framework/ai/AIOverview.js` (the Objects section only)
  - `public/framework/ai/AITask/AITask.js`

## What to build

1. **`class TaskView extends View`** in a new file `core/Task/TaskView.js`.
   - `Task.js` must stay DOM-free, because it runs in node (its tests and Servex use it). So `TaskView.js` imports `Task` and `View`, and it sets `Task.View = TaskView`. This is the same `Thing.View = class … extends View` pattern as [core/Page/parts/PageCard.js](/framework/core/Page/parts/), and the same `static View` seam that `Item`'s `view` getter reads (`core/Item/Item.js`, around line 221).
   - It draws a task at three sizes, the same three that `ai/objects.js` `AIObject` draws today:
     - `chip()`: an icon and the title, inline.
     - `row()`: one line with the icon, the title, the state, and `complete` as a percentage.
     - `card()`: the icon, the title, the state, `expected`, `priority`, `complete`, the `commits` (short hashes), `session`, `module`, and a link when the task has a URL.
   - It reads the task, and never a copy. Pass `{task}`, and listen to the task's change events so the view redraws itself. Look at how `Item`/`Events` emit changes, and use that; don't poll. A card listens to `tasks` only for add, remove and reorder, and each subtask redraws itself.
2. **`render()` on `Task`**: `render(){ return new this.constructor.View({ task: this }); }`. When `View` isn't wired in (in node), warn once and return `undefined`, like `Item`'s `view` getter does. A subclass overrides `render()` to draw its own kind of task.
3. **`ai/objects.js` `Task` retires to it.**
   - Delete the `Task` class from `objects.js`, and remove it from the default export.
   - Change `AIOverview.js` (its Objects section, around line 245) to build a real task with `Task.replay(lines)` and show `chip()`, `row()` and `card()` from `TaskView`.
   - Keep `AIObject`, `Skill` and `Ask` exactly as they are.
   - Grep for any other importer of `objects.js`'s `Task` first (`Dictate/playground/Playground.js` imports `objects.js`) and move it too.
4. **`AITask` gets `this.task`.**
   - `AITask` already streams `task.jsonl` through `TaskJSONL` (around line 103) into the merged record `m`. Beside that, build `this.task = Task.replay(lines)` from the same parsed lines, and rebuild it when new lines arrive. Do not fetch the file a second time.
   - Use `this.task` where it is the better source: the task's state (`running`, `waiting`, `finished` and so on), and `complete` for the progress figure. Show the state as a small label near the title.
   - Leave everything else that reads `m` alone. This step is not a rewrite of `AITask`.
   - If a task has no `steps`, the existing Steps checklist (around line 225) must hide itself, as it does today.
5. **The `core/Task` page** (`page.js`): show one replayed demo task as `chip`, `row` and `card` side by side with its data, so the class page shows the view ("show the class" in CLAUDE.md).
6. **Readme:** add a few lines to `core/Task/readme.md` about `render()` and `TaskView`.

## Check before the commit

- `node public/framework/core/Task/Task.test.mjs` must still pass 28/28. Add a node test that `render()` returns `undefined` with a single warning when there is no DOM.
- **Headless only.** Never drive the owner's tabs. Load these pages in headless Chromium (`mcp__site__shot`, or Playwright) on `http://monorepo.localhost/`, with no console errors:
  - `/framework/core/Task/`
  - `/framework/ai/objects/` (or wherever AIOverview's Objects section routes)
  - one landed task page, for example `/framework/ai/sessions/2026/10/16/voice-20261016/task-system/task-replay/`
  - the task-system page itself, `/framework/ai/sessions/2026/10/16/voice-20261016/task-system/`, which is `running`

  The main site serves `michael/dev`, not your worktree, so to load your worktree's files, start a private static server on a free port, rooted at the worktree's `public/` (for example `npx http-server`), and stop it when you are done. Check the four widths, 400, 1200, 1920 and 3440, on the `core/Task` page.
- Say in your report what you checked, and how.

## Landing

- **Log as you go:** append `log` lines to your own `task.jsonl` with `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`, where the lines file is a JSON array. Do this at least every 5 minutes of work.
- **When the commit passes, send your mastermind one message:** the hash, what you checked, and anything you left undone. Then stop. Don't merge, and don't remove the worktree.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
