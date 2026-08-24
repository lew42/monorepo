# pg-resize — drag handles between split columns

**Three laws (CLAUDE.md rules all; read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** report is one screen. The deliverable is the working drag, proven with ui-test rect deltas.

## The owner's ask (verbatim)

"we need resize handles for split columns, that should probably use flex-grow for distribution, but could use flex basis for fixed sidebar, or potentially grid."

## Context (verified by prior waves)

- Data IS the CSS: `{type,id,data,items}`; `styles()` in `items.js` translates; canvas renders recursive `.pg-node` divs with style attrs (`canvas.js` render). All resize writes go through `item.set(key, value)` so they persist and repaint — never write inline styles directly.
- The sizing vocabulary landed by pg-sidebar: `data.width`/`data.height` = `hug | fill | <len>`; `items.js:41 size_decls` maps fill on the flex main axis to the `flex` shorthand; `grow` is an item-level field shown when the parent is flex.
- The hover `.pg-add` placeholder (pg-placeholder wave) renders as the last child of every `.pg-node`; its click is intercepted in canvas.js by a delegated listener. Your handles must not steal its clicks (and vice versa).
- `ext/grip` is the framework's proven drag-rail prior art (READ-ONLY — `public/framework/ext/grip/`): setPointerCapture + pointermove, works headless. Read it before writing your own pointer logic; import it only if it genuinely fits between flex children — otherwise a small local pointer handler in canvas.js is fine.

## Build (priority order — cut from the bottom)

1. **Handles in flex rows.** Between each pair of adjacent children of a Flex with direction row: a slim vertical handle overlaying the gap (absolutely positioned or margin-negative chrome — it must NOT alter layout or reserve flow space; prove sibling rects identical with handles present vs absent). Visible on hover of the gap region (or of the parent), `cursor: col-resize`.
2. **Drag = grow distribution (default).** Pointer drag redistributes the two flanking siblings: on `up`, write `grow` for each flanking child = its resulting px width normalized (round to 2 decimals; e.g. 380px/190px → grow 2 and 1... simplest correct: grow_i = px_i / min_px). During the drag, live feedback via provisional inline width is acceptable, but the COMMIT is `item.set('grow', …)` — data stays the source of truth. If a flanking child had `width: fill`, grow-writing is compatible (fill = grow); if it had `hug`, the drag converts it to grow sizing — log the rule you implement in doc/decisions.md.
3. **Fixed-sidebar mode.** If exactly ONE flanking sibling has a fixed length width (`data.width = <len>`), the drag adjusts THAT length (basis) and leaves the other side alone. Both fixed → adjust the nearer one. This gives the owner's "flex-basis for fixed sidebar" without a mode switch — the data declares the mode.
4. **Flex columns too.** Same handle horizontal between children of a column Flex, `cursor: row-resize`, adjusting heights — only if it drops out of the same code path cheaply; cut first if fiddly.
5. **Grid parents** (cut before 4): a handle between grid columns adjusting `columns` template values. Stretch goal only.

## Prove it (ui-test; drags need `move x y steps` with steps ≥ 10; insert a zero-distance move after `down` and measure between moves)

Runner: `node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json` against `http://localhost:8917/framework/ext/Playground/` (throwaway server; the owner's port-80 dev server is DOWN — never touch port 80; if 8917 is dead, background `node "C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23\scratchpad\pg-server.mjs"` and wait 2s). ⚠ NEVER click "New Document" headless (hangs on Socket.ready). Build your fixture via eval / the + placeholder. Quote multi-token CSS selectors. Ignore `ws://` console noise. Probe rects first, then aim (a drag moves the layout it aims at).

Proofs: (a) two-column split, drag +150px → left rect `dw≈+150`, right `dw≈-150`, and `doc.toJSON()` shows the new grow values (rects AND data must agree — two numbers); (b) fixed sidebar: left `width:200px`, drag → left's stored length changes, right's data untouched; (c) handles reserve no flow space (sibling rects identical before handles appear); (d) `.pg-add` still clickable next to a handle (add a child in a split, then resize it); (e) drag persists a repaint (rects unchanged after an unrelated `pg.repaint()` — eval-forced). ≤4 pngs copied into this task dir, prefixed `pg-resize-`.

## Fences + conventions

- You OWN: `public/framework/ext/Playground/canvas.js`, `playground.css`, plus this task dir. `items.js`/`Playground.js`/`properties.js`: only an unavoidable small seam, logged. `toolbar.js` untouched. Everything else read-only (`ext/grip` read, never edit).
- Load `code`, `css` skills before editing; `new-css-class` for any new class (prefix `pg-`). Every CSS rule inside a layer. No DOM after an `await`. No backtick inside `css(...)`. `**/` closes a block comment.
- Task log: `task.jsonl` line 1 via the Write tool (never Out-File/Set-Content; avoid non-ASCII in appended lines): `{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "pg-resize", "group": "panels", "request": "drag handles between flex split columns: grow distribution, fixed-basis sidebar mode", "requested_at": "<clock ISO>", "model": "claude-sonnet", "window": {"before": 0.18}, "now": "starting", "steps": ["read module+grip", "row handles+grow", "fixed-basis mode", "column handles", "ui-test proofs", "report"], "step": 1}}` — then `log` lines, clock timestamps, forward slashes, never backslash-escape backticks or `$`.
- **Safety, absolute:** never kill/restart any server; never start anything on port 80; never drive the owner's live tabs; never `git stash`, commit, or push; scratch in the scratchpad prefixed `pg-resize-`. Skill let you down → one line via `skill-improvement`.

## Report back (one screen)

What landed (file:line), proof (a)'s two agreeing numbers, png paths, what was cut and why. Cut order: 5, then 4, then (e).
