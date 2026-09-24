# What a task cost — `cost_usd`

Every task card shows what the task cost, in dollars. Dollars and not tokens,
because each model charges a different price per token, so a token count
cannot be compared across tasks — a dollar can (the owner, 2026-09-24).

## Where the number comes from

A task run by Servex has a Servex agent, and that agent may have started
minions, which may have started their own. `Server/task-cost.mjs` adds up the
agent and **every agent under it**, and appends the result to the task's own
`task.jsonl` as one line:

```json ai/<date>/<slug>/task.jsonl
{"assign": {"cost_usd": 41.94, "cost": {"root": "task-mastermind-loose-ends", "agents": 172,
  "own_usd": 8.58, "minions_usd": 33.36, "parent_task": null, "open": 9, "at": "…"}}}
```

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
- **The task page**, top of the Report tab, above the outcome — the total, then the root agent, its own
  share, its minions' share, and how many agents were summed.

## Not tracked is not $0

A task run from a VS Code tab or a plain CLI session has no Servex agent, so
nothing measured what it spent. It shows a muted **not tracked**, never `$0`:
a zero would read as "free" and would quietly pull every total down. Totals
count only tracked tasks and name the rest beside the figure
("3 tasks not tracked"), so a total is never mistaken for the whole story.

## Nothing is counted twice

If one task's root agent was started by another task's agent, the child's cost
is already inside the parent's figure. The tool marks it with
`cost.parent_task` (`<date>/<slug>` of the parent). A total skips such a task
**when its parent is in the same total**; when the parent is not (it ran on
another day, or under another effort), the child is counted, or its money would
be missing from that total altogether.

The code is `cost.js`; its demo is the Task cost section of this module's page.
