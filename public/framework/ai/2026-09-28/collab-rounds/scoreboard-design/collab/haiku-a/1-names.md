# Scoreboard Class Design

## Overview

The `Scoreboard` class reads `public/framework/ai/collab/scoreboard.jsonl`, an append-only log of one score line per member per decision. It aggregates this data to answer: which models are worth their cost, and which should be retired? The owner can see vote breakdowns per decision, count how many times they disagreed with the votes, and automatically identify underperforming, expensive models.

The class extends `JSONL` (like `Collab` and `Collab.Decisions` already do) because the file is append-only and the class's job is to fold rows into per-model totals. Everything is computed from the raw rows on demand — a page that reloads the file always shows current truth.

## Class: `Scoreboard`

Extends `JSONL`. Holds score entries and computes per-model performance statistics.

### Properties

- **`rows`** — Array of all score entries from the jsonl. Each is one member's outcome on one decision. This is the only state; everything else is computed from it.

### Methods

- **`apply(entry)`** — Process one entry from the jsonl stream (called by JSONL.load/live). Expects `{"score": {...}}`. Pushes the score onto `rows`. Anything else goes to `this.skip(verb, entry)` (standard JSONL pattern).

- **`models()`** — Return array of aggregated per-model stats, one object per unique model found in rows. Each object has: `model` (id), `decisions` (count of rows), `wins` (count where `won === true`), `votes` (sum), `cost` (sum), `win_rate` (wins/decisions, 0 if no decisions), `cost_per_decision` (cost/decisions), `cost_per_win` (cost/wins, null if no wins). This is the one call a scoreboard page makes to draw its whole table.

- **`retire(opts = {})`** — Return array of model ids that meet the retirement threshold. Options with defaults: `minDecisions = 5`, `maxWinRate = 0.15`. A model is retired if it has at least `minDecisions` rows AND win_rate below `maxWinRate` AND cost_per_decision above the median of all models that cleared `minDecisions`. Returns ids so the runner can filter them from future collab member lists. Implements the owner's rule: models that never win AND are more expensive than average should be phased out.

- **`countOverrules(modelId)`** — Return count of times the owner overruled a vote for this model. Counts rows where `overrule === true`. The owner asked to "see the decisions and disagree with the way things were voted on" — this method surfaces when they actually did disagree.

- **`forDecision(decisionId)`** — Return array of all score rows for one decision (one per model), showing each model's outcome, votes, cost, and whether the owner overruled. Lets the owner drill into a decision to see how the vote broke down and where they disagreed.

## Static Subclass: `Scoreboard.Row`

Plain data holder for one score entry from the jsonl.

### Properties

- `at` — ISO timestamp when the score was recorded
- `collab` — Task directory path relative to `ai/`
- `decision` — Decision id (e.g., "d-1")
- `member` — Member id (e.g., "haiku-a")
- `model` — Model id (e.g., "claude-haiku-4-5-20251001")
- `votes` — Number of votes this member received
- `won` — Boolean; true if this member won the decision
- `cost` — Cost of this member's work on this decision
- `overrule` — Boolean (optional); true if the owner picked a different winner than the votes decided

### Methods

- **`constructor(...args)`** — Accept args and assign via `assign()`.
- **`assign(...args)`** — Merge multiple objects into this row.

## Static Subclass: `Scoreboard.Model`

Plain data holder for aggregated per-model statistics, returned by `models()`.

### Properties

- `model` — Model id
- `decisions` — Count of decisions this model participated in
- `wins` — Count of decisions this model won
- `votes` — Sum of all votes this model received
- `cost` — Sum of all costs for this model
- `win_rate` — Calculated: wins / decisions (0 if no decisions)
- `cost_per_decision` — Calculated: cost / decisions (0 if no decisions)
- `cost_per_win` — Calculated: cost / wins (null if no wins, so a page can print "—")

### Methods

- **`constructor(...args)`** — Accept args and assign via `assign()`.
- **`assign(...args)`** — Merge multiple objects into this model.
