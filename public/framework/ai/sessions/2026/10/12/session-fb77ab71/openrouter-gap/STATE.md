# openrouter-gap: state

- ✅ **Accounting gap:** ledger $110.08 vs account $64.45 (ledger is $45.63 above). Cause found by session-housekeeping: `key_diff` charged each overlapping agent the whole key delta. Fixed in `Servex/agents/Agents.js` (split across agents that settled meanwhile; source `key_diff_split`); needs a Servex restart. Both numbers now on [/framework/ai/models](/framework/ai/models) (`node Server/openrouter-gap.mjs --publish`).
- ✅ **Known-answer tests:** `Servex/ext/openrouter/evals/quick.mjs`, 8 tasks x 3 models x low/high thinking, total spend $0.03. All pass 8/8 except gemini-3.8-flash at high (7/8, 31 s and $0.015 on one task; 16x the cost of low). Cheapest: gpt-6-luna.
- ✅ Ask ticked in `ai/doc/asks.md`.
- Left: the ledger's past overcount stays (never destructive); the fix only applies after restart.
