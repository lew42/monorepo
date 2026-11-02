# List — the ordered collection that announces every change

**Every List is live.** There's one class, `List` — no separate event-less variant any
more (the owner, 2026-10-02: "scrap LiveList everywhere… List itself gets Events built
in. 'A list' now means an evented list"). Reach for a plain JS array instead of a List
only when nothing needs an id, nothing saves, and nothing watches.

## Architecture

```js
class List extends Events(Object) {   // ✅ core/List/List.js — Events built in
  items: [any]                        // the array
  owner                               // the Item that holds it; a member's parent
  add(x, {after}), ref(x), remove(id), move(id, {after, before, from}), order([ids]), find(id)
  insert(x, {after}), replace(old, x), release(id)   // the QUIET primitives — loading is not a change
  append(x), insert_before(x, ref), forEach(fn), map(fn), at(i), length
  set(delta)                          // routes a nested {"add": {...}} etc. — Item.set_one()'s recursion target
  get(key)                            // a property, else a member by id: the next hop of a line or a dotted path
  index()                             // ✅ 2026-10-28: the id-to-member Map find() reads; kept in step by every verb
  render()                            // draws through List.View — DefaultView wires itself in (ux/Content/Object/DefaultView.js); else nothing in node
}
```

**Lookup is one Map read** (2026-10-28, [data-shapes plan](/framework/core/Session/tasks/data-shapes/plan.md) step 1): `find(id)` reads an id-to-member `Map` kept in step by every verb; the first member with an id wins, as `Array.find` did. A member whose id was empty when it arrived, or whose id changed in place, makes `find()` rebuild the Map once. A subclass may look up its members another way (override `find` or `get`). Every List change bumps `Item.generation`, which tells a deep `Item.find()` to rebuild its own index.

**No `Content` class, no `LiveList` class.** An earlier pass split the plain array
(`List`) from the announcing one (`LiveList = Events(List)`); the owner merged them
2026-10-02, because nothing in the codebase actually wanted a list nobody could watch.
`Item.Store` (core/Item/Store.js) is the one listener that turns a List's `"delta"`
events into `.jsonl` lines.

## Use

```js
const list = new List({ owner: item, name: "content" });
list.add({ text: "hi" }, { after: null });      // first — announces "add" + "delta"
list.move(id, { after: otherId });              // reorder by id, never an index
list.order(["k3", "k1", "k2"]);                 // one line for a whole sort or reverse
list.find(id)  list.forEach(fn)  list.map(fn)  list.at(i)  list.length
list.toJSON()       //  a bare array
```

## Watch out

- `adopt()` sets `parent` to the `owner` (the Item), never the list — walking up never steps over a collection: [doc/adoption.md](./doc/adoption.md)
- `insert_before` takes a node, not an index; a `ref` that is null or absent appends: [doc/decisions.md](./doc/decisions.md)
- The four verbs (`add`/`remove`/`move`/`order`) are **by id, never an index** — a line survives the list changing shape around it. `insert`/`replace`/`release` are the quiet counterparts: loading or replacing a stub is not a change worth a line.
- **The examples are the tests.** [`List.examples.js`](./List.examples.js) holds six `{title, run}` examples: the [List page](/framework/core/List/) shows each with a live pass or fail, and `ai/sessions/2026/10/02/page-extends-item/page-extends-item/item-core/test.mjs` runs the same array in node. Add a behaviour, add an example. The [List page](/framework/core/List/) also draws `List.steps.js` step by step (`node List.steps.test.mjs` runs them) and its method pages from `List.methods.js` ([ClassDoc](/framework/ext/Doc/doc/class-doc.md)).
- **Old way (deprecated 2026-10-28):** `List#each(fn)` and `List#children` are the pre-rename aliases; use `forEach(fn)` and `items`. The mark is in `List.js`; `node Server/Deprecated.mjs` counts what still calls them.
- A member is named in a line by its id, bare or as `#id`; `list.member(id)` is `find(id)` (an Item's `member` searches its lists), and `{"add()": …}` calls the verb by the D13 spelling: [core/Item/doc/line-format.md](../Item/doc/line-format.md).
- **`add` writes an envelope** (fix 5, `/framework/research/2026/10/29/persistence-sync/design/fixes.md`): an Item member's own fields ride under `data`, and its child lists ride as their own top-level keys (`made.toJSON()`'s own shape) — never spread flat into the add payload, where a data field named `after` or `type` would collide with the list's own metadata and a child list would be lost silently.
- **`list.ref(item)` links an item ANOTHER list already owns** (F7, built 2026-11-01, reworded 2026-11-02, chat-model step 2): makes a Ref to it — same file `{path}`, another file `{url, path}` — and `add()`s that. **`add()`'s own default is unchanged** (still a silent re-parent, exactly as on `michael/dev`): switching it is a separate, later, owner-approved merge, pending the census in [plan.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-model/plan.md) decision 2 finding no caller relies on the move. A caller that means to MOVE an owned item must call `item.move_to(dest)`, never `add()` or `ref()`: [`../Item/doc/ref.md`](../Item/doc/ref.md#made-by-listref-and-chatresurface).
- **`List.View = DefaultView`** (2026-11-02, chat-model step 4, [ux/Content/Object/DefaultView.js](/framework/ux/Content/Object/DefaultView.js)): a bare List drawn with `view(list)` or `list.render()` updates on `add`/`remove`/`move`/`order`/`clear` keyed by member id — only the changed rows redraw, the rest just move. The wiring is a side effect of loading `DefaultView.js`: a page that never imports it still gets `undefined` from `list.render()`. A Ref member (above) draws as `RefView` (`DefaultView.ref_view()`), never a nested DefaultView. The keyed loop itself is `DefaultView.place(box, members, cache, make, update)`, ONE static helper (Law 6) — `DefaultView.reconcile()` calls it, and so does `ext/Chat/list/ChatList.js`'s own `paint()`, which keeps its own bubble `fill()` as `place()`'s `make`/`update` instead of running a second keyed loop. Test: `ux/Content/Object/list-view.test.mjs`.
- A saved `move` line replays: `move({id, after, from})` (the whole payload, as `set()` hands it) is the line form, and a cross-list `from` path is resolved from the Store's host.
- No reactive or derived lists — they leaked a listener per row; derive with `[...list].filter(…)`: [doc/decisions.md](./doc/decisions.md)

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [Overview](/framework/core/List/) · [`doc/adoption.md`](./doc/adoption.md) (why `owner` exists) · [`doc/decisions.md`](./doc/decisions.md) (the Array dissent, what was cut, who calls it)
- [Live list](/framework/core/Item/live/) — a List, live, on a real page, saved to a real file.
- Files that matter: `List.js` (the class — the array plus Events plus the four verbs), `List.examples.js` (the examples that are also the tests), `page.js` (live demo), `../Item/` (the default caller), `../Page/` (`pages`/`content`, named for what they hold).
- [Design decisions 2026-10-27](/framework/ai/design-decisions-2026-10-27.md) — `add` adopts an unowned item; the explicit `ref()` writes a ref for an owned one (built 2026-11-01, chat-model step 2); the chat is one stored list (decided or leaning; not built).
