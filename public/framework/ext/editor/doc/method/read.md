Default: `return null`. `History` is app-level and knows nothing about `Item` —
the editor supplies the real one at construction: `read: () => JSON.stringify(doc)`.

## Trap: a `History` built without `read`/`restore` is silently inert

`act()` still pushes, `undo()` still pops and still returns `true` — it just
moves `null`s and no-ops between the two stacks, and nothing visibly fails. If a
future caller reuses `History` for something else and forgets to pass both
functions, undo will *look* wired up (buttons enable, `can_undo()` flips true)
while doing nothing. There is no warning for this today.
