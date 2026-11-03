`pointercancel`, and `Escape` rides the same path — a cancelled gesture is
treated as the OS saying the user didn't mean it, never as a drop: `end()` then
`restore()`, nothing in between. That is the entire reason it's four lines —
[`doc/verdicts.md`](../../verdicts/) has the alternative considered.

Guarded by `if (!this.dragging) return`, since `pointercancel` can fire for a
pointer that was never dragging.
