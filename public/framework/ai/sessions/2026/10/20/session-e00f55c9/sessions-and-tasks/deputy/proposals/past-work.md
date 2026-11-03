<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The 230 proposed tasks  sort them under the three priorities  accept what plainly serves one  park the rest" (words: 230, proposed, task, sort, them, under, three, prioriti, accept, plainly, serv, one, park, rest)

## Tasks (8, best first)
- 2026-10-20 [Phone sheet: reconnects after a Servex restart, one layout that only …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/) — The phone ✦ sheet reconnects after a Servex restart, and is one three-row layout at every height. Merged 3415f5018. | Before | After | |---|---| | ![](/framework/ux/Dictate/surfaces/sheet-steps/before/sheet-003.png) | ![](/framework/ux/Dictate/surfaces/sheet-… · paths 2/2 exist
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-16 [Servex checkup: nudge verified, skill tool and task.home built, dorma…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-servex/) — Compaction nudge verified on dev and logged needs_restart; helper-cost-fix stopped; expensive dormant agents left dormant with a read-don't-wake rule; skill tool and spawn task.home built; per-prompt door answered (ask_mastermind); coordination rule added to …
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-13 [Git status: the log sweeper now covers every record kind; a Servex re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tidy-git-status/) — The sweeper's allowlist is widened and today's dirty records are committed; it runs only after a Servex restart. Landed by the mastermind from the agent's own answer (the agent ended without a landing line). LogSweeper ALLOW widened (sessions day index.json, …
- 2026-10-13 [Scripts census: 193 scripts under Server and Servex classified; 1 sta…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-census/) — Every script under Server/, Servex/ and the hooks is listed with what it is, who calls it and its verdict: 193 scripts, 1 stale, 26 misnamed (classes in lowercase files or function bags), the rest live or hand-run tools. Committed 66b6b048e on michael/dev; th…
- 2026-10-13 [Undone to tasks: 229 verified-undone asks are idle tasks in their mod…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-to-tasks/) — 229 tasks created and 229 asks now link to them (229 minus 0 that already had one). 0 were already tracked, 0 had no module. Each ask on the undone-asks page links its task; /tasks/ shows them folded per module. node Server/UndoneToTasks.mjs --plan / --apply … · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 758 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme
- [ux/tasks](/framework/ux/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Core — the eight classes under every page (listed under Mor…](/framework/core/readme.md) — ## Index - [App](./App/) — boot and the one container pages mount into; you construct it once in /app.js - [Item](./Item/) — one node of a …
- [JSONL — append-only .jsonl logs the AI blindly appends to, …](/framework/ext/JSONL/readme.md) — > Converge: how a .jsonl is written, read and indexed is one system: [core/Page/doc/jsonl.md](/framework/core/Page/doc/jsonl.md) ("The stor…
- [Undone asks, 2026-10-17: 620 of 1,150 have no landing, and …](/framework/ai/doc/undone-asks-2026-10-17.md) — The page is [/framework/ai/asks/undone/](/framework/ai/asks/undone/); the numbers come from node Server/UndoneAsks.mjs --json (class Undone…
- [audio — three building blocks for anything with a microphone](/framework/audio/readme.md) — Three small classes, each a build block: [MicStream](./MicStream/) opens the microphone and hands out its live stream, raw samples, level, …
- [LayoutRules — three, because CSS answers the rest](/framework/core/Layout/doc/rules.md) — The defaults are accepts: "any" and allowed_in: "any". A layout that says nothing restricts nothing and goes anywhere. The owner: *you don'…
- [Process — a task whose children are named phases, and node …](/framework/core/Task/doc/process.md) — The name's scope: here a process is a *way of working* (a Task subclass). Not Servex/Process.js (one supervised child program, such as a de…
- [Refine: dictation to cards and tasks — the six subtasks, in…](/framework/ext/Refine/tasks/refine-dictation-to-cards-and-tasks/readme.md) — Source: the owner's dictations of 2026-10-16 (ext/Refine/doc/card-types.md, including the night addendum "one assistant, one pass, by sente…
- [Saver architecture — one write queue under three methods, b…](/framework/ext/Saver/doc/architecture.md) — Saver is where a JSON document goes: save(item), load(), delete(). The base class holds only the write queue ([Saver.js](../Saver.js)); eac…

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27

## Owner asks
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, landed)
- 2026-10-03 Servex: Playwright Chrome logged + reaped; one warm shared browser with check_page (task-mastermind-playwright-reap, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,285 tokens of reading, under the 100k limit).

Question: The 230 proposed tasks: sort them under the three priorities, accept what plainly serves one, park the rest

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The 230 proposed tasks: sort them under the three priorities, accept what plainly serves one, park the rest"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
