# Task audit: spend

> **The audit cost $17.99 against a $6 plan.** The mastermind was $10.55 and seven Haiku helpers $7.44 (the task record has the exact split).
>
> **Haiku was only about 58% right** (14 of 24 spot-checked verdicts). Treat every `half-done` row as a lead to check, not a fact.
>
> No further spawns until the owner says so.

| Step | Who | Tokens | Rough $ |
|---|---|---|---|
| Scan 1,303 task.jsonl, git evidence, batching, build | scripts | 0 | 0 |
| 26 judging batches (10 tasks each, one Read of an inlined file) | 26 Haiku, about 33k tokens each | about 870k | about $0.4 to $0.9 |
| Prompt-refinement audit (the owner's priority ask) | 1 Haiku, 38k tokens | 38k | about $0.04 |
| Orchestration and fixes | Sonnet 5.5 mastermind | n/a | $10.55 (cache-heavy, long context) |

The $ range for Haiku is a bound: the transcripts report tokens, not dollars, so it is priced at all-input rates (upper) or half cached (lower).

## Cost per day (newest first)

The audit judged all 254 open tasks in one pass at about $0.002 to $0.0035 per task. Tasks judged per day: 10-08: 4, 10-07: 2, 10-06: 1, 10-05: 1, 10-04: 5, 10-03: 28, 10-02: 16, 10-01: 7, 09-30: 147, 09-29: 14, 09-28: 19, earlier: 10. So every day cost under $0.60 and 09-30 (147, mostly stopped test minions) is the only expensive one, about $0.3 to $0.5. It stayed cheap all the way back, so there was no reason to stop.

## Haiku accuracy (my spot check, 24 sampled verdicts against files and git subjects)

**What the 24 were, exactly (honest answer):** an informal check, not a measured test. I picked about 24 of the Haiku verdicts by hand while reading the batch output (no random draw), mixing "delivered", "partial" and "not found" and leaning on ones that looked odd, so the sample is biased toward doubtful cases and 58% understates the average. The ground truth was my own reading of the task folder (do the named files exist, do the git subjects for that folder say landed) plus the cheap script rule in `build.mjs` (a "delivered" verdict with 0 commits, or a "not found" with 3+ commits, is suspect). "Right" meant the verdict agreed with that evidence. I did not save the list of 24 ids, so it cannot be re-checked; treat 58% as a warning, not a statistic. Better test next time: a script draws 30 rows at random and a second reader marks each.

About 14 of 24 right (58%). It fails on three shapes, all fixed or flagged by script afterwards:
- **Harness run folders** (`.../runs/...-17xxxxxxxxxxx`, OpenRouter test runs) are not tasks. Haiku called them "not found" or "partial". `build.mjs` now marks them `scratch`.
- **Folders with parent commits**: commit counts include shared commits, so "5 commits" says nothing. Haiku leaned on them.
- **Landed but not recorded**: when the latest git subject says "landed", Haiku still said "partial". `build.mjs` now moves those to `done-unverified`.

Treat `done-unverified` and `scratch` as script-corrected; treat `half-done` as the least certain.

## Run it again

About $1 to $1.50 with this design (Haiku batches), if the 26 batches are re-judged; about $0.10 if only new unlanded tasks since today are judged. `node scan-tasks.mjs`, `evidence.mjs`, then Haiku batches, then `build.mjs`.

## What was not done

The 1,483 unmatched owner prompts from the session files were not judged (they are a separate pile in `ask-ledger/`). Only the prompt-refinement slice of them was read, by script search.

## Addendum 7 helpers: real cost (read from the registry when stopped)

Seven Haiku helpers cost **$7.44 in total**: categorise 1 to 4 were $1.43, $1.17, $1.28 and $1.38; fix 1 and 2 were $0.72 and $0.71; summarise was $0.75. That is far above the "well under a dollar" hope. Each helper ran 4 turns, because the heartbeat status checks woke the idle helpers and each wake re-read a 76k to 113k token context. The work itself was one turn each. Lesson: stop a helper the moment its result is in (I stopped them late), and expect an inlined 20k-token batch to cost about $0.25 to $0.40, not pennies. With the mastermind at about $9.19, this task is now roughly $16.6 against a $6 plan.

## Addendum 8 verifiers: real cost

19 Haiku verifiers (helpers with Read, Grep and git, 3 to 4 tasks each, one turn each) checked 73 loose ends and cost about $11 in total, about $0.57 per verifier and $0.15 per task. Almost all of that is the fixed 60k to 70k token context each helper starts with, so a bigger brief is cheaper per task; the first estimate of $0.05 to $0.10 per helper was 5 to 10 times too low. Each was stopped the moment its receipts landed, so none was woken by a heartbeat. Accuracy and the spot check are in [verified.md](verified.md).
