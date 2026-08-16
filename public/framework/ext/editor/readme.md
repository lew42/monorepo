# editor — design record

A drag-and-drop builder assembled from the wave-1 stack and nothing else: an
[`Item`](../../core/Item/) tree, one [`Sortable`](../Draggable/) per node,
[`ext/layout`](../layout/)'s word vocabulary as the properties region, a
[`Saver`](../Saver/) holding the document — and a second, separate `Saver`
holding the shell, which is a [`Panel`](../Panel/) workspace. Four source files —
`blocks.js` (the palette), `History.js` (undo), `editor.css`, and `page.js` (the
widget and its doc page, at 318 lines the largest in the framework).

```
palette --> insert()  --.
canvas  --> Sortable  --+--> history.act(fn) --> fn mutates the Item tree
layers  --> select(id) -'                         |
props   --> ext/layout words --> sync() ----------'
                                                  v
                          doc emits "change"/"add"/"remove", bubbling to the root
                                     |                      |
                          changed() --> saver.save(doc)     draw() (structure only)

/data/editor.json        the document      Item tree of Blocks
/data/editor-panels.json the arrangement   Item tree of Panels   <- never meet
```

Undo runs the arrow backwards: `history.restore(snapshot)` calls the editor's
`swap()`, which hydrates a **new tree**, re-attaches the saver, re-binds the
listeners, redraws and re-resolves the selection by id.

## The shell is a panel workspace

`workspace({ saver, templates, seed })` — the editor's five regions are a
**workspace-local** `T` vocabulary rather than entries in `ext/Panel`'s global
one, so no editor state ever reaches a module that must not know the editor
exists. Full record, including the two rejected alternatives and the shared drag
registry: [`doc/shell.md`](./doc/shell.md).

## Who uses it

**Nothing.** No code outside this directory imports `History`, any of
`Block`/`Section`/`Grid`/`Card`/`Text`, or `BLOCKS` — all zero-caller — and the
`editor()` widget in `page.js` is not exported at all, so it cannot be embedded,
constructed, or named in an import from anywhere else. The only thing that wires
this module into the site is [`framework/ext/page.js`](../)'s `children:` string,
which is what makes `/framework/ext/editor/` a route. [`ext/LayoutTool`](../LayoutTool/)'s
audit crawl lists that url, and a handful of `ai/` task pages and
[`ext/Panel/page.js`](../Panel/)'s "Next:" line link to it in prose — none of that
is code calling in. (One near-miss: `ai/2026-08-12/apps/page.js` imports a
same-named `editor` — that's an unrelated sandbox file, `apps/editor/page.js`, a
grep false positive, not a caller of this module.)

This module is consumed exactly one way: as a page a person visits. See the
audit's verdict on what that means for where it should live.

## Decisions

**Undo: whole-document snapshots** (council ruling 11). `act(fn)` pushes *before*
mutating and restores through the same `hydrate` path a reload takes — so every
Ctrl+Z is a live test of the round trip, and there is no second serializer to
keep honest. A command stack is the recorded escalation path behind the same
`act()` signature; it buys granularity this does not need yet.

**Does `swap()` save?** Ruling 11 says history never saves, and `History.js`
holds no saver — but the editor's `swap()` does call `changed()`. An undo you
cannot reload is not an undo, and the alternative leaves the file on disk holding
a state the screen is no longer showing. The coupling the ruling forbids —
`save()` touching history — does not exist either way.

**One visible line chooses the saver** (ruling 15). `FileSaver` on localhost, a
`LocalStorageSaver` off it, because off localhost the socket is disabled and
`write` resolves `false`. The read-only badge is driven off that return value and
nothing else: a `false` from `save()` is the only honest signal that nothing was
written.

**A block is data, not a component.** `words` is a class string in `data`, so the
utility vocabulary *is* the design, the properties panel is `ext/layout`'s
existing registry rather than a parallel one, and undo/reload carry the styling
for free. A leaf is a block whose `data.text` exists — one question, not a flag —
and only a container is given `$items`, so nothing can be dropped into a
sentence.

**The drag goes through `act()`, chips do not.** `Node.release` wraps
`Sortable.release` in one `history.act()`; a drop that lands nowhere pushes no
snapshot. Property edits persist but are **not** undoable: a slider fires fifty
`input` events and each one would be its own snapshot. Recorded rather than
solved — see Open.

## Traps

- **⚠ Selection is an id, never a node.** `Item.hydrate` returns a new tree, so
  after one undo every object in the document is a different object and a
  remembered `$node` or `Item` is detached. `nodes` (id → view) is rebuilt by
  every `draw()`; `doc.find(id)` recovers the Item from any tree.
- **⚠ `swap()` is one function on purpose.** The saver, the autosave listener,
  the canvas and the selection all move onto the new tree together. A half-done
  swap is a live editor writing to a document nobody can see.
- **⚠ `handle: false`, not `null`.** `Draggable` fills the handle with `??=`, so
  the document root — which is a drop site with nothing to grab — needs a real
  `false`. `grip && $bar` produces one; `item.parent && $bar` would produce
  `undefined` and give the whole canvas a grip.
- **⚠ Only structural events redraw.** `change` saves but must not redraw, or a
  chip click would replace the very element the properties panel is holding.
- **⚠ The properties panel writes to the ELEMENT, not the Item** — that is
  `ext/layout`'s whole contract. `sync()`, on the panel's own bubble-phase
  `click`/`input`, copies the element's classes and inline style back onto
  `data.words` / `data.css`, which is what serializes. `drag-items` is filtered:
  it is `Sortable`'s mark, re-added on every render, and persisting it would grow
  the class string by a word per reload.
- **⚠ `blocks.js` is imported for its side effect.** Its last line registers the
  four types; an unregistered type is an unimported one and hydrates as a plain
  `Item` (preserved and warned, never dropped).

## Open

- **`page.js` is 318 lines carrying three jobs** (widget, regions, doc page) —
  see [`doc/file/page.js.md`](./doc/file/page.js.md) for the split this argues
  for, and the fact that it is also the fix for "no importable door."
- **Property edits are not undoable** (Decisions, above). The fix is a snapshot
  per *gesture* — `pointerdown` on the panel — which also pushes for a
  pointerdown that edits nothing. Neither shape has earned its way in yet.
- **A first-ever load logs one 404** for `/data/editor-panels.json` before the
  seed is written. `FileSaver.load()` is a plain `fetch`; `ext/Panel` has had the
  same property since it shipped.
- **Multi-select, copy/paste, and the multi-document UX** (`/data/index.json` as
  an Item document) are deferred by the council spec, not by this file.

Fuller, ranked ledger across this module and `ext/Panel` together, with severity
and status per item: [Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/).
