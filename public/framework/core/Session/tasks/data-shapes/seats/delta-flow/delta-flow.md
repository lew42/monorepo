# The delta path: how one change gets from the item that changed to a file, and back to every tab

Analysis seat (g), 2026-10-28, against `michael/dev` at `a2b9d4f47`. Every hop below has its file and line. The runnable proof is [demo-delta-flow.mjs](demo-delta-flow.mjs) (`node` it from the repo root; it prints each hop and ends in PASS). What breaks and how to fix it: [notes.md](notes.md). The one-page shape: [shape.md](shape.md).

## The idea in four sentences

1. **An item is linked to its file by one thing: `parent`.** There is no saver or store on a child. Only the root of a file holds a store (`root.store`).
2. **A change fires a `"delta"` event on the item that changed,** and the event climbs `parent` to the root.
3. **The root's store turns it into one line,** nested one level per hop from the root down to the item, and appends it.
4. **Every reader (another tab, Servex, a fresh load) replays that line with `set()`,** which walks the same hops back down with `get()`.

So a change never needs to know where its file is. It only needs a `parent` chain that ends at a root with a store.

## (0) How an item gets its `parent`: adoption

There is exactly **one** place that sets `parent`: `List.adopt` (`core/List/List.js:77-80`). It runs on every way into a list:

- `list.add(x)` (loud, writes a line): `List.js:196-211` → `insert` (`:155-172`) → `insert_before` (`:89-94`) → `adopt`.
- `list.insert(x)` (quiet, for loading): the same, with no event.
- `list.move(x, {from})`: `take` from the old list (`:97-103`, which deletes `parent`), then `insert_before` → `adopt` (`:261-265`).
- `Item.hydrate` (loading a saved JSON) builds each array as a List and `insert`s its members (`core/Item/Item.js:325-331`).

A member's `parent` is the **Item that owns the list**, never the List itself (`List.js:78`: `child.parent = this.owner ?? this`). The List's own `parent` is a getter that returns its owner (`List.js:73`).

**Nothing else adopts.** `item.set("x", other_item)` puts the item in `data` and leaves its `parent` empty (demo, break B3). A child page added to `page.pages` is adopted, but a Page never passes events up (`Page.class.js:68`, `bubbles(){ return false; }`), so each page is its own root (B8).

**The owner's old system, side by side.** It is still in the code: `item.save()` walks up `parent` until it meets an item with a `saver`, and that saver rewrites the whole document as one JSON (`Item.js:260`, `ext/Saver/Saver.js:10`, `ext/Saver/FileSaver.js:28`). So adoption linked the storage in both systems, and in both the link is `parent`. The difference is the direction. The old one **pulls**: the child calls `save()`, and the root writes everything. The new one **pushes**: the child emits a delta, and the root's store writes one line.

## (1) A UI change: a click sets a field on an item two levels down

The demo's tree: `root` (a store on `session.jsonl`) → `root.cards` (a List) → card `c1` → `c1.notes` (a List) → note `n1`. A click calls `n1.set("text", "first, edited")`.

| # | Hop | Code |
|---|---|---|
| 1 | `set("text", v)` is sugar for `set({text: v})`, and `set` is `apply`. | `core/Item/Item.js:92`, `:124-144` |
| 2 | `apply` hands each key to `set_one`. `text` is not a method and not a child, so it is data: `put`, then, because the value changed, `emit("change")` and `emit("delta", {set: {text: v}}, n1)`. The second argument, the **origin**, is the item that changed. | `Item.js:146-159` |
| 3 | `emit` calls `n1`'s own listeners, then `parent.emit(...)` with the same arguments. It climbs `n1` → `c1` → `root`. **The Lists are skipped**: a member's parent is the owner Item. The demo prints `heard at: n1 → c1 → root`. | `core/Events/Events.js:23-27` |
| 4 | The root's store has one listener on the root. It ignores the event while it is replaying, while a button's `act()` runs (`Store.muted`), or when a nearer item has its own file (`owned_below`). Otherwise it builds the line. | `core/Item/Store.js:124-136`, `:264-267` |
| 5 | `line_for` → `hops(origin, root)` lists the names from the root down to the origin: for each member, the **id** it has in its parent's list. Here that's `["c1", "n1"]`. `wrap` nests the payload in them: `{"c1":{"n1":{"set":{"text":"first, edited"}}}}`. For a List's own verb (`add`, `move`…), the List is the origin, and its **name** is the last hop: `{"c1":{"notes":{"add":{…}}}}`. | `Store.js:148-155`, `:273-293`, `:297-299` |
| 6 | `append` queues the line; one microtask later `flush` sends the whole tick's lines. The line is turned into text only then, so an Item inside a line is written as it is at flush time. | `Store.js:162-194` |
| 7 | Where it goes depends on the file name. `task.jsonl`, `session.jsonl`, `improvements.jsonl`: one `POST /api/item` per line to Servex, with a 5 s timeout (`Store.js:196-222`, `Servex/Servex.js:676`); Servex runs the item tool (hop 2.3 below). Every other `.jsonl` (`page.jsonl`): the dev socket's `append` (`ext/filesystem/FsFile.js:134-160` → `Server/plugins/SocketServer/Append.js:64`), which checks the line's shape (`:78`) and appends (`:87`). Off localhost nothing is written; the change stays in memory, with one warning (`Store.js:174-180`). | as listed |
| 8 | The file grows by one line. | `fs.appendFileSync` in `page_tools.js:179` or `Append.js:87` |
| 9 | The **dev server** (not Servex) holds one recursive `fs.watch` on `public/`. A changed `.jsonl` goes to the tail. | `Server/watch.js:60`, `Server/plugins/SocketServer/LiveReload.js:144` |
| 10 | `Tail.changed` reads only the bytes past the last offset, cut at the last newline (a half-written line waits), and sends them as a `jsonl` frame to every socket subscribed to that file. | `Tail.js:78-92`, `:51-66` |
| 11 | In each tab, `Socket.prototype.jsonl` hands the lines to the reader's `read()` if they are past its offset. | `ext/JSONL/live.js:35-47` |
| 12 | `Store.read`: a line this tab sent itself is recognised (same text without `by`/`ts`) and skipped; any other line is replayed with `replaying = true`, so it writes nothing back. | `Store.js:97-119` |
| 13 | `replay_line(line)` is `set(line)` on the root (`Item.js:355`; a Session strips `by`/`ts` first, `core/Session/Session.js:78`). `set_one("c1", …)` asks `get("c1")`: an own property, then `data`, then **a member with that id in any List the root owns** (`Item.js:177-188`). It finds `c1` and hands it the rest; `c1` finds `n1` the same way; `n1.set({set:{text}})` calls the `set` method, and the field changes. In the other tab that change emits its own `"delta"`, which the store ignores (hop 4, `replaying`). | `Item.js:146-151`, `:177-188`, `List.js:116` |

The demo runs this for a root field, an `add` one level down, an `add` two levels down, a field two levels down, a move across lists, and an add plus a remove. After each one, a second tab applies the line and holds an equal tree, and the writing tab skips its own echo.

## (2) An AI change: the item tool on Servex's live root

An agent calls `item({path, delta})`.

1. **The dotted key is expanded:** `{"cards.c1": {…}}` becomes `{"cards": {"c1": {…}}}` (`Servex/agents/page_tools.js:1074`, `expand_dots` at `:429-439`). Only the item tool does this; `Item.set` stores a dotted key as a field literally named `"cards.c1"` (checked in node).
2. **Servex keeps one live root per file:** it replays the file once (`live_root`, `page_tools.js:738-750`) and keeps it while the file's size and modified time are unchanged.
3. **The line is checked by replaying it first.** `put` runs `try_line` on the live root (`:1116-1118`, `:761-765`); if it throws, nothing is written. Task and Session files are also checked against the class (`validate`, `:1099`). A page has no live root (no `Page` loader, `:400-404`); it gets a shape check only (`page_refusal`, `:1100`).
4. **`by` and `ts` are added** to the outer line, and it's appended (`:1179` → `write_line`, `:172-181`).
5. **From here it's hops 8–13 above:** the dev server tails it to every open tab, and each tab replays it. No tab sent it, so none skips it.

In the demo, the agent's line is `{"cards":{"c1":{"set":{"title":"…"}}}}`. **It names the list (`cards`), and both tabs replay it correctly today.** `List.get` falls back to its members (`List.js:116`), so a hop that names the list already reads. Only the browser's writer leaves the name out (hop 5). Also checked: `{"tasks":{"c3":{"start":{}}}}` replays on a Task and on a Session.

## (3) A raw append by a hook

`.claude/hooks/prompt-relay.mjs:74` and `ledger.mjs:47` call `fs.appendFileSync` themselves. Nothing checks the line, nothing stamps `by`/`ts` unless the hook adds them, and no live root sees it first. If Servex holds a live root for that file, the size change makes it replay the file on its next call (`page_tools.js:740`). From the file onward it is hops 9–13. The demo appends half a line: the tail sends nothing until the newline arrives (`Tail.js:62`), and then every tab applies it.

## (4) A fresh load

Code builds the structure first: the root class and its fixed lists, made quietly. Then the store reads the file from byte 0 and replays every line through the same `set()` (`Store.js:97-110`; `Item.open`, `Item.js:359-373`; for a page, `core/Page/Jsonl.js:26-50`, where line 1 builds the page). First load and live updates are the same code. In the demo, a third tab replays the file and gets a tree equal to the live one, with `n1` adopted under `c2` and the removed card gone.

## Pages: what writes a line and what stays quiet

| What | Written? | Why |
|---|---|---|
| A child page declared in code (`children: "kid"`) | **No** | `declare()` puts a stub in `page.pages` quietly (`Children.js:20-25`); code rebuilds it on every load |
| A child page created by an agent (`item({delta:{pages:{add:{name}}}})`) | **One `{"file":"kid/page.jsonl"}` line in the parent** | The item tool takes the `pages` key itself (`page_tools.js:1109`, `apply_pages` `:378-389`): `Subpages` makes the folder and its `page.jsonl`, then appends the `file` line (`Servex/agents/Subpages.js:42`). On replay that line calls `file()` → `link_child` → a quiet stub (`Jsonl.js:61-70`, `:89-92`) |
| The child page's own changes | **In its own file only** | A Page doesn't bubble (`Page.class.js:68`); it is the root of its own `page.jsonl` |
| Content the page's code draws (a function, a string) | **No** | A `transient` item (`PageContentItem.js:6`), inserted quietly (`PageContent.js:27-31`), left out of `toJSON` (`:61`) and `lists()` (`Page.class.js:122-126`) |
| A content part added from the UI (`page.content.add({...})`) | **One `{"content":{"add":…}}` line** | A loud List verb. On replay, `Page.set` sends a `content` key to `content.fill` → `PageContent.set` → `add` (`Page.class.js:81-84`, `PageContent.js:23`, `:46-50`) |
| A verb on `page.pages` (`add`, `move`) | **A line is written, but it doesn't replay** | `Page.get` routes `content` but not `pages` (`Page.class.js:120`), and `lists()` names the list `_pages`. The line lands in `data.pages` (demo B7). Nothing calls these verbs today (searched), so this is waiting to bite, not biting |

## Would `set` of a List or an Item wire up persistence? No

- **On a Page, `page.set("x", v)` throws** (`Cannot use 'in' operator…`): `Page.set` takes one object (`Page.class.js:74`), so the two-argument form is broken on every page. Write `page.set({x: v})`.
- **`set({x: item})`** puts the item in `data` as a plain value and writes `{"set":{"x":{"type":"Item","id":…,"data":{…}}}}`, a snapshot. The item gets no `parent`, so its later changes are never written, and on replay `x` is a plain object (B3, B6). This confirms seat (a).
- **`set({pages: list})`** does the same: `data.pages` holds the List and `page.pages` stays its own List (B6).
- **An Item placed in a property by hand, with its `parent` set**, is worse: its changes are written **flat onto the parent** (`{"set":{"title":…}}` changes the parent's title on replay), because `hops` only knows lists (`Store.js:286-292`; B4).

**The clean rule** (the reasons are in [notes.md](notes.md) §3):
1. A property that holds an Item or a List is **declared by its class and made on first use** (Task's `tasks` pattern, `core/Task/Task.js:52-56`, `:71`, `:76-78`). It is never replaced by `set`.
2. `set({x: …})` on a declared container **walks into it** (a delta object) and **refuses anything else, loudly**. On an undeclared key, an Item or List value is refused too ("declare it"), never stored as a silent snapshot.
3. **Adoption stays in one place:** a List verb, or the declared slot's own setter. Both set `parent`.
4. **Every hop is named:** a slot or a list by its property name, a member by its id. The reader already does this; only `Store.hops` changes.
