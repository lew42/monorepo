# research-round-6 — the synthesis round

## The ask, verbatim

TASK — round 6 of `/imagine/research/` is the SYNTHESIS round. The owner's original ask
included: "document major theories, summarize conclusions and implications, aggregate
findings — maybe we discover a new theory." Five rounds and 358 credence-disciplined
entries exist across stone/depictions/disclosure/theories (+ capstone with rounds 4-5
addenda). Your job:

1. **Read the corpus** — all four logs' entries (summaries + credences; skim bodies where a
   summary is thin) and the capstone.
2. **Aggregate across topics** — the cross-topic patterns no single-topic round could see.
   The capstone already holds two ("cheap-permitted-unperformed", narrowed in round 4; the
   two-part recency test from round 4). Find what ELSE recurs: source-decay shapes, where
   credences cluster and why, which claim-types survived five rounds vs died, what the
   program's own corrections (audit, repairs, round-5 misattribution fix) say about how
   these literatures form.
3. **Propose ONE new falsifiable hypothesis** — original to this corpus (not a known theory
   restated), labeled `speculation` in the log, stated so a specific finding could kill it,
   with the 2-3 corpus entries that motivated it AND the strongest counter-entry named. If
   the honest result is "the corpus supports no new hypothesis," say that — it is a
   first-class result.
4. **Ship it readable** — a new synthesis section or page under `/imagine/research/` (your
   call where it fits the existing shape best; linked from where a reader already is), ~2
   screens max, credence-labeled throughout, closing with what round 7 should dig to test
   the hypothesis. Any new log entries go through
   `node public/framework/ext/Research/entry.mjs` (url discipline: only cite urls you
   verified).

VERIFY: --check clean on touched logs, pages render on the private port (torn down), zero
console errors. Report: the cross-topic patterns found (one line each), the hypothesis (or
the honest refusal), where it shipped, what round 7 tests.

## Fences

- Hard rules from the caller: never kill/restart the :80 dev server (use a private
  `PORT=8097` node server for render checks, torn down after); never stash; never commit;
  search with Glob/rg scoped to the repo.
- **Files owned by this task:** `public/imagine/research/theories/log.jsonl` (append only),
  `public/imagine/research/theories/patterns/page.js` (new),
  `public/imagine/research/theories/page.js` (children + index line),
  `public/imagine/research/theories/synthesis/page.js` (one pointer line).
- **Not touched:** the stone / depictions / disclosure dirs. Cross-topic findings are
  program-level and belong in `theories/log.jsonl`, beside the other program-level entries
  (the round-4 questions, the audit results).
- Scratch goes in the session scratchpad, named `round6-*`.
