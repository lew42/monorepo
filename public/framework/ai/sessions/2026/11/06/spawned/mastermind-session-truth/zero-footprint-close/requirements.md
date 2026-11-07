# Close "Zero footprint" and its refinement, with evidence

Budget: $5

Two tasks on session 5132a480 (`public/framework/ai/sessions/2026/11/04/session-5132a480/session.jsonl`, lines 11 and 36): **ey63ll66** "Zero footprint: every process, Playwright browser and worktree an agent starts gets closed, and the cause of each leak is fixed" and its refinement **n3q1hy16** "Closing a task stops everything it started, by node code, proven by a rerunnable test". Code landed in commits 8fcd09ffc, ad482eb59, b839ea64d, 3f5ec6345 (see `Servex/doc/processes.md`), but the tasks were never closed.

1. Rerun `node Servex/closeout.test.mjs`. Run by the mastermind tonight it FAILED after 10 passing checks: `{"ok":false,"why":"1 uncommitted file(s): al: not a git repository …"}` at line 148, then `branch 'closeout-test-buyu2d-held' not found`. Find whether that is the test or the code; fix it if it is small (in a worktree, committed, and say the branch), else log exactly what is broken.
2. Check each claim of ey63ll66 against the code and today's `system_health` (orphans, worktrees): what is proven, what is not.
3. Close each proven task with the item tool on that session record (`path` = `/framework/ai/sessions/2026/11/04/session-5132a480/`; check the exact grammar with `{"help":{}}`), as complete with an outcome and evidence (commits, the test's ok line). If something is missing, do NOT close it: add a one-line log on the task naming exactly what is missing.

Load the `minion` skill first. Never kill or restart servers or Servex, never stash. Report in five lines.
