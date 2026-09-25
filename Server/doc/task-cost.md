# task-cost — what a task cost, in dollars

`Server/task-cost.mjs` works out how many dollars a task cost. The total is the task's share of
the agent that ran it (the **root**), plus every agent the root spawned while the task was open,
and their spawns in turn. One root often runs several tasks in a row, so the root's own cost is
**split by time** between them. Every dollar lands in exactly one task. It writes that figure into the
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
{"assign": {"cost_usd": 3.9189, "cost": {"root": "task-mastermind-ai2-dashboard",
  "agents": [{"id": "task-mastermind-ai2-dashboard", "model": "claude-opus-5-5", "role": "task-mastermind", "usd": 1.3812},
             {"id": "minion-ai2-cost-fill", "model": "claude-opus-5-5", "role": "minion", "usd": 2.5377}],
  "own_usd": 1.38, "minions_usd": 2.54, "parent_task": null, "open": 2,
  "window": {"from": "2026-09-24T19:26:01-05:00", "to": null}, "at": "…"}}}
```

- `cost_usd` is this task's share of the root, plus its minions.
- `own_usd` is the root's share alone (the **mastermind**), and `minions_usd` is everything below it.
- `agents` lists every agent that was counted, the root first: its id, its model (from the
  registry), its role and its dollars. ⚠ Before 2026-09-24 this was a **count**, and older lines
  still carry the number; `ext/AITask/cost.js` reads both.
- `window` is the task's own span: line 1's `requested_at` to its last `landed_at` (`null` while
  it is still open). The rule below says what the root's time around it counts toward.
- `open` counts what can still grow: minions that have not stopped, plus the root while this task
  owns its "now". While it is above zero, the figure can still grow.
- `parent_task` is set only for a **true sub-tree** (see below). When it is set, a day total or a
  group total that also holds the parent skips this task.

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

## One agent, several tasks: split by time

A mastermind that lands one task is often handed the next one, so four or five task dirs can
share one root. Until 2026-09-24 each of them showed the root's **whole** total (four Live-card
tasks each said $15.63), and a `parent_task` pointer asked every total to skip the later ones.
Now the root's spend is divided up by **when** it happened:

1. Each rise in the root's running cost is dated by **when its turn started** (`at` minus
   `duration_ms`). An agent writes `landed_at` and only then ends its turn, so the result line's
   own time falls a few seconds after the window it paid for.
2. That moment belongs to the task **open** then (`requested_at` ≤ t < `landed_at`, or not
   landed yet). If two are open, the later-started one wins.
3. A moment when none is open belongs to the **next** task to start. The reading and the brief
   before a task's line 1 is written are that task's work, and a log opened only at landing
   (`requested_at` = `landed_at`, like `live-reply`) still gets the work that led up to it.
4. After every task has landed, the root's wrap-up belongs to the **last** one to land.
5. A **minion** counts whole, toward the task that was open on its root when it was spawned
   (its registry `started_at`, by the same rule). Its own minions go with it.

So the tasks of one root always add up to exactly the root's whole tree. The tasks that were
double-counted on 2026-09-24, and the tasks they were copied from:

| task | before | after |
|---|---|---|
| agent-chat | $15.63 | $3.78 |
| live-card-wide | $15.63 | $6.20 |
| live-reply | $15.63 | $2.22 |
| live-preview | $15.63 | $0.61 |
| task-audit | $49.93 | $43.44 |
| live-card | $15.63 | $2.81 |
| loose-ends | $49.93 | $6.50 |

(live-card's five tasks sum to $15.63; task-audit plus loose-ends' $6.50 is $49.94, a cent of rounding from $49.93.)

## Counting a sub-tree once: `parent_task`

`parent_task` stays for one case only. If a task's root agent was **spawned by** another task's
root, that other task's figure already includes it, whole. `parent_task` names the task that was
open on the ancestor when this branch was spawned, and a total holding both skips the child.

## Watch out

- **In-process subagents are hidden inside `own_usd`.** A mastermind that used the Agent tool
  instead of Servex `spawn_agent` has no registry children. Its minions' cost is still
  included, because the SDK's running total counts subagents, but all of it shows under
  `own_usd`, and `minions_usd` reads $0. `2026-09-24/live-card` is an example. There is no
  honest way to split that cost from the Servex log alone.
- **A root's turn that spans two tasks counts toward the one it started in.** A single long
  turn that lands task A and goes straight on into task B is all A's. That is rare, and it is
  the price of dating by the turn rather than by each API call, which the log does not carry.
- **A task with no agents shows $0 for minions.** That is the true figure when the task spawned
  nothing (`2026-09-24/md-pages`).
