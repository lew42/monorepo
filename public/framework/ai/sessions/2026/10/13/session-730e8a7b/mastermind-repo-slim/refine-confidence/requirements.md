# Refine confidence: one scale nobody misreads, and the refiner run on past days in reverse

Budget: $12. Load the `sub-mastermind` skill first. The owner's raw words: `../requirements-5.md`, asks 8 and 9 ("a lot of 0.9s where I just didn't really agree… confidence numbers should start at like 0.5 as 'we're not really sure'… or default to one and use it as a multiplier… whatever it is, the interpretation must be clear… test our prompt refinement system on past prompts, day by day in reverse: raw prompts → what was actually requested (command, question, directive) → the outcome needed → confidence that the ask is clear and that the outcome is clear"). Your log is this dir's `task.jsonl`. CLAUDE.md: compute don't recall; clear beats brief; never destructive.

## What exists

- `ext/Refine` (`Refine.js`, `RefineSystem.js`, `Scorer.js`, `Prompt.js`, `Outline.js`, `stages/`), `Server/refine.mjs` (dictation → `brief.md` + `coverage.md`), `Server/doc/refine.md`. The `research` skill has the credence discipline (a credence is a probability; the one thing agents get wrong). A sibling task, `prompt-outcomes` (Opus), tallies every ask with two confidences and was told to use: 0.5 = default/unsure, 0 = no idea, 1 = certain. Match it.

## Deliverable

1. **The scale, decided and written once** (`ext/Refine/doc/confidence.md`, half a screen): confidence is a probability from 0 to 1 that the statement is right; 0.5 is the default and means "not sure"; above 0.7 only with explicit evidence named beside it; below 0.3 means "probably wrong"; never 0.9 without the evidence line. Why not a multiplier: a multiplier reads as a weight, and the owner read 0.9 as "pretty high" when the system meant "slightly below default", which is exactly the misreading to end. Record the multiplier option and its trade-off as the alternative. A `decision` line.
2. **Scorer change:** `Scorer.js` (and any prompt template that asks the model for a score) defaults to 0.5, requires an `evidence` string for any value over 0.7, and labels the number in the UI ("confidence 0.5: not sure" / "0.85: evidence: …"). Existing stored scores are not rewritten; the UI shows old ones with "(old scale)".
3. **Run it on past days, in reverse:** a script (`Server/refine-days.mjs`) that, for each day from 2026-10-13 back to 2026-10-06, feeds that day's owner prompts (the `chat` lines with `from: "owner"` in that day's task logs and `requirements*.md` files; never the gitignored transcripts) through `Server/refine.mjs` (Haiku, one job per day under 60k tokens) and writes `ext/Refine/runs/<day>/brief.md` + `coverage.md` + a `confidence.json` with the two confidences per ask on the new scale. Spot-check 10 asks yourself against the raw prompt; log the agreement score; stop early if a day's run exceeds the budget.
4. **A page**: `ext/Refine/runs/` as a page listing the days, each with ask count, mean confidence, and the brief; linked from the Refine readme.
5. Report on your card: the scale in one line, days run, asks found, spot-check score, the link.

Fence: `ext/Refine/**` (Scorer, doc, runs page), `Server/refine.mjs` (scale only), `Server/refine-days.mjs`, this task dir. Worktree, `merge.mjs`. Haiku runs the refinement; you judge the spot-check.
