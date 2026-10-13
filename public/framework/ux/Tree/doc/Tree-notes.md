# Tree.js — design and API notes

## Class overview

ONE tree, and everything a tree does is in it.

```js
const t = new Tree({ nodes, selected_change(node){ … } });        // a tree
new Tree({ nodes, drag: true, onMove({ node, into, index }){ … } });   // + drag
new Tree({ nodes, adapt: true });                                 // + drill-down
Tree.from(page);                                                  // a page's links
```

## Data structure

`nodes: [{ icon?, text, href?, open?, default?, children? }]`. A row with `href` is an `<a>`; anything else is a `<div>`. `children` is an array, or a FUNCTION that answers one (a promise counts) — then the branch loads the first time you open it.

## Keyboard navigation

The keyboard is always on — ↑ ↓ move, → ← open/shut and step, Enter selects, Home/End jump — through a roving tabindex, so the whole tree is ONE tab stop rather than thirty. It used to be a sibling subclass of the drag one, which meant no tree could have both; that is the merge (doc/decisions.md, 2026-09-17).

## Tree behavior and extensibility

The tree never writes. A drop reports `move({ node, into, index })` and a row button reports `act(name, node)`; what either MEANS is the consumer's — Make moves a page, a nav rail re-orders links. Parts hang off the constructor (`Tree.Item`, `Tree.Row`, `Tree.Drag`) and are reached through the LIVE class, so a subclass swaps one piece and inherits the rest of the machine.

## Implementation notes

### draw()

Throw the DOM away and rebuild — open rows and the selection reset to what the new data says. Diffing to preserve them is real complexity for "the caller owns the data" (see ui/tree/doc/decisions.md).

### focus_row()

⚠ `false` — a rebuild runs inside the constructor the first time, before the element is in the document, and focusing a detached node silently does nothing.

### item()

`up` is the Item this one hangs under — undefined at the root. Set here rather than walked out of the DOM, so "go to my parent" is one property, which is what `adapt_to()` and ← both walk.

### branch()

Has it anything to show when you open it? A FUNCTION is a data source, so it is a branch before a single child has loaded — the same shape `core/Page` took for `children:` (core/Page/doc/data-children.md).

### holds()

Can a drop land INSIDE it? An empty folder is still a folder; a leaf that has never been able to hold anything is not. Override for a tree where everything holds everything — a page tree, where any page can hold pages.

## Stylesheet

The `.ui-tree-*` stylesheet is the TEMPLATE's and stays in `ui/` — splitting is the usual answer, not moving (ux/doc/system.md). This import is for that stylesheet: the class wears ui/tree's classes, so the two tiers cannot drift apart. A ux imports a ui template; ui NEVER imports a ux.
