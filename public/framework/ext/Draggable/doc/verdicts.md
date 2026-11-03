# Verdicts — the trade-offs behind Draggable and Sortable

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
`Draggable.drop()`. [How they split the work.](./sortable.md)

**What does `locate()` return?** `{ list, before }`, where `before` is an `Item`
or `null` (append) — never an index, so off-by-ones cannot exist. `list` is the
destination **`Sortable`**, not its Item: the registry holds Sortables, "the
innermost registered container" is literally what was found, and the container is
also what knows its own rows (`before()`, `row()`). Commit reads `list.item`.
Mixed types in one pair is the cost; the alternative was an Item→element map that
nothing else needed.
