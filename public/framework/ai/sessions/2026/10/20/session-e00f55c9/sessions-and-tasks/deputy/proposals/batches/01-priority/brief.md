# Which big thing does each proposed task plainly serve? (25 tasks)

You sort; you do not build. Do NOT edit any file. This brief has everything you need: do not search the repo. Your final message is ONLY the JSON array described below (the runner saves it to `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/proposals/batches/01-priority/results.json`).

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

1. `27b7b9dce2` [core/Page/Template] Templates: weight per use, use-template skill/tool, one library — Not built. core/Page/tasks/templates-weight-per-use-use-template-sk/task.jsonl:1 is an orphan stub, queued and never run. core/Page/weight/weight.js weights whole pages, not uses of a template. Duplicate of ask 7.
2. `004aceea13` [ext/Ask] Selection: tap to select and drill down on mobile; the AI knows the element — public/framework/ext/Ask/readme.md:13 - pick() is crosshair mode; the AI-knows-the-element half is built. No tap-to-select or drill-down path for mobile found in ext/Ask.
3. `a7ca8acdf1` [ai/AITask] Task pages: grey checkboxes, full-width bars, reports as free content — public/framework/ai/AITask/ai.css:485 mentions full-width bars only in a comment; a search of ai/AITask finds no checkbox, and reports as free content not found.
4. `70bf778249` [ai] Build a Proposal class: review, decide, and turn decisions into tasks — No class Proposal in public/framework source; a grep for 'class Proposal' only hits ai/sessions proposal-flow notes and page task.jsonl files. Node-led loop and architect proposal not found.
5. `2d0ba87413` [design/layout] Write the per-grid-item wrapper rule for percentage padding — Partly there. design/layout/doc/rules.md:145 - cap above ~1400px, so `× 1.3` is 3.38em at 3440 — and `--pad`, a % of the containing. The wrapper-per-grid-item rule is not written. Duplicate of ask 11.
6. `2058ee1d02` [styles/layouts] Framework home: grids without voids, explicit layout classes, layout labels — public/framework/page.js:189 - // `.flow` children take the measure. It used to be four inline styles. That cleanup started; grids without voids and layout labels were not found.
7. `f2c4dc7b8d` [ai/now] Now card: nested topic sub-cards from refined prompts, updated marks — A grep of ai/now for nested, updated, sub-card and refine returns no matches (files: AINow.js, page.js, readme.md). Now card in the inbox list also not found.
8. `c1c74db34c` [code/objects] Give AI sessions and tasks the same live instance view as pages — public/framework/code/objects/readme.md:4 says a class is not done until it shows an instance. track() is used in core/Page/Page.class.js and ux/Content/Object, and no ai/ file was found in the track( search.
9. `1eff0f8a9e` [ext/Doc] Add architecture.md to every module that lacks one — architecture.md exists in about 100 doc/ folders (e.g. public/framework/core/Page/doc/architecture.md). ext/Refine and ai/AIDashboard have none.
10. `8d842d4402` [library] Give everything a URL and tags so it can be filtered — public/framework/library/ has no tags (a search for tags found none), so the library cannot filter by them.
11. `f4a7d393bc` [core/Page/navigation] Possibly unify navigation so new things are added to it automatically — Recommended at public/framework/core/Page/doc/indexing-2026-10-08.md:34-41 (children auto built in Page.declare); not confirmed built. OrphanCheck is only a warning in merge.mjs (line 41).
12. `bdb6d3e654` [ai/system] Document all the moving parts of the system — public/framework/ai/systems-map.md:5-20 lists 14 systems; there is no row for Server/, core/Task, or ai/asks. Document every moving part there.
13. `36f375e8e6` [core/Page/ext] Try the rail technique: give the inbox left sidebar container the same light… — core/Page/ext/Inbox/timeline/landings.jsonl:1283 - Rail and detail share one light gray ground; rows white; scrollbar transparent until hover (ux/Inbox/Inbox.css).
14. `3ebf381426` [core/Page/ext] Make the cards and the rail's sticky header white — ux/Inbox/Inbox.css:438 - background: var(--surface); /* white on the rail's gray ground */
15. `d73b654d14` [ux/Inbox] Make the rail scroll bar fully transparent until the rail is hovered — ux/Inbox/Inbox.css:413 - Thin, and invisible until the rail is hovered: only the colour changes, so nothing jumps.
16. `7da95af28d` [ux/Inbox] Make the scroll bar thin, if it is not already — ux/Inbox/Inbox.css:414 - scrollbar-width: thin;
17. `b8452c9779` [ux/Inbox] Give the scroll bar the same background colour as the detail side — ux/Inbox/Inbox.css:415 - scrollbar-color: transparent transparent; (the track is transparent, so the rail's gray shows through)
18. `9ff8e63bd5` [ux/Inbox] Work out how the rail should behave on mobile, since the owner is not sure — ux/Inbox/Inbox.css:682 - Below 40em each level is its own screen: the rail, then a row's page, then a sub-page.
19. `a52f51233b` [ux/Inbox] On mobile, make the rail a full-width page that opens the detail page on click — ux/Inbox/Inbox.css:686 - .inbox-shell { grid-template-columns: minmax(0, 1fr); } (inside @media (width < 40em), with the detail shown and the rail hidden when a row is open at 689-690)
20. `1c19754940` [ext/Query] Explore using the server as an in-memory database for page data — ext/Query/readme.md:3 - node runs it over items it already holds in memory
21. `3decf146c1` [ext/Query] Render query rows on the server, not only query them — ext/Query/QueryServer.mjs:41 - query.run(src.items(), src.arrange): the querying is node-side; no server-side row rendering found in ext/Query.
22. `ef346bb7e4` [code/performance] Is querying in Node actually faster than querying in the browser — ext/Query/readme.md:12 - Numbers: [code/performance/doc/server-query.md] (the comparison is recorded there)
23. `db022dffa7` [code/performance] Cut client subscriptions on session pages for phones — grep for 'subscri' in code/performance finds no matches; no subscription reduction exists under the performance system.
24. `d05a122d41` [core] Every core module gets an inbox — An inbox exists only in core/Page (core/Page/inbox.jsonl, PageInbox.js); other core modules such as core/Item/readme.md and core/Task/readme.md mention inbox only in docs.
25. `2cbc723ba6` [core/Page/ext] Inbox shows a live interaction about a specific thing — core/Page/ext/Inbox/Rail.js:28 - watching: detail pages on screen, each redrawn from the list; no live exchange about one item was found in core/Page/ext/Inbox.
