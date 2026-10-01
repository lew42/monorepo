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

Ask with `system_health` (its first line now ends "Ours 6.1 GB in 124 processes, everything else 14.2 GB …"), or `GET /api/processes` for the whole snapshot plus an hour of 10-second points. One line a minute goes to the `processes` log (`%LOCALAPPDATA%/lew42/servex/logs/processes.jsonl`), and one per reap. Both are answered by the main Servex only (port 80); a worktree has no monitor of its own. Neither can be forced: the next pass is at most 10 seconds away.

What `/api/processes` answers, trimmed:

```json
{
  "ours": { "n": 124, "mb": 6100, "cpu": 8.2 },
  "other": { "n": 310, "mb": 14200, "cpu": 5.1 },
  "free_mb": 11000, "total_mb": 32000,
  "commit_mb": 42700, "commit_limit_mb": 54000, "idle_s": 1842.3,
  "groups": [{ "key": "task 2026-09-30/process-monitor", "kind": "task", "label": "2026-09-30/process-monitor", "n": 9, "mb": 1200, "cpu": 3.4, "pids": [47356], "agents": ["task-mastermind-dormant-idle"] },
             { "key": "session 400", "kind": "session", "label": "Claude Code session (pid 400)", "n": 2, "mb": 1800, "idle_h": 3.2, "stale": true }],
  "sessions": { "n": 6, "stale": 3, "stale_mb": 1850, "stale_h": 2 },
  "orphans": [{ "pid": 600, "name": "tail.exe", "mb": 5 }],
  "reaped": [{ "pid": 601, "name": "grep.exe", "ok": true }],
  "games_closed": [{ "type": "game-closed", "name": "StarCraft.exe", "pid": 7788, "idle_min": 34, "free_mb": 5200, "graceful": true }],
  "running": [{ "id": "minion-x", "state": "working", "pid": 200, "mb": 250, "lost": false }],
  "worktrees": { "total": 45, "pool": 3, "in_use": 6, "open": 9, "uncommitted": 5, "finished": 2, "removed_today": 4, "servers_stopped": 19 },
  "history": [{ "at": "…", "cpu": 13.3, "ours_mb": 6100, "other_mb": 14200, "free_mb": 11000, "groups": { "orphans": [10, 0] } }]
}
```

`history` holds up to 360 points, one every 10 seconds: the last hour.

## Stale VS Code conversations

A **Claude Code session** group ([table above](#)) is **stale** once nothing inside it — the
claude.exe itself, or any shell under it — has used any CPU for `SERVEX_STALE_SESSION_H` hours
(default 2). It uses the same `idle_since` every process already keeps, taken as the group's
LATEST member (one still-busy shell keeps the whole conversation "fresh"), so staleness is never
claimed while anything under it is doing something. Each session group gets `stale: true` and
`idle_h`; the top-level `sessions: {n, stale, stale_mb}` counts all of them; `line()` and the Live
card both name how many and how much RAM. **Never closed here** — the owner closes a VS Code
conversation themselves; this only flags it.

## Games: closed only when idle AND RAM is tight

`Games.js` closes a listed game (`SERVEX_GAMES`, default `StarCraft.exe, SC2.exe, SC2_x64.exe,
Battle.net.exe`) only when ALL three hold, checked once a minute:

- idle past `SERVEX_GAME_IDLE_MIN` minutes (default 30) — no keyboard or mouse input at all,
  read by `GetLastInputInfo` in the process monitor's own PowerShell loop (`idle_s` above);
- free RAM under `SERVEX_TIGHT_MB` (default 6144 MB);
- one of the listed names is actually running.

`decide()` is the whole rule as one pure function (`Games.js`), so the proof checks the exact
edges — idle 29, 8 GB free, no game running — with no PowerShell and no Servex at all. Closing
tries `CloseMainWindow()` first; only if the SAME pid is still alive 60 seconds later does
`taskkill /PID` end it — never a fresh lookup by name, so a relaunch in that window is never
touched. `SERVEX_CLOSE_GAMES=0` only logs what it would have closed. Every close (or would-close)
is one `{type: "game-closed", name, pid, idle_min, free_mb, graceful}` line on the `processes` log
and shows under `games_closed` here.

## The commit charge

`commit_mb` / `commit_limit_mb` is the machine's total commit charge (Windows'
`Win32_OperatingSystem`: total minus free virtual memory) — RAM plus whatever has spilled to the
pagefile. Free RAM alone can look fine while the pagefile is almost full; commit charge is the
number that actually explains thrashing. Read by the same PowerShell loop as everything else,
once a tick.

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
- **locked** or **no branch** (a detached HEAD): never touched.
- **in use**: an agent works in it, or git touched it in the last 2 hours (`SERVEX_WORKTREE_QUIET_HOURS`): any change to its index, `HEAD` or the LAST LINE of `logs/HEAD` (read by its own timestamp, not the file's mtime — `git gc` or a reflog expiry can rewrite `logs/HEAD` without adding a line, which once made 36 worktrees at once look freshly used), so a status, an add, a commit or a checkout all count (a VS Code tab may be in it). Our own pass reads with `--no-optional-locks`, so it never counts.
- **uncommitted**: it has real changes. Never touched.
- **open**: its branch has commits michael/dev does not.
- **finished**: its branch is merged or applied by merge.mjs, or the task that took it has landed and its owner has stopped.

A **finished** worktree is removed:
1. `Server/junction-check.mjs` must pass first. If it fails, nothing is removed that pass; the failure goes to the `servex` log and shows as `worktrees.junctions_ok: false` in `/api/processes`, and the next pass (10 minutes on) tries again.
2. Its dev server is stopped.
3. Log noise its own server wrote (`*.jsonl` lines, new screenshots under `ai/`) is copied to `salvage/worktrees/<name>-<date>/`.
4. `git worktree remove` runs. The **branch is kept**, so `git revert` still works.
5. Servex forgets the project, its port and its subdomain.

If `git worktree remove` refuses, the worktree is shown as open with git's reason. Every removal is one line in the `servex` log (`type: "worktrees"`). `SERVEX_WORKTREE_CLEANUP=0` only reports. The count shows in `system_health` and in `/api/processes` (`worktrees`).

## Stopping an idle worktree's SERVERS (not removing it)

A worktree's dev server, its `Server/health.mjs` watcher and that watcher's Playwright Chromium
together cost 2-3 GB, and used to keep running long after the work on them was done — 19 of them
were still up on 2026-10-01 for tasks already paused or landed. Removing the worktree FOLDER needs
the branch merged first (deleting it can't be undone), but stopping just its servers is
reversible — the proxy auto-starts a project again on its next request — so the bar is lower,
and `Worktrees.js` checks it on every pass, independently of the `pool`/`locked`/… state above:

- **its task is paused, landed, or its agent has stopped** (`{"assign":{"paused":true}}`,
  `landed_at` + `outcome`, or the agent named in its log is no longer live) — stopped at once, no
  2-hour wait; or
- **nothing has used it for the same 2 quiet hours** as the `in use` check above, with no live
  agent working there right now.
- **Never** a `qf-*` pool slot (`Pool.js` looks after those itself).

The dev server stops through Servex's own stop path — `command(name, "stop")`, the exact call
`stop_server` makes — so Servex's own record of it stays correct and the proxy's autostart still
works afterward (checked by hand after this landed). The health watcher (and the Chromium that is
a child of it) is found and stopped through `Lifecycle.open()`/`close()`: `health-supervisor.mjs`
already calls `Lifecycle.track("health", …, { path })` on its own start, naming its own pid and
the worktree it watches, so neither stop is ever a guessed pid. One `servex` log line
(`type: "worktrees"`) per worktree actually stopped; the running total is `summary().
servers_stopped`. `SERVEX_WORKTREE_STOP_SERVERS=0` turns this off (the removal flow above is
unaffected).

## Cost

One long-lived hidden PowerShell: one process query (about 0.2 s of CPU) and Git's `ps -e` every 10 seconds. A command line crosses the pipe only the first time a process is seen.
