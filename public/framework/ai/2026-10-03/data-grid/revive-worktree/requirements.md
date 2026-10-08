# Unblock: revive a dead worktree dev server

Load the `minion` skill first. Work in the MAIN tree (this is a small, shared
dev-tool fix, not page content — no worktree needed for a ~60-line script).
Task dir: `public/framework/ai/2026-10-03/data-grid/revive-worktree/`.

## Why
My own task (`@task-mastermind-data-grid`) needs to run a perf test against
`http://data-grid.localhost/` (the worktree at `C:\Code\lew42\worktrees\data-grid`,
registered in `.worktrees.json` with port 64874). Its node process died
(probably a Servex restart or the node-reaper, since Servex only tracks a
worktree's server in memory — nothing re-registers it on Servex's own
restart). `start_server` doesn't know worktree projects at all, and the
`server-guard` hook (`.claude/hooks/server-guard.mjs`) correctly refuses any
direct `node server.js` / `Start-Process ... server.js` — so no agent can
just restart it by hand. `Server/worktree-up.mjs` itself won't rerun for an
existing worktree ("already up").

## Do
Write `Server/worktree-restart.mjs <name>`:
1. Read `.worktrees.json` (same `read_registry`/`write_registry` shape as
   `worktree-up.mjs`/`worktree-down.mjs` — copy their read/write functions,
   don't invent a new file format). Error clearly if `<name>` isn't there.
2. If the registered `pid` is still alive (`tasklist /FI "PID eq <pid>"`, or
   just try `taskkill /PID <pid> /T /F` and ignore "not found"), stop it
   first — never leave two servers on the same port.
3. Re-run exactly `worktree-up.mjs`'s own boot step (steal/copy its code,
   lines ~182–231: the `Start-Process` PowerShell launch with `windowsHide`
   through a hidden cmd wrapper logging to the SAME `log` path already in
   the registry entry, `wait_for_boot(port)`, then the `POST /api/projects`
   call to Servex so the proxy knows it again) — but skip `git worktree add`
   and `npm ci` entirely: the worktree and its `node_modules` already exist.
4. Update the registry entry's `pid` (same `write_registry` call) and print
   the url, same shape as `worktree-up.mjs`'s own success output.
5. Run it for `data-grid`: `node Server/worktree-restart.mjs data-grid`.
   Confirm `http://data-grid.localhost/` answers 200 (plain `fetch`, not a
   browser). Also try it for `sessions-tab-polish` (registered 22:07, also
   found dead) — if that one revives cleanly too, great, but `data-grid` is
   the one that actually blocks a task; don't spend budget chasing others
   beyond one try each.
6. Add a one-line mention of the new script to `Server/readme.md`'s index
   (wherever `worktree-up.mjs` is already mentioned, right beside it).

## Never
Don't touch `server.js` or `Server/run.js` themselves. Don't touch
`Servex/` (the in-memory-only registration is a real gap, already flagged
to mastermind-servex separately — not yours to fix here). Don't run
`node server.js` / `npm start` / `npm run dev` yourself — you're writing the
one sanctioned script that does the equivalent, the same way
`worktree-up.mjs` already does, which the guard explicitly allows (anything
that isn't literally `server.js`/`Server/run.js`). Never a visible window
(`windowsHide: true` throughout, same as the file you're copying from).

## Fence
`Server/worktree-restart.mjs` (new), `Server/readme.md` (one line), this
task dir. Commit when it works. Model: Sonnet. Budget $3.

Report back to your parent (`task-mastermind-data-grid`) once
`http://data-grid.localhost/` answers 200, or if you're stuck.
