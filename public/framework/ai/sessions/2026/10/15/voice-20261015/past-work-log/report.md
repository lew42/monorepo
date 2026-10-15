# Report: per-module work log

**Done:** `node Server/ModuleLog.mjs <path> [--by day|week|month] [--since date]` prints one path's history and grades each task. About 1 second, no AI.

- **Class:** `Server/ModuleLog.mjs` (about 100 lines). New file rather than growing `PastWork.mjs`: PastWork answers "which topic words", ModuleLog answers "which path", and they share the readers. It reuses `SessionIndex.reduce`, `LandingCheck.verify` and `git`, and `PastWork.walk`.
- **Grades:** landed-and-committed, committed-never-closed, never-started. A commit ties to a task by its message (slug or branch), or by a shared action-file path inside the task's time window. Commits that tie to no task are listed as orphans.
- **Samples:** [core/Page](sample-core-Page.txt) (275 items: 43 landed-and-committed, 1 committed-never-closed, 32 never-started, 199 orphan commits) and [framework/ai](sample-framework-ai.txt) (1689 items: 311 / 73 / 249 / 1056 orphans). Generated `files.jsonl` commits are excluded.
- **Caveat:** the many orphans are real: most commits carry no task link, so the guess misses broad commits. That is the case for [step2.md](step2.md): write a landing line per module at merge time.
- **Linked from:** the `past-work` skill.
