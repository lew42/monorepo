# node-reliability: checkpoint 2 (2026-09-30)

Written by task-mastermind-node-reliability-2 at landing. Everything below merged into michael/dev. The Servex/ parts go live only after a Servex restart, which mastermind-servex-8 schedules.

## Merged

| Item | Merge | Proof |
|---|---|---|
| 1. smoke.mjs skips a link target that exists only uncommitted in the main tree; merge.mjs refuses a Git-Bash-mangled path | a30cb623 | [smoke-uncommitted-proof.txt](smoke-uncommitted-proof.txt) |
| 3. Pool: slot names free themselves; server logs are clean; unregistered slot removal. `Server/worktree-prune.mjs`. 76 → 38 worktrees | f3ca2f50 | [pool-prune-proof.txt](pool-prune-proof.txt) |
| 1b. A resumed session's old id is an alias of the new one | 382e918f | [proof-alias.txt](proof-alias.txt) |
| 2. Budgets: 100% tells the owner and its parent and refuses new spawns under it; 150% stops the minions | 382e918f | [budget-proof.txt](budget-proof.txt), [Servex/doc/budget.md](/Servex/doc/budget.md) |
| 4. Idle release (3 min while waiting on a child), peer messages, via:worktree | 382e918f | [idle-release-proof.txt](idle-release-proof.txt), [peer-proof.txt](peer-proof.txt), [via-proof.txt](via-proof.txt) |

Reviews: [review-smoke.md](review-smoke.md), [review-pool.md](review-pool.md), [review-budget.md](review-budget.md), [review-branch.md](review-branch.md).

## Still open (from the brief)

- The dispatch queue (deliverable 4), the `land` tool (2), the skill log (1), `hold --paths` (3), checkpoint by context (5).
- Tell an agent its id in each wake (20:35 (1)).
- `stop_agent` warns about a queued or working child (19:25 (2)).
- A returned pool slot with thousands of untracked files (qf-8) is kept, not cleaned: `git clean` would discard files for good.

## Traps met

- `git checkout -- *.jsonl` in a worktree right before `merge.mjs` knocked its dev server off mid-smoke, twice. A worktree dev server started with `Start-Process` also died between tool calls; start it through `cmd /c` and check it answers right before merging.
- Port 8137 is on the keep list (`Servex/keep.json`), the owner's phone. A hand-started main-tree server there is not a leftover.
- In Git Bash here, a quoted heredoc fed to `node -` still lost backslashes; edit regexes with the Edit tool.
