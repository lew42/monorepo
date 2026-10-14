# List architecture — every list announces its own changes, by id

`List` is the ordered collection behind an Item's children, for example `item.items` or `page.pages`. It is one class, [`List.js`](../List.js), that extends [`Item`](/framework/core/Item/), so every list is evented and saveable. Each list has an `owner`, the Item that holds it. Callers change a list only through its four verbs: `add`, `remove`, `move` and `order`.

## Every list is live

**Decided:** there is one `List` class, and every instance announces its changes. There is no plain or "live" variant.
**Why:** nothing in the framework wanted a list that nobody could watch. Saving and live pages both listen to the same `"delta"` event.
**Instead:** a plain Array was argued for, since it is already ordered and serializable, and a separate `LiveList` class was tried and merged away. The Array lost because `owner` and `adopt` have to live somewhere.
**Detail:** [decisions.md, Verdicts](./decisions.md)
⚠ The readme still says `class List extends Events(Object)` and lists a `set()` method. The code is `extends Item` (which is itself `Events(Object)`), and `set()` is inherited from `Item.apply()`.

## Verbs take an id, never an index

**Decided:** `add`, `remove`, `move`, and `order` name members by id. Nothing addresses a child by position.
**Why:** an index goes stale when another edit lands first. An id still names the same child after the list changes shape around it.
**Instead:** positional `splice(i, …)`. It is shorter, and it breaks whenever two edits race.
**Detail:** [readme.md, Watch out](../readme.md)

## Parent is the owner Item, never the List

**Decided:** `adopt()` sets `child.parent = this.owner`. A child's parent is always an Item, so walking up never steps over a list.
**Why:** `root()`, `contains()` and the save chain all walk Items. A `parent` that pointed at the List would need every one of them to skip it.
**Instead:** `parent = list`, which needed a no-op `adopt()` override on every subclass.
**Detail:** [doc/adoption.md](./adoption.md)

## Position is a node, not an index

**Decided:** `insert_before(child, ref)` takes the node to land before. A `ref` that is `null` or not in this list appends.
**Why:** a node reference stays correct when other members move. A bare index does not.
**Instead:** `insert(child, index)`, which is off-by-one prone for drags.
**Detail:** [decisions.md, Traps](./decisions.md)

## Quiet primitives beside the announcing verbs

**Decided:** `insert`, `replace` and `release` change the list without emitting. `add` and `remove` are those same steps plus an announcement.
**Why:** loading saved data or swapping a stub is not a user change, so it must not write a line to the log.
**Instead:** one set of verbs that always announces. Every load would then write a line.
**Detail:** [readme.md, Watch out](../readme.md)

## Ids are unique among siblings, and never a property name

**Decided:** an id is unique only within its own list. It is refused with a warning if it equals a real own property or accessor on the list or its owner (for example `title`, `pages`).
**Why:** `get(name)` checks properties first, so such an id could never be reached by name.
**Instead:** accept every id. Then a child named `title` would silently go dead.
**Detail:** `shadows_name()` in [List.js](../List.js). Checked on `insert()` only, not on `insert_before()`.

## Lists are composed, not inherited by their holder

**Decided:** an Item holds a list as a named property. The Item class itself has no `add`, `remove`, `move` or `order`.
**Why:** a holder with list verbs on itself would blur "this node" and "its children".
**Instead:** `class Page extends Item` with the list verbs inherited. Every Item would carry them, whether it had children or not.
**Detail:** [List.js header](../List.js)

## No import cycle: Item reaches List through a hook

**Decided:** `Item.js` never imports `List.js`. It detects a list by duck type and builds one through `Item.makeList`, which `List.js` sets when it loads.
**Why:** `class List extends Item` needs `Item` fully defined. A circular import hands it the temporal dead zone.
**Instead:** importing `List` into `Item`, which crashes at boot.
**Detail:** [List.js header](../List.js)

## Derived views are plain arrays

**Decided:** there are no reactive or derived lists. A filtered or sorted view is `[...list].filter(…)` at the call site.
**Why:** each reactive view subscribed to every member with no disposal path, so it leaked a listener per row.
**Instead:** reactive `filter`, `sort` and `group_by` lists, which were cut.
**Detail:** [decisions.md, Verdicts](./decisions.md)

## Serialized as a bare array

**Decided:** `toJSON()` returns `[...items]`, so an Item reads `"items": [ … ]` with no wrapper.
**Why:** `JSON.stringify` recurses with no custom code at the call site.
**Instead:** `{ children: [...] }`, which needs a wrapper on every read.
**Detail:** [decisions.md, Verdicts](./decisions.md)

## Two forms of move

**Decided:** `move(id, {after})` is the saved line form, and `move(node, {before})` is the drag form. A cross-list move leaves its source quietly, so the one event is the move itself.
**Why:** a drag knows the node it is dropping before. A replayed line knows only ids.
**Instead:** one form. Each caller would then translate its own input.
**Detail:** [readme.md, Watch out](../readme.md)

---

Entry: [List.js](../List.js) · Examples and tests: [List.examples.js](../List.examples.js) · Readme: [readme.md](../readme.md)
