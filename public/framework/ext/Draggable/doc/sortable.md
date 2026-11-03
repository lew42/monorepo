# Sortable — what it adds on top of Draggable

`Sortable extends Draggable` and shares its pointer capture and hit-testing
whole. What it changes: `release()` is overridden outright — it never calls
`Draggable.drop()` — because it commits a **position**, computed by `locate(e)`,
rather than reacting to a single target.

## The visuals Draggable doesn't have

A ghost (a cloned node, `pointer-events: none`, that follows the cursor) and a
placeholder (a live element marking the landing slot). `start()` creates both,
`move()` repositions the ghost and re-locates the placeholder, `end()` removes
both. The real node never moves — it just wears `.drag-source` (hidden by
`draggable.css`) for the duration. That is the whole reason
[`Draggable.cancel()`](../api/cancel/) is four lines: there is nothing to put back.

## `locate(e)` → `{ list, before }`

`before` is an `Item` or `null` (append) — **never an index**, so off-by-ones
can't happen. `list` is the destination **`Sortable`**, not its `Item`: the
registry holds Sortables, and "the innermost registered container" — what
[`under()`](../api/under/) returns first — is literally what got found.
`list.item` is read at commit time.

`before(e, dragged)` walks `$items.el.children` and returns the first row whose
midpoint the cursor hasn't reached yet — vertical only (`clientY`), so a
horizontal list isn't supported. `row(item)` is the inverse lookup: which
element carries a given `Item`, used to place the placeholder next to the right
sibling.

## The coupling is one method, deliberately

Neither `Draggable.js` nor `Sortable.js` imports `Item` or `List`. The whole
coupling to the tree is `item.move(parent, before)` on the commit side, and
whatever `drop_check` you write on the filter side. `page.js` imports both
classes only because a demo needs something real to move. Why two classes and
not one: [`doc/verdicts.md`](./verdicts.md).
