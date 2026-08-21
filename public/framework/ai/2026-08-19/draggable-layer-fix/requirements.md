# draggable-layer-fix — the dragged card never hides: `.drag-source` loses to util `.flex`

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Sonnet.
**Length budget:** the diff is a few lines; report half a screen.

## The finding (ui-test-skill, run 2, 2026-08-19)

`ext/Draggable/draggable.css` puts `.drag-source { display: none }` in `@layer theme`; any dragged
element that also wears a util display class (`.flex` → `framework.css:379` `.flex { display: flex }`,
`@layer util`) keeps displaying — layer order `base theme site util` means util wins regardless of
specificity. Mid-drag, `getComputedStyle(source).display === "flex"`, the source never hides, and the
list grows by the ghost's height at pointerdown (measured 71px on the Draggable page's Todo column),
which can silently turn a drop into a no-op.

## Fix — smallest thing that cannot lose

Preferred: `Draggable.js` sets the source's **inline** `style.display = "none"` when it marks
`.drag-source`, and restores the prior inline value on drop/cancel (inline beats every layer; this is
the repo's own reasoning — see design.md §4). The CSS rule may stay as a comment or die — your call,
say why in `doc/decisions.md` (one entry). Do NOT touch `framework.css` or the layer order.

## Prove (ui-test skill — the sort plan from `.claude/skills/ui-test/` already covers this page)

- Mid-drag on `/framework/ext/Draggable/`: the source's computed `display` === "none"; the column's
  height does NOT grow at pointerdown (say before/after px).
- The reorder still commits (DOM order changed) and drop restores the element's display.
- The Playground tree page (`/framework/ui/tree/`) and `/framework/ext/Draggable/` load with zero
  console errors.

## Fence

Own: `ext/Draggable/Draggable.js` `Sortable.js` `draggable.css` `doc/decisions.md` `readme.md` (one
Watch-out line if it earns it) · this task dir. Nothing else.
