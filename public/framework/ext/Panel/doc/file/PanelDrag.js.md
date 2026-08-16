## PanelDrag.js

`PanelDrag extends Sortable` and nothing else: what a pointer drag does to the
tree. Grabbing a panel by its handle, resolving where it lands, and the edge
zones that let a drop *divide* a leaf rather than reorder its parent. The
divider is `grip.js`; the controls are `toolbar.js`.

## Three things that make the edge-drop honest

- **`drop_check()` tests the root, not just containment.** `Draggable.registry`
  is one `WeakMap` for the whole document, so without `target.item?.root()
  === this.item.root()`, a panel could drop into an unrelated `Item` tree
  sharing the page (the editor's block tree, or a second `panel(fn)` demo
  further down the same doc page). `contains()` is strict, so `target !== this`
  is not redundant either.
- **`edge()` runs before `locate()` would ever let it.** `locate()` resolves
  the innermost registered *container* under the cursor, and a leaf isn't
  one — so the enclosing split always wins a plain `locate()` call over a
  leaf. Testing the edge first, and only in the outer fifth (`EDGE = 0.2`) of a
  leaf's body, is what makes "drop near the edge of a leaf" reachable at all.
- **The placeholder is absolutely positioned into the target's own body**
  (`show_edge()`), rather than measured against the page — `.panel-body`
  already establishes containment, so no wrapper element or colour is
  needed for the zone. `show()` clears the inline `position`/`inset` again, so
  the two modes cannot leak into each other.

## `before()` walks DOM children, so it must skip the grips

The axis is the destination's — `item.get("dir") !== "col"` — so one scan reads
either a row of columns or a column of rows. ⚠ The dividers are children of
`.panel-items` too and carry no `Item`, which is what the
`Draggable.registry.get(el)` miss is filtering out.

⚠ `start()` clears the placeholder's px height: `Sortable` sizes it for a
vertical list, and here `flex-basis` (`panel.css`) does the job on whichever
axis it lands in.

⚠ **The handle is the grip alone, never the bar** — `new PanelDrag({ handle:
$handle ?? false, … })` in `workspace.js`, where `$handle` is `toolbar.js`'s
`handle()`. A handle that owned the whole bar would swallow every button's
`pointerdown` before the click ever fires.

## Improvements

1. **`edge()` calls `this.drop_check(box, e)` with two arguments; `drop_check`
   takes one.** Harmless today — the extra argument is ignored — but it reads
   as if the check were position-aware and it is not. Delete the `e`. *(simple,
   useful)*
2. **`show_edge()`'s `60%` is written four times**, once per branch, alongside
   `EDGE`'s `0.2` at the top of the file. Two numbers describing the same
   gesture, one named and one not. *(simple, useful)*
3. **`edge()` and `show_edge()` are the two riskiest functions here and have no
   doc page walking through the five-way math** (`Math.min(x, 1-x, y, 1-y)`). A
   worked example — one set of coordinates, what `dir`/`before` it resolves to —
   would save the next reader from re-deriving it. *(medium, useful)*
