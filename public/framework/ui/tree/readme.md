# Tree — icon + text rows, indented once per nesting level; a sidebar for layers, navigation, anything with children

## Use
```js
import { ui } from "/app.js";
const t = ui.tree(nodes, { indent: "1.25em", onSelect: node => … });
t.update(nodes);   // re-render from fresh data — you still own it
t.select(node);    // programmatic selection, no onSelect
```
`nodes: [{ icon?, text, href?, open?, children? }]`. A leaf with `href` links; a
leaf without one selects. A branch (`children`) gets a `▸` toggle and is itself
selectable — a Frame layer is still a layer.

## Left
- **Keyboard** — none yet: no arrow-key roving tabindex, no Home/End, no type-ahead.
- **Drag-reorder** — none yet: nodes are read-only data in; the caller owns any move.

## More
- [Overview](/framework/ui/tree/) — navigation, a Figma-like layer stack, the indent knob live
- [`doc/decisions.md`](./doc/decisions.md) — reserved icon/toggle slots, nesting over a depth counter, selection rules, the twentieth band
