# Slice 2 of the store/index/query plan: sessions on `Dated`

Budget: $6. Sonnet, medium effort. Parent: `vscode-mastermind` (the owner's VS Code tab), who tails your `session.jsonl`: log with the `log` tool, not chat. Own worktree (`worktree/dated-sessions`); commit each working step; `node Server/merge.mjs`; do not restart Servex or the dev server (say which one is needed).

## The plan is the brief

[core/Item/doc/store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md): section 2 (the classes), section 4 row 2 (this slice), and the owner's 19:20 section at the end (one data system for every log kind; no second date system anywhere). Slice 1 landed 2026-10-20 (merge 070ccc46c): `core/Item/Dated.js`, `Server/DatedFiles.mjs`, `core/Item/Dated.test.mjs`, the page `/framework/core/Item/Dated/`, `Server/doc/dated-files.md`. Read those first; one deviation was logged there (`move` takes `{from, module, apply}`; `watch()` was deferred to this slice).

## Do

1. The **sessions** collection becomes a `Dated` instance: `Server/TaskDirs.mjs` (`dir`, `make`), `core/Session/Session.js` (`scan`, `locate`, `day`), `Agents.open_task` (Servex), `voice_session` (`Servex/ext/remote/RemoteMCP.js`) and the SessionStart hook (`.claude/hooks/session-page.mjs`) all call `DatedFiles.create` / `Dated` paths; none keeps its own date code. `Server/SessionDayMove.mjs` becomes `move`. `TaskDirs` stays as a thin alias for its callers (it is named in skills and hooks), never a second implementation.
2. `watch()` (deferred from slice 1): the index row is written when a folder appears or its record grows, by the one writer.
3. Proof: `TaskDirs.census()` and `Session.scan()` give identical output before and after (save both listings in your task folder and diff them); `check()` ok on the whole store; `node public/framework/core/Item/Dated.test.mjs` and every `core/*/*.test.mjs` and `Server/*.test.mjs` still pass; `node Server/TaskDirs.mjs --new probe-slice-2` makes the folder in the right place (then remove it in the same commit).
4. Docs (law 9): `ai/sessions/readme.md` "How data gets in" rows name `DatedFiles`; `Server/doc/dated-files.md` gains the sessions collection; the plan's table ticks slice 2. Do not touch `ai/whisper/` (the Whisper demo has its own temporary bucket by the owner's 19:20 decision; folding it in is a later slice).

## Done when

- [ ] Every creator of a session folder goes through `Dated`; no date arithmetic left outside `core/Session/Day.js` and `Dated` (grep for `YYYY`, `getFullYear`, `padStart(2` in the files above and say what remains).
- [ ] Listings identical; tests green; docs updated.
- [ ] Merged; `finish-task` in your own `session.jsonl`, one screen, check marks.
