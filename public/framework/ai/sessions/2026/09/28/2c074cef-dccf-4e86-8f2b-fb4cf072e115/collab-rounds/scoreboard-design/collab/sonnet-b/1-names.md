# Scoreboard — names (sonnet-b)

## What it reads

One file: `public/framework/ai/collab/scoreboard.jsonl`. Every line is one `score`
verb, one per member per decision (shape is fixed by collab-format.md and already
appended by the runner):

```json
{"score": {"at": "…", "collab": "…", "decision": "d-1", "member": "haiku-a",
  "model": "claude-haiku-4-5-20251001", "votes": 1, "won": false, "cost": 0.012,
  "overrule": false}}
```

An owner overrule appends two more `score` lines for that same decision — one for
the owner's pick (`overrule: true, won: true`) and one for the vote's own winner
(`overrule: true, won: false`) — so `overrule: true` rows are never the only rows
for a decision; they sit alongside the normal ones.

## Class: `Scoreboard`

It extends `JSONL` (same base every other reader in this codebase uses — `Collab`,
`Collab.Decisions`), because `scoreboard.jsonl` is append-only and the class's job
is to fold rows into per-model totals. It groups by `model`, not by `member` id,
because the owner's question is "is this MODEL worth its cost", and one model runs
under several member ids across different collabs.

### Properties

- `rows` — every `score` line read so far, kept in the raw shape they arrived in
  (`{collab, decision, member, model, votes, won, cost, overrule}`). This is the
  only state; everything else below is computed from it on demand, so a page that
  reloads the file always shows the current truth instead of a stale total.

### Methods

- `apply(entry)` — the `JSONL` hook. Pushes `entry.score` onto `rows`; anything
  that isn't a `score` line goes to `this.skip(verb, entry)`, the same convention
  `Collab.apply()` and `Collab.Decisions.named()` already use, so an unrelated
  verb accidentally appended to this file is reported instead of silently eaten.

- `models()` — no arguments. Returns one object per model, each with:
  `model`, `decisions` (rows entered), `wins`, `win_rate` (`wins / decisions`),
  `votes` (summed), `cost` (summed), `cost_per_decision`, `cost_per_win` (`null`
  when `wins` is 0, so a page can print "—" instead of `Infinity`), and
  `overrules` (count of this model's own rows where `overrule` is true — see
  `overruleCount()` below for why that count lives on the row already).
  This is the one method the scoreboard page calls to draw its whole table.

- `model(id)` — one model's own object from `models()`, or `undefined`. A
  convenience for a page that already knows which model it wants (e.g. a
  member's own card showing just its model's line) instead of filtering the
  whole array itself.

- `overruleCount(model)` — the number of times the owner clicked a different
  option than the vote picked, for one model (or, called with no argument,
  across every model — the number the owner asked to "see the decisions and
  disagree with the way things were voted on"). Counts rows where
  `overrule === true`. A model with an overrule against it is not automatically
  penalized in `win_rate` — the row `won: false` for that model already reduces
  it — this method exists purely so a page can show "the owner overruled this
  N times" as its own separate fact, since a low win rate and a high overrule
  count are different complaints (one is the panel disagreeing with a model,
  the other is the owner disagreeing with the panel).

- `retire(opts = {})` — the automatic phase-out rule the owner asked for
  ("if one model never gets any votes and doesn't seem to be performing,
  especially if it's more expensive, we phase that one out — maybe
  automatically"). Arguments, all optional with defaults matching
  collab-format.md's own numbers so the runner and a page agree without
  restating them: `{minDecisions = 5, maxWinRate = 0.15}`. Returns an array of
  model ids: every model with at least `minDecisions` rows, a `win_rate` under
  `maxWinRate`, AND a `cost_per_decision` above the median across all models
  that cleared `minDecisions` (the "especially if it's more expensive" half of
  the owner's sentence — a cheap model that just doesn't win is a smaller
  problem than an expensive one that doesn't win, so both conditions must hold
  before this method calls it out). Returning ids rather than full objects
  keeps this the one thing a runner needs to check a model id against before
  including it in a new collab's members list.

- `explain(model)` — one plain sentence for a given model id, built from
  `models()` and `overruleCount()`, e.g. "haiku-a: 3 decisions, 0 wins (0%),
  overruled once, $0.04 total — recommend retiring: no wins yet and costlier
  than the panel median." This is the thing a person actually reads instead of
  a table of numbers — the owner's presentation rule (a report is plain
  sentences, not a table he has to interpret himself) applies to a scoreboard
  page exactly as much as to a written report, so the class itself produces
  the sentence rather than leaving every page to reinvent the same wording.
