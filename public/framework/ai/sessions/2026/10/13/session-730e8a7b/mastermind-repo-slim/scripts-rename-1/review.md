verdict: fix
1. [fix] The restore instructions still name the deleted script, so `--undo` fails with "Cannot find module": public/framework/ai/sessions/doc/picture-archive.md:20,25-27 and the month stubs public/framework/ai/sessions/2026/08/readme.md:6 and 2026/09/readme.md:6 all say `node Server/archive-sessions.mjs`. `RenameScript.SKIP` (Server/RenameScript.mjs:15) skips everything under `public/framework/ai/sessions/`, which includes live docs and not only history. Rewrite these three files, and narrow SKIP to dated task dirs and `*.jsonl` so batches 2–5 don't miss callers the same way.
2. [fix] public/framework/ai/todo.md:190-196,204 still lists the five as "Rename candidate", now under their new names (`Server/CardCheck.mjs` "is a function bag or lowercase class"). The script blindly rewrote lines that should have been removed or ticked. The brief says only the remaining 21 stay listed.
3. [note] Server/doc/scripts.md marks the five `renamed (1a56eebd0)` but keeps the old "violates naming rule" reason in the last column (e.g. the `Server/ArchiveSessions.mjs` row). Replace it with what was done ("bag → class, aliases until 2026-10-20").
4. [note] ArchiveSessions writes a README on the E: drive (`writeArchiveReadme`). The copy written before the rename still says `node Server/archive-sessions.mjs`. Re-running `--copy`, or a one-line fix by hand, brings it current.
5. [note] The brief asked for `TaskMove.mjs --relink` for docs. RenameScript.pattern does its own basename regex instead. That works, and is simpler, but two things follow. It matches any file with the same basename in any directory, so batch 2's `browser.mjs` and `audit.mjs` will hit unrelated text: read the `--plan` output by hand first. And `undo` restores whole-file snapshots, so any edit made to a caller after the apply is overwritten.
6. [note] The requirements are otherwise met. Five were picked with callers logged (task.jsonl) and retire-files was skipped for the one-hour rule. The rename was done by `git mv` (1a56eebd0 shows true renames), each bag became a `class` with static members, old exports are one-line aliases with a dated `decision` line, and the worktree undo was proven (task.jsonl experiment line). The code callers on-landing.mjs:15, HttpsLan.js:2 and Servex.js:16 are rewritten. Servex.js needs the mastermind's restart.

## Requirements
- 1 "Pick the five with the fewest callers… list them with every caller" — yes — task.jsonl log line 21:37:26 lists file:line for each
- 2 "Rename by script… manifest and --undo; function bag becomes class Name… aliases one week" — partly — RenameScript.mjs + rename-manifest.json + aliases (e.g. `export const card_flags = CardCheck.card_flags`), but finding 1: live docs under sessions/ were not relinked
- 3 "Prove on a worktree copy first (undo works), then the real apply" — yes — task.jsonl experiment line (second run byte-exact)
- 4 "scripts.md marks the five as renamed with the hash; the remaining 21 stay listed" — partly — scripts.md yes; todo.md still lists the five (finding 2)
- "a class's folder, file and name match, capitalised; no function bags" — yes — AntigravityUsage, ArchiveSessions, BrowserCheck, CardCheck, HttpsCert each `export default class` of the file's name

## Words
- content — yes — doc edits are path swaps only; RenameScript.mjs header is a 5-line usage, plain
