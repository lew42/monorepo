# ux-treedrag — brief (Sonnet)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** the page leads with the thing; final report = one screen, clickable paths.

## The job — one thing

Build **TreeDrag** — drag-reorder for `ux/Tree` — from the design already parked in `public/framework/ux/Tree/doc/decisions.md` (a third named subclass replacing `Tree.Row`, a `moved(node, into, at)` writer seam, reusing `ext/Draggable`). The design is the contract; where reality contradicts it, log the evidence and adjust minimally. Nothing else this wave.

## Read first (they ARE the contract)

1. `public/framework/ux/Tree/doc/decisions.md` — the parked TreeDrag design, and every verdict the module already made.
2. `public/framework/ux/Tree/Tree.js` + `TreeKeys.js` — the base and the proven extension shape: one static replaced (`TreeKeys.Row`), zero base changes. TreeDrag must clear the same bar — if it NEEDS a base change, that is a written proposal in your task dir plus a workaround, never an edit to `Tree.js` (an Opus authored it today; do not degrade the exemplar).
3. `public/framework/ext/Draggable/` (find it — the persistence-stack Draggable) — reuse it outright if its shape fits; if it does not fit (it may assume Items/Savers), log WHY in one line and hand-roll minimal pointer events instead. Reuse-vs-roll is your one design call; evidence, not taste.
4. `public/framework/ux/Tree/page.js` — the explorer demo; TreeDrag becomes a child page beside `keys` and `words` (declare it in Tree's own page.js `children:` — that file is in your fence).
5. `ux/readme.md` + `ux/doc/system.md` — tier rules bind you.

## Deliverables (priority order)

1. **`ux/Tree/TreeDrag.js`** — `class TreeDrag extends Tree` (or extends TreeKeys ONLY if the doc's design says so — log the call): rows draggable, drop INTO a branch (append) and BETWEEN rows (reorder), a visible insertion cue, Escape cancels, `moved(node, into, at)` fires as the one wire — the caller persists, the class never does.
2. **The demo** — `ux/Tree/drag/page.js` (child page): a file-tree you can actually reorder, with the `moved()` payload printed live on the page so the wire is visible. Words proof not required here (the parent has it).
3. **CSS**: state/relationship rules only (drag ghost, insertion line, drop-target highlight) — `ux-tree-*` prefix (already registered in css-scopes.txt today), inside a layer, as few lines as it takes.
4. **Docs**: the module's `doc/decisions.md` gets the built-vs-designed delta (append a dated subsection); `ux/Tree/readme.md` gets one line + link. Nothing else in Tree's docs moves.
5. **Verdict `lesson:` lines**: did the third-subclass pattern hold; what the drag actually cost; Draggable reuse verdict.

## Acceptance gate — the wave lands ONLY if all of these are shot green

Headless gesture proofs (ui-test skill drive.mjs — ⚠ a drag needs `move x y steps` with >= 10 steps — or a Playwright script in the scratchpad, `ux-drag-*` names):
1. Drag a row onto a folder → it appends inside; shot before/after.
2. Drag a row between two siblings → it lands at that index; shot with the insertion cue mid-drag.
3. Escape mid-drag → tree unchanged; shot.
4. The `moved(node, into, at)` payload printed on the page matches what the shots show.
5. Re-run the parent proofs: `/framework/ux/Tree/` and `/framework/ux/Tree/keys/` at 360 + 3440 — zero overflow, zero non-LiveReload console errors, keyboard roving still works (one Enter proof).
If you cannot get the gate green in two honest attempts at any one item, STOP, park the failure with its evidence in your task log, land what is green, and say so in your report — a parked failure with evidence beats a flaky landing.

## Fence

Yours alone: `ux/Tree/**`. READ-ONLY: everything else — `Tree.js`/`TreeKeys.js` themselves are in your fence but protected by the zero-base-change bar above (append-only exception: `Tree.js` may NOT be edited; a needed base change = proposal), `ext/Draggable` (import it, never edit it), `ui/tree/**`, `ux/page.js`, everything under core/ styles/ ui/.

## Process

- Load skills: `code`, `css` before writing; `new-page` for the child page.js; `documentation`; `finish-task`; `skill-improvement` when a skill misleads; the `ui-test` skill for the gesture proofs.
- Log to `public/framework/ai/2026-08-21/ux-treedrag/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends via Add-Content. **Appends must be real UTF-8 or pure ASCII — PowerShell Add-Content defaults to ANSI; an em dash becomes an invalid byte and the board drops the line. Use ASCII.**
- **Timestamps are READ FROM THE CLOCK in the same command that writes the line, never typed** — build the line with `Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"` (or bash `date +%Y-%m-%dT%H:%M:%S%z`) in the SAME command that appends it. A sibling agent hand-typed stamps 90 minutes in the future today and the record had to be corrected from file order.

## Verification infrastructure

Owner's dev server (port 80) is DOWN — NEVER start or touch port 80; never kill any server you find. Static server at **http://localhost:8918** (never kill it). Shot recipe:
`node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs http://localhost:8918/framework/ux/Tree/drag/ <out.png> <width>` — ignore only the repeated ws://localhost:8918 LiveReload console error. Money shot (mid-drag, insertion cue visible) into this task dir, linked in the landing line.

## Safety (non-negotiable)

Never kill or restart any server; never drive the owner's live browser tabs; never `git stash`; never commit or push; scratch stays in the scratchpad.

## Traps that never throw

No DOM after an `await` — pointer handlers that await then rebuild rows lose the captor: capture the row box synchronously; every CSS rule inside a layer; one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block; ⚠ View name shadows: `text`, `toggle`, `show`, `hide`, `click` are View methods — assigning over them silently fails (bit Filter today); `classify()` stamps a class per constructor — `TreeDrag` is safe; `.append(fn)` passes the View to a bare reference — wrap `() =>`; Playwright drag: `move` with < 10 steps fires no dragover; a declared child without a page.js 404s; resolve URLs against `import.meta`.

## Cut first if squeezed

Drop-between polish (keep drop-into working and honest) → the insertion cue animation (a static line is fine) → extending TreeKeys interplay (land TreeDrag on Tree alone and log it). Never cut: the acceptance gate for whatever you claim landed.
