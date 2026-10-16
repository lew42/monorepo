# A Page instance on the server, and one `app(path, delta)` tool (design, nothing built)

The ask: [requirements.md](../../../ai/sessions/2026/10/15/voice-20261015/page-instance/requirements.md) (the owner's dictation, quoted there). **Design only, written 2026-10-15.**

## The plain answer

- **Yes to a cached server-side page instance, per path, loaded on demand and dropped when idle.** Tools call `set(delta)` on it. It stamps `by`/`ts`/ids, checks the line, applies it to its own copy, appends it to the log, and tells the readers. Build it as `PageDoc` (a node-safe `Item`) held by a `PageHost`.
- **Not yet to "instantiate the whole App server-side".** The real `Page` and `App` cannot be built in node today (they read `location` and the DOM when their files load), and "every page" breaks the on-demand rule. The same goal, one tool that reaches any page, is met by `PageHost.get(url)` loading only the page asked for. `page_set` already is that tool; `app(path, delta)` is its renaming plus a dot-path sugar, so it comes last, not first.
- **Static compatibility holds** because the instance is a cache of the log. The log stays the source of truth, the browser and the static site read the same file, and nothing on the site imports the server class.

```
today    tool ──append──▶ page.jsonl ──watcher──▶ Tail ──socket──▶ tabs      (tool never holds the page)
proposed tool ──set(delta)──▶ PageHost ─▶ LivePage{PageDoc} ──append──▶ page.jsonl ──▶ tabs
                                 cached per path, idle → dropped      (the watcher stays as the fallback)
```

---

## 1. How a delta addresses nested data today

**Nested objects. Never dot paths.** One key per level; each level is the same rule applied again.

- `core/Item/Item.js` `apply()` (lines 99–119) walks a delta key by key. `set_one()` (121–134): a key naming a **method** on the item calls it; otherwise `get(key)` (152–163) finds a property or a child id, and if that has its own `set()` the value is handed down as a nested delta; otherwise it is plain data. So `{"k2":{"answers":{"add":{…}}}}` means "k2 → its answers list → add".
- `Servex/agents/page_tools.js` builds the nesting: `nest(target, payload)` (line 106) turns `target: ["k2","answers"]` into `{k2:{answers:payload}}`. The `TARGET` schema (line 159) says outright "a list of hops… never a string with slashes or dots". `page_set` (380–397) is `nest(target, {...delta, by, ts})`; `page_add` and `page_call` are sugar over it.
- The model and the "to do X, send delta Y" table: [ai-api.md](ai-api.md). The line format: [jsonl.md](jsonl.md).
- The one old path form, `{"at":"k2/answers", …}` with slashes, is **compat only**: `Item.apply` still reads it (lines 103–112) through `locate()` and warns; nothing writes it any more.
- `doc/content-census.mjs` is not about addressing: it counts how many files use each content form (`content(){}`, `content:"…"`, `{"content":…}` lines, `children:"a b"`). It is the tool to run before changing any of them.

## 2. Dot paths onto nested objects; does a deep get exist?

**The mapping is mechanical:** `content.k2.answers` + `{add:{…}}` is `{content:{k2:{answers:{add:{…}}}}}`. The existing `target` array is the same list of hops; a dot string is `target.split(".")`, one line of sugar. Ids and property names have no dots (`k2`, uuids, `content`), so nothing in a page collides; a hop that did would use the array form.

**A deep get half exists, and nothing is called `app.get`:**

| Exists | What it does | Caveat |
|---|---|---|
| `Item.get(key)` | ONE name: own property, then data, then a child id across every list it owns | not deep; it is the step each level of a delta takes |
| `Item.find(id)` | deep search by id, any depth | by id only |
| `Item.locate("a/b")` | deep walk by a path | slash form, **compat-only**, logs a warning |
| `App` | a plain class, **not an `Item`**; has no `get` | pages are reached by `Router.load_segments` → `page.child(name)` |

So the new method is `PageDoc.at(path)`: split on `.` and call `get()` per hop (five lines). It should **not** revive `locate()`, which the owner retired.

**One real ambiguity.** The owner wants the app path to "resemble the filesystem path". Page urls are slash paths (`/framework/core/Page/`) and folder names can contain dots, so `framework.core.Page` would be guessing. **Recommendation: the page stays a url, dots only run inside a page**: `page_set("/live/", delta, at: "content.k2")`. The tool the owner pictured, `app("framework.core.Page.content.k2", delta)`, can be added as a second spelling that splits at the first hop that is not a folder, but it buys nothing the two fields do not already give.

## 3. Does a server-side Page keep static-site compatibility?

**Yes, if the server class is only a cache of the log.** Production is static: the browser fetches `page.jsonl` once and replays it (`Item.Store.load`). Nothing about that changes, because the server instance never renders and the log stays in the same line format.

What decides how far "server-side Page" can go today:

- **`Item`, `List`, `Store` already load in plain node.** `Item.test.mjs` runs them; `Store.js` and `Item.js` read `location` only through `globalThis.location?.`.
- **`Page.class.js` does not.** It imports `View`, which touches `Element` at load, and reads `location.hostname` at the top (`const dev = …`). So does `Jsonl.js`. `App` imports `Page` and `View`. A real `Page` in node needs the state half split from the view half ([split-plan.md](split-plan.md)), or a DOM shim, which would be a new dependency (CLAUDE.md: ask first).
- **A `page.js` page has no log.** `export default new Page({ content(){ h1(…) } })` runs code that captures DOM. It cannot be a server instance, and it has no deltas to receive. The host refuses it with a plain message; only `page.jsonl` pages (and the session tabs inside them) are instances.

**The risk is a second replayer**, which [architecture.md](architecture.md) already names: if `PageDoc` invents semantics the browser `Page.set()` lacks, the two disagree. The defence: `PageDoc extends Item` and uses `Item.apply` untouched, so it differs from `Page` only where `Page` overrides `set` (the six layout words, `tab`, `file`; here those stay plain data). A conformance check replays real page logs in `PageDoc` and in a headless browser and compares the title and the content ids.

## 4. What breaks or changes

- **The live() tail: nothing, for now.** The instance appends to the same file, so the watcher → `Tail` → socket road is untouched. Measured with today's tools, a written card is on screen in 21–111 ms ([ai-api.md](ai-api.md), "The live proof"), so pushing the line directly saves almost nothing. The push becomes worth it with a Durable Object (section 7). The watcher stays the delivery for every writer that is not the instance.
- **/live polling off localhost: nothing.** `public/live/Live.js` polls `page.jsonl` with a Range request every 3 s when there is no socket (a tunnel). That reads the file, not the instance. In production there is no server at all.
- **The page inbox: coexists, with one rule.** `PageInbox` tails `page.jsonl` itself and reads `note`, `inbox` and `note_state` lines; its writers (`page_note`, `page_reply`, the `/api/inbox/mark` call, all in Servex) append straight to the file. They keep working. **The rule that makes coexistence safe: before every operation the instance reads whatever other writers appended past its own byte offset and applies it** (only up to the last newline, as `Tail.read` does). If the file got shorter than the offset, it was rewritten: drop the instance and reload, the same as `jsonl_reset`.
- **The review gate: nothing.** `Server/merge.mjs` judges a branch's changes; the instance writes the main tree's `page.jsonl`, as `page_set` does now. One thing to carry: an instance is keyed by `(repo root, path)`, so a worktree server and the main tree never share one.
- **The principle it bends.** `page_read` says "no second copy of the page is ever stored: every call re-reads page.jsonl". An instance is exactly a second copy. The offset check above is what keeps it honest: the file is always the truth, and the copy only saves replaying a 7 MB log on every call.
- **Dangerous keys.** `Item.apply` calls any method a key names. In the browser that is harmless; in node, with the file system in reach, a delta key `save` or `delete` is not. The instance accepts only an **allowlist of verbs** (`add remove move order`, plus declared fields and data keys), and refuses the rest with the reason.

---

## 5. Class architecture

```
PageHost                    the manager: Map<file, LivePage>; get(url) loads on demand,
  │                         set(url, delta, by), read(url); sweep() drops idle ones (5 min, like QueryServer)
  └── holds many
LivePage                    one cached page: { doc, file, offset, used_at }
  │   set(delta, by)        sync() → check → stamp → doc.apply → append → notify()
  │   sync()                read lines other writers appended past `offset`; reload if the file shrank
  ├── composes PageDoc      the page's state, no screen
  ├── uses FileJournal      the append (page_tools' write_line today; storage.md's FileJournal later)
  └── uses Notify           one method: notify(file). First version: nothing (the watcher does it).
                            Later TailNotify (the dev server's Tail.changed), then RoomNotify (WebSocket)

PageDoc extends Item        core/Page/PageDoc.js; plain ESM, no DOM, no node imports (a Worker can load it)
    content: List           the cards; List already has add / remove / move / order
    set(delta)              Item.apply, then the verb allowlist
    at("content.k2")        the deep get: split on "." and get() per hop
    toJSON()                the true current state (what page_read renders)
```

- **Where it lives:** `PageHost` and `LivePage` in Servex (`Servex/agents/`), because Servex is the always-on process and the single writer of logs. `PageDoc` in `core/Page/` so the browser could one day use it too.
- **Why not in the dev server:** the browser sockets live there, which makes notify trivial, but it restarts whenever `Server/` changes, it exists per worktree, and it is local only. The Durable Object that replaces all this in production has the instance, the log and the broadcast in one place; Servex-hosted now, with `notify` as the seam, is the shape closest to that.
- **The tools:** `page_set`, `page_add`, `page_call`, `page_log` all become `host.set(url, delta, ctx.caller)`; `page_read` becomes `host.read(url)`. `resolve()` (session routes) stays as the path-to-file step inside `PageHost.get`.

## 6. The smallest first slice

1. **`PageDoc`** (about 60 lines) plus a test that replays real `page.jsonl` files and compares with `page_tools`' current `replay()`. This replaces the partial replay in `page_tools.js` (lines 170–244) with the real one. That alone gives `page_read` the true state, and is the exact blocker [architecture.md](architecture.md) ("Log growth") names for compaction snapshots.
2. **`PageHost` + `LivePage`** with `get`, `set`, `read`, `sync()`, the allowlist and the idle sweep. No `notify`.
3. **Switch the four write tools and `page_read` to it.** Delete `nest`/`stamp_ids` from the handlers and keep them as `LivePage` methods. `page_tools.test.mjs` already exists.
4. Needs a Servex restart to take effect; direct appenders keep working throughout.

Not in the slice: `app(path, delta)`, notify, the dot-path sugar, moving `page_note`/`inbox` writers, any change to `Page.class.js`.

## 7. The transition (direct append coexisting)

1. Slice above: only the agent tools use the instance. Everyone else still appends, and `sync()` folds their lines in.
2. The Servex note and inbox writers call `host.set` too (one stamped, checked path).
3. `Append.js` (the browser's write) routes through `FileJournal` ([storage.md](storage.md), slice 2), and `notify` becomes `TailNotify`: the instance calls `Tail.changed(file)` right after its append, which reads only the new bytes. The later watcher event finds nothing new, so there is no double delivery.
4. Then, and only then, is the watcher an implementation detail. A Durable Object takes the same three parts: `PageHost` is the namespace lookup, `LivePage` is the object, idle drop is hibernation, `FileJournal` becomes its SQLite lines, `notify` becomes the WebSocket broadcast.

## 8. Tradeoffs and alternatives

| Choice | For | Against |
|---|---|---|
| **Stateless tools (today)** | no cache to go stale; simplest | every `page_read` replays the whole log; no true state in node, so no snapshot or compaction |
| **`PageDoc extends Item` (recommended)** | reuses `Item.apply`; node-safe; same shape a Durable Object needs | a second replay to keep equal to `Page.set()` (tested, section 3) |
| **Make the real `Page` run in node** | one replayer, ever | the state/view split first ([split-plan.md](split-plan.md)); weeks, not a slice |
| **DOM shim (jsdom, linkedom)** | runs `page.js` pages too | a new npm dependency, and `page.js` pages still have no deltas |
| **Instance in the dev server** | direct socket push | restarts often, per-worktree, dev only |
| **Instantiate the whole App** | one root for `app.get` | cannot build in node today; loads all pages, against "never all pages"; one tool that calls any method is the widest door to guard |
| **`app(path, delta)` as a new tool** | one tool in the list | `page_set` already is it; a second name for one thing breaks "one of everything" unless `page_set` is retired |

**Cost to watch:** a cached instance holds the log in memory. Logs past about 1 MB (10 files; the largest 7.2 MB) should be compacted first or kept out of the cache; a cap of a few hundred instances, least recently used first, keeps it bounded.

Related: [storage.md](storage.md) (Store, Journal, the Durable Object path), [streaming.md](streaming.md) (a line's journey), [server.md](server.md) (the query-source form of a server-side page), [ai-api.md](ai-api.md) (the tool).

## 9. Direction: a swappable transport (the owner, by voice, 2026-10-16 ~03:20Z; direction only, nothing built)

A page's data source is already a seam: its data half can live in node as a `QueryServer` source ([server.md](server.md)). The direction is to make the **transport** swappable behind that seam. Today it is JSONL appends plus the dev socket's push; later it could be a Cloudflare Durable Object holding the same page. The page logic stays the same either way: `set(url, delta, by)` and `read(url)` don't care which transport carries the deltas. Source: voice question 0fe2fc0f in [voice-20261016](../../../ai/sessions/2026/10/16/voice-20261016/task.jsonl).
