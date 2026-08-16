`pointermove`. The `this.dragging &&` guard lives on the listener itself
(Draggable.js:22), so by the time this runs it's unconditional: computes
`(dx, dy)` from the grab point and hands it to the overridable `move(dx, dy, e)`.
