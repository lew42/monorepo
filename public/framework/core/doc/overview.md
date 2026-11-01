# The core API in one page: pseudo-classes, then one change followed from click to reload

This page is a map, not a manual. Each class below gets one plain sentence and a sketch of its main fields and methods. The sketches are shortened on purpose (real names, real behavior, not every line). Each class links to its own readme for the rest.

**The one idea.** A thing you can see (a task, a page, a list of cards) is an `Item`. Every change to an Item is one small line of JSON, and the lines of one file are that Item's history. Open the file and replay the lines, and you get the Item back exactly as it was. The rest of core is this idea, plus a list, a page, a task, and the road a line takes to the disk and to your other tabs.

```
Events      on / off / emit                      the base of everything
 └ Item     id + data + set(delta) + a Store     one saved thing
    ├ List    an ordered, announcing group of Items
    ├ Page    an Item with a url, content and sub-pages
    └ Task    an Item with a state machine and a clock
       └ Session   a Task in its own dated folder
Property    one live value (separate; also an Events)
Store       one .jsonl file  <->  one Item (outside the tree)
Outbox      the numbered, acked road to the server (outside the tree)
```

## Events: say that something changed

`Events` is a mixin: `Events(Object)` is a small emitter. Everything that can announce a change is built on it.

```js
Events(Base)
  on(event, fn)       // listen
  off(event, fn)      // stop listening
  emit(event, ...args)// call my listeners, then my parent's (the event "bubbles" up)
  bubbles(event)      // true by default; return false to make a boundary
```

**How it works.** `emit` climbs the `parent` chain, so one listener on a root hears every change anywhere below it. That single trick is how one Store records a whole tree. More: [Events](../Events/readme.md).

## Item: one saved thing

An `Item` has an id, a bag of data, and one way to change it, `set(delta)`. A delta is a plain object, and every change anywhere in core is one.

```js
class Item extends Events(Object)
  id                        // short random id, like "k3f9x2ab"
  data                      // the plain values; read with get(), write with put() (put does not save)
  parent                    // set when it is inside another Item or List
  store                     // the Store that saves it (only the root of a file has one)

  set(key, value)           // change one thing (sugar for set({key: value}))
  set({ key: value, ... })  // change many; the ONE way an Item changes
  get(key)                  // a data value, a List the Item owns, or a child by id
  act(verb, args)           // run this[verb](args) but save the VERB, not the sets it made
  as_call(name, args, body) // the same, written inside a method, so callers never need act()
  remove()                  // leave my parent
  lists()                   // the Lists I own, by name
  find(id)                  // a descendant by id
  walk(fn)                  // visit me and everything under me
  toJSON()                  // { type, id, data, <list name>: [...] }

  static open(url)          // read a .jsonl, replay it, keep tailing it; ONE live root per url
  static replay(lines)      // the same without a file (node tests)
  static register(Class)    // so a saved {type:"Task"} becomes a Task again
```

**How `set` works.** For each key, in order: a key that names a method calls it; a key that names a child (a List or an Item) hands the value to that child as its own delta, so a line can walk down the tree; anything else is data. If a data value really changed, two events fire: `"delta"` first (the Store saves it), then `"change"` (views redraw). A throwing view cannot stop the save. `set` refuses a function, a DOM node or a cycle, because a line could not hold it.

### What a saved line looks like

A key's spelling says what it does (the `name()` / `#id` shape; [line-format.md](../Item/doc/line-format.md)):

```js
{ "title": "Hi" }                           // name      data, or a step into a child
{ "start()": {} }                           // name()    call the method start with this value
{ "tasks": { "#c3": { "set": { "title": "x" } } } }   // #id   the list item with id c3
```

- Every hop names its list: `tasks`, then the item. A reader does one `get()` per name and never searches.
- `Store.marked_lines` chooses the spelling the *writers* use. It is `false` today (bare ids and verbs: `{"tasks":{"c3":...}}`, `{"start":{}}`) because some node tools still read only that. Every reader in core reads both, always. Flip it when the tools are updated.
- A dotted key is the same path, flat: `{"tasks.c3.title": "x"}`.

### Hooks and calls

```js
class Panel extends Item {
  set_width(value){ this.put("width", Math.max(value, 100)); }   // a hook for the key "width"
  sort_by(key){ return this.as_call("sort_by", [key], () => { /* ...the work... */ }); }
}
```

- **`set_<key>(value)` is a hook.** `set()` calls it instead of storing the value; it stores with `this.put`. Calling `item.set_width(50)` by hand saves too. It runs live, from another tab, and on replay. [hooks.md](../Item/doc/hooks.md)
- **`as_call` saves a method as one line**, `{"sort_by()": "title"}`, instead of every set the method made. Only the outermost call is saved, and never during a replay. `item.act("start")` does the same from outside. [call.md](../Item/doc/call.md)
- **The scoped mute.** While a verb runs, saving is muted for *that item and what sits under it* (`Store.mute(item)`, `Store.muted_at(node)`). A write to an unrelated item during the verb is still saved. Replay is a different, global switch: while any store replays, no store saves (`Store.replay_depth`).

More: [Item readme](../Item/readme.md), [Replay lab](../Item/replay/readme.md) (press a button, reload, see what comes back).

## List: an ordered group of Items

A `List` is an Item that holds other Items in order. Every list announces its own changes, and every verb names an id, never a position, so a saved line still makes sense after the list changes shape.

```js
class List extends Item
  items                      // the array
  owner                      // the Item that holds me; my events go up to it
  name                       // my name on the owner: "tasks", "content", "pages"

  add(x, { after })          // x is an Item or a plain object (made into an Item)
  remove(id)                 // drop one
  move(id, { after, before, from })   // reorder, or move from another list
  order(ids)                 // set the whole order
  clear()
  find(id)                   // by id (a Map underneath, so fast)
  length  at(i)  map(fn)  each(fn)
```

**How it works.** An Item does not have children of its own. If it needs some, it *gives itself* a named List (`this.tasks = new List({ owner: this, name: "tasks" })`). Its lines then start with that name: `{"tasks": {"add": {...}}}`. More: [List](../List/readme.md).

## Page: an Item with a url

A `Page` is an Item that lives at a url: a folder with a `page.js` or a `page.jsonl`. It adds what a visitor needs: a title, content to draw, and sub-pages.

```js
class Page extends Item
  url, title, icon           // where it lives and how it is named
  content                    // a List of parts (heading, text, card); one saved line each
  pages                      // a List of sub-pages (page.children is the old name)
  render()                   // draw the content into the DOM
  child(name)                // find a sub-page: memory, then page.jsonl, then page.js, then a readme
  ext(name)                  // turn on an extension by name (below)
  static use(Ext)            // turn on an extension for EVERY page
  static load(url)           // what the Router calls to get a page
```

```js
// hello/page.js: a page is just this
import { Page, h1, p } from "/app.js";
export default new Page({ meta: import.meta, title: "Hello", content(){ h1("Hello"); p("Some text."); } });
```

**On disk.** A page is a folder. `page.jsonl` is its log (line 1 builds it, each later line is one `set`); `files.jsonl` is the folder's own file list, written automatically; every page also answers `<url>files/` (the **Files tab**): this folder's entries, one level, names only. On the dev server a file you make in an editor shows up there with no reload. More: [Page readme](../Page/readme.md), [how a page renders](../Page/doc/how-a-page-renders.md), [files.md](../Page/doc/files.md).

## Task: an Item with a state and a clock

A `Task` is one unit of work. It knows what state it is in, which verbs are allowed from there, how long it has run, and how far along its subtasks are.

```js
class Task extends Item
  state                      // idle | running | paused | waiting | stopped | complete
  tasks                      // a List of subtasks
  title, expected, outcome, priority, tags   // plain data

  start()  pause()  resume()  stop(why)  wait({on})  complete({outcome})   // the verbs
  can(verb)                  // is this verb allowed from this state?
  duration()                 // ran_ms + time since ran_since, computed
  progress()                 // done / total of the subtasks, computed
```

**How the clock works.** The time a task has run is saved, not remembered. `start()` saves `ran_since` (when the open stretch began) in the same line as `state: "running"`. `pause`, `stop` and `complete` save `ran_ms` (the time banked so far) and clear `ran_since`. `duration()` adds the banked time to the open stretch. So a reload or another tab shows the same time. A verb not allowed from the current state warns and changes nothing, and so saves nothing. More: [Task](../Task/readme.md).

## Session: a Task in a dated folder

A `Session` is a Task that lives in its own folder, `<root>/YYYY/MM/DD/<slug>/`, with a record file inside. It is the record of one run of an agent or a tab, and its tasks can be plain tasks, projects, processes or child sessions. It reads its own older line shapes, and adds a menu and settings. More: [Session](../Session/readme.md).

## Property: one live value

A `Property` is one value that tells you when it changes. It is separate from Item: nothing here is saved. A template binds a view to it.

```js
class Property extends Events(Object)
  value / get() / set(v)     // a change that is the same value (Object.is) does nothing
  bind(fn)                   // call fn now and on every change; returns the function that unbinds
```

More: [Property](../Property/readme.md).

## View: stay in step with an Item

`view.bind` keeps one view up to date with one key of an Item (or with a Property), and lets go when the view is removed.

```js
view.bind(item, "title", v => view.text(v))   // runs now, then once per animation frame in which "title" changed
view.bind(item, "title")                      // no function: the view's text is the value
view.bind(Property.of(item, "title"), fn)     // a Property works too, saved or not
```

It returns the unbind; `view.remove()` and `view.empty()` run it for you. More: [View](../View/readme.md), [doc/bind.md](../View/doc/bind.md).

## Store: one file for one Item

A `Store` is the link between one `.jsonl` file and one root Item. It replays the file into the Item, then writes every new change back as one line, and on the dev server it tails the file so other tabs' lines arrive too.

```js
class Store
  url, host                  // the file, and the root Item it feeds
  open()                     // load the file (dev server: stream it live)
  attach(host)               // listen to host's "delta" events; replay what was loaded
  read(entries)              // replay lines through host.replay_line, saving nothing
  line_for(line, origin)     // wrap a change in one hop per level: {"tasks":{"c3":{"set":{...}}}}
  append(line) / flush()     // queue; one microtask later, the whole tick goes out together
  deliver(path, lines)       // hand the batch to the Outbox and wait for the ack
  pending                    // lines made but not acked yet (for a "saving..." sign)

  static for(url)            // ONE Store per file
  static channel = "item_api"  // a record file's road: Servex POST /api/item first (hooks run), the socket as fallback; "socket" = socket only
  static marked_lines        // which spelling writers use (see above)
  static mute(item) / unmute(item, above) / muted_at(node)   // the scoped mute (the item's tree, and its ancestors' own changes)
  static replay_depth        // above 0 while any store replays: nothing is saved
```

**How it works.** The Store listens for the root's `"delta"` event. The event carries the change and *where* it happened (`origin`), and `line_for` walks up from the origin to the root writing one hop per level. A line this store sent comes back to it from the file (the tail); it recognizes its own echo and drops it. A record file (`task.jsonl`, `session.jsonl`, ...) gets `by` and `ts` stamped on its lines; a Task reads its times from `ts`. Off the dev server there is no writer: changes stay in memory, with one console warning. More: [Item readme](../Item/readme.md), [JSONL](../../ext/JSONL/readme.md).

## Outbox: the road to the server

The `Outbox` sends batches of lines over the dev socket and keeps each one until the server says it has written it. It is why a dropped connection or a reload never loses or doubles a line.

```js
class Outbox extends Events(Object)
  send(path, lines)          // numbered batch: {client, n}; resolves true when acked
  waiting                    // batches not acked yet, oldest first
  pending(path)              // how many lines wait
  drain()                    // send everything not on the current connection (on every reconnect too)
  heartbeat = { every, wait }// while batches wait, ping; no pong means the socket is dead: reopen it
  static shared()            // the one outbox of this page
```

- **Numbered:** each batch carries `{client, n}`: this page load's id and its own counter. The server remembers the answers and, for a batch it has already written, answers again without writing (`dup`). So sending again is always safe.
- **Acked:** the server replies `append successful` with the file's new size (`offset`).
- **Resent:** unacked batches go out again after every reconnect, in order.
- **`localStorage`:** every unacked batch is also kept there (`outbox:<client>:<path>`). A reload finds its own tab's leftovers, queues them, and the server's `dup` answer settles any it already had. Storage may be missing or full; every access is in a `try`.

The full table of what happens when: [transport.md](../Item/doc/transport.md).

## Test: `test(name, fn)`

One function runs a test, the same file in node and on a page. `fn` gets a `Test` with checks.

```js
import { test } from "../Test/Test.js";

test("a started task is running", t => {
  const task = new Task({ title: "x" });
  task.start();
  t.eq(task.state, "running");        // eq(got, wanted, msg)
  t.ok(task.duration() >= 0);         // ok(condition, msg)
});
test.optional("edge: starting twice does nothing", fn);   // shown collapsed as an edge case
test.node("reads the real file", fn);                      // needs node; a page lists it but does not run it
```

Run one file with `node X.test.mjs`; all with `node public/framework/core/Test/TestRunner.mjs public/framework/core`. Use real components (real files in a temp dir) and mock only what cannot run. More: [Test](../Test/readme.md).

## Plugins and extensions: three ways to add behavior

Core never imports an addon; the addon asks to be turned on.

```js
// 1. Server: run a function (or an object's setup) for every NEW instance of a class
Events.use(plugin)           // Server/Events.js; the constructor emits "new", plugin(instance) runs
DevSocket.Socket.use(Runtime)  // e.g. the dev socket's plugins (Server/run.js)

// 2. Page, from code: run Ext.setup(page) for EVERY page
Page.use(Ext)

// 3. Page, from data: one line in a page.jsonl turns one extension on for that page
{"ext": "Inbox"}             // imports core/Page/ext/Inbox/Inbox.js and calls its setup(page)
```

An extension is one file, `core/Page/ext/<Name>/<Name>.js`, with a class that has a static `setup(page)`. In it, `page.on("line", fn)` hears each later `page.jsonl` line, and `page.on("render", fn)` runs after the content is drawn. `page.ext_ready` is the list of promises to await if you need the extension finished. More: [Page extensions](../Page/ext/readme.md).

---

## How a change is saved and replayed

Follow one click, "Start" on a task, from the button to the other tab, then a reload.

**Saving (the way out)**

1. **Click.** The button calls `task.act("start")`. (Or a method that wraps its work in `as_call`.)
2. **Set.** `act` mutes saving for this task, runs `start()`, and `start()` calls `set({state: "running", ran_since, started_at})`. The task puts the values in `data` and fires `"delta"` then `"change"`; the view redraws at once. The page does not wait for the disk.
3. **Delta.** Because `act` muted the sets, the task then emits *one* `"delta"`: `{start: {}}` (`{"start()": {}}` once `marked_lines` is on). It bubbles up the `parent` chain to the root.
4. **Store.** The root's Store hears it, checks it is not replaying or muted, and `line_for` wraps it in one hop per level (a subtask gets `{"tasks":{"c3":{...}}}` around it). A record file also gets `by` and `ts`.
5. **Outbox.** One microtask later the whole tick's lines go to `deliver`, which hands them to the Outbox: numbered `{client, n}`, kept in `waiting` and in `localStorage`.
6. **Socket.** The batch goes out over the dev socket as an `append` call.
7. **Append.** The dev server (`Server/plugins/SocketServer/Append.js`) writes the batch to the file once, and acks with `{client, n, offset}`. The Outbox drops the batch and its `localStorage` key.

**Arriving (the other tabs)**

8. **Tail.** The server's `Tail.js` sees the file grow and pushes the new lines to every tab subscribed to it (`ext/JSONL/live.js`).
9. **Other tabs.** Each tab's Store `read`s them: it replays the line through `replay_line` with saving off, and the task moves to running; `"read"` and `"change"` fire, so the view redraws. The writing tab gets the line too, recognizes its own echo, and skips it.

**Reloading**

10. **Open.** `Item.open(url)` creates one Store for the file, loads or streams every line, builds the root (`Item.root_from`: line 1, or a class's own `replay_new`), attaches the Store, and replays the rest.
11. **Replay.** Each line goes through `replay_line`, which strips `by`/`ts` and holds `ts` in `Item.clock`, then `set`. Saving is off (`Store.replay_depth`), so replaying writes nothing. A `Task` reads `{start: {}}` as the verb, and because `ran_since` is saved data, `duration()` is right with no extra step. Any lines the Outbox kept in `localStorage` go out again; the server's `dup` answer means none are written twice.

Run the whole path with `node public/framework/core/Item/delta-flow.test.mjs`, and watch it happen at [the replay lab](/framework/core/Item/replay/) and [the watch page](/framework/core/Item/watch/).

## Where to go next

- [Item](../Item/readme.md) · [List](../List/readme.md) · [Page](../Page/readme.md) · [Task](../Task/readme.md) · [Session](../Session/readme.md) · [Property](../Property/readme.md) · [Events](../Events/readme.md) · [Test](../Test/readme.md)
- Why core is shaped this way: [decisions.md](./decisions.md)
