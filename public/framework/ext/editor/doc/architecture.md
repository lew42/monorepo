# editor architecture — one document, whole-snapshot undo, and a panel shell

The editor is a page you visit, not a module you import. Its main class is `History` ([`History.js`](../History.js)) for undo; the widget and its five regions live in [`page.js`](../page.js); the blocks it builds are in [`blocks.js`](../blocks.js). The document is an `Item` tree, and each node gets a `Sortable` view.

## Undo is whole-document snapshots

**Decided:** `history.act(fn)` stores the whole document as JSON before `fn` runs, and undo restores it by hydrating a new tree.
**Why:** every Ctrl+Z is then a live test of the same reload path, with no second serializer to keep in step.
**Instead:** a command stack behind the same `act()` signature; it buys finer undo granularity the editor does not need yet.
**Detail:** [doc/decisions.md](./decisions.md)

## `swap()` moves everything onto the new tree at once

**Decided:** `swap(json)` hydrates a new tree, then re-attaches the saver, re-binds the listeners, redraws, and saves.
**Why:** `Item.hydrate` returns a new tree, so the saver, the listeners, the canvas and the selection must all move together or a live editor writes to a document nobody sees.
**Instead:** patching the old tree in place, which cannot be done safely for a whole-document restore.
**Detail:** [doc/decisions.md](./decisions.md)

## Selection is an id, never a node

**Decided:** the selection is stored as an id; `nodes` (id → view) is rebuilt on every `draw()`, and `doc.find(id)` recovers the Item.
**Why:** after an undo every object in the document is a different object, so a remembered node or Item is detached.
**Instead:** holding the Item or its view, which goes stale on the first undo.
**Detail:** [doc/decisions.md](./decisions.md)

## Structure redraws; every change saves

**Decided:** `change` calls `changed()` (save and badge only). `add`, `remove`, `move` and `order` also call `draw()`.
**Why:** a properties edit fires `change`; a redraw there would replace the element the properties region is holding.
**Instead:** redraw on every event, which breaks the properties panel on each chip click.
**Detail:** [doc/decisions.md](./decisions.md)

## One line chooses the saver

**Decided:** `store(path, key)` returns a `FileSaver` on localhost and a `LocalStorageSaver` everywhere else. The read-only badge follows the boolean that `save()` resolves to.
**Why:** off localhost there is no dev socket, so `FileSaver` writes nothing; only a `false` from `save()` is an honest signal that nothing was written.
**Instead:** one saver for both cases, which would show "saved" on the deployed site when nothing persisted.
**Detail:** [doc/decisions.md](./decisions.md)

## A block is data, not a component

**Decided:** a block's styling is `data.words` (a class string) and `data.css`; a leaf is a block with `data.text`, and only a container gets `$items`.
**Why:** the utility vocabulary is then the design, and undo and reload carry the styling for free.
**Instead:** a component per block type, which would need a second styling system.
**Detail:** [doc/decisions.md](./decisions.md)

## The properties panel writes the element; `sync()` copies it back

**Decided:** `ext/layout`'s controls change the element. `sync()` copies its classes and inline style back onto the Item, skipping `drag-items`.
**Why:** this is `ext/layout`'s contract. `drag-items` is `Sortable`'s mark, re-added on every render, and saving it would grow the class string on each reload.
**Instead:** having the controls write the Item directly, which would make two sources of truth.
**Detail:** [doc/decisions.md](./decisions.md)

## Drags are undoable; property edits are not

**Decided:** a drop runs inside one `history.act()`, so a drop that lands nowhere adds no snapshot. Text edits in a block also use `act()`. Property edits from `ext/layout` persist but do not push a snapshot.
**Why:** a slider fires dozens of `input` events, and each would become its own undo step.
**Instead:** one snapshot per gesture (on `pointerdown`), which is not built yet.
**Detail:** [doc/decisions.md](./decisions.md#open)

## The shell is a panel workspace with its own vocabulary

**Decided:** the five regions are a workspace-local `T` vocabulary passed to `workspace({ saver, templates, seed })`, not entries in `ext/Panel`'s global one.
**Why:** otherwise editor state would reach a module that must not know the editor exists, and every panel on the site would offer `canvas`.
**Instead:** adding the regions to `ext/Panel/templates.js`, or assigning `draw` onto each panel after load (it fights `paint()`).
**Detail:** [doc/shell.md](./shell.md)

## Drag targets are checked by root

**Decided:** a drop target must share the same root tree as the dragged item (`target.item?.root() === this.item.root()`).
**Why:** `Draggable.registry` is one document-wide map, so a panel could be dropped into a block, and two trees would cross.
**Instead:** a separate registry per tree, which would duplicate the drag code.
**Detail:** [doc/shell.md](./shell.md)

## No live preview on the wall card

**Decided:** the framework wall shows the plain default card for the editor, not a rendered sketch of the saved document.
**Why:** a rendered preview spilled across the page on first paint, and the zoom could not lock onto a width.
**Instead:** a live preview, which needs the sizing solved first.
**Detail:** [doc/decisions.md](./decisions.md)

## More
- [`doc/decisions.md`](./decisions.md) — the full design record: rulings, traps, open items
- [`doc/shell.md`](./shell.md) — the workspace shell in full
