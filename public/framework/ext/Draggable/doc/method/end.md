The shared teardown for every way a gesture ends — drop, restore, or cancel:
clears `dragging`, removes the `Escape` listener, releases pointer capture.
Never called directly; only `release()` and `cancel()` call it.

**Usage** — `Sortable.end()` calls `super.end()` first, then removes its own
ghost and placeholder. The base class's job here is the pointer bookkeeping
only, never the visuals — those are `Sortable`'s to add.
