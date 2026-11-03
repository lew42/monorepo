Budget: $6 · Sonnet, medium effort · load the `minion` skill first, then the `page` skill.

# Session page: every task and child session, newest first

## The ask (the owner, 2026-10-24, relayed by vscode-mastermind; tab prompt log page.jsonl ~lines 405–410)

"I should be able to see all the tasks in the session and scroll through them and figure out what was done in this session." Then: the session page's content is **a list of all its child sessions and tasks, newest first**; a prioritized dashboard view can come later. Show **own tasks and total tasks**, with **the subtasks in the rendered view**. A new ask becomes a task, and the session spawned for it carries that task.

Parent task: `this-session-s-page-opens-and-lists-ever` in `../session.jsonl` (subtasks `own-and-total-tasks`, `newest-first-list`).

## What exists (already merged or in branch worktree/qf-4; read these, nothing else)

- The page: `/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/` → `public/framework/ai/AISession/AISessionDetail.js` `content()` (tabs at about line 186; the Overview panel mounts `SessionOverview` at about line 205).
- `SessionOverview.js`: today's Overview, four columns (open, project, done, dropped). Keep the class as it is.
- `SessionWork.js` (the Tasks tab): loads the session's **task folders** as a tree (`work.tree.root`, nodes from `sessions/doc/variants/SessionTree.js`: `title, state, url, started, ended, session, agent, snap{usd, model}, kids`). The `ready` promise in `content()` resolves with it. From commit e3073f74a (branch `worktree/qf-4`), `SessionTree.load` also joins the same session's folder on later days (`root.folders`).
- `core/Session/SessionTasks.js`: the session's **record tasks** (its `session.jsonl` replayed into a `Session`; `s._tasks`, each a `Task` with its own `_tasks` subtasks, `state`, `get_one("title")`, `first_at`). Today it draws them in the Chat tab. Reuse its replay; don't write a second one.
- Rows: `SessionTaskRow.js` (desktop row from `MobileTaskRow`) and `core/Task/TaskView.js` (`TaskView.row(t)`). Use one of them for every row (law 6: one component), and extend it if it lacks a slot.

## Build

1. **`public/framework/ai/AISession/SessionFeed.js`** (+ `SessionFeed.css`), `class SessionFeed extends View`: the Overview tab's content.
   - **One list, newest first** (by start time), merging:
     - (a) every task folder of the session (SessionWork's tree). Where an agent session ran it (`n.session`), **the child session renders as its task**: the task's title and state, the agent's model and cost on the row, and a small link to its session page `/framework/ai/sessions/<n.session>/`.
     - (b) every task in the session's record, from SessionTasks' replay.
   - Subtasks fold under their parent (`details`/`summary`), closed by default, with "N of M done" on the parent.
   - A stopped (dropped) task is shown dimmed, not hidden.
   - Each row has a link to where it lives (the folder url for (a); none needed for (b)).
   - **Head line, computed:** `Own tasks: N` (the record's direct tasks) `· Total: M` (record tasks with all their subtasks, plus the task folders and their nested folders) `· newest first`. Say it in plain words on the page.
2. In `AISessionDetail.content()`:
   - the Overview panel draws `SessionFeed`;
   - `SessionOverview`'s four columns move to a new tab **"Board"**, right after Overview.
   - Keep the Chat tab's SessionTasks as it is (it has Approve and Reject).
3. Readme: `public/framework/ai/AISession/readme.md` gets one line for SessionFeed; `public/framework/ai/sessions/readme.md` "One session" names the Overview list and the Board tab.

## Check before you land

- **Headless 1920 shot, reached from `/framework/ai/`** (its session row links straight to the page). The list shows the newest rows first, and the head line counts own and total.
  - The worktree has no generated `ai/index.json`, so the task folders will be empty there. Shoot the **main site** with your two files swapped in through Playwright `page.route`, as `C:/Users/mike/AppData/Local/Temp/deputy-scratch/shot-wt.mjs` does (copy it into your own scratch and edit the `swap` list and the worktree path).
  - Also shoot at 390 px.
- `node Server/smoke.mjs <your worktree>` shows no FAIL.
- Commit in your worktree only when it works. Then send the mastermind one line: commit, shot paths, and what you left.

## Where

Work in **`C:/Code/lew42/worktrees/qf-4`** (branch `worktree/qf-4`, its server at `http://127.0.0.1:50089/`). The mastermind commits there too, in other files, so `git add` your files by exact path. Never use `git add -A` or `git checkout --`. Don't merge; the mastermind merges.

## Never

- Never kill or restart the dev server or Servex; never drive the owner's tabs (headless only); never `git stash`.
- Don't edit `SessionTree.js`, `SessionStats.js`, `Servex/` or `Server/`: the mastermind is changing those in `worktree/qf-4`.
- Findings go in `session.jsonl` in this folder as `log` lines.
