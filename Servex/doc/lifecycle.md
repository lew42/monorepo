# Lifecycle: nothing is left running

**Everything the system starts is written down, and a finished task's leftovers are closed by node code, not by an agent remembering to.** On 2026-09-29 the owner found 22 dev servers still running for tasks that had finished: "we don't want to rely on the AIs to remember". This is the fix. It lives in one file, [`Servex/Lifecycle.js`](../Lifecycle.js).

## 1. The creation log

Every server, health watcher, headless browser, worktree, agent and task writes one `start` line when it begins and one `end` line when it stops. The lines go into `lifecycle.jsonl` in Servex's log folder (`%LOCALAPPDATA%/lew42/servex/logs/`), through Servex's single writer:

```json
{"at":"2026-09-29T17:50:44-05:00","kind":"server","id":"server.js:51996","pid":51996,"port":54991,"path":"C:\\Code\\lew42\\worktrees\\lifecycle","owner_task":"2026-09-29/lifecycle","owner_agent":null,"event":"start"}
```

| kind | who writes the line |
|---|---|
| `server` | `server.js` and `Server/run.js` write their own lines, so a server started by hand (`PORT=… node server.js`) is logged too |
| `health` | `Server/health-supervisor.mjs`, about itself |
| `browser` | `Server/browser.mjs`, at launch and on close |
| `worktree` | `worktree-up.mjs`, `worktree-down.mjs`, and the pool's `take_worktree` / return |
| `agent`, `task` | Servex's `spawn_agent` (start) and the agent's stop (end) |

**Who owns it** (`owner_task`) comes from the env var `LEW_TASK` when it is set; otherwise from the worktree the process runs in (the task whose log names that worktree, or whose folder has the worktree's name).

A process that is killed hard (`taskkill /F`) cannot write its own end line. The sweep notices the pid is gone and writes it.

## 2. The reaper

- **On landing.** `Server/on-landing.mjs` calls `reap(task)`: everything that task owns stops — its server (the `server.js` wrapper first, because it restarts `run.js` if only the child dies), its health watcher, its browsers, and its idle helper agents.
- **On the heartbeat.** Servex wraps the heartbeat's tick (`Heartbeat.js` itself is unchanged) and runs `sweep()` at most every 5 minutes. It closes anything whose task has landed, whose task log has been silent for over 2 hours, or that has no task at all and has run over 2 hours. It also stops idle one-pass agents (reviewer, clarity, checker, critic, fork) once their answer is written, and it reclaims pool worktrees whose holder has stopped.

Every close writes an `end` line whose `why` says the reason in plain words.

## 3. What is never touched

The main site (port 3104, and anything running from the main checkout), Servex itself, the gate, whisper, and every port listed in [`Servex/keep.json`](../keep.json) — today `[8137]`, the owner's phone. A worktree that someone is **working** in right now is left alone. A worktree's files are never deleted by the reaper; only its processes stop. Removing the folder stays with `Server/worktree-sweep.mjs`, which waits until the branch is merged.

**Windows reuses process ids.** A pid is killed only while it is still the same process: the reaper checks its birth time against the log line, and the pool checks its command line (on 09-29 a pool slot's old watcher pid had become `whisper-server.exe`).

## 4. Commands

```
node Servex/Lifecycle.js --dry               what the sweep would close, and why (touches nothing)
node Servex/Lifecycle.js --reap <task dir>   close what one task owns (add --dry to preview)
node Servex/Lifecycle.js --stop <pid>        stop a server you started, wrapper first, and log its end
node Servex/Lifecycle.js --salvage qf-2      empty a stuck pool slot into a salvage/ branch
```

Switches for Servex: `SERVEX_NO_REAPER=1` turns the sweep off; `SERVEX_REAPER_DRY=1` makes it only say what it would close (use this for any test Servex, so it cannot stop the machine's real servers).

## 5. Stuck pool worktrees (salvage)

When a pool slot's holder has stopped and the slot still holds work, the pool stops the slot's server first (a running server keeps appending `page.jsonl` lines, so the folder gets dirty again seconds after any reset). Then it commits everything to a branch named `salvage/<slot>-<date>`, which is never merged and never deleted. Then it moves the slot back to `michael/dev`, removes it and prepares a fresh one. The holder's card gets one line naming the branch. Details: [pool.md](pool.md).

## Also in this change

- **A clarity check runs once per task**, not once per minion landing, and waits while the machine monitor's flag is up (`Server/clarity.mjs`).
- **The monitor's "stop the finished ones" message goes out only when the list of stoppable agents has changed**, and it names them (`Servex/Monitor.js`).
- **A task log learns its worktree.** `spawn_agent` with a `task` and a worktree `cwd`, `take_worktree`, and `worktree-up.mjs --task <dir>` all write `worktree` into the task's log. `entry_for_task_dir` also matches by the task's slug or branch when that line is missing, so on-landing can find the worktree to tear down.
