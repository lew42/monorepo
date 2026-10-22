# AI system docs: the index

One folder per subsystem, one current doc per topic. Load the folder you need; the rest costs nothing. Superseded files sit in [`archive/`](archive/moved.md) with a line saying where their content went (nothing is deleted). The Sessions tab has its own docs: [`../sessions/doc/`](../sessions/doc/readme.md).

## Maps: read one before you dig

A map lists every piece of one system (each class, tool, writer and file) in one place, checked against the code. When you had to search for how something works, the answer belongs in its map. These docs are kept by the system architect (`mastermind-system-architect`); a map that is wrong gets fixed in the task that found it.

| Map | What it lists | Read it when |
|---|---|---|
| [agent-context.md](agent-context.md) | What each role is given to read at start (readme chain, role readme, skills, tools) and what it costs in tokens | you change what an agent reads, or an agent seems not to know something |
| [Servex/doc/tools-map.md](/Servex/doc/tools-map.md) | Every Servex tool, grouped, and the compacted set | you add, rename or look for a tool |
| [core/Item/doc/map.md](/framework/core/Item/doc/map.md) | Every class, store, tool and writer that makes or saves items | you write or read a JSONL log, page, task or session |
| [core/Task/doc/process.md](/framework/core/Task/doc/process.md) | Processes: a task whose phases node runs in order (Process, ProcessRunner, `item` tool) | you run multi-phase work or touch task completion |
| [records.md](records.md) | Every file in `ai/`, its writer and its reader | you wonder who writes a record |
| [../systems-map.md](../systems-map.md) | The systems and how they connect | you cross systems |
| [ux/Dictate/doc/map.md](/framework/ux/Dictate/doc/map.md) | Every dictation piece (mic, Whisper, cleaners, chat, voice) | you touch dictation |

## Folders and topics

| Folder | What is in it | Load it when |
|---|---|---|
| [`architecture.md`](architecture.md) | The decisions behind the AI system, newest first | you change how it is built |
| [`prompt-audit.md`](prompt-audit.md) · [`audits.md`](audits.md) | The two-pass prompt audit (what the owner asked in a session, and what came of it); the map of every older audit system | you look for loose ends, or are about to build another audit |
| [`ai-folder-audit.md`](ai-folder-audit.md) | What each entry in `ai/` is, who writes and reads it, and where it should go | you wonder where a file in `ai/` belongs |
| [`design/`](design/systems-overview.md) | The big picture: [systems overview](design/systems-overview.md), [tooling](design/tooling-architecture.md), [per-module `ai/` folders](design/module-ai-dirs.md), [dictation to Refine](design/dictation-refine-connection-map.md), [the website shows everything](design/website-shows-everything.md) | you are new, or crossing systems |
| [`agents/`](agents/mcp.md) | How agents behave: [MCP tools](agents/mcp.md), [autonomy](agents/autonomy.md), [concurrency](agents/concurrency.md), [interrupts](agents/interrupts.md), [pass by reference](agents/pass-by-reference.md), [ground truth](agents/eval-truth.md) | you touch Servex agents or their tools |
| [`tokens/`](tokens/tokens.md) | [How cost is counted and cut](tokens/tokens.md), [context windows](tokens/context-window.md) | you spend or measure tokens |
| [`logs/`](logs/log-sources.md) | [Where the owner's asks live](logs/log-sources.md), [the universal log tool](logs/log-tool.md), [inbox + streaming](logs/inbox-log-streaming.md), [conversation logs](logs/conversations.md) | you read or write a log |
| [`sessions-and-tasks.md`](sessions-and-tasks.md) | [Sessions and tasks: a spawned agent is a session, a task is something to finish (the plan)](sessions-and-tasks.md) | you rename, spawn or count sessions and tasks |
| [`context-loss.md`](context-loss.md) | [A session's work survives only in files: what is lost, where to write it, what replaces a handover](context-loss.md) | you end a session, hand work on, or wonder where to write something |
| [`owner-2026-10-20-who-makes-tasks.md`](owner-2026-10-20-who-makes-tasks.md) | [The owner on sessions, tasks and losing work: who is who, dated module tasks/, the day list with check marks, decision cards, the class hierarchy first](owner-2026-10-20-who-makes-tasks.md) | you touch the task system, the sessions page or the day list |
| [`task-lifecycle.md`](task-lifecycle.md) | [Task lifecycle: session is the log, module is a query, six phases (proposal)](task-lifecycle.md) | you design how prompts become tasks |
| [`tasks.md`](tasks.md) | [Tasks: what, where, who makes one, what to open](tasks.md) | you open or read a task |
| [`tasks/`](tasks/tasks.md) | [Tasks and the one queue](tasks/tasks.md), [priorities](tasks/priorities.md) | you change tasks or the queue |
| [`ai2/`](ai2/overview.md) | AI 2 (the card dashboard): its own docs, plus [AI 2 vs AI](ai2/ai2-vs-ai.md) and [branches](ai2/branches.md) | you work on the board |
| [`organization.md`](organization.md) | What goes where, when and why; the System class and hourly check | you add a page, readme or check |
| [`module-homes.md`](module-homes.md) | Which modules belong in `ai/`: the rule, the census, what moved, what moves next | you create or move a module |
| [`writing.md`](writing.md) · [`readmes.md`](readmes.md) · [`classes.md`](classes.md) | The finer points behind the root CLAUDE.md rules on writing, readmes and classes; [`claude-md-archive.md`](claude-md-archive.md) keeps the original wording of every rule that was shortened; the [review page](../sessions/2026/10/12/session-3b391f22/claude-md-consolidate/review.md) shows what changed | you write a page, a readme or a class |
| [`meta/`](meta/history.md) | [How the AI system evolved](meta/history.md), [readme system status](meta/readme-system-status.md) | you audit the docs |

Naming rule: a doc is named for its topic, not its date; the date and the session that decided it go on its first lines. Words like "never" are for what really breaks; the rest are suggestions.

- [`models.md`](models.md) — which model for which job, measured, with the voice fallback.
- [`asks.md`](asks.md) — the owner's repeated asks about the AI system, merged and checked against the code, open first.
- [`skills-proposals-2026-10-13.md`](skills-proposals-2026-10-13.md) — the skills review: what was cut from `.claude/skills/` (−19% words), the conflicts fixed, and the changes still waiting on a decision (CLAUDE.md ones first).
- [`tool-collapse.md`](tool-collapse.md) — 81 Servex tools cost about 18k tokens in every Servex-spawned agent; measured, with a tiered plan to load only what is used (plan, nothing built).
