# draggable — design record

Two classes. `Draggable` is grab-and-move: pointer capture, hit-testing, a
`drop_check` on the dragging instance, and a `cancel()` that commits nothing.
`Sortable extends Draggable` is reorder-a-collection: a ghost, a placeholder, and
`locate(e)` → a **position** rather than a target, so reorder, cross-list and nest
are one code path ending in `item.move(parent, before)`.

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
- **Nothing real moves during a drag.** The ghost and the placeholder move; the
  live node just wears `.drag-source`. That is why `cancel()` is four lines.
- **A re-render leaves orphaned instances.** Rebuilding the view drops the old
  elements, and the registry is a `WeakMap`, so they collect. Call `destroy()`
  only when you keep the element and want the drag off it.

## Verdicts

**Pointer capture, or document listeners?** Options: capture (all later events
return to the handle) vs. binding `document` on pointerdown. **Capture, held for
the whole drag** — there is no listener to leak and no teardown to get wrong. The
cost is that `e.target` becomes the handle, which forces the next decision.

**Hit-testing: `e.target`, or `elementsFromPoint`?** `e.target` is free but wrong
under capture, and the usual fix — `pointer-events: none` on the live element —
mutates the thing being dragged and lies to anything else reading the DOM.
**`document.elementsFromPoint`, filtering out the dragged view by hand.** It also
gives "innermost registered container" for free: the returned chain is already
ordered innermost-first. The one element that *is* `pointer-events: none` is the
ghost, which exists only to be looked at.

**Where does the filter live — a target-side `accepts`, or a dragging-side
`drop_check`?** **On the dragging instance.** One override covers type checks,
capacity, modifier keys and the cycle guard; a target-side filter would need every
container to know every payload. `Sortable.locate()` routes each candidate
container through `drop_check`, so a single override governs both the placeholder
you see and the move that commits — the preview cannot disagree with the drop.

**Does `pointercancel` commit?** Options: treat it as a drop, or as an abort.
**Abort** — a cancelled gesture is the OS saying the user did not mean it. Escape
rides the same `cancel()`, so there is one restore path, not two.

**One class or two?** Merging them was proposed. **Two.** Grab-and-move and
reorder-a-collection are different jobs, not versions: `Sortable` overrides
`release()` outright because it commits a *position*, and never uses
`Draggable.drop()`.

**What does `locate()` return?** `{ list, before }`, where `before` is an `Item`
or `null` (append) — never an index, so off-by-ones cannot exist. `list` is the
destination **`Sortable`**, not its Item: the registry holds Sortables, "the
innermost registered container" is literally what was found, and the container is
also what knows its own rows (`before()`, `row()`). Commit reads `list.item`.
Mixed types in one pair is the cost; the alternative was an Item→element map that
nothing else needed.

## Deferred

**Edge bands.** `locate()` picks a container, then a slot by child midpoints. Near
the top or bottom edge of a nested container the intended target is often the
*parent*, and midpoints alone cannot say so. The refinement — a few pixels of
outer band that resolve to the parent — is deliberately not here: `locate()` is a
single overridable method precisely so it can arrive as one replacement rather
than as flags on this one.

Also deferred: horizontal lists (the midpoint test is `clientY` only),
multi-select, and auto-scroll when the cursor nears the edge of a scrolling box.
