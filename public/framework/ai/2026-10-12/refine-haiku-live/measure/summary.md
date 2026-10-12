# Live refine — measured (2026-10-12)

Replayed 98 sentences from `public\framework\ai\sessions\2026\09\29\a918d03d-6afe-4958-b425-20e9eba998ef\task\runs\a\raw.txt` (a real dictation), fired back to back without waiting (--fast), through `LiveRefine` directly (real Haiku via RefineCall, no Servex process). Raw: [results.jsonl](./results.jsonl).

## Numbers

- **placed_ms** (sentence arrival → in the outline): median 48440 ms, p90 48448 ms
- **clean_ms**: median 42688 ms, p90 42688 ms (98 clean calls, one per slot)
- **amend_ms**: median 19560 ms, p90 19560 ms (2 amend calls for 98 sentences — coalescing)
- **tokens per call**: max in 13024, max out 3613 (well under 100k)
- **total cost**: $6.03058
- **ops**: 1 edits, 19 adds (model-chosen); 33 sentence(s) force-placed as unplaced
- **coverage**: every sentence cited at least once

**Caveat on this particular run:** `--fast` fires every sentence synchronously before any promise resolves, so the `--max-cost` safety net (checked only between sends) never got a chance to fire — all 98 sentences were already in flight before the first dollar was spent, and this run landed at $6.03, over its own $5 net. The practical effect: sentence 1 queued alone (one amend call), then sentences 2-98 ALL queued behind that single call and landed in ONE giant coalesced batch — the most extreme case the design allows, not a typical one. That one huge batch is also why 33 of 98 sentences came back uncited from the model (output capped at a few thousand tokens cannot name 97 sentences) and had to be code-forced into the outline as `unplaced` — coverage held exactly because that fallback exists, but a real dictation coalescing 5-15 sentences at a time (still cheap, still real coalescing) would place far more of them by citation instead of by fallback. Left as a finding, not re-run, to respect the budget already spent.

## What to try next
- **Fix the measurement script's own safety net**: check `--max-cost` against a lookahead estimate (sentences sent so far × running average per-sentence cost), not the already-resolved `cost_usd`, so `--fast` mode can actually cut a runaway batch short.
- **Cost is dominated by a fixed per-call overhead, not by the outline's size**: every call (clean OR amend) measured 8,000-10,000 input tokens even on the very first, near-empty call — likely the Claude Agent SDK's own baseline context, paid fresh every time since each `RefineCall` is a brand-new, never-resumed session. A resumed Haiku session (prompt caching) for the amend call, or batching several slots' clean calls into one, would cut this the most.
- Fold clean + amend into one call per batch while the outline is still small (fewer round trips while BUDGET_TOKENS is far off), falling back to two calls once it grows.
- Measure `--fast` against realistic (~4s) pacing side by side on the same text: this run shows coalescing cuts amend call COUNT hard, but the fixed per-call token overhead above means the real lever for cost is calls made, not tokens sent — so pacing-driven coalescing is the main cost control available today.
