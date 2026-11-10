# One refiner, step 6: move the old refiners aside, with a readme of what they taught

Budget: $2. Sonnet, medium. Load the `minion` skill first, then `code`. The card and the owner's plan: [/live/plan/one-refiner/](/live/plan/one-refiner/) (card `steps`, item 6). The decision: voice-app under the owner's rule, 2026-11-09 ("make the best decision you can, as long as it's not destructive"; t21 on `../session.jsonl`).

## Where things stand (checked 2026-11-09 by mastermind-session-truth)

- **The one refiner** is the parts brief (`public/framework/ext/Refine/PartsBrief.js`, run by `PromptRecords.parts_of` in `Server/PromptRecords.mjs`). The channels that use it:
  - VS Code: `PromptTasks`;
  - cloud voice and web dictation: `Servex/agents/TurnRefiner.js`, merged 7c536535f.
- **`Sessions.refine`** (`Servex/agents/Sessions.js`, about line 949: Echo's `clean` + `structure`) is no longer called by `Sessions.say`.
- The old mechanisms are listed in `../one-refiner-plan/inventory.json`:
  - RefineQueue's breakdown and `RefinedCard`;
  - PromptAudit's two passes;
  - the day batch tools;
  - Echo's duplicate clean/structure;
  - LiveRefine.

## Deliverables

1. **Callers first.** For each mechanism in the list below, find every caller and every reader of its output: `git grep`, plus the `import` lines and the routes. Write one `log` line per mechanism in this task's `session.jsonl`: `live caller: file:line`, or `no live caller`. Something still in use stays where it is, and its log line says what uses it.
   - RefineQueue's breakdown and `RefinedCard`;
   - PromptAudit's two passes (`Server/PromptAudit.mjs`);
   - the day batch tools;
   - Echo's `clean`/`structure`, and `Sessions.refine`;
   - **not LiveRefine** (`Servex/ext/refine/LiveRefine.js`): it goes last, once the session page's Coverage line draws (brief `../stats-before-tree/`).
2. **Move aside** what has no live caller, into `archive/` beside its module (for example `Server/archive/`, `Servex/agents/archive/`).
   - Use one node script with a dry run and a manifest of every old → new path (the never-destructive rule: moved, never deleted). Keep the script and the manifest in this folder.
   - A function inside a file that stays live (such as `Sessions.refine`) is not moved. Mark it `/* RETIRED 2026-11-09 (one refiner step 6): no caller; kept for reference, see archive/readme.md */`, or delete the dead method if git keeps it and nothing reads it. Say which in the log.
3. **One readme** in each `archive/` you make, a screen at most: what each moved thing did, why it went (the one refiner replaced it), and the one or two lessons from `../one-refiner-plan/` and `public/framework/ai/doc/prompt-refinement-map.md` worth keeping. Link the commit.
4. **Nothing breaks:**
   - `node --check` on every file you touch;
   - the tests beside them (`Servex/agents/Sessions.test.mjs`, `Servex/agents/TurnRefiner.test.mjs`, `Server/PromptRecords*.test.mjs` if present);
   - `node Server/smoke.mjs` on the worktree.
   - Run a test the moved code had from `archive/`, or move it with its code and say so.
5. **Docs** in the same commit:
   - `public/framework/ai/doc/prompt-refinement-map.md` marks each moved mechanism "moved to archive/ (step 6)";
   - every readme that listed a moved file points at the new path.

**Cut first if short of budget:** the readme's lessons (one line each is enough), then any mechanism whose callers are unclear. Leave it in place and log why.

## How

- Make your own worktree: `node Server/worktree-up.mjs refiner-step6`. Commit by exact path after each working step. Do not merge: report back, and the parent reviews and merges.
- Spawn nobody. Never kill or restart the dev server or Servex. Never drive the owner's tabs. Never `git stash`. A change to `Servex/` goes live only after a Servex restart, so say in your report whether one is needed.
- Report in three lines: what moved (old → new), what stayed and why, and the test and smoke result.
