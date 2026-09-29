# Design Summary — haiku-a

## Proposal: Scoreboard Class Signature

I've designed a minimal, focused API that answers all the owner's requirements without over-building.

### Class Structure

**Main class: `Scoreboard`** extends JSONL
- Reads `public/framework/ai/collab/scoreboard.jsonl`
- One `rows` property holds the raw score entries
- Everything else is computed on demand (pages always see current truth)

**Two static subclasses:**
- `Scoreboard.Row` — data holder for one score line from the jsonl
- `Scoreboard.Model` — aggregated per-model statistics

### Methods (5 core + 1 for data access)

1. **`apply(entry)`** — JSONL hook. Pushes `entry.score` onto rows. Standard pattern.

2. **`models()`** — The main aggregation: returns per-model stats array with `model`, `decisions`, `wins`, `votes`, `cost`, `win_rate`, `cost_per_decision`, `cost_per_win`. This is what a scoreboard page calls to draw its table.

3. **`retire(opts)`** — Implements the owner's rule: returns model ids to phase out. Criteria: 5+ decisions, <15% win rate, AND cost above median. The "and especially if expensive" part is key — both conditions must hold.

4. **`countOverrules(modelId)`** — Count times the owner disagreed with votes (rows where `overrule === true`). Surfaces the owner's complaint: "I can see the decisions and disagree with the way things were voted on."

5. **`forDecision(decisionId)`** — Return all rows for one decision. Lets the owner drill into any decision to see the full vote breakdown and any overrules.

### Design Choices

- **Minimal, clear API**: Only methods the scoreboard page actually needs to call. No exploratory utilities that a page *might* want.
- **Extend JSONL**: Matches the existing pattern (`Collab`, `Collab.Decisions`). The file is append-only; the class folds rows into summaries.
- **Computed on demand**: Pages always see current data without stale caches.
- **House style**: Plain ES classes, assign-based constructors for subclasses, small focused methods.
- **Two data holders**: `Row` and `Model` are thin containers, never hold logic.

### What the owner gets

1. **Decisions entered, wins, win rate, votes, cost, cost per win** — all on each model via `models()`
2. **Way to pick models to retire** — `retire()` with explicit criteria
3. **Count owner's overrules** — `countOverrules(modelId)` for one model or implicit in rows for all
4. **See vote breakdowns** — `forDecision(decisionId)` for any decision
5. **Disagree with votes** — `overrule` flag in `Row` data, countable via `countOverrules()`

All of these are already in the row data; this design just provides the methods to surface them clearly.
