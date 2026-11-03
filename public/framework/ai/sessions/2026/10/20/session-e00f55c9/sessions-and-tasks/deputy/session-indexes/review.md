verdict: fix
1. [fix] Item 1's cause is not proven, and the fix does not explain the named session. The brief asked to "prove the cause with one command and its output". The minion's status line says "I couldn't reproduce the missing…". The commit (`AISessionIndex.mjs:80` `watch_base`) only covers project folders made after start-up, but e00f55c9's transcript is in `~/.claude/projects/c--Code-lew42-monorepo/`, which existed at start-up. Its row in `sessions/2026/10/24/index.json` today proves nothing about why it was missing. Either name the real cause with its proof line, or say plainly that it no longer reproduces and that the commit fixes a different, real gap.
2. [fix] The proof is incomplete. `shots/sessions-1920.png` shows the session listed ("Session and task systems documentation", vscode, top row), but there is no evidence of a second VS Code tab session, which the brief requires. The shots folder is gitignored (`git status --ignored` shows `!! …/session-indexes/shots/`) and was never committed, so the report links to nothing that survives.
3. [note] The readme's writer line is wrong: `public/framework/ai/sessions/readme.md` (added line ~17) says "called by `DatedFiles.sync` and `AIIndex`". DatedFiles has no `sync`. The callers are `DatedFiles.create` (`Server/DatedFiles.mjs:73`), `DatedFiles.move` (`:99`), `AIIndex` (`:263`) and `AISessionIndex` (`:318`). Law 9 requires the readme to match the code.
4. [note] `AIIndexStream.scopes` (`Server/AIIndexStream.mjs:23`) runs after the day line has already been written, so a throw there makes `append` fail even though the row landed. Only `AIIndex` wraps the call in try/catch; `DatedFiles.create` and `DatedFiles.move` do not. A try/catch around the `scopes` call would keep the scope lists best-effort.
5. [note] There is no test for the new scope climb or for `SessionScopes.plan`. `Server/AIIndex.test.mjs` already builds a temp sessions store, so asserting the three levels there takes a few lines. The brief also asked for the dry-run count against the `--apply` count, and that report is not on the task record yet.
6. [note] Item 2 is otherwise met and simple: the writer appends only, never repeats a line (`scope_has`), and climbs only while the list below was empty. The backfill is a dry run by default, prints a manifest and only adds missing lines. The rolled `index.json` totals are untouched, and the new files are gitignored like the day streams.

## Requirements
- 1 "This session is missing from the Sessions list" — partly — it is listed now (shots/sessions-1920.png, top row), but the cause is unproven and the commit fixes a different case
- 1 "Prove the cause with one command and its output" — no — the minion's status says it could not reproduce
- 1 "Check at least one other VS Code tab session" — no — there is no evidence for it
- 1 "Headless shot at 1920 … click this session's row; it lands on its page" — partly — sessions-1920.png and session-page-1920.png exist but are gitignored and uncommitted
- 2 "Build: day → month → year lines on first row" — yes — `AIIndexStream.append` calls `scopes` when the file was empty
- 2 "Backfill Server/SessionScopes.mjs, dry run, manifest, --apply, append only" — yes — `Server/SessionScopes.mjs`
- 2 "Leave alone the rolled index.json totals" — yes — not touched
- 2 "Docs: which file, which writer, which reader" — partly — the table is there, but the writer list names a method that does not exist (`DatedFiles.sync`)
- Class with live instances — n/a — no new class holds live state (SessionScopes is a static script)
## Words
- Readme addition — yes — plain, and the table says what each file lists
- Commit messages — yes — "<module>: <outcome>" shape
