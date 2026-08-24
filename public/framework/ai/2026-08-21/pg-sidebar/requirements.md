# pg-sidebar — minimal, modular right sidebar + type switching + hug/fill

**Three laws (CLAUDE.md rules all; read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** report is one screen. The deliverable is the working sidebar, proven with ui-test pngs.

## The owner's ask (verbatim fragments — this is the spec)

"instead of having to reach to the top toolbar... there should be one + button, and then while selected, via the right sidebar, you could switch to flex or grid. and when you switch to flex or grid, a modular panel section for flex config or grid config should appear. let's keep the right sidebar as minimal as possible. you should be able to find anything you need, but not a wall of empty form fields." · "class toggles in the right sidebar for flex, grid, auto, etc (make those modular...). gap and pad are outside flex/grid. wrap is flex specific." · "i'd really like hug and fill options, for both height and width" · "make the 0 padding actually like 0.25em, so that we can see parent-child separation... make pad like 1em or even 2em default, so we can quickly add it" · "we might want bg color selections. stick to tokens, use the dropdown ui, and put this in the right sidebar."

## Context (scan + baseline, verified)

- Sidebar today renders ALL `item.constructor.fields` unconditionally (`properties.js:14-15`; fields at `items.js:34,40-46,52-57`) — the wall. `paint_properties()` rebuilds on selection (`Playground.js:191-194`).
- Data IS the CSS: `{type,id,data,items}`; `decls()` (`items.js:20-21`) → `styles()` recompute (`Playground.js:200`); canvas renders style attrs (`canvas.js:37-42`). Keep it that way — new sizing words live in `data`, translated in `styles()`.
- The previous wave landed: one `+` toolbar button, hover `.pg-add` placeholder, `pg.add_to(into, Type)` (`Playground.js:227-240`), `.pg-node-empty{min-height:2em}`. Don't undo any of it.
- Panel prior art for hug/fill (READ-ONLY): `ext/Panel/Panel.js:182` (`h:"hug"` default), `ext/Panel/seam.js:38` (hug withheld from splits), and Panel's `size.css` — hug = content-based sizing, fill = grow:1, per-axis.
- Baseline paper cut: the label input doesn't select its text on focus — naive retype produced `headerBox`. Fix: select-on-focus.

## Build (priority order — cut from the bottom)

1. **Modular sections.** Always-on for any selection: `label`, type toggles (`auto | flex | grid`), `gap`, `pad`, per-axis size (see 3), `bg` (see 5). Flex section (`direction, wrap, justify, align`) ONLY when the selection is flex; grid section (`columns, rows, flow`) ONLY when grid. Item-level fields (`grow, shrink, basis, self, order`) ONLY when the PARENT is flex; (`colSpan, rowSpan, area`) ONLY when the parent is grid — group them under a small "in parent" heading. `areas` may stay in the grid section or be cut if it fights you. Nothing else always-on. Rebuild happens in `paint_properties()` — sections are conditional field groups keyed on the item's type + parent's type.
2. **Type toggles convert the node.** `auto|flex|grid` seg control: switching converts the selected item's `type` (Box↔Flex↔Grid) IN PLACE — same id, same `data` (keep only keys that still apply; dropping stale flex keys on →auto is fine), same `items` (children preserved — prove with counts). Repaint canvas + tree + sidebar; keep it selected. This is how "one + then switch in the sidebar" replaces the old three buttons.
3. **hug / fill, both axes.** Per-axis 3-state: `hug | fill | fixed` (fixed = a small value input appearing only when chosen). Store as `data.width`/`data.height` values `"hug"`/`"fill"`/`<len>`; translate in `styles()` with the parent's context: in a flex parent, main-axis fill = `flex:1 1 0` (or `flex-grow:1`), cross-axis fill = `align-self:stretch`; hug = content sizing (`width:fit-content` / unset + `flex:0 0 auto`); outside flex, fill-w = `width:100%`-ish via stretch, fill-h needs a definite parent height — when the parent has no definite height, hug wins; log it, don't fight it (Panel hit the same wall). Prove with rects in BOTH a row parent and a column parent.
4. **Pad calibration.** In `styles()` ONLY (data stays honest): padding `0`/unset renders `0.25em` in the canvas so parent-child separation is visible. The `pad` control offers one-click `1em` (quick-add) plus the usual value entry. `gap` stays always-on, untouched semantics.
5. **bg tokens, dropdown.** A `bg` dropdown in always-on, listing theme tokens only (read the tokens from `styles/` theme CSS custom properties — pick the obvious surface/color tokens, ~6-10, `var(--token)` values; the swatch shows the color). Use the same dropdown ui the toolbar already imports (read `toolbar.js`'s imports; import, never edit `ui/`).
6. **Label select-on-focus.** One line in the label control.

## Prove it (ui-test; gestures scripted = pngs taken)

Runner: `node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json` against `http://localhost:8917/framework/ext/Playground/` (throwaway server, already up; owner's port-80 dev server DOWN — never touch port 80; restart recipe: background `node "C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23\scratchpad\pg-server.mjs"`). ⚠ NEVER click "New Document" headless — it hangs on `Socket.ready` at 8917 (baseline-proven). Work on the loaded doc or force state via `eval`. Ignore `ws://localhost:8917` console noise. Quote multi-token CSS selectors in plans (unquoted silently truncates — baseline-proven).

Proofs: (a) plain Box selected → sidebar shows ONLY the minimal set (count the fields; before-picture was 12); (b) toggle flex → flex section appears AND node converts, children preserved (child count before = after), canvas relayouts; (c) toggle back to auto → section gone; (d) grid likewise; (e) hug/fill each axis with rect deltas in a row parent and a column parent; (f) pad-0 renders 0.25em (rect/computed-style evidence) and one-click pad = 1em; (g) bg token applies (computed background-color changes). ≤5 pngs copied into this task dir, prefixed `pg-sidebar-`.

## Fences + conventions

- You OWN: `public/framework/ext/Playground/properties.js`, `items.js`, `Playground.js`, `playground.css`, plus this task dir. `canvas.js`/`toolbar.js`: only if a one-line seam is unavoidable — log it. Everything else read-only (`ext/Panel`, `ui/`, `ux/`, `styles/`, `core/`).
- Load `code`, `css`, `layout` skills before editing; `new-css-class` before any new class name (prefix `pg-`). Every CSS rule inside a layer. No DOM after an `await`. No backtick inside `css(...)`. `**/` closes a block comment.
- Task log: `task.jsonl` line 1 via the Write tool (never Out-File/Set-Content; PowerShell Get-Content/Add-Content round-trips mojibake em-dashes — append plain-ASCII lines or use python): `{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "pg-sidebar", "group": "panels", "request": "minimal modular sidebar: type toggles convert the node, flex/grid sections conditional, hug/fill per axis, pad calibration, bg tokens", "requested_at": "<clock ISO>", "model": "claude-sonnet", "window": {"before": 0.12}, "now": "starting", "steps": ["read module+skills", "modular sections", "type conversion", "hug/fill", "pad+bg+label", "ui-test proofs", "report"], "step": 1}}` — then `log` lines, clock timestamps, forward slashes, never backslash-escape backticks or `$`.
- **Safety, absolute:** never kill/restart any server; never start anything on port 80; never drive the owner's live tabs; never `git stash`, commit, or push; scratch in the scratchpad prefixed `pg-sidebar-`. Skill let you down → one line via `skill-improvement`.

## Report back (one screen)

What landed (file:line), field-count before/after for a plain Box, the proofs with png paths, what was cut and why. Cut order if pace bites: bg dropdown (5), then `areas`/grid extras, then fixed-value inputs (keep hug/fill).
