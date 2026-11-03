# Streaming: findings, limits, and what to do (analysis seat e)

The flow itself, hop by hop with file:line, is in [shape.md](shape.md). This page is what I found by running it. Every number was computed by a script in the session scratchpad (`bench.mjs`, `editor.mjs`, `indexed.mjs`, `race.mjs`, `sizes.mjs`), on node 24, on this machine, 2026-10-28.

## The answer in six lines

1. **The owner's picture is right, with one correction:** an append is noticed by the **dev server's** one `fs.watch` and pushed over its WebSocket. Servex is a writer (the item tool) and the port-80 proxy, not the watcher.
2. **Streaming itself is cheap.** Pushing an append reads only the new bytes (0.02 ms). **Replay is the slow part.** The largest voice session (8,360 lines) takes **2.1 s** to replay in node. Ten copies of e00f55c9 (10,421 lines) take **6.2 s**.
3. **That slowness is our code, not JSONL.** An editor-shaped file with 115,000 lines (8.1 MB) replays in **0.24 s**. Session replay grows faster than its line count because of three loops (§2).
4. **The session page replays the whole session again on every streamed batch** (`SessionTasks`), and each of those re-fetches every child file (§3). I found this by reading the code; I did not measure it in a browser.
5. **A real lost-update bug in `Tail.js`:** when a second tab subscribes between an append and the file-watcher event, the first tab never gets that line. Reproduced in node (§4).
6. **Safe compaction can start with zero risk:** a snapshot kept in a separate cache file beside the log, which never touches the log (§8). Two other stores, SQLite or a Durable Object, fit behind a six-method interface (§9).

---

## 1. Real file sizes (all 28,424 `.jsonl` under `public/` and `Servex/`, 563 MB)

| File | Size | Lines | Note |
|---|---|---|---|
| `ai/index.jsonl` | 45.8 MB | 232 | read + parse 204 ms |
| `ai/tasks/state.jsonl` | 27.0 MB | 396 | read + parse 121 ms |
| largest `cache.jsonl` (d9c3caec) | 7.3 MB | 24 | transcript cost cache; ~300 KB a line |
| largest `session.jsonl` (e00f55c9) | 3.35 MB | 1,043 | **84% of its bytes are 167 `tasks.add(Prompt)` lines** (2.8 MB, about 17 KB each) |
| voice `session.jsonl` (v-sq8y7db) | 2.74 MB | 8,360 | the most lines; 3,074 are pseudo-property lines (`chat`, `place`, `quiet`, …) |
| largest `page.jsonl` (e00f55c9) | 944 KB | 554 | `Page.replay` 2.9 ms |

By name: `page.jsonl` 5,657 files / 199 MB; `cache.jsonl` 13,128 / 189 MB; `session.jsonl` 1,817 / 20 MB; `task.jsonl` 2,126 / 12.5 MB.

## 2. Replay time, measured, and why it grows too fast

| Record | Lines | Parse | Replay, child refs as stubs | Replay + read every child file |
|---|---|---|---|---|
| e00f55c9 `session.jsonl` | 1,043 | 6 ms | **70 ms** | 405 ms (≈100 child files) |
| v-sq8y7db (voice) | 8,360 | 8 ms | **2,110 ms** | 2,224 ms |
| synthetic 10× e00f55c9 (ids renamed per copy) | 10,421 | 79 ms | **6,200 ms** | — |
| editor: 50 pages × 300 layers + 100,000 drag lines, plain `Item` tree | 115,050 | — | **243 ms** | — |

So 10× the lines took **89×** the time. A CPU profile of the voice replay names the three causes:

- **A whole-tree walk per line.** A `{"<id>":{…}}` line is routed by `this.find(k)` (`core/Session/Session.js:122`), which is a deep walk of every task (`core/Item/Item.js:233-240`). Pseudo-property lines take that same walk and find nothing. In the voice file **6,257 of 9,176 lookups missed**, and each miss walked the whole tree. The line is then stored as a plain field, where only the last value survives (`Session.js:125`; the replayed session ends with `data.chat`, `data.place`, `data.quiet`… holding one line each).
- **`lists()` is rebuilt on every hop.** `Item.lists()` loops `for (key in this)` (`Item.js:227-231`). `get()` calls it at every level (`Item.js:184`), and the walk calls it at every node. Profile: 24.6 s self time, out of about 40 s in total.
- **Each `tasks` line copies the whole task list:** `new Set([...this._tasks])`, then a loop over it (`Session.js:104-106`). That is O(top-level tasks) per line, and 5,582 top-level tasks in the 10× file.

An id index alone recovers only 10–20%. Memoising `find` gave 1,931 → 1,533 ms (voice) and 6,538 → 5,161 ms (10×), with identical results. The misses and `lists()` still dominate. The fix needs all three: pseudo-property lines become known verbs (the owner already decided to move away from them, 2026-10-26), a maintained `id → item` index that can also answer "not here", and `lists()` cached per instance. The editor row shows what replay costs once routing is one hop per level: about **2 µs a line** (estimated from the editor row, not measured on a session).

## 3. The browser side (by reading; not measured in a browser)

- **`SessionTasks` replays the whole record on every streamed batch.** Its `read()` pushes the batch onto `this.lines` and redraws, and `draw()` calls `Session.replay(this.lines)` from line 1 (`core/Session/SessionTasks.js:17,22`). On the voice session, every new line costs a full 2-second replay.
- **Each of those replays makes fresh child stubs.** A child whose `Store` already has a host takes a snapshot with a fresh `fetch` of its whole file (`core/Task/Task.js:509-513`). On e00f55c9 that is about 100 fetches per streamed batch.
- **One session page opens `session.jsonl` up to three times:** `SessionTasks`, `ChatV2`, `ChatV3` (`ai/AISession/AISessionDetail.js:301,302,334`). That is three readers and three replays. `ChatV2` and `ChatV3` do apply new lines one at a time (`ext/Chat/v2/ChatV2.js:22-27`, `ext/Chat/v3/ChatV3.js:27-31`).
- **Every write from the browser** to a task or session file is one HTTP POST per line, sent one after another (`core/Item/Store.js:203`). That is fine for clicks and wrong at mouse rate.

## 4. Two stream bugs

- **Lost update, reproduced** (`race.mjs`). `Tail` keeps **one offset per file shared by all sockets** (`Server/plugins/SocketServer/Tail.js:5,116`). Socket A is subscribed. A line is appended. Socket B subscribes from 0 before the watcher fires, and moves the shared offset to the end. Then `changed()` reads nothing new, and **A never receives the line** until a reload. The window is the `fs.watch` latency, which is exactly when a second tab or a second reader opens the same record. The fix: keep the offset per socket and file, not per file.
- **Duplicate apply, by reading.** In one tab, a reader at offset O1 that receives a second reader's from-0 replay (offset O2 > O1) applies **all** of its lines, not only those past O1 (`ext/JSONL/live.js:39-42`; the comment above it names the risk, and the guard covers only readers already at O2). The window is the same one as above.

## 5. When does one file per root stop working?

- **Size is not the first limit; line shape is.** With nested deltas (one hop per level), 115k lines and 8.1 MB load in a quarter second. One file for 50 pages × 300 layers works at load time.
- **Mouse-rate writes are the real limit.** A drag line is about 68 bytes, so 60 lines a second is **about 15 MB per hour of dragging**. The browser path sends one socket append per microtask batch, and one HTTP post per line for task files. **Rule:** a drag is local state; write one line when it settles (pointer-up), never per mousemove. This changes no storage.
- **Shipping the whole file is the next limit,** on the static site (one `fetch`, `Store.js:77`) and for a cold page. Somewhere past a few MB, rolling (§8) is worth it. `page_tools` already flags `large` at 1 MB (`Servex/agents/page_tools.js:186`).
- **Each write costs time in proportion to the file**, on the node writers: `size_of` re-reads the whole file to count lines (`page_tools.js:187`, 3.4 ms at 3.35 MB); `LogLine.append` re-reads it (`Server/LogLine.mjs:90`); `page_set` replays the whole page (`page_tools.js:988`, 3–5 ms at 900 KB). All are fine today, and each is a counter or a cached root away from constant time.
- **One layer's history from one file** is a filter on lines whose path starts with that layer's id chain. That works because every line is nested by path (`Store.js:148-155`).

## 6. Splitting scopes (prompts and replies in their own file)

- **What it buys:** e00f55c9's core would be about 0.5 MB, not 3.35 MB (the Prompt adds are 2.8 MB). Replay time drops only if the number of lines drops too (§2).
- **The clean way already exists:** make the prompt log a **child record referenced by one line**, as child sessions are (`{"task": "<folder>"}`, read by `Task.from_ref`, `core/Task/Task.js:461`; never re-recorded by the parent, `Store.js:264` `owned_below`). A server-side root loads the core and leaves the child as a stub until asked.
- **What breaks:**
  - *Order across files.* Each file has its own offsets, so a reply in file B can arrive before the prompt it names in file A. Today a line naming a missing id is silently stored as a field (`Session.js:122-125`). A split needs forward references that wait, and that is the rule to write first.
  - *Completion.* Prompts count as tasks (`core/Task/Prompt.test.mjs:91`). Loading only the core gives the right completion only if the child record carries its own totals, which is what child sessions already do.
  - *Cost* does **not** break: it comes from `cache.jsonl` and the agents' logs, never from `session.jsonl` lines.
  - *The live view* needs two subscriptions. That is cheap.
- **Not checked:** the folder also holds a 3.0 MB `prompts.jsonl` written by the prompt hook. Whether it repeats the Prompt adds' text is a question for seat (b) or (c).

## 7. Agents writing raw lines vs a server-side instance

- **Today it is a hybrid.** The item tool already keeps **one live instance per file in Servex**, replayed once and then advanced one line per write. It also refuses a line that would not replay (`page_tools.js:738-757`, `:1010-1016`).
- **Writers that bypass it:** the hooks (`prompt-relay`, `session-page`, `ledger`, `naming-guard`) and `LogLine`. Every outside append changes the file's size and mtime, so the **next** item-tool call replays the whole file again (`page_tools.js:739`): 70 ms on e00f55c9 and about 2 s on the voice session, after every hook write.
- **Recommendation:** one writer. Hooks and agents post through the item tool (`/api/item`, the path the browser `Store` already takes for session files). A raw append stays only as the fallback when Servex is down, the same fallback `Store.js:211-213` already has. Then the live root is never invalidated, each write costs one `replay_line` (well under a millisecond), and compaction gets the single writer it needs.
- **The owner's worry,** "replaying thousands of deltas takes seconds", is true today only because of §2. With linear replay, a warm root pays its replay once per Servex start.

## 8. Compaction, safely: never delete, never rewrite

The owner is nervous here, so this goes in two steps. Each step can be undone by deleting what it made.

1. **A sidecar snapshot (zero risk; do this first).** Write `session.snap.json` beside the log: `{through: <byte offset>, sig, state}`, where `state` is the root's `toJSON()`. A reader loads it, then streams from `through`. If the file is missing, stale or unreadable, the reader does a full replay. **The log is never touched**, and deleting the snapshot loses nothing. Gate it with a test: `hydrate(snapshot) + replay(lines after through)` deep-equals `replay(all lines)` on every real `session.jsonl`, run as a node script before the feature is on.
2. **Roll by rename (only when bytes matter, e.g. on the static site).**
   - Servex, as the single writer, renames `session.jsonl` to `session.0001.jsonl`. Its bytes are untouched.
   - It starts a new `session.jsonl` whose line 1 is `{"continues":{"from":"session.0001.jsonl","through":N,"snapshot":{…}}}`.
   - Any line that landed in the old file past `N` during the rename is copied forward.
   - Readers already handle a shrunk file: `jsonl_reset`, then a replay from 0 (`Tail.js:84`, `live.js:52`).

**Checked against the existing designs:**
- `ai/design-decisions-2026-10-27.md` §5 (an appended snapshot line in the same file) holds for replay time. It does not shrink what a reader downloads, and the reader must still scan for the last snapshot.
- Its "one writer" premise is **not true today**: there are five writer paths (shape.md).
- `core/Page/doc/architecture.md` ("Log growth") is the same plan as step 2. Its blocker, "needs a node-side replay that matches `Page.set()`", is gone: the item tool already imports the real `Page` in node (`page_tools.js:405-414`, used at `:988`).

## 9. Other stores: the interface a backend must give

Today `Item.Store` mixes two jobs:
- **The log's meaning** (`read`, `attach`, `line_for`, `skip_echo`, `hops`, `wrap`, `owned_below`), which works with any backend.
- **Transport** (`open`, `load`, `flush`, `post_to_tool`, `local()`, `writable`, `record_url`, and `live.js`).

Split them, and a backend needs six methods:

| Method | Today | SQLite / D1 | Durable Object (+ R2) |
|---|---|---|---|
| `append(key, lines[]) → cursor` (whole batch or nothing, in order) | `appendFileSync` | `INSERT` into `lines(key, seq, json, ts)` in one transaction | the object's storage. It is the single writer by construction |
| `read(key, after) → {lines, cursor}` | `Tail.read` by **byte offset** | `WHERE key=? AND seq>?` | storage list |
| `subscribe(key, after, on_lines, on_reset)` / `unsubscribe` | `Tail` over the dev socket | needs a notifier (D1 has none; pair it with a DO) | WebSocket hibernation |
| `stat(key) → {exists, version}` | size + mtime (`page_tools.js:711`) | `MAX(seq)` | storage |
| `list(prefix) → child keys` | the folder listing (`Router/listing.js`) | `SELECT DISTINCT key LIKE ?` | an index object, or R2 list |
| `snapshot(key)` get/put; `archive(key)` | none | a `snapshots` table | storage; archived segments in R2 (immutable) |

- **One change is needed to make this swappable:** the cursor must become **opaque**. Today it is a byte offset in `Tail.js:51-66` and `live.js:30,39`, and that meaning leaks into the browser.
- **Echo skipping** compares JSON strings minus `by`/`ts` (`Store.js:112-118`). It works with any backend that returns the line's fields unchanged.
- Prior design for the Cloudflare side: `public/imagine/stream/doc/durable-objects.md` (cited from `Append.js:43`).

## 10. Persistence test matrix (ask 17): what is tested today

Key:
- **F**: a write goes to a real file and a fresh replay of that file is checked.
- **L**: replayed from an in-memory array of lines only (the write path is not exercised).
- **—**: nothing.

"Nested" means the class lives inside another record: a member of its list, or a child file referenced from it.

| Class | Mode | add | set | move | remove | replay |
|---|---|---|---|---|---|---|
| Item | own file | F `Store.test.mjs:34` | F `Store.test.mjs:30` | F `Store.test.mjs:36` | F via List `List.test.mjs:41` | F `Store.test.mjs:39-45` |
| Item | nested, own child file | — | F `Store.test.mjs:50-55` | — | — | — (`Item.test.mjs:48-65` checks the parent skips it, no file) |
| List | own file | F `List.test.mjs` | — | F `:42` | F `:41` | F `:25-27` |
| Task | own file | F (item tool) `item_tool.test.mjs`, `session_tasks.test.mjs` | F verb `act.test.mjs` (start) | — | — | L `Task.test.mjs:273` |
| Task | nested ref / folder | F `item_tool.test.mjs:99-122` | — | F folder move `item_tool.test.mjs:176-190`; handoff `handover.test.mjs` | — | L via resolver `Task.test.mjs` |
| Prompt | in a session | L `Prompt.test.mjs:18-54` | L | — | — | L `:109` |
| Question | in a session | L `Question.test.mjs` | L (answer) | — | — | L |
| Session | own file | F `item_tool.test.mjs:64-85`, `session_tasks.test.mjs` | — | — | — | L `Session.test.mjs`, `session-task.test.mjs` |
| Session | child entry in a parent | F `session-entries.test.mjs` | — | — | — | L `session-task.test.mjs:49` |
| Page | own file | F (tool) `page_tools.test.mjs`; streamed `Stream.test.mjs` | F streamed (title) `Stream.test.mjs` | — | — (content) | L `Page.test.mjs` |
| Page | subpage folder | F `page_tools.test.mjs:90-110` (add, rename) | — | — | F `:108-110` | — |
| Process, Project | own file | L only | — | — | — | L |

**The biggest gaps:**
- No class except Item and List round-trips **move** or **remove** through a file.
- No test writes Task, Prompt, Question or Session through the **browser `Store`** (the `delta` event → `line_for` → file). Every Store test stubs `append`, so the real flush (`FsFile`, `/api/item`) is untested in node.
- Nothing tests the stream bugs in §4.

One more finding, for ask 16 (seat a's): a bare `Item` does **not** hold items on demand. `item.set({items:{add:{id:"a"}}})` stores `{items:{add:…}}` as plain data (measured). A subclass with a lazy `items` getter still needs a `get()` override like `Prompt.js:77`, or the add also lands as data.

## 11. Recommendations, in order (each small; none built here)

1. **Fix the lost update:** keep the offset per socket and file in `Tail.js`, plus a node test copied from `race.mjs`.
2. **Make replay linear:**
   - the pseudo-property lines become verbs;
   - a maintained id index that can answer "not here";
   - `lists()` cached per instance;
   - `SessionTasks` applies new lines with `replay_line` instead of replaying everything.
   - Prove it: the voice session goes under 200 ms, with the same `progress()`.
3. **One writer:** hooks and `LogLine` post to the item tool, falling back to a raw append.
4. **Sidecar snapshot** with the equality gate (§8, step 1). Rolling by rename comes later, when bytes matter.
5. **The store interface split** (§9): an opaque cursor first. Nothing else has to change for today's file backend.
6. **Fill the matrix:** a move and a remove round-trip for Task and Session through a real `Store` and a real file.
