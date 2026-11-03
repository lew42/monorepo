<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Task page passes the merge smoke" (words: core, task, pass, merge, smoke)

## Tasks (8, best first)
- 2026-10-20 [core/Task page passes the merge smoke](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/fast-write/smoke-links/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/fast-write/smoke-links.md
- 2026-10-12 [Smoke gate passes on core pages](/framework/ai/sessions/2026/10/12/session-9098993a/smoke-gate/) — Smoke on core pages: 6 FAIL to 0 FAIL (commit 1eacb8fd3, on michael/dev). Causes fixed, allow-list untouched. Landed by the night mastermind: the session merged but ended before writing this line.
- 2026-10-24 [Task queue: an estimate per task, so rows stop tying](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/queue-estimate/) — Each queued task gets its own cost estimate, from similar landed tasks the ranking separates rows: 4 → 10 distinct scores in the top 20 ([before](check-before.txt), [after](check-after-review.txt)) review (pass): 2 fixed (a stable tie-break, so estimates stop… · paths 1/1 exist
- 2026-10-20 [Quick fix merge: Whisper card on /framework/audio/](/framework/ai/sessions/2026/10/20/session-e4971f1a/task-mastermind/) — Cherry-picked qf-7 commit 83630fa8e into michael/dev as 60cbbf5ea (merge.mjs refused: 2 dirs, no dev server on qf-7). Page checked at 400 and 1200: Whisper card and tab show, no overflow.
- 2026-10-19 [core/Task: class Project extends Task](/framework/ai/sessions/2026/10/19/cloud-voice-agent/task-system/project-class/) — Project.js (six stages, completed 0..1 computed from subtasks) and Project.test.mjs (8/8) merged into michael/dev; Task tests still 53/53; nothing wired in; review size none (self-evident).
- 2026-10-19 [AI dashboard: the Inbox is one list over the one state, with filter c…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/) — The Inbox in [/framework/ai/](/framework/ai/) is now one list over state.json, with url chips: Live, New, Recent, Older, Needs you, and a Kind row. No agent writes anything; the list streams. one dashboard, no new page: the Inbox rail reads the state (DashSta… · paths 3/3 exist
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-13 [Record files: a plain git merge dropped appended lines](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/task-log-race/) — Cause found, fixed, guarded, recovered. - ✅ Writer: a plain git merge --no-ff run in the dirty main tree at 17:38:07 (git parks the tree, hard-resets, the put-back failed). Not an autostash, not append.mjs, not LogSweeper; committed history never lost a line.…

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 773 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme
- [ux/tasks](/framework/ux/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [Task — a DOM-free unit of work: id, title, a state machine,…](/framework/core/Task/readme.md) — ## Status (verified 2026-10-19 against the code) - Built and tested: the state machine, subtasks, replay of task.jsonl (node Task.test.mjs,…
- [Owner prompts become tasks on the session page](/framework/core/Session/doc/prompt-tasks.md) — What it does. When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as an open task (idle, waiting…
- [Where a task falls through the cracks](/framework/core/Task/doc/cracks.md) — Read-only look at today's code (Servex/TaskLoop.js, Servex/Heartbeat.js, Server/StaleClose.mjs, Servex/agents/PromptTasks.js) plus the real…
- [Owner notes, 2026-10-16 (evening): compositing tasks (dicta…](/framework/core/Task/doc/owner-2026-10-16-composition.md) — Companion to owner-2026-10-16-task-system.md. The other voice session's vocabulary is in public/framework/ext/Refine/doc/card-types.md (Tas…
- [Owner notes, 2026-10-16 night: migrating old tasks into the…](/framework/core/Task/doc/owner-2026-10-16-migration.md) — ## The problem Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState index.jsonl, the ai/…
- [Owner notes, 2026-10-16: the task system (dictated, capture…](/framework/core/Task/doc/owner-2026-10-16-task-system.md) — Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; th…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/15 [Sessions subpages](/framework/ai/sessions/2026/10/15/session-0c3e83dd/) — kind/owner model/sonnet mod/core/page task/subpages framework/refine · $1.34
- 2026/10/14 [Nav-model page with live demos](/framework/ai/sessions/2026/10/14/session-e9f013e5/) — kind/owner model/opus mod/core/page task/mastermind-repo-slim page/catalog · $13.00

## Owner asks
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-03 Console: clean on /ai/live; smoke fails on console noise and 404s (task-mastermind-console-clean, building)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)

## Commits
- 68e7b3a21 core/Task readme: the subtask example passes evidence (review #1)
- ee2ed62d6 process-system: Process extends Task (phases node runs in series) + ProcessRunner; one item call creates a bu…
- 533bbb1f1 prompt-audit-system: two-pass prompt audit (PromptAudit.mjs), pilot on 7efd07d5, audits map, Task usage lines
- 648a05b65 task-folders: TaskMove.mjs moves day folders into the sessions store
- 7d025ee14 docs(ai): task-audit addendum 6 - surface pass, past-session compatibility, core links per session
- 32690840a ux/Card: equal detail columns, quiet properties sidebar, padded breadcrumb
- 9f66f0dbb core/Item, List, Page: drop the at key, List extends Item, id rules, data lives in data
- a377158a6 page_tools: switch to the nested wire format (no at, no dots)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,486 tokens of reading, under the 100k limit).

Question: core/Task page passes the merge smoke

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Task page passes the merge smoke"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
