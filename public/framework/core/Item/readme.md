# Item — design record

One node of a persistent document tree: a `data` bag, an ordered `items`
[List](../List/), an id, and a saver somewhere up the chain. No view, no
transport, no DOM — it runs in node. Built to the council ruling of 2026-08-13
(`framework/ai/2026-08-13/persistence/requirements.md`), which was decided by
*executing* frozen-helix's `Item0-9` rather than reading it.

```js
const doc = await Item.open(new FileSaver({ path: "/data/doc.json" }));
doc.add(new Item({ data: { text: "Hello" } }));
doc.save();
```

The wire format is four keys — `{ type, id, data, items }`, `items` omitted when
empty. `page.js` asserts every claim below on load; red there is a broken
framework.

## Traps

- **⚠ `Item.names` is an inverse Map, not a static on the class.** A
  `Class.type` static would be **inherited**, so an unregistered subclass would
  silently serialize under its parent's wire name and hydrate as the wrong class.
- **⚠ `contains()` excludes self.** `drop_check` needs both guards:
  `target !== this && !this.contains(target)`. One without the other still lets
  you build a cycle in the first ten minutes of nesting.
- **⚠ Construction does no I/O and never will.** A saver's `load()` used to land
  *after* the subclass constructor and wipe its field defaults. `Item.open()` is
  the one async entry: load → sync `hydrate` → attach saver.
- **⚠ Warnings are once per message.** A 500-node malformed document warns once,
  not 500 times — so an unknown type you meant to register is easy to miss on a
  second reload. `Item.warned` is the set; clear it to re-hear them.

## Verdicts

**Where does `save()` go — up, or here?** Executed defect: a child's `save()`
overwrote the whole document with its own subtree. Options: every node owns a
saver / saver inherited by copy / **delegate up**. Delegation: `own saver ?
saver.save(this) : parent.save()`, so a child asking to save persists its
*document*, and per-subtree savers fall out free with no inheritance step.

**Envelope nested, or `data` spread flat?** Flat is prettier and rejected: a user
key named `items` would collide with the tree, and a convenience needing a
deny-list is not one. All user state lives under `data`.

**Dirty tracking?** Cut entirely. It gated saves on *field* changes and silently
suppressed structural ones — a reorder-only document never persisted. Saving is
document-level: something changed, write the document. The delta seam is the
Saver's `write(item)`, later `write_ops(ops)`.

**Unknown type — drop, throw, or keep?** Keep, unanimous. Hydrates as a plain
`Item` with its wire name retained, warns once, re-saves losslessly. A document
you cannot open is worse than one you cannot fully edit. `hydrate` is tolerant of
every malformed input in the same spirit: missing id assigned, duplicate id
freshened, non-array `items` and non-object `data` warned past.

**`items`, not `children`.** Deliberately distinct from `Page.children`, which is
a named nav Map; an Item's collection is ordered and duplicates are normal.

**ids at construction** (`crypto.randomUUID()`). Selection across a canvas
re-render, History restore and duplicate-block all need a stable handle, and
`Date.now()` collides inside 1ms. Steve dissented (none in MVP); overruled.

**Events on Item, bubbling** — not a `views[]` registry and not `changed()`.
Root autosave is then one listener. Undo is *not* here: it is app-level
`History` in `ext/editor`, whole-document snapshots restored through this same
hydrate path, so every Ctrl+Z is a live test of the round trip.

## Open

- One deviation from the ruling, recorded: the spec's `_saver`/`_type` are
  spelled **`saver`** and **`type`** — the constructor keys the same spec names,
  so `new Item({ saver })` works with plain assign. Same semantics, one name.
- `Item.js` carries the ruling's one unavoidable import (`../List/List.js`).
  Still headless and node-runnable; see `../List/readme.md`.
