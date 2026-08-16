The class, entire — about 120 lines, one import (`List`). A node in a
persistence tree: identity (`id`), payload (`data`), children (`items`), events
(`on`/`emit`), the mutation verbs (`add`/`remove`/`move`), the save delegation
(`save`/`delete`), and the whole serialization boundary
(`toJSON`/`hydrate`/`wire`/`register`).

## Why one file and not several

Every piece here is small and every piece depends on the others — `move()`
needs `contains()`'s cycle awareness to be usable safely, `wire()` needs the
`register()` maps, `hydrate()` needs `wire()`'s inverse. Splitting this into
`Item.tree.js` / `Item.persist.js` / `Item.events.js` was not attempted; at 120
lines there is no seam that would make three files easier to hold in your head
than one.

## The two module-level helpers

`is_data(value)` and `warn(message, key)` sit outside the class, below it, as
plain functions — not statics, not private class fields. Neither needs `this`,
and neither is part of the public contract; putting them outside the class is
what makes that visible without a comment saying so.

## The three statics at the bottom

`Item.types`, `Item.names`, `Item.warned` are assigned *after* the class body,
not as class-static fields inside it — a stylistic choice consistent with "no
class fields" appearing elsewhere in this framework (see `ext/doc`'s own
`Doc.js` for the same avoidance, for the same reason: fields initialize after
`super()`, and nothing here wants that ordering risk even though `Item` has no
subclass-timing hazard itself). `Item.register(Item)` on the last line
registers the base class under its own name, so `wire()` never falls through to
`constructor.name` for a plain, un-subclassed `Item`.

## Improvements

1. **`find(id)` walks the entire tree even after a match.** `walk()` has no
   early exit, so a large document pays full-tree cost for every lookup. A
   `find` that threw a sentinel (or a `walk` that accepted a "stop" return
   value) would fix it in a few lines. *(simple, useful — matters once a
   document has hundreds of nodes, not before.)*
2. **`List.find(fn)` and `Item.find(id)` share a name with unrelated
   contracts** — one is a flat one-level predicate search, the other a
   recursive id lookup. A reader who knows one guesses wrong about the other.
   Renaming `List.find` (e.g. `first`) is a two-line, zero-caller change today.
   *(simple, useful.)*
3. **No cycle guard inside `move()` itself.** Every real caller (`ext/Draggable`)
   guards with `contains()` first, but the method trusts them to. Adding the
   guard here would make the unsafe call impossible instead of merely
   discouraged, at the cost of a duplicate check on the (common) path where the
   caller already checked. *(simple, important — this is the one place a
   silent infinite structure could enter the tree.)*
4. **`Item.warned` never clears itself.** A long-lived session (an editor left
   open for hours) that hits the same malformed input twice will only ever
   warn once, ever — which is the intended behavior for noise, but means a
   developer who missed the first warning has no second chance short of a
   reload. *(medium, speculative — only bites during active debugging.)*
