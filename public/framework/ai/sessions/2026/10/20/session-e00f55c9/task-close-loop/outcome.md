# task-close-loop: agents now close their own tasks

An agent that stops with finished work completes its task; one that does not is woken once. Not live until `node Servex/sustain.mjs --restart` runs.

- [x] **Close the loop at stop:** `Servex/CloseLoop.js` via `Agent.close_loop()`; proof: `node Servex/agents/close-loop.test.mjs`.
- [x] **`StaleClose` never says "abandoned" for real work:** it reads `unclosed`; proof: `AIIndex` test, [stale-close doc](/Server/doc/stale-close.md).
- [x] **PromptAudit streams big transcripts:** `--days 7` ran on 703 MB in 27 s; proof: [prompt-audit-days7.txt](prompt-audit-days7.txt).
- [x] **History re-closed by script:** 390 task logs got one `unclosed` line, nothing rewritten; proof: [census.md](census.md), `Server/Unclose.test.mjs`.
- [x] **Tests:** clean end, one wake only, `unclosed` on worked tasks; proof: the three test files above.
- [x] **Documented:** [core/Task](/framework/core/Task/readme.md), [Servex/agents](/Servex/agents/readme.md).

| All time | before | after |
|---|---|---|
| abandoned | 459 | 76 |
| unclosed | 0 | 383 |

Also folded in: landed agents get FYI messages in their log, not a paid turn; `Task.completion` is the average of its subtasks.

Detail: [census-before.md](census-before.md), commits `3c29ade4d`, `7d69dcf7c`, `975e7ae23`, `d91d370d7`.
