# Misnamed scripts, batch 4: five more of the 11 that remain

Budget: $10. Load the `sub-mastermind` and `code` skills first. Same ask, rule and method as batches 1–3 (`../scripts-rename-3/requirements.md`; `Server/RenameScript.mjs` now handles case-only renames through a temporary name; `merge.mjs` reads the main tree by exact case; the census `Server/doc/scripts.md` lists the 11 remaining). Your log is this dir's `task.jsonl`.

## Deliverable

1. The next five by fewest callers (skip files touched by a task in the last hour; skip `crawl` unless you can decide its class name from what it does, then say it), callers listed first (file:line).
2. `RenameScript --plan`/`--apply`; `node --check`, tests green, hooks dry-run; undo proven on a worktree copy; `merge.mjs`.
3. `Server/doc/scripts.md` marks the five; 6 remain; card; landing line checked with `tail -1`.

Fence: the five scripts and their callers' path lines, `Server/RenameScript.mjs`, `Server/doc/scripts.md`, this task dir. Servex files tested on a private port; the live Servex is restarted by the mastermind. Sonnet.
