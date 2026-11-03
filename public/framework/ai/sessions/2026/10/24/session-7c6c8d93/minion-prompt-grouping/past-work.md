<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Prompt breakdown  one parent outcome task per prompt  prompt breakdown items 10  11  12 " (words: prompt, breakdown, one, parent, outcome, task, per, item)

## Tasks (8, best first)
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-15 [live: Today card shows done vs waiting on X](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) — Today has 4 tasks done and 3 waiting; two finished tasks are now closed. - Waiting: handover-query (snoozed until 2026-10-18 by mastermind-voice-20261016), task-closeout (in flight), voice-20261016 (parent, agent active). - Closed with a landing line: live-fe…
- 2026-10-25 [A child session is a task in its parent's record; recompute only what…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/child-tasks/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/child-tasks/requirements.md
- 2026-10-20 [Item and Page readmes: one persistence system; indexing is the tool's…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/item-page-docs/requirements.md
- 2026-10-20 [ai: prompt breakdown — brief loosened, outcomes, chat view, refinemen…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/prompt-breakdown/) — requirements.md
- 2026-10-13 [Undone to tasks: 229 verified-undone asks are idle tasks in their mod…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/undone-to-tasks/) — 229 tasks created and 229 asks now link to them (229 minus 0 that already had one). 0 were already tracked, 0 had no module. Each ask on the undone-asks page links its task; /tasks/ shows them folded per module. node Server/UndoneToTasks.mjs --plan / --apply … · paths 1/1 exist
- 2026-10-13 [Asks tally: 859 asks, 309 features, what landed and what never did](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/) — [Your asks, tallied](/framework/ai/doc/asks-outcomes.md): 859 asks in 1,990 of your prompts since 09-15, grouped into 309 features. 101 done, 118 partly, 90 with no evidence. Asked most, not finished: 1. session system: 47 asks, partly 2. task system: 33, par…

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 42 files
- [core/Property](/framework/core/Property/) — used by 3 files
- [core/Task](/framework/core/Task/) — used by 795 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Task lifecycle: one design for prompt to landed change (pro…](/framework/ai/doc/task-lifecycle.md) — See also: the seven-step shape of a bigger task (requirements and plan, a minion builds, a fresh reviewer, merge, land) is in the [mastermi…
- [Item — an arbitrary persistent thing: an id, a data bag, on…](/framework/core/Item/readme.md) — ## One persistence system with Page Page extends Item: [core/Item](/framework/core/Item/) and [core/Page](/framework/core/Page/) are one sy…
- [day-prompts.js notes](/framework/ai/AITask/doc/day-prompts-notes.md) — ## WHERE THE WORDS LIVE Every owner prompt is one Prompt item on its own session page — /framework/ai/<Y>/<M>/<D>/session-<id>/page.jsonl (…
- [Item architecture — a headless data node, saved as one docu…](/framework/core/Item/doc/architecture.md) — Item is one persistent thing: an id, a data bag, one set(delta), and a place to save. It runs in plain node (no DOM, no transport). Main cl…
- [One stream for the UI, node and the agents: a design (not b…](/framework/core/Item/doc/one-stream.md) — Status: design, 2026-10-22, by the system architect. Building waits: the owner put the full nested-items work behind sessions, tasks and pr…
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [Adoption: how parent stays one hop](/framework/core/List/doc/adoption.md) — Every Item owns exactly one List, built as new List({ owner: this }). The owner reference is the entire mechanism behind a rule that spans …
- [Property — one live value you can bind to](/framework/core/Property/readme.md) — class Property extends Events(Object): get(), set(v) (emits change(value, old) only if it changed), bind(fn) (calls fn now and on every cha…

## Sessions tagged with these words
- 2026/10/13 [Core Item architecture](/framework/ai/sessions/2026/10/13/session-5d65b684/) — kind/agent model/haiku mod/core/item task/mastermind-repo-slim docs/architecture · $0.23
- 2026/10/13 [ui/item architecture](/framework/ai/sessions/2026/10/13/session-22769fe8/) — kind/owner model/haiku mod/ui/item task/mastermind-repo-slim docs/architecture · $0.19
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## Commits
- 68f0eea35 ai: prompt-breakdown plan (outcome rules, tab routine, chat-view mockup), voice-tab split option, one subscri…
- 9a1dd4874 session-cost: per-prompt Claude $ reader, Stop-hook append, week-cost snapshot

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,755 tokens of reading, under the 100k limit).

Question: Prompt breakdown: one parent outcome task per prompt (prompt-breakdown items 10, 11, 12)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Prompt breakdown: one parent outcome task per prompt (prompt-breakdown items 10, 11, 12)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
