<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Slice 3 of the store index query plan  queries through  Dated  and the  in flight  page" (words: slice, store, index, query, plan, queri, through, dated, flight)

## Tasks (8, best first)
- 2026-10-20 [core/Item: the store, dated index and query plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/) — The plan is written: [store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md). Not built yet. inventory: every writer and reader, file:line (section 1) class architecture: Dated + DatedFiles on Item.Store, with alternatives (section 2) … · paths 1/1 exist
- 2026-10-20 [dated-queries](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/dated-queries/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/dated-queries/requirements.md
- 2026-10-16 [AI: handover is a query, not a hand-written file (plan)](/framework/ai/sessions/2026/10/16/voice-20261016/handover-query/) — voice 37d0025a
- 2026-10-13 [Readmes: all under 100 lines, every module indexed](/framework/ai/sessions/2026/10/12/session-87bec773/readme-audit/) — Readme audit landed on michael/dev — 13 oversized readmes trimmed to under 100 lines, 93 unlisted modules now indexed, dead links 41 down to 26. Bodies moved verbatim to doc/; nothing lost. Script lists line counts, dead links, unindexed modules: audit.mjs, r… · paths 1/2 exist, gone: framework/ai/handover
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-13 [framework/ai: date folders gone for good, one tree decided](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store/) — No date folder left in framework/ai, and none can come back; old links still open. date directory cleaned up: 8 folders moved by script (831 files, verify 0 bad, undo tested first), 71 links relinked it can't come back: every writer goes through TaskDirs, whi… · paths 1/1 exist
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-13 [Page storage: class architecture for many stores (design)](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/storage-design/) — Page storage designed: the page keeps its lines through one Store, and where they live becomes swappable. [storage.md](/framework/core/Page/md/doc/storage/) · first slice, ready to spawn: [storage-slice-1.md](/framework/core/Page/md/doc/storage-slice-1/) clas… · paths 0/2 exist, gone: framework/core/Page/md/doc/storage/ framework/core/Page/md/doc/storage-slice-1/

## Modules that exist now (files outside the module that import it)
- [ext/Query](/framework/ext/Query/) — used by 3 files

## Docs and readmes
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [Handover as a query — a plan, not yet built](/framework/ai/doc/handover-query.md) — Status: plan only. Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query…
- [The AI dashboard: plan, approved page, and what slice 1 shi…](/framework/ai/doc/ai-dashboard-plan.md) — Built (slice 1, 2026-10-19): /framework/ai/ is now the dashboard; its structure is in [AIDashboard/readme.md](../AIDashboard/readme.md). Th…
- [Storage slice 1: give Store a backend, with zero behaviour …](/framework/core/Page/doc/storage-slice-1.md) — A brief, ready to spawn (a Sonnet minion, in a worktree). The design it starts: [storage.md](storage.md). The owner's words: asks 5 and 6 o…
- [Indexing, directory deltas and querying — the owner's quest…](/framework/core/Page/doc/indexing-2026-10-08.md) — Recorded from dictation; open architecture questions for the core page system, with what the code already shows. ## What exists (verified b…
- [Query: architecture and decisions (2026-10-12)](/framework/ext/Query/doc/architecture.md) — Plan: [server-query plan](/framework/ai/sessions/2026/10/12/session-87bec773/server-query/plan.md). The ask: node holds the data, the brows…
- [Owner notes, 2026-10-16: indexing and finding past work (di…](/framework/ai/doc/owner-2026-10-16-indexing.md) — Not a plan, not approved. The owner's words condensed. Related: past-work-index.md (by task), readmes.md, module-homes.md. ## Every directo…
- [The search index](/framework/core/Sidebar/doc/index.md) — Sidebar.index() walks the page tree once and caches { text, href, trail } per page; a query filters it and ranked() sorts it. ## Size (2026…

## Sessions tagged with these words
- 2026/10/15 [Handover query planning](/framework/ai/sessions/2026/10/15/session-83edac7a/) — kind/owner model/sonnet task/handover-query framework/digest · $2.11

## Owner asks
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (servex-mastermind-opus, landed)
- 2026-10-03 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (vscode-mastermind, queued)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)
- 2026-10-18 Logs: validated writes only; shell appends to .jsonl blocked (?, tracked)

## Commits
- 92799307c dated-queries brief: slice 3 of the store/index/query plan (one index feeds the grid, the CLI and an in-fligh…
- 740cef29e dated-sessions brief: slice 2 of the store/index/query plan (sessions on Dated)
- 9e58e3f9d dated-projects brief: slice 1 of the store/index/query plan (Dated + DatedFiles for projects)
- 7ee31b90f core/Item: store-index-query plan (Dated + DatedFiles, coverage check, six slices); decision d-dated-home

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,376 tokens of reading, under the 100k limit).

Question: Slice 3 of the store/index/query plan: queries through `Dated`, and the "in flight" page

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Slice 3 of the store/index/query plan: queries through `Dated`, and the \"in flight\" page"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
