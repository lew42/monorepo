# The build process, as steps you follow yourself

**What this is.** The steps of the "build" process (the same ones as [BuildProcess.js](BuildProcess.js)) written as a checklist an agent follows by hand. Use it now: the scripted runner (`Servex/ProcessRunner.js`) is being fixed, and the owner (2026-11-02) chose a markdown process as the short-term way, so agents don't wait on it. Log each step's start and finish in your task log, so the order is on record.

## The steps
1. **Investigate.** Use Haiku scouts for the reading. Work in passes: first map what exists and who uses it, then chase only the best leads. Search for prior art, and list alternative names, but keep an API the owner already chose. Write `investigation.md` beside the brief, and put lasting findings in the module's `doc/`.
2. **Plan.** Write `plan.md` beside the brief:
   - the core API first, as a class sketch;
   - the files to change;
   - small steps you can check;
   - **the tests that prove the goal**, named before any code, as checks that should fail today;
   - the cost (tokens, dollars) and the time, and one line on whether it's worth it compared with what else is queued;
   - your line-by-line check of the owner's words in the brief.

   If it changes what the owner sees, show the look first: a screenshot of a small slice.
3. **Improve the plan.** A fresh Sonnet reviewer reads the brief and the plan, fixes gaps, cuts what's bigger than needed, and lists its changes under "Improved".
4. **Approve.** The mastermind that made the task approves it, or names changes. The owner can approve instead by reading `plan.md`.
5. **Build, test first.**
   - Work in a worktree.
   - Write the plan's tests, run them and watch them fail, then commit that.
   - Build until they pass, committing each working step.
   - If you're stuck after two honest tries, say so, so a stronger model can take over.
6. **Index.** Add a readme line in every folder you touched, and a visible link to every new page from its parent. Check with `node Server/NavCheck.mjs`.
7. **Review.** Run `node Server/review.mjs <task dir> <worktree>` and answer every finding.
8. **Merge.** Run `node Server/merge.mjs <worktree>`. Then complete your own task with the item tool, with the outcome and its evidence, and stop.
