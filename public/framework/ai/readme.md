# AI

Where the agents' work is recorded: one folder per day, one folder per task inside it.

The page itself shows the AI system, under four top tabs: **Overview** (12 concepts in 4 groups, then how they work together), **Skills** (a page per `.claude/skills/*`, from `skills.json`; rerun `node public/framework/ai/skills.mjs` after a skill changes), **Objects** (`objects.js`: every object's chip, row and panel) and **Authoring** (the pieces these pages are built from). Concept text: [concepts.js](concepts.js); tabs: [overview.js](overview.js). The old board is at [/framework/ai/v/3/](/framework/ai/v/3/) (and `?v1`).

## Start here

- [todo.md](todo.md): what's waiting, in priority order, and what only you can do.
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
