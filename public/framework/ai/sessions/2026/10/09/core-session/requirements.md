Budget: $6

# core/Session: extract the generic session class out of AISession

Decided by the owner (19:05, via the page mastermind): [core/Page/doc/architecture.md, "Session"](/framework/core/Page/doc/architecture.md). One core class for time-based pages: `Session` (record, dated folder, locate/scan/day/dir_url, its `page.jsonl`). `AISession` extends it; `RefineSession` (task-mastermind-refine-v3) will later too. Asked by `mastermind-page-system`, owned by `mastermind-ai-system`.

## Do
1. Create `public/framework/core/Session/Session.js` (`export default class Session`), plus a short `readme.md` (what it is, who extends it, link to the architecture section and to `ai/sessions/doc/data/layout.md`). Link it from `core/readme.md`.
2. Move the **generic** statics out of `public/framework/ai/AISession/AISession.js` into it, unchanged in behaviour: `day`, `root_url`, `dir_url`, `scan`, `locate`, and the maps `days`, `slugs` (plus the `scanned` flag). Root folder is a static hook, `static root_url()`, that the subclass overrides (AISession's is `../sessions/` with the `SESSIONS_ROOT` env override).
3. **Statics are per class**: JavaScript inherits statics by reference, so each subclass must declare its OWN `days`, `slugs` and `scanned` (`static days = new Map()` in `AISession`), and the Session methods must use `this.days` / `this.slugs` / `this.root_url()`, never the literal `AISession.` or `Session.`. This is the one way the extraction silently breaks (two subclasses sharing one map).
4. `AISession extends Session`, keeps everything else (cache, costs, transcript, live index, record log, close, rollup, `LINE_TYPES`).
5. `scan` already reads the first line `{"session": "<uuid>"}` of a `page.jsonl` the page tool made; keep that.

## Prove (tick only with proof)
- `node --check` on every file touched; `node -e "import('./public/framework/ai/AISession/AISession.js')"` loads in node.
- Behaviour is the same: run `node Server/session-index.mjs` or the closest existing script that calls `AISession.scan/locate` (find callers with Grep: `AISession.locate`, `AISession.scan`, `AISession.dir_url`) before and after, and show equal output for 3 known ids. Then open `/framework/ai/sessions/` headless (`mcp__site__shot` at 1920) and confirm the grid and one detail page still render.
- A tiny test: a throwaway subclass `class T extends Session` with its own maps does not change `AISession.days`.

## Rules
- Do not change any caller's API: every `AISession.x` that works today still works (inherited statics are fine).
- Commit by exact path, one commit for the new class, one for the AISession change. Do not touch uncommitted files you did not edit. Do not restart Servex; say in your report that Servex needs one.
- Update `ai/sessions/doc/ui/classes.md` with the new parent in one line.
- Report: one screen, links, what you proved, what you did not.
