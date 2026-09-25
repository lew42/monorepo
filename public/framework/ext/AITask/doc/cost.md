# What a task cost — `cost_usd`

Every task card shows what the task cost, in dollars. Dollars and not tokens,
because each model charges a different price per token, so a token count
cannot be compared across tasks — a dollar can (the owner, 2026-09-24).

## Where the number comes from

A task run by Servex has a Servex agent (its **mastermind**), and that agent
may have started minions, which may have started their own. One mastermind
often runs several tasks in a row, so `Server/task-cost.mjs` gives each task
**its share of the mastermind's time**, plus the minions spawned while it was
open, and appends the result to the task's own `task.jsonl` as one line:

```json ai/<date>/<slug>/task.jsonl
{"assign": {"cost_usd": 3.92, "cost": {"root": "task-mastermind-ai2-dashboard",
  "agents": [{"id": "task-mastermind-ai2-dashboard", "model": "claude-opus-5-5", "role": "task-mastermind", "usd": 1.38},
             {"id": "minion-ai2-cost-fill", "model": "claude-opus-5-5", "role": "minion", "usd": 2.54}],
  "own_usd": 1.38, "minions_usd": 2.54, "parent_task": null, "open": 2,
  "window": {"from": "…", "to": null}, "at": "…"}}}
```

⚠ `agents` was a **count** until 2026-09-24 and is the list itself now. Older
lines still carry the number, so `cost.js` reads both (`agents_of()` gives `[]`
for an old line, and the breakdown falls back to the count).

The view only reads that line. It never computes a cost itself, so the board,
the day page and the task page always agree with each other. How the tool
finds the agent and sums it: `Server/doc/task-cost.md`.

## What each place shows

- **The card** — `$41.94 cost`. When `cost.open` is above zero, some agent
  under the task is still running and the figure can still grow, so it reads
  `$41.94+ so far`.
- **The day page** — first line: the day's total and how many of its tasks are
  not tracked. Under it, what each effort (a task's `group`) spent that day,
  each one a link to that effort's board.
- **An effort's board** (`/framework/ai/effort/<slug>/`) — the same sum, across
  every day that effort has run.
- **The task page**, top of the Report tab, above the outcome — the total, the
  mastermind's share and the minions', then a table of **who spent it**: every
  agent, mastermind or minion, with its model (`Opus 5.5`) and its dollars, and
  the time the mastermind's share was counted over.
- **AI 2** (`/framework/ai2/`) — every group row in the rail shows its sum, and
  every row that points at a task shows that task's figure. A group's card opens
  with a table of its tasks, each with its mastermind / minions split, and each
  task page inside it carries the breakdown above.

## Not tracked is not $0

A task run from a VS Code tab or a plain CLI session has no Servex agent, so
nothing measured what it spent. It shows a muted **not tracked**, never `$0`:
a zero would read as "free" and would quietly pull every total down. Totals
count only tracked tasks and name the rest beside the figure
("3 tasks not tracked"), so a total is never mistaken for the whole story.

## Nothing is counted twice

Tasks that share a mastermind split its cost by time, so they add up to its
whole tree with no overlap (how: `Server/doc/task-cost.md`, "split by time").

If one task's root agent was started by another task's agent, the child's cost
is already inside the parent's figure. The tool marks it with
`cost.parent_task` (`<date>/<slug>` of the parent). A total skips such a task
**when its parent is in the same total**; when the parent is not (it ran on
another day, or under another effort), the child is counted, or its money would
be missing from that total altogether.

The code is `cost.js`; its demo is the Task cost section of this module's page.
