# A date-only stamp never shifts a landing to the previous day: Day.of reads `YYYY-MM-DD` as a local day, and the append hook fills a missing time

Budget: $3. Sonnet. Load the `minion` and `code` skills. Your log is this dir's `task.jsonl`.

**Why:** on 10-19 the tasks dashboard said 6 landed today while 9 had. Two of the three missing had a `finish` line whose `at` is a bare date, `"at":"2026-10-19"` (`../markdown-explorer/task.jsonl`, `../card-followups/task.jsonl`); `new Date("2026-10-19")` is UTC midnight, which is 19:00 on 10-18 in the owner's zone, so `Day.of` (`public/framework/core/Session/Day.js`, the one day rule) filed them under yesterday. The third (`../clarity-one-pass/task.jsonl`) had no finish line at all; the mastermind appended one. The owner's rule: no miscounting, ever (`public/framework/ai/doc/one-state.md`). Read `Day.js`, `.claude/hooks/append.mjs` (the one writer of task log lines: where it validates a line's `at`), `Server/State.mjs` (`State.day` calls `Day.of`), `core/Task/Task.js` `replay_line` (reads `at`).

## Deliverable

1. **`Day.of`:** a value matching `^\d{4}-\d{2}-\d{2}$` is a LOCAL calendar day (return it as is); every other form keeps today's rule. `Day.path` the same. Unit test: `Day.of("2026-10-19") === "2026-10-19"` at any clock, plus the existing cases. Rerun `node Server/State.mjs` and print landed today before and after (the two shifted tasks move to 10-19; `check.ok` stays true).
2. **`append.mjs`:** a `finish`, `complete`, `stop`, `start`, `log` or `decision` line whose `at` is missing or date-only gets the current local time filled in (ISO with offset, the way the hook already stamps), with one stderr line saying so; never refuses for this. A test or a one-line proof in your log (append a date-only finish to a scratch log, show the stored `at`).
3. One line in `ai/doc/task-folders.md` (or the doc `Day.js` names) under the day rule; strike nothing in the todo (no line exists); worktree, `node --check`, `Server/smoke.mjs` clean, `merge.mjs` (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir), a `finish` line WITH a full timestamp carrying the before/after landed-today counts checked with `tail -1`, `git status` clean for your paths. Never restart servers; never drive the owner's tabs.

Fence: `core/Session/Day.js` and its test, `.claude/hooks/append.mjs`, the doc line, this task dir. Not `Server/State.mjs`, not `Task.js`.
