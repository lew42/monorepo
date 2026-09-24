# task-cost — what a task cost, in dollars

`Server/task-cost.mjs` works out how many dollars a task cost. The total includes the agent that ran
the task and every agent it spawned, and their spawns in turn. It writes that figure into the
task's own `task.jsonl`, and the AI board shows it on the task card. We count dollars, not tokens,
because each model charges a different price per token.

```
node Server/task-cost.mjs public/framework/ai/2026-09-24/loose-ends   one task
node Server/task-cost.mjs --date 2026-09-24                          every task of that day
node Server/task-cost.mjs --agent minion-card-view                   every task this agent counts toward
  --dry          print the table, write nothing
  --root <repo>  whose public/framework/ai/ to read (default: the repo the script is in)
```

## When to run it

Run it when a task lands, and again any time after. Running it twice does no harm. It adds a
new line only when the figure has changed, and the newest line always wins. Servex can call
`--agent <id>` after each `result` event. That mode stays silent when it works. For an agent it
has never heard of, it prints one line to stderr and exits 0.

## What it writes

```json
{"assign": {"cost_usd": 12.3456, "cost": {"root": "task-mastermind-live-card", "agents": 7, "own_usd": 6.59, "minions_usd": 5.75, "parent_task": null, "open": 1, "at": "…"}}}
```

- `cost_usd` is the root agent plus all of its descendants.
- `own_usd` is the root agent alone, and `minions_usd` is everything below it.
- `agents` says how many agents were added up.
- `open` counts the agents that have not stopped yet. While it is above zero, the figure can still grow.
- `parent_task` names another task that already includes this one (see below). When it is set,
  a day total or a group total must skip this task.

A task with no Servex agent behind it gets **no line at all**. That covers a browser tab or a
plain CLI session. The board shows such a task as "not tracked", never as $0, because $0 would
be a lie. The same goes for an agent tree that has billed nothing yet (no result line, or only a $0 stop marker): no line, and an old $0 line is cleared once with `{"assign":{"cost_usd":null,"cost":null}}`.

## How a task finds its agent

1. Take line 1 of `task.jsonl`, and read `assign.session_id` from it.
2. Find the row in `%LOCALAPPDATA%\lew42\servex\registry.json` that has the same `session_id`.
   If none does, use the row whose `id` equals `assign.tab`.
3. That row is the task's **root**. Its descendants are every row whose `parent` leads back to
   the root.

## How an agent's cost is read

Each agent has a log at `%LOCALAPPDATA%\lew42\servex\logs\agent-<id>.jsonl`. Its `result` lines
carry a `cost` field. That cost is a **running total** for one process: it only grows. So the
agent's cost is its **last** `cost` value.

There is one exception. If a value is ever *smaller* than the one before it, the process
restarted and began counting from zero again. The tool banks the earlier total and keeps adding.

- A result line that appears twice (the same `at` and the same `cost`, from a replayed log)
  counts only once.
- A resumed session whose total carries on from where it stopped just keeps growing, so it is
  never counted twice.
- Agents are keyed by their id. An agent that comes back under the same id after a restart
  keeps adding to the same figure.

## Counting a tree once: `parent_task`

- **The same root.** Two task dirs can map to the same agent. For example,
  `2026-09-24/ai2-dashboard` and `2026-09-24/task-cost` are both run by
  `task-mastermind-ai2-dashboard`. Both get the same full figure. The **later** task (by line
  1's `requested_at`) gets `parent_task` set to the earlier task's `<date>/<slug>`.
- **An ancestor.** If a task's root agent was spawned by another task's root agent, the other
  task's figure already includes this one. `parent_task` names that other task.

## Watch out

- **In-process subagents are hidden inside `own_usd`.** A mastermind that used the Agent tool
  instead of Servex `spawn_agent` has no registry children. Its minions' cost is still
  included, because the SDK's running total counts subagents, but all of it shows under
  `own_usd`, and `minions_usd` reads $0. `2026-09-24/live-card` is an example. There is no
  honest way to split that cost from the Servex log alone.
- **A task with no agents shows $0 for minions.** That is the true figure when the task spawned
  nothing (`2026-09-24/md-pages`).
