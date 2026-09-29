# Scoreboard Class Design

## Overview

`Collab.Scoreboard` reads the shared model performance log (`public/framework/ai/collab/scoreboard.jsonl`) and surfaces per-model statistics, retirement guidance, and owner decision override history. It extends `JSONL`, applying each `score` line to build a table of model outcomes across collaboration decisions.

## Class: `Scoreboard`

Extends `JSONL`. Holds and queries the shared scoreboard log, one `score` line per member per decision. A score entry names a model's performance on one decision: how many votes it received, whether it won, and the cost. Same `decision` id may appear in multiple collabs; rows are keyed by `collab` + `decision` + `member` to keep them distinct.

### Properties

- `rows` — array of Score objects, one per line in the JSONL; keyed lookup by `decision(id)`, `model(name)`, and `overrules()` filter.
- `_model_cache` — memoized Map of model names to Model objects (the output of `models()`).

### Methods

#### Instance Methods

- **`apply(entry)`** — processes one JSONL line; if it holds a `score` verb, adds or updates a row (keyed by `collab + decision + member`). Returns `this`.

- **`models()`** — returns an array of Model objects, one per unique model name found in rows. Each Model holds: `model` (name), `decisions` (count), `wins` (count), `votes` (sum), `cost` (sum), `win_rate` (wins / decisions), `cost_per_win` (cost / wins, null if no wins), `cost_per_decision` (cost / decisions). Models are sorted by cost_per_decision ascending.

- **`retire()`** — returns array of model names to retire: models with 5+ decisions, win_rate < 15%, and cost_per_decision > median cost_per_decision (among models with 5+ decisions). Empty if no model meets all three criteria.

- **`overrules()`** — returns an array of Overrule objects, one per row with `overrule: true`. Each Overrule holds: `model`, `decision`, `collab`, `member`, `votes_before`, `chosen_by_votes`, `chosen_by_owner` (the winner after override), `cost`.

- **`decision_details(id)`** — returns an object summarizing all scores for one decision: `{ decision_id, scores: [Score...], models_entered: [...], winner_by_votes, votes_per_model: {model: count} }`. Returns `null` if no rows match.

- **`model_history(name)`** — returns array of Score objects for one model name (all rows where `model === name`), sorted by decision id ascending.

- **`cost_per_decision_median(min_decisions = 5)`** — returns the median cost_per_decision among models that have at least `min_decisions` rows. Used by `retire()` and exposed for reporting.

#### Static Methods

- **`verbs`** — `["score"]` — the single verb this class handles.

## Subclass: `Scoreboard.Score`

Represents one row in the scoreboard JSONL. Plain properties, no methods. Created by `apply()`.

### Properties

- `at` — timestamp string (ISO 8601).
- `collab` — task directory path relative to `ai/` (e.g., `"2026-09-28/collab-rounds/scoreboard-design"`).
- `decision` — decision id (e.g., `"d-1"`).
- `member` — member id (e.g., `"haiku-c"`).
- `model` — model name (e.g., `"claude-haiku-4-5-20251001"`).
- `votes` — votes cast for this member's option in this decision (number).
- `won` — whether this member's option won (boolean).
- `cost` — token/API cost of this member's work (number).
- `overrule` — true if the owner overrode the vote to pick this option (boolean, optional, defaults to false).

## Subclass: `Scoreboard.Model`

Represents one model's aggregated stats across all decisions it participated in. Plain properties, no methods. Created by `models()`.

### Properties

- `model` — model name (string).
- `decisions` — count of decisions this model entered (number).
- `wins` — count of decisions this model won (number).
- `votes` — sum of votes across all its entries (number).
- `cost` — sum of cost across all its entries (number).
- `win_rate` — `wins / decisions` (0 to 1, or 0 if decisions === 0).
- `cost_per_win` — `cost / wins`, or null if wins === 0.
- `cost_per_decision` — `cost / decisions` (always a number, 0 if decisions === 0).

## Subclass: `Scoreboard.Overrule`

Represents one owner decision override. Plain properties, no methods. Created by `overrules()`.

### Properties

- `model` — model name (string).
- `decision` — decision id (string).
- `collab` — task directory path (string).
- `member` — member id (string).
- `votes_before` — vote count before the override (number).
- `chosen_by_votes` — model id that won the vote (string).
- `chosen_by_owner` — model id the owner actually picked (string).
- `cost` — token/API cost of this member's work (number).

## Constructor

```javascript
new Scoreboard({ url: "<path to scoreboard.jsonl>" })
```

Assign-based: accepts an object with properties to assign to the instance. Must include `url` to enable `load()`.

## House Style

- Plain ES classes: no inheritance except `JSONL` base.
- Assign-based constructors: `constructor(...args) { this.assign(...args); }`.
- Small methods: each method does one focused thing.
- Static subclasses: `Scoreboard.Score`, `Scoreboard.Model`, `Scoreboard.Overrule`.
- No getters/setters; properties are public and directly readable.
- Memoization via `_model_cache` to avoid re-computing `models()` on every call (a design choice, not required).
