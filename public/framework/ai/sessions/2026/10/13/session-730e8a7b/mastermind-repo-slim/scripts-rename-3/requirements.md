# Misnamed scripts, batch 3: the next five, with batch 2's lessons

Budget: $10. Load the `sub-mastermind` and `code` skills first. Same ask, rule and method as batches 1 and 2 (`../scripts-rename-2/requirements.md`; `Server/RenameScript.mjs`; the census `Server/doc/scripts.md`, 16 misnamed remain). Batch 2's lessons (its landing line): a case-only rename (`audit.mjs` → `Audit.mjs`) conflicts in `merge.mjs` on Windows (case-insensitive file system): rename through a temporary name in two commits, or fix `merge.mjs` to handle it, and say which; `crawl` has an ambiguous name (decide the class name from what it does); `retire-files` touches 59 files (take it only if the relink is proven on a copy). Your log is this dir's `task.jsonl`.

## Deliverable

1. The next five by fewest callers (skip files touched by a task in the last hour), callers listed first (file:line).
2. `RenameScript --plan`/`--apply`; the case-only path handled as decided (a `decision` line); `node --check`, tests green, hooks dry-run; undo proven on a worktree copy; `merge.mjs`.
3. `Server/doc/scripts.md` marks the five; 11 remain; card; landing line checked with `tail -1`.

Fence: the five scripts and their callers' path lines, `Server/RenameScript.mjs`, `Server/merge.mjs` (only the case-only rename handling, if that is the choice), `Server/doc/scripts.md`, this task dir. Servex files tested on a private port; the live Servex is restarted by the mastermind. Sonnet.
