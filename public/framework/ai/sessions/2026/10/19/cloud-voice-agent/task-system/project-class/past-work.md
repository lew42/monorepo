<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Task  class Project extends Task  play class " (words: core, task, clas, project, extend, play)

## Tasks (8, best first)
- 2026-10-19 [core/Task: class Project extends Task (play class)](/framework/ai/sessions/2026/10/19/cloud-voice-agent/task-system/project-class/) — public/framework/ai/sessions/2026/10/19/cloud-voice-agent/task-system/project-class/requirements.md
- 2026-10-03 [core/Task: a DOM-free unit of work, with subtasks that gate finish()](/framework/ai/sessions/2026/10/03/list-events/task-class/) — core/Task/Task.js landed — state machine (idle/running/paused/stopped/finished), duration() (running time only), progress() (computed from subtasks), finish() refuses while a subtask is open and names it. state machine + timestamps, one set() per transition: … · paths 3/3 exist
- 2026-10-16 [Task replay: steps 1-2 of the task system plan](/framework/ai/sessions/2026/10/16/voice-20261016/task-system/task-replay/) — Landed on michael/dev as 8935e1c77. core/Task gains Task.replay(lines) and a waiting state, and TaskLoop and TaskState read each task's state through it: only running tasks are chased, and a task waiting on the owner gets one reminder after 2 h, then one a da…
- 2026-10-14 [Scripts: the last four function bags are classes; two Servex cores ha…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-rename-5/) — AskEach, Browser, Collab, Decide are classes (merged fe2728518, case fix after); callers relinked, outputs identical to the old files, undo proven on a copy; Agents.js and directory.js have a plan in Servex/agents/doc/class-plan.md, decision d-agents-director…
- 2026-10-12 [core/Page: Page.class.js split plan](/framework/ai/sessions/2026/10/12/session-38388428/page-split-plan/) — Split plan written, no code moved. The file is 2,270 lines but only 1,027 are code: 926 (40%) are comments, and about 260 lines are four helper classes already living in it. measured by script: core/Page/doc/split-measure.mjs one-screen plan with class tree, … · paths 1/1 exist
- 2026-10-03 [core/Item+Page: no at key, List extends Item, id rules, all data in d…](/framework/ai/sessions/2026/10/03/list-events/drop-at-key/) — Four owner passes, one merge — [Item](/framework/core/Item/), [List](/framework/core/List/), [Page](/framework/core/Page/) drop the at key — get(key) resolves one name; nesting replaces the path; a line may be an array of deltas; old at lines still replay for… · paths 3/3 exist
- 2026-10-03 [core/Page: PageLog folded away, Page extends Item directly](/framework/ai/sessions/2026/10/03/list-events/page-no-log/) — PageLog is gone — Page extends Item directly (e7f5a714) the file/place/tab/settings verbs + the listing moved onto [Page](/framework/core/Page/): [Page.class.js](/framework/core/Page/Page.class.js) PageLog class deleted; Log.js is a one-line re-export for its… · paths 6/6 exist
- 2026-10-02 [inspect(): class cards for every object, then the Dictate playground …](/framework/ai/sessions/2026/10/02/bc9e77bd-9e53-4c08-99c7-0346f2f0f5d1/inspect/) — Both parts landed. every class gets an icon + a debug inspect() card: [Inspect.js](/framework/ux/Content/Object/Inspect.js), live on [ux/Content/Object](/framework/ux/Content/Object/) Dictate's data becomes real classes: [objects.js](/framework/ux/Dictate/pla… · paths 4/4 exist

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 514 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Classify](/framework/ext/Classify/) — used by 1 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [Tasks — the class architecture](/framework/ai/tasks/doc/architecture.md) — Server/TaskState.mjs class TaskState computes the picture, appends it to state.jsonl ai/tasks/state.jsonl one line per change (machine stat…
- [Item, List, Page: the class block](/framework/core/Page/doc/class-block.md) — This is one code block of the three classes, read from the source on 2026-10-15 (core/Item/Item.js, core/List/List.js, core/Page/Page.class…
- [The core/Page classes](/framework/core/Page/doc/classes.md) — ## The class architecture: Item, List, Page The full skeleton, every member with a one-line comment and what each Page owns: [class-block.m…
- [Owner notes, 2026-10-16: the task system (dictated, capture…](/framework/core/Task/doc/owner-2026-10-16-task-system.md) — Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; th…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…
- [A class page is one card: core API first, own members, then…](/framework/ext/Doc/doc/class-card.md) — The API tab of a Doc whose subject is a class opens on a ClassCard (ClassCard.js, class ClassCard extends View, built by Doc.api_section). …
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/15 [Sessions subpages](/framework/ai/sessions/2026/10/15/session-0c3e83dd/) — kind/owner model/sonnet mod/core/page task/subpages framework/refine · $1.34

## Owner asks
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-10-03 Servex: Playwright Chrome logged + reaped; one warm shared browser with check_page (task-mastermind-playwright-reap, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)

## Commits
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- 71aec5869 TasksPage: the page for a tasks/ directory; Page.child mounts it on any tasks/, /tasks/ indexes every task ho…
- 17877f6ce core/Page: owner start doc, class map, Router link; readme claims verified (6 stale fixed)
- c4cc54660 Content-row rendering: card rhythm, live agent mentions, inline chip size
- e7f5a7149 core/Page: fold PageLog away, Page extends Item directly
- 2fe922777 core/Page: AI cost per page (roadmap 10b)
- 4aa3a71ca core/Task: a DOM-free unit of work — the base state-machine class
- e8c34f811 core/List: merge List + LiveList into one evented class

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 45,683 tokens of reading, under the 100k limit).

Question: core/Task: class Project extends Task (play class)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Task: class Project extends Task (play class)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
