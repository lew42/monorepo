# Task audit: spend

> **Accuracy caveat: Haiku was only about 58% right (14 of 24 spot-checked verdicts).** Treat every `half-done` row as a lead to check, not a fact. The Haiku reads (26 judging batches, 1 refinement read, 9 raw-prompt reads of 2026-10-08, and the 2 sample reads) ran through the Agent tool, so they do not appear in the Sessions registry. Future minions are spawned with `spawn_agent` (claude-haiku-5-5, role minion, parent = this mastermind).
>
> **Budget:** the task record now shows this mastermind at about $9.19 against the $6 plan (mostly cache reads and output in one long session). No further spawns until the owner says so.

Budget was $6 total. The task card shows $4.27 for the mastermind alone when this was written; the Haiku minions are on top of it.

| Step | Who | Tokens | Rough $ |
|---|---|---|---|
| Scan 1,303 task.jsonl, git evidence, batching, build | scripts | 0 | 0 |
| 26 judging batches (10 tasks each, one Read of an inlined file) | 26 Haiku, about 33k tokens each | about 870k | about $0.4 to $0.9 |
| Prompt-refinement audit (the owner's priority ask) | 1 Haiku, 38k tokens | 38k | about $0.04 |
| Orchestration and fixes | Sonnet 5.5 mastermind | n/a | $4.27 (cache-heavy, long context) |

The $ range for Haiku is a bound: the transcripts report tokens, not dollars, so it is priced at all-input rates (upper) or half cached (lower).

## Cost per day (newest first)

The audit judged all 254 open tasks in one pass at about $0.002 to $0.0035 per task. Tasks judged per day: 10-08: 4, 10-07: 2, 10-06: 1, 10-05: 1, 10-04: 5, 10-03: 28, 10-02: 16, 10-01: 7, 09-30: 147, 09-29: 14, 09-28: 19, earlier: 10. So every day cost under $0.60 and 09-30 (147, mostly stopped test minions) is the only expensive one, about $0.3 to $0.5. It stayed cheap all the way back, so there was no reason to stop.

## Haiku accuracy (my spot check, 24 sampled verdicts against files and git subjects)

About 14 of 24 right (58%). It fails on three shapes, all fixed or flagged by script afterwards:
- **Harness run folders** (`.../runs/...-17xxxxxxxxxxx`, OpenRouter test runs) are not tasks. Haiku called them "not found" or "partial". `build.mjs` now marks them `scratch`.
- **Folders with parent commits**: commit counts include shared commits, so "5 commits" says nothing. Haiku leaned on them.
- **Landed but not recorded**: when the latest git subject says "landed", Haiku still said "partial". `build.mjs` now moves those to `done-unverified`.

Treat `done-unverified` and `scratch` as script-corrected; treat `half-done` as the least certain.

## Run it again

About $1 to $1.50 with this design (Haiku batches), if the 26 batches are re-judged; about $0.10 if only new unlanded tasks since today are judged. `node scan-tasks.mjs`, `evidence.mjs`, then Haiku batches, then `build.mjs`.

## What was not done

The 1,483 unmatched owner prompts from the session files were not judged (they are a separate pile in `ask-ledger/`). Only the prompt-refinement slice of them was read, by script search.
