<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Task system  what exists  how tasks link to sessions and modules  the gaps" (words: task, system, exist, link, session, modul, gap)

## Tasks (8, best first)
- 2026-10-19 [Task system: what exists, how tasks link to sessions and modules, the…](/framework/ai/sessions/2026/10/19/cloud-voice-agent/task-system/) — (no outcome logged)
- 2026-10-17 [Undone to tasks: 229 verified-undone asks are idle tasks in their mod…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-to-tasks/) — 229 tasks created and 229 asks now link to them (229 minus 0 that already had one). 0 were already tracked, 0 had no module. Each ask on the undone-asks page links its task; /tasks/ shows them folded per module. node Server/UndoneToTasks.mjs --plan / --apply … · paths 1/1 exist
- 2026-10-16 [Task migration: 211 old tasks moved to module homes](/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/) — 211 old tasks now live in their module's tasks/ folder; nothing deleted (2c8f4b674, 78bf8eb52) lose no data: each old file only gained one home line, proven by sha256 prefix; diff shows 211 added lines, 0 removed a task that clearly belongs to a module moves:…
- 2026-10-16 [Session extends Item: step 7 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/session-item/) — Landed on michael/dev as 6858167bc.
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-16 [Checkup: the task system and the migration of old tasks](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-task-system/) — The task system build is on dev (17 steps, 44 commits checked), and 211 old tasks now have module homes with nothing deleted (2c8f4b674, 0 check problems, 5 of 5 spot checks link both ways). /tasks/ shows open work first with finished tasks folded; the task w…
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-13 [Session detail: Raw links and per-ask transcript line](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-detail-raw/) — Header shows task.jsonl + transcript links; each Coverage ask links to its transcript line; Coverage stays empty where no refined cards exist (ext/Refine side, untested on real asks). Committed 566b6926f; no merge.mjs run (main-tree edit).

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 9 files
- [core/Task](/framework/core/Task/) — used by 514 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 27 files
- [ext/Session](/framework/ext/Session/) — used by 9 files

## Docs and readmes
- [Owner notes, 2026-10-16 night: migrating old tasks into the…](/framework/core/Task/doc/owner-2026-10-16-migration.md) — ## The problem Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState state.jsonl, the ai/…
- [Owner notes, 2026-10-16: the task system (dictated, capture…](/framework/core/Task/doc/owner-2026-10-16-task-system.md) — Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; th…
- [Owner notes, 2026-10-17: routine procedures in the task sys…](/framework/core/Task/doc/owner-2026-10-17-node-driven.md) — Sixth note. The owner's words are verbatim in [requirements-15.md](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/re…
- [Ranking System](/framework/ai/AITask/doc/rank-notes.md) — ## Overview RANKING lets the owner drag a list into the order they want, and that order is written as one line in the task's task.jsonl. Th…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — Decided by mastermind-task-folders (session e456f109), brief: [requirements.md](../sessions/2026/10/12/session-e456f109/task-folders/requir…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…
- [AITask — moved to [ai/AITask](../../ai/AITask/readme.md) on…](/framework/ext/AITask/readme.md) — It renders an agent task's log (one task, a day, the board), so it lives with the AI system now: the rule is at the top of [ai/readme.md](.…
- [System architecture — a checkable container per module, one…](/framework/ext/System/doc/architecture.md) — A System is anything we keep in order: its files (root), its readme, its rules, and a check() that computes whether they hold. The base cla…

## Sessions tagged with these words
- 2026/10/15 [Page system audit and documentation review](/framework/ai/sessions/2026/10/15/session-c57d1c4b/) — kind/owner model/opus mod/ai/sessions task/page-system · $17.87
- 2026/10/15 [Debug views requirements](/framework/ai/sessions/2026/10/15/session-baaf8f25/) — kind/owner model/haiku mod/ai/sessions task/page-system · $0.26
- 2026/10/15 [Requirements trace](/framework/ai/sessions/2026/10/15/session-a9d9dc53/) — kind/owner model/haiku mod/ai/sessions task/page-system · $0.31
- 2026/10/15 [AI systems documentation audit](/framework/ai/sessions/2026/10/15/session-8a643cb8/) — kind/owner model/opus mod/ai/sessions task/ai-systems framework/ai · $7.41
- 2026/10/15 [System map](/framework/ai/sessions/2026/10/15/session-582b5047/) — kind/owner model/opus mod/ai/sessions task/system-map framework/ai · $4.67
- 2026/10/15 [Voice minion skill execution](/framework/ai/sessions/2026/10/15/session-493b3602/) — kind/owner model/sonnet mod/ai/sessions task/page-system · $0.46

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-10-02 AI system docs: the System tab now explains the whole thing (task-mastermind-ai-system-docs, landed)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)

## Commits
- 44a79341c probes.mjs: look for a probe's task.jsonl where Servex really opens it
- 21d72df84 core/Page: document path extensions (md/, fs/, the per-page AI pair, AI/AI2 task folders); fix the empty-file…
- af71a9129 Answer the review-tooling fresh-eyes review: card post, reading order, tiles band, in-flight placement, readm…
- e5cc80f9d AI 2: Inbox default again, filter heartbeat flood from Needs you, add Log tab, stop the rail jumping, fix the…
- 8b76ccc71 Fix round 2, Part Y: loading strip on the Overview, page_work() walks the real page tree
- acd9cd4c1 core/Page/layout/switcher: the Switcher pattern, a CSS-only proof it needn't monkey-patch active classes

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,001 tokens of reading, under the 100k limit).

Question: Task system: what exists, how tasks link to sessions and modules, the gaps

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Task system: what exists, how tasks link to sessions and modules, the gaps"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
