# Page and Item, one system: the proposal

The owner's ask (2026-10-01): "show me a simple example, top down, of how the system should work… could Page extend Item… harmonize page.set and item.set". Proposed by vscode-mastermind. **Approved by the owner (2026-10-02). The build is at [2026-10-02/page-extends-item](../../2026-10-02/page-extends-item/requirements.md).**

## LATEST (the owner, 2026-10-03): no `at`; a key is a path resolved by `get()`, the owner's original `set`
One rule, the same `set(obj)` the owner first designed: for each key of the line,
1. a key that names a METHOD calls it with the value (`add`, `move`, `order`, `remove`, `file`, `place`…);
2. otherwise the key is a PATH: `this.get(key)` resolves it (a property, a child's id, or a dotted path like `k2.answers`, the same idea as `app.get("a.b.c")`). If what it finds has its own `set`, the value is handed to it (recursion);
3. otherwise it's plain data: stored, and `change` is emitted.

So the lines read like ordinary nested sets, and there is no special `at` key:
```json
{"title": "Notes"}                                   // data on the page itself
{"k2": {"title": "New"}}                             // item k2 (found by id) sets its title
{"k2.answers": {"add": {"id": "a1", "text": "Yes"}}} // k2's answers list adds an item
{"pages": {"move": {"id": "intro", "after": null}}}  // the page's own pages list
```
`get(path)` is the one resolver (properties first, then child ids, split on "."), used by replay, by tools (`page_set(path, key, value)`) and by code. Supersedes `{"at": …}` everywhere above.

## LATEST (the owner, 2026-10-02, fifth pass): no LiveList; List has events. Logs that survive a bad line
- **Scrap LiveList everywhere.** If you only need an array, use a plain array. `List` itself gets Events built in: `add(x,{after}) remove(id) move(id,{after}) order([ids]) find(id)`, each emitting the line it saves. "A list" now means "an evented list".
- **The shape:** `Events` (mixin) → `List = Events(Base)` (items: [], the verbs) · `Item = Events(…)` (id, icon, title, data, `set(delta)`, `store`) → `Page extends Item` (`pages: List`, `content: List`) · `Task` (core/Task, its own class; `page.task`). An Item HAS lists, it isn't one.
- **Content cards are Items of a registered type:** Question, Decision, Task, Note… each a class registered once (`Item.register`). Recursive: a card holds its own lists. **Where its lines live:** embedded in the parent's page.jsonl (`{"at": "k2", …}`) by default, or promoted to its own folder (`k2/page.jsonl`, with the parent keeping `{"file": "k2/page.jsonl"}`) when it grows. Same object either way.
- **A bad line can't corrupt the page:** every line is validated before it's written (the schema check); on replay a line that fails is skipped and logged, never fatal; ids (not positions) mean later lines still apply; a periodic `snapshot` line is a checkpoint, so a load can start from the last good snapshot. The old whole-file rewrite stays available as `Store` backend for small things where it's simpler.

## A session is a page; one shared class on server and client (the owner, 2026-10-02; vscode-mastermind decided)
- **Sessions live in the existing date tree (the owner, 2026-10-02, second pass):** `public/framework/ai/<YYYY>/<MM>/<DD>/<slug>-<first 8 of uuid>/page.jsonl`, beside the cards already there (e.g. `ai/2026/09/24/vscode-mastermind-361c4d18/`). The year/month/day nesting keeps any one folder small; don't add a `sessions/` level. Line 1 holds the full UUID, the slug, the parent and the model. The DAY's own page.jsonl is the index (it already lists that day's cards as `file` lines), so a session is found the same way a card is. `/framework/ai/sessions/` is only the Sessions TAB (a view that lists sessions across days); a session's own page is its date path. **Session vs task:** a session is one Claude conversation (one UUID); a task is a unit of work (a brief and a landing). A minion's session runs exactly one task, which is why they share a name; a mastermind's session runs its task and spawns child sessions; the VS Code session spans many tasks. They link by id. Tasks still live in `ai/<YYYY-MM-DD>/<slug>/`; moving them into the same date tree is a later, scripted migration (queued), not a reason to give sessions a third layout.
- **No stored mirror.md:** the AI-friendly view is computed on demand from the replay, as markdown by default (fewest tokens) or `format: "html"` for the page's own content HTML without navigation chrome, when the structure matters (`page_read`, plus `node Server/page-read.mjs <path>` for anything without Servex tools). One source, so nothing to sync. Alternative recorded: write mirror.md beside the page on each change, only if grep-ability ever matters more than the duplicate.
- **Isomorphic core:** data classes (Events, List, LiveList, Item, Store's parse and replay) live once in `public/framework/core/`, touch no DOM at import time, and Servex imports them by path (Servex already imports a few public/ modules: directory.js, inbox.js, pages.js). The View is a static part loaded only in the browser. The Node-only part (file writes) is a swappable Store backend, not a second class. Today Servex uses Node's EventEmitter (Process.js) and the client its own `on/off/emit`; new server code uses core's Events.

## Sessions, prompts, asks, tasks: the AI record (vscode-mastermind's proposal, 2026-10-02)
```
Session                 a Claude conversation. Its transcript stays in ~/.claude (kept 10 years now), read-only; we read it only to recover or audit
Prompt                  one owner message: raw text (.claude/prompts/<date>.jsonl, logged by a hook) + its refined forms (clean, structured, flags) as later lines
 └─ sentences[]         each with an id, so everything downstream can point back to the exact words
Ask                     one thing the owner wants, built FROM sentence ids (coverage: every sentence lands in an ask, or is marked "context")
Task extends Page       a folder + page.jsonl: requirements (each line cites its ask ids), agents, cost, landing, approval
Agent                   a Servex row: session_id, model, task, cost
```
- **The chain is by reference, never copied:** Task → Ask ids → Prompt sentence ids → the raw words. A requirement nobody can trace back to a sentence is flagged, and a sentence no ask covers is flagged. That's the line-by-line "was every word handled?" check, done by node.
- **Confidence:** each ask carries the refiner's confidence. Low confidence → a clarification question on the card, answerable later.
- Raw transcripts are NOT committed (secrets, size). The prompt log and its refined lines are the durable, committed record.

## Tasks are pages too (the owner, 2026-10-02; design, after Page extends Item lands)
- **Decided (the owner, 2026-10-02): one streaming system. A task's log becomes its `page.jsonl`,** so a task is simply a page and gets every page feature (saving, AI chat, the inbox). During the move, Store reads an existing `task.jsonl` as that page's log, and new tasks write `page.jsonl`.
- A task folder (`ai/<date>/<slug>/`) is a Page, and its log is that page's log: the same Store, the same `set(delta)`, the same verbs (`assign`, `log`, `action`, `agent`…) as methods on a `Task extends Page` class. Today ext/JSONL + ext/AITask read it separately; that's the duplication to remove.
- A Claude session transcript stays outside the repo and read-only. A task REFERENCES its sessions by id (`session_id`), so the session is never copied.
- The Dashboard, the Log, the Inbox and the per-page AI cost all read Task pages through one LiveList, so their filters apply to one data set.

## Authoring: markdown with live instances spliced in (the owner, 2026-10-02; queued, not built)
- **Markdown is the default way an AI writes content.** It's plain strings: `@agent`, `#Page` and `/path` are already references (ext/Mention), so no helper functions are needed.
- **A registered class goes inside markdown as a fence:** ```` ```Question {"text": "…", "tags": ["core/Page"]} ```` renders a live `Question` instance from the ONE type registry (`Item.register`). `ext/markdown/md.js` already overrides the fence renderer (for file labels), so that's the hook.
- **Same JSON either way:** the fence body is exactly the delta a page.jsonl `add` line would carry, so content moves between a .md file and page.jsonl with no translation.
- Helper functions (`p()`, `h2()`) stay for hand-written page.js. They're not deprecated, just no longer the main path.

## LATEST (the owner, 2026-10-02, fourth pass): a list is a PROPERTY, not a parent; only Events is mixed in
Counted 2026-10-02: Page already has about 115 methods (about 70 in Page.class.js plus about 45 in its base, PageLog in Log.js). Inheriting List (13) + LiveList + Item would add about 25 more, and these names already mean something else on Page: `add(name, child)`, `move(url)`, `get`/`set` (per-page localStorage), `open`, `walk`, `find`. So:
```
Events(Base)                 mixin: on / off / emit. Self-contained, so it never clashes
List                         plain ordered array + small helpers
 └─ LiveList = Events(List)  add(x,{after}) remove(id) move(id,{after}) order([ids]) find(id); emits each change
Item = Events(Object)        a thing: id, icon, title, data, get / set(delta), store, view. About 12 methods, no list ones
 └─ Page                     + path, url, route, files…
     pages: LiveList         its sub-pages:  page.pages.add(…), page.pages.move(…)
     content: LiveList       its visible blocks
```
- **Composition for lists, inheritance only for "is a":** a Page IS an Item; a Page HAS lists. Each list is named for what it holds (`pages`, `content`), and the list's whole API lives on that list, not on the Page.
- **Mixins only for small, standalone tools** that touch nothing else (Events). List and LiveList are not mixed in.
- **An Item that needs children** gives itself a LiveList property named for them. Item itself has none built in.
- Supersedes the third pass (Item extends LiveList) and the `get pages()` alias. Rejected: inheriting the list API, because of the namespace clashes counted above.

## (superseded) Third pass: Item extends LiveList; Card is only a look
```
Events(Base)                    on / off / emit, a mixin; events bubble to the parent
List                            items: [], a plain array plus small helpers
 └─ LiveList = Events(List)     add(x,{after}) remove(id) move(id,{after}) order([ids]) find(id); each emits its line
     └─ Item                    an arbitrary thing: id, icon, title, data, set(delta), get, store, view (the icon item)
         └─ Page                + path, url, route(), files; its sub-pages are simply its items
```
- **Card is UI only:** a way of drawing a Page (small, inside its parent). There's no Card class in the data. A sub-page that has no folder yet lives as lines in its parent's page.jsonl, and that's all a "card" was.
- **Item extends LiveList:** an Item IS a list of sub-items. `item.items` is the plain array (List's own), and the live verbs are Item's own methods because it inherits them. No separate `items` object, and no duplicate add/remove.
- **Sub-pages are items.** A Page's `items` holds sub-pages and plain items side by side. Routing matches the ones that are Pages by their path. There's no second `pages` array.
- **Item is the "icon item":** anything with an icon and a title that can be drawn. Page adds the route and the file-system link.
- **`page.pages` (the owner, 2026-10-02):** a Page's items are ONLY its sub-pages, and Page exposes them as `get pages(){ return this.items; }`, a read-only getter with no copy and no measurable cost. Docs, UI and callers say `pages`, and the inherited methods keep using `items`. A page's visible blocks are NOT sub-pages: they live in `page.content`, a LiveList of Items. Rejected: a per-class dynamic array name (`this[this.constructor.key]`), which works but makes every method harder to read for no gain.
- **When to reach for which:** a **List** for plain ordered data (no ids, nothing listens, nothing saves); a **LiveList** when something must watch it change; an **Item** when it's a thing (an icon, a title, saved); a **Page** when it has a URL.
- **One array name all the way down: `items`.** List renames `children` to `items` (List.js plus about 10 `.items.children` callers). LiveList, Item and Page all store in that same array.
- **A sub-page's id is its folder name.** Page's `children` Map (name → page, `null` until loaded) becomes `items`, with an unloaded sub-page held as a small stub Page (id, path, icon, title from its files line) that loads its own page.jsonl on first visit.
- **Name collisions to fix in Page** (checked 2026-10-02): `Page.add(name, child)` becomes the list's `add` with `id = name`; `Page.move(url)` (re-addressing a subtree) is renamed `relocate(url)` so `move` means only "reorder"; check `get`/`set` near Page.class.js:1292 (a localStorage store) and keep it under `store`, not on Page itself.
- Alternative recorded: Item HAS a LiveList (`item.items: LiveList`) instead of being one. Cleaner separation, but two objects per node and every verb delegated.

## (superseded in part) Second pass: `LiveList`, `Events`, and more than one store
- **Why the lists matter:** if every structure is built from lists that emit their changes, the UI just listens, and the same changes stream to disk. That's the whole point, so the children list must be reactive, not a plain array (this reverses "items is a plain array" below).
- **`Events`:** pull `on` / `off` / `emit` out of Item into one small mixin, `Events(Base)` (core/Events), because a mixin can be added to any class without changing its parent. Item, LiveList and anything else that emits use it. Events still bubble to the parent.
- **`LiveList extends Events(List)`:** a List that announces every change. Verbs by id: `add(x, {after})`, `remove(id)`, `move(id, {after})`, `order([ids])`, `find(id)`. Each emits an event shaped exactly like the line it would save. It replaces the `Content` class idea (Content was really "a live list"). Debugging: swap any List for a LiveList to watch it change live.
- **Item:** `items: LiveList` (sub-items, sub-pages and cards). `Item = Events(…)`. Item's own `add/remove/move/order` are short for `this.items.add(…)` and the rest.
- **Stores:** `item.store` is THE default store: `get`/`set` read and write there (its page.jsonl). An item that works on another file reaches it through a File object: `page.file("notes.jsonl").store` is a second Store bound to that file. There's one Store class and one of them per file, never two for the same file.
- **Naming rule stays:** a property is its class in lowercase (`store`, `view`, `events` if it's ever a part instead of a mixin).
- Alternative recorded: Events as a part (`item.events.on(…)`) instead of a mixin. That's cleaner composition, but every caller would write `.events.` and the existing `item.on()` calls would break.

## (superseded in part by the section above) Item IS the list; `items` is a plain array; a property is named after its class
- **An Item is a list of sub-items.** The verbs live on Item itself: `item.add(kid, {after})`, `remove`, `move`, `order([ids])`, `find(id)`. A Card is a sub-page that lives inside its parent's page.jsonl until it gets its own folder.
- **`item.items` is a plain array** of child Items, not a List or Content object. No wrapper.
- **Naming rule: a property holding an instance of a class is named after the class, lowercased.** `page.content: Content`, `item.store: Store`, `x.view: View`. If a thing wants content, it has a `content` property; it is not called `items`.
- **`Content`** is a page's visible content (the blocks you see and drag). It's an Item, so it gets the same verbs and saving, plus a view. A page has `page.content` (made lazily), separate from its sub-pages in `page.items`.
- **`List`** stays the small data-only array helper for code that wants one. Item no longer depends on it.
- Supersedes "items: Content" and "Content extends List" below. The alternative (keep `items` as a Content object) was rejected: one name meaning two things.

## Arrays and lists: four verbs, no array adapter (the owner asked, 2026-10-02; vscode-mastermind's recommendation)
- **Don't mirror JavaScript's array methods.** `push`, `pop`, `shift`, `splice`, `sort` and `reverse` all reduce to four list verbs: `add` (with `after`), `remove`, `move`, and **`order`**.
- **`order` is the batch verb:** a whole-list reorder (an AI sorts 100 pages, or a reverse) writes ONE line, `{"order": ["k3","k1","k2",…]}`, never 100 moves. Replay puts the listed ids in that order. Any id not listed (one added concurrently) keeps its place after its old neighbour, so nothing is lost.
- **A small array of plain values** (tags, a few numbers) is just data. Write the whole array in one line, `{"set": {"tags": ["a","b"]}}`. Only lists of ITEMS (things with an id) get the verbs.
- **Batching is in the writer, not a new format:** changes made in one tick are queued and sent to Append in one call, still one line each. A drag is one `move`, and a sort is one `order`.
- Supersedes the list-order brief's open comparison: A (ids + `after`) for single edits plus C (a full `order` line) for bulk. Fractional keys (B) stay the recorded alternative: one line per move with no ids in `after`, but every item carries a key.

## Lists, references, live updates, pub/sub (the owner, 2026-10-01 16:35)
- **List deltas use IDS + `after`, not indexes.** `add` / `set` / `move` / `remove` by id. Optional conflict guard: a line may carry `base` (the id of the last line its writer saw). If the file has moved on, replay still works because ids don't shift; `base` just flags a concurrent edit for review. That's the "commit hash" idea, used only as a check, never as the address.
- **Breaking a list out:** each item may live as lines in the parent (default), or `{"file": "k7/page.jsonl"}` (its own log). The list keeps only the id and order; the item's data moves. The same promotion as before.
- **The files index:** page.jsonl already gets `{"file": …}` lines from the dev server's watcher (keyed by the first path segment, Log.js). A node "create file" tool should write the line itself too, so the index never depends on a watcher being up.
- **References:** a saved reference is `{"$ref": "/framework/x/page#k7"}` (a path plus an optional id). After replay, a resolve pass swaps each `$ref` for the live object via `app.get(path)` and `find(id)`. Parent links are never saved: they're rebuilt by adoption, as Item does today.
- **Live updates today:** the dev server's `tail` RPC (Server/plugins/SocketServer/Tail.js) watches each subscribed .jsonl with chokidar, keeps a byte offset, and on a change pushes only the NEW lines to the subscribed sockets. Milliseconds, not seconds. The dictation chat doesn't use it yet (ext/Session polls), so moving it onto tail is part of "one system".
- **Pub/sub between pages:** a page PUBLISHES by appending to its own page.jsonl. To SUBSCRIBE, a page adds `{"subscribe": {"to": "/framework/x/"}}` to its own page.jsonl. At load it tails that page's log and routes the lines to a handler (an inbox, a feed). Tail already IS the per-file channel, so no new broker is needed.

## LATEST (the owner, 2026-10-01 16:25): persistence baked into Item, so Page has it
- **One `set(delta)`** for Item and Page, merged (the rule above): a method key calls the method, a settable value receives the nested delta, anything else is data and emits `change` (key, value, old). Events already exist on Item: `on`/`off`/`emit`, with `set` emitting `change` and events bubbling to the root. Page's set doesn't emit today; the merged one does.
- **Page extends Item,** so persistence is built in. **Anything that needs saving becomes a page** ("everything is a page").
- **Inside, it's still one part,** not a separate system: `Item.Store` (a static part, the house pattern) does load, replay, append and tail. Users never touch it (it's baked in), but a subclass can swap it (local storage, memory, cloud). That gives both halves: baked into the API, composed inside.
- **The saving strategy per child page:** embedded as lines in the parent's page.jsonl (the default), in its own file, or in its own folder. Chosen per child, and promoted automatically when it grows.
- The two sections below are superseded where they differ.

## REVISED (the owner, 2026-10-01 16:15): not `Log`, and composition, not inheritance
- **Keep `Log` free** for the real logging API (console-like messages). A JSONL store isn't "a log of everything".
- **What the class really does:** it holds a host's DELTAS. It loads them, applies each to the host through `host.set(line)` (creating registered types as it goes: ONE type registry, the one Item already uses), appends new ones, and optionally streams. Streaming is two-way: appends go up, the tail comes down.
- **Composition:** it's a PROPERTY, `page.store`, `session.store`, `app.store`. It's not a base class, so no name clashes and clear responsibilities. Anything can have one.
- **Backends:** the dev socket (append and tail), localStorage (kept in memory, flushed on `pagehide`/`visibilitychange` and rehydrated on load, for session-scoped things), memory, and later the cloud.
- **Name: `Store`** (`obj.store`), decided 2026-10-02. Alternatives were `Journal` (append-only history) and `Deltas`; a rename later is cheap.
- The `Log` sketch below stands as the mechanism, renamed.

## One JSONL system: `Log` (the owner, 2026-10-01 16:05; replaces the four ad-hoc readers and writers)
```js
class Log {                        // one .jsonl file = one object's history
  url
  lines: [{}]                      // parsed, in file order
  load()                           // fetch + parse (static sites can do this)
  replay(into)                     // into.set(line) for each line: hydration
  append(line)                     // validated, then handed to the Writer
  static Writer                    // dev: socket append · cloud: a Saver · static: none (read-only)
  static Tail                      // live new lines when a server exists; otherwise nothing (one load)
  mode: "single" | "split"         // split: a child object that grew gets its own folder and log
}
```
- **It's a manager, not a stream.** Streaming (Tail) is an optional part, so a log on a static site still loads and replays.
- **Deep updates by path, through ids:** `{"at": "k2/k3", "set": {...}}`. Ids are unique within their parent, so there's no global namespace to manage.
- **Speed:** a long log gets a SNAPSHOT. Every N lines, a `{"snapshot": {...}}` line holds the whole state, and loading reads from the last snapshot on, with older lines rolled into `page.log.jsonl`. MEASURE first where the 1–3 s page delays come from (fetch, parse, replay or render) before optimising.
- **It replaces:** Servex Log (the single writer stays inside Writer), ext/JSONL (the reader), PageLog's replay, and ext/Session's own watch().
- **Page extends Item:** the owner leans yes ("seems reasonable", 16:05).

## FINAL naming (the owner, 2026-10-01 03:50): keep `List`. No `Collection`.
- **`List` is THE list**, a plain array wrapper, short and familiar. Upgrade it once and every list on the site gets the upgrade.
- **A List is NOT a View, and a View is NOT a List** (the owner, 04:00): merging their method names would confuse everyone. **A List HAS a view.** There's ONE `List` class, with its view as a static part, created lazily: `class List { static View = ListView }`, and `list.view` exists only when something draws it. `ListView` makes the items sortable by default. No second class named List and no `ListUX`: a list that needs a different look swaps its part (`static View = MyView`), so subclasses don't redo any helpers.
- Content is built mostly from JSON lines by node code, not hand-written with helpers, so the helper-function question matters less here.
- **`class Content extends List`**, and Content HAS a managed view (`content.view`, an upgraded View that Content drives: it draws the items and makes them sortable).
- `Item` keeps `items` as a lazy Content. `Page extends Item`.

## Saving content (checked 2026-10-01)
- **Dev, today:** the dev socket already has an **append RPC** (`Server/plugins/SocketServer/Append.js`, since 2026-08-31). One line goes in, `fs.appendFile` writes it, and the path must resolve under `public/` and end in `.jsonl`. No whole-file write: `rpc:write` (FileSaver) stays only for non-log files. Every tab tailing the file gets the line live. Concurrent writers interleave safely.
- **To add:** validate each line in `Append.js` with the same schema check `append.mjs` and `append_log` use (wave A, `.claude/hooks/jsonl-schema.mjs`), so a browser can't write a malformed line.
- **Production (static site, no dev server):** the same `append(line)` goes to a cloud sink. `public/imagine/stream/doc/durable-objects.md` already sketches a Cloudflare Durable Object, which does exactly this. That's the `CloudSaver` later.

(The "Naming, revised" section below is superseded: no Collection, and List is not renamed.)

## Naming, revised (the owner, 2026-10-01 03:40)
Free up the name `List` for the thing people SEE. **The plain data list becomes `Collection`** (today's `core/List`: only 2 callers, so the rename is cheap; keep a `List` re-export for one release). **`List` becomes the UX list** (`ux/List`): a View that draws a Collection or Content, sortable by DEFAULT through `ext/Draggable/Sortable`. "Just use a List" then gives you drag-to-sort for free, with sorting switched off by an option.

| Class | Is a | Job |
|---|---|---|
| `Collection` | — | the ordered data array: append, insert, remove, events. No UI, no saving. |
| `Content` | Collection | edit verbs by id (add, set, move, remove, `after`) |
| `Item` | — | persistent object: id, data, get/set, events, log lines; `items` is a lazy Content |
| `Page` | Item | URL, routes, rendering |
| `Card` | Page | a smaller page |
| `View` | — | the DOM |
| `List` | View | the UX list: draws a Collection or Content, sortable by default |
| `Sortable` | behaviour | drag and drop; `List` uses it |
| `Saver` | — | where the lines go |
| `types` | module | one class registry |

## The shape

```
Item                 a persistent object: id, data, events, an ordered list of child items
 └─ Page             an Item that has a URL, routes and renders
     └─ Card…        a smaller Page (an Item that grew), one class line away
item.items: Content  extends List: the ordered children plus the edit verbs. No persistence of its own.
```

- **Every Page IS an Item.** Its content is `page.items`, and a sub-page is simply an item that has grown into a page.
- **Persistence lives in Item, once:** each change is one line appended to the NEAREST page.jsonl.
- **List stays a plain array wrapper.** `Content extends List` only adds the edit verbs (add, set, move, remove) and events.

## One `set`, harmonised

Today the two `set`s differ:
- **`page.set(obj)`:** replays a log line. A method key calls the method, a settable value merges, and anything else is data.
- **`item.set(key, value)`:** stores data and emits `change`.

**One rule:** `set(obj)` takes a DELTA object, the same shape as a log line.
1. A key that names a method calls the method (e.g. `place`, `file`, `add`).
2. A value with its own `set()` receives the nested delta (recursion).
3. Anything else is data. It goes in `data`, and emits `change` with the key, the new value and the old value.
4. **Live or replay:** when the object is being REBUILT from its log, nothing is written back. A live change appends the delta as one line. A flag on the replay pass, not a second method.

`item.set("title", "Hi")` remains as sugar for `item.set({ title: "Hi" })`.

## Top down: one page, from file to screen and back

**On disk:** `notes/page.jsonl`, the page and everything on it, in one file:

```json
{"class": "/framework/core/Page/Page.js", "title": "Notes"}
{"add": {"id": "k1", "type": "p", "text": "First thought."}}
{"add": {"id": "k2", "type": "Card", "title": "An idea", "after": "k1"}}
{"at": "k2", "add": {"id": "k3", "type": "p", "text": "Detail inside the card."}}
{"at": "k1", "set": {"text": "First thought, edited."}}
{"move": {"id": "k2", "after": null}}
```

**Loading (hydrate = replay):**
1. Line 1's `class` is looked up in the shared type registry (`core/types`), and the Page is built.
2. Each later line is `page.set(line)`, in file order: `add` creates an Item of the registered `type` in `page.items`, `at` finds the item by id and passes the rest to it, `set` changes data, and `move` reorders.
3. The view draws `page.items`. Each root item is a `Sortable`.

**Editing (live):**
- The owner drags `k2` to the top. Sortable calls `item.move(...)`, Content emits `move`, and Item appends one line, `{"move": {"id": "k2", "after": null}}`.
- The owner types in `k1`. Item emits `change` and appends `{"at": "k1", "set": {"text": "…"}}`.
- Nothing is ever rewritten. The file is the history.

**Promotion:** when `k2` grows (replies, length, a task), its lines move into `notes/k2/page.jsonl` (class Card), and the parent keeps `{"file": "k2/page.jsonl"}`. It's the same object either way; only where its lines live changes.

## Alternative (recorded)
Keep Page and Item separate and share only the log writer and the type registry. That's less surgery, but you keep two `set`s, two tree models (`children` Map vs `items` List), and "is this a page or an item?" at every seam, which is the duplication CLAUDE.md law 6 forbids.

