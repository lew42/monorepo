# The scripts under Server/ and Servex/: what each is, who calls it, which are stale

Budget: $10. Load the `sub-mastermind` skill first. The owner's words: `../requirements-8.md` ask 1 ("so many random files everywhere that nobody knows what they are, where they came from, or what they do") and `../requirements-10.md` ask 2 (names, file names, locations). The unreferenced-files census and verdicts covered `public/framework` (167 candidates, 0 dead); `Server/` holds ~100 `.mjs` scripts and `Servex/` its classes, with no census. Your log is this dir's `task.jsonl`. CLAUDE.md: compute don't recall; classes not function bags; never destructive; the owner decides deletions.

## Deliverable: `Server/doc/scripts.md` (one screen first, then the table), linked from `Server/readme.md`

1. **Census by script** (`Server/ScriptsCensus.mjs`, read-only): every `Server/*.mjs`, `Servex/*.js|mjs`, `Servex/*/*.js`, `.claude/hooks/*.mjs`: its first comment line (what it says it is), who references it (grep across the repo: scripts, skills, hooks, docs, package.json, Servex spawns), last commit date, whether it is a class or a function bag (the `code` skill's rule), test file present. Two numbers that must agree: files listed vs files on disk.
2. **Verdicts** by Haiku minions in batches (~30 each, reading only the header comment, the references and the git dates): `live` (referenced by a running path: a hook, Servex, a skill, a readme), `tool` (run by hand, documented somewhere: say where), `stale` (no reference, no mention, last touched > 30 days, or superseded by a named newer script: name it), `misnamed` (a class in a lowercase file or a function bag that should be a class, per the `code` skill). You spot-check 15; log the agreement.
3. **The owner's list**: the `stale` scripts with bytes and the one-line reason, as a tick-list; `Server/retire-files.mjs` (from unreferenced-verdicts) extended to take this manifest, NOT run. `misnamed` ones go to `ai/todo.md` as one line each with a link (a rename is a later brief, never this task).
4. Owner note (kind `decision`): counts by verdict, the link, the run/undo lines.
5. Card report; landing line checked with `tail -1`.

Fence: `Server/ScriptsCensus.mjs`, `Server/doc/scripts.md`, one link line in `Server/readme.md` and `Servex/readme.md`, `Server/retire-files.mjs` (manifest input only), `ai/todo.md` (append), this task dir. Sonnet; Haiku reads.
