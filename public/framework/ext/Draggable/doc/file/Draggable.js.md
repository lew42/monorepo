## What this file is

The base class: grab a `View`, track a pointer-captured gesture, hit-test what's
underneath, and call four blank methods (`start`, `move`, `drop`, `restore`) for
a subclass to fill in. No visuals of its own — `.dragging`/`.drag-handle` are the
only classes it ever touches. 99 lines, and every method on the class page: see
the [API tab](/framework/ext/Draggable/api/).

## Why it's separate from `Sortable.js`

Grab-and-move and reorder-a-collection are different jobs, not versions of the
same one — `Sortable` overrides `release()` outright rather than extending it.
Splitting the files keeps that visible: this one has no ghost, no placeholder,
no idea what a list is. Full reasoning: [`doc/verdicts.md`](/framework/ext/Draggable/doc/verdicts/).

## The registry is the one piece of shared state

`Draggable.registry`, a static `WeakMap<Element, Draggable>`, is what makes
`under()` able to answer "which registered instance is under the cursor" without
either side of a drag knowing about the other in advance. Every instance —
handle or not — adds itself in `initialize()`.

## Two traps worth knowing before editing this file

- **`handlers` is stored so `destroy()` can find the exact function references**
  `addEventListener` was given — `view.on()` wraps callbacks in a new arrow each
  time, which `removeEventListener` can never match.
- **Pointer capture, not a `document` listener**, is why there is no cleanup
  path to forget: every later event in the gesture already targets the handle.

## Improvements

1. **The four stub methods have no JSDoc on their parameters.** `move(dx, dy, e)`
   documents `dx`/`dy` as cumulative-from-grab only in the method's own doc page,
   not in the source — a reader skimming the file alone could reasonably guess
   "delta since last call." *(simple, important)*
2. **`escape` is a property, not inside `handlers`**, so `destroy()` and `end()`
   each remove it separately by hand rather than through one loop. Folding it in
   would need the loop to special-case `window` vs. `this.handle.el` as the
   target, which is arguably why it wasn't done. *(simple, useful)*
3. **No horizontal-drag concession anywhere in this file** — it's `Sortable`'s
   `before()` that hardcodes `clientY`, but a base class aiming to stay reusable
   for a horizontal list would need `move`'s contract to say more than "cumulative
   dx, dy." *(medium, speculative — no current caller needs it)*
