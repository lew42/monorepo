Budget: $10.

# Servex: dev servers started only by Servex, leased, and reaped (the RAM fix)

**TOP PRIORITY** (the owner, 2026-10-02). vscode-mastermind measured 59 node.exe using 3.9 GB:
- 22 dev servers (`Server/run.js`, 2.1 GB), one per worktree, mostly idle or old, plus three copies in main;
- 26 `node server.js` (1.2 GB), started from agents' bash shells and never stopped;
- 5 health processes.

Each dev server is a pair: `node server.js` supervises `node Server/run.js` (`Server/worktree-down.mjs`). So most of those 26 supervisors belong to the 22 servers, and a server is stopped as a whole process tree.

The owner's rule (vscode-mastermind decided the mechanism; it's now in `Servex/readme.md`, "Dev servers"):
1. **Servex starts every dev server; nobody else does.** Agents never run `node server.js` or `run.js`. A PreToolUse guard (like git-guard) refuses those commands and says: use the worktree's URL, and the proxy starts it, or use start_server.
2. **Lease, then idle shutdown:** a server is leased to the agents using its worktree. It stops by itself when no live (working or idle) agent holds that worktree AND it has had no request for 10 minutes. A sleeping or dormant agent doesn't hold it.
3. **Waking needs nothing special:** the proxy already auto-starts a project on its first request. No re-attach logic.
4. **No zombies:** the reconcile pass kills any node server whose worktree has no lease, and any process tree whose launching shell is gone. It logs each kill.
5. Main keeps exactly one dev server, always on.

Owner: `mastermind-servex`.

## Step 0, now, before any build: the cleanup
`node public/framework/ai/2026-10-02/node-reap/node-reap.mjs` (a dry run: read the plan), then `--apply`. It stops every worktree server tree with no working or idle agent there, the extra main copies, and trees whose agent shell is gone. It clears their pids in `.worktrees.json` and writes `result.json` (node count and MB, before and after). That result is the RAM issue's first fix: report it on `/framework/servex/issues/` (`ram-limit`), or if that page isn't built yet, `known-issues/seed.json` takes it as the seed's first fix line.

## Build, in this order
1. **The guard.** `.claude/hooks/server-guard.mjs`, a PreToolUse hook on Bash and PowerShell, modelled on `git-guard.mjs`, with its own test file. It refuses `node server.js`, `node Server/run.js`, `npm start` / `npm run dev` in a repo checkout, and `Start-Process node … server.js`. The message says: "Servex starts dev servers. Load the worktree's URL (the proxy starts it) or call start_server." `Servex` itself and `Server/worktree-up.mjs` run outside agent shells, so they're unaffected. Check one thing first: `Server/doc/worktrees.md` and the minion and sub-mastermind skills must not tell agents to run these commands.
2. **One way to start a worktree server.** `worktree-up.mjs` spawns its own detached `node server.js` today, a second system beside Servex's proxy (law 6). Make worktree-up create the worktree, then ask Servex to start the server (`start_server`, or the proxy's first request). Record the port Servex gives it. Check that the proxy sees `C:/Code/lew42/worktrees/<x>` as a project. If it doesn't, extend the scan, don't add a second registry.
3. **The lease and the idle stop**, in Servex: a worktree is leased while any agent in state `working`, `starting` or `idle` has its `cwd` inside it or holds its pool slot. The proxy stamps each project's last request. Once a minute: no lease and no request for 10 minutes means stop the server, through the same `stop_server` path. Log one `server-stopped` line with the reason. Main is never stopped.
4. **The reaper in the reconcile pass.** Move `node-reap.mjs`'s logic into Servex (`Servex/reap.js`; one copy, and the script becomes a thin CLI over it). Every reconcile it kills, as a whole tree:
   - a node server tree whose worktree has no lease and that Servex didn't start;
   - any process tree whose launching shell is gone (no live claude.exe above it, not under Servex);
   - extra copies in main.
   Each kill logs `reaped` with pid, MB and reason. Never claude.exe or chrome, and never a tree it can't place while its claude.exe is alive.
5. **Pool and landing.** `return_worktree` stops the slot's server; the next take starts it through the proxy. `on-landing.mjs`'s worktree-down stays as it is.
6. **Main: exactly one.** At startup and each reconcile, Servex keeps the one main server it started and reaps any other.

## Tests
- The guard refuses each command form and allows `node Server/worktree-up.mjs`, `node --test`, and any other node script.
- A worktree with only a dormant agent has its server stopped after 10 quiet minutes; a request inside the 10 minutes keeps it.
- The reaper kills an orphan tree (a fake `server.js` under a dead shell), leaves a leased one, and logs both.
- Main keeps one.
- Before and after node totals go in `task.jsonl` as an `experiment` line.

## Rules
Sonnet, high effort. A pool worktree. The mastermind reads the diff, and no page changes. Then `merge.mjs` and a Servex restart. Never kill a process you can't place; when in doubt, log it and leave it. Never wait on the owner.
