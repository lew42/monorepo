# How the task dashboard shows the tree

`registry.json` rows that carry a `parent` are already a tree, and each agent's card already carries
`parent`. So the AI board can draw each task as an indented list, one row per agent, read straight
from the registry — no new store.

```
▾ mastermind-concurrency      working   $0.42  ($3.10 tree / $5 budget)
  ▾ mastermind-tree-a         idle      $0.20  ($1.05 tree)
      minion-a1               done      $0.40
      minion-a2               working   $0.45   · fork ● · job check 12s
  ▸ mastermind-tree-c         blocked   $0.73 tree   ← "budget"
```

## What each row shows

- **The agent**, indented under its parent, with its state: working, idle, blocked, done, gone.
- **Its own cost, and its tree's cost**, from `Agents.spent(id)`, against the budget it was given.
  The top row is the whole run's spend.
- **Forks** as a small dot after their caller, not a row: they are disposable and answer once.
- **Node jobs** as a chip with a timer after their caller, from the `type: "job"` lines in that
  agent's own log.
- A folded branch (`▸`) shows only its tree total, so a nine-agent run still fits one screen.

## Where it reads from

| what | source |
|---|---|
| the shape of the tree | `registry.json`: `id`, `parent`, `depth`, `role`, `state` |
| the money | `registry.json`: `cost`, `budget_usd`, plus the `spent()` walk |
| forks and jobs | the caller's `agent-<id>.jsonl` stream, already on the board |
| what each task did | that task's own `task.jsonl`, one per task |

## Build

The tree view on the AI board: indent by `parent`, show own `$` and tree `$`, from `/agents`. It is
third in the build order ([choices.md](choices.md)), because the numbers it shows only exist once the
spawn guard and `spent()` are in.

From [proposal-tree.md](../proposal-tree.md), with forks and jobs from
[proposal-messaging.md](../proposal-messaging.md) and [proposal-node.md](../proposal-node.md).
