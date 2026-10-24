<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Task queue  a live page the owner can open" (words: task, queue, live, owner, can, open)

## Tasks (8, best first)
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-19 [task-system: docs for what a task is, where it lives, who makes it, a…](/framework/ai/sessions/2026/10/19/cloud-voice-agent/task-system/) — Task docs are current (ai/doc/tasks.md, ai/tasks/readme.md known problems, readme links, skills). The prompt-to-landed flow and the reachability/duplication audit are written. The lifecycle proposal ai/doc/task-lifecycle.md awaits the owner; nothing built.
- 2026-10-16 [Checkup: the task system and the migration of old tasks](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-task-system/) — The task system build is on dev (17 steps, 44 commits checked), and 211 old tasks now have module homes with nothing deleted (2c8f4b674, 0 check problems, 5 of 5 spot checks link both ways). /tasks/ shows open work first with finished tasks folded; the task w…
- 2026-10-16 [Task system build: steps 1–17, 3c and 3d](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/) — The task system is built: every step from 1 to 17, plus 3c and 3d, is merged on michael/dev. The [task home](/framework/core/Task/tasks/task-system-build/) is the record, and every step is ticked there. - Last two steps: 3d (each task records its sessions, wh… · paths 3/3 exist
- 2026-10-15 [live: Today card shows done vs waiting on X](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) — Today has 4 tasks done and 3 waiting; two finished tasks are now closed. - Waiting: handover-query (snoozed until 2026-10-18 by mastermind-voice-20261016), task-closeout (in flight), voice-20261016 (parent, agent active). - Closed with a landing line: live-fe…
- 2026-10-08 [Cheap-model routing: spawn-decision log, pace calibration, ask-audit …](/framework/ai/sessions/2026/10/08/mastermind-cheap-models/mastermind-cheap-models/) — Spawn-decision log and pace tools built; the live Haiku proving ground is blocked, not faked. spawn-decision log: [spawns.jsonl](spawns.jsonl) + [decisions.mjs](decisions.mjs) Haiku proving ground (5 questions): harness extended ([facts.mjs](/Servex/ext/openr…
- 2026-10-03 [core/Task: a DOM-free unit of work, with subtasks that gate finish()](/framework/ai/sessions/2026/10/03/list-events/task-class/) — core/Task/Task.js landed — state machine (idle/running/paused/stopped/finished), duration() (running time only), progress() (computed from subtasks), finish() refuses while a subtask is open and names it. state machine + timestamps, one set() per transition: … · paths 3/3 exist
- 2026-10-02 [Framework home: sections from the sidebar's own tree, dark class card…](/framework/ai/sessions/2026/10/02/framework-home/) — Landed. /framework/ is a wall of sections, one per sidebar group, read from the sidebar's own tree. Classes get dark cards, columns balance by height, old page kept at /framework/old/. back up the old page — [/framework/old/](/framework/old/) sections in side… · paths 4/4 exist

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 759 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme
- [ux/tasks](/framework/ux/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Tasks — what is in flight, queued and landed, live](/framework/ai/tasks/doc/readme-before-2026-10-19.md) — See it: [/framework/ai/tasks/](/framework/ai/tasks/). It is no list of its own: it opens the Inbox ([/framework/ai/](/framework/ai/)) with …
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Asks — what the owner asked for, and whether it happened](/framework/ai/AITask/doc/asks.md) — An ask is one thing the owner asked for, written down in their own words. It is a line in the running session's task.jsonl, using [ext/JSON…
- [Ranking — owner items first, and the order the owner put th…](/framework/ai/AITask/doc/ranking.md) — Three things share one idea. Some items are waiting on the owner, and those go above everything else. Every list here can be put in an orde…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Where AI code lives: a proposal for the owner to approve](/framework/ai/doc/code-shape.md) — Status: proposal (2026-10-22). Nothing has moved. This is the system architect's answer to the owner's [Follow-up 2](readme-system.md) in r…

## Sessions tagged with these words
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/15 [Live today voice feed](/framework/ai/sessions/2026/10/15/session-8f02ad12/) — kind/owner model/sonnet task/live-today page/live-cards · $1.20
- 2026/10/15 [Live-post helper agent](/framework/ai/sessions/2026/10/15/session-8853d8d6/) — kind/owner model/sonnet task/live-post page/live-cards · $0.98
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/15 [Live stream cards not updating in browser](/framework/ai/sessions/2026/10/15/session-1ca12342/) — kind/owner model/sonnet task/live-stream page/live-cards · $1.14
- 2026/10/15 [Live-feed](/framework/ai/sessions/2026/10/15/session-132c71e9/) — kind/owner model/sonnet work/read-only task/live-feed page/live-cards · $0.55

## Owner asks
- 2026-10-12 Pages as live streamed parts; each page shows its own tasks (asked 9x) (mastermind-page-ai-api, routed)
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, landed)

## Commits
- cc0a66b41 docs: prompt-audit and refine-queue say prompts are now refined live and filed as proposed tasks
- b7ed6c80c Tasks: in flight, queued and landed today, one live page (TaskState + ai/tasks on Browse)
- 4aa3a71ca core/Task: a DOM-free unit of work — the base state-machine class
- e8c34f811 core/List: merge List + LiveList into one evented class
- f5103369f panel2-sessions Part 2: AI dashboard Sessions + Dashboard tabs
- 8e20aacec Fix review findings: silence check without an agent, no reload churn
- 0399e9167 ai2: INBOX ZERO — Clear all, a >=min score display rule, archive that sticks
- 5f8c284da ledger hook: a briefed child still in the spawn queue counts as live (requirements.md, no task.jsonl yet)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,423 tokens of reading, under the 100k limit).

Question: Task queue: a live page the owner can open

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Task queue: a live page the owner can open"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
