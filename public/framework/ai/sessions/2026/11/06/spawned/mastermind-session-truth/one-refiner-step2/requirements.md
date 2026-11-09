# One refiner, step 2: one brief, on Sonnet, PromptTasks on

Budget: $5. Sonnet. Read `../brief-common.md` first (worktree, tests, docs, report).

## The decision (2026-11-09)

The owner delegated it; voice-app decided under the owner's rule ("make the best decision you can, as long as it's not destructive"): **yes, build the one-refiner plan in its small steps; retire = move aside, never delete; worktree + test + smoke per step.** This brief is step 2 only.

The plan: `/live/plan/one-refiner/` (source `public/live/plan/one-refiner/page.jsonl`, card `steps`), its study `../one-refiner-plan/` (`inventory.json`, `coverage.json`, `past-work.md`). Map: `public/framework/ai/doc/prompt-refinement-map.md`. Why Sonnet: `../calibration/results.md`.

## Step 2, exactly

1. **Move the parts brief into `public/framework/ext/Refine/`** (one file the refiner reads; find where the parts prompt lives today in `Server/PromptRecords.mjs` / `Server/PromptTasks*`). Old location: import from the new one, no second copy.
2. **Switch `PromptRecords.live` to Sonnet** (`claude-sonnet-5`; one named constant, so switching back is one line).
3. **Turn PromptTasks on** (find its switch; say in the readme how to turn it off). Existing tasks first: a missing requirement is added to the matching task, not a near-duplicate (check the code already does this; if not, log it as a gap, don't build it).
4. Test: one lean test that runs the refiner path on a fixed prompt with the model call stubbed and asserts the brief path and model name; existing tests still pass. Docs: `ext/Refine/readme.md` and the refinement map say what is live now.

Does not include steps 3–6 (coverage(), web dictation, cloud voice, archive). Report whether it needs a Servex restart to go live.
