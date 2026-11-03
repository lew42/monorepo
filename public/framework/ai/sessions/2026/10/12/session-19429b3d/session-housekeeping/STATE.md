# STATE (2026-10-12)

Landed (merge 77a20de0e):
- **Commit rule:** [sessions/doc/commit-rule.md](../../../../../doc/commit-rule.md): records committed, caches ignored, the sweeper commits. `public/ai/*.summary.json` now gitignored.
- **Sweeper:** `Servex/LogSweeper.js`, wired into `Servex.js`, proved by `node Servex/LogSweeper.test.mjs` (throwaway repo: logs committed, code and another agent's staged file untouched, idempotent). Dry run on the real tree finds 122 files. **Takes effect at the next Servex restart** (module loads; restart not done because it drops running agents). `SERVEX_NO_SWEEP=1` disables.
- **OpenRouter gap:** the ledger is $45.66 ABOVE the account ($110.08 vs $64.42), so nothing is unattributed. Cause: `key_diff` lines charge overlapping agents the same delta ($18.54 of identical repeats). [openrouter-gap.md](../../../../../doc/cost/openrouter-gap.md), `node Server/openrouter-gap.mjs`. Sessions page line now says "unattributed OpenRouter $".
- **Task move verify:** `node Server/TaskDirs.mjs --verify`: 78 folders, 2320 files checked, 1 changed (`sessions/2026/10/08/f74e9f54.../task/task.jsonl`, a log still being appended: expected). 12 unlanded and 994 session-less tasks stay.

Left: fix `key_diff` attribution in the OpenRouter provider (split a window's delta); untrack `files.jsonl` (2,800 tracked) as a scripted step; smoke test was skipped for the merge (no worktree server), page edit is one string.
