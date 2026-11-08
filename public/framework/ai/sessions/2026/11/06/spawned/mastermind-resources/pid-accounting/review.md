verdict: fix
1. [fix] The sweep breaks the single-writer rule. `Servex.js:355` (branch `worktree/pid-gone-ends`, 5b6f711d4) runs `leaks.mjs --close-gone` as a separate child process. In that child `LogLine.writer` is never set, so `LogLine.raw` (`Server/LogLine.mjs:57`) and the direct `fs.appendFileSync` to `spawns.jsonl` (`Servex/leaks.mjs`, `--close-gone` branch) both append to session logs that Servex itself is writing pid lines into at that moment. The fix: have the child print its `writes` as JSON (the `--dry-run` output plus the lines) and let Servex append them through `this.log` / `SpawnLog.sink`.
2. [fix] The task folder doesn't know this change exists. `report.md` §1 still says the 4 gone claude.exe starts were "not investigated further", and §4 names only 08d1c600f/beec66a38. The task's `session.jsonl` already has its `complete` line. The new commit and its branch are recorded only in the parent's log (`mastermind-resources/session.jsonl:607`). A fresh agent working from this folder would not know that `worktree/pid-gone-ends` exists, is unmerged, and needs this review. Add a §6 (or a log line plus a report update) naming the commit, the branch and its merge state.
3. [note] The header comment at `Servex/leaks.mjs:7` still says "It only READS", and the very next added lines describe a write. The `Servex/readme.md:51` row still calls `leaks.mjs` "the report". Both should mention `--close-gone`.
4. [note] A backfilled `"seen":"boot"` end counts as a real end in `pid-coverage.mjs`. After the first boot sweep, claude.exe's "with end" will read close to 100% and hide the crash gap this task measured. Count `seen:"boot"` ends as their own column, or say in `doc/processes.md` that the end % includes them.
5. [note] In `Servex/leaks.test.mjs` (end of the file) the new `close_lines()` checks run after the line `leaks.test: all checks pass` has already printed. Move that line to the end.
6. [note] The fix itself is sound and small, and its test passes. `close_lines()` respects `pair()`'s window, since `ended` lands in `[s.t, next)`, and the new test proves that `pair()` then treats the start as closed. Each boot writes lines only for gone starts that have no end yet, so the sweep is idempotent. The first boot will backfill every historic gone start (about 38 all time), appending to old, landed session logs. That is append-only, so it is acceptable, but worth knowing.

## Requirements
- 1 "Coverage, last 24 h, by process kind" — yes. This was settled in round one, and this diff doesn't touch `pid-coverage.mjs`.
- 2 "Short-lived misses" — yes. Unchanged; report.md §2.
- 3 "CLI-minion bypass" — yes. Unchanged; report.md §3.
- 4 "Smallest fix … with a test beside it … update processes.md in the same commit … do NOT merge" — yes for this follow-up. It is 47 lines in one commit, `processes.md` gains "Gone at boot", the `close_lines()` test sits in `leaks.test.mjs` and passes in `C:/Code/lew42/worktrees/pid-gone-ends`, and nothing is merged. But it writes outside the single writer (finding 1).
- 5 "Still running with no owner: list only, never kill" — yes. The sweep writes only end lines for pids that are already gone, and it kills nothing.
- Class page — n/a (functions only, no class).

## Words
- The `processes.md` "Gone at boot" paragraph — yes. It is plain and dated, and it says `ended` is an upper bound.
- Claims match the code — no. The header still says "It only READS" (finding 3).
- The task folder is current — no (finding 2).
