# Tree architecture — one class, and everything else is a switch

`ux/Tree` turns an array of nodes (or a `Page`'s children) into nested rows that you can open, drag and drill into. Its one class is [`Tree.js`](../Tree.js) (`class Tree extends View`), with three parts hung off it as statics: `Tree.Item` (the `<li>`), `Tree.Row` (the clickable line) and `Tree.Drag` (one row's drag). The keyboard is always on. The tree never writes your data; it reports what happened and you change your own nodes.

## One class; features are properties, not subclasses
**Decided:** a tree has one class. Drag, drill-down (`adapt`), row buttons (`acts`) and the drop rule are properties you set on that class.
**Why:** three sibling trees (arrows, drag, the page CMS's own) meant no tree could have both, so the CMS wrote a fourth.
**Instead:** `TreeKeys` and `TreeDrag` as subclasses, which kept the split but could not combine ([`TreeKeys.js`](../TreeKeys.js) and [`TreeDrag.js`](../TreeDrag.js) survive only as name shims).
**Detail:** [doc/decisions.md](./decisions.md#what-the-listeners-actually-were)

## Parts are reached through the live class
**Decided:** a row, item or drag is built as `this.constructor.Row` / `this.constructor.Item`, so a subclass that replaces one part gets the rest of the machine.
**Why:** a subclass's own parts must be used wherever the tree builds them (`TreeKeys` replaces only `Row`, and the rest comes along).
**Instead:** a plain `Tree.Row` reference, which a subclass could not replace.
**Detail:** [doc/decisions.md](./decisions.md#parts-as-statics-what-it-actually-bought)

## Prototype defaults, not class fields
**Decided:** every default (`tag`, `classes`, `indent`, `drag`, `adapt`, `acts`, `keys`) is set on the prototype.
**Why:** `View` renders inside its constructor (`super()`), so a class field on a subclass arrives after the first draw and `render()` never sees it.
**Instead:** class fields, which fail silently: the `<ul>` simply never gets its tag.
**Detail:** [doc/decisions.md](./decisions.md#state-on-the-instance-defaults-on-the-prototype)

## Method names dodge View
**Decided:** the row and item methods are `flip()`, `label()` and `caret()`, never `toggle()` or `text()`.
**Why:** every method on a `View` subclass silently shadows View's own `toggle()`, `text()`, `show()`, `hide()` and `load()`.
**Instead:** the obvious names, which broke View's show/hide and text getter for every caller.
**Detail:** [doc/decisions.md](./decisions.md#the-names-that-had-to-dodge-view)

## Visibility is asked of the DOM, never of layout
**Decided:** the reachable rows are found by a CSS selector (`.ui-tree-item:not(.ui-tree-open) > .ui-tree-children .ui-tree-row`), not by `offsetParent` or a rect.
**Why:** a hidden tab evaluates but does not lay out, so every geometry read comes back frozen and the arrow-key order would be wrong.
**Instead:** geometry checks, which are right only in a visible tab.
**Detail:** [doc/decisions.md](./decisions.md#visibility-is-asked-of-the-dom-never-of-layout)

## Keys are a map on the prototype
**Decided:** `Tree.prototype.keys` maps a key name to a method name (`ArrowDown: "next"`, `Enter: "choose"`), and the keyboard listener is installed by the base class.
**Why:** a subclass adds one gesture in one line without touching the key switch.
**Instead:** a `switch` in `key(e)`, which every gesture change had to edit.
**Detail:** [keys](/framework/ux/Tree/keys/)

## A row is three drop targets; the edge is capped
**Decided:** the top edge of a row drops above it, the middle drops inside it, the bottom edge drops below it. The edge is a third of the row, capped at 10px.
**Why:** measured in Make: with "anywhere on a row means inside", the only place to drop *before* a row was the 4px gap between rows. The cap keeps the middle, which is nesting, the biggest target.
**Instead:** a fraction with no cap, which made the edges too large on tall rows. A node that cannot hold children has no middle; the row splits in half so it can still be reordered against.
**Detail:** [drag](/framework/ux/Tree/drag/) · [doc/decisions.md](./decisions.md#the-three-targets-which-is-makes-model)

## The tree never writes: one event each for drop and button
**Decided:** a drop calls `move({ node, into, index })`, a row button calls `act(name, node)`, and the tree changes nothing. `index` is counted after the dragged node is taken out.
**Why:** the consumer owns its data, so it is the only place that can splice safely; the tree never needs to know above/inside/below.
**Instead:** the tree splicing its own nodes, which would make the consumer's own splice-out-then-splice-in correct for a shift it never made.
**Detail:** [doc/decisions.md](./decisions.md#one-event-and-the-tree-never-writes)

## Adapt folds around the selection, and is off by default
**Decided:** with `adapt: true`, each selection shuts every branch, then reopens the path from the root to the selected row, the row included. Chevrons still work between selections.
**Why:** a five-level tree reads as a wall; the path-only view is short at every depth. Off by default, because a tree the user opened by hand should stay as they left it.
**Instead:** every branch open (138 rows on the five-level demo, against 12 with `adapt`), or chevrons alone.
**Detail:** [doc/decisions.md](./decisions.md#adapt-the-whole-thing-is-four-lines)

## A function `children` loads once, on first open
**Decided:** a branch whose `children` is a function fetches its children the first time it opens, then writes the array back onto the node so a later `draw()` keeps them.
**Why:** a 50-module subtree should cost one level on arrival, not the whole tree.
**Instead:** loading everything up front. `Tree.from(page)` still loads one level through `load_all_children(1)`.
**Detail:** [`Tree.js`](../Tree.js) `grow()`

## The one CSS rule is the drop cue
**Decided:** the template's `ui/tree` styles draw the tree; this module's [`Tree.css`](../Tree.css) adds the grip, the drop-target outline (`.ux-tree-drag-target`, outline offset `-2px`) and the buttons.
**Why:** the outline sits inside the row, because a 14em rail clips an outline drawn outside it.
**Instead:** a positive offset, which the rail clipped.
**Detail:** [doc/decisions.md](./decisions.md#the-one-css-rule)

⚠ The decisions log still names a `.ux-tree-keys .ui-tree-row:focus` rule with a negative outline offset. No such rule exists in the repo today (`rg ux-tree-keys` finds nothing in any `.css`); the keyboard focus ring comes from `ui/tree`. Trust the code.

## Parked
**Decided:** no ARIA roles yet (`role="tree"`, `aria-expanded`), and `ui.tree`'s removal waits for the Playground to move.
**Why:** half a set of roles reads worse than none, and `aria-expanded` must track `flip()` in a real design pass.
**Instead:** adding the roles now, which would be wrong until that pass is done.
**Detail:** [doc/decisions.md](./decisions.md#parked)
