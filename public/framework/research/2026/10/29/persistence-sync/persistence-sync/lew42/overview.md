# lew42 framework: persistence, change tracking and streaming

Studied: branch `integration/data-shapes-2`, commit [`9ba46ee`](https://github.com/lew42/monorepo/tree/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895) (2026-10-28, "ready to merge, not merged"). Author: lew42-study agent, 2026-10-29/30.

All code links below are permalinks to that commit. Paths are from the repo root.

Contents: 1 Summary · 2 Glossary · 3 Change flow · 4 File layout · 5 Design direction · 6 Decision axes · 7 Gaps and risks · 8 Test harness · 9 What changed from michael/dev

---

## 1. Summary

Every saved thing is an **Item**: an id, a `data` bag, and any number of named **Lists** of child Items. A change is one call, `item.set(delta)`. The item emits a `delta` event that bubbles up its `parent` chain to the **root**, the item that owns a file. The root's **Store** turns the event into one JSON line, nested one key per hop from the root down to the change (`{"tasks":{"c3":{"set":{"title":"x"}}}}`), and appends it to the root's `.jsonl` file. Opening the file replays every line through the same `set()`, so the line is both the storage format and the API call.

On the dev machine, a recursive `fs.watch` sees the append, a tailer reads only the new bytes, and one WebSocket per browser tab pushes them to every tab subscribed to that file; each tab replays them with `set()`. Agents and the browser write record files through one Node entry point (Servex `POST /api/item`), which first applies the line to a live in-memory root, then appends. There is no merge or conflict logic: the file's line order is the only order. In production (static Cloudflare hosting) the files are fetched once, read-only, with no streaming.

---

## 2. Glossary


- **Item**: the base class of every persistent object: `id`, `data`, `set()`, `get()`, `toJSON()`, `hydrate()`, `open(url)`. No DOM, runs in node. [Item.js L31-L543](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L31-L543)
- **delta**: one plain object handed to `set()`; also exactly one saved line. Keys are method names, child names or data fields. [Item.js L115-L153](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L115-L153)
- **Events**: the `on/off/emit` mixin; `emit` bubbles to `.parent` unless `bubbles()` says no. [Events.js L6-L30](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Events/Events.js#L6-L30)
- **List**: an ordered, evented collection of Items, held by an Item as a named property (`item.tasks`, `page.content`). `List extends Item`. Verbs: `add`, `remove`, `move`, `order`, `clear`. [List.js L53-L387](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L53-L387)
- **owner / parent**: a List's `owner` is the Item holding it; a member's `parent` is that Item, never the List. [List.js L137-L145](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L137-L145)
- **slot / adopt**: `item.set("prop", otherItem)` adopts it: parent = item, `_slot` = "prop", so its changes are written under `prop`. [Item.js L195-L204](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L195-L204)
- **Store (`Item.Store`)**: one per `.jsonl` url. Loads, replays, listens for `delta` on its host, writes lines, tails live, skips its own echo. [Store.js L24-L228](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L24-L228)
- **store property**: `host.store`, set by `store.attach(host)`; "the root" is the item whose `store.host` is itself. [Store.js L135-L147](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L135-L147)
- **hops / wrap**: the Store's walk from the changed item up to the root, naming each step (list name, then member id, or slot name), then nesting the payload. [Store.js L245-L298](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L245-L298)
- **RecordWriter**: the caller's side of the "one writer": posts a record file's lines to Servex `/api/item`, stamps `by`/`ts`, falls back to a raw append without twins. [RecordWriter.js L17-L111](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L17-L111)
- **record file**: `task.jsonl`, `session.jsonl`, `page.jsonl`, `improvements.jsonl`: the files routed through the one writer. [RecordWriter.js L19](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L19)
- **one writer / item tool**: `record_lines` (raw lines) and `run_item` (verbs) in Servex: apply to the file's live root, then append. [page_tools.js L1094-L1139](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L1094-L1139)
- **live root**: Node's one replayed instance per file, kept while the file's size+mtime are unchanged (LRU of 1,000). [page_tools.js L770-L788](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L770-L788)
- **Ref**: a small Item that points at another item by `{path}` (same file) or `{url, path}` (another file); resolved lazily, follows `moved_to` forwards. [Ref.js L4-L25](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Ref.js#L4-L25)
- **moved_to (forward)**: a field left at an item's old place after a cross-file move; Refs follow it and re-path. [Item.js L281-L296](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L281-L296)
- **Dated / Dated.Index**: a collection filed by day (`<root>/YYYY/MM/DD/<slug>/`) plus a per-day `index.jsonl` of pointer rows. [Dated.js L6-L66](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Dated.js#L6-L66)
- **steps**: a class's core test written as an array of `{title, code, run, check, show}`, run in node and drawn on the class page. [Item.steps.js L9-L58](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.steps.js#L9-L58)
- **life**: data for the Item class page's life-cycle picture: who changes an item and the hops a change takes. [Item.life.js L5-L19](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.life.js#L5-L19)
- **act(verb)**: a button runs the method locally but records only the verb line (`{"start":{}}`), not the `set` lines it caused. [Item.js L102-L113](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L102-L113)
- **Page**: an Item with a url; a folder with `page.js` (code) or `page.jsonl` (a log). Its id is its folder name; its events stop at the page. [Page.class.js L33-L92](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Page.class.js#L33-L92)
- **page.pages / page.content**: a page's two Lists: sub-pages (keyed by name) and visible parts. [Page.class.js L95](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Page.class.js#L95), [L132](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Page.class.js#L132)
- **Page.Reader**: the Store subclass for a `page.jsonl`: line 1 builds the page, the rest replay; redraws on live lines. [Reader.js L4-L63](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Reader.js#L4-L63)
- **Log (PageLog)**: the old middle class between Page and Item, folded into Page on 2026-10-03; now only a re-export. [Log.js L1-L16](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Log.js#L1-L16)
- **Listing**: a folder's file list, built from `files.jsonl` (or a jsonl page's own `file` lines); latest line per first path segment wins. [Listing.js L4-L82](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Listing.js#L4-L82)
- **page.jsonl**: a page as a log: line 1 is the constructor's fields, each later line one `set()`. [doc/jsonl.md L13-L42](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/jsonl.md#L13-L42)
- **files.jsonl**: `{"file":"x"}` / `{"file":"x","gone":true}` per file that appears or goes, written by the dev server's watcher. [PageFiles.js L5-L25](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/PageFiles.js#L5-L25)
- **weight.jsonl**: a page's importance: `{"weight":10}` (latest wins), `{"referenced_by":…}`, `{"ai_cost":…}` lines from node scripts. [weight design.md](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/weight/doc/design.md)
- **Tail**: the dev server's per-file, per-socket byte-offset tailer that sends new whole lines as `jsonl` frames. [Tail.js L83-L140](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L83-L140)
- **Append**: the dev server's `rpc:append` handler: schema-check, twin-check, `appendFileSync`. [Append.js L46-L106](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.js#L46-L106)
- **live.js `stream()`**: the browser half: subscribe, apply frames past the reader's own offset, resubscribe on reconnect, pause when the page is left. [live.js L111-L135](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L111-L135)
- **FsFile**: "the one file API" in the browser: `append`/`send` lines over the socket; `write` refuses a `.jsonl`. [FsFile.js L97-L166](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/filesystem/FsFile.js#L97-L166)
- **jsonl-schema / jsonl-guard**: per-file-kind verb schemas checked on write; a hook that blocks hand edits of `.jsonl` files. [jsonl-schema.mjs L1-L24](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.claude/hooks/jsonl-schema.mjs#L1-L24), [jsonl-guard.mjs L1-L20](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.claude/hooks/jsonl-guard.mjs#L1-L20)
- **Servex**: the always-on Node process that runs agents and hosts the one writer at `POST /api/item` (loopback only). [Servex.js L683-L692](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/Servex.js#L683-L692)

---

## 3. Change flow, end to end

A worked example from the repo's own demo class, `Box` (an Item with one List, `items`). These lines were produced by running the real `Store.line_for` on this commit:

```jsonc
{"set":{"title":"Weekly"}}                                    // shop.set({title})
{"items":{"add":{"id":"milk","type":"Box","after":null,"title":"Milk","count":1}}}
{"items":{"milk":{"set":{"count":2}}}}                        // milk.set({count: 2})
{"items":{"milk":{"items":{"oat":{"set":{"brand":"X"}}}}}}    // two levels down
{"items":{"move":{"id":"milk","after":null}}}
{"items":{"order":["bread","milk"]}}
{"items":{"remove":"bread"}}
{"items":{"move":{"id":"oat","after":"milk","from":"items.milk.items"}}}
{"set":{"badge":{"type":"Item","id":"tag1","data":{"label":"big sale"}}}}  // adopt
{"badge":{"set":{"label":"big sale"}}}
{"items":{"add":{"id":"r1","type":"Ref","after":"oat","path":"items.milk"}}}
```

### Step 1: `item.set(delta)`

1. `set(a, b)` turns `set("k", v)` into `set({k: v})`, then `apply()`. An array delta is applied in order. [Item.js L97-L153](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L97-L153)
2. `set_one(key, value)`, per key, in key order: skip `_`-keys and `constructor`; a dotted key is split (`"tasks.c3"` → `{tasks:{c3:…}}`); a key naming a **method** calls it (so `add`, `move`, `start` are verbs); a key whose `get()` finds something with its own `set()` hands the value down (that is how nesting routes); otherwise it is data. [Item.js L155-L193](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L155-L193)
3. For data: `put(key, value)`, and only if the value changed: `emit("change", key, value, old)` and `emit("delta", {set:{[key]:value}}, this)`. [Item.js L186-L192](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L186-L192)
4. A field declared in `static fields` is an accessor, so `item.title = "x"` also goes through `set()`. Constructor arguments go straight into `data` with no event. [Item.js L33-L95](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L33-L95)

### Step 2: events

5. `emit` calls local listeners, then re-emits on `this.parent`, unchanged, all the way up. `Page` returns `bubbles() = false`, so a page's events stop at the page. [Events.js L19-L29](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Events/Events.js#L19-L29), [Page.class.js L71](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Page.class.js#L71)
6. A List verb emits the verb event (`add`, `move`…) and a `delta` whose origin is the List itself. [List.js L264-L269](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L264-L269)
7. Every List change bumps `Item.generation`, which invalidates the deep `find(id)` index. [Item.js L324-L337](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L324-L337)

### Step 3: `item.store` turns the event into one line

8. `store.attach(host)` installs one `delta` listener on the root. It ignores events while replaying, while `Store.muted` (inside `act()`), and from a descendant that has its own store or `_own_file`. [Store.js L135-L147](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L135-L147), [L239-L243](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L239-L243)
9. `line_for` → `hops(origin, host)`: walk from the origin up to the root. A List origin contributes its own name; a member contributes `<list name>, <id>`; an adopted item contributes its slot name. Then `wrap` nests the payload. A cross-list move's `from` becomes a dotted path string inside the payload. [Store.js L149-L166](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L149-L166), [L245-L298](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L245-L298)
10. **Nested property change:** `{"items":{"milk":{"items":{"oat":{"set":{"brand":"X"}}}}}}`. Every hop names its list since 2026-10-28; older id-only lines (`{"milk":{…}}`) still replay by searching lists, counted in `Item.old_hops`. [Item.js L168-L184](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L168-L184)

### Step 4: what gets written

11. **Batching:** `append(line)` queues; one microtask later `flush()` sends the whole tick's lines in one call. No debounce beyond that: each `set()` is a line. [Store.js L168-L214](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L168-L214)
12. Each sent line is remembered as text in `store.sent` for echo suppression. [Store.js L193](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L193)
13. **Record files** go through `RecordWriter.post` to Servex `/api/item`: page lines raw (one request), task/session lines as verbs (one request each). Each line gets `by` and a millisecond `ts` unique per writer. [RecordWriter.js L33-L65](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L33-L65)
14. **Servex** (`record_lines`): skip a line whose `by|ts` is already in the file's last 64 KB; schema-check page lines; apply to the warm live root (refuse if it throws); `appendFileSync`. [page_tools.js L1101-L1119](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L1101-L1119), [write_line L175-L184](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L175-L184)
15. **Fallback / other files:** `FsFile.send` → socket `rpc:append` → `Append.js` (schema check, same twin check, `appendFileSync`). [Append.js L65-L100](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.js#L65-L100)
16. Agents write with `item({path, delta})` / `page_set`: the tool validates against the class, stamps ids on every `add` (`stamp_ids`), nests a `target`, writes, then advances the live root. [page_tools.js L1151-L1236](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L1151-L1236)

Real lines from the repo:

```jsonc
// public/framework/core/Page/tool/page.jsonl, lines 1, 2, 4
{"title":"Page tool","icon":"edit_note","description":"Agents change this page live…"}
{"content":{"add":{"id":"what","title":"What this page is","text":"Every line below…"}}}
{"notes":{"content":{"add":{"id":"n1","title":"First note","text":"Added inside the new tab.","by":"mastermind-page-system","ts":"2026-10-09T22:32:21.664Z"}}}}

// public/framework/ai/sessions/2026/10/03/cards/now/page.jsonl, lines 40 and 51
{"content":{"move":{"id":"talking","after":null}},"by":"vscode-mastermind","ts":"2026-10-03T13:21:19-05:00"}
{"content":{"remove":"working"},"by":"vscode-mastermind","ts":"2026-10-03T13:30:28-05:00"}

// public/framework/ai/sessions/2026/10/20/session-e00f55c9/session.jsonl, line 13
{"tasks":{"item-system-ui-actions-save-as-deltas-to":{"start":{}}},"by":"agent","ts":"2026-10-23T01:51:33.999Z"}
```

Sources: [tool/page.jsonl](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/tool/page.jsonl#L1-L4), [cards/now/page.jsonl L40](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/sessions/2026/10/03/cards/now/page.jsonl#L40), [L51](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/sessions/2026/10/03/cards/now/page.jsonl#L51), [session.jsonl L13](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/sessions/2026/10/20/session-e00f55c9/session.jsonl#L13). The same card file's lines 8-26 show the older bug the "every hop names its list" fix addressed: flat `{"move":{…}}` lines with no list name.

### Step 5: server watcher and streaming

17. One recursive `fs.watch` on `public/` (with an mtime filter). A `.jsonl` change goes to `Tail.changed`, never to page reload. [watch.js L57-L60](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/watch.js#L57-L60), [LiveReload.js L143-L144](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/LiveReload.js#L143-L144)
18. `Tail` keeps a **byte offset per socket per file**. It reads from the offset to the last `\n` (a half-written last line waits), and sends `jsonl(path, lines, offset, from, ends)`. A file smaller than the offset gets `jsonl_reset`. Never debounced. [Tail.js L52-L103](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L52-L103)

### Step 6: other clients

19. `live.js` applies only lines that end past this reader's own offset (two readers of one file in one tab share the socket), then calls `store.read()`. [live.js L35-L51](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L35-L51)
20. `Store.read` drops a line that matches, text for text (minus `by`/`ts`), one this store sent and hasn't seen back yet: the **echo skip**. Every other line is replayed with `replaying = true`, then one `read` event fires on the root. [Store.js L98-L130](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L98-L130)
21. Views redraw from List verb events (`add/remove/move/order/clear`) and the `read` event; `Page.Reader.changed()` redraws the log, tabs and nav. [PageContent.js L139-L140](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/PageContent.js#L139-L140), [Reader.js L46-L54](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Reader.js#L46-L54)
22. Reconnect: the socket re-subscribes every stream from its stored offset; a page that is left is paused (unsubscribed) and resumed from its offset when shown again. [live.js L66-L109](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L66-L109)
23. Agents hear changes separately: `Servex/Follow.js` (chokidar) batches followed logs into messages; node's live root re-replays when the file's size/mtime changed from outside. [one-stream.md L5-L13](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/one-stream.md#L5-L13)

### Step 7: load and replay on startup

24. `Item.open(url)`: one Store and one root per url (a second open gets the same live object). Line 1's `type`/`class` picks the root class; line 1 becomes the root's fields; the rest replay. [Item.js L498-L542](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L498-L542)
25. On localhost the load **is** a subscribe from offset 0; elsewhere one `fetch`. An unparseable line is skipped with a warning; the SPA fallback's HTML answer counts as "no file". [Store.js L44-L96](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L44-L96)
26. `replay_line` strips `by`/`ts` into `Item.clock` while the line applies, then calls `set()`. [Item.js L468-L480](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L468-L480)
27. A list `add` line is hydrated into the List's member class (`of`), quietly (`insert`, no event); an `{type,id,data}` envelope put in a property is hydrated back into an Item. [Item.js L405-L447](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L405-L447)
28. Speed: the 8,360-line voice session replays in about 200 ms after the 2026-10-28 fixes (`lists()` cache, id Maps). [Item readme L94](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/readme.md#L94)

### List operations

- **insert:** `add(x, {after: id|null})`, written `{"add":{"id","type","after",…data}}`. `after: null` = first; a missing anchor id = append. An id already present is a no-op. [List.js L203-L288](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L203-L288)
- **remove:** `{"remove":"<id>"}`. **clear:** `{"clear":true}`. [List.js L290-L317](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L290-L317)
- **move:** `{"move":{"id","after","from"?}}`, `from` a dotted path when it crosses lists; a cross-list move re-paths same-file Refs. [List.js L319-L352](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L319-L352)
- **reorder:** `{"order":["id",…]}`, one line; unnamed members keep their place after their old neighbour. [List.js L354-L374](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L354-L374)
- **replace:** `replace(old, x)` is quiet: no event, no line (used for loading stubs). [List.js L249-L262](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L249-L262)
- **reset:** no list "reset" op. A file that shrinks gets `jsonl_reset` and is re-read from offset 0. [live.js L53-L64](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L53-L64)
- Every verb addresses members **by id, never by index**. Lookup is an id→member `Map`. [List.js L91-L122](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L91-L122)

### How child Pages nest

- A sub-page with its own folder is one line in the parent's `page.jsonl`: `{"file":"kid/page.jsonl"}` (or `"gone":true`). The parent links it as a child; the child's own log is opened when routed to. [Jsonl.js L60-L98](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Jsonl.js#L60-L98)
- An embedded child (a tab) is `{"tab":{"name","title","content"}}` in the parent's log; agents address its content as `{"notes":{"content":{"add":…}}}`. [Jsonl.js L100-L128](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Jsonl.js#L100-L128), [subpages.md L5-L12](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/subpages.md#L5-L12)
- Tasks do the same with `{"task":"<folder url>","as":"<id>"}` and `{"file":"<id>/task.jsonl"}`; such a child is `_own_file`, so the parent's Store never records its changes. [Task.js L467-L487](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Task/Task.js#L467-L487)

### References (Ref)

- Written as a list member: `{"chat":{"add":{"type":"Ref","path":"tasks.ui"}}}`; across files `{"type":"Ref","url":"<folder or .jsonl>","path":"tasks.ui"}`. Only the address is stored, never a copy. [Ref.js L4-L25](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Ref.js#L4-L25)
- Resolution: `Item.open(url)`, then `root.get(path)`; on a miss, the last path part as an id via `root.find()`; then follow up to 8 `moved_to` forwards, rewriting itself with one line. Missing = a visible "gone" row. [Ref.js L32-L107](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Ref.js#L32-L107)
- Backlinks within a file are computed in memory, never saved. [Ref.js L128-L164](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Ref.js#L128-L164)

### Ids, ordering, and the rest

- **Ids:** 8 random base-36 characters, letter first, no dots (`Item.short_id`); code-made structure uses fixed names; a Page's id is its folder name; ids are unique among siblings only. [Item.js L377-L387](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L377-L387), [ids-and-paths.md L13-L29](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Session/tasks/data-shapes/ids-and-paths.md#L13-L29)
- **Ordering:** the order of lines in the file is the only global order. The writer applies its own change before the file has it.
- **Sequence numbers:** none. The stream cursor is a byte offset; `ts` is a writer-unique millisecond stamp used only for twin detection.
- **Acknowledgments:** `FsFile.send` awaits `"append successful"`; `RecordWriter.post` awaits `{ok, refused}`. A failure is a console warning; nothing retries. [FsFile.js L156-L166](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/filesystem/FsFile.js#L156-L166)
- **Snapshots / compaction:** none built. `Compact.mjs` is dry-run only; `FsFile.clear()` exists for a future compactor. [Compact.mjs L1-L3](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/Compact.mjs#L1-L3), [FsFile.js L116-L125](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/filesystem/FsFile.js#L116-L125)
- **Partial last line:** readers skip it (`parse`), `Tail` waits for its `\n`; `RecordWriter.append_once` adds a leading `\n` before appending. `Append.js` and `write_line` do not (see gap 5). No `fsync` anywhere. [Store.js L80-L96](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L80-L96), [RecordWriter.js L89-L99](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L89-L99)
- **Schema versioning:** no version field. Writes are checked against per-file-kind verb lists; old shapes are read by compat branches (`at` lines, id-only hops), marked DEPRECATED with a removal condition. Unknown `type`s are kept as plain Items with their wire name. [Item.js L136-L146](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L136-L146), [Item.js L420-L421](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L420-L421)
- **Undo:** not in Item. `ext/editor/History.js` keeps whole-document snapshots; repo-wide, "Git is the undo". [History.js L1-L12](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/editor/History.js#L1-L12), [CLAUDE.md L34](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/CLAUDE.md#L34)

---

## 4. File layout on disk

Everything lives under `public/` and is committed to git (machine indexes are git-ignored). Counts at this commit: 10,341 `.jsonl` files, of which 1,170 `page.jsonl`, 3,900 `files.jsonl`, 1,830 `session.jsonl`, 2,092 `task.jsonl`.

**A page folder** ([Page readme L21-L31](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/readme.md#L21-L31)):

| File | Holds | Written by |
|---|---|---|
| `page.js` | the page as code | a person or agent |
| `page.jsonl` | the page as a log (line 1 = fields) | page tools, browser Store |
| `files.jsonl` | the folder's file list | dev server watcher (`PageFiles.js`) |
| `settings.jsonl` | the page's own prefs (tab weight) | page tools |
| `inbox.jsonl` | notes left on the page | `page_note`, Servex |
| `weight.jsonl` | weight, references, AI cost | node scripts (`page-refs.mjs`) |
| `readme.md`, `doc/*.md` | docs, shown at `md/` | people, agents |

A jsonl page (no `page.js`) keeps its file list inside its own `page.jsonl`, not in `files.jsonl`. [PageFiles.js L13-L21](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/PageFiles.js#L13-L21)

**A session or task** (the `Dated` store, `public/framework/ai/sessions/YYYY/MM/DD/<slug>/`):

- `session.jsonl` (or `task.jsonl`): the record, line 1 `{"session":{…}}` or `{"assign":{…}}`; nested tasks are `{"tasks":{"add":…}}` lines.
- `page.jsonl`: the session page's cards and tabs.
- `<child>/task.jsonl`: a task given its own folder, referenced from the parent.
- `YYYY/MM/DD/index.jsonl` / `day.jsonl`: one pointer row per item per day. [Dated.js L8-L30](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Dated.js#L8-L30)

**An Item** has no file of its own unless it is a root: it "lives inside the parent's file, then in its own `thing.jsonl`, then its own `thing/` directory". [Item readme L85-L100](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/readme.md#L85-L100)

Largest logs: one `owner-prompts.jsonl` 7.6 MB; `session-e00f55c9/session.jsonl` 3.4 MB; `v-sq8y7db/session.jsonl` 2.7 MB.

---

## 5. Stated design direction

What the owner and the docs want, and where the code stands.

| Direction (brief quote) | Code today |
|---|---|
| "a JSONL file is the truth" ([one-stream.md L3](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/one-stream.md#L3)) | ✅ files are the only store; ⬜ the shared Node tail feeding live roots is "a design, not built" |
| "one data path, whether it's AI driven or UI driven" ([one-writer.md L3](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/one-writer.md#L3)) | ✅ record files via `/api/item`; ⚠ about 20 Servex/Server writers still append directly ([L18-L21](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/one-writer.md#L18-L21)) |
| "Adding is a reference by default" ([owner-2026-10-21 L8](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md#L8)) | ⬜ `List.add` always adopts and overwrites `parent`; `Ref` exists but is explicit |
| "Recursive auto-wiring" of persistence ([L9](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md#L9)) | ⚠ works for changes after adoption; an added subtree's existing children are not written (gap 4) |
| "Storage targets vary" ([L10](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md#L10)), "Storage is declared, not guessed" ([vision.md L21](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/vision.md#L21)) | ⬜ Backend/Journal/`home` designed ([storage.md L1-L36](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/storage.md#L1-L36)); slice 1 not built |
| "Subscribe is universal" ([L11](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md#L11)) | ⚠ per-file only; item-level subscribe = listen on the live item |
| "Deltas stay the primary mechanism; a snapshot is a cache" ([storage.md L140](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/storage.md#L140)) | ✅ deltas; ⬜ no snapshot line, no compaction ([design-decisions L33-L38](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L33-L38)) |
| "The cursor is a line number (`seq`), never a byte offset" ([storage.md L147](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/storage.md#L147)) | ❌ `Tail` and `live.js` resume by byte offset |
| "exactly one home that accepts writes" ([storage.md L171](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/storage.md#L171)); CRDT "Rejected" ([L177](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/storage.md#L177)) | ✅ one file per root; ⚠ but tabs apply optimistically, with no rebase (gap 1) |
| "No file over ~1 MB" ([architecture.md L75](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L75)) | ❌ several logs are 2.7-7.6 MB; tool answers `large: true` past 1 MB |
| "Every item has exactly one owner" ([design-decisions L19](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L19)) | ⚠ enforced by overwrite, not by refusal; adopt-or-ref not built ([L54](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L54)) |
| "A path uses dots, never slashes" ([ids-and-paths.md L15](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Session/tasks/data-shapes/ids-and-paths.md#L15)) | ✅ read everywhere; written nested |
| "Stream, don't poll" ([CLAUDE.md L37](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/CLAUDE.md#L37)) | ✅ on localhost; production has no stream |
| "File today, database later" ([architecture.md L80-L87](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L80-L87)) | ⬜ a Durable Object `Room` exists only for a demo, with its own `deltas` table and a row-id cursor ([room.js L13-L76](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/worker/room.js#L13-L76)) |
| Where the live instance runs: "each project's dev server" (fork F1, [plan.md L23](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Session/tasks/data-shapes/plan.md#L23)) | ⬜ it runs in Servex today |

Doc drift found: [architecture.md L68-L73](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/architecture.md#L68-L73) still says `new_id()` returns a UUID; the code returns `short_id()` ([Item.js L378](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L378)).

---

## 6. Positions on the decision axes

`persistence-sync/taxonomy.md` was still a skeleton when this was written, so these use the draft axis names.

- **Authority:** one append-only file per root is the truth; for record files, a Node live root (Servex) validates and applies before appending. Browsers apply optimistically. [page_tools.js L1101-L1119](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L1101-L1119)
- **Conflict handling:** none. File order decides; same-field writes are last-line-wins; no rebase of local optimistic changes; CRDTs explicitly rejected. [storage.md L177](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/storage.md#L177)
- **Change format:** nested JSON op per line: path as nested keys (list name, member id), leaf = method name (`set`, `add`, `move`, `start`…) and its argument. Field changes are state (`set`), list changes are ops. [Store.js L245-L298](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L245-L298)
- **List order:** id-anchored (`after: id|null`) inserts and moves, plus whole-list `order([ids])`; no fractional index, no tombstones. [List.js L203-L219](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L203-L219)
- **Persistence layout:** a folder per page/session; one JSONL per root with children inline; children can break out to their own folder, referenced by a `file`/`task` line. [Item readme L85-L100](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/readme.md#L85-L100)
- **Partitioning:** per root file; collections partitioned by day (`Dated`, per-day index files). [Dated.js L1-L30](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Dated.js#L1-L30)
- **Transport:** dev only. One WebSocket per tab with JSON RPC frames (`subscribe`, `jsonl`, `jsonl_reset`, `append`), byte-offset resume; writes also by HTTP `POST /api/item`. Production: static `fetch`, read-only. [Tail.js L75-L130](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L75-L130)
- **Client model:** each tab replays the whole file into a live object graph (one root per url); Node keeps up to 1,000 live roots. [Item.js L507-L521](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L507-L521)
- **Reactivity:** hand-rolled events (`change`, `delta`, `read`, list verbs) that bubble up the parent chain; views subscribe and redraw; `Property` for single values. No signals or proxies. [Events.js L6-L30](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Events/Events.js#L6-L30)
- **Query/search:** in memory: `get(path)`, `find(id)` via Maps; collections through day indexes and an in-memory query process (`ext/Query`); no database. [storage.md L164](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/storage.md#L165)
- **History/compaction:** full history kept forever (append-only, committed to git); no snapshot or compaction yet; undo is app-level snapshots or git. [architecture.md L63-L71](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L63-L71)

---

## 7. Gaps and risks (ranked)

Each gap says whether an existing test covers it. "Probe" means I reproduced it with a small script against this commit, using the real classes (scripts in the study agent's scratchpad, not in the repo).

### 1. Optimistic local apply, no rebase: tabs can diverge

The writer applies its change at once, skips its own echo, then applies any line that landed *earlier* in the file. Two tabs setting one field: probe result: file replay says "from B", tab A shows "from B", tab B shows "from A" until reload. Same for two concurrent anchored moves. [Store.js L98-L147](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L98-L147)
- Real? Yes when the owner's tab and an agent touch the same item.
- **Test:** none. `one-writer.test.mjs` checks Node's live root equals a fresh replay, not that each tab converges.

### 2. No sequence numbers or op ids

Order is byte position; the stream cursor is a byte offset; echo skip matches exact JSON text; twins are detected by `by|ts` in the last 64 KB. The docs' own requirement is a `seq` cursor. [Tail.js L52-L73](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L52-L73), [Store.js L123-L130](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L123-L130), [RecordWriter.js L67-L75](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L67-L75)
- **Test:** `Tail.test.mjs` covers per-socket offsets; `RecordWriter.test.mjs` covers the twin check. Nothing covers a writer that reshapes a line (echo then applied twice).

### 3. No snapshots or compaction: every open replays everything

Logs past the 1 MB goal already exist (3.4 MB session). Designed only; blocked on "a node-side replay that matches `Page.set()`". [architecture.md L63-L71](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L63-L71), [Compact.mjs L1-L3](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/Compact.mjs#L1-L3)
- **Test:** none (nothing built). Speed of the full replay is measured, not tested.

### 4. Adding an Item that already has children loses them on replay

`List.add` writes `{id, type, after, ...data}` only. Probe: add a `Box` holding one child; a replay of the lines has 0 children. [List.js L273-L288](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L273-L288)
- Real? Yes: code that builds a subtree, then adds it (the owner's "recursive auto-wiring" case).
- **Test:** none. The persistence matrix adds plain objects only.

### 5. A torn last line swallows the next good line

`Append.js` and Servex `write_line` append without checking for a trailing `\n`. Probe: file ends in a half line, `Append.js` answers "append successful", and the new line is glued into one unparseable line, so both are skipped on every load. `RecordWriter.append_once` handles it correctly. [Append.js L89-L94](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.js#L89-L94), [page_tools.js L175-L184](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L175-L184)
- Real? Needs a writer killed mid-append (crash, disk full, a hook timeout). No `fsync` anywhere.
- **Test:** `RecordWriter.test.mjs` covers `append_once` only. `Append.test.mjs` and the page tools have no torn-tail case. The delta-flow demo covers a half line that is later *completed*, not one left torn.

### 6. A failed or refused write leaves memory ahead of disk

The tab already applied the change. A refusal or a failed append is a console warning; nothing retries and nothing rolls back. A request sent just before a server restart can wait forever (`FsFile.send` has no timeout). [Store.js L180-L214](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L180-L214), [Socket.js L338-L359](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/dev/Socket/Socket.js#L338-L359)
- **Test:** `one-writer.test.mjs` covers down/slow/stubbed entry points (one line written). None checks the tab's state after a refusal.

### 7. An edit to a removed member poisons later edits of that id

`{"items":{"bread":{"set":…}}}` after `bread` was removed is stored as plain data on the List. Probe: re-add `bread`, then edit it again: the edit is swallowed into the List's `data`, the member keeps its old title. Cause: `List.get` tries the data bag before members. [List.js L191](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L191), [Item.js L222-L227](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L222-L227)
- Real? An agent editing a card the owner just removed, plus fixed-name ids that get re-added.
- **Test:** none.

### 8. An item in two lists: the last parent wins, silently

`List.adopt` overwrites `parent`; the first list still holds the object, but its changes are written only under the second. Adopt-or-ref is "LEANING", not built. [List.js L140-L145](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L140-L145), [design-decisions L51-L55](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L51-L55)
- **Test:** none.

### 9. Browser edits to an embedded tab page are not saved

`Page.bubbles()` is false, so a tab page's `content.add` or `set` in the browser writes nothing to the parent's `page.jsonl` (probe: only the parent's own add was written). Agents can still write to the tab through the page tool.
- Real? Only where a tab page has parts a person can change in the browser (a sortable content list, a button). [Page.class.js L71](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Page.class.js#L71), [Jsonl.js L100-L128](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Jsonl.js#L100-L128)
- **Test:** none. The persistence matrix covers a Page as its own file and a part nested in it, not an embedded tab.

### 10. A rewritten file is detected only if it shrank

`Tail` resets only when `size < offset`. A rewrite of equal or larger size streams from the old offset (mid-line). On reset, a plain `Store.reset()` only zeroes a counter, so the whole file replays onto the existing tree. [Tail.js L54-L57](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L54-L57), [Store.js L226-L227](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L226-L227)
- Real? A `git checkout` or a `FsFile.clear()` compaction while a tab is open.
- **Test:** none. `Stream.test.mjs` installs `jsonl_reset` but does not exercise it.

### 11. Writers still outside the one writer

About 20 Servex/Server modules `appendFileSync` record files directly; `inbox`, `board`, `day` files are not records at all. Each such write forces a full re-replay of the live root. [one-writer.md L18-L21](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/doc/one-writer.md#L18-L21)
- **Test:** `one-writer.test.mjs` covers the routed writers only.

### 12. Production has no writes and no streaming

Off localhost the Store loads once and keeps changes in memory. [Store.js L44-L61](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L44-L61), [L185-L191](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L185-L191)
- A scope fact, not a bug; it bounds every comparison. **Test:** n/a.

### 13. No cycle guard

`a.set("x", b); b.set("y", a)` makes each the other's parent; the next `delta` bubbles forever (probe: stack overflow in `emit`). [Item.js L199-L204](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L199-L204)
- Real? Only from code; a JSON line can't build it. Low.
- **Test:** none.

### 14. Smaller items

- O(file) work per tool write: `size_of` reads the whole log to count lines. [page_tools.js L186-L196](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L186-L196) Test: none.
- No schema version; compatibility lives in reader branches (`at` lines: ~1,810 still in history). [Item.js L136-L146](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L136-L146) Test: `delta-flow.test.mjs` and the backbone's replay-compare cover old lines replaying.
- An `add` after an anchor that was removed appends at the end (probe), and `order` drops unknown ids quietly. By design, but worth naming for list-order comparisons.

Not a gap: list ops are id-addressed, never index-addressed, and nothing rewrites a `.jsonl` whole (`FsFile.write` refuses it).

---

## 8. Test harness

How tests are written and run in this repo (needed for every "failing test first" spec).

- **A test is a plain Node script** named `X.test.mjs`, beside the class. It imports `core/Test/Test.js`, calls `t.ok(cond, msg)`, `t.eq(a, b, msg)`, `await t.throws(fn, re, msg)`, then `t.done()`, which prints `PASS name (n checks)` or `FAIL name: …` and sets `process.exitCode = 1`. Exit code 0 = pass. [Test.js L1-L44](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Test/Test.js#L1-L44)
- **Run one:** `node public/framework/core/Item/persistence.test.mjs`. **Run many:** `node public/framework/core/Test/TestRunner.mjs [folders…]` (each file in its own process, 60 s timeout, 4 at once; `--near <file>`, `--covers <file>`, `--watch`). Results are appended to `core/Test/results.jsonl`. [Test readme](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Test/readme.md)
- **Browser imports in node:** tests call `register(".../Servex/agents/site-hooks.mjs", import.meta.url)` so `/framework/…` imports map to `public/`; Page tests also import `core/Page/parts/kinds.js`.
- **Real files:** tests make a temp dir with `fs.mkdtempSync(os.tmpdir())` and swap only the Store's last step: `persistence.test.mjs`'s `DiskStore.flush()` appends stamped lines to a real file; a second "tab" tails it; a fresh replay is the third reader. [persistence.test.mjs L32-L48](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/persistence.test.mjs#L32-L48)
- **Socket tests:** `Tail.test.mjs` and `Stream.test.mjs` use a fake server-side socket object (`on`, `rpc`) and the real `Tail`/`live.js`; they `chdir` to the repo and write a pid-named folder under `public/` (so don't run them in a read-only checkout). [Tail.test.mjs L1-L30](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.test.mjs#L1-L30)
- **Steps:** a class's core test can be `X.steps.js` (an array of steps), run by `X.steps.test.mjs` in node and drawn on the class page. [Item.steps.js](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.steps.js)
- **Run here (all pass at this commit, temp dirs only):** `Item.test.mjs` (28), `Store.test.mjs` (10), `persistence.test.mjs` (82), `RecordWriter.test.mjs` (9), `List.test.mjs` (19), `Item.steps.test.mjs` (6), `delta-flow.test.mjs` (10).
- **Gap tests above** fit this harness directly: gaps 4, 7, 8, 9 and 13 need only `Item`, `List`, `Box` and a capturing Store; gaps 1 and 10 need two Stores on one temp file (the persistence matrix's `tab()` shape); gap 5 needs `Append.js` with a fake socket, run with `cwd` set to a temp folder that has a `public/` inside.

---

## 9. What changed from michael/dev

Compared with the `michael/dev` checkout available here, commit [`1ad279a`](https://github.com/lew42/monorepo/tree/1ad279a24338c60cc218bc6929ce0d68829d4e5c) (2026-10-02). The real `michael/dev` has moved on since (the plan cites merges on 10-25), so some of these may already be on it.

- **Addressing:** a line used to carry an `at` path string beside the delta (`{"at":"content/abc","set":…}`); now the nesting is the path and every hop names its list. `at` lines are still read. [old Store.js L108-L118](https://github.com/lew42/monorepo/blob/1ad279a24338c60cc218bc6929ce0d68829d4e5c/public/framework/core/Item/Store.js#L108-L118)
- **One List:** `List` (plain) and `LiveList = Events(List)` merged into one evented `List extends Item`, with an id→member Map. [old LiveList.js L15](https://github.com/lew42/monorepo/blob/1ad279a24338c60cc218bc6929ce0d68829d4e5c/public/framework/core/List/LiveList.js#L15)
- **Page:** `Page extends PageLog extends Item` became `Page extends Item`; `page.pages` replaces `page.children`. [old Log.js L34](https://github.com/lew42/monorepo/blob/1ad279a24338c60cc218bc6929ce0d68829d4e5c/public/framework/core/Page/Log.js#L34)
- **Ids:** UUIDs became 8-character random ids. [old Item.js L165](https://github.com/lew42/monorepo/blob/1ad279a24338c60cc218bc6929ce0d68829d4e5c/public/framework/core/Item/Item.js#L165)
- **One writer:** the browser Store sent straight to `FsFile.send`; now record files go through `RecordWriter` → Servex `/api/item` (apply, then append) with twin-proof fallback. [old Store.js L148-L153](https://github.com/lew42/monorepo/blob/1ad279a24338c60cc218bc6929ce0d68829d4e5c/public/framework/core/Item/Store.js#L148-L153)
- **Tail:** one shared offset per file (a second subscriber could steal a line) became one offset per socket, plus per-line `ends` so a second reader doesn't double-apply. [old Tail.js L5](https://github.com/lew42/monorepo/blob/1ad279a24338c60cc218bc6929ce0d68829d4e5c/Server/plugins/SocketServer/Tail.js#L5)
- **New:** `Ref` with forwards and backlinks, `Dated`, dotted paths, `set(prop, item)` adoption, `by`/`ts` held in `Item.clock`, `act(verb)`, the persistence matrix and delta-flow tests, and Node live roots for any registered class.
