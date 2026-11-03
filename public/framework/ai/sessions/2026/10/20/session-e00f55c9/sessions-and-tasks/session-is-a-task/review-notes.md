# For the reviewer: what branch `worktree/qf-4` does, and what to judge

**The ask:** [requirements.md](requirements.md), items 1–7, 10–13 and 20 (the deputy's share). The plan and the measurements are in [slow-write.md](slow-write.md). The migration record is `core/Session/doc/session-is-a-task.md`, on the branch.

**What the branch does:**
- **Session extends Task** (`core/Session/Session.js`). A Session's tasks, completion and progress are Task's own code now. `tasks.add` takes a string, an object or a typed object (`Task.List`). A record whose line 1 is `{session}` replays as a Session.
- **Child sessions roll up.** Registry rows carry `parent_session`. `Agents.agents_under(dir, {session_id, since})` finds the children by place, and the tab's spawns by `parent_session` (or, for older rows, the parent's name inside the session's time span).
- **Cost is attributed to tasks.** `Task.attribute(turns)` gives each turn to the open task that started last; the rest is "untracked".
- **The session page** (`ai/AISession/SessionFeed.js`, the Overview tab). It lists every task and child session, newest first, and its head line reads "Own tasks: N · Total: M". The old overview moved to a new Board tab. `SessionTree` joins folders with the same name on other days (10/20 and 10/24). `SessionStats` links each day's log and the transcript.
- **The fast write** (already merged on its own as `worktree/qf-3`) is in this branch too.

**Proof already taken (judge from these rather than re-testing):**
- [live-1920.png](live-1920.png): the live site, with this branch's 8 changed js/css files swapped in by `page.route`, at the uuid route `/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/`. It reads "Own tasks: 227 · Total: 471", and the feed drew in 3.8 s. The Board tab ([live-1920-board.png](live-1920-board.png)) reads "49 done · 33 running · 1 queued or waiting · 17 dropped", and the record line links "log, 2026/10/20 · log, 2026/10/24 · the transcript".
- [reach-1920.png](reach-1920.png): the same route on qf-4's own server. It shows only 2 tasks, because the worktree has no `ai/index.json` (the file is generated and gitignored). This is a worktree limit, not a defect.
- Tests on the branch: session-task (11 checks), session_tasks (10), Task.test (61 of 61), item_tool (96), Project.test (9 of 9).

**Known gaps (say if any should block the merge):**
1. **The Sessions list does not show this session.** The tab session `e00f55c9` is in no day's `index.json`, so the page cannot be reached from the AI page; it opens only by url. The fix belongs with the per-scope indexes (slow-write.md, 12c part 3) and is queued as the next task.
2. **Two different counts on one screen.** The stats bar's "49 of 83" counts the task folders, while the feed's "Own tasks: 227" counts the record's tasks.
3. **The cost tile read "…" four seconds after load.** Its number comes from Servex.
