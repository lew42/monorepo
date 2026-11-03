# Minion A — `Events`, `List`, `LiveList`, `Item` (no list methods), `Store`

Load the `minion` skill first, then the `code` skill.

**The owner's words (2026-10-02):** "Page extends item? I thought we already agreed on that." Approved; build it.
Design: [page-item-design.md](../../../../../09/30/proposal-flow/page-item-design.md) — **the TOP section ("LATEST … fourth pass") rules.** Every older section is superseded where it disagrees.
Parent brief: [../requirements.md](../requirements.md). Decisions: [../task.jsonl](../task.jsonl).

⚠ **Fourth version of this brief.** The owner reversed "Item extends LiveList": a list is now a PROPERTY, not a parent. If you wrote code for the old shape, adapt it; don't restart.

**Work ONLY in the worktree** `C:\Code\lew42\worktrees\page-extends-item` (branch `worktree/page-extends-item`, server http://localhost:59417/). Commit after each finished piece, by exact path. Never write the main tree except your own task.jsonl.

## The shape (from the design)
```
Events(Base)                 mixin: on / off / emit; events bubble to .parent
List                         items: [] plain array + small helpers (data only)
 └─ LiveList = Events(List)  add(x,{after}) remove(id) move(id,{after}) order([ids]) find(id); each change emits its line
Item = Events(Object)        a thing: id, icon, title, data, get / set(delta), store, view. NO list methods
 └─ Page                     (minion B) pages: LiveList, content: LiveList
```
**Composition for lists:** an Item that needs children gives itself a LiveList property named for what it holds (`panel.items`, `page.pages`, `page.content`). The list's whole API lives on the list.

## Fence
- `core/Events/Events.js` (new) + a short `readme.md`
- `core/List/List.js` (rename its array `children` → `items`), `core/List/LiveList.js` (new)
- `core/Item/Item.js` (rewrite), `core/Item/Store.js` (new)
- Callers: `ext/Draggable/Sortable.js`, `ext/Panel/Panel.js`, `ext/Panel/flow.js`, `ext/Panel/Workspace/Workspace.js`, `ext/editor/page.js`, `ext/editor/blocks.js`, `ext/Draggable/page.js`, `core/Item/page.js`, `core/List/page.js`
- `ai/sessions/2026/10/02/page-extends-item/page-extends-item/item-core/test.mjs` (node; pass/fail per claim; non-zero exit on failure)
- NOT core/Page/*.

## Deliverables
1. **`Events(Base = Object)`** — `export const Events = Base => class extends Base { on, off, emit, bubbles }`. Listeners in `this._on` (lazy). `emit(event, ...args)` calls `fn.call(this, ...args)`, then bubbles to `this.parent` while `this.bubbles(event)` is true (default true; Page returns false).
2. **`List`** — `items: []` plus its small helpers (`length`, iteration, `find(fn)`, `index_of`, `append`, `insert_before`, `remove`, `toJSON`). Data only, no events. `adopt` sets `x.parent = this`.
3. **`LiveList extends Events(List)`** — a member is anything with an id (`key(x)` seam, default `x.id`). Fields: `owner` (the Item holding it) and `name` (its property name, e.g. `"items"`, `"content"`); `parent` is the owner, so events bubble list → owner → up.
   - `add(x, {after})` — absent = append, `null` = first, an id = after it (unknown → append); an id already present → no-op (echo/replay safe). A plain object is turned into a member by the `make(delta)` seam (default: `this.of.hydrate(delta)` when `of` is set, else kept as is; Item.js sets the default `of` to Item without a circular import).
   - `remove(id | x)`, `move(id | x, {after | before, from})` (`before` = a member or null, for drag callers; `from` = the LiveList it leaves when changing lists: it leaves quietly, the ONE event is the move), `order([ids])` (listed in that order; an unlisted id keeps its place right after its old previous neighbour, or first if it had none; unknown ids ignored), `find(id)` (shallow).
   - Seams `adopted(x)` / `released(x)` on every insertion/removal. A quiet `insert(x, {after})` and `replace(old, x)` that do NOT emit (loading is not a change).
   - **Each change emits an event shaped exactly like the line it saves**: `emit(verb, line)` with `{"add": {id, type?, after, ...data}}`, `{"remove": id}`, `{"move": {id, after, from?}}`, `{"order": [ids]}`; plus one uniform `emit("delta", line, this)`. `after` is always the real previous id or null.
   - `set(delta)` on a LiveList: a key naming a verb calls it (so a replayed `{"content": {"add": …}}` routes through the nested-delta rule, below). `toJSON()` → array of member JSON.
4. **`Item = Events(Object)`** — about 12 methods, none of them list verbs:
   - `id` (`this.id ??= this.constructor.new_id()`; `static new_id()` → `crypto.randomUUID()`), `data`, `get(key)` / `put(key, value)` (seams over `data`; Page overrides them for the instance). Title and icon are data.
   - **One `set(delta)`**, per key in order: `set("k", v)` = `set({k: v})`; an `at` key first → `this.locate(path).set(rest)` (`locate` walks `/` segments: a property holding an Item or LiveList, then a member by id; unknown → warn once, ignore); skip `constructor`, `__proto__`, `_*`; a key naming a method → call it; a value whose current holder has its own `set()` and is not a Map → nested delta; else `put(key, value)`, and if changed `emit("change", key, value, old)` + `emit("delta", {set: {[key]: value}}, this)`.
   - `remove()` (me from my list), `root`, `walk(fn)` and deep `find(id)` over every LiveList property (a `lists()` seam returns them), `toJSON()` (each LiveList property as an array under its name), `static hydrate`, `register`, `save`/`delete`/`open(saver)` keep working.
   - `view` — the icon item: `static View` (shows icon + title), lazy accessor pair `get view(){ return this._view ??= … }` / `set view(v){ this._view = v }`. Must load in node without the DOM (lazy import or skip; say which).
   - **Callers that build trees** (Panel, editor, Draggable, Item/List demos) give their node class an `items` LiveList and call the list: `parent.items.add(kid)`, `parent.items.move(kid, {before, from: kid.parent})`. Panel may keep its own `add`/`move` helpers as Panel's methods if that is the smaller change; say which. Sortable's drop calls the target list's `move` (it still imports neither Item nor List). `x.items.children` → `x.items.items` is ugly: give List an iterator, `forEach`, `map`, `length`, `at(i)` so callers write `x.items.forEach(…)`.
5. **Recording lives in ONE place: the store host.** `store.attach(host)` subscribes `host.on("delta", (line, origin) => …)`: unless `store.replaying`, append `{at: <path from host to origin, omitted when origin is host>, ...line}`; the path is property names and member ids (`content`, `content/abc`); a move's `from` list is converted the same way. Any change at any depth writes exactly ONE line; replaying those lines through `host.set(line)` rebuilds the same tree.
6. **`static Store` on Item** — `core/Item/Store.js`, `Item.Store = Store`; `item.store` is the default store. **One Store per file:** `static for(url)` (a static Map).
   - Fields `url`, `host`, `entries = []`, `count = 0`, `offset`, `replaying`; constructor `(...args) → Object.assign`.
   - `load()` fetch + parse (torn line skipped with a warning; HTML at 200 = missing); `parse(text)`; `read(entries)`: host attached → each `host.set(entry)` with `replaying = true`; else held. **Echo skip**: an entry equal (JSON string) to a sent-not-yet-seen line is skipped (multiset).
   - `attach(host)` → `host.store = this`, `this.host = host`, the delta listener, replay held entries.
   - `open()` → on localhost (`localhost`, `127.0.0.1`, `*.localhost`) dynamic `import("../../../../../../../2026-10-02/ext/JSONL/live.js")` and `stream(this, () => this.changed())` (read live.js: it drives `url`, `offset`, `parse`, `read`, `load`, `reset`); elsewhere `load()`.
   - `append(line)` → queue; one `queueMicrotask` flush per tick, ONE call: `(await import("/framework/dev/Socket/Socket.js")).default.singleton().async_rpc("append", <url pathname>, [json strings])`. Off localhost: memory only, warn once. `writable` getter. `changed()` / `reset()` hooks. Keep method names `PageLog.Reader` (bottom of `core/Page/Log.js`) uses, since B makes it `extends Item.Store`.
   - `static async Item.open(src)`: a .jsonl url → `Store.for(url)`, open, host from line 1, attach, return. A Saver object keeps the whole-JSON path.
7. **`test.mjs`** in node (stub store): Events on/off/emit/bubble and `bubbles()` false; List helpers; LiveList add after/null/absent, idempotent add, remove, move within and across lists, order with an unlisted id, each line-shaped event; quiet insert/replace emit nothing; Item has no `add`/`move`/`order`; set sugar, change events, method keys, nested delta into a LiveList property, `at` paths; one line per live change at any depth; nothing during replay; replay into a fresh host gives the same `toJSON()`.

## Rules
- House style (the `code` skill): assign-based OOP, every method a seam, parts as statics. Clear beats brief.
- Must not break `/framework/ext/Panel/`, `/framework/ext/editor/`, `/framework/ext/Draggable/`, `/framework/core/Item/`, `/framework/core/List/`: load each headless on http://localhost:59417 (Playwright, scratch scripts `pei-a-*.mjs` in the session scratchpad): zero console errors, and a drag still works on Draggable (one gesture, screenshot).
- Every Node spawn sets `windowsHide: true`. Stop anything you start.
- Log decisions and caveats in your task.jsonl. End your turn with a one-screen summary: files, test result, smoke result, anything not done.
