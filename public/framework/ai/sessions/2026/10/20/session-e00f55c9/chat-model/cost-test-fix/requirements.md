# AISessionCost.test: red on a short real log

The full suite run on michael/dev (2026-11-02 03:02, core/Test/run-all.jsonl) went red on `public/framework/ai/AISession/AISessionCost.test.mjs`, case "real log: … AISession and the audit agree".

Cause: the test reads the newest replayed transcript in ~/.claude/projects. The newest one is now 572 lines, so `rows.slice(mid - 300)` (mid = 286) is `slice(-14)`: the "overlapping tail" fed only the last 14 rows and the total came out short (1.34 vs 2.42). The cost code is fine; step 7 of chat-model (SessionStats.js) is not involved.

Fix: `Math.max(0, mid - 300)`. Test passes after it.
