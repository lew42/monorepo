# ProcessRunner: two build processes are stuck between steps; fix why (you are a mastermind, on Sonnet, high effort)

**What's stuck.** Replaying each file with `core/Task/Process.js` says the next action is to start the next step, but nobody starts it:
- `ai/sessions/2026/10/20/session-e00f55c9/core-plugin-one-plugin-system-for-every/task.jsonl`: its next action is `{start: "execute"}` and has been since 21:01Z, through two Servex restarts (21:35Z, 22:26Z).
- `.../marked-lines-migrate-every-file-to-the-n/task.jsonl`: its next action is `{start: "plan"}`, since 22:17Z.

## The causes seen in the logs (prove each, then fix it)
1. **A stale read in `Servex/ProcessRunner.js` `after_turn()` (lines 151–181).**
   - What happens: the step agent completes its step, and then the runner, working from a state read before that completion, writes `pulse` or `wait`. Both files show `investigate.complete` followed by `investigate.wait` 6 s later.
   - Task refuses the `wait`, so on replay the step is complete. But the runner's own run decided "waiting", and nothing ever runs the process again.
   - **Fix:** read the file fresh just before writing `pulse` or `wait`, and skip a step that is complete.
2. **Nothing picks a process back up after that, or after a restart.** `core/Task/doc/process.md` says the tick re-runs `next()` on every running process. Find out why it doesn't here.
   - Suspect: `TaskLoop.find_task_files()` scans only recent session folders, and this session's folder is dated 2026-10-20.
   - **Fix:** a running process is found wherever it lives, for example from an index of running processes, not from a date scan.
3. **`Servex/Dropped.js` logged the core-plugin process as "dropped"** at 16:05 because its improve-plan reviewer was stopped, although that step was complete. A complete step's agent being stopped isn't a drop.

## Do (test first; worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
- **Tests in `Servex/ProcessRunner.test.mjs`:**
  - an agent completes its step between the turn end and the runner's read → no `wait`, and the next step starts;
  - a running process in an old-dated folder is resumed by the tick;
  - a complete step's agent stopped → not dropped.
- **After the merge,** vscode-mastermind restarts Servex. Then confirm that both processes moved on (each has a `spawn` line for its next step), and say so in the report.

**Fences:** commit by path; no `python -`; never test against the live Servex. **Budget:** about $6. Report to vscode-mastermind in 3 lines, then complete your own task and stop.
