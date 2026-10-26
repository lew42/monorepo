<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "session flow  answer the review  fixes 1  2  3  notes 5  6  8  10 " (words: session, flow, answer, review, fix, not)

## Tasks (8, best first)
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist
- 2026-10-13 [AI pages: fresh-eyes review and fixes (Inbox, Sessions, session page,…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/) — Four AI pages reviewed at 400/1200/1920/3440; five fixes merged. [Models](/framework/ai/models/) drew outside its own page (header squeezed to 338 px, text over it at 400): now a normal page, tables one line per row at 1200+ [Inbox](/framework/ai/): the empty… · paths 2/2 exist
- 2026-10-16 [Sessions and accounting checkup: commit rule, cost fix proven, usage …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sessions/) — Four tasks finished, one closed; one Servex restart needed. accounting R1-R17: closed, one verdict each, recorded in the AISession module cost fix: recost of 2026-10-16 is 86.3706 before and after over 219 sessions; needs a Servex restart to be live usage pac… · paths 1/1 exist
- 2026-10-13 [Skills: 19% fewer words, 5 conflicts fixed](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/skills-review/) — Skills review: 34,140 → 27,522 words (−19%), 5 conflicts fixed, the rest proposed. [Proposals](/framework/ai/doc/skills-proposals-2026-10-13.md) · [census before](census-before.md) · [census after](census-after.md) measure by script: Server/SkillCensus.mjs, 3…
- 2026-10-12 [Sessions detail: tabs, hourly cost, fixed chat](/framework/ai/sessions/2026/10/12/session-f90a4e29/sessions-detail/) — Session detail is now tabs (Conversation, Cost, Models and tokens, Related) — [layout decisions](/framework/ai/sessions/doc/ui/detail-layout.md), [models and cost](/framework/ai/sessions/doc/cost/models-and-cost.md), [state](/framework/ai/2026-10-12/sessions-…
- 2026-10-12 [Sessions: rows come from a node query, not every file](/framework/ai/sessions/2026/10/12/session-87bec773/server-query/) — Sessions now asks node for the rows it shows — default on the dev socket; ?source=files keeps the old path. node holds the data, socket query API: [ext/Query](/framework/ext/Query/), 30–40 ms per query client gets only what it shows: heap 33 → 17 MB, socket 9… · paths 1/1 exist
- 2026-10-12 [sessions-fixes](/framework/ai/sessions/2026/10/12/session-87bec773/sessions-fixes/) — Sessions page fixes, by ask (see [STATE.md](STATE.md), shots in [layout-check/](layout-check/)): 404 on ai/2026-10-11/files.jsonl gone: the rail skips days the ai/ index does not list. Missing page.jsonl as a quiet empty result: not stated as proven. 3440: ta…
- 2026-10-12 [Today's UI: shot, read, two narrow-screen fixes](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/) — Shot 10 of today's pages at 400/1200/1920/3440 and fixed two defects. [Report](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/report.md) DataGrid demo overlap at 400: fixed (916492fc2), re-shot Refine 'Said' label squeeze at 400: fixed …

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 13 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [Session — one ✦ press is one voice session, answered by a f…](/framework/ext/Session/readme.md) — A session starts on the page you are on (its home), follows you from page to page, and keeps everything in one dated folder: /framework/ai/…
- [Undone asks, 2026-10-17: 620 of 1,150 have no landing, and …](/framework/ai/doc/undone-asks-2026-10-17.md) — The page is [/framework/ai/asks/undone/](/framework/ai/asks/undone/); the numbers come from node Server/UndoneAsks.mjs --json (class Undone…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [Preview levels — the three sizes any class view comes in](/framework/ext/panel2/doc/preview-levels.md) — A house rule, not a component: nothing in Panel2.js enforces this today, and nothing has to — it is the three answers worth knowing before …
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [Skills review, 2026-10-13: what was cut, and what still nee…](/framework/ai/doc/skills-proposals-2026-10-13.md) — The skills every agent loads had grown to 34,140 words. This review measured them by script, found the rules that disagree or describe reti…
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [Decisions](/framework/ext/Session/doc/decisions.md) — ## Open - CSS prefix session- is not yet in public/framework/styles/css-scopes.txt (outside this task's fence). page.js and Session.css alr…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)

## Commits
- 6c4d92f6a Dictate page becomes the workbench: chat() demo, keep option, shared New session button, composer redesign

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,048 tokens of reading, under the 100k limit).

Question: session-flow: answer the review (fixes 1, 2, 3; notes 5, 6, 8, 10)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "session-flow: answer the review (fixes 1, 2, 3; notes 5, 6, 8, 10)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
