# AI

Where the agents' work is recorded: one folder per day, one folder per task inside it.

The page has three tabs:

- **Inbox** (the default): a rail of what needs you, only rows scoring 90 and up. The card you pick opens beside it, at its own address (`/framework/ai/2026/09/30/<card>/`).
- **Log**: the same rail, showing everything (`?min=0`). Every task by day is at [all-tasks/](all-tasks/).
- **System**: the AI system's docs, full width: the concepts, [Skills](skills.json) (rerun `node public/framework/ai/skills.mjs` after a skill changes), Objects ([objects.js](objects.js)), Authoring and CLAUDE.md. Concept text: [concepts.js](concepts.js); tabs: [overview.js](overview.js).

A tab after Inbox is **detected, not hand-listed**: any folder whose own `page.jsonl` (or `settings.jsonl`, beside a `page.js`) has `{"settings":{"tab":true,"weight":5}}` joins the strip there, ordered by `weight` (`overview.js`'s `detect_tabs()`; more on the System tab).

The rail is `AIRail` ([ai2/rail.js](/framework/ai2/rail.js)), the same one AI 2 draws; how it works is at [/framework/ux/Inbox/](/framework/ux/Inbox/). The old board is at [/framework/ai/v/3/](/framework/ai/v/3/) (and `?v1`).

## Start here

- [todo.md](todo.md): what's waiting, in priority order, and what only you can do.
- [Asks](asks/): every ask you made today onward, who owns it, and whether it landed or stalled.
- [The ask loop](council/): everything you asked, whether it was built, and what the council found. Open asks come first.
- [AI 2](/framework/ai2/): the dashboard. Talk to the assistants, see tasks by group, and see
  what each one cost.
- [Today](2026-09-24/): the latest day's tasks, with outcomes and costs.

## For a fresh session

- [handover.md](handover.md): the state of the world, in one screen.
- [handoff2.md](handoff2.md): the plan from 2026-09-24, with
  [your exact words](handoff2-owner-words.md).
- A task's folder holds `task.jsonl` (its log) and usually `requirements.md` (its brief).

## Watch out

- Agents put work you didn't ask for into [todo.md](todo.md) rather than starting it.
- Cost: `node Server/task-cost.mjs --date <YYYY-MM-DD>`. A follow-up task that reused its
  parent's session currently shows the parent's whole total, not its own share.
