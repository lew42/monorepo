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

**Decided:** a `.jsonl` URL goes through `Store.for(url)`, which holds one Store per file, so a second `open()` reaches the same live object. On localhost the Store tails the file live and sends each new line: a record file's (`session`, `task`, `page`, `improvements.jsonl`) through `RecordWriter.post` to the one writer in Servex ([one-writer.md](one-writer.md)), with `FsFile.send` as the fallback; any other file via `FsFile.send` (the one file API). Off localhost it loads once and keeps changes in memory. A whole-file saver (`ext/Saver/FileSaver.js`) writes through `FsFile.write`.
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

- **Where a child's deltas go.** `List.adopt` sets `child.parent = owner` ([List.js:77](../../List/List.js)). `emit` bubbles `delta` up `.parent` ([Events.js:24](../../Events/Events.js)). `Store.attach` listens on the host ([Store.js:122](../Store.js)) and writes one line nested by `hops()` ([Store.js:234](../Store.js)): `{"kids":{"add":…}}`, then `{"kids":{"k":{"set":…}}}` (every hop names its list, below). Replay is `host.replay_line` → `set`, one `get()` hop per level ([Item.js:152](../Item.js)).
- **Which items own a file.** The host passed to `Store.attach` (a page's `page.jsonl`, a task's `task.jsonl`, `Item.open(url)`, [Item.js:330](../Item.js)). A child with its own store or `_own_file` is skipped by the parent's store ([Store.js:225](../Store.js)); `Task.open_ref` ([Task.js:315](../../Task/Task.js)) uses that. Everything else rides in its parent's file.
- **One tail?** Mostly. `Store.open` ([Store.js:49](../Store.js)) and `Page.Reader.open` ([Reader.js:14](../../Page/Reader.js)) import `ext/JSONL/live.js` `stream()`. The `JSONL` class ([JSONL.js:51](../../../ext/JSONL/JSONL.js)) calls the same `stream()`, but as its own class, not through `Item`: board logs (`rail`, `AITask`, `Inbox`) are `JSONL`, not items. So one engine, two entry points.
- **`item.set("prop", anotherItem)` adopts** (2026-10-28, `Item.adopt_slot`): the child's parent is the item and its `_slot` is `prop`, so `hops()` writes its later changes under `prop`; a replayed `{type, id, data}` of a registered type is hydrated back into an Item. A List value is not adopted this way (its owner is fixed when it is made).
- **Every hop names its list** (2026-10-28): `hops()` writes `{"kids":{"k":{…}}}`, never `{"k":{…}}`, so a reader never searches; two lists with one id no longer misroute. The writer stays nested (no dotted keys written): the item tool may reshape a dotted line, and the Store's echo skip compares text. Readers take both forms and dotted keys. Why and the alternatives: [ids-and-paths.md](/framework/core/Session/tasks/data-shapes/ids-and-paths.md); the proof that old files replay the same: [replay-compare.mjs](/framework/core/Session/tasks/data-shapes/build/backbone/replay-compare.mjs).
- **Old id-only lines** (`{"k":{…}}`) still replay, from the first list that has the id (`Item.member`). Each is counted in `Item.old_hops`; node warns once per process, the browser only counts (a page tool line `{"<card id>":…}` is still current grammar, so pages stay quiet). Nothing reads `Item.old_hops` yet.
- **Not built:** dynamic upgrade (parent store → own file when needed).

Tests: [Item.test.mjs](../Item.test.mjs), [persistence.test.mjs](../persistence.test.mjs) (every saving class, own file and nested), [delta-flow.test.mjs](../delta-flow.test.mjs).

## A button saves its verb through the item tool

**Decided 2026-10-22.** The full map of both save paths is in [map.md](./map.md).

- **A click records the verb, not the state.** Pressing Start on a task calls `task.act("start")`. It runs `start()` locally, so the page redraws at once, and records ONE line, `{"start":{}}`. That is the same line an agent's `item` call writes. `Store.muted` keeps the `set` lines from that local run out of the log. A verb that refused (it changed nothing) records nothing.
- **One writer (when `Store.channel = "item_api"`; the default is the dev socket, [transport.md](./transport.md)).** `Store.flush` then posts a task's lines (`task.jsonl`, `session.jsonl`, `improvements.jsonl`) to Servex `POST /api/item`, which calls `run_item` as `owner`. So the line is checked against the class, stamped `by: "owner"` and `ts`, node's live instance moves forward, and every subscribed agent is told. The echo check ignores `by` and `ts`.
- **Loopback only.** The route writes files, so a caller that is not on this machine gets 403. A phone on the LAN (403), a worktree page (stubbed) or a Servex that does not answer all fall back to the plain file append, so a click is never lost. In that case the line has no `by`, no `ts` and no hooks.
- **Pages keep the plain append for now.** `page.jsonl` is not sent through the tool, because a stricter check could silently drop a page edit. Moving pages over is the next step.
- **Rejected:** stamping `by`/`ts` in the dev server's `Append.js`. That keeps a second writer, and Servex's hooks would still not fire.

Test: [act.test.mjs](../act.test.mjs).

## An item moves home with its id, its history and one reference

**Decided 2026-10-22.** Design: [tasks/item-move/design.md](../tasks/item-move/design.md).

- **What a move does.** A subtask written as lines inside its parent's log moves to a folder of its own. `move_item({from, id, to, by})` in `Servex/agents/page_tools.js` copies every line that addresses the child, in order, each with its original `by` and `ts`, into the new folder's log. It then writes ONE line in the parent, `{"task": to, "as": id, "moved_from": "<from>#<id>"}`, and one line in the moves ledger, `ai/sessions/task-moves.jsonl`.
- **The id stays.** `as` is the id the task had in the parent. `Task.from_ref` and `Session.replay_line` use it instead of the new folder's name, so the reference replaces the nested child and the parent never shows it twice.
- **Never wrong, never half-done.** Before writing, the copied lines are replayed in memory and compared with the live child; if they differ, one `{"set":…}` snapshot line closes the gap. A refusal (unknown id, a child that already has its own file) writes nothing at all.
- **Three ways in, one mover.** The item tool key `{"tasks":{"<id>":{"move":{"to":"<folder url>"}}}}` (the old `{"<id>":{"move":…}}` is still read). `spawn_agent` with `task: {from, id}` hands the subtask to the new agent's folder (handoff by task; a refusal is written into that agent's log). An approved proposal moving to its module home (`move_nested_home`) also calls `move_item`.
- **Not yet.** After a move, a verb sent through the old parent (`{"<id>":{"start":{}}}`) is still written to the parent's log, so the history splits; the fix is for the item tool to write it to the child's own file. Moving back, and cloud homes, are not built.

Test: [item_tool.test.mjs](../../../../../Servex/agents/item_tool.test.mjs) (73 checks).

## More

- [`doc/decisions.md`](./decisions.md) — the full record, traps and verdicts (the history, not this page).
- [`doc/envelope.md`](./envelope.md) — the wire format and what is excluded.
- [`readme.md`](../readme.md) — the one-page index.
