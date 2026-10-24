# Which big thing does each proposed task plainly serve? (25 tasks)

You sort; you do not build. Do NOT edit any file. This brief has everything you need: do not search the repo. Your final message is ONLY the JSON array described below (the runner saves it to `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/proposals/batches/08-priority/results.json`).

The owner has three big things:

1. **See and approve the work** — One page per day where the owner sees every session, opens a demo, and approves a whole session with one press. Approving a session approves everything inside it. Spend that never gets approved shows red, as a leak. What is ready to merge sits on the same page. - **Now:** the review page is being built on the AI dashboard ([/framework/ai/], brief: [review-page]). The Merge list is live at [/framework/ai/merge/] and folds into the review page. - **Inside it:** the phone pages for sessions ([sessions/v/mobile]) and the design picks they follow ([mobile-cards.md]); the session page with its tasks; a time filter (Today, Week, Month, Year) inside a session; the 19 closed worktrees whose commits n
2. **Every ask becomes a task that finishes** — Each thing the owner asks for is filed as a task the first time, runs step by step, and ends done or documented, with its proof. Nothing is lost between sessions. - **Now:** the 230 proposed tasks from old asks are being sorted under these three things (accepted into a priority, or parked in a backlog the owner can approve in one press). Process names are decided (*step*, one class per template, handoff by moving the task) and the rename is under way. - **Inside it:** prompt records (each prompt split into parts, its completion computed: [prompt-records.md]); processes ([process.md]); task resolution ([resolution.md]); node chases a started task that goes quiet (the "task chase" and "status 
3. **Agents that know the rules** — Every agent knows where things go and what was decided, from short readmes it can trust, and the right model does each job. - **Now:** the documentation rule is written (documentation skill §4: `readme.md` is the index, a sibling `<topic>.md` for an often-read topic, `doc/` for the rest; no dated logs in readmes; the mastermind owns its area's docs). Next: a cheap pass that makes every readme follow it. The model experiment: one Opus builder that designs and builds a whole slice, compared with an Opus planner plus Sonnet builders ([models]). - **Inside it:** the readme system ([doc/readme-system.md]); seeing which readmes, skills and tools each agent got ([agent-context.md], the readmes page

For each task below answer ONE question: which of the three big things does finishing it **plainly** serve: 1, 2, 3, or none? Answer `none` when in doubt. A task that merely touches the same folder is `none`; it must plainly be part of the thing's own description above.

## Output

A JSON array, one object per task, same ids, nothing else in your message:

```json
[{"id":"abc1234567","priority":1,"why":"one short line"}]   // priority is 1, 2, 3 or "none"
```

## The 25 tasks

1. `52725749da` [core/Shell] Make the footer a minimal status rail with small text and icons — Grep for 'status rail' or footer across framework md, css and js found no minimal status rail. The ask gives both 200 and 300 px, so the size needs the owner's confirmation.
2. `dc37089777` [design/layout] Find out why layout failures keep recurring — Grep for recurr, regress, or layout fail in design/layout found no root-cause record.
3. `0ad4be5822` [ai/readmes] Create an architecture.md per module, referenced from its README — Glob public/framework/**/architecture.md finds about 100 modules that have one, but core/Task and core/Test have none.
4. `c1f86b8c44` [ai/now] Build a recent-activity landing page as an iceberg — public/framework/ai/page.js:152 uses the iceberg only for system pages; grep 'iceberg' found no recent-activity landing page (only design/content/page.js and ai/page.js matched).
5. `ff93a639eb` [ai] Put inbox and sessions on one data source and one stream — Grep 'board.jsonl|directory.json' hits ai/v/2/page.js and ai/v/3/timeline.js, so the inbox and the sessions read separate stores; no shared module found.
6. `1e700362d2` [ai] Find out which files change during work and how — .gitignore:119 - # Servex machine state, regenerated continuously — not a record (2026-10-07, clean-tree pass)
7. `b1e51b64ad` [ai] Back up the whole monorepo with full history to the E drive — No backup script or record exists in the repo. The E drive was not checked from here.
8. `67dea480b9` [ai] Find a sensible folder on the E drive for the backup, such as a code folder — No backup folder is named in the repo. This belongs to the same backup run as the monorepo backup.
9. `1189950642` [ai] Check the size of one worktree, then include the backup in the same run — git worktree list shows 17 linked worktrees under C:/Code/lew42. No size has been measured yet.
10. `1595c7a539` [ai] Reduce repo size by pruning stale worktrees, about 24GB, without losing data — git worktree list shows 17 linked worktrees, and git branch lists many worktree/* and salvage/* branches. No prune run is recorded.
11. `3b19484e11` [ai] Plan a GitHub history prune that stays within push limits — No prune plan was found. git branch --list shows no branch or record for a history prune.
12. `a4c2d625c9` [ai] Keep a legacy branch so old work is not lost, then move the framework forward — git branch --list shows no legacy branch. The salvage/* branches hold old quick-fix work but are not a legacy line.
13. `af2ade68ac` [ai] Use the right Git branching strategy to refine and condense the framework — git branch --list shows task/*, worktree/* and michael/* branches. No written branching strategy was found.
14. `847a7d9b93` [start] Aim for a blank-state framework that can be cloned to start new projects — start/readme.md has no blank, clone, or template line (grep found none). The module is a working demo site, not a blank state.
15. `d916d92e90` [ai/quick-fix] Make quick-fix worktrees reusable — public/framework/ai/quick-fix/readme.md:24 - 'holding one quick-fix worktree for its whole life' covers only fixer-1. git branch lists about 100 salvage/qf-* branches, so worktrees are still made per request.
16. `82d788b9d3` [ai/quick-fix] Build worktree cleanup into the workflow — The quick-fix readme has no clean-up or prune step (grep found none). Stale worktrees are cleared by hand.
17. `406c2fa4f9` [ai] Move the three worktrees outside the worktree folder into it — git worktree list shows C:/Code/lew42/monorepo-wt-readme-roles outside C:/Code/lew42/worktrees. The ask says three, and only one clear case was found, so the exact set needs confirming.
18. `08eadd7643` [ai] Check what is committed to Git, whether worktrees should be pushed — .gitignore:173 - # screenshots in the AI work log: Playwright output (layout-check, proof, review), 84% of git history by size; .gitignore:65 - # which worktrees are up right now, on this machine
19. `597764863d` [ai] Consider alternatives to committing those artifacts to Git — .gitignore:161 - **/screenshots/ (machine-output screenshots are kept out of git; the alternative is already chosen)
20. `6cdc554823` [ai] Keep screenshots out of the repo — .gitignore:161 - **/screenshots/
21. `8c9043629e` [design] Build the simplest reusable layouts, cards, text, styles and buttons — Partial: ui/card and styles/layouts exist, but no base set has been declared as the foundation.
22. `e1551787ae` [library] Show each foundational component with what exists and how well it works — Not built: no per-component status was found in library/ or ui/. ui/ lists twenty components with no working grade.
23. `1fdb5f1f67` [ext/Session] Answer voice asks in seconds and hand real work to a warm minion — Not built. grep for warm or pre-spawn under ext/Session finds nothing. ext/Session is one fast and one slow answer per press, with no pre-spawned minion and no carry-over of results.
24. `9b853fe4ac` [dev/mobile] Selection: tap to select and drill down on mobile; the AI knows the element — Not built. grep for pick, tap or select-element under dev/ found only desktop DevShell and DevBar files. No tap-to-select path on a phone was found.
25. `34e847f436` [ai/health] Run a Playwright monitor on main that checks template changes — Partly there. Server/BrowserCheck.mjs:9 and Server/health-supervisor.mjs:221 use Playwright. No trigger that checks console, screenshot and stalls on template changes was found. Stub: Servex/tasks/monitor-a-playwright-agent-on-main-templ/task.jsonl:1, queued and never run.
