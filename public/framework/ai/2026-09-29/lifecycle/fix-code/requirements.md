# Lifecycle fix: the reaper's findings from review

Load the `minion` skill first, then `code`. Parent: task-mastermind-lifecycle. The owner's words and brief: `public/framework/ai/2026-09-29/lifecycle/requirements.md`. The review: `public/framework/ai/2026-09-29/lifecycle/review.md` (you own findings 1, 7 and 8). Worktree **C:\Code\lew42\worktrees\lifecycle**, branch worktree/lifecycle; commit there by exact path. Never commit `page.jsonl` files (the server writes those). Don't merge. Fence: Servex/Lifecycle.js, Servex/Monitor.js, Servex/doc/lifecycle.md. Every spawn sets `windowsHide: true`.

1. **Finding 1 (must fix):** the sweep reaps a server only when (a) its path is under `C:\Code\lew42\` (worktrees or the monorepo) or (b) the creation log recorded it. A `node server.js` from any other directory is never touched. Find a process's cwd reliably on Windows: `Get-CimInstance` has no cwd, so use the child `run.js` path, the cmd.exe `.worktree-logs` redirect, or the log's `path`. If none gives a path, **keep it** ("unknown path"). Unknown means keep, never kill.
2. **Finding 8:** in the main checkout, keep only port 3104, the keep-list ports and Servex-started servers. A hand-started `PORT=… node server.js` in the main checkout that's older than 2 hours and has no live owner task gets reaped like any other.
3. **Finding 7:** Monitor.js imports `ONE_PASS` (or asks `lifecycle.why()`) instead of copying the rule.
4. Prove it: `node Servex/Lifecycle.js --dry` on the live machine, saved to `lifecycle/fix-code/dry-run.txt`. The KEPT list must show the main site :3104 and :8137, and nothing outside C:\Code\lew42 may be in WOULD CLOSE. Run `node --check` on each file. Don't run the sweep for real.
Land your log with `landed_at`, outcome 60 words at most, and message your parent.

## Added (from mastermind-servex-6)
5. **Server/browser.mjs** (added to your fence): reuse one headless browser per process (a module-level promise), and close it when the check ends: on `process.exit` / `beforeExit`, and through an exported `close()` that callers can await. Keep the start and end lines in the creation log. Callers that already call `browser.close()` must still work, so make close idempotent. `node --check` it, and run one caller (e.g. `node Server/smoke.mjs` on one page, or layout-check) to prove it starts one browser and exits clean.
