# layout-check and padding-check never write outside the repo: a git-bash path is resolved, not mangled

Budget: $3. Sonnet. Load the `minion` and `code` skills. The bug (`ai/todo.md`, 2026-10-17 13:03; `../dictate-wide/task.jsonl`): a helper passed `--out /c/Code/lew42/monorepo/...` to the layout check and it created `C:\c\Code\lew42\monorepo\public\...` (49 MB of shots, moved aside to `%TEMP%\stray-c-2026-10-17`, plus a `C:\c\Users\mike\...` from another run). Find the script (`grep -rl "layout-check" Server/*.mjs .claude/hooks/*.mjs Servex/agents/*.js | head`; the hook that runs it after a landing, and `Server/padding-check.mjs`) and every place an `--out`, `--dir` or shot path is taken from an argument. Your log is this dir's `task.jsonl`.

## Deliverable

1. One small `class OutPath` (or a static on the script's class if it has one) with `resolve(arg)`: maps a git-bash drive path (`/c/...` → `C:/...`, `/d/...` → `D:/...`) before `path.resolve`, and refuses with one clear line any result outside the repo root or the session scratchpad (`os.tmpdir()`); used by every script found in the search. Unit test with the three cases (git-bash path, relative path, a path outside the repo refused).
2. Run the real layout check once on a page with `--out` as a git-bash path and show in your log that the sheets landed inside the task dir named, and that nothing new exists under `C:\c`. Close the todo line with the link.
3. Worktree, `node --check`, `merge.mjs` (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir), a `finish` line with the proof checked with `tail -1`, `git status` clean for your paths. Never restart servers; never drive the owner's tabs.

Fence: the layout-check and padding-check scripts and the hook that calls them, the new class file beside them, one todo line, this task dir.
