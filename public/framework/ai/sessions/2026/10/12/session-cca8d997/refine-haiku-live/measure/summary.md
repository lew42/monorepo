# Live refine — measured (2026-10-12)

Replayed 30 sentences from `public\framework\ai\sessions\2026\09\29\a918d03d-6afe-4958-b425-20e9eba998ef\task\runs\a\raw.txt` (a real dictation), one every ~4s like speech (never waiting for placement), through `LiveRefine` directly (real Haiku via RefineCall, no Servex process). Raw: [results.jsonl](./results.jsonl).

## Numbers

- **placed_ms** (sentence arrival → in the outline): median 9056 ms, p90 12758 ms
- **clean_ms**: median 6149 ms, p90 7048 ms (clean now rides in the amend call: one call per batch does both)
- **amend_ms**: median 6149 ms, p90 7048 ms (15 calls for 30 sentences — coalescing, at most 12 per call)
- **tokens per call**: max in 10134, max out 1302 (well under 100k)
- **total cost**: $1.27069
- **ops**: 3 edits, 25 adds (model-chosen); 1 sentence(s) force-placed as unplaced
- **coverage**: every sentence cited at least once

## What to try next
- **Per-call overhead dominates cost**: each call is a fresh Agent-SDK session (~8-10k input tokens before the outline). A resumed Haiku session with prompt caching, reset when it nears 100k, would cut most of it.
- **Pacing is on** (`MIN_BATCH` 3 / `MAX_WAIT_MS` 6000), measured on the same 30 sentences: without it 26 calls, $2.22, 7.3 s median placement; with it 15 calls, $1.27, 9.1 s. Tune those two numbers first if it feels slow or costs too much.
- **Earlier measurement** (one clean call per sentence, everything fired at once): 98 sentences, 42 s median clean, $6.03, 33 unplaced. That is why clean now rides in the amend call and a batch is capped.
