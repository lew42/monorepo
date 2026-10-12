# ux-tree-retire — brief (Sonnet)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** final report = one screen, clickable paths.

## The job — one deletion, done cleanly

Owner-approved and now UNGATED: retire the `ui.tree()` closure and export. The Playground migration landed at 16:17:59 today — `ext/Playground/Playground.js` now imports `ux/Tree` (both call sites, byte-compatible). `ui/tree/` keeps its `.ui-tree-*` CSS and its page as the template story + pointer to `/framework/ux/Tree/`; the shape nothing can subclass goes away.

## Census FIRST — the go/no-go

Fresh grep across `public/` (skip `ai/`): `ui.tree(`, `tree(` near ui imports, `from "./tree/tree.js"`, `ui/tree/tree.js`. ⚠ A sibling agent is editing `ext/Playground/**` RIGHT NOW — re-read `Playground.js` fresh at census time (expect `ux/Tree` imports at the top, no ui/tree reference); ext/ is strictly read-only for you. The census must read ZERO callers of the function outside `ui/`'s own pages. If you find a live caller anywhere else: STOP, log it with file:line, land nothing destructive, report. Log the full census (hits + why each is fine) before the first edit.

## The edits (after a clean census)

1. `ui/tree/tree.js` — becomes a css-only component file: the `css()` call with every `.ui-tree-*` rule stays byte-identical; the closure/function and its listeners go. Keep the graduation banner comment, pointing at `ux/Tree`. (⚠ If the CSS currently lives inside the same `css()` call, extract nothing — just delete the function parts around it. The classes must survive site-wide.)
2. `ui/ui.js` — the tree lines: `import { tree } from "./tree/tree.js"` becomes the side-effect form `import "./tree/tree.js";` grouped with the other css-only imports; `tree` leaves the `ui = {...}` object and both export statements. Three exports remain (table, timeline, keys) — which is what ui/page.js's own prose already says ("Only Data table, Timeline and keys() are functions").
3. `ui/tree/page.js` — if it still calls the function, replace that call with the equivalent static markup (copy the rendered shape from the page itself or hand-write the small `<ul>`); the page stays the template story + pointer. Its readme/doc: one-line update if they claim the function exists (documentation skill).
4. `ui/readme.md` — the header count ("Four are functions") and the graduation line ("`ui.tree()` still works unchanged") are now false: three are functions; `ui.tree()` retired 2026-08-21, the class is `ux/Tree`. Smallest truthful edits.
5. `ui/page.js` — ONLY if a line is now factually wrong (description says "three functions" already — check `files:` and the tree band entry stay right; the tree page still exists so the band stays).
6. If `ux/Tree/readme.md` or its docs claim `ui.tree()` still works, do NOT edit them — log the line for the mastermind.

## Verification (before landing)

Static server at **http://localhost:8918** (the mastermind's, pid 13056 — never kill it). Port 80 is DOWN — never start or touch it; never kill any server. Recipe:
`node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs <url> <out.png> <width>` — ignore only the repeated ws://localhost:8918 LiveReload console error.
1. `/framework/ui/tree/` at 360 + 1280 — the template page renders STYLED (the css survived the restructure; an unstyled tree = the import went wrong).
2. `/framework/ui/` at 1280 + 3440 — the wall renders, the tree card live, zero non-LiveReload console errors (a broken export kills `ui.js` and with it every page importing `ui` — this shot is the canary).
3. `/framework/ux/Tree/` + `/framework/ux/Tree/keys/` + `/framework/ux/Tree/drag/` at 1280 — untouched and green.
4. `/framework/ext/Playground/` (or its page route — find it) once at 1280: if it errors, determine whether the error traces to tree/ui.js (yours — fix it) or to the sibling's in-flight Playground edits (not yours — log the evidence, one line, move on).
Money shot (the ui/ wall, alive, post-retirement) into this task dir, linked in the landing line.

## Fence

Yours alone: `ui/tree/**`, the tree lines of `ui/ui.js`, `ui/readme.md`, factual lines of `ui/page.js`. READ-ONLY: everything else — `ext/**` (sibling mid-edit), `ux/**`, `core/**`, `styles/**`.

## Process

- Load skills: `code` before editing; `documentation` before landing; `finish-task` to land; `skill-improvement` if a skill misleads.
- Log to `public/framework/ai/2026-08-21/ux-tree-retire/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"); appends via Add-Content, **pure ASCII** (an em dash becomes an invalid byte and the board drops the line).
- **Timestamps are READ FROM THE CLOCK in the same command that writes the line, never typed** — `Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"` inline in the SAME append command.

## Safety (non-negotiable)

Never kill or restart any server; never drive the owner's browser tabs; never `git stash` (shared tree — diff, don't stash); never commit or push; scratch stays in the scratchpad (`ux-retire-*` names).

## Traps

One backtick inside `` css(`…`) `` kills every page — you are editing the file that holds the tree css; `**/` in a JS comment closes the block (prose between a comment's `*/` and a selector inside one css() call silently killed a rule today); every CSS rule inside a layer; a stylesheet that 404s resolves and warns — check the console line in the shoot output; a declared child without a page.js 404s; resolve URLs against `import.meta`.

## Cut first if squeezed

Nothing — this task is already minimal. If the census blocks, the block IS the deliverable.
