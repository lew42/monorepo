# List — the plain ordered array wrapper; LiveList (same directory) is this PLUS announcing every change

**When to reach for which:** a **List** for plain ordered data (no ids, nothing listens, nothing
saves); a **LiveList** when something must watch it change; an **Item** when it's a thing (an
icon, a title, saved); a **Page** when it has a URL.

## Architecture

```js
class List {                          // ✅ data only, no events — reach for this only when nothing needs to watch
  items: [any]                        // ✅ (renamed from `children` 2026-10-02)
  owner                               // the Item that holds it; a member's parent
  append(x), insert_before(x, ref), remove(x), forEach(fn), map(fn), at(i), find(fn), index_of(x), length
}
class LiveList extends Events(List) { // ✅ core/List/LiveList.js — a List that ANNOUNCES every change
  add(x, {after}), remove(id), move(id, {after, before, from}), order([ids]), find(id)
  insert(x, {after}), replace(old, x), release(id)   // the QUIET primitives — loading is not a change
  set(delta)                          // routes a nested {"add": {...}} etc. — Item.set_one()'s recursion target
}
```

**No `Content` class.** An earlier pass (superseded 2026-10-02) proposed `Content extends List`
as Item's own children; the design settled on composition instead — see `core/Item/readme.md`.
`LiveList` is the one upgrade: swap any plain `List` for a `LiveList` to watch it change live,
and `Item.Store` (core/Item/Store.js) is the one listener that turns its `"delta"` events into
`.jsonl` lines.

## Use

```js
list.append(child)  list.insert_before(child, ref = null)  list.remove(child)
list.forEach(fn)  list.map(fn)  list.at(i)  list.find(fn)  list.index_of(child)  list.length
list.adopt(child)   //  child.parent = owner ?? this
list.toJSON()       //  a bare array

const live = new LiveList({ owner: item, name: "content" });
live.add({ text: "hi" }, { after: null });      // first — announces "add" + "delta"
live.move(id, { after: otherId });              // reorder by id, never an index
live.order(["k3", "k1", "k2"]);                 // one line for a whole sort or reverse
```

## Watch out

- `adopt()` sets `parent` to the `owner` (the Item), never the list — walking up never steps over a collection: [doc/adoption.md](./doc/adoption.md)
- `insert_before` takes a node, not an index; a `ref` that is null or absent appends: [doc/decisions.md](./doc/decisions.md)
- `remove()` takes out the first occurrence only — duplicates are normal, each its own node: [doc/decisions.md](./doc/decisions.md)
- `LiveList`'s four verbs (`add`/`remove`/`move`/`order`) are **by id, never an index** — a line survives the list changing shape around it. `insert`/`replace`/`release` are the quiet counterparts: loading or replacing a stub is not a change worth a line.
- **The examples are the tests.** [`LiveList.examples.js`](./LiveList.examples.js) holds six `{title, run}` examples: the [List page](/framework/core/List/) shows each with a live pass or fail, and `ai/2026-10-02/page-extends-item/item-core/test.mjs` runs the same array in node. Add a behaviour, add an example.
- A saved `move` line replays: `move({id, after, from})` (the whole payload, as `set()` hands it) is the line form, and a cross-list `from` path is resolved from the Store's host.
- No reactive or derived lists — they leaked a listener per row; derive with `[...list].filter(…)`: [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/core/List/) · [`doc/adoption.md`](./doc/adoption.md) (why `owner` exists) · [`doc/decisions.md`](./doc/decisions.md) (the Array dissent, what was cut, who calls it)
- [Live list](/framework/core/Item/live/) — a LiveList, live, on a real page, saved to a real file.
- Files that matter: `List.js` (the plain array), `LiveList.js` (announcing + the four verbs), `LiveList.examples.js` (the examples that are also the tests), `page.js` (live demo), `../Item/` (the default caller), `../Page/` (`pages`/`content`, named for what they hold).
