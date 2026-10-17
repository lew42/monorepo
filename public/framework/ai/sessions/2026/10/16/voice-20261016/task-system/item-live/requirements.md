# Step 3c: the item tool works on live instances

**Who you are.** A minion, building one step of the task system for `mastermind-task-system`.
- **Worktree:** `C:/Code/lew42/worktrees/item-live`, branch `worktree/item-live`. Commit there; do not merge.
- **Plan:** [plan.md](../plan.md), section "Amendments 4", items 1, 2, 3 and 6. Read that section first. The owner's own words are in `public/framework/core/Task/doc/owner-2026-10-16-node-side.md`.
- **Budget:** $5, on Sonnet.

## What to build

1. **One live instance per file, in node.** The item tool (`item` in `Servex/agents/page_tools.js`) opens the target file through `Item.Store.for(url)` and keeps one cached root per file, so every call on a path reaches the same instance. It then calls `parent.set(delta)` and lets the Store write the line.
   - `deep_merge` retires for the item path.
   - `page_set` stays as an alias through the same instance.
   - Watch for edits made outside the tool. If the file changed on disk since the cached read (compare size or mtime), re-read it. Do not serve a stale root.
   - `page_set` on a task folder that has a `task.jsonl` and no `page.jsonl` goes to the task, through the same path as `item`. Today it writes a stray `page.jsonl`; I hit this tonight.
2. **Subtasks nest in the parent's `task.jsonl`.** Adding a subtask writes `{"tasks":{"add":{…}}}` into the parent's file, and later changes write `{"<child id>":{…}}`. No folder is made.
   - A child gets its own folder only on demand: a page, proofs or a brief. The parent then records `{"file":"<child>/task.jsonl"}`.
   - The existing `{"task":"<url>"}` reference lines and child folders from steps 14 and 17 stay valid, and nothing migrates. Both variants must replay in node and in the browser.
3. **Slugs: refuse, never overwrite.** Creating a task whose slug already exists under `<module>/tasks/` is refused with a message offering `<slug>-2`. Today `task_home` silently auto-suffixes (the slug loop around line 438).
   - Check whether `Server/TaskDirs.mjs --new` overwrites an existing folder. If it does, make it refuse too.
4. **Discovery.** A new task folder adds one line to its parent's `files.jsonl` through `Server/ModuleLog.mjs`, the way other new files are recorded there. Do not build the `ai/tasks/` rebuild; that is a later step.
5. **Bug: the browser writes to a parent's file.** In `core/Item/Store.js` `attach()`, the host's `delta` listener appends every change that bubbles up from its descendants. A child stub that has its own Store (`Task.open_ref`) replays its own file, the change bubbles to the parent's Store, and that Store tries to append `{"step-1-…":{"state":…}}` to the parent's file. The server refuses those appends, so nothing is damaged, but the console fills with errors.
   - Fix: a change whose origin sits inside a descendant that has its own `store` belongs to that store, so the parent's Store skips it.
   - Reproduce it by loading `/framework/core/Task/tasks/task-system-build/` headless and reading the console.

## Checks

- Tests must pass, old and new:
  - `node Servex/agents/item_tool.test.mjs`
  - `node public/framework/core/Task/Task.test.mjs`
  - `node public/framework/core/Item/Item.test.mjs`
  - `node public/framework/core/Session/Session.test.mjs`
- Add tests for:
  - two calls on one path reach the same instance;
  - a nested subtask add, then a change to it, replays correctly;
  - an existing slug is refused and `-2` is offered;
  - the Store skips a change that comes from a child with its own store.
- A headless load of `/framework/core/Task/tasks/task-system-build/` shows 22 rows and no "refused to append" console errors. Use `Server/Browser.mjs` for headless Chromium on a private port, never the owner's tabs.
- No hand-written `.jsonl`. Commit with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Report

Send me one short message: the commit hash, the test counts, and anything left.
