`step(this.future, this.past)` — the exact mirror of [`undo`](./undo.md), stacks
swapped. Returns `false` when there is nothing to redo.

Only reachable while the redo stack is non-empty, which [`act`](./act.md) empties
on every new action — so `redo()` only ever replays a future that has not since
been overwritten.
