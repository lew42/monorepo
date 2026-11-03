<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Slice 1 of the store index query plan   Dated     DatedFiles  for projects only" (words: slice, store, index, query, plan, dated, datedfil, project, only)

## Tasks (8, best first)
- 2026-10-20 [core/Item: the store, dated index and query plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/) — The plan is written: [store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md). Not built yet. inventory: every writer and reader, file:line (section 1) class architecture: Dated + DatedFiles on Item.Store, with alternatives (section 2) … · paths 1/1 exist
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-20 [Projects: Project class and ProjectMove tool](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/project-move/) — Project replays project.jsonl with completion 0..1 (9/9 tests); Server/ProjectMove.mjs + move_project moved a real project with dry run, index lines in both days, session pointer, and --undo; plan for the module tasks written. Merged ded93a90e by fast-forward…
- 2026-10-20 [dated-projects](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/dated-projects/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/dated-projects/requirements.md
- 2026-10-20 [AISessionIndex: record-only sessions get a title from session.summary…](/framework/ai/sessions/2026/10/20/voice-20261020/index-record-sessions/) — Record-only (cloud voice) snapshots already landed in 6a86a5de4; this adds the title lookup (e04f922fd). Needs a dev server restart to index the cloud voice folder.
- 2026-10-17 [Socket: a phone may run read-only queries, so Last landed and Waiting…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/mobile-socket/) — A LAN peer can now ask the socket for the task tree; commands are still refused. one list in [Socket.js](/framework/dev/Socket/): LAN_OK gains query, and LAN_QUERY names the only two sources a phone may ask (sessions, tasks); rule in [lan.md](/framework/dev/S… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [ext/Query](/framework/ext/Query/) — used by 3 files

## Docs and readmes
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [Handover as a query — a plan, not yet built](/framework/ai/doc/handover-query.md) — Status: plan only. Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query…
- [The AI dashboard: plan, approved page, and what slice 1 shi…](/framework/ai/doc/ai-dashboard-plan.md) — Built (slice 1, 2026-10-19): /framework/ai/ is now the dashboard; its structure is in [AIDashboard/readme.md](../AIDashboard/readme.md). Th…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Storage slice 1: give Store a backend, with zero behaviour …](/framework/core/Page/doc/storage-slice-1.md) — A brief, ready to spawn (a Sonnet minion, in a worktree). The design it starts: [storage.md](storage.md). The owner's words: asks 5 and 6 o…
- [Query: architecture and decisions (2026-10-12)](/framework/ext/Query/doc/architecture.md) — Plan: [server-query plan](/framework/ai/sessions/2026/10/12/session-87bec773/server-query/plan.md). The ask: node holds the data, the brows…
- [Research architecture — append-only files, validated in cod…](/framework/ext/Research/doc/architecture.md) — Research lets several minions dig a question into append-only log files that a page renders as they grow. Two shapes share one module: a to…
- [Indexing, directory deltas and querying — the owner's quest…](/framework/core/Page/doc/indexing-2026-10-08.md) — Recorded from dictation; open architecture questions for the core page system, with what the code already shows. ## What exists (verified b…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Dictate framework component](/framework/ai/sessions/2026/10/16/session-e99e8190/) — kind/owner model/sonnet work/read-only · $0.13
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00

## Owner asks
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (servex-mastermind-opus, landed)
- 2026-10-18 Logs: validated writes only; shell appends to .jsonl blocked (?, tracked)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-10-03 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (vscode-mastermind, queued)

## Commits
- 9e58e3f9d dated-projects brief: slice 1 of the store/index/query plan (Dated + DatedFiles for projects)
- 7ee31b90f core/Item: store-index-query plan (Dated + DatedFiles, coverage check, six slices); decision d-dated-home

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,342 tokens of reading, under the 100k limit).

Question: Slice 1 of the store/index/query plan: `Dated` + `DatedFiles` for projects only

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Slice 1 of the store/index/query plan: `Dated` + `DatedFiles` for projects only"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
