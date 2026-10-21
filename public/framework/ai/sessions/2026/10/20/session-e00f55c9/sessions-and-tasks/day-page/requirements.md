# The day page: everything that landed today, as a check-mark list, read from the store

Budget: $6. Sonnet, medium effort. Parent: `vscode-mastermind` (the owner's VS Code tab), who tails your `session.jsonl`: log with the `log` tool, not chat. Own worktree (`worktree/day-page`); commit each working step; `node Server/merge.mjs`; do not restart Servex or the dev server (say which one is needed).

## The owner's ask (2026-10-20, 21:35: "if I wanted to see a view of everything that was done today, how do I do it?")

There is no such view. Found on the live site (shots in this folder's parent log): `/framework/ai/sessions/2026/10/20/` is a bare list of folder names; its "This day's dashboard" link goes to `/framework/ai/2026-10-20/`, which reads the retired `ai/<YYYY-MM-DD>/` layout and says "Spend not computed", "No prompts logged for this day yet", "Nothing yet — a task appears when its directory holds a requirements.md or a task.jsonl", while the store holds 20 landed tasks for the day (`AITask/day-prompts.js`, `AITask/module-spend.js`). The owner asked earlier today (section 9 of [owner-2026-10-20-who-makes-tasks.md](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md)) for "the day's limited check-mark list: what was asked, what landed, what is open, hierarchical".

## Build (one page, no second one)

1. **The day page is `/framework/ai/<YYYY-MM-DD>/`** (keep the route; `/framework/ai/sessions/YYYY/MM/DD/` keeps linking to it). It reads the **store** through the one query (`DatedFiles.sessions` / `ext/Query`, slice 3 of [the plan](/framework/core/Item/doc/store-index-query-plan.md)); never the old `ai/<date>/` folders, never a hand-written list. If the query cannot give what the page needs (tasks nested under sessions at any depth, their `landed_at`, `title`, first outcome line, `state`), extend `DatedFiles` with one method (`tasks_of_day`) and use it from both the page and `Server/session-query.mjs`.
2. **The screen, mobile first (400 px, no prior knowledge):** a headline count ("20 landed · 2 open · $N"), then the check-mark list, **hierarchical** (a task under its parent task under its session), each row: ✅ or ⬜, the time, the title, the first line of the outcome, a link to the task. Open tasks first, then landed by time. Below: the day's log lines (`day.jsonl`) and the day's spend if `Server/DaySpend.mjs` has it (run nothing on page load). Prompts of the day: the owner's dictations from the store's `session.jsonl` records (`chat` lines from the owner) as one collapsible list; the gitignored tab prompt log is not read by the site.
3. **Live:** rows update through the socket as the index streams (CLAUDE.md: stream, don't poll). The old `day-prompts.js` and `module-spend.js` are either rewired to the store or removed; nothing left reads `ai/<date>/`.
4. **Proof:** `check_page` at 400 and 1200; a shot of today's page showing the 20 landed tasks with the scratch count from `node <scratchpad>/day-landed.mjs 2026/10/20` written in your log as the cross-check (the script is in the mastermind's scratchpad `C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/e00f55c9-bad4-4ee2-899e-d629ea1eede6/scratchpad/day-landed.mjs`; copy its logic, do not depend on it).
5. **Docs (law 9):** `ai/readme.md` says in one line what the day page is and where its data comes from; `ai/AITask/readme.md` the same for the files you touched.

## Done when

- [ ] Today's page shows every landed task of 2026-10-20 as a hierarchical check-mark list with outcomes, plus open ones, at 400 px.
- [ ] Nothing reads the retired `ai/<date>/` layout.
- [ ] Merged; `finish-task` in your own `session.jsonl`, one screen, check marks.
