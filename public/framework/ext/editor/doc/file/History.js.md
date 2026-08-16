App-level undo (council ruling 11): 47 lines, no dependency on `Item`, `Draggable`
or anything else in the editor. Two stacks, four public methods
([`act`](../method/act.md), [`undo`](../method/undo.md), [`redo`](../method/redo.md),
[`step`](../method/step.md)) and two overridable hooks
([`read`](../method/read.md), [`restore`](../method/restore.md)) that default to
inert no-ops.

## Why undo lives here and not on `Item`

Restoring a snapshot **replaces the whole tree** — `Item.hydrate` returns a new
object graph — so only the thing holding the saver, the listeners and the
selection can put it back together. `Item` has no opinion about any of that; this
class has no opinion about `Item`. See [`page.js`](./page.js.md)'s `swap()`.

## History never saves

Deliberate (readme Decisions): `act()`/`step()` touch only the two stacks. The
editor's own `changed()` — called from `swap()` — is what writes to disk, kept as
a separate call rather than a parameter here, so this file stays reusable for
anything that wants undo without a persistence opinion.

## Improvements

1. **No cap on `past`.** A very long session keeps every snapshot for the page's
   life — see [`past`](../property/past.md). *(simple, useful)*
2. **A `History` with no `read`/`restore` looks wired up while doing nothing** —
   see [`read`](../method/read.md). One `console.warn` in the constructor when
   either is missing would make the mistake loud. *(simple, useful)*
3. **Command-stack undo** (the readme's own recorded escalation path) would trade
   whole-document snapshots for a list of inverses, buying granularity — smaller
   history entries, mergeable edits — at the cost of every mutation needing a
   matching inverse. Not warranted while the document stays small. *(large,
   speculative)*
