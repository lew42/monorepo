verdict: pass
1. [note] Cause 1 is fixed as the brief asked (`Servex/ProcessRunner.js:189`, a second read before `pulse`/`wait`), but the folder does not show *why* the run after a refused `wait` never started the next step: `after_turn` ends in `run(file)`, which reads the file again, sees the step complete and should start `execute`. The likely real cause of the stall is cause 2 (no tick finds a 10-20 folder). The brief said "prove each", and nothing in `session.jsonl` records that proof.
2. [note] The race test's last check (`Servex/ProcessRunner.test.mjs`, "race: the next step started") would also pass on the old code, because the refused `wait` replays as complete and `run()` moves on anyway. Only the "no wait" and "no second pulse" checks prove the fix. A test asserting a `spawn` line for the next step would be stronger.
3. [note] The post-merge check is still open: once vscode-mastermind restarts Servex, someone must confirm that `core-plugin-one-plugin-system-for-every/task.jsonl` has a `spawn` line for `execute` and `marked-lines-migrate-every-file-to-the-n/task.jsonl` has one for `plan`. A fresh agent can find this ask in requirements.md, but no line in the task folder marks it as pending.
4. [note] `tick()` calls `save_index()` once per missing file inside the loop (`Servex/ProcessRunner.js:217`). One save after the loop would do.
5. [note] Indexing is complete. `processes.json` is in `.gitignore`, has a row in `ai/queue/readme.md`, and is covered in `core/Task/doc/process.md:85`. One stale line predates this diff: `Servex/readme.md:28` still says ProcessRunner "runs a work process's phases" (they are called steps now).

## Requirements
- 1 "read the file fresh just before writing pulse or wait, and skip a step that is complete" — yes — `ProcessRunner.js:189`; test "race: a step completed after the runner's read is not put on wait" passes
- 2 "a running process is found wherever it lives, for example from an index of running processes" — yes — `processes.json` index (`track`/`load_index`/`save_index`); when the index is missing, a 60-day scan seeds it; tests "old folder: …" pass
- 3 "A complete step's agent being stopped isn't a drop" — yes — `Dropped.js` `step_complete()`; `Dropped.test.mjs` checks both a complete step (not flagged) and an open step (flagged)
- Tests in ProcessRunner.test.mjs (three cases) — yes, mostly — the race and old-folder cases are there; the drop case is in `Dropped.test.mjs` instead, which is the better home for it
- worktree, review.mjs, merge.mjs, no commit on michael/dev — yes — branch `worktree/process-runner-stall`, 3 commits
- after the merge, confirm both processes moved on — not yet — it waits on the merge and restart (note 3)
- class with live instances — n/a — no new class

## Words
- the doc lines read plainly; the `process.md:85` cell is long but clear — yes
- the comments match the code around them — yes
