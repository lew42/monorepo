# Check 4 asks against the repo: core/Item

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/32-core-item/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `core/Item`, folder `public/framework/core/Item` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/core/readme.md`, `public/framework/core/Item/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/core/Item/readme.md`)

# Item — an arbitrary persistent thing: an id, a data bag, one `set(delta)`, a place to save, a place to be seen. No children of its own.

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

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [`doc/item-notes.md`](./doc/item-notes.md) — comments pruned from `Item.js`, verbatim.
- [Overview](/framework/core/Item/) — the page asserts every claim on load; red is a broken framework.
- [Live list](/framework/core/Item/live/) — the same List, on a real page, saved to a real file: drag, add, sort, reload.
- [doc/envelope.md](./doc/envelope.md) — the envelope, unknown types, what is deliberately excluded.
- [doc/decisions.md](./doc/decisions.md) — the council ruling, verdicts, traps in full, who uses Item.
- `doc/method/*.md`, `doc/property/*.md` — one page per verb and field, each with its trap.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/32-core-item/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 4 asks

1. `40a55c7657` (4 days old): Treat the Item class as the existing data binding system
2. `5e46ca38e4` (4 days old): Consider property objects with their own events, via get/set, extending an events class
3. `c661224503` (4 days old): Let a POJO map property names to static values or live property objects for automatic render updates
4. `0a7367fd1e` (4 days old): Decide later how to prioritise data binding work
