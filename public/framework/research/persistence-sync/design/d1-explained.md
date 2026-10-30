# D1 explained: should List extend Item?

"extends" here is just the JavaScript `class` keyword: `class List extends Item`.

## How saving works today (data-shapes-2)

No child holds a reference to the store. Saving works by **events bubbling up the parent chain to the root**, and only the root has a store.

```js
// 1. The root is attached to its file
store.attach(root)          // root.store = store; store listens to root's "delta" event

// 2. Putting an Item in a property adopts it
root.set({ settings: someItem })
//   adopt_slot(): someItem.parent = root; someItem._slot = "settings"

// 3. A List's owner is fixed when it's made
root.items                  // a List with owner = root
root.items.add(task)        // adopt(): task.parent = root (the OWNER, not the list)

// 4. Any change bubbles up and becomes one line
task.set({ done: true })
//   task emits "delta" → bubbles via .parent → reaches root
//   Store.hops builds the path: {"items":{"t7":{"set":{"done":true}}}}
```

So "being wired into persistence" just means two things: **you have a `parent`, and you emit `delta` events that bubble.** Nothing registers with the store. That's why moving an item doesn't need any store re-sync, as you remembered.

## The actual problem: one shared name space

Replaying `{"items":{"t7":{"set":…}}}` walks the names with `get()`:

```js
List.get(key){ return super.get(key) ?? this.find(key) }
//                   ^ own data/props first   ^ then members by id
```

If `t7` was just removed or moved by another tab, `find("t7")` fails, and the edit is quietly saved as a data field named `t7` on the list instead of being rejected (gap 7). The cause is that the list's own fields and its members share one lookup.

## The options

```js
// A. Keep extends; a path hop never falls into data (smallest change)
//    set()/get() still read and write list.data, so a List keeps its own fields.
//    Only the replay walk changes: a hop must find a member (list.items, by id)
//    or an adopted child Item; otherwise warn and skip. A hop never creates a field.
class List extends Item {
  hop(id){ return this.find(id) ?? this.child(id) ?? warn(`no member ${id}`) }
}
list.set({ sort: "date" })   // still fine: writes list.data.sort

// B. A shared base class (your idea)
class Node extends Events { parent; emitDelta(){}; toJSON(){} }   // bubbling + saving
class Item extends Node { get(k){/* data */}  set(d){} }
class List extends Node { get(id){/* members only */} add(){} move(){} }
// Persistence still works: a List has a parent and emits deltas, that's all it needs.

// C. Wrap: an Item owns a plain collection
item.items.get("t7")   // List isn't a Node at all; the Item emits on its behalf
```

## Recommendation

**A now, B later if it earns it.** A fixes the bug in a few lines and keeps everything working. B is the cleaner shape you described (Item and List as siblings over one base that handles parent + bubbling + saving), and it's safe because persistence only depends on `parent` + `delta` events. Do B as a deliberate refactor, with tests, once A is in.

Code read: [Item.js adopt_slot L195–L204](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L195-L204), [Item.get L222](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L222), [List.adopt L137–L145](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L137-L145), [List.get L191](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L191), [Store.attach](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L132-L139).
