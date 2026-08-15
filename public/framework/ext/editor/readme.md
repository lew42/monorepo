# editor — design record

A drag-and-drop builder assembled from the wave-1 stack and nothing else: a
[`Item`](../../core/Item/) tree, one [`Sortable`](../Draggable/) per node,
[`ext/layout`](../layout/)'s word vocabulary as the properties region, a
[`Saver`](../Saver/) holding the document — and a second, separate `Saver`
holding the shell, which is a [`panel`](../Panel/) workspace. Four files —
`blocks.js` (the palette), `History.js` (undo), `editor.css`, and `page.js` (the
editor and its doc page).

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
listeners, redraws, and re-resolves the selection by id.

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

## Verdicts

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

## The shell is a panel workspace

### Where does an editor region's `draw` live?

**Options.** (a) Put `palette`/`canvas`/… into `ext/Panel/templates.js`, the
global `T` vocabulary. (b) Assign a `draw` onto each hydrated `Panel` by
template name after `Item.open`. (c) Hand `workspace()` a workspace-local
registry.

**Verdict: (c),** `workspace({ saver, templates, seed })` — three keys, one
call. (a) puts editor state in a module that must not know the editor exists,
and shows `canvas` in the `T` menu of every panel on the site. (b) fights
`paint()`, which resolves `item.data.template ? template.draw : item.draw` — a
region has to *persist* its name, so it must go through `data.template`, and
then only a registry can answer it. In `ext/Panel` the registry is one instance
property on the **root** `Panel` (`root.templates`), read by `vocab(item)` =
`item.root().templates ?? templates`; it never serializes, exactly like `saver`
and `parent`.

Two behaviours fall out of the same predicate, `vocab(item) === templates`:
a workspace with its own regions is offered **no `random`** (rolling would give
an editor two canvases) and **no per-body `layout.bar`** (its regions carry the
controls, and the floating bar sits over the corner they use).

### Editor state stays in the closure

Each region is `{ draw(){ … } }` closing over `doc / sel / nodes / history`, and
its first act is to assign the `$var` the painters write to. So **every painter
is guarded** (`$layers?.empty(…)`): a region the arrangement does not currently
show has no body, and closing the canvas must not stop the layers list working.
Verified — with `canvas` closed, layers, properties and the badge all still run.

### Two drag systems, one registry

`Draggable.registry` is a single `WeakMap` for the document, so `locate()`
happily offered a `Panel` an editor `Block` as a drop target and vice versa —
one `item.move()` and the two trees cross. The guard is one clause in each
`drop_check`: `target.item?.root() === this.item.root()`. It also closes a live
defect on `/framework/ext/Panel/`, where a workspace panel could be dropped into
the `panel(fn)` demo lower down the same page.

### The saver chooser is now a two-line helper

`store(path, key)` applied twice, rather than the ternary written out twice.
Ruling 15 wants the `LocalStorageSaver` mount **visible in one line**; it is,
and there is one of it instead of two to keep in step.

## Open

- **A hugging panel's body measured 0px** until `panel.css` gained
  `.panel.hug > .panel-body { flex: 0 0 auto }` — the status strip was invisible.
  That is a change to another module's stylesheet, forced by measurement.
- **Two canvases over one document** is undefined behaviour, as the brief
  allowed: the last one drawn owns `$canvas`, the other goes stale until the next
  structural redraw. A region registry keyed by *instance* rather than by name is
  the fix if it ever matters.
- **Three bars of chrome** stack above the palette (root, row, leaf). Every
  `Panel` draws a bar, including splits, and an editor is four levels deep.
- **A first-ever load logs one 404** for `/data/editor-panels.json` before the
  seed is written. `FileSaver.load()` is a plain `fetch`; `/framework/ext/Panel/`
  has had the same property since it shipped.
- **Property edits are not undoable** (above). The fix is a snapshot per
  *gesture* — `pointerdown` on the panel — which also pushes for a pointerdown on
  panel chrome. Neither shape earned its way in yet.
- **`page.js` is 318 lines**, the longest in the framework, because it carries the
  editor widget, its six regions *and* its doc page. The natural split is
  `editor.js` beside a thin `page.js`; it was not made because this module
  shipped as a fixed five-file set, and the region registry makes the case
  stronger, not weaker.
- **Two redraws per drag.** `item.move()` emits `remove` then `add`, and both are
  bound to `draw()`. Correct, and one frame wasteful.
- **One `keydown` listener per document, never removed.** An `isConnected` check
  keeps a routed-away editor from eating the shortcut; a real teardown would need
  a Page lifecycle hook that does not exist.
- **Multi-select, copy/paste, and the multi-document UX** (`/data/index.json` as
  an Item document) are deferred by the council spec, not by this file.
