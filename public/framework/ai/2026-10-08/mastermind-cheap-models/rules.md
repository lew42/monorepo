# Cheap-model routing — what the data supports so far

## 1. Model routing: 0 trustworthy runs yet — a harness bug first

- 3 known-answer runs completed. All three scored `recall: 0, precision: 0` — **including the
  Sonnet control**, on a two-row boolean filter a human solves in five seconds.
- Cause: `known-answer.mjs`'s `waited?.words` came back empty for a `role:"task-mastermind"`
  spawn (`raw_words: null`, a JSON parse error on `""`). Not a model failure — a capture bug.
- **Rule, pending the fix:** don't trust a known-answer score from this harness yet. Re-run on
  `role:"minion"` once the pool issue below clears.

**Other findings from this run:**
- `orphans()` (the question I added, built on `structure()`'s regex `children:` parser)
  misfired on its own test fixture — it matched a prose comment as a real child list. Dropped.
- 6 real spawns sat **queued 15+ minutes**, `"waits for a pool worktree"`, while worktrees sat
  in state `"pool"` the whole time — same symptom as the open ask "worktree pool stuck".
- `role:"task-mastermind"` (the pool-bypass library.mjs itself suggests) intermittently refused
  with `"Bad log name"` on long agent ids — the same id format worked moments later elsewhere.

**Next:** the 5 questions, Haiku vs. Sonnet, properly scored, once the pool/capture bugs clear.

## 2. Ask → delivered audit (owner add-on)

Extended [2026-10-07/prompt-audit](/framework/ai/2026-10-07/prompt-audit/) to the raw session
history. Map: [doc/log-sources.md](/framework/ai/doc/log-sources.md). Pipeline + numbers:
[ask-ledger/readme.md](ask-ledger/readme.md).

- 6.5 GB / 6,654 files scanned in 37s → 1,650 real candidates after two rounds of noise filtering.
- 1,483 unmatched against `asks.jsonl` + git log (script only, no model call).
- A 12-item Haiku judging pilot is queued (same pool stall) to measure Haiku's accuracy on the
  rest — not landed at report time.

## 3. Pace-admission decision (owner add-on)

**Decided** (`decide.mjs`): dollar-pace calibration over percent-only, confidence 0.6 — see
"Decisions" below. Rate: **$124/point**, from the one usage window with enough overlapping spend
data to trust (two others were discarded, not averaged in blind). Script: [pace.mjs](pace.mjs).

- The owner's own $85/point ballpark used a plain date range; mine uses the actual reset-detected
  window. Same data, different boundary — not a disagreement.
- [token-accounting/findings.md](/framework/ai/2026-10-07/token-accounting/findings.md) found a
  real undercount bug in the $ totals this rate rests on — may still be revised.
- Built: the rate + `admit(expected_cost_usd)`. **Not built:** wiring into Servex's Dispatcher
  queue or the AI board line — live shared scheduling code, named as the next owner, not edited
  blind in one low-effort pass.

## 4. Spawn-decision log

[spawns.jsonl](spawns.jsonl) + [decisions.mjs](decisions.mjs) (`node decisions.mjs`). Every row's
`outcome` is still empty — none of the six spawns above finished before this report (§1's pool
stall) — so the pass-rate table is empty by design. A `record-outcome.mjs` to fill it in once
each agent lands is the next piece, not built this pass.

## Decisions on this page

- `d-how-should-the-mastermind-decide` (pace admission) — decided, dollar-pace-calibrate, 0.6.
