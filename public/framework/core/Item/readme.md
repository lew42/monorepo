# Item — one node of a persistent document tree; the base class for anything that nests and saves (Panel, editor Block)

## Use

```js
const doc = await Item.open(new FileSaver({ path: "/data/doc.json" }));
doc.add(new Item({ data: { text: "Hello" } }));
doc.save();
```

Wire format is four keys — `{ type, id, data, items }`; all user state lives under `data`. Headless, runs in node.

## Watch out

- Register every subclass (`Item.register(Class, name)`) — `Item.names` is an inverse Map, so an unregistered subclass serializes under its parent's wire name: [doc/decisions.md](./doc/decisions.md).
- `contains()` excludes self — guard a drop with `target !== this && !this.contains(target)`: [doc/method/contains.md](./doc/method/contains.md).
- Constructors do no I/O; `Item.open(saver)` is the one async entry: [doc/method/open.md](./doc/method/open.md).
- Warnings fire once per message — clear `Item.warned` to re-hear them: [doc/decisions.md](./doc/decisions.md).
- A child's `save()` delegates up and persists the whole document, never its subtree: [doc/method/save.md](./doc/method/save.md).

## More

- [Overview](/framework/core/Item/) — the page asserts every claim on load; red is a broken framework.
- [doc/envelope.md](./doc/envelope.md) — the envelope, unknown types, what is deliberately excluded.
- [doc/decisions.md](./doc/decisions.md) — the council ruling, verdicts, traps in full, who uses Item.
- `doc/method/*.md`, `doc/property/*.md` — one page per verb and field, each with its trap.
- Files that matter: `Item.js` (the class), `page.js` (live assertions), `../List/List.js` (the ordered collection).
