# Where agent cost was lost, and the fix (2026-10-13)

1. `Servex/agents/registry.js:43` `row()` never copied `cost` or `turns`, so `GET :8090/agents` (the registry) had no cost field: 0 of 2679 rows carried one.
2. `Servex/agents/Agents.js` `result()` did `this.cost = message.total_cost_usd`. That total counts from 0 in every claude process, and `sleep()`/`awaken()` and a Servex restart start a new one.
3. `reopen()` passed no cost, and `defaults()` sets `cost: 0`, so a revived agent restarted at 0.
4. The per-turn result line in `agent-<id>.jsonl` logged only the cumulative figure, no per-turn number to re-sum.
5. The Sessions row (`AISessionView.js:75`) and the models page already read `r.cost` / the index, so they need nothing once the row is filled.

Fix (commit 049fcea4d): `Agent.add_cost()` adds each turn's delta onto a running `cost`; `result` events carry `turn_cost`; the registry row carries `cost` and `turns` and never shrinks; `reopen()` restores `max(row.cost, sum of turn_cost in the log)`. Test: `node Servex/agents/cost.test.mjs` (real Agents class, scratch home: two turns, sleep/awaken, restart; the sum is right). The live Servex needs a restart to pick it up (the mastermind's call). Today's numbers: `backfill.md`.
