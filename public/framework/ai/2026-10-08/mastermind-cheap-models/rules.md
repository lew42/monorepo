# Cheap-model routing — what the data supports so far

One screen. Full detail (scripts, logs, decision record) is linked at the bottom.

## 1. Model routing: not enough clean data yet — the harness itself needs a fix first

**Evidence count: 3 completed runs, 0 trustworthy.** Every known-answer run that actually finished
came back with `recall: 0, precision: 0` and a response-capture bug (`raw_words: null`, a JSON
parse error on an empty string) — including the **Sonnet control** on the `structure` question, a
two-row boolean filter a human solves in five seconds. That is not Sonnet failing; that is
`known-answer.mjs`'s own `waited?.words` field coming back empty for a `role:"task-mastermind"`
spawn. **Rule, pending a fix:** don't trust a known-answer score from this harness until the
capture bug is found (`Servex/ext/openrouter/evals/known-answer.mjs`, `runOne()`'s `waited?.words`
read) — re-run against `role:"minion"` once the pool issue below clears, which is the path that
should return a normal turn shape.

**What the proving ground DID surface, which is itself useful:**
- `orphans()` (the 5th question I added to `facts.mjs`, built on `structure()`'s regex `children:`
  parser) **misfired on its own test fixture**: it matched a long prose comment containing the
  word "children:" as a real declared-children list, polluting the truth set. Dropped from this
  run. `structure()`'s children-parser is a known "good enough, not a parser" shortcut
  (its own comment says so) — this is the first time it visibly broke something downstream.
- Six real spawns (5 proving-ground questions + 1 ask-audit judging batch, all `role:"minion"` in
  the main tree) sat **queued 15+ minutes**, reason `"waits for a pool worktree"`, while
  `system_health` showed worktrees sitting in state `"pool"` (meant to be recyclable) the whole
  time. Matches the open ask "Servex: worktree pool stuck" — see the Note card linked below.
- `role:"task-mastermind"` spawns (the escape hatch `library.mjs`'s own comment suggests for
  exactly this pool problem) hit a SECOND bug: an agent id over ~80 characters sometimes gets
  refused with `"Bad log name"` — the *same* id format succeeded moments later on a different
  question. Intermittent, not a length floor; a race in Servex's own log-name validator, not mine
  to fix at this task's budget.

**Next to test, once the pool/capture bugs are out of the way:** the original 5 questions
(naming, comments/least_commented, structure, orphans on a dir where it isn't fooled) on
`role:"minion"`, Haiku vs. Sonnet, properly scored.

## 2. The ask → delivered audit (owner add-on, done this task)

Extended [2026-10-07/prompt-audit](/framework/ai/2026-10-07/prompt-audit/) (which only read
`asks.jsonl`) to the raw Claude Code session history. Map: [doc/log-sources.md](/framework/ai/doc/log-sources.md).
Pipeline, script and numbers: [ask-ledger/readme.md](ask-ledger/readme.md) — short version: 6.5 GB
/ 6,654 files scanned in 37s, filtered to 1,650 real candidate owner turns (two rounds of noise-
filter fixes needed — task-notification pings and pasted-image metadata looked like real turns at
first), 1,483 unmatched against `asks.jsonl` + git log by script alone. A 12-item Haiku pilot batch
is queued (same pool problem above) to measure whether Haiku is worth pointing at the rest — not
yet landed at the time of this report.

## 3. The pace-admission decision (owner add-on, done this task)

**Decision recorded** (`decide.mjs`, on this task's own page — see "Decisions" below): dollar-pace
calibration over percent-only, confidence 0.6. The dollar/percent rate itself: **$124/point**, from
the ONE usage window (2026-09-25 → 2026-10-05) with enough overlapping spend data to trust; two
other windows had too little overlap and were discarded rather than averaged in blind. Script:
[pace.mjs](pace.mjs) (`node pace.mjs`, `node pace.mjs --admit <usd>`). Caveat carried forward
honestly: [token-accounting/findings.md](/framework/ai/2026-10-07/token-accounting/findings.md)
found a real case-sensitivity bug in `find_transcript()` that undercounted worktree-run spend
until 2026-10-07 — the $ totals this rate is built on may still be revised. The owner's own
$85/point ballpark used a plain date range, not the actual reset-detected window boundary;
the discrepancy ($85 vs $124) is exactly that difference, not a disagreement about the data.

**What's built vs. proposed, per the owner's own instruction to start small:** `pace.mjs` computes
the rate and an `admit(expected_cost_usd)` function (expected %, elapsed-share allowance, margin).
**Not wired into Servex's Dispatcher queue / `pause_dispatch`/`resume_dispatch`, and not yet shown
on the AI board** — that is live, shared scheduling code; a single low-effort pass is the wrong
place to edit it blind. Named here as the next step for whoever owns Servex/Dispatcher.js next.

## 4. Spawn-decision log

Every spawn above is in [spawns.jsonl](spawns.jsonl); [decisions.mjs](decisions.mjs) reads it
(`node decisions.mjs`). Right now every row's `outcome` is still empty — none of the six spawns
finished before this report (see §1's pool problem) — so the pass-rate table is empty by design,
not broken. A follow-up `record-outcome.mjs` (not built this pass) should watch `spawns.jsonl` and
fill `actual_cost_usd`/`outcome` once each agent lands, per the requirements' own deliverable 1.

## Decisions on this page

- `d-how-should-the-mastermind-decide` (pace admission) — decided, dollar-pace-calibrate, 0.6.
