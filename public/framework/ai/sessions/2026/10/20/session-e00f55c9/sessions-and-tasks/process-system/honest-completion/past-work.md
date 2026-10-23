<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Task  honest completion  accepted state  and tab spawns get a parent" (words: task, honest, completion, accepted, state, tab, spawn, get, parent)

## Tasks (8, best first)
- 2026-10-20 [AI system: task resolution model, where tasks get lost, session-flow …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/) — Task resolution is defined; session-flow is ready to merge. - ✅ [resolution.md](/framework/core/Task/doc/resolution.md): what is a task (only an ask), 1–3 per prompt, requirement = subtask / suggestion = text, linked to the raw prompt, completion with evidenc…
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-19 [AI page layout: compact toolbar, no scroll-in-scroll, Tasks tab](/framework/ai/sessions/2026/10/19/cloud-voice-live-page/tasks-layout/) — Merged to michael/dev. Chips are one sideways-scrolling line; Waiting on you is a plain section (45vh box off, AI page only); phone is one page scroll with one-line tabs; Tasks tab added. 7 past asks recorded in ai/doc/dashboard-layout-asks.md and linked from…
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-15 [Dictation: fast is silent, smart replies in 6.8 s cold, no task from …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-next-4/) — Merged c2a9dfea6. Fast replied to 0 of 8 unaddressed sentences (was 4); smart cold first reply 46 s to 6.8 s, context 68k to 44k (not half; 6 s target missed by 0.8 s); a statement spawned 0 task-masterminds. Inbox 404, stale Mic line and a 60% sheet fixed. R…
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-13 [aitask-views](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/aitask-views/) — Task page gets a Tree tab (Lanes/Outline/Flow, ?view=) for any task with subtasks; tree_for_task and tree_for_day now read the task index (directory.json is frozen, so the day tree was empty); doc/views.md maps every view with screenshots; feed.js is wired to…
- 2026-10-13 [ext/drawer: the phone sheet's full state is the sidebar's tabs](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-sheet/) — The sheet's full state mounts the drawer tab row and body under the chat; mic keeps listening; mic-proof passes; merged 6441b0642 (change 4cb0adf91). 400 px shots only; 1200/1920/3440 layout-check not run.

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 516 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/table](/framework/ui/table/) — used by 9 files

## Docs and readmes
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [The owner on projects, completion and dated folders (2026-1…](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md) — Notes for the next Task refactor, from a dictation to the VS Code mastermind. The whole dictation: [ai/doc/owner-2026-10-20-who-makes-tasks…
- [asks.js — Asks Tab Design Notes](/framework/ai/AITask/doc/asks-notes.md) — ## The Asks Tab Shows everything the owner asked for in this session as preview cards, each linked back to the sentence they said it in. On…
- [Sessions and tasks: a spawned agent is a session, a task is…](/framework/ai/doc/sessions-and-tasks.md) — Decision (the owner, 2026-10-19). The naming was the bug. An agent the SDK spawns is a session: it has a session id. It is not a task. We u…
- [Task — a DOM-free unit of work: id, title, a state machine,…](/framework/core/Task/readme.md) — ## Status (verified 2026-10-19 against the code) - Built and tested: the state machine, subtasks, replay of task.jsonl (node Task.test.mjs,…
- [Decisions — every choice, with the alternatives it was chos…](/framework/ai/AITask/doc/decisions-tab.md) — A worker makes dozens of choices an hour and the owner sees none of them. They see the result, they say "that's not what I wanted", and nob…
- [Prior work — every piece of layout and paging work found, i…](/framework/core/Page/layout/doc/prior-work.md) — Three read-only surveys went through /imagine/ and /layouts/, through framework/, and through two months of task logs (2026-09-29). This is…
- [Settings — tabs that manage themselves, and a page's own na…](/framework/core/Page/settings/readme.md) — ## What Two small additions to page.jsonl (core/Page/doc/jsonl.md has the full format), both read by core/Page/Log.js: {"tab": {"name": "di…

## Sessions tagged with these words
- 2026/10/15 [Spawn policy review](/framework/ai/sessions/2026/10/15/session-e94bf72b/) — kind/agent model/opus work/read-only task/spawn-policy servex/policy · $0.60
- 2026/10/15 [Spawn policy review](/framework/ai/sessions/2026/10/15/session-50064889/) — kind/agent model/opus mod/ai/sessions task/spawn-policy · $0.82
- 2026/10/15 [Spawn policy mastermind role](/framework/ai/sessions/2026/10/15/session-35ca9f31/) — kind/owner model/sonnet work/read-only task/spawn-policy framework/sessions · $0.90
- 2026/10/13 [ext/tabs architecture documentation](/framework/ai/sessions/2026/10/13/session-f9024369/) — kind/agent model/haiku mod/ext/tabs task/mastermind-repo-slim docs/architecture · $0.21
- 2026/10/13 [Minion arch table](/framework/ai/sessions/2026/10/13/session-0c0416a5/) — kind/agent model/haiku mod/ui/table task/mastermind-repo-slim docs/architecture · $0.18
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90

## Owner asks
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Mentions: paths like @Servex/Heartbeat (parent/child) (task-mastermind-mentions, routed)
- 2026-09-30 Servex: process monitor (PIDs, RAM/CPU per task, graph, orphans) (task-mastermind-dormant-idle, building)
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-09-30 Monitor: a Playwright agent on main; template changes get console + screenshot + stall ch… (mastermind-servex (10 PM, first in the task), queued)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,093 tokens of reading, under the 100k limit).

Question: Task: honest completion, accepted state, and tab spawns get a parent

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Task: honest completion, accepted state, and tab spawns get a parent"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
