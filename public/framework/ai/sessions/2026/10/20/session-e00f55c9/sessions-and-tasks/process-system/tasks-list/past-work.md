<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: " tasks  lists tasks again" (words: task, list, again)

## Tasks (8, best first)
- 2026-10-19 [Documentation: every main system's readme states its structure and ho…](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/docs/) — Readmes now state structure and function. Every main system's readme states its structure and how it works: ai, ai/sessions, ai/tasks, AITask, Inbox, core/Page, Servex rewritten (framework/readme.md indexes them). No history in them: old text moved to doc/rea…
- 2026-10-13 [architecture.md: batch 6, 12 more modules](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/architecture-md-6/) — 12 more modules now have doc/architecture.md (66 to 78 of 113). Reviewed: pass, 4 notes ([review.md](review.md)). next 12 by importers, none edited in the last hour: core/new, crumbs, dialog, tags, tooltip, Menu, stacks, Search, Dropdown, Figma, alert, editor…
- 2026-10-13 [Asks tally: 859 asks, 309 features, what landed and what never did](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/) — [Your asks, tallied](/framework/ai/doc/asks-outcomes.md): 859 asks in 1,990 of your prompts since 09-15, grouped into 309 features. 101 done, 118 partly, 90 with no evidence. Asked most, not finished: 1. session system: 47 asks, partly 2. task system: 33, par…
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-10-03 [Now card: topics are real sub-cards, and the Now card is back in the …](/framework/ai/sessions/2026/10/03/topic-cards/topic-cards/) — Topics are real, clickable sub-cards; the Now card is back in the rail. Details: [readme](/framework/ai2/). topics as sub-cards, titles-only list at top: ![topics](topics-list.png) raw → clean → structured per prompt: blocked on @task-mastermind-prompts-live … · paths 1/1 exist
- 2026-10-01 [Recovery: 602 deleted files restored](/framework/ai/sessions/2026/10/02/99b7e92e-dd02-4fdc-aa07-ce17cef1ce98/task/) — 602 deleted files restored; 344 of 601 deleted paths exist again (was 14). cards first: [day page](/framework/ai/2026/10/01/) lists all 9 cards, ![](/framework/ai/2026-10-01/recover-main-untracked/cards/shot/monorepo-localhost-framework-ai-2026-10-01/1920.png…
- 2026-08-17 [task-status](/framework/ai/sessions/2026/08/17/task-status/) — Task pages now say where they are. AITask.status(m) (ext/AITask/AITask.js, +14 lines) reads the same now card.js already put on the board — exported instead of re-derived — and renders above the checklist, called first inside refresh() so a running task's str… · paths 0/1 exist, gone: framework/ext/AITask/api/status/
- 2026-10-07 [Docs-vs-code audit: two stale MCP tool-count claims, one found-and-fl…](/framework/ai/sessions/2026/10/08/docs-vs-code-audit/docs-vs-code-audit/) — What landed: checked 12 concrete claims from doc/systems-overview.md, doc/autonomy.md, todo.md and asks.jsonl against the live Servex + site MCP tool catalogs and the agent lifecycle code (Agents.js, tools.js). 9 held up exactly: dormant-agent lifecycle, the …

## Modules that exist now (files outside the module that import it)
- [core/List](/framework/core/List/) — used by 23 files
- [core/Task](/framework/core/Task/) — used by 758 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Task — a DOM-free unit of work: id, title, a state machine,…](/framework/core/Task/readme.md) — ## Status (verified 2026-10-19 against the code) - Built and tested: the state machine, subtasks, replay of task.jsonl (node Task.test.mjs,…
- [Card types and the task lifecycle — the owner's vocabulary,…](/framework/ext/Refine/doc/card-types.md) — Recorded so the intent survives chat (CLAUDE.md, law 5). The owner dictated this in the Claude mobile app on 2026-10-16 while flipping thro…
- [AITask — design notes and removed comments](/framework/ai/AITask/doc/AITask-notes.md) — ## Class overview A task's record: its task.jsonl (or a legacy session.json) rendered as three tabs — Report (the answer first: outcome, li…
- [The effort — group](/framework/ai/AITask/doc/effort.md) — A day is the filing system; an effort is how the work is actually thought about — a thread that outlives any one day. group names it, and t…
- [Ranking System](/framework/ai/AITask/doc/rank-notes.md) — ## Overview RANKING lets the owner drag a list into the order they want, and that order is written as one line in the task's task.jsonl. Th…
- [ai/rail: the list on the left, and the data behind it](/framework/ai/rail/readme.md) — Moved here from ai2/ on 2026-10-09 (the old paths are one-line shims). AIRail is the one rail the AI page's Inbox and Log tabs and the old …
- [Tasks — the class architecture](/framework/ai/tasks/doc/architecture.md) — Server/TaskState.mjs class TaskState computes the picture, appends it to index.jsonl ai/index.jsonl one line per change (machine state) ai/…
- [Tasks — what is in flight, queued and landed, live](/framework/ai/tasks/doc/readme-before-2026-10-19.md) — See it: [/framework/ai/tasks/](/framework/ai/tasks/). It is no list of its own: it opens the Inbox ([/framework/ai/](/framework/ai/)) with …

## Sessions tagged with these words
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26

## Owner asks
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Readmes: every agent reads the chain top-down, again on a directory switch (mastermind-servex-9, routed)
- 2026-09-30 Task pages: grey checkboxes, full-width bars, reports as free content (ui-system brief (after the System class), queued)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)

## Commits
- da6a2a35d process: fixes from run 1, plus the owner's homes and improvements decisions
- 648a05b65 task-folders: TaskMove.mjs moves day folders into the sessions store
- 32690840a ux/Card: equal detail columns, quiet properties sidebar, padded breadcrumb
- a377158a6 page_tools: switch to the nested wire format (no at, no dots)
- ae4fca3cf Card sessions: a voice session's home can be an AI 2 card
- c2d25ec3a ai2: pause the live board's pollers while the tab is hidden
- 8b76ccc71 Fix round 2, Part Y: loading strip on the Overview, page_work() walks the real page tree
- acd9cd4c1 core/Page/layout/switcher: the Switcher pattern, a CSS-only proof it needn't monkey-patch active classes

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,139 tokens of reading, under the 100k limit).

Question: /tasks/ lists tasks again

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "/tasks/ lists tasks again"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
