# pg-save — save fallback: the dev server being down must never lose work

**Three laws (CLAUDE.md rules all; read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** report is one screen. Target ~15-25 lines of code change — this is a fallback, not a sync engine.

## The decided rule (owner-approved; do not re-litigate)

Baseline-proven failure: with the dev server down, "New Document" hangs forever on `Socket.ready` and the save queue jams on the first unresolved write — silent data loss. Ship:

1. **Race `Socket.ready` against a ~2s timeout** in `ext/Playground/documents.js`. On timeout, fall back to `LocalStorageSaver` (already the prod path) for this session. Never block the UI on the socket again once the race has settled.
2. **Newest timestamp wins, nothing deleted.** The fallback saves under a distinct localStorage key (e.g. the doc key + `.local`), stamped with a save time. On a later load when the server IS up: if the fallback copy is newer than the server copy, load the fallback and write it through; park the superseded server copy under a suffixed key; one console line says exactly what happened. Nothing is ever deleted or overwritten without its park copy.
3. **A small "saving locally" pip** so the owner can see the mode. Put it in the toolbar (`toolbar.js`); reuse existing utility/toolbar classes — you may NOT touch `playground.css` (a sibling owns it right now); if a style is truly unavoidable, a minimal inline style on the pip element is acceptable for this chrome-only element (log it).

## Prove it (ui-test / drive.mjs headless; port-80 dev server is DOWN — that IS the test rig)

Runner: `node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json` against `http://localhost:8917/framework/ext/Playground/` (throwaway static server up now; if dead, background `node "C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23\scratchpad\pg-server.mjs"`, wait 2s). drive.mjs keeps one browser context per plan, so localStorage persists across a second `goto` in the SAME plan.

- (a) **Edits survive reload:** goto → add a box via the hover `+` (hover parent then coordinate `move/down/up` — `click sel` no-ops on hover-revealed children) → `goto` again → eval the doc structure: the box is still there. Two numbers that must agree: child count before reload = after.
- (b) **No hang:** total plan wall-time stays bounded (the old Socket.ready hang was forever); assert the page is interactive after the race settles (eval something trivial).
- (c) **Pip shows:** png of the toolbar in fallback mode.
- (d) **Reconciliation (server-up path):** port 80 must stay down, so prove it at the unit level — eval-drive the reconciliation function directly with a fabricated newer local copy + older "server" copy and assert: newest loaded, superseded parked under a suffixed key, console line emitted. If the code shape makes that eval impossible, document the manual test for the owner in `doc/decisions.md` instead — a proven boundary beats a fake proof.
- ⚠ NEVER click "New Document" until your fix makes it safe; if your race fixes the hang, proving THAT (New Document completes against 8917) is a bonus png.

## Fences + conventions

- You OWN: `ext/Playground/documents.js`, `toolbar.js`, + this task dir. NOT `playground.css`, NOT `Playground.js` (sibling running now), NOT `canvas.js`/`items.js`/`properties.js`. `Server/`, `core/`, `ui/`, `ux/` read-only.
- Load `code` skill before editing. No DOM after an `await` (capture boxes synchronously). Every CSS rule in a layer (you shouldn't be writing CSS). No backtick inside `css(...)`.
- Task log `task.jsonl` line 1 via Write tool: `{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "pg-save", "group": "panels", "request": "save fallback: Socket.ready 2s race -> LocalStorageSaver, newest-wins nothing-deleted, saving-locally pip", "requested_at": "<clock ISO>", "model": "claude-sonnet", "window": {"before": 0.40}, "now": "starting", "steps": ["read documents.js", "race+fallback", "reconciliation", "pip", "proofs", "report"], "step": 1}}` — clock-read timestamps in the same command that writes the line; ASCII-only appends via Add-Content; forward slashes; never backslash-escape backticks or `$`.
- **Safety, absolute:** never kill/restart any server; never start anything on port 80; never drive the owner's live tabs; never `git stash`/commit/push; scratch in the scratchpad prefixed `pg-save-`. Skill let you down → `skill-improvement`, one line.

## Report back (one screen)

What landed (file:line), the four proofs (a-d) with the agreeing numbers and png paths, the exact localStorage key scheme, anything bounded instead of proven. Cut order: (d)'s eval-drive (document the manual test instead), then the pip png — never (a).
