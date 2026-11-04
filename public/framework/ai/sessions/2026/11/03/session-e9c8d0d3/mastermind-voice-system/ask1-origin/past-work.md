<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Ask 1  a task filed by the voice agent carries its origin  Budget   4 " (words: ask, task, filed, voice, agent, carri, origin, budget)

## Tasks (8, best first)
- 2026-11-02 [Task close loop: agents complete their own tasks](/framework/ai/sessions/2026/10/20/session-e00f55c9/task-close-loop/) — An agent that stops with finished work now closes its own task; otherwise it is woken once. clean end + finished work completes the task, one wake otherwise: close-loop.test.mjs ok StaleClose never abandons real work (unclosed): abandoned 459 -> 76, unclosed …
- 2026-10-25 [Session page: voice sessions no longer stall Overview/Timeline/Tasks/…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-page-blank/) — Voice session pages now load: Overview, Timeline, Tasks, Board and Coverage fill in, and the empty white strip is gone. Overview, Timeline, Tasks no longer blank: Overview shows 2 child sessions / 23 tasks, Timeline 229 events (f4e929097) Board and Coverage p…
- 2026-10-25 [Voice sessions: filed in the dated store, costed, Opus 5.5 smart agen…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/voice-sessions/) — Voice sessions are filed, indexed and costed; the smart agent is Opus 5.5 and keeps its own record. Filed, indexed, shown with cost: v-dwlaoin, 2 child agents, $0.24 total: [shot at 1920](proof/sessions-list-1920.png) Backfill by script: 61 records moved, [ma…
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-20 [cloud-voice-task-system-and-voice-agent-exploration](/framework/ai/sessions/2026/10/20/cloud-voice-task-system-and-voice-agent-exploration/) — (no outcome logged)
- 2026-10-16 [Servex checkup: nudge verified, skill tool and task.home built, dorma…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-servex/) — Compaction nudge verified on dev and logged needs_restart; helper-cost-fix stopped; expensive dormant agents left dormant with a read-don't-wake rule; skill tool and spawn task.home built; per-prompt door answered (ask_mastermind); coordination rule added to …
- 2026-10-02 [Stalled tasks + budget vs actual: Servex/asks/tasks.js writes tasks.j…](/framework/ai/sessions/2026/10/03/stalled-and-budgets/stalled-and-budgets/) — public/framework/ai/tasks.json exists now, regenerated every ~60s. stalled check: 32 of 149 tasks stalled now, e.g. openrouter-harness (owner agent stopped) snooze/kill/re-prioritise verb lines + 3 Servex tools budget vs actual: 8 of 149 tasks have a Budget: …
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 792 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Ask](/framework/ext/Ask/) — used by 42 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — > Superseded 2026-10-26 (the owner): a task now stays in the session that files it; a module folder only with an explicit home. Read [the r…
- [Owner notes, 2026-10-16 (evening): compositing tasks (dicta…](/framework/core/Task/doc/owner-2026-10-16-composition.md) — Companion to owner-2026-10-16-task-system.md. The other voice session's vocabulary is in public/framework/ext/Refine/doc/card-types.md (Tas…
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — > Superseded 2026-10-26 (the owner): a task now stays in the session that files it; a module folder only with an explicit home. Read [the r…
- [Owner notes, 2026-10-16 (night): seeing tasks (dictated; ca…](/framework/core/Task/doc/owner-2026-10-16-ui.md) — Fourth note of the day. The point of the task system: see what was asked for, see what is done, keep working on what is not. Read the three…
- [Task templates: the routine procedure is a field, and node …](/framework/core/Task/doc/templates.md) — What this is: a task says what kind of work it is (template: "code"), and node does the routine steps that kind of work always needs: the w…
- [Owner notes, 2026-10-16 night: migrating old tasks into the…](/framework/core/Task/doc/owner-2026-10-16-migration.md) — ## The problem Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState index.jsonl, the ai/…
- [Owner notes, 2026-10-16: the task system (dictated, capture…](/framework/core/Task/doc/owner-2026-10-16-task-system.md) — Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; th…

## Sessions tagged with these words
- 2026/10/15 [Clarity voice session](/framework/ai/sessions/2026/10/15/session-cbce90d6/) — kind/agent model/sonnet work/read-only task/voice-20261015. framework/ai · $0.23
- 2026/10/14 [Clarity voice connector](/framework/ai/sessions/2026/10/14/session-9a02d4eb/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim servex/voice · $0.15
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27

## Owner asks
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Task pages: grey checkboxes, full-width bars, reports as free content (ui-system brief (after the System class), queued)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)

## Commits
- f410ca24e mastermind role + tasks readme: a restart revives mid-turn agents; an empty revive turn is filed
- 9a8f8627b audio/Recite: answer the highlight-dropout review (findings 1,3,4,5,6; 7-11 noted)
- 0b48d2fae chat-model: step 2 review answered, F7 add() default filed as an owner task
- eb296b8ea v1-order: task record, review and answers; improvements filed (v2 same rule; two failing Dictate tests)
- 5a300b2a8 core/Session: data-shapes build B (default view) task record, review and landing; Session class page error fi…
- 3dafd24ed Move the four module tasks filed by v-9dvbbrn back into its session folder (TaskToSession)
- 21d63d416 session-identity: e00f55c9 consolidated into its 10/20 folder (SessionConsolidate --apply, manifest in the ta…
- ac46ca43f console-allow: core/Task replay messages on session and task pages (pre-existing on michael/dev), until 2026-…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,818 tokens of reading, under the 100k limit).

Question: Ask 1: a task filed by the voice agent carries its origin (Budget: $4)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Ask 1: a task filed by the voice agent carries its origin (Budget: $4)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
