# Item, List, Store and JSONL as built (analysis seat a)

How the data tier really works on `michael/dev` at `be7e964c0` (2026-10-28), read from the code. Every claim has a file:line in [notes.md](notes.md); the experiments that prove the gaps are in notes.md too.

**In one sentence:** an `Item` is a bag of data plus named `List`s of child Items; every change fires one `"delta"` event that bubbles up to the nearest Item with a `Store`; the Store turns it into one nested JSON line and appends it to a `.jsonl` file; replaying the file's lines through `set()` rebuilds the tree.

## The classes

```js
class Events                       // core/Events: on / off / emit; an event bubbles up through .parent

class Item extends Events(Object)  // core/Item/Item.js
  id: string                       // a uuid from new_id() unless given; never changed
  data: {}                         // null-prototype bag: every plain field lives here
  parent: Item                     // set ONLY by List.adopt (never by set())
  store: Store                     // only on a root that has a file
  saver: Saver                     // the older whole-JSON path (ext/Saver), only via Item.open(saver)
  <name>: List                     // any own property holding a List with owner === this
  static fields: [names]           // become accessors over data (get_one / put)
  static types, names: Map         // the registry: wire name <-> class (register)

  set(delta | key, value)          // = apply(delta)
  apply(delta)                     // key by key: skip _x; a METHOD name -> call it with the value;
                                   //   else get(key) has its own set() -> hand it the value (a nested delta);
                                   //   else put(key, value) and emit "delta" {set:{key:value}}
                                   //   an ARRAY of deltas applies in order
  get(key)                         // own property -> data -> a child's id in ANY of my lists (one level)
  act(verb, args)                  // a button: run the verb, record the VERB line, not its set lines
  toJSON()  -> {type, id, data, <list>: [...]}
  static hydrate(json)             // whole JSON -> Item tree (the snapshot reader); forces document-unique ids
  static replay(lines)             // node: new this(), then replay_line(line) for each line
  replay_line(line) = set(line)    // Task and Session override it (they read `ts`/`at` as the line's time)
  static open(url | saver)         // url: one Store per file, attach; saver: hydrate(load())

class List extends Item            // core/List/List.js
  items: [Item]                    // the order IS the array order
  owner: Item                      // the Item that holds it; members' .parent = owner
  name: string                     // the property name on the owner (the wire hop)
  of: Class                        // what a plain object becomes (default Item)
  key(x) = x.id                    // Page keys its sub-pages by name instead
  insert(x, {after}) / replace / release      // QUIET: no event (loading is not a change)
  add(x, {after}) / remove(id) / move(id, {after, from}) / order(ids) / clear()
                                   // LOUD: each emits one "delta" {verb: payload}
  get(key) = super.get(key) ?? find(key)

class Store                        // core/Item/Store.js: one .jsonl file = one object's history
  url, entries, count, host
  static for(url)                  // one Store per url
  open()                           // localhost: live tail over the socket; else one fetch
  read(entries)                    // replay each entry through host.replay_line, echo-skipped
  attach(host)                     // listen to host "delta"; line_for() nests it from host down
  append(line) -> flush()          // one microtask batch; POST /api/item per line for
                                   //   task|session|improvements.jsonl, else FsFile.send

class JSONL                        // ext/JSONL/JSONL.js: a READER of log files (not Items)
  logs, actions, skipped           // verbs: assign, log, action; TaskJSONL adds agent, chat, note…
  live(changed)                    // ext/JSONL/live.js stream(): socket subscribe from an offset
class TaskJSONL extends JSONL      // the task page's reader: agents, chats, decisions, notes…

class Saver                        // ext/Saver: save(item) = last write wins, whole JSON
  FileSaver, LocalStorageSaver, MemorySaver
```

## The wire (one line = one delta, nested one hop per level)

| What happened | The line the Store appends |
|---|---|
| a field on the root | `{"set":{"title":"T"}}` |
| an add to the root's list `tasks` | `{"tasks":{"add":{"id":"…","type":"Task","after":"<prev id>|null",…data}}}` |
| a field on a member `k` | `{"k":{"set":{"title":"T"}}}` (the member's id, NOT the list's name) |
| a move inside a list | `{"tasks":{"move":{"id":"k","after":"j"}}}` |
| a move across lists | `{"b":{"move":{"id":"k","after":null,"from":"a"}}}` (`from` is the old `/` path) |
| a button verb | `{"k":{"start":{}}}` |
| what the item tool adds on disk | `,"by":"<agent>","ts":"<iso>"` on the OUTER line only |

## Two answers in one table

| Question | Today |
|---|---|
| Ids | uuid when made in code or the browser; **slugs of the title** for `tasks.add` through the item tool; unique only among siblings |
| Order | the array; every verb names a neighbour (`after`), never an index |
| Time | not in the delta; the item tool stamps `ts` on the line; only Task/Session read it |
| Snapshot | `toJSON` + `hydrate` (and `ext/Saver`) exist; no snapshot LINE in a `.jsonl` |
| Swappable store | two separate seams (`item.store`, `item.saver`), not one interface; both can hang off the same `"delta"` event |
