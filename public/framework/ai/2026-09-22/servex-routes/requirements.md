# servex-routes — a worktree registers itself with Servex, and the proxy reaches it

Minion: Sonnet, effort high. Session id `762c8baf-14c7-4d93-96bf-079f1a1f5251`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then
[`../worktree-proof/`](../worktree-proof/)'s task log (deliverable 2, the proxy gap) and
`Servex/readme.md`. Load the `code` skill. Worktrees you make go to
`C:/Code/lew42/worktrees/` and are removed before you land.

## The two gaps, found today by worktree-proof

1. **Servex scans `C:/Code` two levels deep** (`Servex/Servex.js:47,117`), so
   `C:/Code/lew42/worktrees/<name>/` is never a project and `<name>.localhost:8080` cannot be
   reached. Fix: a registration route — `POST /api/projects` with `{name, path, port?}`
   (loopback only, like every route) adds a project to the list and to the proxy's map (a
   port from the registry if none given), and `DELETE /api/projects/:name` removes it; both
   also log one `project` event. `Server/worktree-up.mjs` posts to it after the worktree's
   server is up (with the port it chose), `worktree-down.mjs` deletes; both stay silent and
   succeed when Servex is not answering (a worktree must work without Servex — Servex is
   optional, always). Prove: `node Server/worktree-up.mjs routes-proof` → `curl
   http://routes-proof.localhost:8080/framework/` is 200 through the proxy (Host header:
   `curl -H "Host: routes-proof.localhost" http://127.0.0.1:8080/framework/`), the project
   appears in `list_servers`, and `worktree-down.mjs routes-proof` removes it from both.
2. **`Server/worktree-up.mjs`'s `npm ci` call throws EINVAL on Windows** — `spawnSync("npm",
   …)` needs `shell: true` (or `npm.cmd`); worktree-proof worked around it by hand. Fix it and
   prove `worktree-up` completes unattended, logging the wall time.

Then one doc item: **`Servex/readme.md`** gets a five-line section "Surviving a reboot": the
exact `schtasks /Create` (or `Register-ScheduledTask`) line that runs `node Servex/sustain.mjs`
at logon, hidden, from the repo root — written, not run (the owner's machine config), and
the `ask` line with `needs: {owner: "run one schtasks line", minutes: 1}`.

## Rules for the live Servex

Servex is RUNNING under its keeper (`node Servex/sustain.mjs --status`). After editing
`Servex/**`: `node Servex/sustain.mjs --stop`, then the hidden launch (`powershell -NoProfile
-Command "Start-Process -FilePath node -ArgumentList 'Servex/sustain.mjs' -WorkingDirectory
'C:\Code\lew42\monorepo' -WindowStyle Hidden"`), confirm 8090 answers, log the PIDs. Never
`cmd /c start`. A `Server/` save restarts the owner's supervised dev server after a boot test
— take the hold, `node --check`, boot your own `PORT=8096 node server.js` and curl a 200
before releasing.

## Fence

`Servex/Servex.js`, `Servex/ReverseProxy.js`, `Servex/Project.js` (Edit only), `Servex/readme.md`,
`Server/worktree-up.mjs`, `Server/worktree-down.mjs`, your task dir. Append-only to `.jsonl`.
Not `Servex/agents/`, not `public/` (board-from-events is on v/3 right now — stay out).

## Length

Route code under 60 lines. Landing report: six sentences with the proxy proof and the up time.
