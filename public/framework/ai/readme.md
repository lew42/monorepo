# AI

Where the agents' work is recorded: one folder per day, one folder per task inside it.

The page has three tabs:

- **Inbox** (the default): a rail of what needs you, only rows scoring 90 and up. The card you pick opens beside it, at its own address (`/framework/ai/2026/09/30/<card>/`).
- **Log**: the same rail, showing everything (`?min=0`). Every task by day is at [all-tasks/](all-tasks/).
- **System**: the whole AI system explained, full width — the map, [Skills](skills.json) (rerun `node public/framework/ai/skills.mjs` after a skill changes), [Readmes](readmes/), how data is written and how a page saves, Objects ([objects.js](objects.js)), Authoring, Models (and [how thinking works](system/thinking/)) and CLAUDE.md. Concept text: [concepts.js](concepts.js); tabs: [overview.js](overview.js).

A tab after Inbox is **detected, not hand-listed**: any folder whose own `page.jsonl` (or `settings.jsonl`, beside a `page.js`) has `{"settings":{"tab":true,"weight":5}}` joins the strip there, ordered by `weight` (`overview.js`'s `detect_tabs()`; more on the System tab).

The rail is `AIRail` ([ai2/rail.js](/framework/ai2/rail.js)), the same one AI 2 draws; how it works is at [/framework/ux/Inbox/](/framework/ux/Inbox/). The old board is at [/framework/ai/v/3/](/framework/ai/v/3/) (and `?v1`).

## Start here

- [doc/systems-overview.md](doc/systems-overview.md): full AI architecture, persistence, triggers, and MCP tool/session logging audit.
- [todo.md](todo.md): what's waiting, in priority order, and what only you can do.
- [handover.md](handover.md): the state of the world for a fresh tab or mastermind.
- [doc/autonomy.md](doc/autonomy.md): dynamic heartbeat, unstuck protocol, node-based steps, truthful token accounting.
- [Asks](asks/): every ask you made today onward, who owns it, and whether it landed or stalled.
- [The ask loop](council/): everything you asked, whether it was built, and what the council found. Open asks come first.
- [AI 2](/framework/ai2/): the dashboard. Talk to the assistants, see tasks by group, and see
  what each one cost.
- **Today** and **Yesterday** are pinned rows above the rail (same mechanism as the Now card,
  `ai2/rail.js`'s `build_day_items()`) — each opens that day's summary: cost (two currencies),
  tasks started/landed/open, and the owner's own prompts, refined (`ext/AITask/day-prompts.js`).
  Yesterday stays bold until opened. Prev/next day arrows sit on the day page itself.

## For a fresh session

- [handover.md](handover.md): the state of the world, in one screen.
- [doc/systems-overview.md](doc/systems-overview.md): full architecture, data flow, MCP tools catalog, and logging gaps.
- [doc/autonomy.md](doc/autonomy.md): rules for hands-free masterminds, pacing, and minion delegation.
- [doc/conversations.md](doc/conversations.md): where web dictation logs and VS Code sidebar mastermind sessions live.
- [handoff2.md](handoff2.md): the plan from 2026-09-24, with
  [your exact words](handoff2-owner-words.md).
- A task's folder holds `task.jsonl` (its log) and usually `requirements.md` (its brief).

## Watch out

- Agents put work you didn't ask for into [todo.md](todo.md) rather than starting it.
- Dynamic heartbeats & the unstuck protocol: [doc/autonomy.md](doc/autonomy.md).
- How cost is counted (per request, not per token; why agents read millions; the cache discount): [doc/token-accounting.md](doc/token-accounting.md).
- Token efficiency, batching rules, and pre-processing: [doc/token-efficiency.md](doc/token-efficiency.md).
- Context windows, primacy/recency attention bias, and token budgets: [doc/context-window.md](doc/context-window.md).
- Single universal log tool for constrained models & file system truth: [doc/log-tool.md](doc/log-tool.md).
- Pass-by-reference message routing & queue latency handling: [doc/pass-by-reference.md](doc/pass-by-reference.md).
- Agent interrupts, queue preemption, and the stop-and-switch pattern: [doc/interrupts.md](doc/interrupts.md).
- Agent concurrency, serial prompt-response loops, and the two-tier listener/minion pattern: [doc/concurrency.md](doc/concurrency.md).
- Model evaluation, what is "truth", and avoiding circular grading: [doc/eval-truth.md](doc/eval-truth.md).
- MCP tool doors and multi-harness config locations (Claude vs. Antigravity): [doc/mcp.md](doc/mcp.md).
- Which log is ground truth for "what did the owner ask, and did it land" (session files vs.
  asks.jsonl vs. task dirs vs. Servex logs): [doc/log-sources.md](doc/log-sources.md).
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
