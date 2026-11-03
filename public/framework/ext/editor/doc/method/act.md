Pushes the current snapshot, then runs `fn`. Every mutation to the document goes
through this — the drag handler wraps `super.release(e)` in it, a text edit wraps
the `set("text", …)` in it.

## Push happens before `fn` runs

The snapshot on the stack is the state undo goes back **to**, not the state after.
Push-after would make the first undo a no-op — it would restore the state `fn`
just produced.

## A new act clears redo

`this.future.length = 0` — you cannot redo a future that no longer follows from
here. This is the ordinary undo-tree rule (branching kills the abandoned branch),
not something specific to this class.

## What is *not* wrapped in `act()`

Anything that calls `history.act()` becomes undoable; anything that mutates the
document without going through it does not. The editor's property panel (`sync()`,
on the panel's own `click`/`input`) is the deliberate example — see
[Open](../../readme.md#open) in the readme.

## Improvements

1. **No guard against a re-entrant `act()`.** Calling `act()` from inside the `fn`
   of an outer `act()` would push twice and only pop once on undo. Nothing in this
   module does that today. *(simple, speculative — no reproduction)*
