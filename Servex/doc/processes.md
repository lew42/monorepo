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

**Why the sweep once closed nothing (found 2026-11-06: `closed 0, kept 726`).** 717 of the 726 were dormant agent rows, which run nothing, and the sweep could not tell which belonged to a landed task: `recent_tasks()` only walked `ai/YYYY-MM-DD` and `ai/Y/M/D`, never `ai/sessions/Y/M/D` where tasks live now, so no agent mapped to a task. It now walks `sessions/` too. A dormant one-pass agent (reviewer, clarity, checker, critic, fork) is closed like an idle one: its registry `turns` reads 0, so `turns > 0` is not asked of a dormant row. `sweep()` returns the dormant rows apart (`dormant`) and `kept` lists only what is really running or protected. Dry run before: 0 to close, 726 kept; after: 47 to close, 7 kept.

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

## Early relief at 70%

[`Relief.js`](../Relief.js) acts before the machine runs out of memory: Global's spawn gate only slows new work at `SERVEX_COMMIT_HIGH_PCT` (80), and Windows starts failing allocations near 100. Once a minute it reads `commit_mb / commit_limit_mb` from the monitor. When that is at or above `SERVEX_RELIEF_PCT` (default 70), and the last run was 15 or more minutes ago, it runs, in this order (each step is a `relief-step` line on the `processes` log):

1. `Lifecycle.sweep()`: close what landed or dead tasks still own.
2. Stop the dev servers of finished worktrees, through `Worktrees.stop_idle` (the same call the worktree tick makes; nothing copied).
3. Put idle agents to sleep with their own `sleep` method (`SERVEX_RELIEF_IDLE_MIN`, default 10 minutes idle). Never the front desk, the voice seats (`session-fast`, `session-smart`), the standing fixer, an agent whose `dormant_after` is `"session"`, a parent with a child still working, or anything that is not `idle`. The owner's own tabs are not agents, so they are never in the list.
4. Count what the monitor already reaped as orphans (`procmon.reaped`).

It then writes one line, `{type: "relief", commit_pct, closed, dormant, reaped, freed_mb_estimate}`. If the commit is still at the line after the run, it posts ONE `owner_note` (kind `risk`) per episode: the five biggest apps that are **not ours** (the monitor's `other`, grouped by exe name), each with its MB, as a suggestion to close. It never ends any of them, and never ends anything itself: only the three owners above close things. The note is re-armed only when the commit falls below 65%. `SERVEX_NO_RELIEF=1` boots without it.

**The note waits until the owner is away** (2026-11-07). It is posted only when there has been no keyboard or mouse input for `SERVEX_RELIEF_NOTE_IDLE_MIN` minutes (default 10; the monitor's `idle_s`, read with GetLastInputInfo). While the owner is using the PC, or when there is no idle reading, the run writes one `relief-note-held` line (`idle_s`, `need_s`), and the note stays armed: every 1-minute tick asks again while the commit is still over the line, so it is posted within a minute of them going away. The owner's own apps (Chrome, VS Code, Figma and the rest) are only ever a suggestion in a note, never an action.

The rule is the exported pure `decide({commit_pct, last_run, armed})`. Proof: `node Servex/Relief.test.mjs`.

## The page file: insurance, not the fix

**Option, not a decision:** a 48 GB page file, up from 26 GB. The owner (2026-11-07) agrees it's insurance at best and isn't changing it now; the fix he wants is leak accounting. That lifts the commit limit from about 57 GB to about 80 GB. Setting it is the owner's job: System Properties, Advanced, Performance, Virtual memory, then a restart.

- **What it helps:** short peaks. A burst of spawns, or a big build, gets room instead of failed allocations near 100%.
- **What it does not help:** leaks. A process that never ends keeps its memory, and a bigger page file only fills more slowly. Paged-out memory is also slow, so the PC drags before it fails.
- **The real fix is leak accounting.** Every process an agent or Servex starts gets a start line and an exit line ([Who started this pid](#who-started-this-pid), below), and `node Servex/leaks.mjs` lists every start with no end. The relief run at 70% and the spawn gate at 80% act on top of that.
- **Alternative:** keep 26 GB and lower the gate instead. That is safer for disk space, but it queues work sooner.

## A spinning idle agent

An agent whose state is `idle` should cost nothing, yet one was measured burning a core. The monitor (`Processes.watch_spin`) watches every real agent: idle and over `SERVEX_SPIN_CORE_PCT` (default 50) percent of one core for `SERVEX_SPIN_MS` (default 5 minutes) in a row, with the same pid throughout, makes it dormant (`Agent.sleep("spinning")`; its session stays and the next message wakes it) and writes `{type: "spinning-idle", id, pid, cpu, minutes, action}` on the `processes` log. A `working` agent never counts. `SERVEX_SPIN_DORMANT=0` only logs. The owner's own tabs are not agents and are never touched. Proof: `node Servex/processes.test.mjs`.

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
{"pid":12345,"cmd":"git status --short","why":"shell","agent":"minion-x","session":"<uuid>","started":"…","by":"servex"}
{"pid_exit":12345,"ended":"…","code":0,"signal":null,"by":"servex"}
```

`pid` is the first key, so `"pid":12345` finds the start line only and `"pid_exit":12345` the exit. `cmd` is cut at 300 characters; `why` is the tool name (`shell`, `quick_fix`, …) or `claude.exe`, or `spawn:<program>` when there is no tool.

- **Called for an agent:** the line goes to that agent's session log (`session.jsonl`, else `task.jsonl`). A claude.exe also goes to its parent's log, so a mastermind sees its children's pids.
- **Called by Servex itself** (no agent): the `spawns` log, `%LOCALAPPDATA%/lew42/servex/logs/spawns.jsonl`. Four pollers are skipped there by name: the process-table query (`Get-CimInstance Win32_Process`), `netstat`, `git worktree list` and `git rev-parse --verify --quiet`. Measured over 10.6 h on 2026-11-06: 7,724 async spawns, about 12 a minute; those four were about 9 of the 12, so the `spawns` log gets about 3 start lines a minute (plus an exit line each).
- **Not logged by Servex's own hook:** sync spawns (`spawnSync`, `execFileSync`, `execSync`: no live pid to report, and they block for milliseconds); and anything Servex did not start itself, which the 10 s sample below picks up.

### Sampled children (processes an agent's claude.exe starts)

The Bash tool's shell, grep, node, a Playwright browser, a worktree dev server: claude.exe starts these, not Servex. [`Lineage.js`](../Lineage.js) finds them from the process table [`Processes.js`](../Processes.js) already samples every 10 s (`Processes.trace()`, a Map diff; no second PowerShell call). A process that is new since the last sample and descends from one of ours gets a start line; when it is gone from a later sample it gets an end line:

```json
{"pid":777,"cmd":"bash -c …","why":"child of claude.exe","agent":"minion-x","session":"<uuid>","started":"<process start time>","ppid":123,"seen":"sample","by":"servex"}
{"pid_exit":777,"ended":"…","code":null,"signal":null,"seen":"sample","by":"servex"}
```

- **Ours** = an agent's `claude_pid`, Servex's own pid, a pid `SpawnLog` already logged (`SpawnLog.logged`, so each pid gets one start line), or a process Lineage already logged. The nearest such ancestor names the agent (none: the `spawns` log) and the `why`: `child of claude.exe`, `child of <that pid's why>`, or `child of servex`. `conhost.exe` is skipped (one per console process).
- **First sample after a Servex restart** logs everything already running under an agent (`started` is the process's real start time), so a long-lived leftover has a start line.
- **10 s limit:** a child that lives under one sample is never seen. It cannot leak, so that is fine. A detached grandchild whose parent exits before the first sample that sees it has no ancestor left to name, so it gets no line either.
- **Restart gap:** Servex only compares each sample with the one before it, and the last sample is lost when it stops. A process that dies while Servex is down, or a SpawnLog child that outlives a restart, gets no end line and shows in the leak report as "gone, end missed". Nothing reloads the old state at boot.
- **End line:** `code` is `null` and `signal` is `null`: a sample cannot know the exit code.
- **Cap:** at most 60 start lines per owner (an agent, or Servex) per minute (`Lineage.CAP`). The rest are counted once in `{"pid_dropped":N,"agent","cap","window_start","seen":"sample"}`, so a watch loop cannot flood a log. The cap is per owner, not total: with 7 agents the whole machine writes about 80 lines a minute (see Measured). `SERVEX_LINEAGE=0` turns the whole thing off.
- **Measured** on the live machine (2026-11-06, read-only, three real samples 10 s apart, 7 agents): 3, 4 and 12 new descendants per sample (about 38 start lines a minute, about 42 end lines a minute, so roughly 80 lines a minute across all agents; the busiest single agent reached 9 in one sample, under the cap of 60 a minute). The first sample logged 31 existing ones.

### Leaks: a start with no end

`node Servex/leaks.mjs` (a leak = a start line with no end line) reads every start and end line from the session logs and the `spawns` log and puts each unended start in a group: **gone, end missed** (the pid is not running: a logging bug), **alive, owner done** (its agent is stopped or dormant, or its task has landed: a real leak) or **alive, owner working** (fine). `--write <file>` writes the markdown report. It never kills anything. Run it, then fix the close path that missed the process (`Lifecycle.js`, `closeout`, `Pool.js`, `Server/Browser.mjs`), never the process itself. Tests: `Servex/leaks.test.mjs` (the pairing), `Servex/chrome-pin.test.mjs` (no ending path ever picks the owner's Chrome, Code or Figma; a Playwright chrome is picked; a forced kill writes its end lines).

**Gone at boot.** A crash (or a hard stop) takes Servex's exit handlers with it, so a process that ended while Servex was down never gets its end line: on 2026-11-08 the four claude.exe started in the 05:05 boot (`assistant-fast`, `master-assistant`, two of `mastermind-session-truth`) died with that boot's 05:06 native crash and stayed open. A minute after every boot, Servex calls `SpawnLog.close_gone()` (`Servex.js`, after `revive()`; `SERVEX_NO_GONE_SWEEP=1` skips it). It runs `node Servex/leaks.mjs --close-gone --before <boot time>`, which only prints, and appends what was printed itself, as the one writer: every gone start older than the boot gets one `{"pid_exit","ended","seen":"boot"}` line in each log its start is in. `ended` is an upper bound (the boot, or 1 ms before the same number started again), not the real exit time. **The end % in `pid-coverage.mjs` counts these boot ends**, so a crash gap shows there only until the next boot; `git grep '"seen":"boot"'` finds them. Run `--close-gone` by hand to see what the next boot would write. Tests: `Servex/leaks.test.mjs` (`close_lines()`), `Servex/SpawnLog.test.mjs` (`close_gone()`).

### Coverage, and the two gaps that log nothing

`node Servex/pid-coverage.mjs [--hours 24]` sorts every start line in the window by the exe actually spawned (`claude.exe`, `node`, `git`, `powershell/bash`, `chrome (playwright)`, `other`) and prints, per kind, how many got an end line and how many carry both an `agent` and a `session`. Read-only, reuses `pair()`/`read_lines()` from `leaks.mjs`. The table is not committed here — a snapshot drifts the moment it is written, so it lives only in the task report, [pid-accounting/report.md](/framework/ai/sessions/2026/11/06/spawned/mastermind-resources/pid-accounting/report.md); rerun the script for the current numbers. A snapshot taken 2026-11-08: claude.exe ends about 82% (of 6 open starts, 2 were still-live agents and 4 were gone with no end line, killed by the 05:06 Servex crash; closed by "Gone at boot" above) and attributes 100%; chrome ends and attributes 100%; git, node and the rest end near 99% but are attributed only through their nearest tracked ancestor (an agent's own claude.exe), so a line copied to no agent's log (a lone `spawns` poll) shows 0% there by design, not as a bug.

Two gaps the coverage number cannot see, because nothing is ever written for them:

1. **Under 10 seconds, Lineage never samples it.** Measured the same day: about 150 shell starts were sampled in 24 h (Lineage, `"seen":"sample"`, kind `powershell/bash`), against roughly 3,280 Bash/PowerShell tool calls made by agents in the same window (counted from the transcripts' own `"name":"Bash"` / `"name":"PowerShell"` tool-use lines, the cheaper source — `~/.claude/projects/<dir>/*.jsonl` modified in the last 24 h, `grep -oc` for the two tool names). **About 1 in 22 is ever seen.** It cannot leak (gone before the next sample), so this is a visibility gap, not a leak risk.
2. **A `claude -p` launched outside `spawn_agent` is invisible for its whole life.** `Servex/agents/roles/mastermind.md`'s "Fallback ONLY when Servex itself cannot be reached" recipe starts a bare `claude.exe` that Servex never put in its `owners` map, so Lineage's `root()` walk can never name it (while Servex is actually down, this is also moot — nothing is sampling at all). The bug was a mastermind using that same recipe for an ordinary `spawn_agent`/`take_worktree` **refusal** (no pool worktree ready), where Servex is up and the right move is to retry or queue. Two sessions did this on 2026-11-07/08 (`73e88e75`, `d2507b09`; a third, `00c47a44`, also used it and registered its own task folder by running `TaskDirs.mjs` itself, but still has no pid line); both had already ended by the time this was checked (a one-off manual check made 2026-11-08: every live `claude.exe` against every logged pid, found none unlogged that day). **Fixed 2026-11-08:** the role readme now restricts the recipe to Servex being genuinely unreachable and says to retry/queue on a plain refusal (`mastermind.md`, "Spawning").

Finding things: [How to find things](/framework/ai/sessions/#how-to-find-things).

Limits:
- `MCP.call` (the HTTP door) carries no agent, so its spawns land in `spawns`.

The queue is loud in the same way: `Servex.hold()` appends `{"queued":{"agent","reason","commit_pct","page_file_mb"}}` to the parent's session log, and `drain()` appends `{"started":{"agent","waited_s"}}`. `page_file_mb` is null until the process monitor reads the page file. A queue entry restored after a restart writes no second `queued` line. Tests: `Servex/SpawnLog.test.mjs`, `Servex/Gate-loud.test.mjs`.

## Cost

One long-lived hidden PowerShell: one process query (about 0.2 s of CPU) and Git's `ps -e` every 10 seconds. A command line crosses the pipe only the first time a process is seen.
