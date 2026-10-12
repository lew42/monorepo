# AI

Where the agents' work is recorded: one folder per day, one folder per task inside it.

The page has three tabs:

- **Inbox** (the default): a rail of what needs you, only rows scoring 90 and up. The card you pick opens beside it, at its own address (`/framework/ai/2026/09/30/<card>/`).
- **Log**: the same rail, showing everything (`?min=0`). Every task by day is at [all-tasks/](all-tasks/).
- **System**: the whole AI system explained, full width — the map, [Skills](skills.json) (rerun `node public/framework/ai/skills.mjs` after a skill changes), [Readmes](readmes/), how data is written and how a page saves, Objects ([objects.js](objects.js)), Authoring, Models and CLAUDE.md. Concept text: [concepts.js](concepts.js); tabs: [overview.js](overview.js).

A tab after Inbox is **detected, not hand-listed**: any folder whose own `page.jsonl` (or `settings.jsonl`, beside a `page.js`) has `{"settings":{"tab":true,"weight":5}}` joins the strip there, ordered by `weight` (`overview.js`'s `detect_tabs()`; more on the System tab).

The rail is `AIRail` ([ai/rail/rail.js](/framework/ai/rail/rail.js)), the same one AI 2 draws; how it works is at [/framework/ux/Inbox/](/framework/ux/Inbox/). The old board is at [/framework/ai/v/3/](/framework/ai/v/3/) (and `?v1`).

## Every system, one line each

Accounting first. Each link is that system's own short readme; follow it to go one level deeper.

- **Accounting**: [token accounting](doc/tokens/tokens.md) · [spend per session](sessions/readme.md) · [budgets](/framework/servex/doc/budget.md)
- **Servex** (runs the agents): [readme](/framework/servex/) · [SDK](/framework/servex/doc/sdk.md) · [decisions](/framework/servex/doc/architecture.md)
- **Dev server**: [Server/readme.md](/framework/dev/)
- **MCP tools**: [doc/agents/mcp.md](doc/agents/mcp.md)
- **Models**: [system/models](system/models/) · [OpenRouter](/framework/servex/) · local
- **Sessions** (VS Code tabs, browser voice agents): [sessions/](sessions/readme.md) · [conversations](doc/logs/conversations.md)
- **Transcription**: [ux/Dictate](/framework/ux/Dictate/)
- **Class cards, live** ([classes](/framework/ai/classes/)): a class, its API, and a debug tree of a live instance beside its rendered view. First: Session.
- **Prompt refinement** (Echo, running now): [Servex/doc/echo.md](/framework/servex/doc/echo.md) · [ext/Refine live demo + Prompt class](/framework/ext/Refine/) · [vision](/framework/ext/Refine/doc/vision-2026-10-08.md) · [dictation connection map](/framework/ai/doc/design/dictation-refine-connection-map.md)
- **Page system**: [core/Page](/framework/core/Page/) · [ext/JSONL](/framework/ext/JSONL/)
- **Skills and CLAUDE.md**: [skills](skills/)
- **Dashboard, Log, Inbox**: the tabs above · [AI 2 (merged into this folder, old address kept)](/framework/ai2/readme.md)
- **Classes that draw it** (moved here from `ai2/`, 2026-10-09): [cards/](cards/) — `Card` and what a card shows (chat, compose, outline, activity, tasks, faces…) · [rail/](rail/) — `AIRail`, `CardList`, `Groups`, the Live card, Needs, Log, Overview, Processes · [archive/ai2](archive/ai2/readme.md) — old AI 2 page logs, kept
- Sizes and freshness of all of them: [systems-map.md](systems-map.md) · **Organization** (what goes where; System class, hourly check): [doc/organization.md](doc/organization.md) · [Systems](/framework/ai/systems/)

- **Page parts** — a page body as a streamed list of parts: [`core/Page/parts/readme.md`](../core/Page/parts/readme.md)
- **Page tool** — agents change any page by path + delta: [`core/Page/doc/page-tool-2026-10-09.md`](../core/Page/doc/page-tool-2026-10-09.md)

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

- Agents put work you didn't ask for into [todo.md](todo.md) rather than starting it.
- Dynamic heartbeats & the unstuck protocol: [doc/agents/autonomy.md](doc/agents/autonomy.md).
- How cost is counted (per request, not per token; why agents read millions; the cache discount): [doc/tokens/tokens.md](doc/tokens/tokens.md).
- Token efficiency, batching rules, and pre-processing: [doc/tokens/tokens.md](doc/tokens/tokens.md).
- Context windows, primacy/recency attention bias, and token budgets: [doc/tokens/context-window.md](doc/tokens/context-window.md).
- Single universal log tool for constrained models & file system truth: [doc/logs/log-tool.md](doc/logs/log-tool.md).
- Pass-by-reference message routing & queue latency handling: [doc/agents/pass-by-reference.md](doc/agents/pass-by-reference.md).
- Agent interrupts, queue preemption, and the stop-and-switch pattern: [doc/agents/interrupts.md](doc/agents/interrupts.md).
- Agent concurrency, serial prompt-response loops, and the two-tier listener/minion pattern: [doc/agents/concurrency.md](doc/agents/concurrency.md).
- Model evaluation, what is "truth", and avoiding circular grading: [doc/agents/eval-truth.md](doc/agents/eval-truth.md).
- MCP tool doors and multi-harness config locations (Claude vs. Antigravity): [doc/agents/mcp.md](doc/agents/mcp.md).
- Which log is ground truth for "what did the owner ask, and did it land" (session files vs.
  asks.jsonl vs. task dirs vs. Servex logs): [doc/logs/log-sources.md](doc/logs/log-sources.md).
- Where tasks should live (session first, then the module) and a JSONL message channel the owner can watch: [doc/tasks/tasks.md](doc/tasks/tasks.md) (open design).
- Tools, session templates and a generic path+method tool (owner thinking, open design): [doc/design/tooling-architecture.md](doc/design/tooling-architecture.md).
- Long-term direction: the website must show all the work (index pages, demos, a recently-landed view): [doc/design/website-shows-everything.md](doc/design/website-shows-everything.md).
- AI 2 vs AI (two card stores), the date directory layout, zombie branches: [doc/ai2/ai2-vs-ai.md](doc/ai2/ai2-vs-ai.md) (open, owner decisions). Inventory and proposal: [doc/ai2/ai2-vs-ai.md](doc/ai2/ai2-vs-ai.md). Inbox/Log/streaming: [doc/logs/inbox-log-streaming.md](doc/logs/inbox-log-streaming.md). History: [doc/meta/history.md](doc/meta/history.md). Per-module `ai/` folders: [doc/design/module-ai-dirs.md](doc/design/module-ai-dirs.md). Readme and documentation system status: [doc/meta/readme-system-status.md](doc/meta/readme-system-status.md).
- Inbox, Log and one streaming system, programmatic writes: [doc/logs/inbox-log-streaming.md](doc/logs/inbox-log-streaming.md).
- Ranked priorities and who owns what: [doc/tasks/priorities.md](doc/tasks/priorities.md).
- Cost: `node Server/task-cost.mjs --date <YYYY-MM-DD>`. A follow-up task that reused its
  parent's session currently shows the parent's whole total, not its own share.
- `tasks.json` — stalled, budget vs. actual, snooze/kill/re-prioritise — is DERIVED: Servex's
  `Servex/asks/tasks.js` regenerates it every tick; never hand-edit it (`Servex/asks/readme.md`).
- A day's prompts are only as refined as `node Server/day-prompts-refine.mjs <date>` (or Echo,
  live) has gotten to — a day page says how many are still plain text. The local model
  (`local/qwen2.5-coder`) is currently overflowing its own context on every call (tracked at
  `2026-10-04/local-brain/`); until that's fixed, refining is a real-$ Sonnet call, so the
  retroactive run was capped small on purpose rather than run over every old prompt.
- **To-do:** a task that spans several days has nowhere to live yet — `/framework/ai/<YYYY-MM>/`
  is a stub (title + month cost total only, `monthPage()`, `ext/AITask/dashboard.js`). Moving a
  multi-day task's own page under its month, and linking it from both the day and month pages,
  is still open.
- **To-do:** "by system" (`/framework/ai/<date>/by-system/`) buckets by a plain keyword match
  against `ext/Refine/engine.js`'s `GLOSSARY`, not a model's judgment — cheap and code-only (law
  7), but a sentence naming no module lands in "General" even when a reader would call it
  something else. A model-graded version is a fair upgrade once there's budget for it.
- **Owner asks by module** — [`doc/asks.md`](doc/asks.md) (merged, open first); page system: [`core/Page/doc/asks.md`](../core/Page/doc/asks.md).
