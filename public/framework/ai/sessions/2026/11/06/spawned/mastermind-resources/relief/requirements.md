# Servex: relieve memory pressure at 70% commit, and stop gutting a held worktree

Budget: $15. Load the `minion` skill first, then the `code` skill. Parent: mastermind-resources. Plan and evidence: [../plan.md](../plan.md). The owner's words are line 1 of [../session.jsonl](../session.jsonl) (items 2 and 4). Read [Servex/doc/processes.md](/Servex/doc/processes.md) and the Nov 4 report ([report.md](../../../04/spawned/mastermind-process-cleanup/report.md)).

Work in your own worktree: `node Server/worktree-up.mjs resources-relief`. Commit there after each working step. Do NOT merge, do NOT restart Servex, never kill or restart the dev server, never stash (diff instead), never kill anything that is not ours (VS Code, Figma, the owner's Chrome, Creative Cloud, the Claude desktop app). Reading the live machine (`Get-Process`, the live logs in `%LOCALAPPDATA%/lew42/servex/logs/`, `node Servex/Lifecycle.js --dry`) is fine.

**Your files** (fence): `Servex/Pool.js`, `Servex/agents/Fixer.js`, `Servex/Lifecycle.js`, `Servex/Monitor.js`, `Servex/Processes.js`, `Servex/Worktrees.js` (only if the sweep fix needs it), new `Servex/Relief.js` + tests, `Servex/Servex.js` ONLY for the lines that construct and tick `Relief` (another builder edits `admission()`/`hold()`/`drain()` there: do not touch those), `Servex/doc/processes.md` (your sections), `Servex/doc/pool.md`. Not: `Crumbs.js`, `tools.js`, `Agents.js`.

## A. The pool must never gut a slot someone holds (item 4; the cause is found)

Evidence in the plan: at boot `Pool.adopt()` (`Servex/Pool.js` ~585) checks `slot.state !== "ready" || !(await this.answers(slot.url))`; `Fixer.take_slot()` takes the same slot with `take_sync()` during that await; `adopt()` then calls `remove()` on a taken, held slot, `worktree-down` deletes its files, and the fixer's claude.exe spins at 100% CPU in the empty folder.

1. `adopt()`: re-check the slot's state after every await; never remove a slot that is now `taken`.
2. `remove(slot)` itself refuses (one log line, nothing else) when the slot is `taken`, has `held_by`, or any live agent's cwd is inside its path (reuse the `inside()` check `give_back()` uses). Check every caller of `remove()` still does what it meant (a `bad` slot from a failed fast-forward in `take()`/`take_sync()`, and `give_back()`'s own removals, are removed by the caller who holds it and is not working in it: let those pass with an explicit flag).
3. `take_sync()` refuses while `adopt()` is still running (`this.started` not settled): the fixer then retries on the first request (`Fixer.start()` already tolerates a throw).
4. `Fixer.take_slot()`: if `this.slot` is set but its folder has no `.git` (gutted) or is no longer in the pool, drop it and take a fresh one; when the live fixer agent's cwd is such a folder, stop it so `ensure()` starts it fresh in the new slot.
5. Test: `Servex/pool-adopt-race.test.mjs` (see the other `pool-*.test.mjs` for how they fake git and servers) proving a slot taken during `adopt()`'s await is not removed, and `remove()` refuses a held slot.

## B. A safety net: an idle agent burning a core is put to sleep

In the process monitor (`Monitor.js` / `Processes.js`; it samples CPU per pid every 10 s): an agent whose state is `idle` (not `working`) and whose `claude_pid` uses more than 50% of a core for 5 minutes straight is made dormant (the agent's own dormant path, so it resumes on the next message), with one `processes` log line `{type:"spinning-idle", id, pid, cpu, minutes, action}`. Never the owner's tabs, never a `working` agent. `SERVEX_SPIN_DORMANT=0` only logs.

## C. Early relief at 70% commit (item 2)

New `Servex/Relief.js`, ticked once a minute from the monitor. When commit charge (`procmon.commit_mb / commit_limit_mb`) is at or above `SERVEX_RELIEF_PCT` (default 70), at most once per 15 minutes:

1. **First find out why `Lifecycle.sweep()` closes nothing.** The live log says `{"type":"lifecycle-sweep","closed":0,"gone":8,"kept":726}` at 20:17 tonight. 726 kept is the clue. Run `node Servex/Lifecycle.js --dry`, read `kept()`/`why()`, group the kept entries by reason, and write the counts in your task log. Fix the rule that keeps what is plainly waste (a dev-server stack of a finished or merged worktree, a qf-N not in the pool file, a server older than 2 h with no live owner). Write the before/after counts.
2. The relief run, in this order, each step logged: `Lifecycle.sweep()`; stop the servers of finished worktrees (`Worktrees` already has the stop path; call it, don't copy it); make idle agents dormant that have been idle more than 10 minutes and are not front desk, voice seats, the owner's tabs, or `dormant_after: "session"` holders (use the agents' own dormant method); count the orphans the monitor already reaps. One `processes` log line `{type:"relief", commit_pct, closed:[...], dormant:[...], freed_mb_estimate}`.
3. After that run, if commit is still at or above the threshold, post ONE `owner_note` (kind `risk`) per episode (re-armed only when commit falls below 65%): the five biggest NOT-ours apps by MB (group the monitor's `other` processes by exe name: Code.exe, Figma.exe, chrome.exe, Creative Cloud, …), each with its MB, as a suggestion to close. Never kill them. Find how other Servex code posts an owner note (grep `owner_note` / `Inbox` in `Servex/`).
4. Keep the rule a pure function (`Relief.decide({commit_pct, last_run, armed})`) so the test checks the edges without PowerShell, like `Games.js` does.
5. Test: `Servex/Relief.test.mjs` for the pure rule, plus one run with fake agents and lifecycle proving the order and that nothing in `other` is ever killed.

## Docs, same commits

`Servex/doc/processes.md`: sections "Early relief at 70%" and "A spinning idle agent", and correct anything your sweep fix makes stale. `Servex/doc/pool.md`: one line on the adopt race.

Done = all new tests pass, `node Servex/closeout.test.mjs` and the existing `Servex/pool-*.test.mjs` still pass, `node --check` on every touched file, commits on your branch. Report in six lines: branch, what the 726 kept were and what you changed, test output.
