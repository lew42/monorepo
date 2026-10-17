# The daily rebuild of undone.json keeps the verdicts and the task links

Budget: $3. Sonnet. Load the `minion` and `code` skills. The gap (`../undone-to-tasks/task.jsonl`, landing 11:13, last box): `node Server/UndoneAsks.mjs --json` rebuilds `public/framework/ai/asks/undone.json` and does not carry the `task` field that `UndoneToTasks` wrote, and TaskLoop runs that rebuild daily (`Servex/agents/TaskLoop.js`, `undone_asks_daily`), so tomorrow's rebuild would drop 229 task links. `UndoneVerify --merge` already merges `verified`, `evidence`, `verified_at`, `verified_by` by ask id (`Server/UndoneVerify.mjs`; `UndoneAsks.mjs` was changed 10-17 to carry ids across rebuilds, commit 281431dc0): read both. Your log is this dir's `task.jsonl`.

## Deliverable

1. In `Server/UndoneAsks.mjs --json`: before writing, read the existing `undone.json`, index it by ask id, and carry every field a later step owns (`verified`, `evidence`, `verified_at`, `verified_by`, `task`) onto the rebuilt rows; a row whose ask no longer exists is kept in a `retired` list with its date rather than dropped (nothing lost). One function, named, with a comment pointing at this brief.
2. Test: `Server/UndoneAsks.test.mjs` gets a case that rebuilds over a file holding `verified` and `task` and proves both survive, and one where an ask disappears and lands in `retired`. Then run the real rebuild on the main tree and show in your log that the counts of `verified` and `task` fields before and after are equal (two numbers that must agree).
3. One line in the verdict doc `ai/doc/undone-asks-2026-10-17.md` ("the daily rebuild keeps verdicts and task links"). Worktree, `node --check`, `merge.mjs` (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir), a `finish` line with the two numbers checked with `tail -1`, `git status` clean for your paths. Never restart servers; never drive the owner's tabs.

Fence: `Server/UndoneAsks.mjs`, its test, `ai/asks/undone.json` (through the script), one doc line, this task dir.
