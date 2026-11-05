# In flight: the 3–5 tasks being worked on now, and what’s next

**The owner (2026-11-02, about 16:35):** "I wish I could see an overview of all the tasks being worked on… a nice, clean, simple task list where there's just 3 to 5 tasks that are the major ones in flight, and seeing their progress and seeing what's queued up next. That should be the simplest, easiest dashboard ever, and we don't have it." The owner also said:
- tasks belong to sessions for now;
- a multi-day session like this one has hundreds of tasks;
- the main AI dashboard is a mess and has been redone many times.

## Build (one component, law 6)
1. **An `InFlight` view on a Session.**
   - **In flight:** the tasks running right now. A process shows its current step; a task shows its own state. That's at most 5, picked by recent activity, each with a progress bar (its `completion`) and its current `now` line. The data is `core/Session/doc/classes.md`.
   - **Waiting on you:** tasks whose state is `waiting` on the owner or the creator, each with the one thing needed.
   - **Next:** idle or queued tasks, a few at most.
   - **Done today:** a count, collapsed.
   - **Nothing else.** No log, and no history wall.

   ```
   In flight        [bar 60%] Plugin build  — now: writing the test     (max 5)
   Waiting on you   Rename session.sessions — needs: a go
   Next             Task A · Task B
   Done today       12 ▸
   ```
2. **Show it first, at the top of a session's page** ([`ai/AISession/AISessionDetail.js`](/framework/ai/AISession/AISessionDetail.js), and [`core/Session/SessionTasks.js`](/framework/core/Session/SessionTasks.js) if that's the right host).
3. **The same component, across all active sessions,** at the top of `/framework/ai/`. Only sessions with something in flight or waiting appear.
4. **Live:** it follows `session.jsonl` and each task's `task.jsonl` (`JSONL.live`), never a polling timer.
5. **Phone first:** check it at 360×740 and at 1920. Shots in a walkthrough, taken against this session (`/framework/ai/sessions/2026/10/20/session-e00f55c9/`), which should show:
   - in flight: the plugin build, the single voice assistant, and the ProcessRunner fix;
   - waiting: items such as the `session.sessions` rename.

## Do (test first; worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
- **A unit test of the selection** (`InFlight.pick(session)`): in flight, waiting, next and done, given a fixture session.
- **Look first at what exists:** `ai/AITask/` (board, dashboard, `nested.js`), `core/Session/SessionTasks.js` and `core/Task/TaskView.js`. Reuse the row; don't build a new task card.

**Fences:** commit by path; no `python -`. **Budget:** about $8. You are a mastermind on Sonnet, medium effort. If you're stuck after two honest tries, say so. Report to vscode-mastermind in 3 lines, then complete your own task and stop.

## The owner’s asks (tick only with proof)
- [x] 3–5 major tasks in flight, each with a progress bar: [shot-session-1920.png](shot-session-1920.png) (5 rows, "+ 31 more running")
- [x] what is waiting on the owner: same shot, "Waiting on you" rows with the one thing needed
- [x] simplest possible, no log, no history wall: same shot
- [x] at the top of a session page: same shot, above the tabs
- [x] phone first: [shot-session-360.png](shot-session-360.png)
- [ ] what is queued next: no "Next" row is in either shot
- [ ] Done today, a count, collapsed: not met; it shows all-time "N done" because a Task has no completion date
- [ ] the same view at the top of /framework/ai/: built, never shot (needs the live site after merge)
- [ ] live from session.jsonl: no proof recorded
