<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Page  a folder with only a readme md opens as a page" (words: core, folder, only, readme, open)

## Tasks (8, best first)
- 2026-09-29 [OpenRouter brain: a folder that outlives the research](/framework/ai/sessions/2026/09/29/openrouter-brain/openrouter-brain/) — Landed: Servex/ext/openrouter/ — a fresh mastermind reads this and knows the whole OpenRouter/harness state, cited. (Servex-side, not a site page — no live URL; open the files in the repo.) readme.md, the iceberg (5–7 core concepts, one sentence + link each, … · paths 1/1 exist
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [Phone sheet: reconnects after a Servex restart, one layout that only …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/) — The phone ✦ sheet reconnects after a Servex restart, and is one three-row layout at every height. Merged 3415f5018. | Before | After | |---|---| | ![](/framework/ux/Dictate/surfaces/sheet-steps/before/sheet-003.png) | ![](/framework/ux/Dictate/surfaces/sheet-… · paths 2/2 exist
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — Readmes now state structure and function. Every main system's readme states its structure and how it works: ai, ai/sessions, ai/tasks, AITask, Inbox, core/Page, Servex rewritten (framework/readme.md indexes them). No history in them: old text moved to doc/rea…
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-13 [How a page renders: one plain doc under core/Page, linked from the re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/page-rendering/) — core/Page/doc/how-a-page-renders.md answers the owner's question (classes + helpers write the DOM; page.jsonl deltas replay into blocks on top), linked from the Page and framework readmes (7e3c10b23). Landed by the mastermind from the agent's own answer and t…
- 2026-10-03 [core/System: the module itself — readme, page.js, doc/system.md](/framework/ai/sessions/2026/09/30/ui-system/system/docs-module/) — core/System/ is now a real module, not just a class file: readme.md, page.js (a Doc documenting the System class — five live Concepts tiles linking Design/Code/UI/UX/AI, then the minimal page.js example), and doc/system.md (what a System is, the two ways to a… · paths 1/2 exist, gone: framework/core/System/
- 2026-10-01 [Probe tasks: tiny open-ended jobs that score the system on any model](/framework/ai/sessions/2026/09/30/probe-tasks/) — Probe tasks are built. The design, [probes.md](probes.md): five tiny open-ended jobs, six checks a script decides (parses, loads clean, followed the prompt, right skills, opened-logged-landed a task, linked from its parent), and every failure labelled system …

## Docs and readmes
- [Page — a folder with a page.js or a page.jsonl is a page: a…](/framework/core/Page/readme.md) — One system with Item: Page extends Item, so saving, replaying a log, set(delta) and live() tailing are the [Item readme](/framework/core/It…
- [Item — an arbitrary persistent thing: an id, a data bag, on…](/framework/core/Item/readme.md) — ## One persistence system with Page Page extends Item: [core/Item](/framework/core/Item/) and [core/Page](/framework/core/Page/) are one sy…
- [Test — node tests that run when the code they cover changes…](/framework/core/Test/readme.md) — ## Index - [Test.js](./Test.js) — class Test: ok, eq, throws, done; portable, no DOM, no node imports - [TestRunner.mjs](./TestRunner.mjs) …
- [Research — a question dug by several minions into append-on…](/framework/ext/Research/readme.md) — Two shapes, one module. A topic is one question argued to a verdict, then closed. A program is several subjects dug continuously and never …
- [Page — a folder with a page.js or page.jsonl is a page: a u…](/framework/core/Page/doc/readme-before-2026-10-19.md) — How a page renders (code with helper functions, page.jsonl deltas, or both; markdown; live updates): [doc/how-a-page-renders.md](doc/how-a-…
- [dynamic — pages nobody saved](/framework/core/Page/dynamic/readme.md) — What — a dynamic page is a url with no page.js and no folder for it on disk, that still opens, because an ancestor page's route(name) (read…
- [Navigation — persistent vs switching, the levels that stack…](/framework/core/Page/navigation/readme.md) — The owner's own question, 2026-09-29: "is there persistent navigation?" — that's the one thing to get right. [Live page](/framework/core/Pa…
- [parts — a page whose body is a list of parts, stored as lin…](/framework/core/Page/parts/readme.md) — Live: [/framework/core/Page/parts/](/framework/core/Page/parts/) (seed, with an add, a move and a remove already appended) and [/framework/…

## Sessions tagged with these words
- 2026/10/15 [README claims clarity check](/framework/ai/sessions/2026/10/15/session-799faa1d/) — kind/agent model/sonnet work/read-only task/page-system docs/readme · $0.15
- 2026/10/14 [Unreferenced census fix](/framework/ai/sessions/2026/10/14/session-009d74f3/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim docs/readme · $0.14
- 2026/10/13 [Readme upkeep](/framework/ai/sessions/2026/10/13/session-87444cb4/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim docs/readme · $0.34
- 2026/10/13 [Site reach refresh](/framework/ai/sessions/2026/10/13/session-56b08fec/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim docs/readme · $0.46
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02

## Owner asks
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)

## Commits
- 64bc83039 task-queue.md: storage decided with mastermind-page (the role's own task folder named once; sessions referenc…
- 21d72df84 core/Page: document path extensions (md/, fs/, the per-page AI pair, AI/AI2 task folders); fix the empty-file…
- 1bd278a93 Fix round 2, Part X: one nav rule, no blind probes, tabs redraw live
- 29c953bbd switcher: real code in the tree skin, pattern above the fold, no panel chrome, sticky-header proof
- 67aa26895 PageFiles: a folder that arrives by a git merge now gets its own log
- e9f4ddd9f page.jsonl: every covered folder gets its own listing log, not just hand-made ones
- d253907fc Readers use each folder's page.jsonl instead of directory.json
- baa251180 Fix round: page-system review findings 1,2,3,5,6,7,8,9,10

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: core/Page: a folder with only a readme.md opens as a page

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Page: a folder with only a readme.md opens as a page"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
