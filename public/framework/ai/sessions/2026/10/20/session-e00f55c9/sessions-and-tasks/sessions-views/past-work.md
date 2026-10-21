<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Sessions views  study what exists  then propose the day view  the URLs and the columns  PLANNING ONLY " (words: session, view, study, exist, then, propose, day, url, column, plann, only)

## Tasks (8, best first)
- 2026-10-20 [Sessions page: local days via Day.js](/framework/ai/sessions/2026/10/20/session-e4971f1a/task-mastermind-2/) — Cherry-picked qf-7 commit 98ff1436e into michael/dev as 8f3d541dc (only AISessionsPage.js). Sessions page at scope=2026-10-20 checked at 1200: rows show, show-30-more-days present. Today button not clicked; merge.mjs not run (no dev server for qf-7).
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-16 [Session pipeline: digest.json and tags for the last 3 days](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/) — Round 4 steps 3 and 4 landed. digest.json beside each session folder, node only, add only: 587 of 607 sessions (20 have no folder yet); a second run wrote 0 and kept 587 (commit bd39fad93) tags filled for the last 3 days, newest first: procedural (kind/ model… · paths 2/2 exist
- 2026-10-13 [AI pages: fresh-eyes review and fixes (Inbox, Sessions, session page,…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/) — Four AI pages reviewed at 400/1200/1920/3440; five fixes merged. [Models](/framework/ai/models/) drew outside its own page (header squeezed to 338 px, text over it at 400): now a normal page, tables one line per row at 1200+ [Inbox](/framework/ai/): the empty… · paths 2/2 exist
- 2026-10-12 [Today's UI: shot, read, two narrow-screen fixes](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/) — Shot 10 of today's pages at 400/1200/1920/3440 and fixed two defects. [Report](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/report.md) DataGrid demo overlap at 400: fixed (916492fc2), re-shot Refine 'Said' label squeeze at 400: fixed …
- 2026-10-12 [Sessions detail: tabs, hourly cost, fixed chat](/framework/ai/sessions/2026/10/12/session-f90a4e29/sessions-detail/) — Session detail is now tabs (Conversation, Cost, Models and tokens, Related) — [layout decisions](/framework/ai/sessions/doc/ui/detail-layout.md), [models and cost](/framework/ai/sessions/doc/cost/models-and-cost.md), [state](/framework/ai/2026-10-12/sessions-…
- 2026-10-04 [Day cards: Today/Yesterday pins, by-time and by-system views, confide…](/framework/ai/sessions/2026/10/04/day-cards/day-cards/) — Landed — Today and Yesterday cards pinned in the AI inbox, each its own day page. Today/Yesterday pinned like Now, each own URL: /framework/ai2/ Day summary (cost, tasks, prompts refined) — /framework/ai/2026-10-04/ Two views + toggle, by time (default) and b… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 12 files
- [core/View](/framework/core/View/) — used by 299 files
- [ext/Session](/framework/ext/Session/) — used by 9 files

## Docs and readmes
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [The full-window view — a url, not a class](/framework/styles/layouts/doc/full-view.md) — Split out of readme.md. ## 3. "Maximize", with a router that only knows path segments Question. A layout wants to be seen without a docs co…
- [Context loss: a session's work survives only in files](/framework/ai/doc/context-loss.md) — When a Claude session ends, its context window is gone: everything it read, reasoned and was told. The next agent starts cold and knows onl…
- [What happened from Friday evening to Sunday afternoon (2026…](/framework/ai/doc/overview-2026-10-17-to-19.md) — Written for you, in the order things happened, from the last time you checked in. Every item links to its record. The numbers at the end ex…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Doc — a module documented as a page (Overview · API · Docs …](/framework/ext/Doc/readme.md) — ## Index [overview](./overview/) — the urls the Overview tab uses ## Use js export default new Doc({ meta: import.meta, title: "View", subj…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [3 — the views (moved from the readme)](/framework/ai/v/3/doc/views.md) — <!-- moved verbatim from readme.md lines 4-66, 2026-10-12 readme audit --> Four views on screen, five urls (board-declutter, 2026-09-22). E…

## Sessions tagged with these words
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/15 [Standing rules for domain masterminds](/framework/ai/sessions/2026/10/15/session-7e1f2802/) — kind/owner model/sonnet work/read-only task/standing-rules framework/sessions · $0.57
- 2026/10/15 [Spawn policy mastermind role](/framework/ai/sessions/2026/10/15/session-35ca9f31/) — kind/owner model/sonnet work/read-only task/spawn-policy framework/sessions · $0.90
- 2026/10/14 [Screenshots never committed](/framework/ai/sessions/2026/10/14/session-d60d1ad7/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim framework/sessions · $1.12
- 2026/10/14 [Sessions list page](/framework/ai/sessions/2026/10/14/session-acc3233e/) — kind/owner model/sonnet work/read-only framework/sessions · $0.24
- 2026/10/14 [Sessions page location](/framework/ai/sessions/2026/10/14/session-9d91c065/) — kind/owner model/sonnet work/read-only framework/sessions · $0.46

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)

## Commits
- 4da29b48e dictation-map brief: planning only, a thorough map; sessions-views brief queued (study, URL options, day and …

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,546 tokens of reading, under the 100k limit).

Question: Sessions views: study what exists, then propose the day view, the URLs and the columns. PLANNING ONLY.

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Sessions views: study what exists, then propose the day view, the URLs and the columns. PLANNING ONLY."

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
