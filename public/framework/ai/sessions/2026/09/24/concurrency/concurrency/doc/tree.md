# Recursive masterminds

A mastermind can spawn sub-masterminds, each with its own strategy or angle, and they spawn minions
to build. Every agent knows its parent. Money and results flow up that one link, and a strict budget
comes down it. No agent may spawn more children, or go deeper, than its parent allowed.

## The link exists; three fields are added

`spawn_agent({ parent })` already records `parent` in `registry.json`, and `wake_parent` already
carries a child's last words up one level. Three fields are added to the spawn call and the registry
row:

| field | set by | meaning |
|---|---|---|
| `depth` | Servex, never the caller | the parent's depth + 1. The top mastermind is 0. |
| `budget_usd` | the caller | the most this child **and everything under it** may spend. Must be no more than the caller has left. |
| `max_children` | the caller | how many children this child may have alive at once. |

## The spawn guard

The `spawn_agent` handler — plain node inside Servex — checks all three before it starts anything.
Because the checks live in the tool, no prompt can talk its way past them.

- **Depth.** `0` the top mastermind · `1` a sub-mastermind · `2` a minion · `3` only a fork or a
  node job of a minion. A spawn at depth 3 or deeper is refused with text the caller reads:
  "depth limit: do this yourself".
- **Children.** Default `max_children`: 3 for the top mastermind (the owner's "three
  sub-masterminds"), 2 for a sub-mastermind, 0 for a minion — a minion may fork, never spawn.
  Over the limit: "wait for one to finish".
- **Budget.** A child's `budget_usd` larger than the caller's remaining budget is refused, with the
  number left. A budget can only shrink on the way down.

## Money rolls up by adding, not by asking

Each agent already keeps `cost` (the SDK's `total_cost_usd`, updated on every `result`).

1. `registry.js` writes `cost` on every result, so the number survives a restart.
2. `Agents.spent(id)` = its own `cost` + `spent()` of every registry row whose `parent` is `id`. A
   walk over one small JSON file, microseconds. **Nobody sends a cost message.**

After every `result`, Servex walks up the parents. If any ancestor's `spent()` is over its
`budget_usd`, that ancestor's whole subtree is interrupted — not stopped, so every session stays
resumable — and the ancestor gets a wake: `blocked: budget — $4.10 of $4.00 spent by 5 agents`. It
decides whether to raise the limit, resume one branch, or land what it has.

Tokens roll up the same way: the SDK's input, output and cache-read counts sit beside `cost` on the
row and are summed by the same walk.

## One ledger per task

Each sub-mastermind owns one task, with its own `task.jsonl`. The parent writes one line per child it
spawns (`{"spawned": id, "angle": ..., "budget_usd": ...}`) and one per child that lands. Children
never append to their parent's ledger, and a sub-mastermind reports one screen upward, never its
children's raw output. Each level shrinks what it passes up, so the top reads three screens, not nine.

## The picture

```
                 ┌───────────────────────┐
     budget ↓    │  mastermind (depth 0)  │   ↑ $ tree total, ↑ one-screen report
                 └──┬─────────┬────────┬──┘
          $2 ↓      │   $2 ↓  │  $1 ↓  │          ↑ "done: wrote proposal-*.md"
          ┌─────────▼┐  ┌─────▼────┐ ┌─▼────────┐
          │ sub-MM A │  │ sub-MM B │ │ sub-MM C │   (depth 1, ≤2 children each)
          └──┬────┬──┘  └────┬─────┘ └────┬─────┘
             ▼    ▼          ▼            ▼
          minion minion    minion       minion      (depth 2, may fork, never spawn)
             │
          fork_self                                  (depth 3, answers once)
```

## Traps

- A child setting its own depth or budget. Servex computes depth; a budget only shrinks going down.
- An uncapped mastermind spawning 3×3 Opus agents is nine sessions at roughly $1–3 each, found out
  only afterwards (a guess). The guard turns that into a refusal at spawn time.

From [proposal-tree.md](../proposal-tree.md).
