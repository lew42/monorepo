# Session data housekeeping: commit rule, machine-log sweeper, OpenRouter gap (task mastermind brief)

Read `public/framework/ai/handover.md`, `ai/sessions/readme.md`, `ai/sessions/doc/` and `ai/sessions/2026/10/10/session-41240bd9/tasks-into-sessions/STATE.md` (tasks were moved into session folders; check what landed and what is left: 994 tasks had no session and stay, 12 not landed).

## Do
1. **Working-tree hygiene:** `git status` shows dozens of machine-written files (`ai/sessions/2026/**/index.json`, `*/files.jsonl`, `public/ai/*.jsonl`, task `page.jsonl`/`task.jsonl`). Decide for each class of file: commit (versioned log), gitignore (cache), or regenerate. Write the rule in `ai/sessions/doc/` and the readme; apply it (`.gitignore` edits are fine; committing is fine; never delete data).
2. **A Servex sweeper:** a small class (one file named for the class) that commits machine-written logs in batches on a timer (e.g. every 30 min when quiet, only paths on an allowlist, attributed `servex: log sweep`), idempotent, never touching code files or other agents' staged work; dry run mode; log what it did. Put it where Servex jobs live (`Servex/`), after reading `Servex/readme.md`; do not change `Servex/Pool.js`.
3. **OpenRouter account-vs-log gap:** the account showed more dollars than `openrouter.jsonl` explains (handover item 1). With a script, reconcile by day and model, find the missing calls (other keys? Servex-external callers? echo?) and write the finding in `ai/sessions/doc/`; make the Sessions page show "unattributed OpenRouter $" so the gap is visible, not hidden.
4. **Verify the tasks-into-sessions move end to end** with its verify script; list anything unreachable from the site and link it.

## Fences
Never destructive. Worktree for code, commit each working step after a smoke test, merge via `Server/merge.mjs`. A `Servex/` change needs a restart: batch it and prove it boots. Sonnet 5.5; Haiku under 60k tokens for reading; `node Server/usage-now.mjs` before spawns; no OpenRouter calls. One-sentence chat replies; `STATE.md` here; land with `finish-task`.
