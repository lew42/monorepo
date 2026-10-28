# Notes: Item, List, Store and JSONL as built (analysis seat a)

The shape is in [shape.md](shape.md). This page is the evidence and the judgement. Line numbers are at `be7e964c0` (2026-10-28); grep the name if one drifts. Every "proved" below is a run of the scripts in [experiments/](experiments/) (`node experiments/exp.mjs`, then `exp2.mjs` and `exp3.mjs`); the output is quoted.

The existing tests all pass: `Item.test.mjs` 16, `Item.basic.test.mjs` 13, `Store.test.mjs` 10, `act.test.mjs` 9, `List.test.mjs` 17. None of them covers the six gaps below, which is why they are still open.

## 1. How each piece actually works

- **`set` is `apply`.** `set("k", v)` is sugar for `set({k: v})` (`core/Item/Item.js:92`). `apply` walks the delta key by key (`Item.js:124-144`). Each key goes through `set_one` (`Item.js:146-159`), which tries three things in order:
  - a method with that name: call it with the value (`add`, `start`, `remove`…);
  - `get(key)` finds something with its own `set()`: hand the value down as a nested delta. This is how `{"k2":{"answers":{"add":…}}}` walks one level per key;
  - otherwise it is data: `put`, and if it changed, emit `"change"` and one `"delta"` `{set:{key:value}}`.
- **`get` resolves ONE name** (`Item.js:177-188`): an own property, then `data`, then a child's id in any List this Item owns (one level only, not a deep search). `List.get` adds its own members (`core/List/List.js:116`).
- **Adopt.** `List.adopt` sets `child.parent = owner` (`List.js:77-80`), always, overwriting any old parent. Nothing else sets `parent`.
- **Ids.** A new Item gets `crypto.randomUUID()` (`Item.js:35`, `:274`). The item tool stamps a uuid on any `add` that has none (`Servex/agents/page_tools.js:196-207`), but `tasks.add` uses a **slug of the title** (`page_tools.js:486`, `:1137`). `List.insert` refuses a duplicate only among siblings, and an id that equals a property name (`List.js:149-167`). `hydrate` is stricter: it gives a fresh id to any id already seen anywhere in the document (`Item.js:310-312`).
- **Order.** The array is the order. Every verb names a neighbour (`after`), never an index (`List.js:128-144`). `order(ids)` rewrites the whole order in one line (`List.js:278-295`).
- **Moves.** `move(id, {after, before, from})` (`List.js:246-273`). Across lists the line carries `from` as the old `/` path string, built by `address()` (`core/Item/Store.js:241-261`) and read back by `locate()` (`Item.js:196-206`).
- **Loud vs quiet.** `insert`, `replace`, `release` never emit; `add`, `remove`, `move`, `order`, `clear` each emit one `"delta"` (`List.js:187-192`). Loading is quiet; a change is loud.
- **Recording.** `Store.attach` listens for `"delta"` on the root (`Store.js:124-136`). It skips a line while replaying, while `Store.muted` (a button's `act`, `Item.js:97-105`), or when the change happened inside a child with its own file (`owned_below`, `Store.js:264-267`). `hops` + `wrap` nest the payload one hop per level, from the root down (`Store.js:273-299`). A member's hop is its **id**, not the list's name (`Store.js:289-290`); a list's own verb gets the list's name (`Store.js:284`).
- **Writing.** Lines queue for one microtask, then `flush` (`Store.js:162-194`). For `task|session|improvements.jsonl` each line is POSTed to `/api/item` **one at a time** with a 5 s timeout (`Store.js:196`, `:200-222`); other files go through `FsFile.send`. Off localhost nothing is written, with one warning (`Store.js:174-180`).
- **Replay.** `Store.read` hands each entry to `host.replay_line` (`Store.js:97-110`), which is `set(line)` for a plain Item (`Item.js:355`). The node twin is `Item.replay(lines)` (`Item.js:348-354`). An echo of a line this tab sent is skipped by comparing the text without `by`/`ts` (`Store.js:112-119`).
- **Live tail.** `Store.open` on localhost streams through `ext/JSONL/live.js` `stream()` (`Store.js:45-49`): subscribe from an offset; the server (`Server/plugins/SocketServer/Tail.js:81-91`) sends only new whole lines. A page that is left pauses its subscription and resumes from the stored offset (`live.js:72-105`).
- **`ext/JSONL`** is a separate, older **reader**, not an Item store: `JSONL.apply` sorts lines into `logs`, `actions` and the verbs `TaskJSONL` knows (`ext/JSONL/JSONL.js:83-117`, `:134-262`). It shares only `live.js` and `Store.record_url` with the Item store.

## 2. The known gaps, checked

| Gap (from `ai/design-decisions-2026-10-27.md`) | Verdict | Evidence |
|---|---|---|
| Ids are only sibling-unique | **Confirmed, and worse than stated: it silently corrupts on replay** | below |
| Writes are not atomic | **Confirmed, plus a duplicate-line race** | below |
| No compaction | **Confirmed for `.jsonl`;** one precedent exists | below |
| The browser can't create a session | **Confirmed** | `page_tools.js:103` refuses a dated folder not on disk |
| `set` of an Item only snapshots | **Confirmed;** and replay gives back a plain object, not an Item | below |

**Ids (proved, E2).** Two lists on one owner, each with a member `s1`. Editing the card in list `b` writes `{"s1":{"set":{"title":"card edited"}}}`. Replayed, that edit lands on the sentence in list `a`:

```
E2w  {"s1":{"set":{"title":"card edited"}}}
E2r  {"a":"card edited","b":"card"}
```

No warning. The cause: `hops` drops the list name for a member (`Store.js:289-290`), and `get` takes the first list that has the id (`Item.js:183-186`). Uuids make this rare in practice; **slug ids make it likely** (`tasks.add` slugs titles, page content uses ids like `content-code`). And `hydrate` handles a duplicate differently: it renames it (E8: `{"a":"s1","b":"462fc03a-…"}`), so every later delta still addressed to `s1` goes to the wrong one.

**Atomic writes.** Confirmed: `post_to_tool` loops one POST per line (`Store.js:203`). The fix the design doc proposes (send both as one array line) **does not work today**: the item tool refuses any delta that is not one plain object (`page_tools.js:1073`: "`delta` must be one object"). Found while checking: when Servex is slower than 5 s, the browser falls back to writing the line itself (`Store.js:210-213`) while Servex may also have written it. That made duplicate lines before (`page_tools.js:1196`, "a twin"). A duplicate `add` is harmless (the second is ignored, E10), but a duplicate verb or `set` is replayed twice.

**Compaction.** No snapshot line in `Store.js` or `Item.js`. One precedent: `move_item` appends `{set, snapshot: true}` to close the gap when a task moves into its own file (`page_tools.js:669-675`).

**`set(prop, item)` (proved, E7).** The line is `{"set":{"child":{"type":"Item","id":"c","data":{}}}}`, the child keeps no parent, and on replay `get("child")` is a plain object (`replayed_is_item: false`). Building next.md's fix has one trap (E9): a child whose `parent` is set but which sits in a property, not a List, has its changes written **flat onto the parent**, because `hops` only knows lists (`Store.js:286-292`). Replay then sets the parent's title. `hops` must learn the property name in the same change.

## 3. Two more gaps nobody listed

- **`by` and `ts` become data on a plain Item (proved, exp2).** The item tool stamps them on the outer line; a plain Item's `replay_line` is `set(line)`, so they are `put` into the root's data, overwritten by every line: `host data {"by":"agent","ts":"…"}`. `Session` strips them (`core/Session/Session.js:78`) and `Task` reads them as the line's time (`core/Task/Task.js:532-537`). Any new Item root (a chat, a card list) would inherit this bug.
- **A rewritten file replays on top of the old state.** When a file shrinks, the server sends `jsonl_reset` (`Tail.js:86`), `live.js` calls `reset()` and resubscribes from 0 (`live.js:52-60`). `Store.reset` only zeroes `count` (`Store.js:233`); the host keeps everything, so items removed by the rewrite stay on screen.
- **A bare `Item`'s constructor fields are not data (E1).** `new Item({title: "x"})` makes `title` an own property (only declared `fields` go to data), so `toJSON` has `data: {}`. Fine for config, surprising for content.

## 4. A swappable store: yes, and both halves exist

- **Snapshot mode is already in the repo.** `ext/Saver` (`Saver.js`: last write wins, one in flight, one pending) writes `JSON.stringify(item)` (`FileSaver.js:28`); `Item.open(saver)` reads it back through `hydrate` (`Item.js:359-363`). Only old August panel pages use it.
- **Both can hang off the same event (proved, exp3).** Six lines: `root.on("delta", () => saver.save(root))`, then `Item.open(saver)`, gave back an equal tree (`equal: true t2:two,t1:one!`).
- **The switch** would be one seam: `item.store` is anything with `attach(host)` and `open()`. Two classes: today's `Store` (a delta per change) and a `SnapshotStore` (debounced whole JSON through a Saver). The class chooses (`static store = "jsonl" | "snapshot"`), or a field does. Merge `item.saver` into it so there is one name.
- **Is "a delta that assigns the whole object" a snapshot line? Not as `set`, no (proved, E3).** `set(toJSON())` puts `data` inside `data`, writes `type` as a field, ignores the lists, and can never delete a key (`set` only merges). A snapshot needs its own verb: `{"snapshot": <toJSON>}`, read as **replace this node with `hydrate(value)`**, then keep replaying the deltas after it. Proved: hydrate a snapshot, then apply a delta to it, gives the right tree (`snap+delta: t2:two,t1:after snap`). It works at any depth (`{"k":{"snapshot":{…}}}` replaces one child), which is also the class-change answer from `one-stream.md`.

## 5. Code-made vs UI-made items

**Proved (E4, E5):**
- Page code that adds an item **without an id** after the store is attached adds a new one on every load, and writes a new line each time: 1, 2, 3 items after three loads.
- With a **fixed id** it is idempotent: `add` of an existing id is a no-op and writes nothing.
- But code that runs **after** replay brings back an item the owner removed, and writes a new `add` line (E5after). The same code run **before** replay respects the removal (E5before).
- The log beats the code: an edit in the log wins over a later edit to the code's title (E5win).

**The rule already exists in one place.** `PageContent` keeps a page's code-made content as `transient` items, inserted quietly with a fixed id, and never written (`core/Page/PageContentItem.js:6`, `PageContent.js:27-31`, `:61`).

**Proposed rule:**
1. **Code builds structure only:** the classes, the empty lists, and fixed items it needs, each with a **fixed id**, made with quiet `insert` (or `hydrate`) **before** the store replays.
2. **Items arrive only from the UI and agents**, through loud `add`/`set`, so each is one line, written once.
3. A code-made item is marked (`transient`, as PageContent does) and never written to a snapshot.
4. A check worth adding: a loud `add` while no user action and no agent call is in progress warns once ("code added an item at load").

## 6. Is a timestamp part of a list delta?

**Today, no** (E6): `{"a":{"add":{"id":"…","after":null,"title":"x"}}}`. The time is the item tool's `ts` on the outer line (`page_tools.js:1179`). Only Task and Session read it, and when a line has none they carry the last line's time forward (`Task.js:537`). So a line the browser wrote itself (the fallback) gets the time of the line before it.

**Recommendation:** keep the time on the line envelope, but make it the Store's job, not the item tool's. Every line gets `ts` when it is appended, and `Item.replay_line` strips `by`/`ts` into a clock (as Task does) for every Item. An item's `created_at` is then its add line's `ts`, never stored twice. Don't put it inside the `add` payload: then a move or a replay would need to know which field is the time.

## 7. The owner's design directions against the code

| Direction (`design-decisions-2026-10-27.md`) | Holds? |
|---|---|
| §3 adopt-or-ref, one owner | **Holds, after the id rule.** A `{add:{ref:id}}` must resolve by a session-wide id; today's ids would resolve to the wrong item (E2). Pick: uuids everywhere, or the hop always names the list (`{"b":{"s1":…}}`). The second is cheaper and fixes today's corruption too. |
| §4 first delta at adopt, deltas bubble to a root with a file | **Holds; it is how it works now** for List members (`Item.test.mjs:68-88`). Not for properties (E7, E9). |
| §5 snapshots as compaction | **Holds** as an appended `{"snapshot":…}` line (§4 above), written by one writer. |
| "The same write" for sentence + chat entry | **Breaks today:** the item tool refuses an array delta (`page_tools.js:1073`). Either allow an array there, or make one line carry both (`{"sentences":{"add":…},"chat":{"add":…}}`: one object, two keys). The second needs no change to `Store` or `Item.apply`; whether the item tool's validator accepts both keys on a session is unchecked. |
| §7 the browser can't create a session | **Holds** (`page_tools.js:103`). |

## Recommendation, in order

1. **Make the hop name the list** (`{"b":{"s1":{…}}}`), reading both forms on replay. It ends the silent misroute (E2) and is what refs need.
2. **Strip `by`/`ts` in `Item.replay_line`** into a clock, for every Item.
3. **One write per user action:** put several changes in one object line (`Item.apply` takes it today; the item tool's validator is unchecked). Remove the 5 s self-append, or have it check the file first.
4. **A `{"snapshot":…}` verb** = replace with `hydrate`; then a `SnapshotStore` and compaction both use it.
5. **The code-made rule** (§5), with the load-time warning.
6. Then `set(prop, item)` adopts, with `hops` learning property names (E9).
