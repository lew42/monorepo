# Processes: closing a task, the monitor, orphans, and worktree clean-up

**What it answers:** what a task started and how closing the task stops all of it by code; how much RAM and CPU is ours, how much belongs to everything else, which task uses how much, and what was left behind.

## Closing a task leaves nothing behind (2026-11-04, the owner: "if a task has been closed, then everything it should have done has happened")

The guarantee is code, not an agent remembering. Two halves.

**1. Everything is registered where it starts** (`Lifecycle.record()`, written through Servex's `lifecycle` log, `%LOCALAPPDATA%/lew42/servex/logs/lifecycle.jsonl`; a start line carries `owner_task` and `owner_agent`, taken from the environment or the working directory):

| started by | line kind | written by |
|---|---|---|
| a dev server, a health supervisor | `server` (`Server/run.js`), `health` (`Server/health-supervisor.mjs`) | `track()` in `Lifecycle.js`, called by the script itself |
| a Playwright Chromium | `browser`, with `launcher` = the node pid that opened it | `Server/Browser.mjs` |
| a worktree | `worktree` | `Server/worktree-up.mjs` (`owner_task` = the `--task` dir, else the caller's task), and the pool's `take`/`give_back` for `qf-*` slots |
| a child agent | `agent` | Lifecycle's own agent hooks (start and end of every Servex agent) |

Not registered yet: tunnels, whisper-server and the recite python process (the idle-timeout work, an open improvement).

**2. Closing runs one function**, `Lifecycle.closeout(dir, {why, by})`, which `close_task` (MCP → `TaskLoop.close_task`), `Server/on-landing.mjs` and `Server/merge.mjs` (after a full landing, through `Worktrees.close_now`) all call. By hand: `node Servex/Lifecycle.js --closeout <task dir> [--dry]`. It:

1. closes every process and idle child agent the task owns (`reap`);
2. for each worktree the task made (its `assign.worktree` lines, `.worktrees.json`, the creation log): a pool slot (`qf-*`) goes back to the pool; any other is stopped, then removed from git AND from disk by `Worktrees.close_now` when its branch is merged and holds nothing real. A folder git no longer lists is moved aside to `<worktrees>/../moved-aside/worktree-residue/`, never deleted. An unmerged or dirty worktree is kept and reported;
3. looks again at the live process list; anything still owned by the task is `left`;
4. writes ONE `task`/`end` line `{closed: […], left: […]}` and returns `{ok, closed, left}`. `ok` is false when anything is left, so a close never claims what did not happen.

**When nobody closes it** the sweep catches the rest. `Servex.reaper()` runs `Lifecycle.sweep()` on every heartbeat and always appends one `lifecycle-sweep` line to the `servex` log (what it closed, what it found gone, what it kept). Its rules (`Lifecycle.why()`): a task that landed or whose agent is dead owns nothing; a logged browser whose `launcher` pid is gone is closed; a ready pool slot holds no browser or health watcher (`kept()` checks the slot's pool file, not the `qf-N` path); a worktree folder git does not list is moved aside by the 10-minute `Worktrees.tick`.

**A browser cannot outlive its launcher.** `Server/Browser.mjs` starts `Server/browser-watchdog.mjs <launcher pid> <chrome pid>` detached; it kills Chromium the moment the launcher is gone, even after a hard kill that skips `process.on("exit")`. `LEW_NO_BROWSER_WATCHDOG=1` turns it off (the test does, to prove the sweep rule alone). Closing a browser also ends its launcher (`Lifecycle.kill`), so a script that held the browser cannot keep a worktree folder locked; a launcher that looks like Servex, claude, an MCP server or VS Code is never killed.

**Why the list was empty inside Servex (found 2026-11-05).** `Crumbs.js` wraps every `child_process` function to drop a breadcrumb, and the wrapper lost Node's `util.promisify.custom` hook, so `promisify(execFile)` resolved a bare string and `.stdout` was `undefined`: every listing inside the live Servex came back empty (a plain script was fine, which hid it). `Crumbs.js` now copies the hook back; `node Servex/Crumbs.test.mjs` proves it. Until then the sweep could not see any process, and wrote `found gone` for everything it had logged.

**A failed process listing is not an empty one.** `processes_async` asks PowerShell for every process (30 s limit) and retries twice (after 1.5 s, then 3 s) on an empty answer; if the list is still empty, `closeout` returns `left: [{kind: "process-list", why: "... (<the PowerShell or netstat error>) ..."}]` and `ok: false` instead of claiming everything closed, and the sweep writes no `found gone` line (an unreadable list makes every process look dead). `closeout.test.mjs` check 12 covers both.

**New work is gated on commit charge.** `Global.admit` refuses a spawn when the machine's commit charge is at `SERVEX_COMMIT_HIGH_PCT` (default 80: only masterminds and children of a live parent get in) or `SERVEX_COMMIT_FULL_PCT` (default 90: nothing new), on top of the working cap and `SERVEX_MIN_FREE_MB` (default 1024). See "The commit charge" below.

**Machine-written files never block a return.** `Pool.generated()` treats a modified tracked `*.jsonl` and the named server logs as machine-written: `give_back` sets them aside as a patch in `.worktree-logs/` and restores them, so the slot is returned. A NEW `.jsonl` or any source file is real work and still blocks the return, by name.

**Hand-started worktree servers back off.** `worktree-sweep.mjs` retries a failing `worktree-down` with a doubling wait (state in `worktree-sweep-fails.json` in the Servex state folder, cap 6 h) instead of every pass, and posts one `risk` owner note on the 5th failure.

**A worktree someone still works in is kept.** `Worktrees.close_now` refuses to remove a folder while a live agent, a not-yet-ended agent in the lifecycle records, or the calling process has its working directory inside it (on Windows that would delete the files and leave the folder, with the agent in a gutted checkout). The close reports it as `left`, and the sweep removes the worktree once that agent stops.

**A close with `left` does not undo a landing.** By then the merge is done, so refusing would help nothing: `on-landing` writes the `LEFT: ...` line, `closeout` returns `ok: false`, and `Lifecycle.sweep()` keeps retrying every heartbeat. Closing a browser also ends its launcher script, but never when the browser was started from the main checkout itself (the dev server's screenshot plugin holds one in-process).

**Is the live sweep running?** Yes. The empty process list under load was the cause of 'it closed nothing': it is now retried twice and reported as `left` with its cause (above); a worktree is not removed while the list is unreadable, and every sweep appends a `lifecycle-sweep` line to the `servex` log, so a quiet sweep is visible.

**The proof is a test you can rerun:** `node Servex/closeout.test.mjs` (one to two minutes, needs global Playwright, uses a temp `SERVEX_HOME` and port 18999 so the live Servex is untouched). It starts a real server, a real Chromium and a real git worktree under a task, plus a server in a leftover folder git does not list; closes the task; and asserts from the OS process list, `git worktree list` and the disk that none remain. Then: an unmerged worktree is kept and reported; a launcher killed hard has its browser closed by the watchdog; with the watchdog off the sweep finds the orphan; machine-written logs do not block a return. Every artifact it makes is removed at the end, and debris of an earlier run that died first (`closeout-test-*` worktrees and branches) is removed when it starts. `closeout.fixture.mjs` is the small server/browser/orphan program the test launches.

## The process monitor

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

⚠ **Windows lies about Git Bash parents.** A Git Bash tool starts through `exec`, so Windows names a parent that already exited, even while the pipeline is alive and being read. A `tail -f | grep` under a live Claude session looks parentless. So the monitor also reads Git's own `ps -e`, which keeps the true tree, and trusts it over Windows. Without that, a live session's monitor would be killed. The proof plants both a dead and a live pipeline: [proof.txt](/framework/ai/sessions/2026/09/30/2976c23c-62af-4aa8-b898-5e56e1c025f8/process-monitor/proof.txt).

## Worktree clean-up

Every folder in `C:/Code/lew42/worktrees/` becomes a Servex project with its own port and `<name>.localhost`. Every 10 minutes `Worktrees.js` gives each one a state:

- **pool** (`qf-*`): the quick-fix pool recycles these. Never touched here.
- **locked** or **no branch** (a detached HEAD): never touched.
- **in use**: an agent works in it, or git touched it in the last 2 hours (`SERVEX_WORKTREE_QUIET_HOURS`): any change to its index, `HEAD` or the LAST LINE of `logs/HEAD` (read by its own timestamp, not the file's mtime — `git gc` or a reflog expiry can rewrite `logs/HEAD` without adding a line, which once made 36 worktrees at once look freshly used), so a status, an add, a commit or a checkout all count (a VS Code tab may be in it). Our own pass reads with `--no-optional-locks`, so it never counts.
- **uncommitted**: it has real changes. Never touched.
- **open**: its branch has commits compliance/dev does not. `waiting` when its task has landed: it is held until the merge (or 48 quiet hours), and a task that asked for a preview has its server on the home Wi-Fi and is never stopped as idle ([worktree-preview.md](worktree-preview.md)).
- **finished**: its branch is merged or applied by merge.mjs.

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
- **Never** a preview waiting for its merge (on the `lan` list): the phone opens its port directly,
  and nothing would start it again ([worktree-preview.md](worktree-preview.md)).

The dev server stops through Servex's own stop path — `command(name, "stop")`, the exact call
`stop_server` makes — so Servex's own record of it stays correct and the proxy's autostart still
works afterward (checked by hand after this landed). The health watcher (and the Chromium that is
a child of it) is found and stopped through `Lifecycle.open()`/`close()`: `health-supervisor.mjs`
already calls `Lifecycle.track("health", …, { path })` on its own start, naming its own pid and
the worktree it watches, so neither stop is ever a guessed pid. One `servex` log line
(`type: "worktrees"`) per worktree actually stopped; the running total is `summary().
servers_stopped`. `SERVEX_WORKTREE_STOP_SERVERS=0` turns this off (the removal flow above is
unaffected).

## Who started this pid

Every async child process Servex starts (`spawn`, `exec`, `execFile`, `fork`, plain or promisified) gets a start line the moment it has a pid, and an exit line when it ends. [`Crumbs.js`](../Crumbs.js) hooks `child_process` and calls [`SpawnLog.watch`](../SpawnLog.js); `SpawnLog.js` holds the AsyncLocalStorage that says which agent's tool call (or which agent's own claude.exe) started it. Writes never throw and never slow the caller.

```json
{"pid":12345,"agent":"minion-x","session":"<uuid>","cmd":"git status --short","why":"shell","at":"…","by":"servex"}
{"pid_exit":12345,"code":0,"signal":null,"at":"…","by":"servex"}
```

`pid` is the first key, so `"pid":12345` finds the start line only and `"pid_exit":12345` the exit. `cmd` is cut at 300 characters; `why` is the tool name (`shell`, `quick_fix`, …) or `claude.exe`, or `spawn:<program>` when there is no tool.

- **Called for an agent:** the line goes to that agent's session log (`session.jsonl`, else `task.jsonl`). A claude.exe also goes to its parent's log, so a mastermind sees its children's pids.
- **Called by Servex itself** (no agent): the `spawns` log, `%LOCALAPPDATA%/lew42/servex/logs/spawns.jsonl`. Four pollers are skipped there by name: the process-table query (`Get-CimInstance Win32_Process`), `netstat`, `git worktree list` and `git rev-parse --verify --quiet`. Measured over 10.6 h on 2026-11-06: 7,724 async spawns, about 12 a minute; those four were about 9 of the 12, so the `spawns` log gets about 3 start lines a minute (plus an exit line each).
- **Not logged:** sync spawns (`spawnSync`, `execFileSync`, `execSync`: no live pid to report, and they block for milliseconds); and anything Servex did not start itself.

Finding things: [How to find things](/framework/ai/sessions/#how-to-find-things).

Limits:
- The Bash tool's children of a claude.exe (the commands an agent types) are started by claude.exe, not by Servex, so they get no line.
- `MCP.call` (the HTTP door) carries no agent, so its spawns land in `spawns`.
- ⬜ A PostToolUse hook could write a line for those Bash-tool children too; not built.

The queue is loud in the same way: `Servex.hold()` appends `{"queued":{"agent","reason","commit_pct","page_file_mb"}}` to the parent's session log, and `drain()` appends `{"started":{"agent","waited_s"}}`. `page_file_mb` is null until the process monitor reads the page file. A queue entry restored after a restart writes no second `queued` line. Tests: `Servex/SpawnLog.test.mjs`, `Servex/Gate-loud.test.mjs`.

## Cost

One long-lived hidden PowerShell: one process query (about 0.2 s of CPU) and Git's `ps -e` every 10 seconds. A command line crosses the pipe only the first time a process is seen.
