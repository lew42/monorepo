# editor — a drag-and-drop block builder assembled from Item, Sortable, Saver, ext/layout and Panel; a page you visit, not a module you import

## Use
```js
const store  = (path, key) => dev ? new FileSaver({ path }) : new LocalStorageSaver({ key });
const saver  = store("/data/editor.json", "editor");                 // the document
const panels = store("/data/editor-panels.json", "editor-panels");   // the room
const doc = await Item.open(saver);                                   // load -> hydrate -> attach
["change", "add", "remove"].forEach(event => doc.on(event, () => doc.save()));
workspace({ saver: panels, templates: REGIONS, seed });              // five regions, workspace-local T
```

## Watch out
- Selection is an id, never a node — undo hydrates a new tree and every remembered object is detached. [`doc/decisions.md`](./doc/decisions.md)
- `swap()` is one function: saver, listener, canvas and selection move onto the new tree together. [`doc/decisions.md`](./doc/decisions.md)
- `handle: false`, not `null` — `??=` would give the whole canvas a grip. [`doc/decisions.md`](./doc/decisions.md)
- Only `add`/`remove` redraw; a `change` saves but must not, or a chip click replaces the element the properties panel holds. [`doc/decisions.md`](./doc/decisions.md)
- The properties panel writes to the element; `sync()` copies classes and style back onto the Item, filtering `drag-items`. [`doc/decisions.md`](./doc/decisions.md)
- `blocks.js` is imported for its side effect — an unregistered type hydrates as a plain `Item`. [`doc/file/blocks.js.md`](./doc/file/blocks.js.md)
- The wall card once had a live `preview()` that spilled on first paint — removed; solve the zoom sizing before bringing it back. [`doc/decisions.md`](./doc/decisions.md)
- Property edits persist but are not undoable; multi-select and copy/paste are deferred. [`doc/decisions.md`](./doc/decisions.md)

## More
- [Overview](/framework/ext/editor/) · [`doc/decisions.md`](./doc/decisions.md) — the design record: undo by snapshot, who uses it (nothing), Decisions, Traps, Open
- [`doc/shell.md`](./doc/shell.md) — why the shell is a panel workspace with a workspace-local `T` vocabulary
- `doc/method/`, `doc/property/`, `doc/file/` — History's API and per-file notes the overview renders
- Files that matter: `page.js` (widget and page), `blocks.js` (the palette), `History.js` (undo snapshots), `editor.css` (regions, nodes)
- Ranked ledger with ext/Panel: [Editor × Panel review](/framework/ai/2026-08-14/editor-panel-review/)
