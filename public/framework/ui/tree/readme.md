# Tree — icon + text rows, indented once per nesting level; a sidebar for layers, navigation, anything with children

**The behavior graduated (2026-08-21).** The `.ui-tree-*` rules are here and stay here;
the state, the listeners and the lifecycle are [`class Tree`](/framework/ux/Tree/), which
wears these same classes. **New code takes the class.**

## Use
```js
import Tree from "/framework/ux/Tree/Tree.js";     // ← what you want
const t = new Tree({ nodes, indent: "1.25em", selected_change(node){ … } });
```
`nodes: [{ icon?, text, href?, open?, children? }]`. A leaf with `href` links; a
leaf without one selects. A branch (`children`) gets a `▸` toggle and is itself
selectable — a Frame layer is still a layer.

This module is markup and CSS only now — `ui.tree()` retired 2026-08-21, once its
last caller (`ext/Playground`) moved to `ux/Tree`. The class is what every caller
takes; this page hand-writes the same `.ui-tree-*` shape to show it styled.

## Watch out
- **The fold and the icon share one square frame** — `--ui-tree-frame` on the row, with
  `aspect-ratio: 1`, `place-items: center` and `line-height: 1`. `line-height` is the half
  that matters: without it a glyph sits on its own baseline inside a box that is already
  centred, and rides visibly high of the label (2026-09-19).
- **An `em` inside a custom property resolves where it is USED, not where it is declared** —
  so a child that sets its own `font-size` gets a different square from the same token.
  Neither child here sets one, on purpose. [`doc/decisions.md`](./doc/decisions.md)
- **These rules live inside a `css(…)` template literal.** One backtick in a comment ends
  it and blanks every page on the site. Run `node --check` after every edit to this file.
- **Its listeners were invisible to grep, while it had them.** They were installed
  through View's `.click()`, so `addEventListener` appeared nowhere in this file —
  worth remembering for the next component that graduates.

## Left
- **Keyboard** — shipped, in the class: [`TreeKeys`](/framework/ux/Tree/keys/) (arrow
  roving, roving tabindex, Home/End).
- **Drag-reorder** — shipped too: [`TreeDrag`](/framework/ux/Tree/drag/).

## More
- [Overview](/framework/ui/tree/) — navigation, a Figma-like layer stack, the indent knob live
- [`doc/decisions.md`](./doc/decisions.md) — reserved icon/toggle slots, nesting over a depth counter, selection rules, the twentieth band, and the graduation
