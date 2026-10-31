# Phase 1 design: Item, List, Page, sync

1. **Keep the core.** Every saved thing is an `Item`. One `set(delta)` changes it, and that delta is also the saved line.
2. **Keep the line, with the decided spelling (D13).** A line is nested names down to a target. A plain key is data (or a step into a child), `name()` calls a method, `#id` picks a list item. No trailing `set`.
3. **Keep the classes.** `List extends Item`; `Page extends Item` and adds a url; `Ref` points at an item somewhere else. No renames.
4. **NEW:** every line gets `seq` (set by the server) and `client` + `n` (set by the writer). The sender gets an `ack`, not an echo.
5. **NEW:** one `Room` per page, written once as plain JS. A `Journal` (your storage.md word) is passed in: JSONL now, a SQLite file next, a Durable Object later.
6. **CHANGED (your F6):** a change calls `this.store.change(…)` directly. Events stay, for views only.
7. **CHANGED (your F7):** adding an item that already has a parent adds a `Ref` to it. `move_to` is the only way to move.
8. **Binding:** views take `item.prop("title")` (your `Property.of`), not events wired by hand.
9. **Typing:** the client merges one field's keystrokes into one line. A late reader loads the file, then catches up from its `seq`.
10. **Many users:** soft edit locks through presence, plus last-writer-wins per field. CRDTs wait until phase 5.

Legend: no mark = works this way today at [`9ba46ee`](https://github.com/lew42/monorepo/tree/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895). `// NEW` = added. `// CHANGED` = behaviour changes. Each mark has a one-line reason. Ids like T3 or R1 are failing-test specs in the lessons files. The open calls are in [decisions.json](decisions.json).

Sections: 1 Classes · 2 Item (2.1 how a change is saved today) · 3 List · 4 Page · 5 Ref · 6 The line and its verbs · 7 Store and Journal · 8 Room · 9 Binding · 10 Placement · 11 Typing · 12 Locks · 13 Agent tool · 14 Item or stream · 15 Servers · 16 Phases

---

## 1. Who extends what

```js
Events(Object)        // on, off, emit (bubbles)
 ├─ Item              // id, data, set, get
 │   ├─ List          // Items in order, by id
 │   ├─ Page          // an Item with a url
 │   ├─ Ref           // points at {url?, path}
 │   └─ Task, Session, Card, …
 └─ Property          // one live value

Store                 // Item side, one per url
 └─ Page.Reader

Journal  // NEW  server side: lines + seq
Backend  // NEW  browser side: how to reach lines
Room     // NEW  one per page: seq, ack, locks
```

---

## 2. Item

[Item.js](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L31-L543)

```js
class Item extends Events(Object) {
  id       // Item.short_id(): 8 chars
  data     // the parsed JSON object, kept as-is
           // (owner, 2026-10-30: no copy, for speed).
           // Built-in names (constructor, toString…)
           // are not data names: document them, and
           // read with Object.hasOwn(data, key).
  parent   // the Item that holds me
           // (never the List itself)
  _slot    // my property name, when adopted
  static fields = []  // accessors over data

  set(delta)       // or set(key, value)
  // TODAY, for each key, in order:
  //  a method name -> call it
  //  get(key) has .set -> hand the rest down
  //  else data: put, emit change + delta
  // CHANGED (D13): the key's spelling decides:
  //  "name()" -> call the method `name`
  //  "#id"    -> the list item with that id
  //  "name"   -> data, or step into a child
  // Why: today a data field named like a
  // method (add, move) can never be stored.
  get(key)
  // own prop -> data -> named List -> "a.b"
  act(verb, args)  // records only the call (§2.1, D14)
  remove() · move_to(list | {url, path})
  root() · walk(fn) · find(id) · lists()
  toJSON()  // {type, id, data, <list>: […]}
  static hydrate(json) · register(Class)
  static replay(lines) · open(url)
  static describe()  // what an agent may send

  get store()  // CHANGED (F6)
  // Today: an own property, set on the root only.
  // F6: the nearest store up the parent chain.
  // Why: one direct call; a child with its own
  // file needs no owned_below check.

  unset(...keys)  // NEW {"unset()":["color"]}
  // Why: set({k: undefined}) comes back
  // on reload (T5).

  batch(fn)  // NEW one line per item touched
  // Why: wait() writes 7 lines today (T2).

  prop(key)  // NEW = Property.of(this, key)
  // Why: one binding handle for views (§9).
}
```

**Events**

```js
// TODAY
item.on("change", (key, value, old) => …)
item.on("delta", (line, origin) => …)
root.on("read", lines => …)  // live lines in
list.on("add" | "remove" | "move" | "order")

// CHANGED: one last argument on every event
//   {source: "local" | "replay" | "remote"}
// Why: a side effect (Ref re-path, task
// auto-complete) must run once, not once
// per open tab (T1).
```

### 2.1 How a change is saved today

Checked against the code, 2026-10-30. Three things write lines:

1. **The item tool (agents).** Servex `POST /api/item` applies the line to a live copy of the file's root in Node, and appends only if that worked ([page_tools.js L1094–L1139](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L1094-L1139)).
2. **The browser.** `Store.flush()` sends a record file's lines by plain HTTP `POST` to that same `/api/item` endpoint (not MCP; the item tool calls the same function inside Servex) ([Store.js L195–L213](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L195-L213)). Only if Servex is down does it fall back, once and with a console warning, to the dev server's socket `append` (`Append.js`). Whether that fallback has ever fired in real use is unknown.
3. **About 20 Server/Servex scripts** still append directly, bypassing the one writer (a known gap; decision D8).

Every open tab then gets the new line through the file tail and replays it with `set()`.

**A button can just call the method.**

```js
task.start()        // what a button calls
// start() runs this.set({state: "running", started_at: …})
// set() emits "delta" -> bubbles to the root -> the store saves:
//   {"tasks": {"#c3": {"state": "running", "started_at": "…"}}}
```

So calling the method already saves, and the line records what changed (the data) ([Task.js L336–L343](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Task/Task.js#L336-L343)). `act("start")` is an optional extra that records what was asked instead (`{"start()": {}}`) and mutes the data lines ([Item.js L101–L112](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L101-L112)). You don't like its name or the need for it. Whether a log should hold the call or the change is decision D14.

**Why "bubbling".** `task.set()` emits a `delta` event on the task, then on its parent, up to the root. Only the root has a store, and each level adds its name to the path as the event passes. That is how a change three levels down becomes `{"page": {"content": {"#p9": {…}}}}`.

- Parents don't re-render because of it. Views listen to their own item's `change` event; `delta` is only for saving.
- The cost: an event at every level for every change, and saving depends on event wiring that is easy to break silently (a tab page stops the event: gap 9).

**F6 (D2): skip the cascade.** The item climbs its own `parent` chain and calls the store directly:

```js
set_one(key, value){
  // … put; if it changed:
  const src = this.store?.applying ?? "local"
  this.emit("change", key, value, old, {src})  // views only
  this.store?.change(this, {[key]: value}, src)
}
// Store.change(item, payload, src):
//   src !== "local" -> write nothing
//   else queue(wrap(hops(item, host), payload))
```

Same lines, explicit, no event cascade. Your F6 note says to measure both before switching ([plan.md F6, michael/dev](https://github.com/lew42/monorepo/blob/ecd1459919067b9438f8125791397dee66628aa0/public/framework/core/Session/tasks/data-shapes/plan.md#L28-L29)). The line format does not change either way.

### 2.2 Four kinds of value, four kinds of code

**Methods decide, data records, everything else reacts.** A page reloading, another tab and an agent all deliver data, never a method call. So anything that must happen when a value changes reacts to the value, not to the method that set it (D17).

| Kind of value | Where it lives | Saved? | Example |
|---|---|---|---|
| Saved, shared | `data`, via `get` / `set` | yes, in the page's log | `title`, `state`, `started_at` |
| Saved, one person | that person's own file | yes, not shared | open tabs, column widths (D18) |
| Volatile | a plain `Property` field, outside `data` | never | selection, hover, drag in progress, the clock's interval |
| Derived | a getter, or a cache a hook rebuilds | never | `elapsed`, `done_count` |

| Kind of code | Runs when | May write saved data? |
|---|---|---|
| Method (`start()`) | once, where someone acted | yes; also the only code that touches the outside world |
| Hook (`set_state(v, old)`) | after every change of that key: live, remote, after load | no: every tab would write it again |
| View (`view.bind`) | after a change of a key it shows | no; only its own DOM |
| Getter (`elapsed`) | when read | no |

```js
class Task extends Item {
  start(){ this.set({ state: "running", started_at: new Date().toISOString() }) }
  get elapsed(){ const t = this.get("started_at"); return t ? Date.now() - Date.parse(t) : 0 }
  set_state(state, old){ this.parent?.recount?.() }   // name open: set_state / on_state
}
```

Loading replays changes (D14), from a snapshot plus the tail, so each hook runs once per key.

### 2.3 What happens on reload: worked examples

Try it: **[Replay Lab](https://claude.ai/artifact/1Tj59c1Bz6Y8iq89CiDCT5)** (source `design/replay-lab.html`). Press Start, wait, press Reload, and compare the two logs.

**The key idea: a method can do three kinds of thing, and none of them needs the method to run again on reload.**
1. **Change data**, its own or another object's. Saved as changes; a reload assigns them.
2. **Keep something going in this tab** (the screen, a ticking clock, watching an agent's output). Never saved. It depends only on the current values, so it starts from the state ("running? tick") after a click, after another tab's change and after a reload. React calls this *render*.
3. **Act on the outside world** (spawn an agent, send a message, ask an AI). It happens because someone acted, so it runs once, inside the method, and its result is saved as data (`agent_id`). React's rule: "If this logic is caused by a particular interaction, keep it in the event handler." Its example: an "added to cart" notification put in an Effect "will keep appearing every time you refresh that product's page" ([react.dev](https://hu.react.dev/learn/you-might-not-need-an-effect)). Respawning an agent on reload is the same bug.

Replaying the **changes** runs only 1 and 2, so nothing is repeated and no guard is needed. Replaying the **calls** runs all three again, so every method with an outside effect needs a guard, and the guard "already running? don't spawn" doesn't work: a reload starts from an empty task, so it is never "already running" when the first `start()` replays (the lab shows this). Side effects are the reason *not* to re-run a method. The one real trap: a value kept in a plain field instead of `set()` (today's `_ran_since`) is lost on reload.

**Snapshots answer the same question.** Nearly everyone loads a snapshot plus the changes after it: Figma (a checkpoint every 30–60 s plus a journal every ~0.5 s), Linear (bootstrap plus sync actions by `lastSyncId`), Notion (record values plus small set / insert / remove operations), tldraw (snapshot plus a change chain in R2). Their changes are all values, never method calls, because a snapshot *is* the changes collapsed to the last value of each key; calls can't be collapsed. Undo, a scrub bar and version history read the log separately. Sources: `persistence-sync/notes/collab_app_architectures.md`.

**1. Start a task that spawns an agent.** `start()` sets `state: "running"` and `started_at: "10:00"`, spawns an agent and saves `agent_id: "a7"`.
- Changes saved: `{"state":"running","started_at":"10:00","agent_id":"a7"}`. On reload the values are assigned, the view bound to `state` shows "running", and the elapsed time is counted from 10:00. No agent is spawned. ✔
- Call saved: `{"start()":{}}`. On reload `start()` runs again: `started_at` becomes the reload time, so the timer shows 0:00 ✘, and a second agent is spawned ✘✘.
- Third way, for the agent: a level-triggered worker. The server notices "running, but no `agent_id`", spawns one and saves its id. A reload, a missed message or a server restart is harmless, because it looks at the state, not at the event (Kubernetes controllers work this way: [golinuxcloud](https://www.golinuxcloud.com/desired-state-vs-actual-state-kubernetes/)). With one writer (Servex), it can't spawn twice.

**2. A running timer.** Save `started_at`; the clock on screen ticks from it. On reload it shows the true elapsed time. Saving the elapsed time every second fills the log and is wrong after a reload.

**3. Show, hide or toggle a layer.**
- `show()`, `hide()` or `set({visible: false})` give the same result either way, and doing one twice is the same as doing it once.
- `toggle()` saved as a call: two tabs toggle at the same moment, so it flips twice and is visible again, though both people hid it. A line sent twice after a network retry flips it again. ✘
- `toggle()` saved as its result `{"visible": false}`: both tabs say "hidden", so it's hidden; a repeated line changes nothing. ✔ A toggle should save its result.

**4. Drag a layer.** A drag makes about 60 moves a second.
- Calls with relative moves, `move(2, 1)`: 600 lines for a 10-second drag, and one lost line leaves the layer off by that much for good. ✘
- Changes with absolute positions, `{x: 120, y: 80}`: the next line corrects a lost one, and the whole drag can be saved as one line (its final position). Undo returns to where the drag started. ✔

**5. Selection.** Click A, then B, then A. If it's saved in the page's log, your selection jumps around on everyone else's screen. So it's either volatile (gone on reload), saved for you alone (back on reload), or presence (others see your highlight live; never saved). Loading needs only the last value; undo can bring it back with each step (D18).

**6. A counter that two tabs increment.** Both show 5; both click +1.
- Changes: both send `count: 6`, so the result is 6 and one click is lost. ✘
- Calls: both send `increment()`, the server applies both, and the result is 7. ✔ Here the call wins, because it keeps both intents. Lew42 version: the server (the one writer) runs `increment()` and saves the call with its result, `{"increment()":{},"count":7}`. Replay applies 7.

**7. Sort 500 rows.** Saving the changes means 500 new positions; the call is one line, `sort_by("title")`. The call wins on size, but only if the sort gives the same order every time and its code never changes. A snapshot after it protects old history.

**8. A game: `player.jump()`.** The positions of everything, 60 times a second, are huge; the inputs ("jump at frame 120") are tiny. Lockstep games save the inputs and re-run the simulation. That needs no clock reads, a seeded random and the same code version: Factorio replays only work on the version that made them.

**9. `summarize()` asks an AI.** Saved as a call, every reload asks the model again: different text, and it costs money each time ✘✘. Saved as a change, the summary text is simply there ✔. Anything with an outside answer (AI, network, time, random) must save its result.

**Which way does it lean?**

| Situation | Save | Why |
|---|---|---|
| Most edits: rename, set a color, show / hide, move to x, y | changes (a call gives the same result) | doing it twice is harmless; the result is small |
| Reads the clock, random, the network or an AI | changes | replay would get a different answer |
| Does something to the world (spawn, send, pay) | changes; the effect runs only in the method or a worker | replay must never repeat it |
| Toggle, relative move | the result | a repeated or simultaneous call flips or drifts |
| Two people changing one value (counter, adding to a list) | the call, run by the server, plus its result | both intents count |
| Bulk actions (sort, import) | the call, if it is deterministic | one line instead of hundreds |
| A deterministic simulation (a game) | the inputs (calls) | the state is too big; the simulation repeats exactly |

**Does React's re-rendering solve it?** Half of it. "The screen is a function of the values" is the "looks" half, and it is why a reloaded page looks right. A virtual DOM is one way to do it (redraw everything, then apply the differences); `view.bind` is another (update only the bound spots). Neither touches the "does" half: React still needs the effect in the event handler, where it runs once.

---

## 3. List

[List.js](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L53-L387)

```js
class List extends Item {  // decided 2026-10-03
  owner · name  // owner.get(name) finds me
  items         // never push/splice in place
  of            // member class (default Item)
  key(x)        // id; Page.pages uses name
  find(id)      // one Map lookup
  get(key)      // super.get(key) ?? find(key)
  add(x, {after})  // after: id | null
  remove(id) · move(id, {after, from})
  order([ids]) · clear()
  insert · replace · release  // quiet: no line

  ids  // NEW "short" | "uuid" | "seq" | "name"
  // Why: each list picks its id rule (§3.2).

  add(x)  // CHANGED writes the envelope:
  // {id, type, data, <lists>}, after beside it
  // Why: child lists are lost, and data
  // named "after" or "type" breaks (T3, T4).

  add(owned)  // CHANGED (F7) adds a Ref
  // Why: today the last parent wins, silently.

  get(key)  // CHANGED a missing member warns
  // Why: an edit to a removed id is stored
  // as data and poisons later edits (T6).

  remove(id)      // NEW also {id, was}
  move(id, …)     // NEW also {…, was}
  reset([envs])   // NEW whole list, one line
}
```

### 3.1 How a line finds its target

```js
// {"tasks":{"#c3":{"title":"x"}}}
root.set(line)
// "tasks" -> root.get("tasks")  = a List
// "#c3"   -> list.find("c3")  (no such id: warn, skip)
// "title" -> a plain key: data on c3
// get("tasks.c3.title") walks the same way
```

### 3.2 One id rule per list

```js
new List({owner, name: "tasks"})  // "short"
new List({owner, name: "cards",
          ids: "uuid"})
new List({owner, name: "messages",
          ids: "seq"})
page.pages                        // "name"
```

| `ids` | Who makes it | Use it for |
|---|---|---|
| `short` | the writer: 8 random chars | the default; safe with many agents |
| `uuid` | the writer | imports, offline clients |
| `seq` | the Room only: 1, 2, 3 | chat messages; never a client |
| `name` | the caller | folders, code-made structure |

---

## 4. Page

[Page.class.js](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/Page.class.js#L33-L132)

```js
class Page extends Item {
  url · name   // id = folder name
  static fields =
    ["title", "icon", "description"]
  pages        // List keyed by name
  content      // List of parts
  bubbles()    // false: events stop here
  set(obj)     // keeps jsonl_lines, emits "line"
  file() · tab() · place()  // page.jsonl lines
  add(name, child) · move(url)  // sub-pages

  home  // NEW "files" | "room" | "sqlite"
  // Why: your storage.md word; line 1 says it.

  // CHANGED (F6) an embedded tab page saves:
  // its store getter finds the parent page's
  // store, so bubbles() = false no longer
  // blocks saving (overview gap 9).
}
```

---

## 5. Ref

[Ref.js](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Ref.js#L19-L155)

```js
class Ref extends Item {
  static fields = ["url", "path"]
  // {path}: same file · {url, path}: another
  target · gone · why
  resolve()
  // open(url) -> get(path) -> find(id)
  // -> follow moved_to (up to 8 hops)
  label()  // "session › task"
  static backlinks(root) · shown(item)
  static repath(item, old_path)

  // NEW made by List.add(owned) (F7)
  // NEW prop(key) reads through to the target
}
```

---

## 6. The line and its verbs

**Decided (you, 2026-10-30, D13):** three key shapes, told apart by their spelling.

| Key | Means | Example |
|---|---|---|
| `name` | data, or step into a child Item | `{"title": "Hi"}` |
| `name()` | call the method `name` with the value | `{"add()": {…}}` |
| `#id` | the list item with that id | `{"#k2x9fq7a": {…}}` |

```jsonc
{"my_list":{"sort":"date"}}              // my_list.data.sort = "date"
{"my_list":{"#k2x9fq7a":{"done":true}}}  // that item's data.done = true
{"my_list":{"add()":{"id":"k2x9fq7a","type":"Task",
                     "data":{"title":"Buy milk"}}}}
{"my_list":{"move()":{"id":"k2x9fq7a","after":"p3"}}}
{"my_list":{"remove()":{"id":"k2x9fq7a"}}}
{"page":{"content":{"#p9":{"text":"Draft","start()":{}}}}}
// the last one: data and a call in one line
```

The rules (that is all of them):

1. A plain key sets data. If the current value is an Item, the object is set on that Item instead: that is how a line steps down a tree.
2. A key ending in `()` calls that method with its value as the one argument. A method with several arguments gets one object.
3. A `#` key finds the list item with that id. No such id: warn and skip the line (never store it as data: T6).
4. Data names may not end in `()` or start with `#`; `set()` refuses them. One spelling rule, no list to keep up to date.

Today's `set()` is already this recursive (method, else child, else data: [Item.js L155–L192](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L155-L192)), so the trailing `set` verb of the old line is redundant, and the clash exists today: a data field named `add` or `move` can never be stored. Why this spelling: no clash between a data field `add` and the method `add()`, or between data and item ids; no `set` repeated at every level; readable without knowing the class. MongoDB marks `$set` and `$push` the same way; `$` is dropped here because you already use `$name` for views.

```jsonc
// the whole line: the path above, plus its envelope
{"content":{"#p9":{"text":"Draft"}},
 "seq":43, "client":"t-19bc", "n":12,
 "by":"mike", "ts":"2026-10-30T10:00:01Z"}
// seq: NEW, set by the server, per file
// client + n: NEW, set by the writer;
//   the dedupe key
// by + ts: today; kept for audit only
```

```js
// Item methods
unset() [k, …]          // NEW
start() · wait() {…}    // today: any method of the class
moved_to() {url, path}  // today: a forward

// List methods, called under the list's name
add() {id, type, data, <lists>, after}
                        // CHANGED envelope
remove() {id, was?}     // was: NEW
move() {id, after, from?, was?}  // was: NEW
order() [ids] · clear() {}       // today
replace() {id, with}    // NEW class swap
reset() [envelopes]     // NEW

// File lines
{"schema": {"Task": 3}}         // NEW, line 1
{"snapshot": {…}, "seq": 4120}  // NEW, phase 2
```

**To settle when building**

- Old logs use an explicit `set` and bare ids. Replay reads both shapes for a while, or a one-time script rewrites the old logs (D16).
- The envelope names (`seq`, `client`, `n`, `by`, `ts`, `schema`, `snapshot`) sit at the root beside the path. A root data field with one of those names would clash: reserve them, or move them into one `meta` object.
- Whether a log holds the effects (the data) or the call (`start()`) is D14. This format carries either.

**How to test the line.** One table-driven test, with real classes and a temp file:

```js
for (const c of cases){             // one case per method: set, unset, add, move, remove…
  const a = fresh_root(); const lines = capture(a);   // record every line a writes
  c.run(a)                                            // e.g. a.my_list.move({id, after})
  expect(lines).toEqual(c.lines)                      // 1. the line shape is exactly right
  const b = fresh_root(); lines.forEach(l => b.set(l)) // 2. replay into a new root
  expect(b.to_json()).toEqual(a.to_json())            // 3. same tree after replay
}
```

Plus edge cases: a missing `#id` (warn, skip), a data name ending in `()` (refused), a torn last line, two tabs editing one field. `delta-flow.test.mjs` already does a round trip; this widens it to every method.

---

## 7. Store, Backend, Journal

Three words from your [storage.md](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/storage.md#L1-L33): the **Store** turns Items into lines, a **Backend** is how a browser reaches the lines, and a **Journal** is where a server keeps them.

[Store.js](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L24-L228)

```js
class Store {  // Item side, today
  static for(url)    // one per url
  open() · read(lines) · attach(host)
  line_for(line, origin, host)  // hops + wrap
  append(line) -> flush()  // one microtask

  applying  // NEW "replay" | "remote" | null
  change(item, payload, src)  // NEW (F6)
  pending   // NEW Map n -> lines, until ack
  backend   // NEW how this tab reaches lines

  // CHANGED: no text-match echo skip;
  //   the sender waits for its ack (R3).
  // CHANGED: pending lines are resent on
  //   reconnect, and land once (R2, F9).
}

// Browser side (storage.md "Backend")
StaticBackend  // fetch once, read only
RoomBackend    // NEW socket: hello, op, ack
               // = DevBackend + CloudBackend
MemoryBackend  // tests and demos
```

```js
// Server side (storage.md "Journal") NEW
// Knows lines and seq, never Items.
class Journal {
  head(key)    // {epoch, seq, base} | null
  append(key, lines, {ifSeq})  // all or none
  read(key, {since})   // snapshot? + lines
  tail(key, since, on) // on(null, "reset")
  snapshot(key, state, seq)
  archive(key, beforeSeq)  // never deletes
  exclusive(key, fn)       // the sole writer
}
FileJournal    // page.jsonl; seq on each line
SqliteJournal  // one .sqlite file (node:sqlite)
RoomJournal    // DO SQLite + R2 segments
MemoryJournal  // tests
```

**Where lines can live**

| Kind | Good at | Limit |
|---|---|---|
| JSONL file (portable) | git, grep, cheap appends, readable | every open replays all; aim under ~1 MB. Query = scan. A rewrite needs tmp + rename |
| SQLite file (portable DB) | queries, full-text search, transactions | binary in git; one writing process |
| DO SQLite (cloud DB) | one writer for free, sockets, 10 GB per object | costs while awake; export to move it |
| R2 (cloud files) | cheap archive | no append; LIST costs like a write |
| D1 (cloud DB) | queries across pages | 10 GB cap per database |

---

## 8. Room and socket messages

```js
// NEW core/Room/Room.js — plain JS, no node
class Room {
  constructor({key, journal, root})
  // root: the warm live Item
  hello(sock, {v, client, since, epoch})
  op(sock, {client, n, lines})
  // 1 n <= last[client]: re-ack, no write
  // 2 n > last + 1: reject "gap"
  // 3 apply to root; throws -> reject
  // 4 locked by someone else? (§12)
  // 5 journal.append; ack the sender;
  //   send {seq, prev, line} to the others
  presence(sock, state)  // relayed, not stored
}
```

```js
// client -> Room
hello    {v, client, room, since?, epoch?}
op       {client, n, lines[]}
presence {client, clock, state}
"ping"

// Room -> client
welcome  {v, seq, epoch, base, presence[]}
op       {seq, prev, client, n, by, ts, line}
ack      {client, n, seq}
reject   {client, n?, why, expected?}
reset    {seq, epoch, base, snapshot}
ready    {seq}            // catch-up done
presence {client, state}  // null = left
"pong"
```

- A client applies an `op` only if `prev` is its last `seq`. Otherwise it says `hello` again from its last `seq` (R6).
- A client holds back a remote op on a field it has a pending write to, until its own ack arrives (R3).
- `epoch` changes when a file is rewritten, and a stale reader gets `reset` (R4).

---

## 9. Binding

Three options: **A** events wired by hand (today), **B** one Property per field, **C** signals. B is recommended because `Property.of` is [already built](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Property/Property.js#L137-L166).

```js
// A, TODAY: every view wires and unwires
task.on("change", (k, v) =>
  k === "title" && redraw(v))

// B: one handle per field
const title = task.prop("title")
new TextInput({ value: title })  // two-way
new Label({ text: title })       // one-way
// the view calls title.bind(fn) and keeps
// the unbind for drop()

// Lists: a view binds to the List's verbs
new ListView({ list: task.tasks,
               row: t => new TaskRow(t) })
```

**No update loops (A changes B changes A)**

```js
// 1 Property.set: Object.is(old, v) -> silent
// 2 replay and remote changes never write
// 3 an input with focus ignores its own echo
// 4 derived values are read-only:
Property.derive([a, b], fn)  // NEW
// it never writes back. Only people, agents
// and verbs write.
```

**Both kinds of value already exist** in `core/Property` (2026-10-12): a key in `data` is saved and bindable; a plain `new Property(v)` field is bindable and never saved; `Property.of(item, key)` is a live handle on a saved key. So `view.bind` takes an item and a key, or a Property. Never put a Property inside `data`. Your clone-swap idea for big DOM rebuilds, with its caveats, is in D7.

---

## 10. Where an item is stored

```js
// 1 embedded (default): in the parent's file
{"tasks":{"add()":{"id":"c3","type":"Task",
  "data":{…}}}}
// 2 own file: the member names it
{"tasks":{"add()":{"id":"c3","type":"Task",
  "file":"c3.jsonl"}}}
// 3 own dir: a folder, with its record inside
{"tasks":{"add()":{"id":"c3","type":"Task",
  "file":"c3/"}}}

// TODAY: separate shapes for 2 and 3:
//  {"file":"kid/page.jsonl"}
//  {"task":"<folder>","as":"<id>"}
//  {"tab":{…}}  (an embedded page)
// CHANGED: one field, `file`, on the member
```

- **Embedded** is the default: small, and edited with its parent.
- **Own file** when it has its own url or page, its own writer (an agent's session), or more than ~256 KB of lines.
- **Own dir** when real files sit beside it (readme, images, child folders).
- Moving between them is one verb, `move_to({url})`, which leaves a `moved_to` forward behind.
- The parent's Store never writes for a child that has a `file`. Each file has its own Room and its own `seq`.

---

## 11. Typing without a bloated log

```js
// Client: one pending line per field,
// replaced in place while you type. Sent
// after 300 ms idle, 2 s at most, or on blur.
// The screen updates on every key.
store.coalesce = { idle: 300, max: 2000 } // NEW

// A late reader:
// 1 fetch page.jsonl (may be stale or cached)
// 2 hello {since: the last seq in that file}
// 3 the Room sends every op after it, then ready
// So a stale file is fine: catch-up fixes it.
```

The Room appends each op as it arrives, because an append is cheap. Merging keystrokes happens on the client. Live typing that others can watch comes later, as throwaway `draft` frames (phase 4).

---

## 12. Edit locks

```js
// A soft lock is presence: never a line.
presence {client, state: {user: "mike",
          editing: "content.p9"}}
// Room.locks: path -> {client, user, at}
// It ends on blur, or 30 s after presence
// stops. An op under a path someone else
// holds:
//  "warn" (default): write it, tell the writer
//  "refuse": reject {why: "locked", by}
new List({…, lock: "warn" | "refuse"}) // NEW
// The UI shows "Mike is editing".
// The item tool tells an agent who holds it.
```

---

## 13. One item tool for agents

```js
// TODAY: Servex's item tool (run_item)
item({ path: "/…/session-x/",
       target: "tasks.c3",
       delta: { "start()": {} } })
// Resolves the live root, checks describe(),
// stamps ids on add, applies, then appends.
// No delta = read. Query keys = answer only.

// CHANGED: a Room client, like a tab:
//  client = the agent run's id, n per call;
//  gets ack or reject; respects locks.
// One tool for page, task, session, card…
```

---

## 14. What is an Item, and what is a stream

**The line:** an Item is state you want back after a reload, and it changes a few times a second at most. Anything faster, or anything worthless once it has passed, is a stream. A stream is relayed by the Room or a media service and never logged.

| Thing | Item (logged) | Stream (not logged) |
|---|---|---|
| Chat room | the room, `messages` (ids: `seq`), members | typing dots, read cursors |
| Game object | inventory, score, placement | position at 30–60 Hz; saved to the Item every few seconds |
| Voice or video call | who, when, recording url, transcript List | audio and video over WebRTC (Cloudflare Realtime), never the Room |
| Editing a doc | the text, on idle or blur | cursors, selection, live drafts |

---

## 15. Servex, the dev server, Cloudflare

```
TODAY
dev server (Server/, one per project)
  static files · live reload · fs.watch
  Tail socket · Append rpc
Servex (one process, :8090)
  agents · MCP · runs the dev servers
  item tool + live roots (the one writer)

PROPOSED             CLOUDFLARE TWIN
dev server           Worker + static assets
  static, reload       (reload: dev only)
  Rooms, sync socket   one Durable Object/page
  FileJournal          DO SQLite + R2
Servex               (no twin)
  agents, MCP          agents are Room clients
  item tool -> Room    over HTTP or a socket
```

**Rule:** whatever serves a project's files also hosts its Rooms. Servex runs processes and agents; it uses the data but is not where it lives. This follows your F1 lean (the dev server, one per tree, worktrees included). The report chose Servex instead. Your 2026-10-30 words: Servex stays minimal and robust; the dev server is more in line for a project's item API; sockets over REST because of push (REST only where Cloudflare needs it). The Room code is identical either way, so the choice is cheap to reverse (decision D8).

---

## 16. Phases

**Phase 0: stop silent losses** (hours each; [fixes.md](fixes.md) 1–5)

**Phase 1: solid streaming, robust data, bindings**
- The decided line format (D13): plain key, `name()`, `#id`. Replay reads old and new shapes.
- `seq` + `client` + `n` on every line: resume, dedupe, exactly once.
- `ack` instead of echo, and pending lines resent on reconnect: no lost edits.
- `reset` on rewrite (`epoch`), gap check (`prev`), ping: streams heal themselves.
- Envelope `add`, `unset`, a warning on unknown verbs: a replay gives back exactly what you did.
- `source` tag and `batch()`: one line per action, and side effects run once.
- F6 store getter: saving is one direct call, and tab pages save again.
- F7 `add` makes a `Ref`: no silent re-parenting.
- `item.prop()` and `ListView`: views update themselves.
- Typing coalesce on the client: logs stay small.
- `Room` + `FileJournal`, hosted locally: one door for tabs and agents.

**Phase 2: the cloud, and more than one person**
- Presence and soft locks: "Mike is editing".
- Snapshot line (stage 1) and schema line: big pages open fast.
- `RoomJournal` on a Durable Object, `RoomBackend` in production: the live site becomes writable.
- `SqliteJournal`: one portable database file for big or queried data.

**Phase 3: scale and history**
- Compaction stage 2 with an R2 archive: files stay small, and nothing is lost.
- One move verb between placements: embedded, own file, own dir.
- Queries across pages (SQLite, D1, full-text search).
- Undo, from `was`.

**Phase 4: throwaway streams**
- `draft` frames for live typing, a game tick channel, and calls over WebRTC, each with an Item for its record.

**Phase 5: merging**
- Yjs for a rich-text field, fractional list positions, offline editing by several writers.
