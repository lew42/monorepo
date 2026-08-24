# Tree — nested rows you can extend: `ui/tree`'s closure, opened up

The first graduate. `ui/` still owns every `.ui-tree-*` rule; this owns the state, the
listeners and the lifecycle — and `TreeKeys` is what a variant looks like here.

## Use
```js
import Tree from "/framework/ux/Tree/Tree.js";
import TreeKeys from "/framework/ux/Tree/TreeKeys.js";   // + arrow keys, roving tabindex

const t = new Tree({ nodes, indent: "1.25em", selected_change(node){ … } });
t.draw(nodes);          // re-render from fresh data
t.select(node, true);   // select, and fire — `true` is what a click passes
```
`nodes: [{ icon?, text, href?, open?, children? }]` — the same shape `ui.tree()` takes.
A leaf with `href` links; anything else selects. `onSelect` still works if you prefer a
callback to overriding the method.

**Your case is a subclass, never an option.** Parts hang off the constructor —
`Tree.Item` (the `<li>`), `Tree.Row` (the clickable line) — and are reached through
`this.constructor`, so replacing one gives you the rest of the machine for free.
`TreeKeys` replaces exactly one part and is 100 lines including its key map.

## Watch out
- **`icon:` takes a function** — `icon: () => icon("folder")`. A View built at the call
  site appends itself to whatever box is capturing right then.
- **Prototype defaults, not class fields.** View renders inside its constructor, so a
  class field on a subclass arrives *after* the first draw and `render()` never sees it.
- **Don't shadow View.** `toggle()`, `text()`, `show()`, `hide()` are View's; that is why
  the parts say `flip()`, `label()`, `caret()` — [`doc/decisions.md`](/framework/ux/Tree/doc/decisions/)
- **`draw()` resets open rows and the selection** to whatever the new data says. Inherited
  from the template on purpose; diffing is complexity for "the caller owns the data".
- **`ui/` must never import this.** Imports flow down, and that cycle breaks only on a
  deep reload — [`ux/doc/system.md`](/framework/ux/doc/system/)

## More
- [Overview](/framework/ux/Tree/) — the file explorer, master-detail · [keys](/framework/ux/Tree/keys/) — the keyboard subclass · [words](/framework/ux/Tree/words/) — the same explorer under `ui-contrast ui-compact` · [drag](/framework/ux/Tree/drag/) — `TreeDrag`, grip-drag reorder with a `moved(node, into, at)` writer seam
- [`doc/decisions.md`](/framework/ux/Tree/doc/decisions/) — the split argued, every name that had to dodge View, what the graduation cost, and what is parked
- [`ui/tree`](/framework/ui/tree/) — the template half, and the `tree()` function this grew out of · [`ux/`](/framework/ux/) — the tier
- Files: `Tree.js` (the class + both parts), `TreeKeys.js` (the extension), `TreeDrag.js` (drag-reorder, on `ext/Draggable`), `Tree.css`
