# The owner on sessions, tasks and losing work (2026-10-20, dictated to the VS Code mastermind)

The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows in *italics* where one exists. Read with [sessions-and-tasks.md](sessions-and-tasks.md) (the plan) and [tasks.md](tasks.md) (how it works today).

## 1. Who is who

- A VS Code tab (this mastermind) is **not managed by Servex**; it reaches Servex only through the Servex MCP and spawns helpers with `spawn_agent`. The owner notes local-to-local over the network is a little unnecessary but fine for now. *True. The tab uses the local `servex` MCP over loopback (`Servex/MCP.js`), not the cloud tunnel; Servex has no command line of its own.*
- A **session is a context window**: one session id. Accounting must follow the session exactly. Tasks are created inside it.
- A **task goes into the session by default**, unless the agent judges it better to put it in a directory's `tasks/` folder. Any module or path may have its own `tasks/`, so tasks can be per module.

## 2. Dated `tasks/` folders in a module

The owner leans towards `tasks/YYYY/MM/DD/<slug>/` (like `ai/sessions/`): archiving is easier, a month can be loaded as a chunk, and a flat `tasks/` by name fills its namespace and needs a giant index. "Look into that." *Open: 73 module homes hold about 500 tasks today (`Server/TaskHomes.mjs`). Decision to be made with `Server/Decide.mjs`, options ranked; the move is a script with a manifest, never retyped.*

## 3. When a task is created

- Not per tool call. But the owner wants more insight into **what agents actually do** (tool calls, thinking) without duplicating the SDK transcript. *The transcript is still served live from `~/.claude/projects` by `Server/plugins/AILogs.js` (`GET /ai-logs/<uuid>`); the session detail page reads it.*

## 4. The sessions page needs an overhaul

Built on the page inbox and column pages, which the owner does not understand; needs a compact **mobile** UI: sessions, cost, filter by day. `/framework/ai/sessions/` is a DataGrid (resizable columns, a default list view for any data type) but it wastes space. *The AI dashboard at `/framework/ai/` was rebuilt 10-19 (sessions by origin, nested by parent, cost rolled up, mobile first); the sessions DataGrid page was not. Not yet redone.*

## 5. Losing work (the biggest problem)

> "I sit here all day asking for things and then they just disappear into the ether."

- The owner wants a **limited set of not-done tasks**, visible, each one checked off when it is done, finished by the end of the day. Not 7,000 open tasks and audits nobody follows up. Every single ask gets done, checked, next.
- The handover file relies on an AI remembering to write; the owner would rather have an **automated task system** that records what the SDK sessions do.

## 6. The task system upgrade

- `Project` is "maybe not the worst way". Tasks are recursive (`tasks` list made on first use). Processes are task trees: investigate → plan → propose class architectures → build.
- **Nail the class hierarchy first.** Open questions the design must answer: can a task hold a project? Do a project's tasks run in series or parallel, and is that a choice? Structure it once so it is not redone.
- **No plan mode, no owner approval of plans**: the mastermind approves plans and keeps moving.
- **Document major decisions**: when there are two ways, write the options, pros and cons, rank them, the best wins, and the decision shows as a card on the task's page. *This is what `Server/Decide.mjs` (the `decide` skill) writes; the task page must show the `decision` lines as cards.*

## 7. Indexing and the readmes

- The presence of every system must be abundantly clear in CLAUDE.md and `framework/readme.md`: an overview of what is inside and when to use it. Not every agent reads every module readme.
- Many systems were built (`framework/code`, `framework/design`, …) without being made to work properly. The owner is unsure they work at all; chasing old work into place may be fighting ourselves. "Maybe it's just better not to say anything and let the AI figure it out."

## What this mastermind does with it

1. The owner's three direct questions are answered above in italics.
2. Next builds, in order: the day's limited list with check marks (section 5); decision cards on task pages (section 6); the dated module `tasks/` decision (section 2); then the class hierarchy page for Task / Project / Session before any task-system rebuild.

## 8. Second dictation (15:30): explain the classes, where a task is saved, the paper trail

- "Don't assume I read your responses." A reply that names a file (`Server/SessionRecord.mjs`, a "probe") without saying what it is, when it is created and when it is saved, does not help. *Rule for this mastermind: every class named in a reply gets one line: what it is, when made, when saved.*
- **Where a task is saved** is confusing: a task could be a line in `session.jsonl`, its own `<name>.jsonl` (then it cannot be called `task.jsonl` if there are several), or its own folder when it is complex (logging, files, subtasks). The owner does not want the AI deciding this every time. *Today's rule on disk: a task is always a folder with one `task.jsonl`; a subtask is a line in that log, or its own folder when it has files. A task as one line in the session log is slice 5 of the plan, not built. See the picture in [sessions-and-tasks.md](sessions-and-tasks.md).*
- Can a session's tasks for a module live in the session's folder? *Yes today (the default); the module home `<module>/tasks/` is the agent's choice through the item tool. Section 2 (dated homes) and this question are decided together.*
- **A tail for agents.** The owner wants a minion to write an overview of its work to its own session log (not fine detail; what is open, what it is doing) and the mastermind that spawned it to subscribe to that log, so the paper trail replaces chat for the core work. Chat stays for a quick clarification. *Exists in parts: the `follow` tool (`Servex/Follow.js`, a file change wakes the following agent) and the browser `live()` tail (`ext/JSONL`). Not yet the rule: minions still report by chat and landing lines. To build: a spawned agent's parent follows its `session.jsonl` by default.*
- **Docs go to the module**, never buried in a session folder: readme and `doc/` of the module being worked on, so future agents find them. The owner worries that articulating precisely where things go will be misinterpreted anyway.
- DNS: the owner will edit the token (or make a new one) and asked for the connector URL to paste.

## 9. Third dictation (15:45): indexes by code, projects per module, every session has session.jsonl, the architect

- **Indexes are computed, never kept by hand.** Duplicate data kept in sync is error-prone; any new task, wherever it is, is indexed by a node tool. *This exists: `Server/AIIndex.mjs` replays every task log in both stores into `ai/index.json`, run by Servex's `TaskLoop`; module homes are listed by `Server/TaskHomes.mjs`. Counted 2026-10-20: 539 module tasks in 85 homes (218 complete, 289 idle, 32 stopped); 1,594 session tasks (1,143 complete, 442 stopped, 9 running).*
- **A task starts in the session; it moves to a module when it is finished, or when it grows into a project.** No module should accumulate hundreds of micro tasks. The module organises **projects**, not tasks: `<module>/projects/YYYY/MM/DD/<slug>/` instead of `<module>/tasks/`. A project is a task (it has subtasks, `completion` 0..1), but it is the substantial, named, long-lived thing: a goal, a plan, requirements, investigation, review. Work on a module is tasks under its projects. *Decision to make with options ranked; the 539 existing module tasks move by script. Recorded for the Task class: [core/Task/doc/owner-2026-10-20-projects-and-completion.md](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md).*
- **Naming:** `complete()` as the verb, `completion` as the 0..1 property. A proposal for the next refactor, noted in the Task doc above.
- **The YYYY/MM/DD breakout as one shared system** (sessions, projects, anything dated), maybe an Item extension like the page system's, so archiving, filtering and indexing upgrade everywhere at once. Not now: a note in the Task and Session architecture.
- **Every session folder must have `session.jsonl`**, the one session log, and by default everything about the session goes in there. *Confirmed not true today: a VS Code tab's folder (this one) holds only `cache.jsonl` and `index.json`; only Servex-spawned agents and voice calls get a `session.jsonl`. To build.* `cache.jsonl` = line 1 is the running totals (cost, tokens, messages) plus the byte cursor of how far the Claude transcript was read, so the watcher reads only new bytes; `index.json` = the one current snapshot the sessions grid shows. Both are computed from the transcript by `ai/AISession/AISessionIndex.mjs`, never written by an agent.
- Sessions living under `public/framework/ai/` is fine (browsable, served static).
- **Mobile tables** are a headache either way (fixed widths or crushed fluid columns); the project/task list view is undecided.
- **The tunnel MCP** for the Claude app: the owner is "still not 100% sure this is the right way".
- **Spawn an Opus system-architect mastermind** (not Fable; usage is near the weekly threshold, use lesser minions where possible), finished by the end of the day: read `framework/ai/readme.md`, the systems the AI uses, the Servex readme and the MCP; study the messaging between agents and the tailing of session files; favour logging the current state to the file system over agent messages, so any future agent can read it; write down the context-loss problem (a session's work survives only in files); make sure every important system is in the readmes, as an ongoing rule. *Spawned as `mastermind-system-architect`, brief in `sessions-and-tasks/system-architect/requirements.md`.*

## 14. Evening, said to the cloud voice agent (18:15; words in `ai/sessions/2026/10/20/cloud-voice-task-system-and-voice-agent-exploration/session.jsonl`)

- **Direction, not yet a decision:** one standing SDK mastermind on the PC, renewed every day or so, reached from the Claude app by remote control, so the VS Code sidebar can be retired. The blocker named: remote control needs a logged-in interactive session (credentials), which an SDK agent is not. The voice mastermind (`voice-20261020`) owns the investigation.
- **Agents on different platforms talk through files** (settled 18:12 between the two masterminds, "Across platforms" in `Servex/agents/doc/messaging.md`): each writes only its own `session.jsonl`; parents follow children, peers follow on request, a cloud agent reads on its turn; inboxes are the nudge; nothing is copied.
- The cloud session is listed on the sessions page since 18:05 (record-only sessions get a snapshot).

## 13. Seventh dictation (16:50): prompt flow, Item and Page are one system, certainty levels, indexing by tools

Words in the tab's prompt log. Essence:

- **Prompt flow (a design question, not a build):** the voice agent is fast and cheap and should not turn prompts into tasks; a cleaned prompt goes to a triage mastermind that reads across systems and routes it. A prompt could be an item (raw → cleaned → structured) that is moved into a project; whether it is a line, a file or a folder matters to the move tool.
- **Item and Page are one persistence system** (`Page extends Item`): both readmes should say so and say what goes where; the Item readme names the core classes that extend it. Keep these core docs fine-tuned. A spawned agent that reads both readmes is an Item/Page mastermind.
- **Certainty levels.** The owner's words carry their own firmness (would, could, should, must, never). Record and follow that firmness; "we shouldn't" is not "never"; nothing is set in stone, and a better way around a directive may be considered. Proposed for CLAUDE.md (see the architect's proposal file).
- **Indexing is the tool's job:** a tool that creates or moves an item updates the index itself; an AI never has to remember to index. Belongs in the Item docs.
- **JSONL growth:** keep an eye on file sizes; a few MB is fine, but loading a hundred at once is a processing load. Auto-compaction is one strategy (it loses deltas); noted for `ext/JSONL`.

## 12. Sixth dictation (16:40): the mastermind handles every prompt; items save through their parent; skills audit

Words in the tab's prompt log. Essence, handed to the system architect as round three:

- **Prompt refinement (`ext/Refine`)** is the systematic future (raw → clean → structured → asks, questions, notes → tasks or projects, 100% coverage), but it is broken and unused today, so no tokens go to it per prompt yet. **Until then the mastermind handles every prompt itself, at once**: write what must be written in the right place (check for an existing note first), create the tasks, ask nothing that has no consequence. If a thing was written down and still does not happen, dig: a minion investigates that one problem. This rule goes in the `mastermind` skill.
- **Visibility:** "are these AI systems working? I have no idea." Rock-solid data and logging, from scripts over the session logs (not copies of them). This tab's transcript is already several MB; nothing duplicates it.
- **Items save through their parent.** An item added to a parent item logs its deltas to the parent's store; `item.set(prop, anotherItem)` wires it; not every item needs a file. Breakout is by need and could be dynamic: inside the parent → its own `thing.jsonl` → its own `thing/` directory the moment a real file must be saved beside it. Check whether `core/Item` does this; write it down there as the rule; small unit tests, no new test framework (a testing system is a noted need, not now).
- **One tail system for everything**: `ext/JSONL` `live()` through `Item`, so items, pages, sessions, tasks and projects stream the same way. Verify it is wired through `Item`.
- **Skills audit:** is the `code` skill used, is a skill the right place, any usage data, what belongs in CLAUDE.md versus a skill, sub-skills (CSS) for context efficiency; injection freshens the procedure, so it works when timed right.
- **Reuse before building** (law 6) and **no new separate systems that were not asked for**; a file name the owner gives is used as given. The `state` → `index` rename was asked for; it was right.
- Old AI data: port it (the dry-run move script's real run, reversible with its manifest).

## 11. Fifth dictation (16:15): DRY, the folder audit, index not state, one log tool

Words in the tab's prompt log. Essence, each handed to the system architect:

- **One tool set, two mechanisms:** in-process node tools for SDK agents, the Servex MCP for a tab or a cloud agent; the same tools. Confirmed (`Servex/doc/sdk.md`, `in-process-tools`).
- **No duplicate logs.** The raw transcript is already saved; nothing copies it. The tab-session-record task was cut to line 1 of `session.jsonl`; the architect decides what replaces prompt-relay's verbatim copy.
- **Audit every folder in `framework/ai/`**: what is it, who writes it, where should it go; port the old `ai/2026/…` pattern into the store by script; prune by moving aside.
- **"Index", never "state":** `ai/index.json` and `tasks/index.jsonl` are renamed and folded into one indexing system kept by code (day, month, year indexes already exist for sessions).
- **One log tool:** agents never append JSONL by hand; a node tool stamps time, session, author.
- **One socket** for all live tails, unsubscribed on navigation: verify.
- **Session class:** tasks (projects or tasks), completion from tasks, never complete with a loose end; its class snapshot on its readme.
- **Readmes go stale:** the fix is a gated step in landing, not another sentence.
- **Replies:** shorter; a check-mark list of tasks, hierarchical, queued items included.

## 10. Fourth dictation (16:00): index.json, file names, the query system

Words: the tab's prompt log (`ai/2026/10/20/session-e00f55c9/page.jsonl`). Essence and findings:

- **Is `index.json` a stale minute rewrite?** *No: `Server/AIIndex.mjs` is woken by `fs.watch` (250 ms debounce), re-reads only the changed logs, and appends one line to `ai/index.jsonl`, which the browser tails with `live()`. The weak spot: each line makes the browser refetch the whole `index.json`, 2.4 MB (tasks 1.35 MB as 2,133 index rows: id, dir, title, state, bucket, times; agents 0.4 MB; cards 0.3 MB; sessions 0.2 MB). It is an index of rows with computed state, not a copy of the logs; the check (two independent counts must agree) is the reason it exists. Found 16:01: its watcher was not running (last write 15:31, after today's two Servex restarts); restarted by hand; the architect is told that TaskLoop must notice a dead watcher.*
- **Names must say the class**: `session.jsonl` for a session, `task.jsonl` for a task, `project.jsonl` for a project. `cache.jsonl`, `index.json`, `index.json` are not names anyone can read. "I've asked for that literally 100 times."
- **An index points, it does not copy.** Duplicating a few fields for speed is acceptable sometimes; the default is an index that makes systems aware of what exists, and the client loads what it wants.
- **Server-side query** for thousands of dated files: *exists: `ext/Query` (`QueryServer.mjs` holds items in memory and answers `rpc:query` over the socket; `QueryClient.js`; sources `sessions` and `tasks` from `Server/SessionIndex.mjs`), used by `AISessionsPage.js`; dev server only. And `Server/session-query.mjs` for the CLI. Not used by the Inbox/index.json path.*
- **To fix, queued as the next task after the architect's messaging decision:** (1) fold `cache.jsonl` + `index.json` into the session's own `session.jsonl` (a computed `summary` line by the same watcher) so a session folder is one file named for its class; (2) `index.json` stays the computed index but streams changed rows (`index.jsonl` rows per task), never a 2.4 MB reload; (3) the Inbox reads through `ext/Query` like the sessions grid, one source, server side. Names first, by script with a manifest.

## 15. Sixth dictation (18:50): the voice agent, sessions as the AI truth, one JSONL store, plan before build, skills

Words: the tab's prompt log (`ai/2026/10/20/session-e00f55c9/page.jsonl`, after line 83). Essence, with the owner's certainty kept:

- **The cloud voice agent:** "kind of cool", quicker to send than the tab, reads aloud, but sluggish: it asks a mastermind through the MCP and waits. Speeding that flow up is "definitely top priority". It may be "not a ton of work" worth putting there: trade-offs are phonetic phrasing (it reads aloud, so it says "slash whatever" instead of typing a path) and no code blocks. Worth double checking: when the owner speaks during the wait, the MCP call is interrupted; does the answer ever arrive, and can Servex know whether it was received? Alternative workflow: fire the ask, go back to listening, give a guess, deliver the answer when it comes. Recorded in [cloud-voice-agent.md](/Servex/ext/remote/doc/cloud-voice-agent.md) and sent to the agent and the voice mastermind.
- **Session data is the AI truth:** who is doing what, when, and where it is at. "Everything in flight" should be a query over it, not a mastermind's memory. *Findings: `ext/Query` exists (sources `sessions`, `tasks`, dev server only) and `Server/session-query.mjs` for the CLI; live agents come from Servex `list_agents`; there is no one query over all of it.*
- **Track precisely, never duplicate the raw log:** the session record summarises and references or quotes the transcript, and it must be obvious that the full version is in the raw log.
- **The index per path is managed by code, never out of sync.** "Probably" a portable system: the YYYY/MM/DD breakout as a class or extension that creates the indices by date and answers queries (a chronological data set, a log; the owner had no better name). *Findings: `core/Session/Day.js` is the day rule, `Server/TaskDirs.mjs` makes the folders, and three writers keep indexes (`Server/AIIndex.mjs`, `Server/AIIndexStream.mjs`, `ai/AISession/AISessionIndex.mjs`); no one class.*
- **A JSONL database system:** creating things (sessions, tasks, projects) through the SDK/MCP tools, the UI route through the dev socket triggering the same operations, moves re-indexed, queries that use the indexes. It "kind of feels like" it belongs in `core/Item`: JSONL is one store, swappable for another; any item gets real-time updates. Open and "not really that important" yet: subscribing to a parent item (children update with it) vs a child item alone.
- **One place for the JSONL docs.** The owner remembers them inside `core/Page`. *Findings: three places today: `core/Page/doc/jsonl.md` (page.jsonl), `ext/JSONL/readme.md`, `core/Item/readme.md` (Item.Store).*
- **Plan, then check the plan against the prompt, then build.** Sketch or pseudocode first, cross-reference it with the raw prompt and the requirements (is the essence captured, how could it be better), all before code. "That's actually a good idea"; the system architect should build it into how projects run. Planning brief: [store-index-query](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/requirements.md).
- **Tasks vs projects, ongoing projects, class architecture:** in [core/Task/doc/owner-2026-10-20-projects-and-completion.md](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md) section 4.
- **Skills:** they are Claude-specific (an OpenRouter agent may not use them the same way); keep them few, with adequate descriptions; if we rely on them, track their use by code (a hook on every skill use "maybe"), then read the session data to see whether skills and tools are actually invoked. Is every tool call logged to `session.jsonl`? Not everything must be logged, but "it's kind of crazy that it's still so unclear". *Findings: Servex-spawned agents log tool calls; a VS Code tab logs prompts (hook) and edits (hook), not tool calls; the `Skill` hook logs skill calls (`skills-2026-08-17`).*
- **A sessions UI** that shows everything a session does as it happens, so the owner can dictate from the session page and watch it update.
- Answered in chat: "both tools" meant the `updates` tool and the async ask; the connector paste is done (the voice agent works).
