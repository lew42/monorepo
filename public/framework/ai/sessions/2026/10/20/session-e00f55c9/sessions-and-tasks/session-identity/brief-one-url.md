Budget: $6. Load the `minion` skill first, then the `code` and `navigation` skills.

# One session, one URL: the folder path is the session page

**Why:** the owner, 2026-10-25: "the web page at a different path than the actual path that saves all of its stuff… that's confusing and wrong." Full ask: `requirements.md` beside this file, last section ("one session, one folder, one URL").

**Work in the worktree** `C:\Code\lew42\worktrees\session-identity` (branch `worktree/session-identity`, served at http://127.0.0.1:54983/). Commit there after every working step. Never touch the main tree, never `git stash`, never kill or restart any server, never drive the owner's tabs.

**Your fence (only these files):** `public/framework/ai/AISession/AISessionsPage.js`, `StoreFolder.js`, `AISessionDetail.js`, the AISession readme and `doc/`, plus whatever link helper builds session hrefs (find it). The mastermind is editing `Server/`, `.claude/hooks/` and `Servex/` in the same worktree at the same time: don't touch those.

## Today (read it in the code to confirm)
- `/framework/ai/sessions/<uuid or agent id>/` → `AISessionsPage.route(id)` → `new AISessionDetail({home, id})`: the real session page (tabs, chat, cards).
- `/framework/ai/sessions/2026/10/20/session-e00f55c9/` → `StoreFolder.route` → the folder has `session.jsonl`, so it opens as a bare `AITask` view. That is a second, different page for the same session.

## Wanted
1. **The folder path is the session page.** A session folder (`sessions/YYYY/MM/DD/<folder>/`, depth 4) draws `AISessionDetail` for that session, with the folder path as its URL. Its tabs and real subfolders (task folders such as `sessions-and-tasks/`, which open as tasks today) must still route below it.
2. **The uuid / agent-id URL only redirects** to the folder path (`location.replace`, keeping search and hash; the StoreFolder `cards()` redirect is the pattern). The session's folder is known from the index (`AISession.dir_url(id)` after `AISessionDetail.preload`, or `dir_index()`); work out which.
3. **Every link the site builds to a session points at the folder path**, not the uuid URL: the sessions list rows, the detail page's own links, mobile. Old uuid links keep working through the redirect.
4. A session with no folder yet keeps today's page at the uuid URL (no redirect loop).

## Done means
- Headless shots at 400 and 1200 of `/framework/ai/sessions/2026/10/20/session-e00f55c9/` (the session page, with its tabs) and of `/framework/ai/sessions/e00f55c9-…/` (find the full id in that folder's `session.jsonl`, line 1), which lands on the folder URL. Also one task subfolder, e.g. `…/session-e00f55c9/sessions-and-tasks/session-identity/`, which still opens as a task. Zero console errors, with no same-origin 404s.
- `node Server/smoke.mjs` shows no FAIL for `/framework/ai/sessions/`.
- The AISession readme says in one paragraph which URL a session lives at and why: the folder is id-based (stable and unique), the page shows a readable title, and the uuid URL redirects.
- Findings and the shots' paths go as `log` lines in this task's `session.jsonl` (via `node .claude/hooks/append.mjs`). Report one screen back: commits, what changed, the shots.

Leave open with a reason only what a fence blocks.
