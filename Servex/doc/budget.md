# Budgets

A task's budget is a limit Servex keeps, not a wish in a brief. `Servex/Budget.js` runs on
every heartbeat tick, for every open task.

- **Its cost** is `cost_usd` on the task's assign lines (`Server/task-cost.mjs` writes it: the
  mastermind's share plus every minion it spawned).
- **Its budget** is `budget_usd` on an assign line; else a line in its `requirements.md` that starts
  `Budget: $N`; else $15 for a task mastermind and $5 for a minion.

## The three rules

1. **At 100%** the task's mastermind and the agent above it are each told once. From then on,
   a new spawn under that mastermind (its minions, their minions) is **refused** with the
   reason, never queued. A revive (a resume) is never refused, so the mastermind can land.
2. **At 150%** its minions are stopped (never the mastermind) and card `live` hears.
3. **Each step is logged once** in the task's own `task.jsonl` as `{"log":{"budget":"reached"|"over",…}}`.

## Raising a budget

Append an assign line with a new `budget_usd` and a reason in a `log` line. The refusal lifts on
the next tick, and the 100% and 150% steps start over for the new figure.

`SERVEX_NO_BUDGET=1` turns it off. Proof: `public/framework/ai/2026-09-29/node-reliability/budget-proof.txt`.

## Moved from CLAUDE.md (2026-10-12)

These sentences were cut from the root `CLAUDE.md` because they belong here. The wording is the owner's, unchanged; the id is the sentence's place in `CLAUDE.md` at `87afbdd55`. The map is `public/framework/ai/2026-10-12/claude-md-consolidate/manifest.md`.

<!-- claude-md:L28 -->
**Audits go to Haiku** — L28.1

**Audits go to Haiku** (the owner, 2026-10-08): under ~100k tokens a Haiku 5.5 task costs about 1/20th of Sonnet 5.5 (the owner's figure; verify when pricing is confirmed).

<!-- claude-md:L42 -->
**Haiku stays under 100k tokens** — L42.1

**Haiku stays under 100k tokens** (the owner, 2026-10-08): Claude Haiku 5.5 is by far the cheapest model, but a request over 100,000 tokens costs about 5x per token, so every Haiku job stays well under it (aim for 30–60k; never drift over by accident).
