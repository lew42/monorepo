# Budgets

**A budget is an estimate, not a cap** (the owner, 2026-10-22). A brief's `Budget: $N`, or a spawn's `budget_usd`, is what the spawner expects the work to cost. Going past it never stops work. Only spend near **10x the estimate** (`SERVEX_GATE_HARD_X`, default 10) pauses anything. Two pieces of code apply this rule.

## Per agent: the spend gate (`Servex/agents/Agents.js`, `gate_check()`)

- **Results allowance (soft).** An agent starts with $2 to produce its first result (a commit, a step done, a page line, or a minion with a brief). Each result adds $3. Past that allowance, Servex does **not** interrupt the agent and posts no card. Instead it continues the agent itself: the allowance moves to $5 past what it has spent, logged as an `auto-continue` line in the `servex` log. The agent gets one line asking for a result soon.
- **Hard stop.** At 10x the estimate (with no estimate, the runaway ceiling `SERVEX_GATE_CEILING_USD`, default $100), Servex interrupts the agent, but never in the middle of a tool call, and posts one card: Continue (+$5) or Stop. The same pause happens when 3 or more model calls could not be priced, because then the spend is unknown.
- Proof: `node Servex/agents/spend-gate-proof.mjs`.

## Per task: `Servex/Budget.js` (every heartbeat tick, every open task)

- **Its cost** is `cost_usd` on the task's assign lines. `Server/task-cost.mjs` writes it: the mastermind's share plus every minion it spawned.
- **Its budget** comes from the first of these that exists:
  - `budget_usd` on an assign line;
  - a line in its `requirements.md` that starts `Budget: $N`;
  - $15 for a task mastermind, $5 for a minion.
- **At 100%** the task's mastermind and the agent above it are each told once that the estimate is reached. Nothing is refused or stopped.
- **At 10x**, a new spawn under that mastermind is **refused** with the reason, and its minions are stopped (never the mastermind, so it can land). A resume is never refused.
- **Each step is logged once** in the task's own `task.jsonl`, as `{"log":{"budget":"reached"|"over",…}}`.

## Raising a budget

Append an assign line with a new `budget_usd` and a reason in a `log` line. The refusal lifts on
the next tick, and the 100% and 10x steps start over for the new figure.

`SERVEX_NO_BUDGET=1` turns it off. Proof: `public/framework/ai/sessions/2026/09/30/node-reliability/node-reliability/budget-proof.txt`.

## Moved from CLAUDE.md (2026-10-12)

These sentences were cut from the root `CLAUDE.md` because they belong here. The wording is the owner's, unchanged; the id is the sentence's place in `CLAUDE.md` at `87afbdd55`. The map is `public/framework/ai/sessions/2026/10/12/session-3b391f22/claude-md-consolidate/manifest.md`.

<!-- claude-md:L28 -->
**Audits go to Haiku** — L28.1

**Audits go to Haiku** (the owner, 2026-10-08): under ~100k tokens a Haiku 5.5 task costs about 1/20th of Sonnet 5.5 (the owner's figure; verify when pricing is confirmed).

<!-- claude-md:L42 -->
**Haiku stays under 100k tokens** — L42.1

**Haiku stays under 100k tokens** (the owner, 2026-10-08): Claude Haiku 5.5 is by far the cheapest model, but a request over 100,000 tokens costs about 5x per token, so every Haiku job stays well under it (aim for 30–60k; never drift over by accident).
