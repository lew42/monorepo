# Report: per-module work log

**Done:** `node Server/ModuleLog.mjs <path> [--by day|week|month] [--since date]` prints one path's history and grades each task. About 1 second, no AI.

- **Class:** `Server/ModuleLog.mjs` (about 100 lines). New file rather than growing `PastWork.mjs`: PastWork answers "which topic words", ModuleLog answers "which path", and they share the readers. It reuses `SessionIndex.reduce`, `LandingCheck.verify` and `git`, and `PastWork.walk`.
- **Grades:** landed-and-committed, committed-never-closed, never-started, landed-no-path-commit (landed, nothing on this path ties to it). A commit ties to a task by its message (slug or branch), or by a shared action-file path inside the task's time window. Commits that tie to no task are listed as orphans.
- **Samples:** [core/Page](sample-core-Page.txt) (275 items: 43 landed-and-committed, 1 committed-never-closed, 32 never-started, 199 orphan commits) and [framework/ai](sample-framework-ai.txt) (1689 items: 311 / 73 / 249 / 1056 orphans). Generated `files.jsonl` commits are excluded.
- **Caveat:** the many orphans are real: most commits carry no task link, so the guess misses broad commits. That is the case for [step2.md](step2.md): write a landing line per module at merge time.
- **Linked from:** the `past-work` skill.

## Spot-check (by hand, against git and task.jsonl)

Samples regenerated after the fixes; counts above are from the first run (core/Page now: 311 items, 79 landed-and-committed, 9 committed-never-closed, 3 never-started, 52 landed-no-path-commit, 168 orphans).

| Item | Verdict |
|---|---|
| `page-rendering`: landed 17:09, commit `7e3c10b23` (17:07) touched `core/Page/doc/how-a-page-renders.md` | **right** |
| `minion-build`: no `landed_at`, commit `0bc1bdda9` touched `Page.css` | **right** (committed-never-closed) |
| `inbox-ranking`: graded never-started, but it landed (merge `07497fefb`) | **wrong, fixed**: a landed task with no commit on the path is now `landed-no-path-commit` (it only named `core/Page/ext/Inbox` in its fence, no real Page file) |
| orphan `297f4a2bc` (untrack 1,690 shots) | **right**, no task |
| orphan `c788f414e` (tasks-dashboard landing line) | **right**, that task logged no Page action files |
| orphan `337e4b683` (AITask move; message names `ai-modules-home`) | **wrong, fixed**: tasks whose slug appears in a path commit's message, near the task's dates, now tie |
