# Session page: a session shows its tasks, live

**For:** a Sonnet builder (UI and object-oriented code), spawned by mastermind-system-architect. **Parent task:** "The cloud voice agent works the session system" on [process-system](../). **Branch:** `task/session-page-tasks`, in a served worktree. Never merge.

## The ask (the owner, 2026-10-22)

The voice agent (and any session) adds and updates tasks and subtasks with the item tool and starts a process, "all visible live on the session page." The tool side works: it was verified end to end on 2026-10-22, see `Servex/ext/remote/doc/cloud-voice-agent.md`, "Tasks and processes in your own session". **The page side fails.**

## What is broken (screenshots taken 2026-10-22 with check_page)

1. `http://monorepo.localhost/framework/ai/sessions/2026/10/22/cloud-voice-session-system-test/` shows an **empty column**. Its `session.jsonl` holds a session line, a completed task with a subtask, and a `{"task":"…/e2e-check-process/"}` reference to a stopped process. None of it is drawn. The console shows 404s for `page.js` and `task.jsonl` in that folder.
2. `http://monorepo.localhost/framework/ai/sessions/2026/10/20/session-e00f55c9/` (a VS Code tab's session) opens on a task-style page: tabs Requirements, Report, Tree and Session. Report shows "running", and **no list of the session's tasks**, though its `session.jsonl` holds `tasks.add` lines. The console warns "JSONL: unknown verb session / tasks / start / stop" for that file.

## What to build

- **The session page draws the session's tasks.** Every `tasks.add` line and every `{"task":"<url>"}` reference in `session.jsonl` becomes one row. A row shows the title, the state, the completion and its subtasks. A reference loads the child's own log (`Task.from_ref`). The session's own completion is at the top.
- **Use what exists. Never build a second task list.** `core/Session/Session.js` replays a session (its `tasks`, `progress()`, `completion`, `{task:url}` references). The task views are in `core/Task/` (TaskView, TaskPage, TasksPage). The route that picks the page for a store folder is `ai/AISession/StoreFolder.js`; the session detail is `ai/AISession/AISessionDetail.js`. Read `public/framework/ai/sessions/readme.md` and `ai/sessions/doc/session-record.md` first. Find where a folder holding `session.jsonl` is routed today and why the voice folder draws nothing.
- **Live:** a line appended to `session.jsonl` (or to a referenced child's log) redraws within a second, through `JSONL.live()` / the Store tail, never by polling. Prove it: open the page headless, append a task with the item tool, and screenshot again.
- **Both cases above work:** the voice session folder (line 1 `{"session":{…,"kind":"cloud-voice-agent"}}`) and the tab session (line 1 `{"session":{…,"kind":"vscode-tab"}}`). A spawned agent's folder (line 1 `{"assign":{session_id, agent}}`) keeps working as it does now.
- Load the `page` and `layout` skills before you change the layout. Shoot it at 400 px and 1200 px.

## Rules

- No new npm dependencies. Never write the owner's name. Never drive the owner's browser tabs: use `check_page` or headless Playwright.
- Work in a served worktree (`take_worktree`). If that tool is missing, use `git worktree add -b task/session-page-tasks ../worktrees/session-page-tasks michael/dev` and then `npm ci`. Never link node_modules between trees.
- Commit after each working step, ending the message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Never merge.
- Finish with the item tool on your task: `{"complete": {"outcome": "<branch, worktree url, commits, the before and after shot paths, and how you proved it is live>"}}`.
