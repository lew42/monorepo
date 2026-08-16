The redo stack — the mirror of [`past`](./past.md). `[]` in the constructor,
and emptied by every [`act()`](../method/act.md): a new action invalidates
whatever redo history pointed at a future that no longer follows from here.
