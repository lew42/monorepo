# Session page: the Tasks tab as a grid (step 2d)

Budget: $5. Load the `minion` skill first, then `code`, `css` and `ui`.

**The ask** (the plan, `../plan.md`, "2d. Tasks"): the session page's Tasks tab shows the session's tasks on `ext/DataGrid`, the same grid the sessions list uses (one component for both). It is one full-width table with filters for **state · day · kind**, so a session that ran for four days can be browsed one day at a time. The owner's original brief is `../requirements.md`.

## Where

- **Worktree:** you are already in it (`worktrees/session-tasks-grid`, branch `worktree/session-tasks-grid`). Work only there. Commit at every working step. **Don't merge**: the mastermind merges after review.
- **Files:**
  - `public/framework/ai/AISession/AISessionDetail.js`, line 265: `panels.tasks = div.c("flow sessions-panel", () => { $work = div.c("flow"); })`. Today it draws `SessionWork` (`SessionWork.js`): nested tasks with Approve buttons.
  - `public/framework/ext/DataGrid/` (read `readme.md` first). See how `AISessionsPage.js` uses it: columns, `cells`/`row` hooks, `set_rows` for live updates.
  - Find where `SessionWork` gets its tasks (it is fed from the session's records). Use the same source; never fetch a second time.
  - Docs: `public/framework/ai/AISession/readme.md` (line 10, the tab list) and `public/framework/ai/sessions/doc/ui/classes.md`.
- **Leave alone:** the `panels.chat` block (mastermind-chat-v2 owns it), and the `MAIN`/`MORE` tab row.

## The change

1. **A grid of tasks.** One row per task: title, state (the same state icon the Overview uses), day (local date), kind, which session owns it (this one or a child, linked), and cost if the record has one. Newest first. Include the descendants' tasks if `SessionWork` already does, and match it.
2. **Filters, in one row above the grid:** state, day and kind, as chips or the same Filters ▾ dropdown the Timeline uses (`SessionTimeline`; reuse it, never build a second one). Day lists only the days that have tasks.
3. **"Kind"** is whatever field the task records already carry (look for `kind`, `type`, `process` and so on). **Prove what exists before you choose**: log the field and its distinct values in `task.jsonl`. If there is no such field, derive it in one small function and say so in a log line.
4. **Keep Approve.** Decision: the grid is the default. A "Nested" chip next to the filters shows today's `SessionWork` view, so Approve and the nesting still work. (The alternative, putting Approve into a grid cell, is fine too if it is just as simple; say which one you chose.)
5. **Live:** new and changed tasks appear through the same feed that `SessionWork` gets, using `grid.set_rows`, so sort and filters are kept.
6. **Phone:** at 390 the grid can scroll sideways inside its own box, but the page must not (`document.documentElement.scrollWidth` is 390).

## Proof (put the files in this folder; PNGs are gitignored)

- **The worktree server has no live session data.** Walk the live site with Playwright instead and serve your worktree's files through a route: `page.route("**/framework/ai/AISession/<file>*", r => r.fulfill({ body: fs.readFileSync(WT + "/public/framework/ai/AISession/<file>"), contentType: "text/javascript" }))`, with one route per changed file. The URL is `http://monorepo.localhost/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/?tab=work`. Playwright imports need `file:///C:/…`.
- **Shots:** `before-390.png`, `after-390.png`, `after-1920.png`, and one with a day filter on (`after-day.png`).
- **Two numbers that must agree:** the grid's row count with no filter equals the number of tasks `SessionWork` draws, and the row counts for each day add up to that total. Log all three in `task.jsonl`.
- `node Server/smoke.mjs <worktree> /framework/ai/sessions/` shows no FAIL, and the page has 0 page errors.

## Never

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never push. Findings go in `task.jsonl` as `log` lines. Finish with a one-screen report to your parent.
