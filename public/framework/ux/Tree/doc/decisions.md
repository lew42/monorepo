# Tree — decisions

Landed 2026-08-21, the first `ux/`. Task log:
[`ai/2026-08-21/ux-tree/`](/framework/ai/2026-08-21/ux-tree/).

## What the listeners actually were

The graduation rested on a claim two audits disagreed about, so it was settled first. A
shallow inventory reported *no event listeners anywhere in `ui/`*; the deeper audit
reported click listeners in `tree.js`. The deeper one is right, and the disagreement is
mechanical: `tree.js` installs its listeners through **View's `.click()` helper**, which
calls `addEventListener` inside `core/View`. A grep for `addEventListener` across `ui/`
returns nothing while two listeners are live.

There were exactly two — one on the `▸` (`stopPropagation`, then flip the open class), one
on every row (select and fire) — plus a `rows` Map and a `selected_row` in the closure, and
`update()`/`select()` bolted onto the returned View. All three graduation criteria, in
forty lines.

**The lesson generalises past this module:** in a framework whose base class wraps
`addEventListener`, "does it have listeners" cannot be answered by grepping for the DOM
API. Grep for the wrapper.

## Splitting, and why it had to be additive

The rule was already written: the CSS stays. What decided the *shape* of the split was the
caller census — `ext/Playground/Playground.js` imports `tree` straight from
`/framework/ui/tree/tree.js` and uses both the factory and `.select()`. It sits outside
this task's fence, and a graduation that breaks a live rail is not a graduation.

So `tree()` stays, byte-compatible, and `class Tree` is **new code beside it** rather than
a replacement of it. The class imports `ui/tree/tree.js` for its stylesheet — a `ux`
importing a `ui` template, the direction that is allowed — and wears the same
`.ui-tree-*` classes, so the two tiers cannot drift apart while both exist.

Rejected: making `tree()` markup-only (breaks Playground's tree rail today), and filing a
proposal that leaves Playground broken until someone applies it. The remaining cost is
~45 lines of closure living on in `ui/` until `ext/Playground` takes the class — a
one-line import change, and the only thing blocking it is fence, not design.

## The names that had to dodge `View`

Every method on a `View` subclass shadows the base class silently. Three would have:

| the obvious name | what it would have broken | shipped as |
|---|---|---|
| `Item.toggle()` | `View.toggle()` — show/hide by computed style | `flip()` |
| `Row.text()` | `View.text()` — the getter/setter every caller uses | `label()` |
| `Row.toggle()` | same as the first, on the `▸` | `caret()` |

`render()` is the one deliberate override: on a `View` it *is* the hook. (On a `Page` it
collides — that warning is about `Page`, not `View`.)

`classify()` adds a class for every constructor in the chain, so these emit `.tree`,
`.tree-item`, `.tree-row`, `.tree-keys`, `.tree-keys-row`. All five were censused against
the live CSS before the first line was written; the only near hit is `ext/demo`'s
`.tree-preview`, which needs that exact token. **A subclass name here is a class name on
the page** — the same trap that gave a playground's `Rail` the page sidebar's shape.

## State on the instance, defaults on the prototype

`View`'s constructor runs `assign()`, `prerender()` and `initialize()` — so the whole
render happens **inside `super()`**, before a subclass's class fields initialize. A
`tag = "ul"` field arrives too late to make a `<ul>`. Defaults go on the prototype, the
way `View` itself declares `capture`.

## Parts as statics: what it actually bought

`Tree.Item` and `Tree.Row` hang off the constructor and are reached through the live class
(`this.constructor.Item`, `this.tree.constructor.Row`). `TreeKeys` sets **one** static:

```js
TreeKeys.Row = class TreeKeysRow extends Tree.Row { … };   // tabindex, and a focus listener
```

`Tree.Item` travels down the chain untouched, and `Tree.Row` is unaffected, so a plain
`Tree` still has no tab stops. Rows-in-DOM-order came free too: `rows` is a `Map` and
items are built depth-first, so `[...rows.values()]` is the row order the arrows walk —
`TreeKeys` added no state of its own for it.

**The keyboard map is a property, not a switch.** `TreeKeys.prototype.keys` maps a key
name to a method name, so a subclass adds a gesture in one line without touching `key()`.

## Visibility is asked of the DOM, never of layout

`moves()` finds the reachable rows with
`.ui-tree-item:not(.ui-tree-open) > .ui-tree-children .ui-tree-row`, not with
`offsetParent` or a rect. A hidden tab evaluates fine and does not lay out — every
geometry read comes back frozen — and the roving index has to be right there too.

## The one CSS rule

`.ux-tree-keys .ui-tree-row:focus` — `:focus`, not `:focus-visible`, because the focus is
*moved by script* on an arrow key and whether that counts as "visible" is a UA heuristic.
Negative `outline-offset`, because the framework's positive 3px is drawn outside the row
and a 14em rail clips it. Everything else a tree looks like is the template's, and both
tiers read the same tokens, so a config word re-skins either one.

## Parked

- **`TreeDrag` (drag-reorder).** Built 2026-08-21 as designed here — see below.
- **ARIA.** No `role="tree"` / `aria-expanded`. Half a set of roles reads worse than none,
  and `aria-expanded` has to be kept in sync with `flip()`, which is a real design pass
  rather than three attributes.
- **`ui.tree`'s eventual removal.** Whether `tree()` and the `ui.tree` entry go once
  `ext/Playground` moves is the owner's call, not this task's.

## TreeDrag, built (2026-08-21)

The design above held: `class TreeDrag extends Tree`, one static replaced
(`TreeDrag.Row`), zero changes to `Tree.js` or `TreeKeys.js`. Task log:
[`ai/2026-08-21/ux-treedrag/`](/framework/ai/2026-08-21/ux-treedrag/).

**Reuse call — `ext/Draggable`'s `Sortable`, extended, not hand-rolled.** Kept whole:
pointer capture, the ghost, the placeholder, Escape-cancels, and the `.drag-source`
inline-display fix (`ext/Draggable/doc/decisions.md`, 2026-08-19) — the previously
debugged half. Overridden: `Sortable.release()` commits through `item.move()` against a
`core/Item` tree, and `TreeDrag`'s nodes are the same plain, parent-less data `Tree`
already reads — the exact reason this design parked a `moved(node, into, at)` writer
instead of a mutator. `before()`/`row()` also assume a container's *direct* children
**are** the registered draggables — true for `ext/Panel` and `ext/editor`'s flatter
shapes, false here: a row sits inside an `<li>` beside its own `<ul class="ui-tree-
children">`, one layer removed. `locate()` is hand-rolled from the target row's own
rect instead of an `$items` container — the middle half of a branch row's height reads
as "into", the rest as "before/after" that row — and `release()`/`show()` follow it.

**A dedicated grip, not the whole row.** `Draggable.grab()` calls `start()` on *every*
pointerdown, no movement threshold — a whole-row handle hides the row and shows the
ghost on a plain click-to-select, and because the row's `<li>` collapses out from under
the still-hidden row, the layout reflows *during* the click and `release()`'s hit-test
can land on a neighbour, firing a spurious `moved()`. `ext/Panel`'s own handle is "the
grip alone, never the bar" for the same reason, stated but not explained there — traced
here from `Draggable.js`'s own event order rather than from a bug report. TreeDrag ships
a small `⠿` grip (`.ux-tree-drag-grip`); the row's existing click-to-select is
untouched.

**The writer contract.** `moved(node, into, at)` — `into` is the parent node the row
lands under (`null` for the root list), `at` is the index it lands at **after** removal
from wherever it was, so the caller's own splice-out-then-splice-in never adjusts for
its own shift. `TreeDrag` never touches `nodes`; the demo (`ux/Tree/drag/page.js`) is
the worked caller.

**What it cost.** `TreeDrag.js` is under 160 lines for three parts (`TreeDrag`,
`TreeDrag.Row`, `TreeDrag.Drag`) plus two small pure functions — `contains()` (the
descendant guard, node-data shaped, since there is no `Item.contains()` here) and
`locate_parent()` (nodes carry no parent pointer, so "whose child is this" is a walk,
re-derived at every commit rather than stored). `TreeKeys` needed neither: it inherited
rows-in-DOM-order for free. That is the one piece of `Tree`'s "state on the instance,
never on the node" design (above) that a mutating extension pays for and a read-only
one (`TreeKeys`) does not.

Proved headless (`ai/2026-08-21/ux-treedrag/`, screenshots in the same dir): drop onto a
folder appends inside (`drag-into-*.png`), drop between two siblings reorders with the
insertion line visible mid-drag (`drag-between-*.png`), Escape mid-drag leaves the tree
byte-identical (`drag-escape-*.png`), and the printed `moved()` payload matched every
shot. `/framework/ux/Tree/` and `/keys/` re-verified at 360 and 3440: zero overflow,
zero non-LiveReload console errors, one Enter-selects proof on `/keys/` still passes.
