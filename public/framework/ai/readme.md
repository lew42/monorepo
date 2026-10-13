# AI

Where the agents' work is recorded: one folder per day, one folder per task inside it.

- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): the page tabs, in full.

## Every system, one line each

Accounting first. Each link is that system's own short readme; follow it to go one level deeper.

- **Accounting**: [token accounting](doc/tokens/tokens.md) · [spend per session](sessions/readme.md) · [budgets](/framework/servex/doc/budget.md)
- **Repo size** (what git holds, what should be committed, the plan to slim it): [doc/repo-size.md](doc/repo-size.md) · `node Server/repo-size.mjs`
- **Servex** (runs the agents): [readme](/framework/servex/) · [SDK](/framework/servex/doc/sdk.md) · [decisions](/framework/servex/doc/architecture.md)
- **Dev server**: [Server/readme.md](/framework/dev/)
- **MCP tools**: [doc/agents/mcp.md](doc/agents/mcp.md)
- **Models**: [system/models](system/models/) · [OpenRouter](/framework/servex/) · local
- **Sessions** (VS Code tabs, browser voice agents): [sessions/](sessions/readme.md) · [conversations](doc/logs/conversations.md)
- **Transcription**: [ux/Dictate](/framework/ux/Dictate/)
- **Class cards, live** ([classes](/framework/ai/classes/)): a class, its API, and a debug tree of a live instance beside its rendered view. First: Session.
- **Prompt refinement** (Echo, running now): [Servex/doc/echo.md](/framework/servex/doc/echo.md) · [ext/Refine live demo + Prompt class](/framework/ext/Refine/) · [vision](/framework/ext/Refine/doc/vision-2026-10-08.md) · [dictation connection map](/framework/ai/doc/design/dictation-refine-connection-map.md)
- **Page system**: [core/Page](/framework/core/Page/) · [ext/JSONL](/framework/ext/JSONL/)
- **Past work** (look before you build): [past-work-index.md](past-work-index.md), generated from every landed task; search a topic with `node Server/PastWork.mjs <topic>` (the `past-work` skill)
- **Skills and CLAUDE.md**: [skills](../../../.claude/skills/)
- **Dashboard, Log, Inbox**: the tabs above · [AI 2 (merged into this folder, old address kept)](/framework/ai2/readme.md)
- **Classes that draw it** (moved here from `ai2/`, 2026-10-09): [cards/](cards/) — `Card` and what a card shows (chat, compose, outline, activity, tasks, faces…) · [rail/](rail/) — `AIRail`, `CardList`, `Groups`, the Live card, Needs, Log, Overview, Processes · [archive/ai2](archive/ai2/readme.md) — old AI 2 page logs, kept
- Sizes and freshness of all of them: [systems-map.md](systems-map.md) · **Organization** (what goes where; System class, hourly check): [doc/organization.md](doc/organization.md) · [Systems](/framework/ai/systems/)

- **Page parts** — a page body as a streamed list of parts: [`core/Page/parts/readme.md`](../core/Page/parts/readme.md)
- **Page tool** — agents change any page by path + delta: [`core/Page/doc/page-tool-2026-10-09.md`](../core/Page/doc/page-tool-2026-10-09.md)
- **New 2026-10-12:** [core/Property](../core/Property/readme.md) · [core/Page/Template](../core/Page/Template/readme.md) · [ext/Shots](../ext/Shots/readme.md) · [ext/Query](../ext/Query/readme.md) · [ext/DataGrid](../ext/DataGrid/readme.md) · [code/performance](../code/performance/readme.md)
- **PageInbox** (a note left on a page reaches its owner): [PageInbox.js](../core/Page/PageInbox.js) · [inbox tab](../core/Page/doc/inbox-tab.md)
- **UI library** (every ui and Figma item): [library](../library/readme.md) · **Layout catalog**: [layouts](../../layouts/readme.md)
- **Step runner** (a task as ordered steps): [Servex/doc/steps.md](../../../Servex/doc/steps.md)

## Start here

- [systems-map.md](systems-map.md): where every major system lives, how long its readme is, and when it last changed.
- **[doc/readme.md](doc/readme.md): the index of every AI-system doc**, by subsystem (design, agents, tokens, logs, tasks, ai2, meta). Sessions docs: [sessions/doc/readme.md](sessions/doc/readme.md).
- [doc/architecture.md](doc/architecture.md): the decisions behind this folder, and where they came from.
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
  tasks started/landed/open, and the owner's own prompts, refined (`ext/AITask/day-prompts.js`).
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
- [health](./health/) — page health monitor, checks every page in a hidden browser
- [quick-fix](./quick-fix/) — log of every quick-fix request
- [review](./review/) — review questions per system, read live from the skills
- [tests](./tests/) — test library: small tasks with known-good outcomes
