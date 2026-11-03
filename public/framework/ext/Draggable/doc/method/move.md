Blank on purpose. Called on every `pointermove` while dragging, with the
**cumulative** `(dx, dy)` from the grab point — not a delta since the last call.
`Sortable.move()` repositions the ghost by transform and re-locates the
placeholder; the [Draggable alone](/framework/ext/Draggable/overview/draggable-alone/)
demo does the same transform in one line with no ghost at all.
