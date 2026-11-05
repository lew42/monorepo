# Task system check: report

Details and evidence: the findings section in [core/Session/readme.md](/framework/core/Session/) and the pointer in [core/Task/readme.md](/framework/core/Task/).

## Four answers

1. **A spawned agent's task lands in its `session.tasks` and shows in the parent? No, not by default.** A default no-path `item` call from a spawned agent with no task folder made a stray `session-<id8>/page.jsonl` with 0 tasks, not linked to the parent. Fixed: an agent with a task folder now writes into its own `session.jsonl`; an explicit path to the task dir always worked.
2. **Every session has a right completion? Mostly.** It matches its own rule (mean of the tasks' completions, a leaf complete = 1). It differs from done/total progress for some sessions, and nothing labels which one is shown. The "unlinked" claim is still true, and worse: 345 of 633 child sessions of e00f55c9.
3. **A tab gets the same record as a spawned agent? Mostly yes.** Same Session class and the same tasks; only line 1 differs (`session.kind: vscode-tab` instead of `assign`).
4. **Owner asks filed as tasks, past 7 days: about 2%.** 3 of 170 sessions filed any task; 1 of the 62 sessions with owner Prompt lines did.

## Bug fixed

The `item` tool with no `path` from a tab wrote to the site root `page.jsonl`. Now `Servex/agents/page_tools.js` refuses the call with the reason, or resolves to the caller's own task folder. Tests in `Servex/agents/page_tools.test.mjs` (40 checks pass). Landed as merge 9b3512983.

## Broken, ranked (each filed as a task on this session)

1. Tabs almost never file the owner's asks as tasks (2%).
2. Spawned agents with no task folder get a stray session folder with the wrong kind, and their tasks are invisible to the parent.
3. 345 of 633 child sessions of e00f55c9 are unlinked.
4. `landing-check.test.mjs` fails on the base branch; Servex needs a restart for the page_tools fix to be live.

## Closed

The probe agents reviewer-taskcheck-probe and -probe2, and the worktree qf-5. Stray folders left in place (not deleted): `session-697c1014`, `session-2767539d`, and `probe/` in the main tree.
