<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Task queue  an estimate per task  so the ranking separates rows" (words: task, queue, estimate, per, rank, separat, row)

## Tasks (8, best first)
- 2026-10-20 [Task queue: an estimate per task, so the ranking separates rows](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/queue-estimate/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/queue-estimate/requirements.md
- 2026-10-24 [Task queue: a live page of what is queued and why](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/queue/) — The [task queue](/framework/ai/queue/) is live: 143 accepted tasks, ranked, each with what it is, why, its estimated cost and its score (17181c28a). Reached from the Queue tab and the AI page. one page I can open: /framework/ai/queue/, linked from /framework/… · paths 2/2 exist
- 2026-10-20 [Quick fix merge: Whisper card on /framework/audio/](/framework/ai/sessions/2026/10/20/session-e4971f1a/task-mastermind/) — Cherry-picked qf-7 commit 83630fa8e into michael/dev as 60cbbf5ea (merge.mjs refused: 2 dirs, no dev server on qf-7). Page checked at 400 and 1200: Whisper card and tab show, no overflow.
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-12 [Sessions grid: newest month first, live, current model, one row per s…](/framework/ai/sessions/2026/10/12/session-eecd88fa/sessions-grid/) — Round 2 of the Sessions grid is in: one list by recency, five role chips, columns that resize, cost freshness shown. Details: [grid-loading.md](/framework/ai/sessions/doc/live/grid-loading.md). one grid sorted by recency: the Now strip is gone, working rows s…
- 2026-10-04 [Models tab: added a one-row-per-model catalog with live pricing and o…](/framework/ai/sessions/2026/10/04/models-page/models-page/) — Live on /framework/ai/ → System → Models, above the fold. A 17-row sortable table — provider, context window, $/M in/out/cached, our docs/reasoning/refine test scores, seconds, tokens in/out, and a "typical minion $" column — plus five notes on why reads are … · paths 2/2 exist
- 2026-09-29 [Lifecycle: log every resource, reap a finished task's leftovers](/framework/ai/sessions/2026/09/29/3c88ad4d-b2e6-4899-b5c4-fbca0e2674e2/lifecycle/build/) — The creation log and the reaper are built. Committed on worktree/lifecycle (4500ebe8), not merged. creation log: a throwaway server logged its start and end lines reaper: [dry-run.txt](dry-run.txt) closes 9, keeps :3104 and :8137 keep list: Servex/keep.json s…

## Modules that exist now (files outside the module that import it)
- [core/Property](/framework/core/Property/) — used by 3 files
- [core/Task](/framework/core/Task/) — used by 770 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/row](/framework/ui/row/) — used by 7 files

## Docs and readmes
- [Task queue ai/queue/](/framework/ai/queue/readme.md) — The queue of accepted tasks, ranked, at /framework/ai/queue/: for each, what it is, why, its estimated cost, its big thing and its state. R…
- [Ranking System](/framework/ai/AITask/doc/rank-notes.md) — ## Overview RANKING lets the owner drag a list into the order they want, and that order is written as one line in the task's task.jsonl. Th…
- [The task queue: a session's tasks plus a priority, worked b…](/framework/ai/doc/task-queue.md) — The decision (2026-10-23): there is no new queue system. A mastermind's queue is its tasks, each with a priority. The mastermind starts the…
- [Tasks — what is in flight, queued and landed, and how the b…](/framework/ai/tasks/readme.md) — A task is a folder whose task.jsonl is a log, one fact per line; its state is never stored, it is replayed from the lines. This module is t…
- [Perf — the brief's own proof: drag a column 300px across 2,…](/framework/ext/DataGrid/doc/perf.md) — perf.mjs, beside this file, drags the first column's resize handle 300px across the demo page's 2,000-row grid (/framework/ext/DataGrid/) a…
- [Pace, not percentage](/framework/ai/AITask/doc/pace.md) — usage.js's usage_rail(u) renders usage.json's utilization.limits[] as meters. Each usage window is a fixed length (LENGTH.session = 5h, LEN…
- [Ranking — owner items first, and the order the owner put th…](/framework/ai/AITask/doc/ranking.md) — Three things share one idea. Some items are waiting on the owner, and those go above everything else. Every list here can be put in an orde…
- [Tasks — what is in flight, queued and landed, live](/framework/ai/tasks/doc/readme-before-2026-10-19.md) — See it: [/framework/ai/tasks/](/framework/ai/tasks/). It is no list of its own: it opens the Inbox ([/framework/ai/](/framework/ai/)) with …

## Sessions tagged with these words
- 2026/10/14 [Inbox browse rebuild](/framework/ai/sessions/2026/10/14/session-6214b71d/) — kind/owner model/opus mod/ux/browse mod/core/page task/mastermind-repo-slim framework/inbox · $8.16
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26

## Owner asks
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-10-18 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (?, tracked)
- 2026-09-30 Design and code: /framework/design/ and /framework/code/ as browsable knowledge; skills t… (task-mastermind-design-code, routed)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Logs: unknown verbs on AI 2; the validator checks the schema; register experiment and rev… (mastermind-servex (10 PM task, item 12), queued)

## Commits
- 784795a90 ai/queue readme: two next steps (per-task estimate, live removal)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,847 tokens of reading, under the 100k limit).

Question: Task queue: an estimate per task, so the ranking separates rows

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Task queue: an estimate per task, so the ranking separates rows"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
