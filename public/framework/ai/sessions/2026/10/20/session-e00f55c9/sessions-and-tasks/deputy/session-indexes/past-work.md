<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Sessions  every session listed  one index jsonl per scope" (words: session, every, listed, one, index, jsonl, per, scope)

## Tasks (8, best first)
- 2026-10-20 [Sessions: every session listed; one index.jsonl per scope](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-indexes/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-indexes/requirements.md
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [Item and Page readmes: one persistence system; indexing is the tool's…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/requirements.md
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-20 [Whisper page: one live demo of every Whisper answer](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/) — [The Whisper page](/framework/audio/Whisper/) is one demo: each Whisper answer arrives as a row, guesses amend themselves, the final replaces them. Merged 4ccb14de3. ![](shots/4-max-1200.png) live object log, real dictation: fake-mic run, 6 guesses → 1 final … · paths 2/2 exist
- 2026-10-16 [Refine: sentences stay tracked, one per send](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) — Refine keeps every sentence and sends them one at a time. Merged as c82cae958; reviewed: 4 fixed, 3 noted. Sentences go into the tracked structure: [Refine](/framework/ext/Refine/), shots/refine-sentences-kept-400.png - [~] Real-time refinement: instant clean… · paths 2/2 exist
- 2026-10-13 [Inbox: one record per thing, and the inbox as a timeline of big things](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-data/) — [The inbox timeline](/framework/core/Page/ext/Inbox/timeline/) is live: 1,096 things built and 70 for you, newest and most urgent first, each opening beside the rail with its card's chat. ![detail with chat](shots/localhost-61253-framework-core-Page-ext-Inbox… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Property](/framework/core/Property/) — used by 3 files
- [core/Session](/framework/core/Session/) — used by 14 files
- [ext/JSONL](/framework/ext/JSONL/) — used by 50 files
- [ext/Session](/framework/ext/Session/) — used by 11 files

## Docs and readmes
- [Core — the eight classes under every page (listed under Mor…](/framework/core/readme.md) — ## Index - [App](./App/) — boot and the one container pages mount into; you construct it once in /app.js - [Item](./Item/) — one node of a …
- [JSONL architecture — one verb per line, replayed into objec…](/framework/ext/JSONL/doc/architecture.md) — JSONL is an append-only log, one JSON object per line, replayed into a plain object. TaskJSONL is its subclass for the task manifest (ai/<d…
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [Elements architecture — one reference page per group, every…](/framework/styles/elements/doc/architecture.md) — Elements is the reference for every HTML element framework.css styles, and the ones it leaves alone. Its main file is [page.js](../page.js)…
- [Cost accounting — one log, one number](/framework/ai/AISession/doc/cost-accounting.md) — The raw Claude session log is the only source of truth. Everything else (the live page, tail.json, page.jsonl, index.json, day snapshots) i…
- [Asks about Property: 10 open, 0 done](/framework/core/Property/doc/refined-asks.md) — Generated by node Server/AskIndex.mjs from the refined asks in each session's asks.jsonl; never hand-edited. Newest first. Open ones are al…
- [Socket — one WebSocket to the dev server; the transport eve…](/framework/dev/Socket/readme.md) — > ⚠ Converge (the owner, 2026-10-02): file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [e…
- [Refined asks: one record per ask, a topic list per module, …](/framework/ext/Refine/doc/asks.md) — Code: class AskIndex in [Server/AskIndex.mjs](/Server/AskIndex.mjs), called by RefineQueue.one() after each prompt is refined. The owner's …

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)

## Commits
- a99800701 process-monitor idle: stale VS Code sessions, idle-gated game close, commit charge

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,486 tokens of reading, under the 100k limit).

Question: Sessions: every session listed; one index.jsonl per scope

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Sessions: every session listed; one index.jsonl per scope"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
