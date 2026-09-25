# The choices, and what we did not pick

The three proposals agreed on the shape — a tree, messages as doorbells, answers that come back as a
wake — and disagreed on six details. Each one is settled here in two lines: what was chosen, and the
alternative.

1. **A small decision goes to a fork.**
   Chosen: `fork_self`, fed by a node `read` job, so the fork answers in one turn ($0.014, 98% from cache).
   Alternative: node's `decide` (built: one Sonnet call, no tools, 2.6 s, $0.05) — kept for picks over facts
   node gathered, where the agent's own context is not needed.

2. **Forks are leaves.**
   Chosen: a fork keeps its parent's tools (or the cache misses) but a hook refuses fork, spawn and write;
   at most three per caller; it counts as one level of depth.
   Alternative: take the tools away — measured, that read 0 tokens from cache and paid 44k fresh.

3. **Depth stops at 3, and only a minion's fork or job lives there.**
   Chosen: 0 mastermind · 1 sub-mastermind · 2 minion · 3 fork or job; three sub-masterminds at the top.
   Alternative: no depth limit, only a budget — the budget would catch it, but only after the money is spent.

4. **Many wakes become one turn.**
   Chosen: merge waiting `later` wakes in the queue, and read children's files once the last sibling is done.
   Alternative: answer each wake as it lands — simpler, but one full turn per child.

5. **A mastermind has no shell.**
   Chosen: coordination tools, `start_job` and `Read` only; no `Bash`, `Edit` or `Write`.
   Alternative: keep `Bash` and ask it to be quick — it would not be, and every slow call makes it deaf.

6. **Budgets are in dollars; tokens show beside them.**
   Chosen: `budget_usd`, summed from the SDK's `total_cost_usd` by walking the registry.
   Alternative: a token budget — closer to the owner's words, but cache reads and fresh tokens cost
   ten times apart, so a token cap would mean different money on every run.

## Build order, best benefit per effort first

1. **Tools per role** in `roles.js`: masterminds get coordination tools only. About one line per role.
2. **The spawn guard**: `depth`, `max_children`, `budget_usd` checked in `spawn_agent`. About 40 lines.
3. **`start_job`** with `check` and `watch`, the two slowest things masterminds do. About 100 lines.
4. **Priority by message kind**: `blocked` → `next`, `done` → `later`. About 3 lines.
5. **`spent(id)` and the budget interrupt**. About 40 lines.
6. **The tree view on the AI board**, then wake coalescing in the queue.
