# Relation to core/Item

The owner's own words: "I know the item... class like core/item is based on persistence.
However, those could be kind of merged together, but also they could be kind of separate."

This looks at both and recommends: **keep them separate.** Not touched — `core/Item` itself is
untouched by this task, on purpose (the brief's own rule).

## What each one actually is

| | `core/Item` | `ui/item` (this module) |
|---|---|---|
| Runs where | Headless — node or browser, no DOM at all | Browser only — it IS a DOM row |
| Holds state | Yes — `data`, `items` (a `List`), a `parent`, listeners (`on`/`emit`) | No — the browser's own `<details open>` is the only state, and that's native, not this module's |
| Wire format | `{ type, id, data, items }`, saved through a `Saver` | None — nothing to save, nothing to load |
| Used for | A node of a document that PERSISTS: Panel, an editor Block | One line on a screen: an icon, a name, maybe a right end, maybe a fold |

They share an English word by coincidence, not by design: `core/Item` is a fact about **data**
("this thing is part of a saved tree"); `ui/item` is a fact about **a row's own markup**
("this element is an icon, a name and an end, laid out one way"). A `core/Item` never draws
itself — something else (`ext/Panel`'s views) reads its data and builds DOM. `ui/item` never
persists anything — it has nothing to persist.

## Why not merge

1. **Different layers would gain baggage they don't need.** Every `core/Item` subclass (Panel,
   an editor Block) would carry a DOM factory it may never call; every plain `ui.item()` call —
   most of them, on most doc pages — would drag in `List`, a `Saver` contract and an `id` nobody
   asked for. `core/` runs in node today (`core/Item/readme.md`: "headless, runs in node") —
   importing `ui/item.js`, which touches `document.createElement` on its very first line via
   `View`, would break that outright.
2. **The wire format is a contract with real callers already.** `{ type, id, data, items }` is
   read by `Item.open()`, every `Saver`, and `Item.register()`'s name table. Folding a rendering
   concern into that class risks a field colliding with `data` (a saved item that happens to have
   a property called `icon` or `name` already, for its own reasons) — a coincidence-of-name bug
   exactly like the ones `code.js`'s "Names that collide with core" section warns about, one
   layer down.
3. **Nothing is lost by keeping them apart.** A `core/Item`-backed tree that wants to LOOK like
   `.item` rows can already do that the way `ux/Tree` wears `ui/tree`'s `.ui-tree-*` classes: the
   behavior class reads its own data and calls `ui.item({ icon: node.icon, name: node.text, … })`
   for each row. That is a normal import, not a merge — and it is the natural next step if
   `ext/Panel` or an editor Block ever wants this look, which this task does not build.

## The recommendation

**Keep `core/Item` (persistence) and `ui/item` (a row's markup) as two separate, unmerged
things.** If a persisted tree (Panel, a future editor) wants to render its nodes as `.item` rows,
its own view class calls `ui.item()` per node — the same relationship `ux/Tree` already has with
`ui/tree`, and no change to either module.
