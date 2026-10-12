# pg-geometry — the three parked geometry items: fix, or bound with evidence

**Three laws (CLAUDE.md rules all; read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** report is one screen. **A proven boundary beats a broken feature** — "disabled, because X, measured" is a first-class landing for any of the three.

## The three items (owner-approved to resolve; priority order)

1. **Grid-mode resize handles.** Handles exist between Flex children (`canvas.js:81-204`: `resize_handles()`, `position_handles()`; grow distribution + fixed-basis modes, this morning's pg-resize). Grid containers have none. Add handles between adjacent grid COLUMNS that drag the `columns` template (the sidebar's grid section already stores it — write via `item.set("columns", …)`, data IS the CSS, never inline styles). Rows only if they drop out free. If grid's template model makes a clean drag semantically ambiguous (e.g. `auto` tracks), implement the unambiguous case (all-length or all-fr templates) and BOUND the rest: handles absent + one decisions.md line saying why.
2. **The `.pg-node` min-width floor skew** (documented in `doc/decisions.md`, pg-resize): committed unequal grow ratios re-render a few px off because the floor clamps the smaller flank. Diagnose the RULE first — is the floor itself right? Options, pick with evidence: clamp the drag so it cannot commit ratios the floor will veto (drag stops where the floor starts — WYSIWYG); or shrink the floor; or keep and document. Measure before/after: drag to an extreme, commit, re-render — committed rects must equal live-drag rects (the number that must agree).
3. **Wrapped-flex handle geometry:** handles assume a single row/column; with `wrap` active the flanking-pair math pairs the wrong boxes. Fix only if it is genuinely small (pair by shared row line via `offsetTop` clustering); otherwise DISABLE handles on wrapped containers (`data.wrap` check) with the reason in decisions.md + readme watch-out. Prove whichever you choose: a wrapped 5-child fixture either resizes the right pair, or shows no handles.

## Prove it (ui-test; drags `move x y steps` ≥ 10; probe rects first)

Server `http://localhost:8917/framework/ext/Playground/` (up; if dead, background `node "C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23\scratchpad\pg-server.mjs"`, wait 2s; port-80 dev server DOWN, never touch). Traps (all bit today): quote spaced selectors; `type` sel = one bare token; hover-revealed children need `hover` + coordinate `move/down/up`, on SHALLOW targets (nested-+ hover transit misses); build fixtures via eval or the + placeholder (Shift-click + = Flex as of pg-shift; a held modifier needs the scratchpad `pg-shift-drive.mjs` with keydown/keyup verbs — reuse it, don't re-derive).

- (1) grid: 3-column grid fixture, drag a handle +100px → flanking track deltas agree with the committed `columns` template values (rects AND data);
- (2) floor: the extreme-drag commit — committed rects == live-drag rects (or the documented boundary if you chose keep-and-document);
- (3) wrap: the wrapped fixture proof, whichever branch you chose.
≤4 pngs into this task dir, prefixed `pg-geometry-`.

## Fences + conventions

- You OWN: `ext/Playground/canvas.js`, `playground.css`, `doc/decisions.md`, `readme.md` (watch-out lines) + this task dir. `items.js`/`properties.js`/`Playground.js`/`toolbar.js`/`documents.js`: read, don't edit (one-line logged seam max).
- Load `code` + `css` skills before editing; `new-css-class` for any new class (`pg-` prefix); every rule in a layer; no backtick inside `css(...)`; no DOM after `await`.
- Task log line 1 via Write tool: `{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "pg-geometry", "group": "panels", "request": "grid handles + min-width floor skew + wrapped-flex: fix or bound with evidence", "requested_at": "<clock ISO>", "model": "claude-sonnet", "window": {"before": 0.0}, "now": "starting", "steps": ["read pg-resize code+decisions", "grid handles", "floor skew", "wrapped-flex", "proofs", "report"], "step": 1}}` — clock-read timestamps in the writing command; ASCII-only Add-Content appends; forward slashes; never backslash-escape backticks or `$`.
- **Safety, absolute:** never kill/restart any server; never start anything on port 80; never drive the owner's live tabs; never `git stash`/commit/push; scratch in the scratchpad prefixed `pg-geometry-`. Skill let you down → `skill-improvement`, one line.

## Report back (one screen)

Per item: FIXED (file:line + the agreeing numbers) or BOUNDED (the one-line reason + where documented). Png paths. Cut order: (1) rows, then (3)'s fix branch (bound instead) — never (2)'s measurement.
