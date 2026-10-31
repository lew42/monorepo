# Item — an arbitrary persistent thing: an id, a data bag, one `set(delta)`, a place to save, a place to be seen. No children of its own.

## One persistence system with Page

`Page extends Item`: [core/Item](/framework/core/Item/) and [core/Page](/framework/core/Page/) are one system, split by readme only. **Item** is the generic log-backed object: one JSONL log, `set(delta)`, replay on open, children saving through their parent, `live()` tailing. **Page** adds a url, routing, parts, layout and the inbox. So: how a thing saves, replays and streams goes in *this* readme; anything about a url, the Router, content parts or the page tools goes in the [Page readme](/framework/core/Page/readme.md).

**Classes that extend Item today** (`grep -rn "extends Item" public/framework`):

- [List](/framework/core/List/) (`List.js`): an ordered, announcing collection of Items.
- [Page](/framework/core/Page/) (`Page.class.js`): an Item with a url; its parts [PageText, PageHeading, PageCard, PageLink, PageContentItem](/framework/core/Page/parts/) are Items too.
- [Task](/framework/core/Task/) (`Task.js`): one task's state machine, replayed from `task.jsonl`.
- [Session](/framework/core/Session/) (`Session.js`): a session record.
- [Dated](/framework/core/Item/Dated/) (`Dated.js`, with `Dated.Index`): a collection filed by day (`<root>/YYYY/MM/DD/<slug>/`) and its pointer rows; the first is projects. Not an Item itself: its index is. Node half: `Server/DatedFiles.mjs` (doc `Server/doc/dated-files.md`).
- [Panel](/framework/ext/Panel/) (`Panel.js`) and `Block` (`ext/editor/blocks.js`): layout and editor pieces.
- `Item.Store` (`Store.js`) is not an Item; `Page.Reader` extends it.

**When to reach for which:** a **List** when something is ordered and needs watching (events are built in — there's no event-less variant any more); an **Item** when it is a thing (an icon, a title, saved); a **Page** when it has a URL.

## Architecture

```js
Item = Events(Object)                 // ✅ landed 2026-10-02 — on/off/emit come from the Events mixin
  id, data: {}                        // get(key), put(key, value) — seams over `data`; Page overrides both
  set(a, b)                           // ✅ one delta: a method key calls it, a nested .set() recurses, else data + emits "change"/"delta"
  store: Item.Store                   // ✅ a Store attached (core/Item/Store.js) replays (each entry through `host.replay_line`, default `set`; `Item.replay(lines)` is the node twin) / appends / tails one .jsonl file — it writes through FsFile.send, the one file API (ext/filesystem)
  view                                // getter/setter; lazy `new constructor.View({item})`: a class's OWN view, when it has one
  views: []                           // ✅ every live default view drawing me (ux/Content/Object/DefaultView.js; ask 33)
  remove(), root(), contains(item), walk(fn), find(id), save(), delete()
  toJSON(), static hydrate(json), static register(Class, name), static open(src)   // open(url): ONE root per url, the same live object for every caller
}
 └─ Ref (Ref.js)                     // ✅ points at an item somewhere else: {path} or {url, path}; resolve() → the live target, or null (gone)
 └─ Page (core/Page)                  // ✅ Page extends Item directly (2026-10-03 — PageLog, a middle class, folded in)
     pages: List                      // its sub-pages
     content: List                    // its visible blocks, made lazily
     the page.jsonl bits: keeps every line, emits "line", set()/file()/tab()/place()
```

**Item itself has no list of its own — no `items`, no `add`/`move`/`order`.** Those collided
with Page's own `add(name, child)`/`move(url)` (about 70 methods already in use), so lists are
a PROPERTY instead of an inheritance: something that needs children gives ITSELF a named
`List` (`core/Item/page.js`'s own `DemoCard` does this in its constructor; `page.pages` and
`page.content` are Page's). There is one `List` class, not two — `LiveList` was merged into it
2026-10-02 (the owner: "scrap LiveList everywhere… List itself gets Events built in"); see
`core/List/readme.md`.

## Use

Saving to a `.jsonl`: [core/Page/doc/jsonl.md](../Page/doc/jsonl.md) ("The store").

**A log file (`.jsonl`) — the usual way.** Every change is one appended line; opening the file replays them.

```js
const doc = await Item.open("/framework/core/Item/live/demo.jsonl");   // replay every line, then tail
doc.content ??= new List({ owner: doc, name: "content" });             // a class gives ITSELF a list
doc.content.add({ id: "hello", data: { text: "Hello" } });           // appends {"add":…} through FsFile.send
```

**A whole JSON file.** [`FileSaver`](/framework/ext/Saver/) (`ext/Saver/FileSaver.js`) rewrites the file through `FsFile.write`:

```js
const doc = await Item.open(new FileSaver({ path: "/data/doc.json" }));
doc.save();
```

Wire format is `{ type, id, data, <listname>: [...] }` — each List property an Item gave
itself, written under its own name, omitted when it never made one. All user state lives under
`data`. Headless, runs in node.

## References: `Ref` (2026-10-28)

A `Ref` is a small Item that points at an item living somewhere else, so the same thing can show in two places without a copy. It stores only where the target is: `{"type":"Ref","path":"tasks.ui"}` in the same file, `{"type":"Ref","url":"<folder or .jsonl>","path":"tasks.ui"}` in another.

```js
const ref = new Ref({ url: "/framework/ai/sessions/…/child/", path: "tasks.t1" });
await ref.resolve();          // Item.open(url) (one root per url, live), then root.get(path)
ref.target;                   // the child's live task, or null when it is gone
new RefView({ ref });         // a row: "child › task", redrawn when either changes; "gone: …" when missing
```

- A missed path falls back to its last part, the id, through the root's own index (`find`), built on that miss and never saved.
- Within one file, `Ref.shown(item)` says where an item is shown, and `Ref.repath(item, old_path)` re-paths those Refs after a move (one line each); `List.move` calls it on every move to another list, so a drag re-paths by itself.
- Across files, a move leaves `{moved_to: {url, path}}` at the old place (`item.move_to({url, path})`, the one move verb; `move_to(list)` moves inside the file); an old Ref follows it and takes the new address. The handoff (`move_item`) writes one (doc/ref.md, Forwards).
- Where it is used: the session page lists each child session's open tasks through Refs (`core/Session/SessionTasks.js`). How it works and why: [doc/ref.md](./doc/ref.md). Test: `node Ref.test.mjs`.

## The line, hooks and calls (Wave 1 B, 2026-10-31)

- **A key's spelling says what it does (D13):** `name` is data or a step into a child, `name()` calls a method, `#id` picks a list item. Old bare shapes still replay. `Store.marked_lines` (off) switches what `act` and list-item changes write; the readers that need updating first are listed in [doc/line-format.md](./doc/line-format.md). Test: `line-format.test.mjs`.
- **`set_<key>(value)` is a hook (D17):** `set()` calls it for that key, it stores with `this.put`, and a direct call saves too; it runs live, from another tab and on replay: [doc/hooks.md](./doc/hooks.md). Test: `hooks.test.mjs`.
- **`as_call(name, [args], body)` saves a method as one line (D14),** outermost only, never on replay: [doc/call.md](./doc/call.md). Test: `call.test.mjs`.
- **While any store replays, no store saves** (`Store.replay_depth`); `set()` refuses a function, DOM node or cycle; a throwing view listener cannot stop a save; a running task's `ran_since` is saved data: [doc/core-fixes.md](./doc/core-fixes.md). Test: `item-core.test.mjs`.

## Click-through tests
Each test file below opens as a page: one block per test, its checks as green/red lines, the instances and saved logs drawn open. Edge cases are closed "edge case" blocks; a node-only test is listed, not run. Same files run with `node <file>`.
- [act.test.mjs](/framework/core/Test/view/?file=core/Item/act.test.mjs) — a button saves its verb once
- [replay.test.mjs](/framework/core/Test/view/?file=core/Item/replay.test.mjs) — what replay runs again: change lines against act() lines (the replay lab's facts)
- [line-format.test.mjs](/framework/core/Test/view/?file=core/Item/line-format.test.mjs) — `name`, `name()`, `#id` read and written (D13)
- [hooks.test.mjs](/framework/core/Test/view/?file=core/Item/hooks.test.mjs) — `set_<key>` hooks (D17)
- [call.test.mjs](/framework/core/Test/view/?file=core/Item/call.test.mjs) — `as_call` saves a method as one line (D14)
- [item-core.test.mjs](/framework/core/Test/view/?file=core/Item/item-core.test.mjs) — the core's safety fixes
- [bind.test.mjs](/framework/core/Test/view/?file=core/View/bind.test.mjs) — `view.bind(item, key, fn)`: binds now and on change, one draw per frame, unbinds on remove (D7, built; in `core/View`)

## Snapshots (Wave 2 E, 2026-10-31)

`Item.open` can start from `task.snapshot.json` beside the log (the item's saved shape and how far into the log it reaches) and replay only the lines after it; `node Server/Snapshots.mjs <path>` writes them after proving they equal a full replay (dry run by default). The log is never touched, a stale snapshot (log rewritten, or made by other replay code: it stores a hash of the classes' source) is ignored with a warning, `page.jsonl` is not covered. 8,360 lines: 400 ms to 30 ms. Where it lives, who writes and reads it, and the alternative not taken: [doc/snapshots.md](./doc/snapshots.md). Test: `snapshot.test.mjs`.

## Where an item saves (the rule, 2026-10-20)

An item added to a parent logs its deltas to the parent's store. Not every item needs a file. An item breaks out by need: first it lives inside the parent's file, then in its own `thing.jsonl`, then in its own `thing/` directory once a real file must sit beside it.

- ✅ An item added to a parent's `List` logs to the parent's store, and **every hop names its list**: `{"kids":{"add":{...}}}`, then `{"kids":{"k":{"set":{...}}}}` (`#k` when `Store.marked_lines` is on). A reload replays it with one `get()` per name, never a search. (`Item.test.mjs`, `persistence.test.mjs`)
- ✅ A **dotted key** is the same path, flat: `{"kids.k":{"set":{...}}}`. Each level's `get()` takes the first name and hands the rest down, so a List (or any subclass) decides how it looks up its own members. `get("kids.k")` reads the same path. The writer still writes the nested form. So a data field can no longer be named with a dot (`"v1.2"`): a new dotted key is always a path. ([ids-and-paths.md](/framework/core/Session/tasks/data-shapes/ids-and-paths.md), DECIDED)
- ✅ `get(key)` no longer searches every list. An **old line** that names a member by its id alone (`{"k":{…}}`) still replays, from the first list that has it (`member(id)`); it is counted in `Item.old_hops` and warned once in node.
- ✅ `by` and `ts` on a line are the writer's stamp, never data: `replay_line` holds `ts` in **`Item.clock`** while the line applies (`Task.clock` is the same clock), for every Item. A Page keeps the whole line in `jsonl_lines`.
- ✅ `item.set("prop", anotherItem)` **adopts** it: its parent is the item, its slot is `prop`, its later changes are written under `prop` (`{"prop":{"set":{…}}}`), and a replay makes the saved `{type, id, data}` an Item again. (`Item.test.mjs`)
- ✅ Fast at size: a `List` keeps an id-to-member `Map`; `find(id)` (deep) is a `Map` rebuilt once per list change (`Item.generation`); `lists()` is cached. The largest voice session (8,360 lines) replays in about 200 ms (2.1 s before, 2026-10-28).
- ✅ The persistence matrix: Item, List, Task, Prompt, Question, Session and Page, as the root of a file and nested, for add, set, move, remove and replay, through a real Store, a second tab and a fresh replay: `node persistence.test.mjs`. The whole path, hop by hop: `node delta-flow.test.mjs` (runs [seat g's demo](/framework/core/Session/tasks/data-shapes/seats/delta-flow/delta-flow.md)).
- ✅ Own file: an item with its own store, or marked `_own_file`, is skipped by the parent's store (`Store.js` `owned_below`). `Task.open_ref` does this.
- ✅ One tail: every store and `JSONL` instance tails through `ext/JSONL/live.js` `stream()`. Items, pages and tasks reach it through `Store.open()`; the board logs through the `JSONL` class, which calls `stream()` directly.
- ✅ A button saves its verb: `item.act("start")` runs the method and records `{"start":{}}` (muting that item's tree and the ancestors' own derived changes, so a parent that completes because its last child did is not saved as extra lines: `Store.mute`, `muted_at`; an unrelated item's write during the verb is still saved). A record file's store (`task.jsonl`, `session.jsonl`, ...) posts that line to Servex `/api/item` first (the item tool's writer, loopback only: its hooks start the agent on Approve), stamped `by: "owner"` and `ts`, with the numbered dev-socket append as the fallback ([doc/transport.md](./doc/transport.md)); `Item.Store.channel = "socket"` skips Servex. Why: [doc/architecture.md](./doc/architecture.md#a-button-saves-its-verb-through-the-item-tool). (`act.test.mjs`)
- ✅ An item moves home: `{"tasks":{"<id>":{"move":{"to":"<folder url>"}}}}` (the old `{"<id>":{"move":…}}` is still read) through the item tool (or `spawn_agent` with `task: {from, id}`) moves a subtask out of its parent's log into its own folder, with its id, every line of its history, and one `{"task", "as"}` reference left behind. Why: [doc/architecture.md](./doc/architecture.md#an-item-moves-home-with-its-id-its-history-and-one-reference). (`item_tool.test.mjs`)
- ⬜ Dynamic upgrade (an item moving itself from the parent's store to its own file when it needs one) is a noted idea, not built.
- ⬜ A general RENAME (a `Dated`-store item's own folder tracking its title, with every reference — follows, links, index rows — updated in one step) does not exist, and a per-caller version was tried and dropped (voice sessions, 2026-10-25): `Servex/agents/Sessions.js`'s `rename_session` only retitles, on purpose. Moving the folder breaks the session's own item-tool `path`, handed out once at spawn and reused for the rest of that session's life — the very agent asking for the rename would lose its own record-keeping path the instant it ran, with no way to tell it the path changed mid-conversation. A bookmarked dated-folder url would 404 the same way (`Servex/agents/page_tools.js`'s `DATED_SESSION` checks the literal typed path). A real fix needs a resolve-by-id indirection here, in `Dated` or `Item`, so every dated-store item (sessions, cards, tasks) can move without breaking what already pointed at the old path — not built yet.

Code pointers and findings: [doc/architecture.md](./doc/architecture.md#items-save-through-their-parent).

The target model (the owner, 2026-10-21): any item holds items on demand, adding is a reference and moving is explicit, every added item gets persistence recursively, storage targets vary and are visible: [doc/owner-2026-10-21-items-hold-items.md](./doc/owner-2026-10-21-items-hold-items.md).

A testing system is a need, not now (2026-10-20). Tests today are plain node files (`node Item.test.mjs`). The core test the [Item page](/framework/core/Item/) draws step by step is `Item.steps.js`; `node Item.steps.test.mjs` runs the same steps. The page's life-cycle picture is `Item.life.js` and its method pages are `Item.methods.js` plus `doc/method/<name>.md` for `set`, `get` and `toJSON` ([ClassDoc](/framework/ext/Doc/doc/class-doc.md)).

## Watch out

- **Ids: a made thing gets `Item.short_id()`, code-made structure a fixed name.** 8 random letters and digits, a letter first, never a dot (a dot is a path) and never a slug of a title (a rename would leave a lying id). `new_id()` (a UUID) is still what a bare `new Item()` gets. The rule: [ids-and-paths.md §5](/framework/core/Session/tasks/data-shapes/ids-and-paths.md).

- **Indexing is the tool's job, never the agent's.** Nothing you create asks the agent to index it: `Server/AIIndex.mjs` (`--watch`, kept alive by Servex) sees any task or session log change through `fs.watch` (about 250 ms) and appends the changed row to the day's `sessions/YYYY/MM/DD/index.jsonl` through `Server/AIIndexStream.mjs` (doc `Server/doc/ai-index.md`; owner ask: [one-state](/framework/ai/doc/one-state.md)). Today:
  - ✅ A task log written by `new-task`, `append.mjs`, `Agents.open_task`, `spawn_agent` or the item tool is indexed, because the watcher reads the file, not the creator.
  - ✅ A transcript session (VS Code, CLI) is streamed by `AISessionIndex.stream_line` when it is born or its state or title changes.
  - ⚠ A child added with the item tool's `tasks.add` that lives only inside its parent's log has no log of its own, so it gets no row of its own; it shows through the parent's replay. A child with its own file (`Task.open_ref`) is indexed like any task.
  - ⚠ A start-up read of old sessions writes no day line on purpose, and a log outside the two stores (sessions, `*/tasks/<slug>/`) is never indexed.
- Register every subclass (`Item.register(Class, name)`) — `Item.names` is an inverse Map, so an unregistered subclass serializes under its parent's wire name: [doc/decisions.md](./doc/decisions.md).
- `contains()` excludes self — guard a drop with `target !== this && !this.contains(target)`: [doc/method/contains.md](./doc/method/contains.md).
- Constructors do no I/O; `Item.open(saver)` is the one async entry: [doc/method/open.md](./doc/method/open.md).
- Warnings fire once per message — clear `Item.warned` to re-hear them: [doc/decisions.md](./doc/decisions.md).
- A child's `save()` delegates up and persists the whole document, never its subtree: [doc/method/save.md](./doc/method/save.md).
- `item.view` is `undefined` until a class wires its own `static View` — a reader of a content List with
  no view of its own falls back to its own title/text; see `Page.render_content_list()`, core/Page. The
  generic debug view is `view(item)` (ux/Content/Object), and every one drawing an item is in `item.views`.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [`doc/store-index-query-plan.md`](./doc/store-index-query-plan.md) — the plan (slice 1, projects, built): one store, one dated index (`Dated`), one query for sessions, tasks and projects
- [`doc/item-notes.md`](./doc/item-notes.md) — comments pruned from `Item.js`, verbatim.
- [Overview](/framework/core/Item/) — the page asserts every claim on load; red is a broken framework.
- [Live list](/framework/core/Item/live/) — the same List, on a real page, saved to a real file: drag, add, sort, reload.
- [Watch a tree being built](/framework/core/Item/watch/) — step through it: every object in the default view as it is made and changed, every line it saves beside it, then a replay of those lines. Files: `watch/` (`Watch.js`, `Box.js`, `ScratchStore.js`).
- [Replay lab](/framework/core/Item/replay/) — press a button, reload, and see what the real `Item`, `Task` and `Store` bring back and what they run a second time (four examples, changes against calls). Files: `replay/` (`ReplayLab.js`, `LabTape.js`, `LabTask.js`, `readme.md`); tests `replay.test.mjs` and `replay-vs-open.test.mjs` (both pass).
- [doc/envelope.md](./doc/envelope.md) — the envelope, unknown types, what is deliberately excluded.
- [doc/decisions.md](./doc/decisions.md) — the council ruling, verdicts, traps in full, who uses Item.
- `doc/method/*.md`, `doc/property/*.md` — one note per verb and field, each with its trap. The [Methods tab](/framework/core/Item/methods/) shows three of them (`set`, `get`, `toJSON`); the rest are read here, and many predate `set()` as a delta.
- [doc/one-writer.md](./doc/one-writer.md) — every line to a `session`, `task`, `page` or `improvements.jsonl` goes through one entry point by default (`Store.channel = "item_api"`: `record_lines` / `run_item` behind `POST /api/item`), which applies it to the live root, runs Servex's hooks and then appends it; only lines it did not take, or `Store.channel = "socket"`, go over the dev socket; `RecordWriter.js` is the caller's side, and its fallback never writes a twin.
- Files that matter: `Item.js` (the class), `Store.js` (persistence, one per file), `RecordWriter.js` (posts a record's lines to the one entry point; the fallback append), `page.js` (live assertions), `../List/List.js` (the ordered, announcing collection), `../Page/` (the one Item subclass with a URL).
- [doc/map.md](./doc/map.md) — every class, store, tool and writer that makes or saves items.
- [doc/one-stream.md](./doc/one-stream.md) — one stream for the UI, node and agents: a file's appends advance its live instance, and subscribers hear item changes (a design, not built).
- [Design decisions 2026-10-27](/framework/ai/design-decisions-2026-10-27.md) — adopt-or-ref ownership, first delta at adopt time, snapshots as compaction (decided or leaning; snapshots are built, see above; also what works today and the gap).
- [doc/transport.md](./doc/transport.md) — how a line travels: out, ack, in, catch-up. Every `.jsonl` line goes over the dev socket, numbered and kept until acked (a write the disk refused for now is kept and sent again), also in `localStorage` across a reload (`Store.open()` loads the outbox so a reloaded page sends it), with a ping that finds a dead socket (`Outbox.js`, `store.pending`); a record file's lines go to Servex `/api/item` first, so its hooks run, and use the socket as the fallback (`Item.Store.channel`). Tests: `transport.test.mjs`, `Outbox.test.mjs`, `transport.browser.mjs`.
