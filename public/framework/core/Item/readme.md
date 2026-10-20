# Item — an arbitrary persistent thing: an id, a data bag, one `set(delta)`, a place to save, a place to be seen. No children of its own.

## One persistence system with Page

`Page extends Item`: [core/Item](/framework/core/Item/) and [core/Page](/framework/core/Page/) are one system, split by readme only. **Item** is the generic log-backed object: one JSONL log, `set(delta)`, replay on open, children saving through their parent, `live()` tailing. **Page** adds a url, routing, parts, layout and the inbox. So: how a thing saves, replays and streams goes in *this* readme; anything about a url, the Router, content parts or the page tools goes in the [Page readme](/framework/core/Page/readme.md).

**Classes that extend Item today** (`grep -rn "extends Item" public/framework`):

- [List](/framework/core/List/) (`List.js`): an ordered, announcing collection of Items.
- [Page](/framework/core/Page/) (`Page.class.js`): an Item with a url; its parts [PageText, PageHeading, PageCard, PageLink, PageContentItem](/framework/core/Page/parts/) are Items too.
- [Task](/framework/core/Task/) (`Task.js`): one task's state machine, replayed from `task.jsonl`.
- [Session](/framework/core/Session/) (`Session.js`): a session record.
- [Panel](/framework/ext/Panel/) (`Panel.js`) and `Block` (`ext/editor/blocks.js`): layout and editor pieces.
- `Item.Store` (`Store.js`) is not an Item; `Page.Reader` extends it.

**When to reach for which:** a **List** when something is ordered and needs watching (events are built in — there's no event-less variant any more); an **Item** when it is a thing (an icon, a title, saved); a **Page** when it has a URL.

## Architecture

```js
Item = Events(Object)                 // ✅ landed 2026-10-02 — on/off/emit come from the Events mixin
  id, data: {}                        // get(key), put(key, value) — seams over `data`; Page overrides both
  set(a, b)                           // ✅ one delta: a method key calls it, a nested .set() recurses, else data + emits "change"/"delta"
  store: Item.Store                   // ✅ a Store attached (core/Item/Store.js) replays (each entry through `host.replay_line`, default `set`; `Item.replay(lines)` is the node twin) / appends / tails one .jsonl file — it writes through FsFile.send, the one file API (ext/filesystem)
  view                                // getter/setter; lazy `new constructor.View({item})` once core grows one
  remove(), root(), contains(item), walk(fn), find(id), save(), delete()
  toJSON(), static hydrate(json), static register(Class, name), static open(src)
}
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

## Where an item saves (the rule, 2026-10-20)

An item added to a parent logs its deltas to the parent's store. Not every item needs a file. An item breaks out by need: first it lives inside the parent's file, then in its own `thing.jsonl`, then in its own `thing/` directory once a real file must sit beside it.

- ✅ An item added to a parent's `List` logs to the parent's store, nested under its id: `{"kids":{"add":{...}}}`, then `{"k":{"set":{...}}}`. A reload replays it. (`Item.test.mjs`)
- ✅ Own file: an item with its own store, or marked `_own_file`, is skipped by the parent's store (`Store.js` `owned_below`). `Task.open_ref` does this.
- ✅ One tail: every store and `JSONL` instance tails through `ext/JSONL/live.js` `stream()`. Items, pages and tasks reach it through `Store.open()`; the board logs through the `JSONL` class, which calls `stream()` directly.
- ⬜ `item.set("prop", anotherItem)` is only a snapshot: the child is not adopted and its later deltas are not logged. Plan: [doc/next.md](./doc/next.md).
- ⬜ Dynamic upgrade (an item moving itself from the parent's store to its own file when it needs one) is a noted idea, not built.

Code pointers and findings: [doc/architecture.md](./doc/architecture.md#items-save-through-their-parent).

A testing system is a need, not now (2026-10-20). Tests today are plain node files (`node Item.test.mjs`).

## Watch out

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
- `item.view` is `undefined` until a `static View` is actually wired in (nobody has built the
  generic one yet) — a reader of a content List with no view of its own falls back to its
  own title/text; see `Page.render_content_list()`, core/Page.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [`doc/store-index-query-plan.md`](./doc/store-index-query-plan.md) — the plan (not built): one store, one dated index (`Dated`), one query for sessions, tasks and projects
- [`doc/item-notes.md`](./doc/item-notes.md) — comments pruned from `Item.js`, verbatim.
- [Overview](/framework/core/Item/) — the page asserts every claim on load; red is a broken framework.
- [Live list](/framework/core/Item/live/) — the same List, on a real page, saved to a real file: drag, add, sort, reload.
- [doc/envelope.md](./doc/envelope.md) — the envelope, unknown types, what is deliberately excluded.
- [doc/decisions.md](./doc/decisions.md) — the council ruling, verdicts, traps in full, who uses Item.
- `doc/method/*.md`, `doc/property/*.md` — one page per verb and field, each with its trap.
- Files that matter: `Item.js` (the class), `Store.js` (persistence, one per file), `page.js` (live assertions), `../List/List.js` (the ordered, announcing collection), `../Page/` (the one Item subclass with a URL).
