# ui-tree — `ui/tree`: icon + text rows, one indent per nesting level

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Sonnet.
**Length budget:** `tree.js` ≤ 120 lines · `page.js` ≤ 80 · `readme.md` ≤ 25 · `doc/decisions.md` ≤ 40.

## The ask (owner, verbatim)

> First, have a minion launch a ui/tree, where each item is an icon + text row, and each nesting
> level indents by a certain amount. I suppose the icon could be optional. We'll want this tree to
> work as a sidebar for layers, navigation, etc.

## Deliverable

`public/framework/ui/tree/` — `tree.js` (the function component, css inside via the ui convention),
`page.js`, `readme.md`, `doc/decisions.md`; plus the two lines that make it exist: `ui/ui.js`
export + `ui/page.js`'s band entry (read `ui/readme.md` and `ui/doc/decisions.md` first — the
bands are 5·5·5·4 on purpose; say in decisions.md where the twentieth goes and why).

API — data in, DOM out, nothing persisted here:

```js
import { ui } from "/app.js";
const t = ui.tree(nodes, { indent: "1.25em", onSelect: node => … });
// nodes: [{ icon?: "▣" | HTMLElement, text, href?, open?: true, children?: [...] }]
t.update(nodes);          // re-render from fresh data (the caller owns the data)
t.select(node);           // programmatic selection (the selected row wears .ui-tree-selected)
```

- A row is `icon + text`; the icon is optional — choose whether a missing icon reserves its gap (so
  siblings' text aligns) and say why in decisions.md.
- Indent per level = a CSS custom property (`--ui-tree-indent`, default from `opts.indent`) × depth —
  set the depth on the row or nest lists; pick the simplest that survives collapsing.
- A row with children gets a collapse toggle (`open` is the initial state); a leaf with `href` is a
  link (navigation); a leaf without one is a selectable row (layers).
- Keyboard: none now. Drag-reorder: none now — list both under "Left" in the readme.

## Demos on page.js (show, don't tell)

1. Navigation: the framework's own map (a few `core/`, `ext/`, `ui/` entries with hrefs + icons).
2. Layers: a figma-like stack (Frame › Flex › three boxes, some without icons), selectable — the
   selected row's path prints under the tree.
3. The indent knob: a range input that writes `--ui-tree-indent` live.

## Prove (headless, per the protocol recipe)

- Depth 0/1/2/3 rows: measured `padding-inline-start` (or offsetLeft of the text) = depth × indent, to
  the px — print the four numbers in a `log` line.
- Zero console errors on `/framework/ui/` and `/framework/ui/tree/`; a png of the tree page in this dir.

## Fence

Own: `public/framework/ui/tree/**`, two line-edits in `public/framework/ui/ui.js` and
`public/framework/ui/page.js`, this task dir. Nothing else.
