# List — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

The ordered collection behind `item.items`. About fifty lines, **zero imports**,
headless. Every [Item](/framework/core/Item/) owns one with itself as the `owner`; userland
mutates through Item verbs (`add`, `remove`, `move`) and never calls this class
directly. Built to the council ruling of 2026-08-13
(`framework/ai/2026-08-13/persistence/requirements.md`).

## Traps

- **⚠ `adopt()` sets `parent` to the `owner`, not to the list.** That is the
  whole reason `owner` exists: a child's parent is the **Item**, so walking up
  for a saver or a root never steps over a collection. The version that set
  `parent = list` needed a no-op `adopt` override on every list subclass to undo
  itself. Full argument: [adoption.md](adoption.md).
- **⚠ `insert_before` takes a NODE, not an index**, and a `ref` that is `null` or
  absent from this list appends. That is what makes `item.move()` node-relative,
  which is what makes off-by-one impossible.
- **⚠ `remove()` takes out the first occurrence only.** Duplicates in one list
  are normal and each is its own node.
- **⚠ Mutating emits on the owner, and `Item.emit` bubbles.** So `list.append()`
  is heard at the document root. Nothing here schedules a render; a redraw is one
  listener at the top.

## Verdicts

**Does `List` exist at all, or are children a plain Array?** Steve dissented for
the Array — an Array is already ordered, iterable and JSON-serializable, and
every method here is a thinner version of one it already has. The owner's directive
and two seats kept the class: `adopt` and `owner` have to live somewhere, and on
an Array they become free functions the call site must remember to call. **Kept,
minimal** — and the dissent is recorded because it is a good argument.

**Reactive variants — `filter_reactive`, `sort_reactive`, `group_by_reactive`,
`index_by`?** Cut. Executed: each subscribes `on('change')` to every item it
sees, with **no disposal path anywhere** — a long-lived document leaks a listener
per row per derived view, and a derived list of a derived list compounds it. The
replacement is `[...list].filter(…)` at the call site plus one root listener,
which is three lines and disposes when the closure does.

**`List.View`, `changed()`, `update()`, a `views[]` registry?** All cut. One
render scheduler in the framework is enough, and it is not in core. `List` is
data.

**`toJSON()` returns a bare array**, not `{ children }` — so an Item's envelope
reads `"items": [ … ]` with no wrapper, and `JSON.stringify` recurses with no
custom logic at the call site.

## Used by

- **[`Item`](/framework/core/Item/)** — the only real caller. Every `Item` builds
  `this.items = new List({ owner: this })` in its constructor; nothing else in
  the framework constructs a `List` directly. **A class with one caller, and
  that caller is the class it was extracted from** — see this pair's audit for
  whether that earns `List` its own module.
- **[`ext/Draggable`](/framework/ext/Draggable/)** — its demo page imports
  `List` only to assert `root.items instanceof List` in a check; `Draggable`
  and `Sortable` themselves import neither `Item` nor `List`.

## Open

- `each` / `find` / `index_of` are thin wrappers over the array. They stay
  because they are the vocabulary the Item verbs read in; if a second collection
  type ever appears, they are the seam. If one never does, they are three lines
  to delete.
