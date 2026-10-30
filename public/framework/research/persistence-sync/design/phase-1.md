# Phase 1 design: Item, List, Page, sync

1. **Keep the core.** Every saved thing is an `Item`. One `set(delta)` changes it, and that delta is also the saved line.
2. **Keep the line.** A line is nested names down to a target, then one verb. `get()` resolves each name; a `List` resolves a member by id.
3. **Keep the classes.** `List extends Item`; `Page extends Item` and adds a url; `Ref` points at an item somewhere else. No renames.
4. **NEW:** every line gets `seq` (set by the server) and `client` + `n` (set by the writer). The sender gets an `ack`, not an echo.
5. **NEW:** one `Room` per page, written once as plain JS. A `Journal` (your storage.md word) is passed in: JSONL now, a SQLite file next, a Durable Object later.
6. **CHANGED (your F6):** a change calls `this.store.change(…)` directly. Events stay, for views only.
7. **CHANGED (your F7):** adding an item that already has a parent adds a `Ref` to it. `move_to` is the only way to move.
8. **Binding:** views take `item.prop("title")` (your `Property.of`), not events wired by hand.
9. **Typing:** the client merges one field's keystrokes into one line. A late reader loads the file, then catches up from its `seq`.
10. **Many users:** soft edit locks through presence, plus last-writer-wins per field. CRDTs wait until phase 5.

Legend: no mark = works this way today at [`9ba46ee`](https://github.com/lew42/monorepo/tree/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895). `// NEW` = added. `// CHANGED` = behaviour changes. Each mark has a one-line reason. Ids like T3 or R1 are failing-test specs in the lessons files. The open calls are in [decisions.json](decisions.json).

Sections: 1 Classes · 2 Item · 3 List · 4 Page · 5 Ref · 6 Lines · 7 Store and Journal · 8 Room · 9 Binding · 10 Placement · 11 Typing · 12 Locks · 13 Agent tool · 14 Item or stream · 15 Servers · 16 Phases

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
  data     // null-prototype bag
  parent   // the Item that holds me
           // (never the List itself)
  _slot    // my property name, when adopted
  static fields = []  // accessors over data

  set(delta)       // or set(key, value)
  // for each key, in order:
  //  a method name -> call it (a verb)
  //  get(key) has .set -> hand the rest down
  //  else data: put, emit change + delta
  get(key)
  // own prop -> data -> named List -> "a.b"
  act(verb, args)  // records only {verb: args}
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

  unset(...keys)  // NEW {"unset":["color"]}
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

**How a change reaches the file**

```js
// TODAY: emit("delta") climbs .parent to the
// root, where Store.attach listens.

// F6 (your 2026-10-29 lean):
set_one(key, value){
  // … put; if it changed:
  const src = this.store?.applying ?? "local"
  this.emit("change", key, value, old, {src})
  this.store?.change(this,
    {set: {[key]: value}}, src)
}
// Store.change(item, payload, src):
//   src !== "local" -> write nothing
//   else queue(wrap(hops(item, host), payload))
```

Your F6 note says to measure both before switching ([plan.md F6, michael/dev](https://github.com/lew42/monorepo/blob/ecd14599/public/framework/core/Session/tasks/data-shapes/plan.md#L28-L29)). The line format does not change either way.

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
// {"tasks":{"c3":{"set":{"title":"x"}}}}
root.set(line)
// "tasks" -> root.get("tasks")  = a List
// "c3"    -> list.get("c3") -> find("c3")
// "set"   -> a method on c3 -> c3.set({title})
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

```jsonc
// nested names down to the target, ONE verb
{"content":{"p9":{"set":{"text":"Draft"}}},
 "seq":43, "client":"t-19bc", "n":12,
 "by":"mike", "ts":"2026-10-30T10:00:01Z"}
// seq: NEW, set by the server, per file
// client + n: NEW, set by the writer;
//   the dedupe key
// by + ts: today; kept for audit only
```

```js
// Item verbs
set {k: v, …}          // today
unset [k, …]           // NEW
<verb> {…}             // today: start, wait
moved_to {url, path}   // today: a forward

// List verbs, always under the list's name
add {id, type, data, <lists>, after}
                       // CHANGED envelope
remove id | {id, was}  // was: NEW
move {id, after, from?, was?}  // was: NEW
order [ids] · clear true       // today
replace {id, with}     // NEW class swap
reset [envelopes]      // NEW

// File lines
{"schema": {"Task": 3}}         // NEW, line 1
{"snapshot": {…}, "seq": 4120}  // NEW, phase 2
```

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

---

## 10. Where an item is stored

```js
// 1 embedded (default): in the parent's file
{"tasks":{"add":{"id":"c3","type":"Task",
  "data":{…}}}}
// 2 own file: the member names it
{"tasks":{"add":{"id":"c3","type":"Task",
  "file":"c3.jsonl"}}}
// 3 own dir: a folder, with its record inside
{"tasks":{"add":{"id":"c3","type":"Task",
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
       delta: { start: {} } })
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

**Rule:** whatever serves a project's files also hosts its Rooms. Servex runs processes and agents; it uses the data but is not where it lives. This follows your F1 lean (the dev server, one per tree, worktrees included). The report chose Servex instead. The Room code is identical either way, so the choice is cheap to reverse (decision D8).

---

## 16. Phases

**Phase 0: stop silent losses** (hours each; [fixes.md](fixes.md) 1–5)

**Phase 1: solid streaming, robust data, bindings**
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
