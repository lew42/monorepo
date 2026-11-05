# Completion you can trust: report (2026-11-04)

All of it is merged to `compliance/dev` (last merge `327940efe`). Raw outputs are in [evidence/](evidence/).

## Deliverables, proof, rerun

| # | Done | Proof | Rerun |
|---|---|---|---|
| 1 | One score, one command: prompts, tasks created/finished/stopped/open, finishes without proof, children (registered/linked/unlinked), cost, one score with its formula. Session page and item tool read the same `completion_score()`. Recursive to any depth; addressable by agent id, session id or folder name. | `Server/session-query.test.mjs`, `core/Task/completion.test.mjs` (independent recompute, nested parent/child) | `node Server/session-query.mjs --report <id>` · `--recent 5` |
| 2 | Every owner prompt is a `Prompt extends Task` (hook `prompt-relay.mjs`); an unresolved one counts against the score. | `core/Task/Prompt.test.mjs` | `node public/framework/core/Task/Prompt.test.mjs` |
| 3 | `from`/`id` on `spawn_agent` moves the task; an agent's task is no longer left `running` after it lands (CloseLoop, already fixed 2026-11-02); spawned children are linked (e00f55c9: 84 registered, 84 linked, 0 unlinked). | `Servex/agents/close-loop.test.mjs`, `handoff-route.test.mjs` | `node Servex/agents/close-loop.test.mjs` |
| 4 | Process proven live with 3 real Haiku steps, twice, the second across a Servex restart. See below. | `evidence/live-run1-pass.txt`, `evidence/live-run2-restart-process.jsonl` | `node Servex/process-live.mjs --root <repo>` · add `--restart-at "step-2 started"` |

## Process, live

- **Why it stalled (first live run, `evidence/live-run0-stall.txt`):** a finished step's own worker session stayed `running`, so the step read `running` and `Process.next()` waited forever. Fix: `ProcessRunner.settle_sessions` completes those sessions when their step is complete. Regression test in `ProcessRunner.test.mjs` ("THE LIVE STALL", fails without the fix).
- **Run 1 (4.6 min, exit 0):** step-1 start, spawn, complete, step-2 start, ... step-3 complete, process complete. Parent score 0 → 33.3 → 66.7 → 100%.
- **Run 2 with `sustain --restart` fired at "step-2 started":** step 2 was spawned just before the restart; its agent was cut off, revived by Servex and finished (`helper-task-step-2-3`); step 3 started and the process completed, parent score 100%. The line order in `live-run2-restart-process.jsonl` is start, spawn, complete for every step. The watcher script dies in a restart (it is the agent's child), so the proof is read from the process file afterwards.
- Not tested: a restart while a step is idle between steps, or two processes at once.
- **Agreement with `mastermind-process-cleanup`:** `ProcessRunner` calls `servex.task_loop.close_task({dir, why:"process complete", by:"ProcessRunner"})`, guarded. Their `close_task` is now merged and works: run 2 ends with `closed_why: process complete`. Not done: the CloseLoop clean-end call they asked for (CloseLoop and `Lifecycle.js` are theirs to wire).

## The score, and the e00f55c9 mismatch

Formula (core/Session readme, "The one formula"): `score = 1 if the owner checked it, else the mean of score(part)` over subtasks (not stopped), child sessions (one part each) and counted owner prompts, to any depth; a task with no parts is 1 if complete, else 0.

`node Server/session-query.mjs --report e00f55c9`: 312 prompts said; 1196 tasks created, 571 finished, 166 stopped, 459 open (270 of them child sessions); 168 of the 571 finishes have no outcome or evidence; 84 children, 0 unlinked; $645.43. **Score 64.8%.** The three numbers the owner saw were: 64.8% = this score; 56.7% = the top-level parts that are fully complete (299 of 527); 49.9% / 47.7% = finished/created counted flat across all nested tasks, which is not used. They were three different questions.

This session: 4 tasks, 3 finished, 75% before D4 closes.

## ai/asks.jsonl line 209 (landed on `landed_at` alone)

Confirmed: an ask could land with nothing proving it. The report now prints "N of M finished have no outcome or evidence" (`Task.proof_problem`); `Servex/asks/Asks.js` no longer lands an ask on `landed_at` alone (test added).

## Tests, before and after (Item, Task, Session)

`evidence/tests-before.txt` vs `evidence/tests-after.txt`: every Item (24), Task and Session test passes in both. After: 43 files, all `exit=0`. Differences are only additions (`completion.test.mjs`, more checks in `Task.test.mjs` 66→67, `SessionFolders` 15→25). Nothing existing was changed to pass. `ProcessRunner.test.mjs` 54 passing.

## Cost

Mine: **$12.60** on Sonnet (budget was about $10: the live stall cost an extra investigation round and two review rounds). Plus about $1.1 of Haiku step agents across three live runs. The earlier attempt cost $129.73.

## Left / closed

- Closed: stall cause, unlinked count, asks proof gap, `page_tools.js` year regex typo (`/^d{4}$/`), the ref-cache test that broke on the new `tally` key.
- Not done: CloseLoop clean-end `close_task` call (process-cleanup's); a session's own owner prompts still count 0 until a tab's `prompt-relay` has run for it.
- Removed: my three scratch live-run folders (`session-6c8c09af`, `d6e2e291`, `2dc89bc2`; evidence copied here).
