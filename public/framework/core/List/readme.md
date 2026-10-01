# List — the ordered collection behind `item.items`; an implementation detail of Item, not a second API

## Architecture

```js
class List {                          // ✅ the plain ordered array wrapper; upgrade once, every list gains
  children: [any]                     // ✅ (🔶 to be renamed `items`)
  owner                               // the Item that holds it; children's parent
  append(x), insert_before(x, ref), remove(x), each(fn), find(fn), index_of(x), length
  static View = class ListView extends View { }   // 🔶 list.view: drawn on demand, sortable by default
}
class Content extends List { }        // 🔶 core/Item/Content.js: edit by id (add, set, move, remove, after)
```

## Use

```js
list.append(child)  list.insert_before(child, ref = null)  list.remove(child)
list.each(fn)  list.find(fn)  list.index_of(child)  list.length
list.adopt(child)   //  child.parent = owner ?? this
list.toJSON()       //  a bare array
```

Userland reaches it as `item.items` and mutates through Item verbs (`item.add`, `item.move`).

## Watch out

- `adopt()` sets `parent` to the `owner` (the Item), never the list — walking up never steps over a collection: [doc/adoption.md](./doc/adoption.md)
- `insert_before` takes a node, not an index; a `ref` that is null or absent appends: [doc/decisions.md](./doc/decisions.md)
- `remove()` takes out the first occurrence only — duplicates are normal, each its own node: [doc/decisions.md](./doc/decisions.md)
- Mutating emits on the owner and bubbles to the root; nothing here renders — one listener at the top: [doc/decisions.md](./doc/decisions.md)
- No reactive or derived lists — they leaked a listener per row; derive with `[...list].filter(…)`: [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/core/List/) · [`doc/adoption.md`](./doc/adoption.md) (why `owner` exists) · [`doc/decisions.md`](./doc/decisions.md) (the Array dissent, what was cut, who calls it)
- Files that matter: `List.js` (the whole class), `page.js` (live one-listener demo), `../Item/` (the only caller)
