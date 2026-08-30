# pg-interactions — kill the jank, gate on select+hover, fix the column drag

**The three laws:** Less is more — ASAP, simplest working version first. Clarity is the one exception. Prioritize.
**Length budget:** final report ≤ one screen — a before/after evidence table and links; detail goes in YOUR `task.jsonl` as `log` lines (never a findings.md).

## The ask (owner, condensed — full text in `../playground-mastermind/requirements.md`)

Hovering any box in ext/Playground is jumpy; we want **zero** jumpy behavior. Labels should appear only on hover, positioned a little higher. The `+` and the resize handles should appear on **selected + hover**, not bare hover — and after clicking `+` you must be able to click it again (today the new item's own `+` pops up under the cursor and you can't add several in a row). Vertical resize sometimes strangely changes **width**. Columnar resizers sometimes appear in the wrong place — prefer handles that flow with natural layout over computed positions. Make the blocky `+` more button-like (not dashed) with a subtle hover effect.

## Facts already established (mastermind, measured 2026-08-27)

- **The jank is `.pg-add`**: `display: none` → `block` on `:hover` (`playground.css:108-112`), in flow. Measured with the ui-test harness: hovering the root node grows `.pg-viewport` by **+74px height**; hovering a nested node shifts it −37px. The bar: after your work, a hover sweep shows **0px delta on every rect**.
- **The column-drag width bug**: `resize_handles` (`canvas.js`) is direction-blind at commit — `is_fixed_len` reads only `width` (`canvas.js:108`) and both commit paths write `width`/`basis`/`grow` (`canvas.js:179,188-189`). In a `column` flex the main axis is height, so a vertical drag writes `width` data → `size_decls` (`items.js:52-55`) renders it as CROSS-axis `width: <len>` — the owner's "vertical resize changes width". Fix: the main-axis key (`row ? "width" : "height"`) everywhere in that path.
- Labels: rendered always (`canvas.js:81`), abs-pos `-1.1em` (`playground.css:94`).
- Selection: `add_to` (`Playground.js:241-246`) selects the NEW item — with select+hover gating this is what breaks repeated adds. Decide the selection rule; recommended: a `.pg-add` click keeps the CONTAINER selected (the toolbar `+`'s selection behavior is yours to judge; log the decision).

## Design constraints (owner's own words shape these)

1. Hover affordances must be either (a) **in-flow with space permanently reserved** (`opacity: 0` → shown on selected+hover — "props the parent open", the deliberate min-height effect; a bit of always-present bottom room in every container is accepted), or (b) **abs-pos, zero flow impact**. NEVER display-toggled in-flow. Suggested split — your call, measured: stacked containers (block / flex column) get the blocky in-flow bottom `+`; row containers and leaf boxes get an abs-pos affordance; don't multiply blocky buttons between items.
2. Labels: abs-pos only, shown on hover (pick hover vs selected+hover for legibility — log why), raised so they sit clear above the box edge, never affecting any rect.
3. `+` and resize handles: visible only on `.pg-selected` + `:hover`. Note the happy accident: clicking a box both selects it and leaves the pointer hovering — the affordances appear right under the cursor.
4. Resize handles: prefer positions that derive from natural layout over `position_handles()` JS math if you can do it without introducing layout shift (a zero-size in-flow handle needs the doubled-gap problem solved; if that fights you, keep abs-pos but make positions self-correcting — reposition on the hover that reveals them). The "wrong place sometimes" bug likely dies with the jank (stale positions computed before a hover shifted the layout) — verify that first before building anything.
5. Blocky `+`: solid subtle border (theme vars `--line`/`--subtle`/`--prim`), slight radius, subtle bg-shift hover effect. Button-like, minimal.
6. Do NOT build the clickable-edge inserters ("click an edge → small + → add row/col/sibling") — a sibling researcher is designing that model; leave clean seams.
7. `.pg-node-empty` (`playground.css:100`) may become redundant if reserved `+` space provides the floor — delete it if so, keep it if not; measured either way.

## Your fence

- `public/framework/ext/Playground/canvas.js`
- `public/framework/ext/Playground/playground.css`
- `public/framework/ext/Playground/Playground.js` — selection semantics in `add_to`/`add` ONLY
- your task dir `public/framework/ai/2026-08-27/pg-interactions/`
- NOT: `items.js`, `toolbar.js`, `documents.js`, `properties.js`, `readme.md`, `doc/` (wave 2 owns those; log wishes as `log` lines)

## Proof — the deliverable is measurements, not claims

Use the `ui-test` skill (`drive.mjs`). **Work on your own document**: first step of every plan —
`eval import('/framework/ext/Playground/page.js').then(m => (window.pg = m.default.tool).swap('pgmm-interact').then(() => window.pg.slug))`
(verified: seeds a fresh doc; the single console 404 on first swap is by-design). Build a 3-level test doc via `eval` on `window.pg` (`add_to`, `convert` are the API). NEVER gesture on `untitled`/the owner's docs; finish by `eval window.pg.delete_current()`.

Required evidence (pngs + `steps.json` numbers; copy the 2-3 decisive pngs into your task dir):
1. **Hover sweep, zero jank**: hover every node (nested included) + selected states — every watched rect delta 0.
2. **Multi-add**: click a container, then its `+` three times → three children, no re-select between clicks. (Trap, from the skill: an ancestor-`:hover`-revealed element refuses Playwright `click` — `hover` the ancestor, then coordinate `move`/`down`/`up`; aim leaf-shallow.)
3. **Drag axes**: in a `row` flex a horizontal drag changes widths only; in a `column` flex a vertical drag changes heights only — before/after rects for both flanks, both axes.
4. **Handle placement**: handles sit centered in their gaps after a properties-driven change (e.g. gap 0→2em via `eval window.pg.selected_item().set("gap","2em")`).

## Rules

- Load the `code` skill before editing JS; the `css` skill before the CSS work; `new-css-class` before any NEW class name (prefix `pg-`, check `styles/css-scopes.txt`).
- Never kill or restart the dev server; never drive the owner's live tabs (drive.mjs's own browser only); never `git stash`; never commit.
- Task dir exists with this brief — open `task.jsonl` per the `new-task` skill (skip dir creation; `group: "web-ui"`). Log decisions as you make them.
- Scratchpad prefix `pgint-` (shared scratchpad).
- A skill that misled you → one line via `skill-improvement`. Land with `finish-task`.
- If blocked twice on the same item, park it with a log line and move on.
