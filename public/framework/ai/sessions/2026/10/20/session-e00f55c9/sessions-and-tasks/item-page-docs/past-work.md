<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Item and Page readmes  one persistence system  indexing is the tool s job  JSONL growth noted" (words: item, readm, one, persistence, system, index, tool, job, jsonl, growth, noted)

## Tasks (8, best first)
- 2026-10-20 [Item and Page readmes: one persistence system; indexing is the tool's…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/requirements.md
- 2026-10-20 [Projects: a project folder, and one tool that moves it into its modul…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/project-move/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/project-move/requirements.md
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — Readmes now state structure and function. Every main system's readme states its structure and how it works: ai, ai/sessions, ai/tasks, AITask, Inbox, core/Page, Servex rewritten (framework/readme.md indexes them). No history in them: old text moved to doc/rea…
- 2026-10-16 [Item tool in-process: step 12 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/item-local/) — Landed on michael/dev as 1f4481407.
- 2026-10-16 [Item tool: step 5 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/item-tool/) — Landed on michael/dev as fd37b6efe.
- 2026-10-16 [The item tool files the references: step 16 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/tool-files-refs/) — Landed on michael/dev as ee4c71f37 and 75cbc267e.

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 39 files
- [ext/DesignTool](/framework/ext/DesignTool/) — used by 32 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 27 files
- [ext/JSONL](/framework/ext/JSONL/) — used by 46 files
- [ext/System](/framework/ext/System/) — used by 8 files
- [ui/item](/framework/ui/item/) — used by 14 files

## Docs and readmes
- [vision — screenshots × a model × a prompt, one JSONL line e…](/framework/ext/DesignTool/vision/readme.md) — ## Use bash node public/framework/ext/DesignTool/vision/run.mjs \ --pages /framework/,/framework/ui/ --widths 390,1280,3440 --regions auto …
- [AI system docs: the index](/framework/ai/doc/readme.md) — One folder per subsystem, one current doc per topic. Load the folder you need; the rest costs nothing. Superseded files sit in [archive/](a…
- [jsonl — the page.jsonl SYSTEM, not just the format](/framework/core/Page/jsonl/readme.md) — ## What A folder can hold a page.jsonl instead of a page.js: one JSON object per line, read top to bottom, no code to write. But page.jsonl…
- [System — the one page that says what the design system is, …](/framework/styles/system/readme.md) — ## Index - [studies](./studies/) — the evidence behind the design system's numbers ## Use Need a space? Type the class, never the number. j…
- [Socket — one WebSocket to the dev server; the transport eve…](/framework/dev/Socket/readme.md) — > ⚠ Converge (the owner, 2026-10-02): file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [e…
- [System — a generic container for anything we keep in order](/framework/ext/System/readme.md) — A System knows where its files live (root), its readme, its rules, and can check() itself. Not an AI thing: code, layout, readmes or an AI …
- [One word](/framework/styles/system/studies/system/readme.md) — What a page holds, declared in one word. Code: styles/system/studies/system/page.js _Stub — more to come._
- [Item architecture — a headless data node, saved as one docu…](/framework/core/Item/doc/architecture.md) — Item is one persistent thing: an id, a data bag, one set(delta), and a place to save. It runs in plain node (no DOM, no transport). Main cl…

## Sessions tagged with these words
- 2026/10/15 [README claims clarity check](/framework/ai/sessions/2026/10/15/session-799faa1d/) — kind/agent model/sonnet work/read-only task/page-system docs/readme · $0.15
- 2026/10/15 [Page owner docs claims](/framework/ai/sessions/2026/10/15/session-57f46c1a/) — kind/owner model/sonnet task/page-system docs/readme · $0.86
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/15 [Clarity trace page system](/framework/ai/sessions/2026/10/15/session-eb5e27d5/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Debug views](/framework/ai/sessions/2026/10/15/session-eafccb46/) — kind/agent model/sonnet work/read-only task/page-system · $0.14
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)

## Commits
- 7f5b7e55c accounting: R15-R17; shape.md = one session folder (Session extends Item, session.jsonl line kinds, children …
- 4aa3a71ca core/Task: a DOM-free unit of work — the base state-machine class
- e8c34f811 core/List: merge List + LiveList into one evented class
- e756032ee core/Page: four page tools (page_add/set/log/read) + page_note
- 1c6945309 framework: card size follows weight, unread badge scaffolded
- e44930ad9 page-extends-item: Page extends Item, one set(delta), Item.Store (append/tail), LiveList verbs by id, live de…
- f67d73afc openrouter: Gemini tool-schema fix + cumulative cost on openrouter agents
- 21d72df84 core/Page: document path extensions (md/, fs/, the per-page AI pair, AI/AI2 task folders); fix the empty-file…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,342 tokens of reading, under the 100k limit).

Question: Item and Page readmes: one persistence system; indexing is the tool's job; JSONL growth noted

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Item and Page readmes: one persistence system; indexing is the tool's job; JSONL growth noted"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
