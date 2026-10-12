# Cheaper models: close the OpenRouter accounting gap, run known-answer tests

**Owner's most repeated AI ask, 34 times** ([ai/doc/asks.md](/framework/ai/doc/asks.md) #1): cheaper models with real-dollar accounting, and tests with known answers that compare models and thinking levels.

## Done when
- [ ] **Accounting gap:** OpenRouter's account spend (`openrouter-usage.json`, from `/key`) vs the sum Servex logs per agent: find why they differ (session-housekeeping named the gap), fix the logging, show both numbers and the difference on the accounting page.
- [ ] **Known-answer tests:** a node script runs 5-10 small tasks with checkable answers (a code edit with a test, a classification, a summary with required facts) across 3-4 models and two thinking levels; prints pass rate, time and real cost per model. Results table on `/framework/ai/models`. Keep spend under $3.
- [ ] Tick the ask in `ai/doc/asks.md` with the commit.

Sonnet 5.5, medium. Respect Servex's OpenRouter spend guard. Worktree for code; commit each step; merge. One-sentence chat replies; `STATE.md`; land with `finish-task`.
