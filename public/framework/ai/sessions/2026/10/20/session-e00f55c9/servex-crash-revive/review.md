verdict: fix
1. [fix] `Servex/doc/restart.md:71` still says `crash-revive.test.mjs` has "9 checks". It now prints "23 checks passed", and line 65 of the same file points at the same test, so the two lines disagree. Change 9 to 23, or drop the count.
2. [note] Both findings from the last review are fixed. An agent stopped while it waits its turn stays stopped: `start()` re-reads the row's `stopped_by` (`Agents.js:519`), and `snapshot()` leaves it out (`Agents.js:571`). Check 6 covers it. Queued agents also survive a second crash (check 5).
3. [note] Ran in the worktree (`worktree/servex-revive-stagger`, head ac6970093): `crash-revive.test.mjs` printed "23 checks passed" and `revive-sweep.test.mjs` printed "4 checks passed". No gate runs either test.
4. [note] While an agent waits in the queue, its registry row reads `idle` or `working` (re-stamped at `Agents.js:537-541`), but no process is running. With the default gap of 3 s and 17 agents, the last one starts about 48 s after boot. `list_agents` and the dashboard show those agents as alive during that time. `restart.md:65` covers the `revive` line but not this.
5. [note] The `revive` line in `servex.jsonl` counts queued agents as `revived` before they start. `restart.md:65` says so. A `queued` list next to `revived` would make the line accurate without needing the doc.
6. [note] Requirements: asks 1, 3 and 4 landed in the earlier diff. This diff adds a mitigation for ask 2 (the stagger). `restart.md:63-65` says plainly that it is not a proven fix and explains how to judge it (if crashes soon after a revive boot keep their rate, set the gap to 0). That matches "otherwise, write down what to watch". The stagger lives in `revive()` alone, and the log names the alternative it rejected (staggering at `Servex.admission`). It is the simplest place for it.
7. [note] A fresh agent could continue from this folder: `session.jsonl`'s last line names the branch, the head commit, the check command and the pending merge. The task has not landed yet. It has no landing line, and the branch is not merged into michael/dev.

## Requirements
- 1 "Revive after a crash … a test that fakes a crash" — yes — landed earlier; checks 1-3 still pass in the worktree
- 2 "The crash cause … fix it if it's in our code … otherwise, write down what to watch" — yes — `restart.md:63` tests the `/mcp` burst idea against `crumbs.log` (not shown); the stagger is labelled unproven, with a stop rule
- 3 "Tests must not hit the live Servex" — yes — landed earlier (`Server/ServexFence.mjs`); not touched here
- 4 "Document both in Servex's readme … and in the test doc" — yes — `Servex/readme.md:56` names `SERVEX_REVIVE_GAP_S`; but `restart.md:71` has a stale check count (finding 1)
- class with live instances — n/a
## Words
- content — yes — `restart.md:63-65` and `readme.md:56` use plain sentences that say what changed and why; "not proved" is stated, not hedged
