# Ask → delivered audit (extends 2026-10-07/prompt-audit)

**What this is:** [2026-10-07/prompt-audit](/framework/ai/2026-10-07/prompt-audit/) only ever
read `asks.jsonl` (259 rows, curated). This folder extends that pass to the full Claude Code
session history — the raw transcripts, which are ground truth for what the owner actually said
(see [doc/logs/log-sources.md](/framework/ai/doc/logs/log-sources.md) for why, and the limits).

## The pipeline (compute first, model only on the leftovers)

1. **`extract-and-match.mjs extract`** — walks `~/.claude/projects/**` (26 non-worktree session
   directories, 6,654 files, 6.5 GB), pulls out turns that look like the owner actually typed
   them, drops exact duplicates and anything outside a 5-150 word "one request" window. First
   pass: 16,051 raw candidates. After filtering: **1,650** (two rounds of filter fixes — the first
   pass still let through task-notification pings, Stop-hook nags and pasted-image metadata lines
   that structurally look like a "user" turn but are not the owner's words; see the script's own
   comments for the exact patterns found and blocked).
2. **`extract-and-match.mjs match`** — plain word-overlap (Jaccard) against every `asks.jsonl`
   title and every git commit subject since 2026-08-01. No model call. Result on the full history:

   | delivered (status=landed) | likely delivered (git match only) | in-flight (queued/building/stalled) | unmatched |
   |---|---|---|---|
   | 0 of this run's threshold | 76 | 8 | **1,483** |

   (`0` landed matches at the 0.2 Jaccard threshold is itself a finding — see rules.md: the
   matcher is too literal, a paraphrase scores near 0 even when the ask clearly landed. The git
   match (commit subjects) catches far more than the asks.jsonl match, because commit messages use
   plainer language than ask titles do.)
3. **A Haiku judging pilot** (`ask-judge-batch1`, 12 items sampled evenly across the 1,483
   unmatched, scored against the 47 titles with a `status`) — the FULL 1,483-item shortlist was
   never going to be judged this task's budget (even at Haiku prices, that's ~150 batches); this
   pilot exists to answer "is Haiku worth pointing at the rest of it", per the mastermind brief's
   own instruction to measure that, not to clear the backlog in one pass.

## What this means, honestly

Most of the 1,483 "unmatched" items are **not failed asks** — they're the owner thinking out
loud, status remarks, clarifying questions, a test quote, or an agent's own diagnostic note that
happened to get picked up by the same "did a human type this" filter a real ask would trigger.
The matcher's job was never "is every sentence an ask"; `asks.jsonl` only ever captured a curated
271 of them on purpose. What this audit adds that asks.jsonl couldn't: a few genuinely dropped
requests ARE in that 1,483 (see the pilot's `not_found` verdicts) — that is the actual yield, and
it is real work for the owner's mastermind queue, not a backlog to clear mechanically.

## Next, if this is worth continuing

- Raise match recall by comparing against task `requirements.md` text too (not just `asks.jsonl`
  titles) — the biggest known gap in `matchAll()` right now.
- A real "is this even an ask" classifier before matching, so the Haiku step only ever sees things
  worth judging — would cut the unmatched set by more than half on inspection of the sample.
- A browsable page for `ask-ledger.jsonl` (not built this pass — a report + jsonl was the honest
  scope for the time available; see rules.md's decision record on routing, not this one).
