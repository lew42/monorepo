# task-close-loop: outcome in full

An agent that stops with finished work now closes its own task, and one that does not gets a single wake.

**How it works.** `Servex/CloseLoop.js` decides and `Agent.close_loop()` applies it at `result()` and `stop()`. A clean end with an outcome or landing line completes the task with the agent's last words as the outcome. Otherwise the agent is woken once; `close_nagged` survives a revive. `BLOCKED`, errors, working children, one-shots and standing roles are left alone. `StaleClose` never calls real work abandoned: a commit or 3+ own lines reads `unclosed` (a new log line, a flag on `stopped`, an `AIIndex` bucket; a later `complete` or `start` supersedes it).

**History re-closed** with `Server/Unclose.mjs` (dry run, then `--apply`, append-only, manifest `public/framework/ai/unclose-manifest.jsonl`): 390 task logs got one `unclosed` line.

| All time | before | after |
|---|---|---|
| abandoned | 459 | 76 |
| unclosed | 0 | 383 |
| landed | 822 | 822 |
| stopped | 134 | 134 |
| stalled | 692 | 692 |

Full tables: [census.md](census.md), [census-before.md](census-before.md). The audit counted 224 minion-created tasks wrongly abandoned; the script touched 228 minion ones (390 in all), because `worked` is a commit or 3+ own lines and the main tree holds more lines than the audit's snapshot.

**PromptAudit** now streams transcripts over 512 MB: `--days 7` ran on a 703 MB transcript in 27 s (1 session, 104 prompts, about $13.54): [prompt-audit-days7.txt](prompt-audit-days7.txt).

**Follow-ups folded in (vscode-mastermind, 2026-11-02):**
- Once an agent's task has landed, FYI messages from anyone but the owner, a tab, its parent, `priority: "now"` or `revive: true` go to its task log, not a paid turn (`Agent.landed_fyi`). `send_to_agent` tells the sender (`held: true`).
- `Task.completion` is the average of each subtask's own completion, stopped left out; `Prompt` follows. A session at 100% means every task in it is at 100%.

**Commits.** Close loop, Unclose, PromptAudit, StaleClose, docs, tests: `3c29ade4d`, `7d69dcf7c` (merge `bcab42ca7`). Landed FYI: merge `975e7ae23`. Completion formula: merge `d91d370d7`.

**Tests.** `node Servex/agents/close-loop.test.mjs`, `Server/Unclose.test.mjs` (17), `Server/PromptAudit-stream.test.mjs`, the `AIIndex` test, `core/Task` and `core/Session` tests. `Servex/ProcessRunner.test.mjs` fails on the base too.

**Docs.** [core/Task/readme.md](/framework/core/Task/readme.md), [Servex/agents/readme.md](/Servex/agents/readme.md) ("When an agent stops"), `Server/doc/stale-close.md`, `core/Session/doc/classes.md` ("Completion"), `Servex/agents/roles/minion.md`.

**Not done.** Servex is not restarted: the close loop and the landed-FYI hold are not live until `node Servex/sustain.mjs --restart` runs (it refuses while agents work).
