# Which big thing does each proposed task plainly serve? (16 tasks)

You sort; you do not build. Do NOT edit any file. This brief has everything you need: do not search the repo. Your final message is ONLY the JSON array described below (the runner saves it to `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/proposals/batches/10-priority/results.json`).

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

## The 16 tasks

1. `637b56292b` [ext] Decide how base updates propagate to extensions — public/framework/ext/Refine/doc/refined-asks.md:18 - ⬜ Decide how base updates propagate to extensions; grepped the repo for base updates: no decision record exists.
2. `1ec7d01891` [servex/lifecycle] Decide and record where the headless browser runs — Still open: public/framework/Servex/doc/refined-asks.md:19 - ⬜ Decide whether the headless instance runs on the Servex server or through the dev socket.
3. `72cb396bf0` [ext/Shots] Build a per-region visual diff filter — ext/Shots/Diff.mjs:43 - const amount = cell_diff(before, after, x0, y0, x1, y1, 0, 0); (per-region amounts, written to runs.jsonl regions)
4. `f13b662a1a` [ext/Shots] Explore whether the diff output helps Claude interpret changes, if tokens allow — ext/Shots/readme.md:28 - the diff's line-filter upgrade is recorded, not built; no test of whether diff output helps Claude interpret changes was found.
5. `b1699c63a2` [ext/Shots] Keep screenshots in a screenshot subdirectory — .gitignore:161 - **/screenshots/ (git-ignored everywhere; the dev server still serves it)
6. `8fb464eec7` [ext/Shots] Track what works and what doesn't in screenshot outcomes — ext/Shots/readme.md:16 - `class ShotsJSONL extends JSONL` (`ShotsView.js`) — reads `runs.jsonl`'s `run`/`diff`/`judge` lines into a tree.
7. `8827f1d669` [ext/Shots] Investigate how to organise rounds of screenshots — ext/Shots/readme.md:3 - keeps every round in that page's own folder, diffs each round against the one before it, and draws an overlay of what changed.
8. `b14e8f5720` [ext/Shots] Consider a diff tool that compares two screenshots and reports how close or… — public/framework/ext/Shots/readme.md:3 - draws an overlay of what changed; no closeness score is described.
9. `f1ab8d1247` [ext/Shots] Record moved edges in the Shots diff, not just changed cells — Built: the automated shoot-and-diff system exists (ext/Shots/readme.md:3). Missing: ext/Shots/readme.md:28 says the diff's line-filter upgrade (a moved edge, not just a changed cell) is recorded, not built.
10. `6ff6cb0545` [ext/Shots] Take screenshots of the sidebar variants where needed to check spacing — Not done: no sidebar-variant screenshots were found. ext/Shots is the screenshot system that would produce them.
11. `e0ff1b2eac` [core] Run the core/ merge sweep: one Sonnet minion per core directory — Not built. No merge-candidate output or minion run found. The only record is the to-do line at public/framework/ai/todo.md:159 ("Merge candidates, when tokens allow"), which the ask says nothing tracks. It is a fan-out, so check the week's usage before spawning.
12. `5f52bf8dbe` [ext] List CSS property types and the UI each one needs, from the live CSSOM — No stable property-type list in ext/CSSDoc: grepped it for property type, propertyType and stable list with no hits. CSSDoc reads rules that land on an element, not property types.
13. `e65abbfa24` [core/Page] Try resizing the columns slightly so the layout fits better — Not done: the Miller columns demo is core/Page/overview/columns/page.js, and no fit adjustment was found in it.
14. `ffed10acc7` [core/Page] Make Miller column items more compact, since two lines sit in too much space — Not done: the Refine task for this (ext/Refine/tasks/make-the-miller-columns-more-compact-sin/task.jsonl) reports no change found, and the columns demo shows no compaction.
15. `b3f82c8e54` [ai] Make the dashboard more compact — Grep for compact or dense in ai/AIDashboard found no matches, so no compact pass has landed.
16. `2699fd9561` [ai] Make the mobile sheet match the desktop AI sidebar, resizable — Grep 'mobile' in public/framework/ai/rail finds nothing; the only mobile-sheet task, ux/Dictate/tasks/make-the-sidebar-and-mobile-sheet-run-th/task.jsonl:1, is about sharing dictation code, not matching size or resizing.
