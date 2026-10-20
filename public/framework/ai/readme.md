# AI

**What goes in `ai/` (the rule, 2026-10-13):** a module that exists only to run, show or feed an AI agent or model (`AITask`, `AISession`, `cards`, `rail`), and the AI system's records (the sessions store). A module that AI uses but any page could use too lives next door: `ext/` (JSONL, Chat, Mention, Query), `ux/` or `core/`. Which module is which, and what moves next: [doc/module-homes.md](doc/module-homes.md).

Where the agents' work is recorded, in one tree ([doc/task-folders.md](doc/task-folders.md)):

- **A task** (its log, brief, review): `ai/sessions/YYYY/MM/DD/<session>/<task>/`, made by `node Server/TaskDirs.mjs --new <slug>`; the day's log is `ai/sessions/YYYY/MM/DD/day.jsonl`. A script that writes a record of its own (a crawl, a council) asks `TaskDirs.dir({slug})` for the folder, never joins a date itself.
- **An Inbox card**: its folder is `ai/sessions/YYYY/MM/DD/cards/<card>/` (one tree since 2026-10-13); its id and its page stay `2026/10/13/<card>` and `/framework/ai/2026/10/13/<card>/`. Make one with `create_card`; turn an id into its folder with [`cards/CardDir.js`](cards/CardDir.js) (`Cards.dir(id)` in Servex), never by joining a path ([doc/task-folders.md](doc/task-folders.md#2026-10-13-one-tree-applied)).
- **Nothing else** is created under `ai/`: no `ai/<YYYY-MM-DD>/` day folder (refused since 2026-10-13), and a file about a module lives in that module's folder (its `readme.md`, or a `doc/<topic>.md` beside it).

The AI system: Servex runs the agents, the readme chain is their memory, each task is a folder with a JSONL log, and node (not memory) drives the steps. Components shown, one card each: [System tab](/framework/ai/system/). **Why it is shaped this way: [doc/architecture.md](doc/architecture.md).**

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): the page tabs, in full.

## Every system, one line each

Accounting first. Each link is that system's own short readme; follow it to go one level deeper.

- **Tasks** (a task is a folder with a `task.jsonl` log, in the session store or a module's `tasks/`; who makes one, how to see them): [doc/tasks.md](doc/tasks.md) · lifecycle proposal: [doc/task-lifecycle.md](doc/task-lifecycle.md) · [tasks/readme.md](tasks/readme.md) · [/framework/ai/tasks/](/framework/ai/tasks/)
- **Accounting**: [token accounting](doc/tokens/tokens.md) · [spend per session](sessions/readme.md) · [budgets](/framework/servex/doc/budget.md) · agent logs: `%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl`, one per Servex agent, with a `turn_cost` line per turn since 2026-10-13 ([what is in them](sessions/2026/10/16/voice-20261016/accounting/answers.md))
- **Cloudflare** (what we would use, what it costs, the token you give us, the runaway guard): [doc/cloudflare.md](doc/cloudflare.md)
- **Skills proposals** (what to add or retire, 2026-10-13): [doc/skills-proposals-2026-10-13.md](doc/skills-proposals-2026-10-13.md)
- **Repo size** (what git holds, what should be committed, the plan to slim it): [doc/repo-size.md](doc/repo-size.md) · `node Server/RepoSize.mjs`
- **Servex** (runs the agents): [readme](/framework/servex/) · [SDK](/framework/servex/doc/sdk.md) · [decisions](/framework/servex/doc/architecture.md)
- **Dev server**: [Server/readme.md](/framework/dev/)
- **MCP tools**: [doc/agents/mcp.md](doc/agents/mcp.md)
- **Models**: [system/models](system/models/) · [OpenRouter](/framework/servex/) · local
- **Usage pace** (how fast the week's limits are being spent against the clock, three meter variants beside today's): [usage/](usage/readme.md) · `node Server/usage-now.mjs`
- **Undone asks** (every ask with no landed task or card, by module, computed daily): [asks/undone](/framework/ai/asks/undone/) · [verdict](doc/undone-asks-2026-10-17.md) · `node Server/UndoneAsks.mjs`
- **One state** (every task in both stores, one bucket each, with a self-check; every count reads it): `state.json` here, written by [Server/State.mjs](/Server/State.mjs) · [design](/Server/doc/state.md) · [why](doc/one-state.md) · the dashboard [tasks/](tasks/readme.md) shows its check in red when it fails
- **One dashboard** (the Inbox is the one list over `state.json`: Live / New / Recent / Older / Needs-you chips and a Kind row, every state a url; `/framework/ai/tasks/` and `/tasks/` are saved filters of it): [doc/one-dashboard.md](doc/one-dashboard.md) · **Built: steps 1, 2 and 3 (2026-10-19, last code commit 38628861d)**, [the plan](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/plan.md)
- **What happened 10-17 to 10-19** (your asks in order, what landed each day, what waits on you, the usage numbers explained): [doc/overview-2026-10-17-to-19.md](doc/overview-2026-10-17-to-19.md)
- **Asks tally** (every ask you typed since 09-15, counted by feature, with what landed and what never did): [doc/asks-outcomes.md](doc/asks-outcomes.md) · `node Server/AskTally.mjs page`
- **Follow-up** (what fell through the cracks, computed; plus unused-file census): [doc/follow-up.md](doc/follow-up.md) · [doc/unreferenced.md](doc/unreferenced.md) · `node Server/FollowUp.mjs --write`
- **Sessions** (VS Code tabs, browser voice agents, cloud voice agents): [sessions/](sessions/readme.md) · [conversations](doc/logs/conversations.md) · **what goes in a session vs a module doc** (log level, may be purged, links the doc; vs persistent, links the session): [doc/sessions-vs-docs.md](doc/sessions-vs-docs.md) · cloud voice agents: [guide](/framework/servex/remote/doc/cloud-voice-agent.md) · [logging](/framework/servex/remote/doc/voice-logging.md)
- **Audits** (every audit we ran, with a verdict and whether it was followed up): [audits/readme.md](audits/readme.md)
- **Transcription**: [ux/Dictate](/framework/ux/Dictate/)
- **Class cards, live** ([classes](/framework/ai/classes/)): a class, its API, and a debug tree of a live instance beside its rendered view. First: Session.
- **Prompt refinement** (Echo, running now): [Servex/doc/echo.md](/framework/servex/doc/echo.md) · [ext/Refine live demo + Prompt class](/framework/ext/Refine/) · [vision](/framework/ext/Refine/doc/vision-2026-10-08.md) · [dictation connection map](/framework/ai/doc/design/dictation-refine-connection-map.md) · **new 2026-10-16, owner notes:** [card types + the plan → proposal → task lifecycle](/framework/ext/Refine/doc/card-types.md)
- **Page system**: [core/Page](/framework/core/Page/) · [ext/JSONL](/framework/ext/JSONL/)
- **Handover as a query** (plan: handover computed at read time from the task logs, not hand-written): [doc/handover-query.md](doc/handover-query.md)
- **Past work** (look before you build): [past-work-index.md](past-work-index.md), generated from every landed task; search a topic with `node Server/PastWork.mjs <topic>` (the `past-work` skill)
- **Finding past work** (owner asks 1 to 3, 2026-10-17: where the query stands, "does it exist" before a build, how readme indexing works): [doc/owner-2026-10-17-finding-past-work.md](doc/owner-2026-10-17-finding-past-work.md) · [salvage branches decided](doc/salvage-2026-10-17.md)
- **Skills and CLAUDE.md**: [skills](../../../.claude/skills/)
- **Dashboard, Log, Inbox**: the tabs above · [AI 2 (merged into this folder, old address kept)](/framework/ai2/readme.md)
- **AITask** (one task's log, a day, the board; moved here from `ext/`, 2026-10-13): [AITask/readme.md](AITask/readme.md)
- **Classes that draw it** (moved here from `ai2/`, 2026-10-09): [cards/](cards/) — `Card` and what a card shows (chat, compose, outline, activity, tasks, faces…) · [rail/](rail/) — `AIRail`, `CardList`, `Groups`, the Live card, Needs, Log, Overview, Processes · [archive/ai2](archive/ai2/readme.md) — old AI 2 page logs, kept
- Sizes and freshness of all of them: [systems-map.md](systems-map.md) · **Organization** (what goes where; System class, hourly check): [doc/organization.md](doc/organization.md) · [Systems](/framework/ai/systems/)

- **Page parts** — a page body as a streamed list of parts: [`core/Page/parts/readme.md`](../core/Page/parts/readme.md)
- **Page tool** — agents change any page by path + delta: [`core/Page/doc/page-tool-2026-10-09.md`](../core/Page/doc/page-tool-2026-10-09.md)
- **New 2026-10-12:** [core/Property](../core/Property/readme.md) · [core/Page/Template](../core/Page/Template/readme.md) · [ext/Shots](../ext/Shots/readme.md) · [ext/Query](../ext/Query/readme.md) · [ext/DataGrid](../ext/DataGrid/readme.md) · [code/performance](../code/performance/readme.md)
- **Inbox timeline** (everything built and everything waiting on you, ranked): [the timeline](/framework/core/Page/ext/Inbox/timeline/) · [where its data lives](../core/Page/ext/Inbox/doc/inbox-data.md)
- **PageInbox** (a note left on a page reaches its owner): [PageInbox.js](../core/Page/PageInbox.js) · [inbox tab](../core/Page/doc/inbox-tab.md)
- **Module inbox** (an ask's essence goes to the module's `inbox.jsonl`, a fresh mastermind reads it later): [Servex/doc/module-inbox.md](/Servex/doc/module-inbox.md)
- **UI library** (every ui and Figma item): [library](../library/readme.md) · **Layout catalog**: [layouts](../../layouts/readme.md)
- **Step runner** (a task as ordered steps): [Servex/doc/steps.md](../../../Servex/doc/steps.md)

## Start here

- [systems-map.md](systems-map.md): where every major system lives, how long its readme is, and when it last changed.
- **[doc/readme.md](doc/readme.md): the index of every AI-system doc**, by subsystem (design, agents, tokens, logs, tasks, ai2, meta). Sessions docs: [sessions/doc/readme.md](sessions/doc/readme.md).
- [doc/architecture.md](doc/architecture.md): the decisions behind this folder, and where they came from.
- [doc/tool-collapse.md](doc/tool-collapse.md): recommended next, fewer tools with a generic `call` as step one (plan only).
- [doc/cleanup.md](doc/cleanup.md): cleanup items the owner noticed (duplicate task folders, session names that are not links).
- Servex SDK: how an agent is started ([`Servex/doc/sdk.md`](/framework/servex/doc/sdk.md)) and Servex's own decisions ([`Servex/doc/architecture.md`](/framework/servex/doc/architecture.md)).
- [doc/design/systems-overview.md](doc/design/systems-overview.md): full AI architecture, persistence, triggers, and MCP tool/session logging audit.
- [todo.md](todo.md): what's waiting, in priority order, and what only you can do.
- [handover.md](handover.md): the state of the world for a fresh tab or mastermind.
- [doc/agents/autonomy.md](doc/agents/autonomy.md): dynamic heartbeat, unstuck protocol, node-based steps, truthful token accounting.
- [Asks](asks/): every ask you made today onward, who owns it, and whether it landed or stalled.
- [The ask loop](council/): everything you asked, whether it was built, and what the council found. Open asks come first.
- [AI 2, now part of this folder](/framework/ai2/readme.md): the old dashboard address. Talk to the assistants, see tasks by group, and see
  what each one cost.
- **Today** and **Yesterday** are pinned rows above the rail (same mechanism as the Now card,
  `ai/rail/rail.js`'s `build_day_items()`) — each opens that day's summary: cost (two currencies),
  tasks started/landed/open, and the owner's own prompts, refined (`ai/AITask/day-prompts.js`).
  Yesterday stays bold until opened. Prev/next day arrows sit on the day page itself.

## For a fresh session

- [handover.md](handover.md): the state of the world, in one screen.
- [doc/design/systems-overview.md](doc/design/systems-overview.md): full architecture, data flow, MCP tools catalog, and logging gaps.
- [doc/agents/autonomy.md](doc/agents/autonomy.md): rules for hands-free masterminds, pacing, and minion delegation.
- [doc/logs/conversations.md](doc/logs/conversations.md): where web dictation logs and VS Code sidebar mastermind sessions live.
- [handoff2.md](handoff2.md): the plan from 2026-09-24, with
  [your exact words](handoff2-owner-words.md).
- A task's folder holds `task.jsonl` (its log) and usually `requirements.md` (its brief).

## Watch out
- Moved verbatim to [doc/watch-out-2026-10-12.md](./doc/watch-out-2026-10-12.md): the watch-out list.

## Also here (readme audit, 2026-10-13)
- [AISession](./AISession/) — one Claude session's cost, read from its transcript
- [audits](./audits/) — read-only audits of how the framework is built
- [dashboard](./dashboard/) — a grid of live previews, stalled tasks first
- [health](./health/) — page health monitor, checks every page in a hidden browser
- [local](./local/) — talk to a model running on this machine's own GPU
- [quick-fix](./quick-fix/) — log of every quick-fix request
- [review](./review/) — review questions per system, read live from the skills
- [talk](./talk/) — press the mic, talk, see your words
- [tests](./tests/) — test library: small tasks with known-good outcomes
- [unreferenced verdicts](doc/unreferenced-verdicts.md) — 167 unreferenced candidates judged, 0 dead; a mover with undo, not run
