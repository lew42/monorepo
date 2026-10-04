Budget: $4. One agent does this itself.

# Spend gate: OpenRouter agents are charged what they really cost

**What happened** (vscode-mastermind, 2026-10-04): task-mastermind-new-brain (`google/gemini-3.8-flash`, `budget_usd` 4) ran for 14 minutes.
- Servex showed its cost as $0, and its agent log has no cost lines.
- In the same window, OpenRouter's `/api/v1/credits` `total_usage` rose from $33.15 to $37.89 (+$4.74).
- The gate should have stopped it at $2 (no result yet). It never fired, and vscode-mastermind stopped it by hand.

**Where it goes blind** (read by mastermind-servex-10, not yet proven):
- `Agents.js` `meter()` (about line 1393) prices each assistant message by calling `generation_cost(key, message.id)` 6 times, 2.5 s apart.
- Every failure is swallowed (`.catch(() => null)`), so the message counts as $0 with no log line.
- `provider.js` (line 116) already warns that the SDK's `message.id` matched OpenRouter's generation id on one run, "though not every model/run has shown it matching".
- `real_turn_cost()` has a fallback for this (a before/after key-usage diff); `meter()` has none.

**Already written by mastermind-servex-10 (uncommitted in main, never `node --check`ed):** the spawn pause (`Agents.spawn`, `SERVEX_OPENROUTER_PAUSED`), echoes kept on Claude while paused (`Echo.model_for`), and an `unpriced` spend-gate line from `meter()`. Check them, then do what's left below: gating an agent with 3 unpriced calls, and all of step 2.

## 1. Fail closed, first (land this alone, quickly)

- **An OpenRouter spawn is refused** until step 2 lands: "OpenRouter spawns are paused: their cost isn't being measured (2026-10-04/openrouter-cost-blind)". One check in the spawn path, behind a setting that step 2 turns off. Don't remove the key or touch the owner's files.
- **A running OpenRouter agent whose cost can't be read is gated.** If an agent has made 3 or more model calls and `meter()` priced none of them, treat its spend as unknown: interrupt it and post the gate's card, the same as an over-budget agent.
- Commit, merge, and restart Servex when `list_agents` shows nobody mid-turn.

## 2. Find the real cause and read the real cost

1. **Diagnose from the evidence:** new-brain's session transcript (its assistant `message.id` values) and one `/api/v1/generation?id=<that id>` call (a free read). Is the id a generation id, is the lookup too slow (over 15 s), or is it refused? Record what you found as an `experiment` line. Read numbers from the API, never from memory (law 7).
2. **Fix it by what you found**, in this order of preference:
   - the cost OpenRouter returns with each response (`usage.cost`, if this route includes it) → price each call from that, with no extra request;
   - the right id for `/generation` (from a response header or field) → keep `meter()`;
   - neither → `meter()` falls back to the key's `total_usage` before and after each call when only one OpenRouter agent is running, and splits the rise by input tokens when several are.
3. **Never silent:** every failed price is one `spend-gate` line ("unpriced", with the reason), and `gate_row()` shows unpriced calls.
4. **Tests** (beside `spend-gate.test.mjs` if it exists, else new): a call priced from `usage.cost`; a `/generation` miss falling back to the key diff; 3 unpriced calls gate the agent; an OpenRouter spawn is refused while paused and allowed after.
5. **Prove it live** with one tiny Gemini Flash agent (cap $0.20): its Servex cost matches the rise in `/api/v1/credits` within 10%. Then turn the pause off.

## Land

`node --check`, the tests, commit by exact path, merge, restart when nobody is mid-turn. Post on the card in plain words: "OpenRouter agents' cost was invisible to the spend limit; it's now read from <source>, and a test agent's $X matched OpenRouter's bill." Update the known issue `openrouter-runaway-turn`.

Sonnet, medium effort. Never `stash`, `checkout --` or `reset` in the main tree. Don't wait on the owner.
