<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The task queue s 133 tasks  triaged into a short  real list" (words: task, queue, 133, triaged, into, short, real, list)

## Tasks (8, best first)
- 2026-10-24 [Task queue: an estimate per task, so rows stop tying](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/queue-estimate/) — Each queued task gets its own cost estimate, from similar landed tasks the ranking separates rows: 4 → 10 distinct scores in the top 20 ([before](check-before.txt), [after](check-after-review.txt)) review (pass): 2 fixed (a stable tie-break, so estimates stop… · paths 1/1 exist
- 2026-10-24 [Session report: real cost, child sessions, year and month lists](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-report/) — The Report tab of a session's dated folder shows its real cost, its child sessions and its counts; the year and month pages list sessions (0fe5bc9b6). report tab wired to the item tool: the cost is the item tool's total, the same number the session page's sta…
- 2026-10-24 [Task queue: a live page of what is queued and why](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/queue/) — The [task queue](/framework/ai/queue/) is live: 143 accepted tasks, ranked, each with what it is, why, its estimated cost and its score (17181c28a). Reached from the Queue tab and the AI page. one page I can open: /framework/ai/queue/, linked from /framework/… · paths 2/2 exist
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-23 [Figma: mobile cards for sessions, projects, tasks and processes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/) — New Figma page, mobile first, real data: seven bands and a What to pick card. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=324-54823) · [notes and picks](/framework/ai/sessions/doc/mobile-cards.md) session card variants: band C…
- 2026-10-20 [tasks-list](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/tasks-list/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/tasks-list/requirements.md
- 2026-10-13 [AITask: moved from ext/ into ai/, with the rule for what goes in ai/](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/) — AITask now lives in ai/, and the rule for what goes there is written down. ext/AITask is an AI thing: moved to [ai/AITask](/framework/ai/AITask/) by script (223 files relinked); the [old address](/framework/ext/AITask/) points to it; check_page is clean on bo… · paths 2/2 exist
- 2026-10-12 [Task folders: moved into the sessions store](/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/) — Every task folder now lives in the sessions store: no more ai/<date>/ day folders. ![](moved-task-1920.png) past asks gathered, decided, alternative recorded: [task-folders.md](/framework/ai/doc/task-folders.md) new writes go to the new place through one clas…

## Modules that exist now (files outside the module that import it)
- [core/List](/framework/core/List/) — used by 22 files
- [core/Task](/framework/core/Task/) — used by 774 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme

## Docs and readmes
- [The task queue: a session's tasks plus a priority, worked b…](/framework/ai/doc/task-queue.md) — The decision (2026-10-23): there is no new queue system. A mastermind's queue is its tasks, each with a priority. The mastermind starts the…
- [Task queue ai/queue/](/framework/ai/queue/readme.md) — The queue of accepted tasks, ranked, at /framework/ai/queue/. The page opens on one screen: the count as one big number with its split by b…
- [Tasks — what is in flight, queued and landed, live](/framework/ai/tasks/doc/readme-before-2026-10-19.md) — See it: [/framework/ai/tasks/](/framework/ai/tasks/). It is no list of its own: it opens the Inbox ([/framework/ai/](/framework/ai/)) with …
- [Task — a DOM-free unit of work: id, title, a state machine,…](/framework/core/Task/readme.md) — ## Status (verified 2026-10-19 against the code) - Built and tested: the state machine, subtasks, replay of task.jsonl (node Task.test.mjs,…
- [Projects: a folder with project.jsonl, moved into its modul…](/framework/ai/tasks/doc/projects.md) — A task is a line in its session's log. A project is a task with subtasks, requirements or a review, so it gets a folder holding project.jso…
- [Tasks — what is in flight, queued and landed, and how the b…](/framework/ai/tasks/readme.md) — A task is a folder whose task.jsonl is a log, one fact per line; its state is never stored, it is replayed from the lines. This module is t…
- [Owner notes, 2026-10-16 night: migrating old tasks into the…](/framework/core/Task/doc/owner-2026-10-16-migration.md) — ## The problem Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState index.jsonl, the ai/…
- [Ranking System](/framework/ai/AITask/doc/rank-notes.md) — ## Overview RANKING lets the owner drag a list into the order they want, and that order is written as one line in the task's task.jsonl. Th…

## Sessions tagged with these words
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26

## Owner asks
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 AI 2 merges into /framework/ai/ (later) (ai/todo.md, parked)

## Commits
- 33770e977 ai: brief, triage the 133-task queue into a short real list

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,563 tokens of reading, under the 100k limit).

Question: The task queue's 133 tasks: triaged into a short, real list

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The task queue's 133 tasks: triaged into a short, real list"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
