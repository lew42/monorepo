# Scripts rename, batch 1: five files

Budget: $10. Load the `sub-mastermind` and `code` skills first. The owner's words: `../requirements-5.md` ask 6 (the token directives; "the number of minions, the model, the effort… what they're able to get done") and the `code` skill's rule the owner has repeated: a class's folder, file and name match, capitalised; a lowercase file never holds a class someone will look for; no function bags. The scripts census (`Server/doc/scripts.md`, 20:59) found 26 misnamed scripts under `Server/` and `Servex/` (a class in a lowercase file, or a function bag that should be a class), listed in `ai/todo.md` or the census table. Your log is this dir's `task.jsonl`. CLAUDE.md: moves and renames are scripted (dry run, manifest, relink, undo), never retyped; never destructive; link every mention.

## Deliverable

1. **Pick the five** with the fewest callers from the census's misnamed list (callers counted by the census; if two tie, the older file first); list them with every caller (scripts, hooks, skills, docs, package.json, Servex spawns: file:line) in your log before touching anything.
2. **Rename by script** (`Server/RenameScript.mjs`, a class, reusable for batches 2–5): `git mv old.mjs New.mjs`, rewrite every caller's path, `TaskMove.mjs --relink` for docs, a manifest and `--undo`; for a function bag, the file becomes `class Name` with the functions as static members and the old named exports kept as one-line aliases for one week (a `decision` line says when they go). `node --check` every touched file; the tests that exist run green; the hooks that call a renamed script are exercised once (a dry run of the hook).
3. **Prove on a worktree copy first** (undo works), then the real apply, `merge.mjs` (Servex files raise the review to full: let it).
4. `Server/doc/scripts.md` marks the five as renamed with the hash; the remaining 21 stay listed for the next batches; card report; landing line checked with `tail -1`.

Fence: the five scripts and their callers' import/path lines only, `Server/RenameScript.mjs`, `Server/doc/scripts.md`, this task dir. Never a script another task touched in the last hour (`git log --since="1 hour ago" --name-only`). Servex files tested on a private port; the live Servex is restarted by the mastermind. Sonnet.
