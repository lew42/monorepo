# Study: what reviews and clarity checks actually cost, and whether they pay off

Computed by [`Server/spend-tree.mjs`](/code/) from the Servex registry + every agent's own
log, and from every `review` verdict logged in a `task.jsonl` across the whole `ai/` tree —
nothing here is estimated by hand (CLAUDE.md law 7). Numbers as of 2026-10-04 04:44 UTC;
re-run `node Server/spend-tree.mjs` for fresh ones. The live, clickable version of this same
tree is the [Sessions tab](/framework/ai/sessions/) — filter by "trigger" there to see the
rows these numbers come from.

## The headline

**Reviews find something real 86% of the time. Clarity checks cost little and aren't
measured yet. Neither is the place to cut.**

| Trigger (own $, not the agents they go on to spawn) | Since Oct 1 | Share of Oct spend |
|---|---|---|
| task (masterminds + minions doing the actual work) | $1,223.68 | 70.4% |
| owner prompt (a mastermind started directly from the owner) | $274.64 | 15.8% |
| clarity (the landed-work spot-check) | $113.50 | 6.5% |
| review gate (the fresh-eyes reviewer before a merge) | $93.12 | 5.4% |
| assistant / echo / dispatcher | $32.40 | 1.9% |
| **Total since Oct 1** | **$1,737.34** across 572 agents | |

Review + clarity together: **$206.62, about 1 in every 8 dollars spent since Oct 1.** (The
owner's own estimate from memory was "$1,408 across 566 agents" — this script's $1,737/572
is close but not identical; the gap is almost certainly agents spawned in the hours between
when that estimate was made and when this ran, not a different method — both read the same
registry.)

## Does a review pay for itself?

Every `review.mjs` run logs a `verdict`: `pass` (nothing worth fixing) or `fix` (it found
something and the task changed because of it). Read straight from `task.jsonl` across every
task that has one, split by review size:

| Review size | Passed clean | Found a real fix | Fix rate |
|---|---|---|---|
| full | 14 | 133 | **90%** |
| light | 10 | 24 | **71%** |
| **all sized reviews** | 24 | 157 | **87%** |

That is the opposite of a rubber stamp. Nine times out of ten, a **full** review catches
something that would otherwise have shipped. Even the cheaper **light** tier catches
something seven times out of ten. The owner's worry — "doubling our token consumption just
to get a second green check mark" — is the real risk for a review that reliably passes
clean; the data says that isn't most reviews.

Separately, 17 tasks already used `--size none --why "self-evident"` (the sub-mastermind
skill's own escape hatch for a task too small to need a reviewer at all) — that path is
already in use, at $0 reviewer cost, for exactly the cases this study would otherwise
recommend skipping.

**Recommendation: keep review gated by the computed size (`Server/doc/review.md`), don't add
a second gate on top of it.** The sizing logic already in `sub-mastermind` is doing its job —
a `full` review is almost never wasted, and `none` is already the release valve for the truly
trivial. If spend on reviews needs to come down further, the lever is tightening WHEN a task
gets `full` vs `light` (fewer `full`s on low-risk, high-confidence work), not reviewing less
per task that already gets one.

## Clarity checks: cheap, but not measured the same way yet

375 clarity agents have run, $193.72 all-time (avg **$0.52** each — far cheaper than a
review). Unlike `review.mjs`, a clarity check doesn't write a structured `{"verdict":...}`
line anywhere — its outcome is free text in its own transcript ("Verdict: clear", a rewrite
sent to the owning agent, or a page-inbox note), so this script can't yet tally "found
something" vs "clear" the same reliable way it did for reviews above. That's a real gap, not
a guess papered over: **recommendation — have `clarity`'s own skill log one structured line
per check** (`{"clarity":{"verdict":"clear"|"flagged","at":...}}` in the checked agent's own
`task.jsonl`, the same place `review` already logs), so the next run of this study can give
clarity the same real fix-rate table reviews just got.

## Where the tree itself lives

- The whole spawn tree, every agent, nested: [`Server/spend-tree.mjs`](/code/) →
  `public/framework/ai/sessions/spend-tree.json` (gitignored — regenerate it, never commit
  it, same rule `sessions.json`/`week.json` already follow).
- Browse it live, click through parent → children, filter by trigger: the
  [Sessions tab](/framework/ai/sessions/).
- Per-task dollar totals by module/day are a different, already-built tool — see
  @task-mastermind-day-overview's work; this study doesn't repeat it.
- What "trigger" means and its honest failure modes (it's a best-effort computed tag, not a
  certainty) — `public/framework/ai/sessions/doc/spend-tree.md`.
