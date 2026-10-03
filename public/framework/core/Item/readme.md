# Item — an arbitrary persistent thing: an id, a data bag, one `set(delta)`, a place to save, a place to be seen. No children of its own.

**When to reach for which:** a **List** when something is ordered and needs watching (events are built in — there's no event-less variant any more); an **Item** when it is a thing (an icon, a title, saved); a **Page** when it has a URL.

## Architecture

```js
Item = Events(Object)                 // ✅ landed 2026-10-02 — on/off/emit come from the Events mixin
  id, data: {}                        // get(key), put(key, value) — seams over `data`; Page overrides both
  set(a, b)                           // ✅ one delta: a method key calls it, a nested .set() recurses, else data + emits "change"/"delta"
  store: Item.Store                   // ✅ a Store attached (core/Item/Store.js) replays/appends/tails one .jsonl file — it writes through FsFile.append, the one file API (ext/filesystem)
  view                                // getter/setter; lazy `new constructor.View({item})` once core grows one
  remove(), root(), contains(item), walk(fn), find(id), save(), delete()
  toJSON(), static hydrate(json), static register(Class, name), static open(src)
}
 └─ PageLog (core/Page/Log.js)        // ✅ adds the page.jsonl bits: keeps every line, emits "line"
     └─ Page (core/Page)              // ✅ Page extends PageLog extends Item — the owner approved it 2026-10-02
     pages: List                      // its sub-pages
     content: List                    // its visible blocks, made lazily
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
doc.content.add({ id: "hello", data: { text: "Hello" } });           // appends {"add":…} through FsFile.append
```

**A whole JSON file.** [`FileSaver`](/framework/ext/Saver/) (`ext/Saver/FileSaver.js`) rewrites the file through `FsFile.write`:

```js
const doc = await Item.open(new FileSaver({ path: "/data/doc.json" }));
doc.save();
```

Wire format is `{ type, id, data, <listname>: [...] }` — each List property an Item gave
itself, written under its own name, omitted when it never made one. All user state lives under
`data`. Headless, runs in node.

## Watch out

- Register every subclass (`Item.register(Class, name)`) — `Item.names` is an inverse Map, so an unregistered subclass serializes under its parent's wire name: [doc/decisions.md](./doc/decisions.md).
- `contains()` excludes self — guard a drop with `target !== this && !this.contains(target)`: [doc/method/contains.md](./doc/method/contains.md).
- Constructors do no I/O; `Item.open(saver)` is the one async entry: [doc/method/open.md](./doc/method/open.md).
- Warnings fire once per message — clear `Item.warned` to re-hear them: [doc/decisions.md](./doc/decisions.md).
- A child's `save()` delegates up and persists the whole document, never its subtree: [doc/method/save.md](./doc/method/save.md).
- `item.view` is `undefined` until a `static View` is actually wired in (nobody has built the
  generic one yet) — a reader of a content List with no view of its own falls back to its
  own title/text; see `Page.render_content_list()`, core/Page.

## More

- [Overview](/framework/core/Item/) — the page asserts every claim on load; red is a broken framework.
- [Live list](/framework/core/Item/live/) — the same List, on a real page, saved to a real file: drag, add, sort, reload.
- [doc/envelope.md](./doc/envelope.md) — the envelope, unknown types, what is deliberately excluded.
- [doc/decisions.md](./doc/decisions.md) — the council ruling, verdicts, traps in full, who uses Item.
- `doc/method/*.md`, `doc/property/*.md` — one page per verb and field, each with its trap.
- Files that matter: `Item.js` (the class), `Store.js` (persistence, one per file), `page.js` (live assertions), `../List/List.js` (the ordered, announcing collection), `../Page/` (the one Item subclass with a URL).
