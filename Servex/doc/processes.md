# The process monitor, orphans, and worktree clean-up

**What it answers:** how much RAM and CPU is ours, how much belongs to everything else, which task uses how much, and what was left behind.

Every 10 seconds Servex reads every process on the machine. It sorts each one into a group:

| group | what is in it |
|---|---|
| **task** `<date>/<slug>` | an agent's claude.exe and everything under it (bash, git, node, tail …), for the task that agent, or its nearest parent agent, works for |
| **front desk** | the assistants, managers and session agents |
| **Servex** | Servex itself, the node that supervises it, and its other children |
| **Claude Code session** | a claude.exe Servex did not start (a VS Code tab) and its shells |
| **dev servers** | the servers Servex started detached, and any process from this repo or a worktree whose parent is gone |
| **orphans** | a leftover waiter of ours (bash, tail, grep, sleep …) whose parent is gone |
| *other* | everything else: Chrome, VS Code, Windows. Counted, never touched. |

Ask with `system_health` (its first line now ends "Ours 6.1 GB in 124 processes, everything else 14.2 GB …"), or `GET /api/processes` for the whole snapshot plus an hour of 10-second points. One line a minute goes to the `processes` log, and one per reap.

## Running means a real process

Servex starts every agent's claude.exe itself (`Agents.spawn_claude`, through the SDK's `spawnClaudeCodeProcess`), so it knows the PID from the first moment:
- `claude_pid` is on the agent and on its registry row;
- `{type: "process", state: "started" | "exited", pid}` goes in the agent's log.

The monitor checks that PID every 10 seconds. An agent that says `working` or `idle` but has no live claude.exe is shown as **lost**. A dormant agent has no process on purpose ([dormant.md](./dormant.md)).

## Orphans: flagged, and ours reaped

- **Flagged:** a process of our kinds whose parent is gone, and whose command line points into this repo, a worktree, Claude's own folders, or Git for Windows' own tools.
- **Reaped** after 10 minutes with no CPU (`SERVEX_REAP_ORPHANS_MS`), and only if it is a waiter: bash, sh, tail, grep, sleep, cat, head, sed, awk, timeout or find. A node process with no parent is shown under dev servers, never killed. `SERVEX_REAP_ORPHANS=0` only flags.
- **Every reap** writes one line to the `processes` log and shows under `reaped`.

⚠ **Windows lies about Git Bash parents.** A Git Bash tool starts through `exec`, so Windows names a parent that already exited, even while the pipeline is alive and being read. A `tail -f | grep` under a live Claude session looks parentless. So the monitor also reads Git's own `ps -e`, which keeps the true tree, and trusts it over Windows. Without that, a live session's monitor would be killed. The proof plants both a dead and a live pipeline: [proof.txt](/framework/ai/2026-09-30/process-monitor/proof.txt).

## Worktree clean-up

Every folder in `C:/Code/lew42/worktrees/` becomes a Servex project with its own port and `<name>.localhost`. Every 10 minutes `Worktrees.js` gives each one a state:

- **pool** (`qf-*`): the quick-fix pool recycles these. Never touched here.
- **in use**: an agent works in it, or git touched it in the last 2 hours (a VS Code tab may be in it).
- **uncommitted**: it has real changes. Never touched.
- **open**: its branch has commits michael/dev does not.
- **finished**: its branch is merged or applied by merge.mjs, or the task that took it has landed and its owner has stopped.

A **finished** worktree is removed:
1. `Server/junction-check.mjs` must pass first.
2. Its dev server is stopped.
3. Log noise its own server wrote (`*.jsonl` lines, new screenshots under `ai/`) is copied to `salvage/worktrees/<name>-<date>/`.
4. `git worktree remove` runs. The **branch is kept**, so `git revert` still works.
5. Servex forgets the project, its port and its subdomain.

`SERVEX_WORKTREE_CLEANUP=0` only reports. The count shows in `system_health` and in `/api/processes` (`worktrees`).

## Cost

One long-lived hidden PowerShell: one process query (about 0.2 s of CPU) and Git's `ps -e` every 10 seconds. A command line crosses the pipe only the first time a process is seen.
