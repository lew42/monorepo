# Draggable — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Two classes. `Draggable` is grab-and-move: pointer capture, hit-testing, a
`drop_check` on the dragging instance, and a `cancel()` that commits nothing.
`Sortable extends Draggable` is reorder-a-collection: a ghost, a placeholder, and
`locate(e)` → a **position** rather than a target, so reorder, cross-list and nest
are one code path ending in `item.move(parent, before)`. What each adds on top of
the other: [`sortable.md`](./sortable.md).

Neither file imports `Item` or `List`. The whole coupling is `item.move()` and
whatever `drop_check` you write. `page.js` imports both, because a demo needs
something real to drag.

```js
new Sortable({ view: $node, handle: $bar, $items, item });   // a row, and a box rows land in
new Sortable({ view: $node, handle: false, $items, item });  // drop site only — nothing to grab
```

## Traps

- **`handle: false`, not `handle: null`.** `??=` fills in `null` and `undefined`
  alike, so `null` silently becomes `this.view` and your column grows a grip.
- **A container's `$items` must be inside its `view.el`.** Hit-testing walks the
  chain `elementsFromPoint` returns; a rows-box parked outside the registered
  element is never found and the container is undroppable.
- **The descendant guard is yours to write.** `Draggable.drop_check` defaults to
  `target !== this` and stops there. `Item.contains()` is *strict* — `contains(this)`
  is false — so the working guard is both halves:
  `target !== this && !this.item.contains(target.item)`. Without it, dropping a
  container into its own child makes a cycle inside ten minutes.
- **One `Draggable.registry` for the whole document.** A page with more than one
  `Sortable` tree needs a *third* clause — `target.item?.root() === this.item.root()`
  — or a drag can cross from one tree into the other. Both real callers
  (`ext/Panel`, `ext/editor`) add it; this module's own demo doesn't need to,
  because it only ever shows one tree. Copy the three-part version, not the demo's.
- **Nothing real moves during a drag.** The ghost and the placeholder move; the
  live node just wears `.drag-source`. That is why `cancel()` is four lines.
- **A re-render leaves orphaned instances.** Rebuilding the view drops the old
  elements, and the registry is a `WeakMap`, so they collect. Call `destroy()`
  only when you keep the element and want the drag off it.

## Decisions

Pointer capture over document listeners, `elementsFromPoint` over `e.target`,
the filter living on the dragging instance rather than the target, `pointercancel`
as an abort not a drop, two classes rather than one, and what `locate()` returns
and why — each one weighed, with the alternative and its cost:
[`verdicts.md`](./verdicts.md).

## Deferred

**Edge bands.** `locate()` picks a container, then a slot by child midpoints. Near
the top or bottom edge of a nested container the intended target is often the
*parent*, and midpoints alone cannot say so. The refinement — a few pixels of
outer band that resolve to the parent — is deliberately not here: `locate()` is a
single overridable method precisely so it can arrive as one replacement rather
than as flags on this one.

Also deferred: horizontal lists (the midpoint test is `clientY` only),
multi-select, and auto-scroll when the cursor nears the edge of a scrolling box.

## Who uses this

- **[`ext/Panel`](/framework/ext/Panel/)** — `PanelDrag.js` extends `Sortable`
  outright and reads `Draggable.registry` directly to find the panel on either
  side of a drop, for the drag-to-repane gesture.
- **[`ext/editor`](/framework/ext/editor/)** — `page.js`'s `Node` extends
  `Sortable` to reorder and reparent the demo tree the editor shell shows.

Both are real subclasses, not callers of a public function — `Sortable` is meant
to be extended, not configured, and these are the only two places that do.
