# The asks tally, re-run: what today closed, on the page the owner reads

Budget: $8. Load the `sub-mastermind` skill first. The owner's words: `../requirements-2.md` ask 2 ("confidence that we've handled all of my prompts accurately… I asked for a whole bunch of things that just were never done"). The tally exists: `public/framework/ai/doc/asks-outcomes.md` + `asks-outcomes.jsonl`, computed at 17:41 by `Server/AskTally.mjs` (859 asks, 309 features: 101 done, 118 partly, 90 not done; "asked most, not finished" at the top). Since then about 40 tasks landed today, each with a landing line. Your log is this dir's `task.jsonl`. CLAUDE.md: compute don't recall; the page leads with what changed.

## Deliverable

1. **Re-run the verdict pass only** (not the gathering: the asks since 09-15 are in the jsonl; add today's prompts from `../requirements*.md` as new ask rows through the same Haiku extraction, one job): for every feature, re-check the landing lines of today (`SessionIndex` has them) and update `done / partly / not done` with the new evidence links; the confidence scale stays 0.5 = not sure.
2. **The page**: a new first section "What changed today" (features moved from not done or partly to done, with the landing link each; features asked today and already landed), then the existing sections regenerated; the counts before/after on one line (two numbers that must agree: features re-judged vs features in the jsonl).
3. **Spot-check** 10 of the changed verdicts yourself against the landing lines; log the agreement.
4. Owner note (kind `decision`): one sentence with the before/after counts and the link.
5. Card report; landing line checked with `tail -1`.

Fence: `Server/AskTally.mjs` (a `--rejudge` flag), `public/framework/ai/doc/asks-outcomes.*`, this task dir. Sonnet; Haiku reads.
