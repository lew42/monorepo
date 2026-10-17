# TaskPage, the thin route: step 11 of the task system plan

Budget: $2

Read the plan's **Amendments 2** and its **Clarifications** at the end ([plan](../plan.md), at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`), and "Page vs view" in `public/framework/core/Task/doc/owner-2026-10-16-top-down.md`. **Build only step 11.**

## Decided (by your mastermind)

The plan said "scripted rename AITask → TaskPage". The owner's later clarification says TaskPage holds **no task logic**: it is only the route that mounts `Task.View` full-size. `ai/AITask/AITask.js` is a 300-line AI viewer (conversation, cost, asks), so renaming it would put exactly that logic into TaskPage. So:

- **New:** `public/framework/core/Task/TaskPage.js`: `export class TaskPage extends Page` (plus a default export). It **has** a `task`: it opens its folder's `task.jsonl` through the existing Item/Store path (`Item.open(url)` or what `core/Task/live/page.js` already does; reuse it, don't write a second reader) and renders `Task.View` full-size (today that is `TaskView`'s card; step 15 makes the checkbox row). It never reads or writes a `page.jsonl` for task content.
- **Unchanged:** `ai/AITask/AITask.js` stays the legacy viewer for existing AI task folders. Don't rename or edit it. The alternative (a 134-file scripted rename) is recorded in the plan as dropped, with this reason.
- **Use it once:** add a demo route under `core/Task/` (for example `core/Task/page/` with a fixture `task.jsonl` and a two-line `page.js` that instantiates TaskPage), named in `core/Task/page.js`'s `children:` so it is reachable. Step 14 will make every new task folder use TaskPage.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-page`, on branch `worktree/task-page`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge: your mastermind (`mastermind-task-system`) reviews and merges.
- **Your files:** `core/Task/TaskPage.js` (new), the demo folder, `core/Task/page.js` (children only), `core/Task/readme.md` (one line), `core/Task/Task.test.mjs` only if a node check fits.

## Check before the commit

- `node public/framework/core/Task/Task.test.mjs` still passes 47/47.
- **Headless only**; never drive the owner's tabs. The site at `http://monorepo.localhost` serves `michael/dev`, not your worktree, so serve the worktree's `public/` on a private static port (or intercept in Playwright) and load `/framework/core/Task/` and your demo route: no console errors except the live-reload WebSocket, and the task's title and state are visible. Stop the server after.
- Don't restart Servex; never call `restart_servex`.

## Landing

- Log as you go: `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>` (a JSON array).
- When the commit passes, send one message to `mastermind-task-system`: the hash, what you checked, what you left undone. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl`.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
