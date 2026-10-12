Budget: $15

# Build LiveRefine (server) and measure it — minion brief

Read first: the design `public/framework/ext/Refine/doc/live-refine-2026-10-12.md` and `../contract.md` (both are the spec; follow them exactly). Work ONLY in the worktree `C:/Code/lew42/wt-refine-haiku-live` (branch `worktree/refine-haiku-live`, deps installed in `Servex/`). Reuse: `Servex/ext/refine/RefineCall.js` (`RefineCall.model()` = Haiku), `run.js` (copy its VoicePage/PromptLog pattern), `LiveClean.js`, `public/framework/ext/Refine/engine.js` (`quick_clean`, `clean`), `Outline.js`, `RefineStyle.js`.

## Deliverables
1. `Servex/ext/refine/LiveRefine.js` — `class LiveRefine`, one per prompt (`LiveRefine.get(key)`, dropped some minutes after final). Slots, parallel clean + amend, one amend in flight with coalescing, code-checked ops, `BUDGET_TOKENS`, VoicePage writes when `session` is given. Keep it one class, short comments.
2. Route `POST /api/refine/live` (+ OPTIONS) in `Servex/Servex.js`, next to `/api/refine`, same cors/json style. Only that hunk in Servex.js.
3. A unit test with a fake `call` (no model): coverage holds, unknown ids become adds, uncited sentences become `unplaced`, coalescing makes fewer amend calls than batches. `Servex/ext/refine/test/LiveRefine.test.mjs`.
4. `Servex/ext/refine/test/live-refine-measure.mjs` — replay a real long dictation (use the raw text of `public/framework/ai/2026-09-29/prompt-refine/runs/c/` or the longest raw you find there; ~10 minutes of speech) sentence by sentence, a new sentence every ~4 s (flag `--fast` to skip waiting), calling LiveRefine directly (real Haiku via RefineCall, no Servex needed). Write `public/framework/ai/2026-10-12/refine-haiku-live/measure/results.jsonl` (one line per batch) and `summary.md`: median/p90 placed_ms, clean_ms, amend_ms, tokens in/out per call (max must be well under 100k), total cost, how many amends were edits vs adds, coverage, and 3 lines "what to try next". Run it for real once (Haiku, a few dimes at most).
5. Add one line to `Servex/ext/refine` readme if one exists, else to `public/framework/ext/Refine/readme.md` More list, linking the design doc.

Commit each working step in the worktree with clear messages ending `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not merge, do not restart Servex. Log progress in your task.jsonl. When done, reply with 3 lines: what landed (commits), the median placed_ms, the max tokens per call.
