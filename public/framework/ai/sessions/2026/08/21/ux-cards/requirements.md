# ux-cards — brief (Sonnet)

**Three laws (CLAUDE.md rules all — read it first):** Less is more — ASAP. Clarity is the one exception. Prioritize.
**Length budget:** every page leads with the thing itself; your final report = one screen, clickable paths.

## The job

Card systems and toolbars for the ui/ template tier: the types of cards and toolbar rows a library user actually reaches for, each a copy-paste template, all re-skinned for free by the config words. This is the template showcase of the new system.

## Read first (in this order — they ARE the contract)

1. `public/framework/ux/readme.md` + `public/framework/ux/doc/system.md` — the tier rules.
2. `public/framework/ui/card/page.js` — ⚠ THE decision: there is NO `ui.card()` and NO `.ui-card`. A card is `surface pad flex v gap` — framework utilities. A duplicate class is a second definition that can drift. Do not resurrect it.
3. `public/framework/ui/page.js` — the editorial rules in its comments: a variant is a child page and must be "a different THING, not a different value"; the export bar ("logic a user shouldn't have to carry"); variants render in demo.exhibit()'s wall.
4. `public/framework/ui/words/page.js` + `ui/words/words.js` — the two config words (`ui-contrast`, `ui-compact` + `--density`); a word remaps tokens, so your templates get density/contrast for free. Never write a per-card compact or contrast rule.
5. `public/framework/ui/toolbar/page.js` — what toolbar already shows.

## Deliverables (priority order)

1. **Card variants as child pages of `ui/card/`** — each a genuinely different THING (candidates: media card, person card composing the avatar template, stat card, action card with a toolbar-row footer, list card, empty-state card — pick 4–6 that earn it; drop any that is just a different value of another). Each child page: the template big on its stage (demo.exhibit pattern — copy an existing ui child page's shape, e.g. under field/ or avatar/), markup with copy button. `ui/card/page.js` gets `children:` + its Variants wall (the exhibit draws it from children).
2. **Toolbar variants as child pages of `ui/toolbar/`** — actions row, filter/segmented row, and the mobile answer (wrap vs horizontal scroll) shown honestly. 2–3 that earn it.
3. **The words matrix** on `ui/card/page.js`: one card shown default / `ui-contrast` / `ui-compact` / both — proof the variants need zero of their own density/contrast CSS.
4. **Responsive proof**: card walls use the existing `grid auto` / `packed` utilities (`--column`); every page verified 360 / 768 / 1280 / 3440.

## Rules

- **Default is ZERO new CSS.** Compose framework utilities (`surface pad flex v gap grid auto packed muted pill btn prim`) + existing `ui-*` classes. A new class is allowed ONLY for a relationship/state rule markup cannot express (see ui/page.js "The CSS" section) — then: `new-css-class` skill first (its append to `styles/css-scopes.txt` is a permitted write), class named `ui-card-*` / `ui-toolbar-*`, rule in a `css()` call in `ui/card/card.js` or `ui/toolbar/toolbar.js` (pattern: `ui/crumbs/crumbs.js`), inside a layer.
- ⚠ If you create `card.js`/`toolbar.js`: it must be imported in `ui/ui.js` or your page renders unstyled SILENTLY. As your LAST act before landing, add the import line(s) with the Edit tool anchored immediately after the line `import "./accordion/accordion.js";` — touch nothing else in ui.js (another agent edits its tree lines today).
- **Fence — yours alone:** `ui/card/**`, `ui/toolbar/**`, plus that anchored ui.js append. READ-ONLY: everything else, including `ui/page.js` (log any files:-list additions as a task.jsonl line for the mastermind), `ux/**`, `ui/words/**`, `framework.css` (change = written proposal in your task dir).
- Load skills before writing: `code`, `css`, `layout`; `new-page` per page.js; `documentation` before landing; `finish-task` to land; `skill-improvement` the moment a skill misleads (one line in its improvements.md).
- Log to `public/framework/ai/2026-08-21/ux-cards/task.jsonl`: line 1 `assign` (Write tool, group "web-ui"), appends via Add-Content, ASCII ONLY (no em dashes — cp1252 mangles them). Findings and lessons as `log` lines (prefix lessons `lesson:`) — never a findings.md.

## Verification (before landing)

The owner's dev server (port 80) is DOWN — NEVER start or touch port 80, never kill any server you find running. A throwaway static server is already serving `public/` at **http://localhost:8918** (never kill it). Screenshot with the proven recipe:
`node C:/Users/mike/AppData/Local/Temp/claude/c--Code-lew42-monorepo/0375cdd4-082c-41fa-9ebe-fa4bbb0f2a23/scratchpad/ux-shoot.mjs <url> <out.png> <width> [height]` — prints overflow_x + console errors. ⚠ Ignore exactly the repeated "WebSocket connection to ws://localhost:8918" console error (LiveReload noise on a static server); any OTHER console error is yours. Shoot every landed page at 360, 768, 1280, 3440 into the scratchpad (`ux-cards-*` names); copy the money shot (the words matrix, or the variants wall) into this task dir and link it in your landing line. Load every page THROUGH its parent url, never file://. A claim without a screenshot is not a result.

## Safety (non-negotiable)

Never kill or restart any server; never drive the owner's live browser tabs; never `git stash` (shared tree — diff, don't stash); never commit or push; scratch stays in the scratchpad, never the repo.

## Traps that never throw

No DOM after an `await` (capture the box, fill in a callback); every CSS rule inside a layer; only `p()`/`h1`–`h6` read backticks — ⚠ one backtick inside `` css(`…`) `` kills every page; `**/` in a JS comment closes the block; a declared child without a page.js 404s; framework.css `max-width:100%` and util-layer `:first-child` beat component CSS; `.append(fn)` passes the View to a bare reference — wrap in `() =>`; a custom property set inline on a demo leaks into descendants being compared (bit the words demo).

## Cut first if squeezed

Toolbar variants → the 6th/5th card variant → the words matrix (never below one card × both words). Never cut verification of what shipped.
