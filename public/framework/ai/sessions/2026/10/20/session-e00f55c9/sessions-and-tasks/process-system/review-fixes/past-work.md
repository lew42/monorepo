<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Review fixes for four branches" (words: review, fix, four, branch)

## Tasks (8, best first)
- 2026-10-18 [servex-small: four small Servex fixes](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/servex-small/) — Three fixes landed and one was already there; the live Servex still needs a restart by the mastermind. [x] list_agents live rows by default: already shipped in 9374a54db, default 1 row/203 B vs all 1204 rows/204 KB. [x] reply_to answered once: envelope wordin…
- 2026-10-16 [cost-fix-review](/framework/ai/sessions/2026/10/15/voice-opus/cost-fix-review/) — Approved the cost fix a392e2049 with one bug: a pre-v2 saved state with zero messages skipped the reset and threw on state.seen. Fixed by the parent (reset on version alone), cost tests 3/3, merged as 3e09dcc39.
- 2026-10-13 [AI pages: fresh-eyes review and fixes (Inbox, Sessions, session page,…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/) — Four AI pages reviewed at 400/1200/1920/3440; five fixes merged. [Models](/framework/ai/models/) drew outside its own page (header squeezed to 338 px, text over it at 400): now a normal page, tables one line per row at 1200+ [Inbox](/framework/ai/): the empty… · paths 2/2 exist
- 2026-10-12 [Today's UI: shot, read, two narrow-screen fixes](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/) — Shot 10 of today's pages at 400/1200/1920/3440 and fixed two defects. [Report](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/report.md) DataGrid demo overlap at 400: fixed (916492fc2), re-shot Refine 'Said' label squeeze at 400: fixed …
- 2026-10-04 [Dictate: four owner-visible fixes — quad bubble, mic abort, instant s…](/framework/ai/sessions/2026/10/05/dictate-fixes/dictate-fixes/) — All four owner fixes landed on michael/dev (80cb509e, b4d31f83, 4cf347ad). Review: reviewed: 1 fixed, 3 noted — [review.md](review.md). Follow-ups it flagged (abort race untraced, a fast repeat silently drops, two "landed" checks) are in [decisions.md](/frame… · paths 2/2 exist
- 2026-10-02 [merge.mjs --quick + review.mjs widthsFor — one screenshot at the widt…](/framework/ai/sessions/2026/10/01/quick-fix-path/quick-merge/) — Applied to michael/dev's working tree (not yet committed — the owner commits): widthsFor in review.mjs, and merge.mjs --quick. widthsFor(files, numstat, pages), exported from review.mjs: 1200 alone for words, all four for anything that can reshape layout, 400…
- 2026-09-30 [Voice sessions: fixed the doubled chat line, plus 10 second-review fi…](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/f-dupe-line/) — What landed: commit 1486ea2 in C:/Code/lew42/worktrees/voice-fixes. Part A, the double line on the ✦ sheet: fixed in rail.js (own_ats Set), proved with a headless run — the sentence shows once, not twice. B1 New session always starts fresh (fresh: true throug… · paths 2/2 exist
- 2026-09-30 [review-fix](/framework/ai/sessions/2026/09/30/cards-and-logs/cards-and-logs/review-fix/) — Fixed review.md items 1, 2 and 9 in the card system. (1) One shared BOXED_LEVELS=3 constant (card/depth.js) now drives both card/nesting/page.js and card/log/LogView.js, so the two nesting rules can no longer disagree; every doc that described the depth (card…

## Docs and readmes
- [Doc architecture — a module is a page with four fixed tabs](/framework/ext/Doc/doc/architecture.md) — Doc turns a module into a browsable page: Overview, API, Docs, Files, plus any declared children. It is a class, [Doc.js](../Doc.js), that …
- [Skills review, 2026-10-13: what was cut, and what still nee…](/framework/ai/doc/skills-proposals-2026-10-13.md) — The skills every agent loads had grown to 34,140 words. This review measured them by script, found the rules that disagree or describe reti…
- [Dashboard — a grid of live previews, stalled first](/framework/ai/dashboard/readme.md) — The owner's own words: "/framework/ai's default tab could show a grid-like dashboard that includes the inbox, but also the log next to it, …
- [Salvage branches: decisions, 2026-10-17](/framework/ai/doc/salvage-2026-10-17.md) — Source audit: [salvage/audit.md](../sessions/2026/10/16/voice-20261016/salvage/audit.md) (108 real unmerged branches). Full tip list kept f…
- [Quick fix](/framework/ai/quick-fix/readme.md) — The log of every small fix asked for by voice — "make this bold", "this gap is too big" — and how many seconds each one took to land. The l…
- [Decisions — how --questions reads a questions.md file witho…](/framework/ai/review/doc/decisions.md) — ## A numbered line only counts as a question if it has a rule tag .claude/skills/review/SKILL.md's own "## Load first" section is a numbere…
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [Catalog — next: previews that load in under 2 s](/framework/catalog/doc/next.md) — The ask: "a preview on the catalog page is enough to see what it looks like" — the review's test was 40 previews in under 2 s. Today they a…

## Owner asks
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-09-30 Logs: unknown verbs on AI 2; the validator checks the schema; register experiment and rev… (mastermind-servex (10 PM task, item 12), queued)

## Commits
- 742bf842e Models catalog: apply review findings (provider labels, failed runs, section order)
- e7d08a933 one-dictation/minion-core: review fixes — revert core Router nav change for a smaller rail.js fix, close a st…
- f8f21bda2 Fix DevShell: right rail at the edge, page pushed, header one line, structure populated
- 278b043c2 AI 2: review round 3 — badge hides at zero, simplify repeated CSS
- e0ca27f80 Fix round 2, Part X follow-up: refresh_nav() must reveal(), or a cold load's own rail expansion gets erased
- 848fc7760 core/Page previews: auto height at one shared zoom, tighter label gap
- 8b76ccc71 Fix round 2, Part Y: loading strip on the Overview, page_work() walks the real page tree
- baa251180 Fix round: page-system review findings 1,2,3,5,6,7,8,9,10

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,093 tokens of reading, under the 100k limit).

Question: Review fixes for four branches

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Review fixes for four branches"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
