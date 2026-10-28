# The delta path as built: one page

Seat (g), 2026-10-28. The hop-by-hop walk with file:line is [delta-flow.md](delta-flow.md); the proof is [demo-delta-flow.mjs](demo-delta-flow.mjs); the findings are [notes.md](notes.md).

## Who holds what

```js
class Item                        // core/Item/Item.js
  parent                          // the ONE link to storage; set only by List.adopt
  data                            // the fields; set() puts here
  store?                          // only on a ROOT: the Store of its file
  set(delta) = apply(delta)       // per key: a method → call it; get(key) finds a child → hand it the rest; else data + emit("delta")
  get(key)                        // own property → data → a member with that id in ANY list I own (the list name is not needed)
  emit("delta", line, origin)     // Events: my listeners, then parent.emit(...) — climbs to the root
  replay_line(line) = set(line)   // Session and Task strip by/ts first; a plain Item does not
  save()                          // the OLD path, still here: walk parent to an item with a saver, rewrite the whole JSON

class List extends Item           // core/List/List.js
  owner, name                     // the Item that holds me, and my property name on it
  get parent() → owner            // so my events reach my owner
  items: []                       // the members (a plain array)
  adopt(x)    x.parent = owner    // the only place parent is set
  add/remove/move/order/clear     // loud: emit one "delta" with ME as origin → line ends in my NAME
  insert/replace/release          // quiet: loading is not a change
  get(key) → own prop or member   // so {"cards":{"c1":…}} already replays

class Store                       // core/Item/Store.js — one per file per tab (Store.for(url))
  host                            // the root Item
  attach(host)                    // ONE listener on the root: skip if replaying, muted, or owned_below; else append(line_for(...))
  line_for(line, origin, host)    // wrap(hops(origin, host), line)
  hops(origin, host)              // member → its ID (list name dropped); a List's own verb → its NAME; a property-held Item → nothing (flat)
  append → flush                  // one microtask; task|session|improvements → POST /api/item; other files → socket append
  read(lines)                     // skip own echo (text without by/ts); else replaying = true; host.replay_line(line)

class PageLogReader extends Store // core/Page/Reader.js — a page.jsonl's store; line 1 built the page
  attach(host)                    // like Store's, but WITHOUT the muted and owned_below checks

class Page extends Item           // core/Page/Page.class.js
  bubbles() → false               // a page is always the root of its own file
  set(obj)                        // ONE argument only; a "content" key goes to content.fill
  content: PageContent            // made on first use; get("content") routes to it; code parts are transient (never written)
  pages: List                     // made on first use; NOT routed by get(), listed as "_pages" → its verbs don't replay
```

## The line each change writes (the root holds the store)

| Change | Line written | Replays today? |
|---|---|---|
| a field on the root | `{"set":{"title":"Plan"}}` | yes |
| a list verb on the root's list | `{"cards":{"add":{"id":"c1","type":"Card","after":null,"title":"…"}}}` | yes, if code built `cards` first or the class makes it on demand |
| a list verb two levels down | `{"c1":{"notes":{"add":{…}}}}` | yes, only if `c1`'s class makes `notes` on demand (Task's pattern) |
| a field two levels down | `{"c1":{"n1":{"set":{"text":"…"}}}}` | yes, but the list names are dropped: two lists with one id misroute |
| a move across lists | `{"c2":{"notes":{"move":{"id":"n1","after":null,"from":"cards/c1/notes"}}}}` | yes; `from` is the old `/` path, read by the "compat only" `locate()` |
| an Item set as a property | `{"set":{"x":{"type":"Item","id":"k","data":{}}}}` | as a plain object; the item is never adopted |
| a change inside that property-held Item | nothing, or (if its `parent` was set by hand) `{"set":{…}}` flat on the parent | wrong |
| an agent's line (item tool) | `{"cards":{"c1":{"set":{…}}},"by":"agent","ts":"…"}` (names the list) | yes |
| a hook's raw line | whatever the hook writes | yes, if it is valid; nothing checked it |

## The three paths

```
UI      item.set / list verb → emit "delta" (origin) → climbs parent → root.store → hops + wrap → one line
          → POST /api/item (Servex: try_line on its live root, + by/ts, append)   [task, session, improvements files]
          → or socket append (Append.js: shape check, append)                        [page.jsonl and other logs]
AI      item({path, delta}) → expand_dots → try_line on Servex's live root → + by/ts → append
HOOK    fs.appendFileSync (no check, no by/ts unless the hook adds them)
          ─── all three end in one appended line ───
FILE    dev server fs.watch → Tail.changed: new whole lines past ONE shared offset per file → "jsonl" frame to each subscribed socket
TAB     live.js → store.read: own echo skipped; else replay_line → set → get, hop by hop → the item changes (no line written back)
```
