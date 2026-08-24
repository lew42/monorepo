# ux-tree — brief (Opus)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** pages lead with the thing; final report = one screen, clickable paths.

## The job

The graduation flagship: `ui/tree` is the ONE behavioral component in the template tier (2026-08-21 audit: 1/20). Split it — `.ui-tree-*` CSS stays in `ui/`, the stateful half becomes `class Tree` in `ux/Tree/`, extendable, with the readme's own two asks (keyboard roving, drag-reorder) as NAMED extensions. This is the exemplar the whole ux/ tier will copy, and it is expensive to botch — that is why you are Opus.

## Ground truth and one discrepancy to settle FIRST

- A shallow inventory claimed "no event listeners in ui/"; the deeper audit (`public/framework/ai/2026-08-21/ui-behaviors-audit/` — read its page.js) found click listeners in `ui/tree/tree.js` — closure state (rows Map, selected_row), expand/select toggling, update()/select() lifecycle, likely bound via View helpers rather than addEventListener. **Read `ui/tree/tree.js` line by line before any design call**, and log what the listeners actually are.
- Census the callers: grep the repo for `ui.tree` / `from "./tree/tree.js"` / `tree(` under public/ (skip ai/). Existing callers must keep working or be updated within your fence — list every caller in your task log with file:line BEFORE deciding the seam.

## Read next (they ARE the contract)

1. `public/framework/ux/readme.md` + `ux/doc/system.md` — the split rule ("splitting is the usual answer, not moving"), named subclasses never numbers, ui/ must NEVER import ux/ (⚠ this means `ui/ui.js` cannot re-export the class — decide what `ui.tree` becomes: the markup/css-only loop stays? deprecated pointer page? Your call, argued in the log).
2. The `code` skill (load it) — assign-based constructor; parts as static subclasses (`Tree.Row = class TreeRow extends View`), reached via `this.constructor.Row` so extensions can swap them; every method a seam.
3. `public/framework/ui/tree/readme.md` + `ui/tree/doc/` — the module's own record; its named asks.
4. `public/framework/ux/Tree/page.js` — a stub I planted so the route exists; replace content, keep the blessed shape.

## Deliverables (priority order)

1. **`ux/Tree/Tree.js`** — `class Tree extends View`: rows/nesting, expand/collapse, selection — state in the instance, parts as static subclasses, every behavior a method. Data-shape compatible with what `ui.tree()` takes today unless you log a reason.
2. **`class TreeKeys extends Tree`** — keyboard roving (ArrowUp/Down move focus, Left/Right collapse/expand, Enter selects; roving tabindex). A separate file in `ux/Tree/`, a child page demoing it.
3. **`ui/tree` reshaped** — CSS stays `ui-tree-*` in `ui/tree/` (its `css()` split into a css-only file if needed — you own `ui/tree/**` and may edit the `tree` lines — ONLY those — in `ui/ui.js`; ⚠ another agent appends an import after the `accordion` line today, so edit by exact-string anchor on the tree lines, never rewrite the file); `ui/tree/page.js` updated to show the template story and point behavior at `/framework/ux/Tree/`; its readme/doc updated (documentation skill).
4. **The file-explorer demo** — `ux/Tree/page.js`: a real file-tree (folders/files/icons — the material icons are available, see how ui pages use `.icon`) driving a preview pane, master-detail: 3440 = tree rail + wide preview; 360 = tree collapses to a drawer or stacks (reuse existing machinery — `ext/drawer` pattern at `public/framework/ext/drawer/drawer.css`, or honest stacking; do NOT invent a new drawer). Words proof: the explorer wearing `ui-contrast ui-compact`.
5. **`TreeDrag` (drag-reorder)** — ONLY if the rest landed clean; otherwise park it with a one-line design note in `ux/Tree/doc/`.
6. **Verdict lines** in your task.jsonl (`lesson:` prefix): does the named-progression pattern hold (Tree → TreeKeys), what the static-parts pattern bought you, what the graduation actually cost — evidence for `ux/doc/decisions.md` at harvest.

## Rules

- **Fence — yours alone:** `ux/Tree/**`, `ui/tree/**`, the tree lines of `ui/ui.js`. READ-ONLY: everything else — `ux/page.js`, `ux/readme.md`, `ux/doc/**`, other `ui/*`, `core/**`, `styles/**` (framework.css change = written proposal in your task dir).
- **CSS:** behavior CSS that is about state/relationship may be needed (focus ring, drag ghost): `new-css-class` first (its `styles/css-scopes.txt` append is permitted), `ux-tree-*` for class names the CLASS owns, keep `ui-tree-*` for the template CSS in ui/. As little as possible; words give density/contrast free.
- Load skills: `code`, `css`, `layout`; `new-page` per page.js; `documentation`; `finish-task`; `skill-improvement` when a skill misleads.
- Log to `public/framework/ai/2026-08-21/ux-tree/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends Add-Content ASCII ONLY (no em dashes); never a findings.md.

## Verification (before landing)

Owner's dev server (port 80) is DOWN — NEVER start or touch port 80; never kill any server you find. Static server serves public/ at **http://localhost:8918** (never kill it). Screenshot recipe (proven):
`node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs http://localhost:8918/framework/ux/Tree/ <out.png> <width>` — prints overflow_x + console errors. ⚠ Ignore only the repeated "WebSocket connection to ws://localhost:8918" error (LiveReload noise); anything else is yours. Shoot 360 / 768 / 1280 / 3440 (`ux-tree-*` in scratchpad). Prove keyboard roving headless (ui-test skill: `.claude/skills/ui-test/SKILL.md` — drive.mjs plan with key steps, shot after each). ⚠ Also re-shoot `/framework/ui/tree/` — the page you reshaped must still stand. Money shot (the explorer at 3440, tree + preview) into this task dir, linked in the landing line.

## Safety (non-negotiable)

Never kill or restart any server; never drive the owner's live browser tabs; never `git stash`; never commit or push; scratch stays in the scratchpad.

## Traps that never throw

No DOM after an `await`; every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks — one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block (bit the words build INSIDE a css() template too — prose between `*/` and the selector killed the rule silently); a method named `render()` collides with core unless deliberately overriding; `classify()` classes every constructor in the chain — `TreeKeys` is safe, never name an extension a layout word; `.append(fn)` passes the View to a bare reference — wrap in `() =>`; a declared child without a page.js 404s; resolve URLs against `import.meta`; imports flow down, `.parent` points up — never both.

## Cut first if squeezed

TreeDrag → the preview pane's polish → TreeKeys arrow breadth (keep Up/Down/Enter). Never cut: the split itself, existing callers still working, `/framework/ui/tree/` re-verified, 360/3440 proof.
