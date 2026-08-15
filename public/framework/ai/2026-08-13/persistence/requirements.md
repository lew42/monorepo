# Persistence + List + Drag stack — agreed API (design council, 2026-08-13)

Three-seat council (Steve/Eric/Tim, opus, forked off a shared library of
frozen-helix's Item0-9 / List0-8 / Savers / File / Dir / Component / Draggable
plus this repo's View/Page/Socket). All three seats **executed** the prior art
rather than tracing it. Five confirmed defects drove the rulings: a child's
`save()` overwrites the whole document; structural changes never mark anything
dirty so a reorder-only document never persists; `Item9` undo is off by one
against its own readme; an async saver's `load()` lands after the subclass
constructor and wipes field defaults; the full round trip destroys children on
the second save. Raw reports: session scratchpad `council/*/report.md`
(machinery, not committed). This file is the conclusion.

## Rulings on the contested questions

1. **List exists, minimal.** (Steve dissented: children-as-plain-Array. Mike's
   directive and 2 seats keep it.) ~50 lines, zero imports: `children` array,
   `append` / `insert_before(child, ref)` / `remove` (first occurrence only),
   `each` / `find` / `index_of` / `length` / `Symbol.iterator`, `owner` +
   `adopt` (`child.parent = this.owner ?? this` — kills the Item4List no-op
   subclass), `toJSON() → [...children]`. **No** derived/reactive variants
   (executed: they leak listeners, zero disposal path), **no** List.View, **no**
   second render scheduler. Userland mutates through Item verbs, never
   `item.items.append` directly.
2. **Events live on Item and bubble** (Steve's addition, adopted). `on/off/emit`;
   `emit` walks the parent chain. List mutators notify through
   `owner?.emit("add"|"remove", child)`. Root autosave is then one listener:
   `doc.on("change", …)` etc. No `views[]` registry, no `changed()/update()`.
3. **Saver delegation, not inheritance** (Eric's, adopted — fixes executed
   data-loss F4). `item.save()` → own `_saver` if set, else `parent.save()`,
   else resolve `false`. A child asking to save persists its *document*.
   Per-subtree savers fall out free.
4. **No I/O in any constructor** (Tim's hard requirement, adopted — fixes F2).
   Construction is pure and synchronous. The one async entry:
   `Item.open(saver)` → `saver.load()` (json|null) → sync `Item.hydrate` →
   attach saver → root. Pages use the blessed shapes: return the promise, or
   build DOM inside `append(() => …)` callbacks — never a factory call after
   `await`.
5. **Envelope, nested:** `{ type, id, data, items }`, `items` omitted when
   empty. (Eric's flat spread rejected — a user key named `items` must not
   collide; a convenience needing a deny-list is not one.) All user state lives
   under `data`. `parent` is an instance property and instance properties are
   never serialized — backrefs are impossible by construction, restored by
   adoption during hydrate.
6. **`items`, not `children`** — deliberately distinct from `Page.children`
   (a named nav Map); an Item's collection is ordered with duplicates normal.
   The divergence is on purpose and recorded here.
7. **Registry:** `Item.types` static Map; `Item.register(Class, name =
   Class.name)` as the last line of the module that defines the class. The
   optional wire-name is the rename seam. Not App-level, not Saver-level.
   A document's owner imports its block types explicitly (`import
   "./blocks.js"`) — an unregistered type is an unimported one.
8. **Unknown type: preserve, warn once, never drop or throw** (unanimous, and
   Tim's #1 guard). Hydrates as plain `Item` with `_type` retained; re-save
   round-trips it losslessly. `hydrate` is tolerant of every malformed input
   (missing id → assigned; duplicate id → fresh + warn; non-array items /
   non-object data → warn, node survives).
9. **ids: `crypto.randomUUID()` at construction when absent** (Steve dissented:
   none in MVP). Selection across canvas re-render, History restore, and
   duplicate-block all need a stable handle; `Date.now()` collides within 1ms.
10. **Dirty tracking: cut entirely** (Tim's 6-line variant declined). It gated
    saves on field changes and silently suppressed structural ones (executed
    F5). Saving is document-level: something changed → write the document.
    The delta/multi-client seam is the Saver's `write(item)`, later
    `write_ops(ops)` on a backend that wants it.
11. **Undo: app-level `History` in ext/editor, ships in v0** (Eric's, adopted;
    Steve wanted deferral; Tim's command stack is the recorded escalation path
    behind the same `act()` signature). Whole-document JSON snapshots,
    `act(fn)` pushes *before* mutating; undo/redo restore via the same
    hydrate path — so every Ctrl+Z is a live test of the round trip. `save()`
    never touches history; history never saves.
12. **Drag: two classes.** `Draggable` (pointer capture kept + hit-testing via
    `document.elementsFromPoint` — no `pointer-events:none` on the live
    element, no document-listener bookkeeping; `drop_check` on the *dragging*
    item, default `target !== this`; **`pointercancel` → `cancel()` restores
    and does not commit** — Tim's hill, adopted; Escape rides the same path)
    and `Sortable extends Draggable` (ghost + placeholder + `locate(e)` →
    `{ list, before }` — a *position*, resolved to the innermost registered
    container, so reorder / reparent / nest are one code path; commit is
    `item.move(...)`). Steve's one-class merge declined: grab-and-move and
    reorder-a-collection are different jobs, not versions.
13. **`item.move(parent, before = null)`** — the builder's one mutation verb:
    remove + insert_before + reparent, node-relative (index arithmetic
    off-by-ones cannot exist), `null` appends. `drop_check` must reject
    descendants: `!this.contains(target)` guard — first ten minutes of nesting
    otherwise produce a cycle.
14. **File and Dir: deleted** (unanimous). A file is a saver's `path` string;
    the server already mkdirs recursively on write. `directory.json` stays a
    dev-server nav feed (`ext/files` remains the read-only *source* browser —
    different job). The *documents* UX dogfoods the stack later: a
    `/data/index.json` that is itself an Item document. Not v0.
15. **Static host: never silent.** Disabled socket → `FileSaver.write` warns
    once and resolves `false`; the Editor surfaces a read-only badge off that.
    The deployed demo mounts `LocalStorageSaver` (one visible line choosing a
    saver), so the public editor genuinely persists.
16. **Placement:** `core/Item/`, `core/List/` (zero imports, headless,
    node-runnable); `ext/Saver/`, `ext/Draggable/`, `ext/editor/` (transport /
    interaction / integration). Core never imports ext; `Item` knows its saver
    by duck type only. Tim's soft dissent (Item in ext) recorded, not adopted.

## The APIs, exactly

```js
// core/Item/Item.js — zero imports, pure construction
new Item({ type, id, data, items, saver })    // all optional; assign-based

item.data                       // plain object — the only user namespace
item.get(k)  item.set(k, v)     // set → this; emits "change",k,v,old only on real change
item.items                      // List, owner = this
item.add(...kids)               // adopt + emit "add"; → this
item.remove(kid?)               // no arg = remove self; emit "remove"; → this
item.move(parent, before=null)  // reorder AND reparent, node-relative
item.parent  item.root()  item.find(id)  item.walk(fn)  item.contains(item)
item.on(ev,fn) item.off(ev,fn) item.emit(ev,...a)   // emit bubbles to parent
item.save()  item.delete()      // delegate up; no saver anywhere → false, no throw
item.toJSON()                   // { type, id, data, items? }
Item.hydrate(json)              // SYNC; tolerant; unknown type preserved
Item.register(Class, name=Class.name)   Item.types
await Item.open(saver)          // the one async entry point
```

```js
// core/List/List.js — zero imports
new List({ owner })
list.children  list.length  [Symbol.iterator]
list.append(child)  list.insert_before(child, ref=null)  list.remove(child)
list.each(fn)  list.find(fn)  list.index_of(child)
list.adopt(child)               // parent = owner ?? this; called by append/insert
list.toJSON()                   // bare array
```

```js
// ext/Saver/Saver.js — the base is a coalescing write queue (one in flight,
// one pending; intermediate calls collapse). That queue is why it exists.
saver.save(item)                // public; queues write(item)
saver.load()                    // → Promise<json|null>
saver.write(item)               // backend hook
saver.delete(item)
// FileSaver { path }: load = fetch(path), 404 → null; write = socket
// async_rpc("write", path, JSON.stringify(item, null, "\t")), checks the
// "write failed" response string, disabled socket → warn once + false;
// delete = rpc("rm"). MemorySaver and LocalStorageSaver: same three hooks.
// ListSaver does not return: a list document is an Item with empty data.
```

## Phase 2 ownership (disjoint; shared files funnel through Mike)

- **A — core:** `core/Item/{Item.js,readme.md,page.js}`,
  `core/List/{List.js,readme.md,page.js}`. The page.js files carry executable
  round-trip assertions rendered green/red — the demo page is the test, incl.
  `JSON.stringify(Item.hydrate(j)) === JSON.stringify(j)` over nesting,
  duplicate types, an unknown type.
- **B — ext/Saver:** `ext/Saver/{Saver.js,FileSaver.js,MemorySaver.js,
  LocalStorageSaver.js,readme.md,page.js}` + uncomment `DevSocket.Socket.use(Runtime)`
  and `Server.use(Directory)` in `server.js`.
- **C — ext/Draggable:** `ext/Draggable/{Draggable.js,Sortable.js,
  draggable.css,readme.md,page.js}` — demo: two lists, reorder + cross-list +
  nest + cancel. Empty containers get `min-height` (the #1 "drag doesn't work"
  report).
- **D (second wave) — ext/editor:** `ext/editor/{page.js,editor.css,History.js,
  blocks.js,readme.md}` — palette (Section/Text/Card/Grid), canvas of real
  Items each a Sortable, layers (parent-first, selection by id, never by object
  reference — History restore replaces every node), properties = `ext/layout`'s
  `words`/`chips`, persist via FileSaver (localhost) / LocalStorageSaver
  (deployed), undo/redo via History, `preview()` renders the saved tree as the
  parent-wall card. Acceptance: **drag a block into a nested container, reload
  the browser, it is still there; Ctrl+Z after a drag undoes the drag.**
- Shared link edits (`core/page.js`, `ext/page.js`) and final readme folds: Mike.

Deferred, explicitly: multi-select, copy/paste, symbols, breakpoints,
multi-document UX (`/data/index.json` design recorded above), delta log /
multi-client (seam: `write_ops`), `ext/bind` list-binding helper (write the
3-line pattern at call sites until it repeats).
