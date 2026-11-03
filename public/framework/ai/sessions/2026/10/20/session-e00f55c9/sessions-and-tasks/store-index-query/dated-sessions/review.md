verdict: fix
1. [fix] `watch()` is built but nothing starts it (Server/doc/dated-files.md:310 "nothing starts it yet"), so ask 2 ("the index row is written when a folder appears or its record grows") does not happen in practice; add the one `DatedFiles.sessions.watch()` call to Servex (or dev-server) start-up in this change and say which restart activates it — the brief only forbids doing the restart, not wiring the call.
2. [fix] `core/Session/Session.js` (`scan`, `locate`, `day`) is untouched, although ask 1 names it; Server/doc/dated-files.md:325 explains why (browser-portable, uses `Day.path`), but the plan row is ticked ✅ (store-index-query-plan.md:475) as if it were done — either route it through `Dated` (which is browser-side too, `core/Item/Dated.js`) or untick/annotate the row with the deviation.
3. [note] The sessions `check()` is weaker than the projects one: `check_sessions` (DatedFiles.mjs:38-47) treats a folder with no row as fine and drops any misfiled folder whose start came from "folder birth time", so "check() ok on the whole store" proves less than slice 1's "never out of sync"; worth one line in the doc's Decisions list.
4. [note] `SessionDayMove.mjs` did not "become `move`": it now delegates `plan`/`start` to `DatedFiles.sessions.misfiled/start` (SessionDayMove.mjs:209-211) but keeps its own manifest, apply and undo beside `DatedFiles.move`; acceptable as a thin step, but it is still a second mover — record it as a deviation.
5. [note] `watch()` (DatedFiles.mjs:136-146) is a recursive `fs.watch` over the whole `ai/sessions` tree; every `cache.jsonl`/`index.json` write by AISessionIndex fires it and `sync` re-reads the full record each time. It is debounced, but given the past fs.watch flood on Windows, it should filter to `session.jsonl`/`task.jsonl` names only. It also only indexes top-level folders (`parts.slice(0, 4)`), so tasks nested inside a session folder never get a row.
6. [note] The hook and `open_task` call `DatedFiles.sessions.session_dir`/`day_dir`, not `DatedFiles.create` (.claude/hooks/session-page.mjs:18, Agents.js:344-345), so a new folder gets its index row only through the not-yet-started `watch()` — this ties finding 1 to ask 1.
7. [note] Proof: `listing-before.json` and `listing-after.json` are byte-identical apart from their names ✅, and the test gains sessions checks. But the diff holds no recorded output for the whole-store `check()`, the test runs, the `--new probe-slice-2` run or the grep of what date code remains, and the task's `session.jsonl` has no finish line yet; put those in the finish line.
8. [note] `TaskDirs.mjs:230` changes `DatedFiles.ROOT` globally as an import side effect when `LEDGER_ROOT` is set. It works, but any other importer of `DatedFiles` in the same process silently gets the moved root too.

## Requirements
- 1 "every creator of a session folder goes through Dated; none keeps its own date code" — partly — TaskDirs, hook, open_task and voice_session/spawn now use `DatedFiles.sessions`, and `padStart`/`getFullYear` are gone from RemoteMCP.js; Session.js is unchanged (finding 2); SessionDayMove kept as a wrapper (finding 4)
- 1 "TaskDirs stays as a thin alias" — yes — Server/TaskDirs.mjs:243-277 are one-line delegations
- 2 "watch(): row written when a folder appears or its record grows, by the one writer" — no — built and tested, but never started (finding 1)
- 3 "census() and Session.scan() identical before and after" — yes — listing-before.json = listing-after.json
- 3 "check() ok; tests pass; probe-slice-2 folder" — not shown — no output recorded (finding 7)
- 4 "sessions readme 'How data gets in' names DatedFiles; dated-files.md gains sessions; plan ticks slice 2" — yes — readme.md:406-410, dated-files.md:313-325, plan:475 (but the tick hides finding 2)
- 4 "do not touch ai/whisper/" — yes — not in the diff

## Words
- content — yes — the doc table is one line per method with who calls it; the readme rows are long but carry real links
- naming — yes — `home`, `make`, `misfiled`, `sync`, `watch` are clear; `check_sessions` is a special case inside `check` rather than a subclass, which is the kind of branch the class rules discourage (note only)
