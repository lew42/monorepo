<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "TaskLoop  node chases every started task that goes quiet" (words: taskloop, node, chas, every, started, task, go, quiet)

## Tasks (8, best first)
- 2026-10-08 [Task audit: every task categorised, every loose end has a fix and a v…](/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/) — Audit landed: 1,303 tasks categorised, 244 open loose ends each with a suggested fix and a verdict. Loose ends listed with a fix per row: [by-system.md](/framework/ai/2026-10-08/task-audit/by-system.md), 54 now, 145 later, 43 superseded, 2 in-flight Prioritis…
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-13 [AITask: moved from ext/ into ai/, with the rule for what goes in ai/](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/ai-modules-home/) — AITask now lives in ai/, and the rule for what goes there is written down. ext/AITask is an AI thing: moved to [ai/AITask](/framework/ai/AITask/) by script (223 files relinked); the [old address](/framework/ext/AITask/) points to it; check_page is clean on bo… · paths 2/2 exist
- 2026-10-13 [follow-up: runs daily from TaskLoop](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/followup-daily/) — TaskLoop.follow_up_daily runs FollowUp --write once a day, posts one owner_note row, LogSweeper commits follow-up.md and follow-up-full.md. Tested with a harness: stale file, run, note posted (39 flagged / 124 healthy). Not tested on a private Servex port; ne…
- 2026-10-12 [Task folders: moved into the sessions store](/framework/ai/sessions/2026/10/12/session-e456f109/task-folders/) — Every task folder now lives in the sessions store: no more ai/<date>/ day folders. ![](moved-task-1920.png) past asks gathered, decided, alternative recorded: [task-folders.md](/framework/ai/doc/task-folders.md) new writes go to the new place through one clas…
- 2026-10-03 [Servex: dev-server RAM leak reaped, and the hand-started-server leak …](/framework/ai/sessions/2026/10/02/node-reap/) — Reaped now, then guarded against it happening again. Reap now: 60 node processes/2319MB -> 16/859MB, freed 1460MB. result.json. Server stops on pool-return or landed task: already built (Worktrees.js/Pool.js, 2026-10-01); this run's reasons prove it. Idle, no… · paths 1/1 exist
- 2026-10-02 [The card pipeline: every major ask gets a readable card, by node](/framework/ai/sessions/2026/10/03/card-pipeline/card-pipeline/) — Every major ask now gets a real card, written by code — the owner's dashboard explains why each score is what it is. Ask -> card, by node: is_major()/ensure_card() on every 60s tick. 3 of today's 4 named asks got a real card just now; the 4th already had one.… · paths 2/5 exist, gone: framework/ai2/2026/10/02/page-extends-item-one-set-persistence-in/ framework/ai2/2026/10/02/ext-panel2-header-toolbar-main-with-side/ framework/ai2/2026/10/02/ai-system-docs-the-system-tab-now-explai/
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 516 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme
- [ux/tasks](/framework/ux/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Task resolution: what becomes a task, and how every task en…](/framework/core/Task/doc/resolution.md) — Today a task ends only if the agent remembers to end it. This page is the model that makes it end on purpose: few tasks, each linked to the…
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [AITask — how it got here](/framework/ai/AITask/doc/waves.md) — > Superseded 2026-09-17. feed.js and replay.js, the two transcript > viewers this file's later waves describe, were replaced by one > conve…
- [Follow-up: every task of the last 10 days](/framework/ai/doc/follow-up-full.md) — 1200 tasks, flagged first. Summary: [follow-up.md](follow-up.md). | task | group | session | model | started | last log | step | state buck…
- [Process — a task whose children are named phases, and node …](/framework/core/Task/doc/process.md) — The name's scope: here a process is a *way of working* (a Task subclass). Not Servex/Process.js (one supervised child program, such as a de…
- [Task templates: the routine procedure is a field, and node …](/framework/core/Task/doc/templates.md) — What this is: a task says what kind of work it is (template: "code"), and node does the routine steps that kind of work always needs: the w…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Owner notes, 2026-10-17: routine procedures in the task sys…](/framework/core/Task/doc/owner-2026-10-17-node-driven.md) — Sixth note. The owner's words are verbatim in [requirements-15.md](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/re…

## Sessions tagged with these words
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/16 [Transcripts.mjs essence file builder](/framework/ai/sessions/2026/10/16/session-7d42f623/) — kind/owner model/sonnet mod/server task/past-work servex/transcripts · $1.26
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79

## Owner asks
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,093 tokens of reading, under the 100k limit).

Question: TaskLoop: node chases every started task that goes quiet

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "TaskLoop: node chases every started task that goes quiet"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
