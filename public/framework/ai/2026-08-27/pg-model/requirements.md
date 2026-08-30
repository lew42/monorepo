# pg-model — pad/gap floors + toggles, hug/fill/fixed toward defaults, holy-grail seed

**The three laws:** Less is more — ASAP, simplest working version first. Clarity is the one exception. Prioritize.
**Length budget:** final report ≤ one screen — evidence table + links; detail as `log` lines in YOUR `task.jsonl` (never a findings.md).

## The ask (owner, condensed — full text in `../playground-mastermind/requirements.md`)

- A toolbar toggle for "pad" and one for "gap" (class toggles — `View.tc(cls, bool)` now exists, landed today by view-tc: `View.js:149-158`).
- Gap should get the same floor treatment padding already has: at gap 0 a minimal visible amount remains "so we can see the layout" (`items.js:31-32` `pad_decl` is the prior art; the owner said `min(--gap, 0.25em)` but means the floor — `max()`).
- Audit hug/fill/fixed for both axes, in flex (both directions), grid, and plain boxes: "we want to generally revert back to default (i'm not sure width:100% is necessary, isn't that default?) if we start adding non-defaults, we might get into a strange state." Write the FEWEST declarations that produce the intended behavior.
- New default documents: "start with a page with surface bg, and start with a holy grail layout … i don't feel like this helps me learn flex or grid" — replace `seed()` (`documents.js:52-57`). The researcher measured the current fixed-10em seed box costing 8 of 38 gestures across five canonical layouts — seed children should default `fill`/hug, semantic labels (page / header / nav / main / aside / footer).

## Suggested mechanism for the floors (yours to refine — log deviations)

Inline style beats every class, so the floors must live IN `styles()` but read a variable a class controls: `padding: max(<authored or 0px>, var(--pg-pad-floor, 0px))`, and on Flex/Grid `gap: max(<authored or 0px>, var(--pg-gap-floor, 0px))`. The floor classes sit on `.pg-canvas-body` (STABLE across repaints — `.pg-viewport` is rebuilt every `paint_canvas()`, `canvas.js:59`) and set `--pg-pad-floor: 0.25em` / `--pg-gap-floor: 0.25em`; custom properties inherit down to every node. Toggle buttons in a new toolbar group flip them (`pg.$body.tc(...)`), highlight via the existing `.on` convention (`toolbar.js:98`), floors ON by default. Persistence: your call — log it. Run `new-css-class` for the class names.

## The audit — the deliverable is a truth table plus proof

For every context × axis × {hug, fill, <length>} in `size_decls` (`items.js:41-67`): what CSS is written today, what the CSS DEFAULT already does, the minimal correct declaration, and a live measurement proving it (drive.mjs rects). Watch for: block width `auto` IS full width (fill may write nothing); flex cross-axis `stretch` is default ONLY while the container's `align` is stretch — the container config can interfere, so "write nothing" must be argued per case, not assumed. `ext/Panel`'s `size.css` is prior art (read-only). Two numbers that must agree: the table's declaration column vs the live `item.styles()` output driven for each case. The table lands in `ext/Playground/doc/decisions.md`; `readme.md`'s Watch-out line 27 updates if behavior changes.

## Regression bar

The owner's existing documents must not change appearance. Load `untitled` READ-ONLY (goto only — NEVER gesture on it; loading alone is safe) and compare every `.pg-node` rect before vs after your `size_decls` edits — deltas must be 0 (or each non-zero explained and defended as a bug fix, logged). Do this measurement in a stable window: sibling agents are not editing right now, but re-run it if a `navigated mid-step` flag appears.

## Also in your fence (small, parked by wave 1)

- `set_viewport()` (`Playground.js:145-149`) should call `position_handles(this.$body.el)` directly — a wave-1 ResizeObserver in canvas.js covers it, but the direct call is honest. One line.

## Your fence

`public/framework/ext/Playground/`: `items.js`, `documents.js`, `toolbar.js`, `Playground.js`, `playground.css`, `properties.js` (only if the audit demands), `doc/decisions.md`, `readme.md` (minimal lines) — NOT `canvas.js` (wave 3 owns it; log wishes). Plus your task dir `public/framework/ai/2026-08-27/pg-model/`.

## Proof discipline (ui-test skill — read its Traps, two bit agents TODAY)

- Own document: first step `eval import('/framework/ext/Playground/page.js').then(m => m.default.tool.swap('pgmm-model').then(() => m.default.tool.slug))`. Re-acquire the handle in EVERY eval (LiveReload resets window state); split observer-settled actions and measurements into separate steps; end with `delete_current()`. Never gesture on the owner's docs.
- Required evidence: (1) pad toggle flips computed padding of a padding-0 box 0.25em↔0, gap toggle likewise, and toggling causes ZERO other rect movement (wave 1 made hover jank-free — keep it that way); (2) the audit table with live agreement; (3) a new-doc screenshot showing the holy grail with surface bg; (4) the untitled regression rects.

## Rules

- Load `code` before JS, `css` before CSS, `new-css-class` before new class names. Never kill/restart the dev server; never drive the owner's tabs; never `git stash`; never commit.
- Task dir exists — open `task.jsonl` per `new-task` (skip dir creation; `group: "web-ui"`). Log decisions as you go.
- Scratchpad prefix `pgmodel-`. A misleading skill → one `skill-improvement` line. Land with `finish-task`. Blocked twice → park with a log line.
