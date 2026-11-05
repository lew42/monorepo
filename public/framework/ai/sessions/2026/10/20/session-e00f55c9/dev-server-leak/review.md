verdict: fix
1. [fix] The task folder has no outcome or report: `session.jsonl` ends at the commit line (9653b7ed0), with no landing, no 3-line report and no exact command for the owner to run in the morning (requirements.md step 3). Add an outcome line that names `node Server/worktree-servers.mjs --stop-stale --dry` and then `node Server/worktree-servers.mjs --stop-stale`, says what landed, and says what is left. Without it, a fresh agent can't continue from this folder alone.
2. [fix] `Server/worktree-servers.mjs:66` is dead code: `else if (!branch && … && false) { state = "detached"; }` can never run, and it also runs a git call for nothing. Delete it. If a detached worktree needs its own state, make that a real branch of the if.
3. [fix] `Servex/Servex.js:1565` clears a wedged `this.reaping`, but the old promise's `.finally` (line 1572) still sets `this.reaping = null` when it eventually settles. That can wipe out a newer sweep that is still running, so two sweeps run at once. Guard the finally, for example: `const p = …; this.reaping = p; … .finally(() => { if (this.reaping === p) this.reaping = null; })`.
4. [note] `Servex/Monitor.js:46` lowers the free-RAM flag from 3 GB to 1.5 GB. The brief didn't ask for this, and the task folder gives no reason for it (Law 4: say why). It also means new agents keep spawning on a machine that is already short of RAM (the brief found about 2 GB free).
5. [note] The idle exit (`Server/Server.js:91`) only counts HTTP `request` events. A WebSocket upgrade or a long-lived `live()` tail doesn't reset the timer, so a worktree page the owner keeps open without reloading stops after 30 minutes. The doc says "nobody has opened it", which is slightly off. Either say "no new HTTP request" in `Server/doc/worktree-servers.md`, or also count socket traffic.
6. [note] Ask 2a, "stop when the worktree is merged": `Server/merge.mjs` doesn't stop the server itself. That happens at landing (`on-landing.mjs` → `reap`) or at the sweep's 2-hour silence rule. With the idle stop, a merged worktree's server now ends within 30 minutes anyway, so this is acceptable, but the doc's "What stops a server" table should say merge alone doesn't stop it.
7. [note] Requirements otherwise met. The launch sites are found and fixed (`worktree-up.mjs:195`, `worktree-restart.mjs:119`). The supervisor IPC (`server.js:166`) avoids a respawn. The pid is recorded in `.worktrees.json` plus the lifecycle start line (two places, both documented). The `--list`/`--stop-stale` tool reuses `Lifecycle` (`kept`, `close`) rather than building a second killer. The new doc is indexed from `Server/README.md:13` and `Servex/doc/lifecycle.md:32`.

## Requirements
- 1 "Find the code that starts these servers" — yes — `Server/worktree-up.mjs` and `Server/worktree-restart.mjs`, both changed in the diff
- 2 "stops when merged, returned to the pool, or removed" — partly — pool and removal are covered (doc table); merge is covered only through landing, the sweep or the idle stop (finding 6)
- 2 "after N minutes with no request (idle stop)" — yes — `Server/Server.js` `idle_exit()`, 30 min, `WORKTREE_IDLE_MIN`; HTTP only (finding 5)
- 2 "Record each server's pid in one place" — yes, in substance — `.worktrees.json` plus `lifecycle.jsonl`, documented at the end of `Server/doc/worktree-servers.md`
- 3 "`--list` default dry run: worktree, pid, age, MB, active state" — yes — `Server/worktree-servers.mjs:73-76`
- 3 "`--stop-stale` stops only merged, gone or pooled servers" — yes — plus `task landed` and the opt-in `--older-than`; dead branch at line 66 (finding 2)
- 3 "Don't run `--stop-stale`; put the exact command in your report" — not run, as far as the folder shows; no report in the folder (finding 1)
- 4 "Document it in the owning module's readme" — yes — `Server/doc/worktree-servers.md`, linked from `Server/README.md` and `Servex/doc/lifecycle.md`
- Fences "never kill, never stop main or Servex" — yes — the tool's `kept()` honours the keep ports, Servex, the gate and whisper; the diff shows no kill was run
- New class needs a live-instances page — n/a (no new class)

## Words
- `Server/doc/worktree-servers.md` — yes — opens with what the page is, a table of what stops a server, then the commands
- "Nobody has opened it for 30 min" — no — it means no new HTTP request (finding 5)
