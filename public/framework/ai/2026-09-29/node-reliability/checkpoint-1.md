# node-reliability: checkpoint 1 (2026-09-30)

Task mastermind: task-mastermind-node-reliability (session 486964ae), which is stopping here. A fresh session carries on from this page. Report to **mastermind-servex-8**. It schedules every Servex restart, so never restart Servex yourself. Spend cap for the rest of the task: **$20**, logged in `task.jsonl`.

## Merged into michael/dev

| What | Merge | Proof |
|---|---|---|
| **Revive guard.** Nothing reopens an agent that `stop_agent` stopped, whose task landed, or whose cwd is gone. The guard is `Agents.blocked()`; `send_to_agent` with `revive: true` overrides the first two. | 482ee7f2 | [revive-guard-proof.txt](revive-guard-proof.txt) |
| **Spawn queue.** It survives a restart (`spawn-queue.json`) and a held spawn gets its id at once. Duplicate requests join one entry, and reviewer, clarity and checker agents start first once 1 GB is free, then stop themselves after their one turn. A message to a retired `mastermind-servex-N` goes to the current one. | 33bbef55 | [queue-proof.txt](queue-proof.txt) |
| **merge.mjs never rewrites a live `*.jsonl`.** `Server/jsonl-keep.mjs` keeps lines appended after the check, on both merge paths. **Child reports** to a parent now carry 4000 characters, not 300. | e710dc3c | [jsonl-keep-proof.txt](jsonl-keep-proof.txt) |

Each piece had a fresh review; the findings and answers are in `task.jsonl` and in [review.md](review.md) / [review-queue.md](review-queue.md).

## Next, in order (each piece merges on its own, then ask mastermind-servex-8 for the restart)

1. **Budgets enforced by the heartbeat.** A draft is parked at [draft/Budget.js](draft/Budget.js) and [draft/heartbeat-budget.diff](draft/heartbeat-budget.diff). It adds `Servex/Budget.js`, called from `Heartbeat.tick()`:
   - The cost is `cost_usd` on the task's assign lines, which `Server/task-cost.mjs` writes.
   - The budget is `budget_usd` on an assign line, else the first "$N" after the word "budget" in `requirements.md`, else $15 for a task mastermind and $5 for a minion.
   - At 100% it messages the owner once. At 150% it stops the owner's live descendants (never the owner) and posts on card `live`. Each step is logged once as `{"log":{"budget":…}}`.
   - Not done yet: the spawn gate should also refuse new spawns whose parent's task is over its cap (the ask: "the heartbeat stops spawning for it at the cap"). Also still needed: a proof and a review.
2. **Pool cleanup and prune.** `git worktree list` shows 71 worktrees; 50 of their branches are fully merged into michael/dev.
   - Prune every worktree whose branch is merged and whose agents are stopped or gone. Use `worktree-down.mjs`; it refuses a dirty tree.
   - `return_worktree` and the prune should treat the dev server's own logs (`files.jsonl`, `page.jsonl`, `.claude/skills/clarity/flags.jsonl`) as clean, and salvage must leave them out (brief, 20:30 and 20:35).
   - Code: `Servex/Pool.js` (salvage, around line 215; baseline, around line 384), `Server/worktree-down.mjs`, `Server/worktree-sweep.mjs`.
3. **Idle-release of masterminds.**
4. **Peer messages between task masterminds**, with a copy to the parent (brief, 19:25 (3)).
5. **via:worktree stamps.**
6. **Still in the brief:** the dispatch queue (deliverable 4), the `land` tool (2), the skill log (1), `hold --paths` (3), checkpoint by context (5), "tell an agent its id in each wake" (20:35 (1)), and "stop_agent warns about a queued child" (19:25 (2)).

## Fences and traps

- **Worktree:** `C:/Code/lew42/worktrees/node-reliability`, branch `worktree/node-reliability`. Its dev server's logs dirty it constantly. Before merging michael/dev in, run `git checkout -- <those *.jsonl>` inside the worktree only, never in the main tree.
- **The pool's `take_worktree` fails** (full). This worktree has its own `Servex/node_modules`, installed with `npm ci` and never linked.
- **Boot-check a Servex change on a private port:** `SERVEX_HOME=<temp> SERVEX_PORT=18090 SERVEX_PROXY_PORT=18080 SERVEX_PROXY_INTERNAL=18079 SERVEX_NO_GATE=1 SERVEX_NO_ASSISTANT=1 SERVEX_NO_POOL=1 …`, then `GET /agents`, then kill it. Never use the real home.
- **`review.mjs` could not start its reviewer** while memory was short. That should work after the queue restart; until then, a fresh in-process reviewer is fine, and its lines go into the main `task.jsonl` in review.mjs's format.
- **Memory is about 4 GB:** at most 2 minions.
