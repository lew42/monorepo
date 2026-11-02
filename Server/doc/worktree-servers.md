# Worktree dev servers: how they stop

Every worktree gets its own dev server (`worktree-up.mjs`). Left alone they pile up: 68 ran at once on 2026-11-01, 4.6 GB, 60 of them for worktrees already merged or removed. This page says what stops one, and how you list and clear the rest.

## What stops a server

| When | By what |
|---|---|
| The task lands | `Server/on-landing.mjs` → `Lifecycle.reap()` ([lifecycle.md](../../Servex/doc/lifecycle.md#2-the-reaper)) |
| Servex is running | its sweep (every 5 min): landed task, task silent 2 h, or no task and up 2 h. The sweep has a 30 s limit on its process scan and a 3 min watchdog, so one hung scan cannot stop every later sweep. |
| `worktree-down.mjs`, `worktree-prune.mjs`, removing the worktree | they stop the server first |
| **Nobody has opened it for 30 min** | the server stops itself (below). Pool slots (`qf-N`) are exempt: `Pool.js` owns them. |
| You run `worktree-servers.mjs --stop-stale` | everything the list marks `*` |

**Idle exit.** `worktree-up.mjs` and `worktree-restart.mjs` start the server with `IDLE_EXIT_MIN=30` (change it with `WORKTREE_IDLE_MIN=<min>` in the launching shell; `0` turns it off). `Server/Server.js` `idle_exit()` watches HTTP requests; after that many quiet minutes the child tells `server.js` (the supervisor) over IPC, which shuts everything down. A plain exit would be respawned by the supervisor, so the message is needed. Open the page again and nothing is there: run `node Server/worktree-restart.mjs <name>`. Files are never touched.

## The tool

```
node Server/worktree-servers.mjs                 list (a dry run, stops nothing)
node Server/worktree-servers.mjs --stop-stale --dry   say what would stop
node Server/worktree-servers.mjs --stop-stale    stop the stale ones
node Server/worktree-servers.mjs --stop-stale --older-than 24   also stop open worktrees' servers up over 24 h
```

The list shows each server's worktree, pid (the wrapper, the process whose death stops the whole tree), age in hours, MB for the wrapper and everything under it, and a state. A `*` marks a stale one:

- `gone`: the worktree folder is not a git worktree any more.
- `merged into michael/dev`: its branch is an ancestor of `michael/dev`.
- `task landed`: the task that owns the worktree has landed.
- `pool slot, returned`: a `qf-N` slot nobody holds (`.worktree-pool.json`).
- `open (older than N h)`: only with `--older-than`.

It never stops: port 3104 and the other `Servex/keep.json` ports, Servex, the gate, whisper, a worktree an agent is working in, a taken pool slot, a preview held for your phone (`Lifecycle.kept()`). It reuses `Servex/Lifecycle.js` for the process list, the keep rules, the kill (`taskkill /T /F` on the wrapper) and the `end` line in `lifecycle.jsonl`, so there is no second implementation.

## Where the pid is recorded

One place per fact: `.worktrees.json` (the launcher writes `pid`, `port`, `path`) and the `start` line of `lifecycle.jsonl` in `%LOCALAPPDATA%/lew42/servex/logs/`. The tool also finds servers in neither (a wrapper whose child died, one started by hand) from the process list.
