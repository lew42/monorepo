# pool-prune — minion brief

Load the `minion` skill first. Parent: task-mastermind-node-reliability-2. Log in this dir's task.jsonl.

## The owner's words
"Pool cleanup and prune: 70 worktrees; prune every worktree whose branch is fully merged into michael/dev and whose agent is stopped or gone; take_worktree must work again."
From the brief (requirements.md 20:30 / 20:35, one dir up): return_worktree and the prune treat the dev server's own logs (`public/files.jsonl`, any `page.jsonl`/`files.jsonl` under public/, `.claude/skills/clarity/flags.jsonl`) as clean, and salvage leaves them out.

Today: `git worktree list` = 76 entries; 52 branches are ancestors of michael/dev, 24 are not.

## Fence
Code: worktree `C:/Code/lew42/worktrees/node-reliability` only: `Servex/Pool.js` (salvage ~line 215, baseline/dirt ~384), `Server/worktree-down.mjs`, `Server/worktree-sweep.mjs`, new `Server/worktree-prune.mjs`, their docs (`Server/doc/`, `Servex/doc/`). The PRUNE ITSELF runs from the main tree against the real worktrees (that is the point), but only through your script, only after `--dry` shows the list.

## Deliverables
1. `Server/worktree-prune.mjs [--dry]`: for each worktree (never the main tree, never `node-reliability`, never one listed in the Servex pool as held by a live agent): branch is an ancestor of michael/dev AND no agent in `GET http://localhost:8090/agents` with state idle/working/queued has cwd inside it or holds it → stop its dev server (worktree-down's logic) and `git worktree remove`. "Dirty" ignores the server-log files named above (restore them to HEAD inside THAT worktree first, never in the main tree). Anything else dirty → skip and say why. Never `--force`, never delete a branch that isn't merged, never `git stash/reset`. Also drop its `.worktrees.json` entry and Servex pool slot if one exists. Print one line per worktree: `pruned` / `skip: <reason>`.
2. Same log-noise rule in `Pool.js` return/salvage and `worktree-down.mjs`.
3. Find WHY `take_worktree` says the pool is full (read Pool.js; likely a cap counted over all worktrees or dead holders) and fix it so it works after the prune. Proof = the fix's reasoning in one line + (after merge, the parent will call take_worktree).
4. Proof in `proof.txt`: the `--dry` output, then a real run's output, `git worktree list | wc -l` before and after. Do the real run ONLY on the main tree's worktrees with the script from YOUR worktree (`node C:/Code/lew42/worktrees/node-reliability/Server/worktree-prune.mjs --root C:/Code/lew42/monorepo` or equivalent). Commit code by exact path in your worktree. Do not merge. End with a 5-line report.

Budget: $5. Sonnet. Every process: windowsHide. Use MSYS_NO_PATHCONV=1 in Git Bash for /paths.

## Added 12:55 by mastermind-servex-8 (queued behind 1–4)
5. The main tree runs TWO `Server/run.js` dev servers: pid 8132 on port 3104 (since 09-29 18:59, supervisor pid 30588) and pid 9404 on port 8137 (since 09-30 12:24, supervisor pid 49268 from 09-25). Find which one Servex owns (`list_servers` / `GET http://localhost:8090/servers`) and whether the other is a leftover. If it is, name in proof.txt WHO starts it (command line of the supervisor: `wmic process where ProcessId=49268 get CommandLine` or PowerShell `Get-CimInstance Win32_Process`), and fix the starter so it stops happening if that file is in your fence; otherwise name the file and line. Do not kill the Servex-owned one; the leftover you may stop.
6. Node memory is 3.7 GB over 34 processes: a dev server + health.mjs per worktree. The prune must stop BOTH (the worktree's dev server and any health.mjs whose cwd/HEALTH_BASE is that worktree) before removing it. Count node processes and their total memory before and after, in proof.txt.
