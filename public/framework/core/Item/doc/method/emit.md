Calls every listener on **this** node for `event`, then calls
`this.parent?.emit(event, ...args)` — so the same event fires again on the
parent, and the one above that, all the way to the root. A listener on the root
hears every `"change"` in the whole document without subscribing to any single
node.

**⚠ Listeners are snapshotted before calling** (`.slice().forEach(...)`), so a
listener that unsubscribes itself or adds a new listener mid-emit sees a
consistent list rather than skipping or double-firing.

This is the entire event system: no event bubbling phases, no
`stopPropagation`, no capture. A listener that wants to stop the bubble cannot —
by design, since the whole point is that a document-root autosave and a
canvas-root redraw are each **one listener**, and a mid-tree listener silently
swallowing a change would break both.
