<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "AI index  rename  state  to  index  by script  every reader updated" (words: index, rename, state, script, every, reader, updated)

## Tasks (8, best first)
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — Readmes now state structure and function. Every main system's readme states its structure and how it works: ai, ai/sessions, ai/tasks, AITask, Inbox, core/Page, Servex rewritten (framework/readme.md indexes them). No history in them: old text moved to doc/rea…
- 2026-10-13 [Readmes: all under 100 lines, every module indexed](/framework/ai/sessions/2026/10/12/session-87bec773/readme-audit/) — Readme audit landed on michael/dev — 13 oversized readmes trimmed to under 100 lines, 93 unlisted modules now indexed, dead links 41 down to 26. Bodies moved verbatim to doc/; nothing lost. Script lists line counts, dead links, unindexed modules: audit.mjs, r… · paths 1/2 exist, gone: framework/ai/handover
- 2026-10-03 [AI cost on every page: a script, a reader, a header line](/framework/ai/sessions/2026/10/03/list-events/page-ai-cost/) — Server/page-ai-cost.mjs landed — splits each task's cost evenly across the pages it touched, writes it onto each page's own log (law 7: never recomputed). walks every task log, reuses cost_usd: [page-ai-cost.mjs](/framework/Server/page-ai-cost.mjs) a reader: … · paths 3/4 exist, gone: framework/Server/page-ai-cost.mjs
- 2026-10-20 [ai-index-rename](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/ai-index-rename/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/ai-index-rename/requirements.md
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-14 [Scripts: the last four function bags are classes; two Servex cores ha…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-rename-5/) — AskEach, Browser, Collab, Decide are classes (merged fe2728518, case fix after); callers relinked, outputs identical to the old files, undo proven on a copy; Agents.js and directory.js have a plan in Servex/agents/doc/class-plan.md, decision d-agents-director…
- 2026-10-13 [scripts-rename-1](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-rename-1/) — Five scripts renamed to their class names — CardCheck, ArchiveSessions, HttpsCert, AntigravityUsage, BrowserCheck, by the new reusable Server/RenameScript.mjs (manifest + exact undo, proven on a worktree copy). Bags are classes, old exports aliased until 2026…

## Modules that exist now (files outside the module that import it)
- [ux/Rename](/framework/ux/Rename/) — used by 1 files

## Docs and readmes
- [One state of everything](/framework/ai/doc/one-state.md) — What you asked for (2026-10-17, 22:50): one coherent data structure, sessions plus module tasks, that represents the current state of every…
- [Every new class ships a view of its state](/framework/code/objects/doc/views.md) — "I want to see as much of the data as possible to start trying to understand the internal workings" (the owner, 2026-09-29). Show the essen…
- [Objects — object-oriented design: every class ships a view …](/framework/code/objects/readme.md) — "I want to see as much of the data as possible to start trying to understand the internal workings" (the owner, 2026-09-29). A class here i…
- [Owner notes, 2026-10-16: indexing and finding past work (di…](/framework/ai/doc/owner-2026-10-16-indexing.md) — Not a plan, not approved. The owner's words condensed. Related: past-work-index.md (by task), readmes.md, module-homes.md. ## Every directo…
- [Research — a question dug by several minions into append-on…](/framework/ext/Research/readme.md) — Two shapes, one module. A topic is one question argued to a verdict, then closed. A program is several subjects dug continuously and never …
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Whisper log: every event, numbered (2026-10-16)](/framework/audio/Whisper/doc/whisper-log.md) — What it is. [WhisperLog](/framework/audio/Whisper/log/) (WhisperLog.js) writes one line for everything between the microphone and the Clean…
- [Task — a DOM-free unit of work: id, title, a state machine,…](/framework/core/Task/readme.md) — ## Status (verified 2026-10-19 against the code) - Built and tested: the state machine, subtasks, replay of task.jsonl (node Task.test.mjs,…

## Sessions tagged with these words
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/13 [Repo slim: AI system, architecture, assistant cha…](/framework/ai/sessions/2026/10/13/session-decd2604/) — kind/owner model/haiku work/read-only servex/transcripts · $0.18

## Owner asks
- 2026-10-12 Why the site crashes during transcription and reload (mastermind-transcription-crash, landed)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,216 tokens of reading, under the 100k limit).

Question: AI index: rename "state" to "index", by script, every reader updated

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "AI index: rename \"state\" to \"index\", by script, every reader updated"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
