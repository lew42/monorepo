<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Documentation  every main system s readme states its structure and how it works  no history  no audits needed again" (words: documentation, every, main, system, readme, stat, structure, work, history, audit, needed, again)

## Tasks (8, best first)
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — (no outcome logged)
- 2026-10-15 [framework/ai: readme smoke-test rule, logging, tags, asked-for summary](/framework/ai/sessions/2026/10/15/voice-20261015/ai-system/) — Rule added to the mastermind skill; framework/ai readmes audited (3 fixes, rest listed); append.mjs now stamps every line; in-memory query exists (SessionIndex + ext/Query), tags recommended; node Server/Asked.mjs answers 'didn't I ask for X?'. · paths 1/1 exist
- 2026-10-13 [Readmes: all under 100 lines, every module indexed](/framework/ai/sessions/2026/10/12/session-87bec773/readme-audit/) — Readme audit landed on michael/dev — 13 oversized readmes trimmed to under 100 lines, 93 unlisted modules now indexed, dead links 41 down to 26. Bodies moved verbatim to doc/; nothing lost. Script lists line counts, dead links, unindexed modules: audit.mjs, r… · paths 1/2 exist, gone: framework/ai/handover
- 2026-09-21 [mastermind-sonnet-run](/framework/ai/sessions/2026/09/19/mastermind-sonnet-run/) — Stood down by the owner after they committed the repo (3e9536d4, working tree clean). That was item 1 on their list for two days and it unblocks the worktree workflow they asked for this morning. Eight tasks landed today: ai-front (stopped mid-flight, its wor… · paths 2/2 exist
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-15 [past-work-audits](/framework/ai/sessions/2026/10/15/voice-opus/past-work-audits/) — The three audits, described — day audit 2026-10-03 is one JSON array of 22 task records (not a file per task); branch audit 2026-10-13 is classify.json (141 branches) + absent.json + moved.json (44 each); no 2026-10-13 readme audit exists, the nearest is 2026…
- 2026-10-13 [mastermind-repo-slim](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/) — Mastermind run 2026-10-13: back the monorepo up to the E drive, clean up 51 stale worktrees (24 GB), audit what is committed and plan the repo slimming, inbox dual ranking, keep git status clean, follow up on past work, pace to ~95% of the week. Verbatim dict…
- 2026-10-12 [Page: open-work line on every page, weight on any object](/framework/ai/sessions/2026/10/12/session-a2bdd14b/page-context-asks/) — Every page now shows its open tasks, and any object can carry a weight. #6 open tasks per page: a "N open tasks on this page" line on every Page and Doc page, from computed ai/page-work.json — [page-work-line.md](/framework/core/Page/ai/doc/page-work-line.md)… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [ext/filesystem](/framework/ext/filesystem/) — used by 27 files
- [ext/System](/framework/ext/System/) — used by 8 files
- [ui/stats](/framework/ui/stats/) — used by 25 files

## Docs and readmes
- [Audit — every page layout in use, most-used first](/framework/core/Page/audit/readme.md) — Live: [/framework/core/Page/audit/](/framework/core/Page/audit/). Every page the site links to, crawled headless and given one layout by it…
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [filesystem — the DATA behind every file on the site: FsFile…](/framework/ext/filesystem/readme.md) — > ⚠ Converge (the owner, 2026-10-02): file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [e…
- [Objects — object-oriented design: every class ships a view …](/framework/code/objects/readme.md) — "I want to see as much of the data as possible to start trying to understand the internal workings" (the owner, 2026-09-29). A class here i…
- [Shell — five optional regions around a CSS grid: header, le…](/framework/core/Shell/readme.md) — ## Use js import { Shell } from "/framework/core/Shell/Shell.js"; new Shell({ header(){ /* a thin line — path, buttons */ }, left(){ /* a s…
- [System — a generic container for anything we keep in order](/framework/ext/System/readme.md) — A System knows where its files live (root), its readme, its rules, and can check() itself. Not an AI thing: code, layout, readmes or an AI …
- [One state of everything](/framework/ai/doc/one-state.md) — What you asked for (2026-10-17, 22:50): one coherent data structure, sessions plus module tasks, that represents the current state of every…
- [audit/browsable — the prime objective's scorecard: how deep…](/framework/audit/browsable/readme.md) — ## Use findings.json is the generated baseline; page.js only renders it, so every number moves when it is regenerated: js const { totals, b…

## Sessions tagged with these words
- 2026/10/15 [README claims clarity check](/framework/ai/sessions/2026/10/15/session-799faa1d/) — kind/agent model/sonnet work/read-only task/page-system docs/readme · $0.15
- 2026/10/15 [Clarity refine audit](/framework/ai/sessions/2026/10/15/session-f2708f57/) — kind/agent model/sonnet work/read-only task/refine-audit framework/refine · $0.14
- 2026/10/15 [Clarity trace page system](/framework/ai/sessions/2026/10/15/session-eb5e27d5/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Debug views](/framework/ai/sessions/2026/10/15/session-eafccb46/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Voice system requirements](/framework/ai/sessions/2026/10/15/session-c55bafbb/) — kind/agent model/sonnet work/read-only task/ai-system · $0.15

## Owner asks
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (servex-mastermind-opus, landed)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 AI: /framework/ai/ becomes the AI system's home, stale page deleted (task-mastermind-ai-page, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,206 tokens of reading, under the 100k limit).

Question: Documentation: every main system's readme states its structure and how it works, no history, no audits needed again

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Documentation: every main system's readme states its structure and how it works, no history, no audits needed again"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
