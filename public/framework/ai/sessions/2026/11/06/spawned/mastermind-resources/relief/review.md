verdict: fix
1. [fix] Relief's "still over the line after the run" check reads the same monitor snapshot it started from (`Servex/Relief.js:308` calls `commit_pct()`, which reads `procmon.commit_mb`, and that only changes on the monitor's next 10 s PowerShell tick). So the risk note fires on every first run of every episode, however much relief freed. Wait for the next procmon `tick` (or check on Relief's next minute) before deciding. The test "relief that gets the commit under the line posts no note" passes only because its fake sweep changes `commit_mb` synchronously.
2. [note] Most of the drop from 726 kept to 7 kept is relabelling. `Lifecycle.sweep()` now returns dormant agent rows apart as `dormant` (`Servex/Lifecycle.js:442-443`), but the `lifecycle-sweep` log line (`Servex/Servex.js:1591`) still writes only `kept: r.kept.length`. About 670 dormant rows now vanish from the log. Add `dormant: r.dormant` to that line; it was outside this fence, so it is a follow-up.
3. [note] The STANDING regex now exists three times: `Servex/agents/Agents.js:1243`, `Servex/Processes.js:267`, and a new copy at `Servex/Relief.js:225`. A future edit to one will miss the others. Move it to a small SDK-free module that all three import.
4. [note] The brief said Relief is "ticked once a minute from the monitor". It runs its own `setInterval` instead (`Servex/Relief.js:248`), like Games.js does. That works, but it is a different shape from what was asked.
5. [note] `freed_mb_estimate` adds `row.mb` for each Lifecycle close row (`Servex/Relief.js:279`). The agent rows built at `Servex/Lifecycle.js:262` carry no `mb`, so closed agents add 0 and the estimate runs low.
6. [note] `remove()`'s new guard (`Servex/Pool.js:547-551`) applies to every caller that does not pass force. I checked them: sweep (ready slots), hold's "one ready is enough", reclaim's dead-server removal, and recycle_orphans (state `orphan`) all still pass the guard, so none of the self-heal paths are blocked.

## Requirements
- A1 "adopt(): re-check the slot's state after every await" — yes — `Servex/Pool.js:606-609`; pool-adopt-race check 1
- A2 "remove(slot) itself refuses … taken, held_by, or live agent cwd inside" — yes — `Pool.in_use()` at `Servex/Pool.js:581`; owners pass `{force:true}` at 135, 166, 265, 284, 602
- A3 "take_sync() refuses while adopt() is still running" — yes — `this.adopting` at `Servex/Pool.js:51-52,157`
- A4 "Fixer.take_slot(): drop a gutted slot, stop the fixer in it" — yes — `Servex/agents/Fixer.js:42-55`; test check 6
- A5 "Test pool-adopt-race.test.mjs" — yes — I re-ran it: 6 checks pass
- B "idle agent > 50% of a core for 5 minutes made dormant, one spinning-idle line, SERVEX_SPIN_DORMANT=0 only logs" — yes — `Processes.watch_spin`; processes.test.mjs, 47 pass (re-run)
- C1 "find out why sweep closes nothing; group kept by reason; fix; before/after counts" — yes — 717 of 726 were dormant rows, and `recent_tasks()` never walked `ai/sessions/`. Before 0 closed / 726 kept, after 47 / 7 (processes.md). The "kept" number is partly relabelled (finding 2).
- C2 "relief run in order, each step logged, one relief line" — yes — `Servex/Relief.js:273-311`; Relief.test check 4
- C3 "ONE owner_note (risk) per episode, five biggest not-ours apps, re-armed below 65%, never kill" — partly — the per-episode note works, but the "after the run" reading is stale (finding 1)
- C4 "pure Relief.decide()" — yes — `Servex/Relief.js:228`
- C5 "Relief.test.mjs" — yes — I re-ran it: 7 checks pass
- Docs "processes.md two sections + stale fix; pool.md one line" — yes — both present in the diff
- Done "closeout.test + pool-* still pass" — yes — pool-hold 8 pass; closeout's last line reports clean cleanup
- New class shows its live instances? — no — `Relief` holds `runs`, `armed` and `last_run`, but no page or endpoint shows them. The `relief` log lines on the `processes` log are the only view. This is a note, not a fix: the log covers what the owner would watch.
- Can a fresh agent continue from the task folder? — yes — `session.jsonl`'s outcome names the branch, commits, tests and caveats (not merged; never run live)

## Words
- content 1 (plain, clear) — yes — processes.md "Early relief at 70%" and "A spinning idle agent" explain what each does, with the trigger, the order and the env vars
- content (one takeaway) — yes — each section opens with what it does
- content (jargon) — mostly — "episode" in processes.md is used before it is defined; it is defined in the same paragraph ("re-armed only when the commit falls below 65%")
