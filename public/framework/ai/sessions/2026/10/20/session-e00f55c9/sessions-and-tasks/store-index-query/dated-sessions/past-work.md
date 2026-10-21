<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Slice 2 of the store index query plan  sessions on  Dated " (words: slice, store, index, query, plan, session, dated)

## Tasks (8, best first)
- 2026-10-20 [core/Item: the store, dated index and query plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/) — The plan is written: [store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md). Not built yet. inventory: every writer and reader, file:line (section 1) class architecture: Dated + DatedFiles on Item.Store, with alternatives (section 2) … · paths 1/1 exist
- 2026-10-20 [A spawned agent's folder starts as session.jsonl (slice 3)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/requirements.md
- 2026-10-20 [dated-sessions](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/dated-sessions/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/dated-sessions/requirements.md
- 2026-10-20 [AISessionIndex: record-only sessions get a title from session.summary…](/framework/ai/sessions/2026/10/20/voice-20261020/index-record-sessions/) — Record-only (cloud voice) snapshots already landed in 6a86a5de4; this adds the title lookup (e04f922fd). Needs a dev server restart to index the cloud voice folder.
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-16 [AI: handover is a query, not a hand-written file (plan)](/framework/ai/sessions/2026/10/16/voice-20261016/handover-query/) — voice 37d0025a

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 11 files
- [ext/Query](/framework/ext/Query/) — used by 3 files
- [ext/Session](/framework/ext/Session/) — used by 9 files

## Docs and readmes
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [Handover as a query — a plan, not yet built](/framework/ai/doc/handover-query.md) — Status: plan only. Nothing here is built until the owner has seen it. Asked by voice, 2026-10-16 (question 37d0025a); task: [handover-query…
- [The AI dashboard: plan, approved page, and what slice 1 shi…](/framework/ai/doc/ai-dashboard-plan.md) — Built (slice 1, 2026-10-19): /framework/ai/ is now the dashboard; its structure is in [AIDashboard/readme.md](../AIDashboard/readme.md). Th…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Storage slice 1: give Store a backend, with zero behaviour …](/framework/core/Page/doc/storage-slice-1.md) — A brief, ready to spawn (a Sonnet minion, in a worktree). The design it starts: [storage.md](storage.md). The owner's words: asks 5 and 6 o…
- [Indexing, directory deltas and querying — the owner's quest…](/framework/core/Page/doc/indexing-2026-10-08.md) — Recorded from dictation; open architecture questions for the core page system, with what the code already shows. ## What exists (verified b…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (servex-mastermind-opus, landed)
- 2026-10-03 Now card: topics as nested sub-cards from refined prompts (raw → clean → structured), sub… (vscode-mastermind, queued)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)

## Commits
- 740cef29e dated-sessions brief: slice 2 of the store/index/query plan (sessions on Dated)
- 9e58e3f9d dated-projects brief: slice 1 of the store/index/query plan (Dated + DatedFiles for projects)
- 7ee31b90f core/Item: store-index-query plan (Dated + DatedFiles, coverage check, six slices); decision d-dated-home

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,376 tokens of reading, under the 100k limit).

Question: Slice 2 of the store/index/query plan: sessions on `Dated`

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Slice 2 of the store/index/query plan: sessions on `Dated`"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
