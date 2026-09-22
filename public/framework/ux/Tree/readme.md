# Tree — nested rows you can open, drag and drill into. One class; everything else is a switch

Rows from a plain array, or straight from a `Page`'s children. The keyboard is always on.
Drag, the drill-down and the row buttons are properties you set.

## Use
```js
import Tree from "/framework/ux/Tree/Tree.js";

new Tree({ nodes, selected_change(node){ … } });                       // a tree
new Tree({ nodes, drag: true, onMove({ node, into, index }){ … } });   // + drag
new Tree({ nodes, adapt: true });                                      // + drill-down
new Tree({ nodes, acts: "default add remove", onAct(name, node){ … } });  // + row buttons

Tree.from(page);        // a page's children, as a tree of links
t.draw(nodes);          // re-render from fresh data
t.select(node, true);   // select, and fire — `true` is what a click passes
```
`nodes: [{ icon?, text, href?, open?, default?, children? }]`. A row with `href` is an `<a>`;
anything else is a `<div>`. `children` is an array, **or a function** that answers one — then
that branch fetches its children the first time you open it.

**Your case is a subclass, never an option.** Parts hang off the constructor — `Tree.Item`
(the `<li>`), `Tree.Row` (the clickable line), `Tree.Drag` (one row's drag) — and are reached
through `this.constructor`, so replacing one gives you the rest of the machine for free.

## Watch out
- **The tree never writes.** A drop reports `move({ node, into, index })`, a button reports
  `act(name, node)`, and that is all it does — you splice your own data. `index` is already
  counted *without* the dragged node in it.
- **A row is three drop targets** — top edge above, middle inside, bottom edge below — and
  the edge is a third of the row capped at 10px. Override `holds(node)` to say what can take
  a drop inside it. [`doc/decisions.md`](/framework/ux/Tree/doc/decisions/)
- **`adapt` re-folds on selection, not on a chevron.** Opening a branch by hand to peek at it
  still works; the next selection folds around the new path.
- **`draw()` resets open rows and the selection** to whatever the new data says. Write what
  is open back onto the nodes first if you want it kept — one line, and the module page shows it.
- **`icon:` takes a function** — `icon: () => icon("folder")`. A View built at the call site
  appends itself to whatever box is capturing right then.
- **Prototype defaults, not class fields.** View renders inside its constructor, so a class
  field on a subclass arrives *after* the first draw and `render()` never sees it.
- **Don't shadow View.** `toggle()`, `text()`, `show()`, `hide()`, `load()` are View's; that
  is why the parts say `flip()`, `label()`, `caret()`, `grow()`.
- **`ui/` must never import this.** Imports flow down, and that cycle breaks only on a deep
  reload — [`ux/doc/system.md`](/framework/ux/doc/system/)

## More
- [Overview](/framework/ux/Tree/) — the five-level tree, live · [compare](/framework/ux/Tree/compare/) — the three trees that existed, and why this one won · [keys](/framework/ux/Tree/keys/) · [words](/framework/ux/Tree/words/) · [drag](/framework/ux/Tree/drag/) — the three targets
- [`doc/decisions.md`](/framework/ux/Tree/doc/decisions/) — the merge argued, the edge model's measurement, what `adapt` is in four lines, and what is parked
- [`ui/tree`](/framework/ui/tree/) — the template half, and every `.ui-tree-*` rule · [`ux/`](/framework/ux/) — the tier
- Files: `Tree.js` (the class and all three parts), `Tree.css` (the grip, the drop cues, the buttons), `TreeKeys.js` / `TreeDrag.js` (back-compat shims — the keyboard is in the base now, and drag is `drag: true`)
