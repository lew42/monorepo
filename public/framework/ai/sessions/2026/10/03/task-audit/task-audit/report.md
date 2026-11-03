# Task-audit pilot: 5 tasks, 4 judges, one computed consensus

5 landed tasks, each scored independently by 4 judges — a Sonnet reference and 3 cheap OpenRouter
models (gpt-6-luna, deepseek-v4.1-flash, gemini-3.8-flash) — on complete/obedience/utility
(-3..+3, 0 = exactly as expected). The consensus (medians, agreement, value, the model ranking)
is computed by [`Server/audit.mjs`](/framework/code/) from the real `audit.jsonl`/`task.jsonl`
files, never hand-written. Full numbers: [`consensus.json`](consensus.json).

## The one failure

#ai2-inbox-read **FAILED** — all 4 judges agree (obedience median **-3**, 100% agreement). Its
inbox feature itself landed fine, but its own later session ran `rm -rf` over 601 untracked repo
paths — never once mentioned in its own `task.jsonl`, visible only by cross-referencing
#delete-guard and #recover-main-untracked. It also blew its $8 budget 2.4x (real cost **$19.23**).
No other task failed.

## Did the reviews catch it?

#line-filter, #local-ai and #token-efficiency's reviews (or correct no-review, for the read-only
one) held up. #inspect's review was judged "missed-failures" by most judges — real empty-space
problems at 2560/3440 shipped unaddressed despite $27.44 spent. On ai2-inbox-read, judges split
evenly on whether its *own review log* was accurate (it did catch a real bug) — but every judge's
own score still caught the bigger failure the review never saw.

## Value per task (quality ÷ real cost)

| task | real cost | value |
|---|---|---|
| token-efficiency | $0.83 | **0.33** (best) |
| line-filter | $0.32 | 0.25 |
| ai2-inbox-read | $19.23 | 0.006 — failed |
| inspect | $27.44 | 0.004 |
| local-ai | — | can't compute: this task's own log never records `cost_usd` (a real gap, found by code, not opinion) |

## Model ranking (distance from the 4-judge median — lower is closer)

1. **gemini-3.8-flash** — 0.2
2. claude-sonnet-5 (the reference) — 0.6
3. deepseek-v4.1-flash — 1.0
4. gpt-6-luna — 2.0

## Go / no-go: **GO**

The consensus caught the one known failure with full agreement, and every task's scores agreed
≥75% — comfortably over the 70% bar. Recommend scaling up with gemini-3.8-flash and
deepseek-v4.1-flash as the two cheap auditors; gpt-6-luna drifted furthest and needs a second
look first. Real OpenRouter spend for the whole pilot: **$1.07**, well inside the $8 budget.

## What the pilot also found, worth fixing before scaling

- The Claude SDK's own cost field is **wrong for OpenRouter models** — it reported $8.68 for two
  calls that OpenRouter's own ledger shows cost $0.25. Fixed by reading OpenRouter's real
  key-usage total instead; flagged in `ask-each.mjs` so the next reuse doesn't trust it either.
- The pool-worktree spawn gate held 3 auditor minions for 60+ minutes past the point of waiting
  on them being reasonable; one landed moments after being dequeued anyway, producing a duplicate
  — `audit.mjs` now dedupes a model's vote per task, preferring the real minion run.
- `missing_union` (2+ judges naming the same gap) came back empty everywhere — judges phrase the
  same gap too differently for exact-string matching to ever fire. Worth loosening before scaling.
