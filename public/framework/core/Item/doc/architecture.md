# Item architecture — a headless data node, saved as one document

`Item` is one persistent thing: an `id`, a `data` bag, one `set(delta)`, and a place to save. It runs in plain node (no DOM, no transport). Main class: [`Item.js`](../Item.js). Persistence: [`Store.js`](../Store.js) (one `.jsonl` file) and `ext/Saver` (one whole JSON file). The pattern is a class tree with composition for children: `Page` extends `Item`; a `List` is a named property, not a base class.

## Lists are properties, never `items`

**Decided:** an Item has no children list of its own. A class that needs children gives itself a named `List` (`this.content = new List({ owner: this, name: "content" })`). `Page` does the same with `pages` and `content`.
**Why:** an `items` method or key collided with `Page`'s own `add()` and `move()` (about 70 methods already in use).
**Instead:** inheriting list methods from `Item` (rejected: name collisions). A `data.items` key (rejected: it would clash with the tree).
**Detail:** [`List` readme](/framework/core/List/readme.md) · ⚠ [`doc/decisions.md`](./decisions.md) still says "an ordered `items` List"; the code does not do that.

## Everything user-owned lives under `data`

**Decided:** `get(key)` / `put(key, value)` read and write `data`, a null-prototype object. Use them for user fields. A key given to `set()` is a method name if one exists, so `set("remove", …)` calls the method.
**Why:** a user field must not overwrite a method. `define_fields()` checks static field names for collisions when a class is registered.
**Instead:** plain own properties (rejected: any user key could shadow a method).
**Detail:** [`doc/property/`](./property/) · [`doc/item-notes.md`](./item-notes.md)

## One delta through `set()`

**Decided:** `set(a, b)` takes one delta. A key that names a method calls it. A nested `.set()` recurses down the tree. Anything else writes `data` and emits `change` and `delta`.
**Why:** one entry point means the same line can be recorded to disk and replayed to rebuild the tree.
**Instead:** a separate setter per kind of change (not recorded in the decisions log; one entry point is simpler to replay).
**Detail:** [`doc/envelope.md`](./envelope.md)

## Changes bubble up as `delta` events; the Store records them

**Decided:** `delta` bubbles from any depth to the document. `Store.attach(host)` listens on the host, works out the nesting from the host down to the change, and appends one line. The path is never a string.
**Why:** a single recorder beats each node saving itself, and a path string was dropped by the owner (2026-10-03).
**Instead:** a dirty flag (rejected: it skipped structural changes such as reorders, so they never saved).
**Detail:** [`doc/decisions.md`](./decisions.md#traps)

## Save delegates up, and persists the whole document

**Decided:** `save()` on a child calls its own saver if it has one, otherwise its parent's. The root's saver writes the whole document.
**Why:** a child that wrote only its subtree overwrote the document with that subtree (an executed defect).
**Instead:** every node owns a saver (rejected: copies drift), or a saver inherited by copy (rejected: same).
**Detail:** [`doc/method/save.md`](./method/save.md)

## Construction does no I/O; `Item.open()` is the one async entry

**Decided:** `new Item(...)` never reads or writes. `Item.open(src)` loads, hydrates, then attaches the saver.
**Why:** a saver's `load()` that ran after the subclass constructor wiped the field defaults.
**Instead:** `load()` inside the constructor (rejected: race and wipe).
**Detail:** [`doc/method/open.md`](./method/open.md)

## Persistence is one `.jsonl` per file, or one JSON file per saver

**Decided:** a `.jsonl` URL goes through `Store.for(url)`, which holds one Store per file, so a second `open()` reaches the same live object. On localhost the Store tails the file live and sends each new line via `FsFile.send` (the one file API). Off localhost it loads once and keeps changes in memory. A whole-file saver (`ext/Saver/FileSaver.js`) writes through `FsFile.write`.
**Why:** one writer per file avoids two readers racing, and the live tail gives the reload-free update the site relies on.
**Instead:** a database (rejected: a static site with no server at runtime).
**Detail:** [`Store.js`](../Store.js) · ⚠ [`readme.md`](../readme.md) says the Store writes through `FsFile.append`; the code calls `FsFile.send`.

## Subclasses register by name

**Decided:** `Item.register(Class, name)` fills two maps: `Item.types` (name to class) and `Item.names` (class to name). `wire()` reads `Item.names`.
**Why:** a static `type` property is inherited, so an unregistered subclass would silently serialize under its parent's name.
**Instead:** a static `type` (rejected for the inheritance trap above).
**Detail:** [`doc/decisions.md`](./decisions.md#traps)

## Unknown types are kept, never dropped

**Decided:** `hydrate()` gives an unknown `type` a plain `Item` that keeps its wire name, warns once, and saves back losslessly. Malformed input is tolerated the same way: a missing id is assigned, a duplicate id is replaced, and bad `data` is warned past.
**Why:** a document you cannot open is worse than one you cannot fully edit.
**Instead:** throw (rejected: the whole document fails to open).
**Detail:** [`doc/envelope.md`](./envelope.md)

## Ids are made at construction

**Decided:** `new_id()` returns `crypto.randomUUID()` when an Item is made.
**Why:** `Date.now()` ids collide within a millisecond, and selection, undo and duplicates need a stable handle.
**Instead:** `Date.now()` (rejected: collisions).
**Detail:** [`doc/decisions.md`](./decisions.md)

## Undo is not in Item

**Decided:** Item does not record history. Undo belongs to the app: `ext/editor` keeps whole-document snapshots and restores them through `Item.hydrate()`.
**Why:** a history inside every node would multiply the bookkeeping for each change.
**Instead:** undo on Item (rejected: every node would carry a stack).
**Detail:** [`doc/decisions.md`](./decisions.md)

## Instance fields are never saved

**Decided:** `toJSON()` writes only `type`, `id`, `data`, and each named List that has entries. `parent`, `saver`, `store`, `_view` and `_on` are never written.
**Why:** saving a `parent` reference would be a cycle, and `toJSON()` would loop forever.
**Instead:** saving the parent reference (rejected: the cycle, above).
**Detail:** [`doc/envelope.md`](./envelope.md)

## Items save through their parent

**Verified 2026-10-20 by reading the code and running it.**

- **Where a child's deltas go.** `List.adopt` sets `child.parent = owner` ([List.js:77](../../List/List.js)). `emit` bubbles `delta` up `.parent` ([Events.js:24](../../Events/Events.js)). `Store.attach` listens on the host ([Store.js:122](../Store.js)) and writes one line nested by `hops()` ([Store.js:234](../Store.js)): `{"kids":{"add":…}}`, then `{"k":{"set":…}}`. Replay is `host.replay_line` → `set`, one `get()` hop per level ([Item.js:152](../Item.js)).
- **Which items own a file.** The host passed to `Store.attach` (a page's `page.jsonl`, a task's `task.jsonl`, `Item.open(url)`, [Item.js:330](../Item.js)). A child with its own store or `_own_file` is skipped by the parent's store ([Store.js:225](../Store.js)); `Task.open_ref` ([Task.js:315](../../Task/Task.js)) uses that. Everything else rides in its parent's file.
- **One tail?** Mostly. `Store.open` ([Store.js:49](../Store.js)) and `Page.Reader.open` ([Reader.js:14](../../Page/Reader.js)) import `ext/JSONL/live.js` `stream()`. The `JSONL` class ([JSONL.js:51](../../../ext/JSONL/JSONL.js)) calls the same `stream()`, but as its own class, not through `Item`: board logs (`rail`, `AITask`, `Inbox`) are `JSONL`, not items. So one engine, two entry points.
- **Gap: `item.set("prop", anotherItem)`** ([Item.js:121](../Item.js) `set_one`) puts the item in `data` and logs a snapshot `{"set":{"prop":{type,id,data}}}`. Nothing adopts the child, so `child.parent` is unset and its later deltas are not logged. On replay the snapshot comes back as a plain object, not an Item. Wiring it needs `hops()` to find a child held in a property, not only in a List; larger than one method, so it is briefed in [next.md](./next.md), not coded.
- **Not built:** dynamic upgrade (parent store → own file when needed).

Tests: [Item.test.mjs](../Item.test.mjs) covers the built part and pins the gap.

## More

- [`doc/decisions.md`](./decisions.md) — the full record, traps and verdicts (the history, not this page).
- [`doc/envelope.md`](./envelope.md) — the wire format and what is excluded.
- [`readme.md`](../readme.md) — the one-page index.
