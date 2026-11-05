verdict: fix
1. [fix] The not-built items (idle unload of whisper/recite, newest tunnel per name, `start_server` carrying the caller) are said to be "recorded in [improvements](/Servex/improvements.jsonl)" (requirements.md items 4 and 6, review.jsonl answer 9), but `Servex/improvements.jsonl` does not exist on `worktree/qf-2`, in the qf-2 folder, or on compliance/dev. Those three asks are not written down anywhere, and the link is dead.
2. [fix] The proof leaves a footprint: `git worktree list` still shows `worktrees/closeout-test-bigjys` and `closeout-test-qt4dmy`, with their branches, from runs that never reached the test's `finally`. `Servex/closeout.test.mjs` should remove leftover `closeout-test-*` worktrees and branches when it starts.
3. [fix] `Lifecycle.kill()` (Servex/Lifecycle.js, the new launcher kill after `kill(r)`) also kills a browser's launching node process, and only exempts the main checkout. `Server/plugins/Shot.js` and `MCP.js` open browsers inside a worktree's own dev server, so when that browser is closed (for example by the new rule "a ready pool slot holds no browser"), the slot's dev server is killed too, even though `kept()` protects it. Exempt `server.js`/`run.js` launchers, not just the main path.
4. [note] In `Lifecycle.why()`, the new "launcher is gone" rule sits before `if (only)`. So one task's `closeout` closes other tasks' orphan browsers, and if one survives the kill, its re-check lists it in this task's `left`.
5. [note] `Worktrees.list()` now returns every linked worktree, wherever it is, including ones a Claude Code tab makes under `.claude/worktrees/`. The header comment (Servex/Worktrees.js:14-18, "Every folder in C:/Code/lew42/worktrees/") is now stale.
6. [note] `Pool.generated()` treats any tracked `*.jsonl` edited in place as machine-written. An agent's uncommitted edit to a tracked log (asks.jsonl, a task.jsonl) is put back to HEAD on return and survives only as a patch in `.worktree-logs/`. Say so in Servex/doc/pool.md.
7. [note] Indexing: `Servex/closeout.test.mjs` is listed in Server/doc/scripts.md's `Server/` table. `Servex/closeout.fixture.mjs` and the state file `worktree-sweep-fails.json` are not named in any doc (processes.md only says "state in the Servex state folder").

## Requirements
- 1 "kept() checks the pool file; live sweep logs every pass; empty list retried and reported" — yes — `pool_slot()` reads `.worktree-pool.json`; Servex.js appends `lifecycle-sweep`; `processes_async` retries; `closeout` adds a `process-list` left row
- 2 "worktree-down retries back off, cap 6 h, one risk note on 5th" — yes — Server/worktree-sweep.mjs `backoff_left`/`note_result`
- 3 "every sweep logged; spawns gated on commit charge 80/90" — yes — Global.js `commit_pct`/`admit`, with tests in global.test.mjs
- 4 "ready slot holds no browser; Tunnel claim stops a second tunnel" — yes — Pool.js `start_watcher` on take, ready slots' watchers killed on adopt; Tunnel.mjs writes the state file first. Sub-item "recorded in improvements": no (finding 1)
- 5 "close-out rule in mastermind.md and finish-task" — yes — both diffs
- 6 "worktree-up records the owner of a hand-started server" — yes — falls back to `lc.owner_task()`. Sub-item "recorded in improvements": no (finding 1)
- 7 "leftover folder not a project; merged clean worktree removed by closeout and merge.mjs; Playwright browsers closed by the watchdog" — yes, with the side effect in finding 3
- Owner's sentence "zero footprint, zombies closed automatically, cause fixed" — mostly; the test's own worktrees are a footprint (finding 2)
- Class with live instances — n/a (no new class; Lifecycle/Worktrees/Pool only gained methods)
- Can a fresh agent continue from the folder? — yes: requirements.md names the branch (`worktree/qf-2`, not merged), the proof command and the decisions; report.md has the investigation

## Words
- Plain, full sentences in processes.md, finish-task and mastermind.md — yes
- Each doc says one thing and links the long form (processes.md) — yes
- processes.md's new section is long (about 40 lines), but it is the deep doc it links to, so that is fine
