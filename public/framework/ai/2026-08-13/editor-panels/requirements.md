# ext/editor × ext/panel — Wave 3 requirements

Mike, 2026-08-13: *"integrate panels into the ext/Editor if possible."*

The shape: the editor's shell — palette, canvas, layers, properties, status —
becomes a **persisted panel workspace**, Blender-style: any region can be
split, resized, dragged to a new home, closed, reopened from the T menu; the
arrangement survives reload. The editor's *document* and the editor's
*arrangement* are two separate persisted trees that never touch.

**"If possible" is load-bearing.** If the integration fights the APIs, stop,
write what you found in the exec summary, and propose the right seam instead
of forcing it. A clean "no, because" is a fully successful outcome.

## Read first

1. `.claude/skills/code-architecture/SKILL.md` — binding.
2. `../panel/requirements.md` — the Wave 1/2 brief: rulings, traps, protocol
   (all still binding, especially: no commits, no server restarts, node
   --check via scratchpad `.mjs`, playwright verification, kill your PIDs).
3. The API digest:
   `C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\51c5ac4b-ed59-4c55-9fec-593d1b0addd4\scratchpad\api-digest.md`.
4. What shipped since the digest — read the actual source: all of
   `ext/panel/` (`Panel.class.js`, `panel.js`, `panel.css`, `templates.js`,
   `readme.md`, `page.js`) and all of `ext/editor/`. Two facts from the
   builders' reports worth confirming in code: `paint()` resolves a leaf's
   content as `(item.draw ?? template.draw)` — an in-memory Panel can carry
   its own `draw`; and `Panel.class.js` is named with `.class.` because
   Windows folds `Panel.js`/`panel.js` into one file.

## Rulings (orchestrator, revisable — dissent in your exec summary)

1. **Editor state stays in the editor's closure.** Regions become
   workspace-local template entries `{ icon, draw($body) }` that close over
   `doc / sel / history / nodes`. Nothing about editor state enters
   `ext/panel/templates.js` — the global T vocabulary stays content-only.
2. **The seam is a workspace-local registry.** Whatever the minimal shape is
   — an options key on `workspace()`, draws assigned onto hydrated Panel
   items by template name, or a merged local registry for the T menu — pick
   the one that adds the least API surface, and record the choice
   question → options → verdict in `ext/editor/readme.md`. If `ext/panel`
   needs a change, keep it to a few lines and justify it in the report.
3. **Arrangement persistence:** localhost `FileSaver({ path:
   "/data/editor-panels.json" })`, deployed `LocalStorageSaver({ key:
   "editor-panels" })` — the editor's existing two-line chooser pattern.
   Seed = the current shell (palette | canvas | layers+properties stacked,
   status where it fits). Document persistence (`/data/editor.json`)
   unchanged.
4. **The editor workspace's T menu lists the editor regions** (palette,
   canvas, layers, properties, status), not the global content vocabulary.
   A fresh split defaults to something sane (`blank` or a region picker —
   your call). Two canvases over one document is allowed to be undefined
   behavior — note it, don't solve it.
5. **The two drag systems must coexist:** panel drag starts only on the
   grip icon (Wave 1's call); block drag lives inside the canvas body.
   Verify a block drag over a panel grip does nothing surprising.
6. **Must not regress** the editor acceptance: drag a block into a nested
   container → reload → still there; Ctrl+Z undoes; chip/property edits
   persist; the read-only badge still reads `save()`'s return value.
7. Worker 2 flagged that deeply nested bodies can reach 0px height; if the
   editor workspace hits it, a small `min-height` on `.panel` in
   `panel.css` is pre-approved — verify, don't guess.

## Ownership

Yours: `ext/editor/*` (mainly `page.js`; append to its `readme.md`), a
minimal seam in `ext/panel/panel.js` (+ `panel.css` per ruling 7) only if
needed, the exec summary `framework/ai/2026-08-13/editor-panels/page.js`,
and the one-line child declaration in `framework/ai/2026-08-13/page.js`.
Not yours: everything else in `ext/panel/`, `core/`, `styles/`,
`ext/layout/`, `ext/draggable/`, `ext/saver/`, `server.js`, `Server/`,
this file.

## Acceptance (real browser, server already on :80)

1. `/framework/ext/editor/` renders the editor as a panel workspace, zero
   console errors, both schemes.
2. Split the layers panel, drag properties beside the palette, resize —
   arrangement survives reload (`/data/editor-panels.json`).
3. Close a region, restore it from a T menu.
4. Full editor acceptance replay (ruling 6) — all still green.
5. `/framework/ext/panel/` and its `/full/` route still pass their own
   acceptance (you touched their module; prove you broke nothing).
6. `node --check` on every file you touched.
