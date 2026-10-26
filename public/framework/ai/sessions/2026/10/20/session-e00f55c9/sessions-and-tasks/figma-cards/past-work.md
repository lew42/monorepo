<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Figma  mobile cards for sessions  projects  tasks and processes" (words: figma, mobile, card, session, project, task, process)

## Tasks (8, best first)
- 2026-10-21 [Figma: sessions, tasks and projects designed on the file's system](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-sessions/) — The Sessions and tasks page in Figma is rebuilt on the file's styles and tokens, with real data. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=307-54823) cards first, three densities: 314:57410 task and project cards (project = …
- 2026-10-22 [Process system: node runs a task's phases, completion automatic](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Ready to merge: task/process-system (merges clean). - ✅ Study notes + doc fixes, maps indexed ([ai/doc/readme.md](/framework/ai/doc/readme.md)) - ✅ [process.md](/framework/core/Task/doc/process.md) with class sketch - ✅ Slice 1: Process + ProcessRunner, moves…
- 2026-10-20 [AI index: a day stream of task and session changes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/index-stream/) — Every task or session change now appends one line to that day's index.jsonl, and the dashboard patches the changed row from it. one stream line per change, per day folder: sessions/YYYY/MM/DD/index.jsonl, written by the new class [AIIndexStream](/Server/AIInd…
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-19 [core/Task: class Project extends Task](/framework/ai/sessions/2026/10/19/cloud-voice-agent/task-system/project-class/) — Project.js (six stages, completed 0..1 computed from subtasks) and Project.test.mjs (8/8) merged into michael/dev; Task tests still 53/53; nothing wired in; review size none (self-evident).
- 2026-10-15 [live: Today card shows done vs waiting on X](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) — Today has 4 tasks done and 3 waiting; two finished tasks are now closed. - Waiting: handover-query (snoozed until 2026-10-18 by mastermind-voice-20261016), task-closeout (in flight), voice-20261016 (parent, agent active). - Closed with a landing line: live-fe…
- 2026-10-14 [Figma: new pages use the Essentials cards (dogfood)](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/dogfood/) — Foundations · Layouts: 35 stand-in cards swapped to Card / Plain. Demo · Site: footer "+" icons hidden, related links made real, stand-in cards swapped. Two-column (12) and three-column (27) filled examples: stand-in cards swapped to Card / Plain. - Detail: […
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 12 files
- [core/Task](/framework/core/Task/) — used by 515 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Figma](/framework/ext/Figma/) — used by 3 files
- [ext/Session](/framework/ext/Session/) — used by 9 files

## Docs and readmes
- [Card types and the task lifecycle — the owner's vocabulary,…](/framework/ext/Refine/doc/card-types.md) — Recorded so the intent survives chat (CLAUDE.md, law 5). The owner dictated this in the Claude mobile app on 2026-10-16 while flipping thro…
- [Projects: a folder with project.jsonl, moved into its modul…](/framework/ai/tasks/doc/projects.md) — A task is a line in its session's log. A project is a task with subtasks, requirements or a review, so it gets a folder holding project.jso…
- [AITask architecture — render the working log, from session …](/framework/ai/AITask/doc/architecture.md) — AITask extends [Page](/framework/core/Page/Page.class.js) and serves as the master template for a task's detail view, a day's dashboard, an…
- [AITask — the page template for one session task, and the da…](/framework/ai/AITask/readme.md) — class AITask extends Page (AITask.js) renders one task folder as a page: its task.jsonl through TaskJSONL (ext/JSONL), a Session tab (the t…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [AI records — what is on disk, who writes it, who reads it; …](/framework/ai/doc/records.md) — Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/sessi…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…

## Sessions tagged with these words
- 2026/10/15 [Live post review](/framework/ai/sessions/2026/10/15/session-4a77ddf9/) — kind/agent model/sonnet mod/ai/sessions task/live-post page/live-cards · $0.23
- 2026/10/14 [Figma MCP skill design systems](/framework/ai/sessions/2026/10/14/session-f155ecbd/) — kind/owner model/opus mod/ai/sessions mod/ext/figma mod/ux/dictate framework/figma · $107.72
- 2026/10/14 [Figma Claude designs kit demo](/framework/ai/sessions/2026/10/14/session-c3c905da/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs page/demo · $2.29
- 2026/10/14 [Figma type kit brief](/framework/ai/sessions/2026/10/14/session-9446b75f/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs framework/tasks · $1.69
- 2026/10/14 [Figma fluid audit](/framework/ai/sessions/2026/10/14/session-81277d72/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs · $1.37
- 2026/10/14 [Figma captions kit](/framework/ai/sessions/2026/10/14/session-5bae46a9/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs · $2.12

## Owner asks
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-18 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (?, tracked)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-10-03 Styles: cards + prose on one measure/margin (lab); default padding rule; adaptive bg-ligh… (task-mastermind-card-measure-colors, building)

## Commits
- 21c7551a1 figma-cards brief: mobile cards for sessions, projects, tasks, processes

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 41,823 tokens of reading, under the 100k limit).

Question: Figma: mobile cards for sessions, projects, tasks and processes

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Figma: mobile cards for sessions, projects, tasks and processes"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
