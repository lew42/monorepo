<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Task  Prompt and Question extend Task" (words: core, task, prompt, question, extend)

## Tasks (8, best first)
- 2026-10-19 [core/Task: class Project extends Task](/framework/ai/sessions/2026/10/19/cloud-voice-agent/task-system/project-class/) — Project.js (six stages, completed 0..1 computed from subtasks) and Project.test.mjs (8/8) merged into michael/dev; Task tests still 53/53; nothing wired in; review size none (self-evident).
- 2026-10-03 [core/Item+Page: no at key, List extends Item, id rules, all data in d…](/framework/ai/sessions/2026/10/03/list-events/drop-at-key/) — Four owner passes, one merge — [Item](/framework/core/Item/), [List](/framework/core/List/), [Page](/framework/core/Page/) drop the at key — get(key) resolves one name; nesting replaces the path; a line may be an array of deltas; old at lines still replay for… · paths 3/3 exist
- 2026-10-03 [core/Page: PageLog folded away, Page extends Item directly](/framework/ai/sessions/2026/10/03/list-events/page-no-log/) — PageLog is gone — Page extends Item directly (e7f5a714) the file/place/tab/settings verbs + the listing moved onto [Page](/framework/core/Page/): [Page.class.js](/framework/core/Page/Page.class.js) PageLog class deleted; Log.js is a one-line re-export for its… · paths 6/6 exist
- 2026-10-03 [core/Task: a DOM-free unit of work, with subtasks that gate finish()](/framework/ai/sessions/2026/10/03/list-events/task-class/) — core/Task/Task.js landed — state machine (idle/running/paused/stopped/finished), duration() (running time only), progress() (computed from subtasks), finish() refuses while a subtask is open and names it. state machine + timestamps, one set() per transition: … · paths 3/3 exist
- 2026-10-22 [Prompt audit: Haiku sorts each owner prompt, Sonnet finds each sessio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/prompt-audit-system/) — The prompt audit runs: one command per session, results beside the session, nothing filed as tasks. [How to run it, cost](/framework/ai/doc/prompt-audit.md) both passes on session 7efd07d5: 22 prompts, 376 items, $2.01; two reviewer rounds with feedback recor… · paths 1/1 exist
- 2026-10-20 [core/Task page passes the merge smoke](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/fast-write/smoke-links/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/fast-write/smoke-links.md
- 2026-10-20 [docs-check: core/Session and core/Task readmes after Session entries](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-entries/docs-check/) — (no outcome logged)
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 795 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme
- [ux/tasks](/framework/ux/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Owner prompts become tasks on the session page](/framework/core/Session/doc/prompt-tasks.md) — What it does. When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as an open task (idle, waiting…
- [Prompt breakdown: one outcome task per prompt](/framework/core/Session/doc/prompt-breakdown.md) — What a prompt becomes, in one screen. Filing is PromptRecords.file() in Server/PromptRecords.mjs (the step after the parts); the live switc…
- [Task lifecycle: one design for prompt to landed change (pro…](/framework/ai/doc/task-lifecycle.md) — See also: the seven-step shape of a bigger task (requirements and plan, a minion builds, a fresh reviewer, merge, land) is in the [mastermi…
- [Indexing, directory deltas and querying — the owner's quest…](/framework/core/Page/doc/indexing-2026-10-08.md) — Recorded from dictation; open architecture questions for the core page system, with what the code already shows. ## What exists (verified b…
- [Navigation: one model — four questions about the site's nav…](/framework/core/Page/navigation/model/readme.md) — [Live page](/framework/core/Page/navigation/model/). The owner asked four questions on 2026-10-14 ([the dictation](/framework/ai/sessions/2…
- [Session is a Task: the migration (2026-10-24)](/framework/core/Session/doc/session-is-a-task.md) — What changed: Session extends Task (it was extends Item). The owner asked for it on 2026-10-24 ("make session extend task… properly transit…
- [Where a task falls through the cracks](/framework/core/Task/doc/cracks.md) — Read-only look at today's code (Servex/TaskLoop.js, Servex/Heartbeat.js, Server/StaleClose.mjs, Servex/agents/PromptTasks.js) plus the real…
- [Owner notes, 2026-10-16 (evening): compositing tasks (dicta…](/framework/core/Task/doc/owner-2026-10-16-composition.md) — Companion to owner-2026-10-16-task-system.md. The other voice session's vocabulary is in public/framework/ext/Refine/doc/card-types.md (Tas…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/15 [Sessions subpages](/framework/ai/sessions/2026/10/15/session-0c3e83dd/) — kind/owner model/sonnet mod/core/page task/subpages framework/refine · $1.34
- 2026/10/14 [Nav-model page with live demos](/framework/ai/sessions/2026/10/14/session-e9f013e5/) — kind/owner model/opus mod/core/page task/mastermind-repo-slim page/catalog · $13.00

## Owner asks
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)

## Commits
- 25a784984 core/Task: brief for Prompt and Question extend Task (owner ask 2026-10-24, deferred, now built)
- 9c9104e42 PromptTasks: an accepted (idle, approved) prompt task moves home; module from file_hint; default home is its …
- 66ecf14ad core/Task: task resolution model (what is a task, 1-3 per prompt, evidence + confidence, who completes, node …
- e42f35ca3 prompt tasks: doc (core/Session/doc/prompt-tasks.md) with shots at 400 and 1200, readme link
- d1a2fa636 prompt tasks: the session page shows the session's tasks live, Approve / Not now on a proposal (core/Session/…
- ee2ed62d6 process-system: Process extends Task (phases node runs in series) + ProcessRunner; one item call creates a bu…
- 533bbb1f1 prompt-audit-system: two-pass prompt audit (PromptAudit.mjs), pilot on 7efd07d5, audits map, Task usage lines
- 8b4aff881 one-dictation: re-review round 2 (findings 3,4,6,7 of e7d08a93's review)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: core/Task: Prompt and Question extend Task

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Task: Prompt and Question extend Task"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
