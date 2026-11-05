verdict: fix
1. [fix] Deliverable 4 has no live proof. `Servex/process-live.mjs` is written, but the session log's last line (session.jsonl, 05:23:59Z) still says "Next: review, merge, restart Servex, re-run the live Haiku process", and nothing in the task folder shows a passing run or a run with a Servex restart mid-run. The script only tells you to restart Servex by hand (process-live.mjs:3); the restart case is not part of the rerunnable test the brief asked for.
2. [fix] There is no `report.md` in the task folder. The brief asks for one screen that shows each deliverable, its proof, the command to rerun it, `--report` output for this session and for `e00f55c9`, the formula chosen and why, the actual cost, and the list of what was closed. A fresh agent can't tell from the folder what landed and what is left.
3. [fix] The docs are stale. `core/Session/readme.md:139` and `:146` still say completion is the share of root tasks in state `complete` (`{done:30,total:132,…,completion:0.227}`), but `Task.completion_score` is now a recursive mean that also counts child sessions and counted prompts. The diff touches none of `core/Task/readme.md`, `core/Session/readme.md` or `core/Task/doc/process.md`, even though `Server/session-query.mjs:42` sends readers to the Session readme for the completion report. `ai/sessions/doc/data/record-spec.md:53` doesn't list `--report`, `--recent` or `--root` either.
4. [fix] Bug 3b, a spawned agent's task left `running` with `completed_at` set after it lands, has no fix in the diff. `Asks.js:120` only stops an ask from being marked landed without proof. The `from`/`id` move fix (`page_tools.js:record_file`) and the child linking (`Agents.js:1124` claim, `SessionFolders.adopt_nested`) are present and tested.
5. [fix] `Servex/agents/page_tools.js` `record_file` tests `/^d{4}$/`, a literal "dddd", where `/^\d{4}$/` was meant. It only works because the `existsSync` check on the same line catches year folders. Fix the backslash so the guard means what it says.
6. [note] The mismatch the brief names (64.8% vs 56.7% vs 49.9%) is explained only in the CLI's `not used` line (`session-query.mjs:147`). The "why this formula" the brief asks for should be in the report and the readme, with the new number for `e00f55c9`.
7. [note] `completion.test.mjs:549` builds its "independent" recomputation from `c.completion_score() === 1` for prompts, so prompt scoring is checked against itself. `Server/session-query.test.mjs` does recompute it from raw JSONL, which covers the ask, but the unit test overstates its independence.
8. [note] `ProcessRunner.close_out` calls `task_loop.close_task` on process completion. The log says process-cleanup was messaged, but its answer isn't recorded in this folder, so the agreement the brief asks for can't be confirmed.
9. [note] `ProcessRunner.js:6` puts `const OPEN` between two import lines. That's legal, but it reads oddly; move it below the imports.

## Requirements
- 1 "One score, one command" — yes, with gaps — `session-query.mjs --report/--recent` prints prompts, tasks, children, cost, the score and its formula. The item tool and the page read the same `completion_score` (page_tools.js TALLY). The score is recomputed in `session-query.test.mjs`. The chosen formula's "why" isn't written down (finding 6).
- 2 "Node counts every owner prompt" — yes — prompt-relay.mjs writes `counted: true` on new prompts. `Task.score_parts` counts them, `Prompt.no_action` or a filed task resolves them, and old prompts are untouched.
- 3 "Fix the two bugs; link children" — partly — the `from`/`id` move is fixed (handoff-route.test.mjs) and children are linked through `SessionFolders.claim`. The task-left-running bug isn't fixed (finding 4).
- 4 "Process, proven live" — no — the stall is named and fixed with a regression test (ProcessRunner.test.mjs "nested"), but there is no live run and no restart run (finding 1).
- Boundaries — partly — no `Lifecycle.js` edits. The agreement with process-cleanup isn't recorded (finding 8).
- Finish — no — no readme or doc updates, no report.md, no command output, no zero-footprint list (findings 2 and 3).
- Show the class and its live instances — n/a — no new class. `tally()` and `completion_score()` are item-tool queries (Task.queries).

## Page structure
- n/a — the only page change is one stats string in `ai/AISession/SessionStats.js`. The shots (framework-1920.png, framework-core-Session-1920.png, framework-core-Task-1920.png) don't show it. Widths given: 1920 only.
## Navigation
- n/a
## Layout
- n/a
## Sizing
- n/a
## Wrapping
- n/a — the stats line grows by " · N finished without proof". It could wrap in a narrow stats bar, but it isn't measured.
## Spacing and padding
- n/a
## Colour and contrast
- n/a
## Flow
- n/a
## Words
- Plain sentences — yes — the CLI labels are full words ("counted toward the score", "unresolved", "one-pass (…no record by design)").
- One takeaway per output — yes — the SCORE line gives the number and its meaning, and the formula line follows it.
- Formula wording — note — `FORMULA` (session-query.mjs:70) is one 280-character sentence. A newcomer would read it more easily as three short rules.
