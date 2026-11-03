# Misnamed scripts, batch 2: the next five renamed with the batch-1 script

Budget: $10. Load the `sub-mastermind` and `code` skills first. Same ask, rule and method as batch 1 (`../scripts-rename-1/requirements.md`): the `code` skill's naming rule (a class's folder, file and name match, capitalised; no function bags); batch 1 landed at 21:39 with `Server/RenameScript.mjs` (manifest, relink, `--undo`, aliases kept one week) and marked its five in `Server/doc/scripts.md`. Your log is this dir's `task.jsonl`. CLAUDE.md: scripted renames, never destructive, link every mention.

## Deliverable

1. The next five from the census's misnamed list by fewest callers (skip any file a task touched in the last hour; skip batch 1's five), each with every caller listed (file:line) in your log first.
2. `node Server/RenameScript.mjs --plan` then `--apply` for the five (extend the script only if a case is new; say what); `node --check` every touched file; existing tests green; hooks that call a renamed script dry-run once; undo proven on a worktree copy before the real apply; `merge.mjs` (Servex files raise the review to full).
3. `Server/doc/scripts.md` marks the five renamed with the hash; the remaining 16 stay listed; card report; landing line checked with `tail -1`.

Fence: the five scripts and their callers' path lines, `Server/RenameScript.mjs`, `Server/doc/scripts.md`, this task dir. Servex files tested on a private port; the live Servex is restarted by the mastermind. Sonnet.
