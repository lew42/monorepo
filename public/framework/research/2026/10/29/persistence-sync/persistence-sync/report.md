# Keep the engine, borrow the proven protocols

Report writer, 2026-10-30. Built from the 14 research notes, the study of your code (`integration/data-shapes-2` at `9ba46ee`) and the three code-lessons files. Paths below are relative to `persistence-sync/`. All sources are in section 10.

## 1. The answer

**Keep building your own persistence, sync and streaming core. Adopt libraries only at the edges.**

- **Your design is the one the winners run.** Figma, Linear and tldraw all use one server-ordered log, last-writer-wins per property, and stable ids instead of indexes ([collab architectures](notes/collab_app_architectures.md)). CRDTs show up only for shared prose.
- **Buying would replace little.** Teams that adopted a sync tool still wrote auth, persistence, history and assets themselves. tldraw.com's sync worker alone is about 21,000 lines ([tldraw sync-worker](https://github.com/tldraw/tldraw/tree/main/apps/dotcom/sync-worker/src), [adopters](notes/adopters_and_pairings.md)).
- **Vendors keep folding.** Replicache is in maintenance mode, Electric Cloud is winding down, InstantDB is sunsetting, PocketBase's repo was archived, and Hathora ended game hosting ([sync engines](notes/sync_engines_crdts.md), [frameworks](notes/fullstack_framework_data_paths.md), [games](notes/game_netcode_streaming_ui.md)).
- **What you lack is small and well known:**
  - a sequence number per line;
  - an id per client write;
  - a real ack and a reconnect handshake;
  - crash-safe appends and snapshots.
  Each gap was reproduced in your real code and has a failing-test spec.
- **Adopt at the edges:** Yjs or Loro for rich text, SQLite FTS5 or MiniSearch for search, Cloudflare Realtime SFU for voice.

## 2. What everyone who succeeded does

Five rules recur in every successful product we studied.

**1. One authority per document orders every change.**
- Figma gives each document its own server process. It rejected OT as "unnecessarily complex for our problem space" ([Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)).
- tldraw runs exactly one `TLSocketRoom` per room. On tldraw.com that is one Durable Object per room ([tldraw sync](https://tldraw.dev/docs/sync)).
- Linear orders everything with one global, increasing `syncId` ([reverse-engineered](https://github.com/wzhudev/reverse-linear-sync-engine)).

**2. Last-writer-wins per property.**
- Figma: different properties never conflict. For the same property, the value that reaches the server last wins ([Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)).
- Linear: "naive last-write-wins, no conflict detection, no OT, no CRDT" ([HN summary](https://news.ycombinator.com/item?id=44123131)).
- Weidner argues that with a central server, CRDTs and OT are mostly optimizations over plain server reconciliation ([Weidner 2024](https://mattweidner.com/2024/06/04/server-architectures.html)).

**3. Snapshot plus log, and the snapshot records the seq it covers.**
- Figma checkpoints each file to S3 every 30–60 s and journals changes every 0.5 s with a per-file sequence number.
- Recovery is "latest checkpoint, then newer entries". A checkpoint plus the journal must rebuild the next checkpoint byte for byte ([Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/)).
- automerge-repo, y-leveldb, Delta Lake, Litestream and Cloudflare's own DO SQLite internals have the same shape ([file layouts](notes/object_dbs_file_layouts.md)).

**4. One room per document, with presence on the side.**
- tldraw keeps cursors as a separate record type that is not document data ([tldraw](https://tldraw.dev/sdk-features/collaboration)).
- Figma moved comments, users and teams to a separate sync system ([Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)).

**5. CRDTs only for rich text.**
- Linear now uses CRDTs only for issue descriptions ([Fujimoto](https://www.fujimon.com/blog/linear-sync-engine)).
- Yjs owns this niche: 15.2M downloads a week, about 170× Automerge ([adoption](notes/adoption_metrics.md)).

**Two more habits:**
- **Address everything by stable id, never by array index.** LLMs miscount index shifts too ([JSON Whisperer](https://arxiv.org/html/2510.04717v1)).
- **Scope tightly.** Figma's multiplayer took about a year ([Figma](https://www.figma.com/blog/multiplayer-editing-in-figma/)) and Linear's sync stack about half a year ([localfirst.fm #15](https://localfirst-63yrl41b9-schickling-pro.vercel.app/15)). Most of that went into scale and durability, not the core algorithm ([delta logs](notes/delta_logs_build_vs_buy.md)).

**Where Lew42 already matches:**
- one file is one ordered log;
- list verbs use ids, and `move` is first-class;
- Servex checks an agent's line against the live root before appending.

The closest existing system is tldraw sync ([adopters Q6](notes/adopters_and_pairings.md), [overview](lew42/overview.md)).

## 3. Recommended architecture for Lew42

### 3.1 The shape

```
tab / agent --ws--> Room (one per page)
                     check {client, n}
                     assign seq, append
                     ack sender, broadcast
                         |
                    Store adapter
             JSONL files   |  DO SQLite + R2
             (Servex)      |  (Cloudflare)
```

**Write the Room once, as plain JS, with the store passed in.**
- Locally, Servex hosts one Room per open page.
- In the cloud, a Durable Object wraps the same Room.
- You can test it in Node with `node:sqlite` standing in for DO storage. The sync probes already did that ([sync-protocol](lessons/sync-protocol.md), Appendix A).

Everything else stays yours: `Item.set()`, the nested-names line format, `List` verbs, replay, `Ref`, and Servex as the one writer.

### 3.2 The store adapter

The interface is shaped like a log, not like key/value storage, because a page is a log. The cursor is `{epoch, seq}`:
- `seq` is a per-page line number set by the writer;
- `epoch` changes whenever the log is rewritten.

```js
class Store { // one per backend
  head(key)        // {epoch, seq, base} | null
  append(key, lines, {ifSeq})
                   // all or none; -> new seq
  read(key, {since})
                   // snapshot if needed, then
                   // lines with seq > since
  tail(key, since, onLines)
                   // live; onLines(null,"reset")
  snapshot(key, state, atSeq)
  archive(key, beforeSeq) // move, never delete
  history(key)     // [{epoch, from, to, ref}]
  exclusive(key, fn) // sole writer for fn
}
```

| Method | JSONL (Servex) | DO + R2 (cloud) |
|---|---|---|
| `seq` | stored on each line | SQLite row id |
| `append` | one `appendFile` | one `transactionSync` |
| `snapshot` | a snapshot line | `snapshots` table |
| `archive` | `page.<n>.jsonl` | segment object in R2 |
| `exclusive` | Servex only (lock for exceptions) | free: one DO per page |

- **The adapter does not parse lines or know about Items.** `Item.Store` keeps replay and nesting. A small `Compactor` owns the policy.
- **Source:** [storage-compaction](lessons/storage-compaction.md), "Proposed store adapter interface", with the cursor changed to `seq` (see 3.9).
- **R2 is the archive tier, never the hot log,** because R2 has no append ([R2 API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)).

### 3.3 Op vocabulary for Item and List

The rule stays yours: **nested names down to the target, then one verb.** Changes from today are marked *new* or *changed*.

**Item verbs**
- `set {k: v, …}`: many keys in one line, one line per item per batch.
- `unset [k, …]` *new*: clears a field. Today `set({k: undefined})` writes `{"set":{}}`, and the old value comes back on reload.
- `<verb> {…}`: a recorded method call (`start`, `wait`), as today.
- `moved_to {url, path}`: the cross-file forward, as today.

**List verbs** (always under the list's name)
- `add` *changed*: an envelope `{id, type, data, <lists>}`, with `after` beside it instead of mixed into data.
  - This fixes lost child lists and lost data fields named `after` or `type`.
  - Your reader already accepts this shape, so only the writer changes.
- `remove id` or `{id, was}`: `was` holds the removed envelope, for undo later.
- `move {id, after, from?, was?}`: `was` is the old `after`.
- `order [ids]` and `clear true`: as today.
- `replace {id, with}` *new*: an announced class swap.
- `reset [envelopes]` *new*: the whole list in one line.

**File-level lines**
- `{"schema": {"Task": 3}}` *new*: on line 1 or on the snapshot line.
- The snapshot line (see 3.6).

**In memory only:**
- Every `delta` event carries a `source`: `local`, `replay` or `remote`. It is not stored.
- Side effects, such as a `Ref` re-path or a parent task's auto-complete, write only when the source is `local`.

Source: [object-model](lessons/object-model.md) §10.

### 3.4 What a line looks like on disk

The line keeps its shape. The writer adds meta keys that replay strips, as it already strips `by` and `ts`:

```json
{"content":{"p9":{"set":{"text":"Draft"}}},
 "seq":43,"client":"t-19bc","n":12,
 "by":"mike","ts":"2026-10-30T10:00:01Z"}
```

- `seq` numbers lines.
- `n` numbers one client's ops. One op (one `batch`) can be a few lines, appended together with the same `client` and `n`.
- `client` is a fresh id per page load or per agent run.
- Keeping `client` and `n` on the line lets the writer rebuild "last `n` per client" from the file after a restart.

### 3.5 Sync message vocabulary

One WebSocket per tab. JSON frames, each with a `type`. Unknown fields are ignored.

- `hello {v, client, room, since?, epoch?}`: client → server.
- `welcome {v, seq, epoch, base, presence[]}`
- `op {client, n, lines[]}`: client → server.
- `op {seq, prev, client, n, by, ts, line}`: server → everyone else.
- `ack {client, n, seq}`: to the sender only, instead of an echo.
- `reject {client, n?, why, expected?}`
- `reset {seq, epoch, base, snapshot | snapshot_url}`
- `ready {seq}`: catch-up is done.
- `presence {client, clock, state}`: relayed, never stored. `state: null` means the client left.
- `"ping"` / `"pong"`: exact strings, so a DO can answer without waking up.

**Rules**
1. The server sets `seq`, `by` and `ts`. The client sets `client` and `n`.
2. The server checks `n`, in the same step as the write:
   - `n ≤ last`: re-send the old ack and write nothing.
   - `n = last+1`: write, then ack.
   - `n > last+1`: `reject {why:"gap"}`.
3. If `since < base`, or the `epoch` differs, the server sends `reset`. Otherwise it sends every op after `since`, then `ready`.
4. A client applies an `op` only if `prev` equals its last `seq`. Otherwise it asks again from its last `seq`.
5. A client holds back a remote op that touches a field it has a pending write to, until its own ack arrives. This is tldraw's rebase, cut down to last-writer-wins per field.

**On the dev server, this sits beside today's `{method, args}` frames.**
- `hello`, `op` and `presence` become new handlers.
- `jsonl` frames gain `seq` and `prev`.

Source: [sync-protocol](lessons/sync-protocol.md) §9.

### 3.6 Compaction that archives instead of deleting

**Rule: compaction never removes a line from the world.** Only Servex (or the page's DO) compacts. Never a browser, and never as a side effect of loading.

**Stage 1 (build this first): append a snapshot line to the end of the log.**
- Readers start from the last snapshot line.
- No rewrite and no new file.
- This is already your decided direction ([storage-compaction](lessons/storage-compaction.md), "Compaction policy").

```json
{"snapshot":{…},"seq":4120,"epoch":"e2",
 "schema":{"Task":3},"clients":{"t-19bc":12}}
```

`clients` carries "last `n` per client" across the snapshot, so a late retry is still recognised.

**Stage 2 (only when file size hurts).** All steps run inside `exclusive(key)`:
1. Take the warm root's `toJSON()` at seq N. Servex already holds it.
2. Self-check: replay it into a fresh root and compare. On a mismatch, stop. This is Figma's byte-identical rule.
3. Hard-link the old file to `page.<n>.jsonl`, so every byte is kept.
4. Write `page.jsonl.tmp`: the snapshot line (with `of: {file, seq}`) plus any later lines. fsync it.
5. Rename it over `page.jsonl`, fsync the folder, and bump `epoch`. Readers get `reset`.

**When to compact.** All three must hold:
- bytes since the last snapshot ≥ max(64 KB, snapshot size);
- 30 s of quiet, or 10 min since the first line not yet in a snapshot;
- no mid-file parse errors.

**Archives are never deleted by code.** Deletion is an explicit owner command. Git is not the backup: session `page.jsonl` files are gitignored.

### 3.7 On Cloudflare

- **One Durable Object per page**, named by its url (`getByName`). It is the single writer, so `exclusive` comes free.
- **DO SQLite tables:**
  - `log(seq PK, line, client, n)`
  - `meta(epoch, base, schema)`
  - `clients(client PK, n)`, updated in the same transaction as the insert
  - `snapshots(seq, state)`
- **Ack right after the insert.** The output gate holds outgoing messages until the write is durable ([DO storage](https://developers.cloudflare.com/durable-objects/api/storage-api/)).
- **Use the Hibernation API for sockets.** Keep presence in each socket's attachment (max 16 KB), not in SQLite ([DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)).
- **Compact in an alarm.** Alarms can fire twice, so the steps must be safe to repeat:
  1. Write the snapshot.
  2. Copy rows ≤ N to R2 as `pages/<url>/log/<firstSeq>.jsonl`, with a write-once conditional put.
  3. Only after that succeeds, delete those rows from SQLite and set `base = N+1`, in one transaction.
- **R2 layout:** `head.json`, `snap/<seq>.json` and `log/<firstSeq>.jsonl`.
  - Readers GET the head, then the snapshot, then the segments.
  - No LIST on the hot path: R2 bills LIST like a write ([file layouts](notes/object_dbs_file_layouts.md)).
- **Reconnecting is the normal path, not an error.** "Deploying a new version restarts every Durable Object and disconnects all WebSockets" ([DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)). Clients back off with jitter.

### 3.8 Locally (Servex)

- **One Room per open page**, next to the live root Servex already keeps.
- **The JSONL adapter** writes `seq`, `client` and `n` on each line. It keeps a seq → byte-offset index in memory, as a cache rebuilt on open.
- **One writer per file.**
  - The dev server's `Append.js` forwards to Servex instead of appending on its own.
  - The ~20 writers that append directly move over one at a time ([overview](lew42/overview.md), gap 11).
- **`Tail`** sends `seq` and `prev`, and sends `reset` when the epoch changes.
- **One home per page.**
  - A page is written either locally or in a DO, never both.
  - Moving a page's home means exporting its snapshot and log, then importing them. There is no two-way sync.
  - This matches your own rule: "exactly one home that accepts writes".

### 3.9 Where the lessons files disagreed, and what I chose

1. **The cursor.**
   - Storage proposed an opaque `gen:offset`. Sync proposed a per-line `seq`.
   - **Chose `seq` + `epoch`.** It means the same thing on files, SQLite and R2, and gap detection needs integers.
   - Your storage doc already says "the cursor is a line number (`seq`), never a byte offset". Byte offsets become an internal index.
2. **The dedupe key.**
   - Storage kept the `by|ts` twin check and carried the last 256 `by|ts` across snapshots. Sync showed that `by|ts` drops edits when two tabs write in the same millisecond.
   - **Chose `{client, n}`.** The snapshot carries `clients` instead of `recent`. `by` and `ts` stay as audit fields.
3. **Delete or archive on a DO.**
   - Sync's DO compaction said "delete rows ≤ N". Storage said never delete.
   - **Chose archive.** Rows go to an R2 segment first, then leave SQLite. This keeps your never-destructive rule, and R2 costs $0.015/GB-month ([R2 pricing](https://developers.cloudflare.com/r2/pricing/)).
4. **Echo handling.**
   - Today the sender drops its own echo by exact text match.
   - **Chose: the sender gets an `ack`, not an echo.** Remote ops apply with `source: "remote"`. That fixes both the fragile text match and the duplicate side-effect writes.
5. **Batch boundaries.**
   - Object model: one action writes one line per path. Sync: one op can carry `lines[]`.
   - **Both.** `batch(fn)` produces one op. The op is one or a few lines (one per item touched), appended all or none.
6. **Lock or one writer.**
   - Storage proposed a lockfile.
   - **Chose: route every write through Servex.** The lock covers only the exceptions (SessionConsolidate, migrations) until they move over.
7. **Unknown verbs.**
   - Object model: warn on replay. Sync: reject at the door.
   - **Both.** The Room rejects an unknown verb on write. Replay warns and keeps the line visible, and never stores it as data.
8. **List positions.**
   - The notes favour fractional indexes. Your code uses `after: id`.
   - **Kept `after` for now.** This is a concession (section 8).

### 3.10 Agents are clients too

- **Same path as tabs.** An AI agent gets its own `client` id, sends `op`s through the same Room, and gets the same `ack` or `reject`.
- **Complete, typed ops by id.** No index arithmetic: models miscount index shifts, and stable keys fix it ([JSON Whisperer](https://arxiv.org/html/2510.04717v1)).
- **Check before committing.** Servex's item tool already applies a line to the live root and refuses it if it throws. Extend it to also refuse:
  - unknown verbs and missing members (T6);
  - parent changes that would form a cycle, as Figma's server does ([Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)).
- **Streamed output is a preview only.**
  - Show partial output as a throwaway preview, like presence.
  - Write only complete ops. tldraw's agent applies each action when it finishes streaming ([tldraw agent kit](https://tldraw.dev/starter-kits/agent)).

## 4. Fix plan, in order

Every item below was reproduced against your real code. Spec ids point to:
- **F1–F10:** [storage-compaction](lessons/storage-compaction.md), "Failing tests"
- **T1–T6:** [object-model](lessons/object-model.md) §12, proposed file `public/framework/core/Item/delta-ops.test.mjs`
- **R1–R9:** [sync-protocol](lessons/sync-protocol.md) §8, each with its own proposed test file

**Owner's rule, for each item:** commit the failing test, then the fix in a separate commit, on a short-lived monorepo branch ([test-first](../ideas/test-driven-development.md)).

### M1. Stop the silent losses (quick: hours each)

- **A torn last line swallows the next line.** Two of your tracked logs end without a newline today.
  - Fix: a newline guard in `write_line` and `Append.js`, copied from `append_once`.
  - Specs: **F5**, plus **F10** so every future writer is checked.
- **Two tabs, same millisecond: the second edit is dropped**, yet that tab is told "append successful".
  - Interim fix: add a per-load client id to the twin key. The full fix is in M3.
  - Spec: **R1**, `Server/plugins/SocketServer/Append.twin.test.mjs`.
- **A page opened during a server restart never updates again.**
  - Fix: keep the reader registered whatever the 1.5 s timer does.
  - Spec: **R5**, `public/framework/ext/JSONL/live.restart.test.mjs`.
- **A rewrite killed mid-save leaves a 0-byte file** (5 of 5 runs).
  - Fix: one helper that writes a temp file, fsyncs, renames over the target, then fsyncs the folder.
  - Spec: **F4**.
- **SessionConsolidate's rewrite loses appends that land during it** (305 of 3,000 in a race test).
  - Fix: hold the lock from the read through the write, or route the rewrite through Servex.
  - Spec: **F1**.

### M2. Item and List write what they mean (small, writer-side)

All six specs live in `delta-ops.test.mjs`:
- **T1 (`source` tag):** every open tab re-writes the same Ref re-path or auto-complete.
- **T2 (`batch()`):** `wait()` writes 7 lines today; it should write 1.
- **T3, T4 (envelope `add`):** an added item loses its child lists, and data named `after` or `type` breaks.
- **T5 (`unset`):** a cleared field comes back on reload.
- **T6:** an unknown verb or a missing member is silently stored as data. Warn instead.

### M3. Every write is acked and lands exactly once

- Put `seq`, `client` and `n` on every line, and dedupe on `{client, n}`. **R1** (full fix).
- Retry pending ops on reconnect, exactly once. **R2**, `public/framework/core/Item/Store.retry.test.mjs`, and **F9**, the same bug seen from the store side.
- Ack with `seq`, and hold back remote writes to pending fields, so two tabs agree with the file. **R3**, `public/framework/core/Item/Store.converge.test.mjs`.
- Notice a socket that is open but no longer answering: an app-level ping every 5 s. **R9**, `public/framework/dev/Socket/Socket.halfopen.test.mjs`.

### M4. Streams that recover on their own

- **Rewritten file → `reset`, never mid-line bytes:** epoch + base. **R4**, `Server/plugins/SocketServer/Tail.rewrite.test.mjs`, and **F8**.
- **Gap detection with `prev`:** a second reader misses lines today. **R6**, `public/framework/ext/JSONL/live.gap.test.mjs`.
- **`hello`/`welcome` with a version, jittered backoff, and room-page reconnect.** **R8**, `public/imagine/platform/local/room/room.reconnect.test.mjs`.

### M5. Snapshots and archives

1. **A snapshot must replay to the same tree first.** Today `List` and `Page` don't round-trip. **F7**.
2. **Stage 1:** a snapshot as of seq N keeps the lines appended during it, **F2**, plus the trigger policy, **F6**.
3. **Stage 2:** archive, never truncate, including the git `merge=union` case. **F3**.

### M6. The page Room on Cloudflare

- **Presence as its own throwaway channel.** **R7**, `worker/room.presence.test.mjs`.
- Wrap the M3–M5 Room in a Durable Object.
- Re-run R1–R9 under `wrangler dev`. Here they ran against a `node:sqlite` stand-in, because workerd isn't installed in this sandbox.

## 5. When to adopt instead of build

- **Collaborative rich text** (two people typing in one paragraph): **Yjs**, one `Y.Text` per text field, with its updates stored as that field's ops.
  - Why: the most adopted option (15.2M a week), with the deepest editor bindings ([adoption](notes/adoption_metrics.md)).
  - Linear did exactly this, and only for descriptions ([Fujimoto](https://www.fujimon.com/blog/linear-sync-engine)).
- **Concurrent moves in lists or trees:** **Loro**. It is the only library with concurrent-safe list moves and a movable tree ([Loro docs](https://loro.dev/docs/tutorial/list)).
  - Costs: WASM, and no named adopters ([sync engines](notes/sync_engines_crdts.md)).
- **Fractional positions,** when you lift the `after` concession: rocicorp's `fractional-indexing` (`generateKeyBetween`), the scheme Figma and Loro use ([delta logs](notes/delta_logs_build_vs_buy.md)).
- **Search over your JSONL session logs:** SQLite **FTS5**.
  - It is on every SQLite you touch: `node:sqlite`, DO SQLite and D1 ([DO SQLite](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/), [FTS5](https://sqlite.org/fts5.html)).
  - Index the extracted text plus metadata, refreshed incrementally. That is the cc-conversation-search pattern for Claude Code logs ([repo](https://github.com/akatz-ai/cc-conversation-search)).
  - Treat the index as a copy of the log with a seq high-water mark, rebuildable at any time ([search](notes/search_indexing_jsonl_limits.md)).
- **In-browser search and autocomplete:** **MiniSearch** (BM25+, auto-suggest, JSON save) ([MiniSearch](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html)).
- **One-off questions over many logs:** ripgrep or **DuckDB** `read_json` on a glob, with no import step ([DuckDB](https://duckdb.org/docs/1.4/data/json/loading_json)).
- **Discord-like voice:** **Cloudflare Realtime SFU** (WebRTC, $0.05/GB, 1,000 GB a month free), with signaling over your socket ([Cloudflare SFU](https://www.cloudflare.com/products/turn-sfu/)).
  - **RealtimeKit** for a prebuilt UI.
  - **LiveKit** if you want open source or self-hosting ([voice](notes/streaming_transports_media_voice.md)).
- **AI voice:** Workers AI speech-to-text, LLM and text-to-speech inside a DO over one WebSocket, the `@cloudflare/voice` shape ([Cloudflare](https://blog.cloudflare.com/voice-agents/)).
- **Games:** borrow **Colyseus** ideas rather than the server:
  - send only the latest change per property each patch tick;
  - per-client views;
  - `onAdd`/`onRemove` callbacks ([Colyseus state](https://docs.colyseus.io/state)).
  Run Colyseus itself, in Containers or on Fly, only for fast action games. A tick loop stops a DO from hibernating, and duration is then billed the whole time ([games](notes/game_netcode_streaming_ui.md)).
- **Reactivity:** keep your events, because they carry the deltas. Add signals only for derived views, behind `get`/`set`: `@preact/signals-core` (~2 KB), `alien-signals` (~2 KB) or about 50 lines of your own ([signals](notes/signals_reactivity_lists.md)).
- **Avoid:** Postgres sync engines (Zero, Electric, PowerSync) for pages.
  - They force your objects into rows, and Zero needs a non-Cloudflare server ([adopters](notes/adopters_and_pairings.md)).
  - ORMs fit at most inside one store adapter ([storage tools](notes/node_storage_orms.md)).

## 6. Streaming and transports, in one screen

| Job | Use |
|---|---|
| Page deltas, agent edits | WebSocket to the page's Room (a DO in the cloud) |
| Presence, cursors | Same socket, throttled, never stored |
| Chat | Same socket, plus the log |
| AI token streaming | Same socket; SSE or fetch for stateless calls |
| Turn-based or casual games | WebSocket, one room per match |
| Fast action games | WebRTC unreliable DataChannel; WebSocket for authoritative events |
| Voice and video rooms | WebRTC through Realtime SFU |
| One-to-many broadcast | Stream WHIP/WHEP (<500 ms) or LL-HLS (~3 s) |
| AI voice, 1:1 | PCM over WebSocket to a DO first; WebRTC later |

- **WebTransport is out:** Workers can't terminate it, and Cloudflare says it is "not on the agenda".
- **MoQ:** watch it; it is still a draft.

This is the Figma, tldraw and Discord split ([transports](notes/streaming_transports_media_voice.md)).

## 7. Costs on Cloudflare vs alternatives

**For you today, the $5/month Workers Paid plan covers it.** A small app (1k MAU) models at about $5–6/month even at multiplayer message rates ([cost model](notes/cloudflare_vs_postgres_platforms.md) §5, rates from [DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)).

**Why it is cheap:**
- outgoing WebSocket messages are free;
- incoming ones are billed 20:1 as requests;
- hibernating sockets cost no duration.

Modelled at 100k MAU (the researcher's assumptions; the rates are real):

| Setup | Per month |
|---|---|
| Cloudflare, chat and presence | ~$30 |
| Cloudflare, multiplayer, batched writes | ~$150 |
| Same, one row per delta | ~$905 |
| Same, with a game tick loop | ~$978 |
| Supabase Realtime, multiplayer | ~$43,000, over its rate limits |
| Fly.io, own ws server | ~$270–300, plus your ops |
| Neon / Turso | ~$170–340 / ~$44, database only |

Voice at that scale: raw SFU about $144; RealtimeKit about $1,800.

**The catches:**
- **Your design choices swing the bill about 6×.** Batch your writes: rows written cost $1/M past 50M. Never put tick loops or timers in a DO.
- **There is no hard spend cap.** A runaway alarm loop cost $34,895 in about 8 days with zero users ([HN](https://news.ycombinator.com/item?id=47787042)). Use budget alerts and guard code.
- **Pending I/O keeps an object awake, and billing,** from compat date 2026-10-01 ([DO changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)).
- **Every deploy drops every socket.**
- **No data branching and no local↔cloud data sync.** DOs can't be bound remotely in local dev. Neon, Supabase and Turso win on branching.
- **Per-DO limits:** 10 GB storage, 128 MB memory, 2 MB per row, about 1k requests/s. A DO stays where it was first created.
- **D1 is capped at 10 GB per database**, and the cap can't be raised. Use it only for a small global index.
- **R2:** LIST is billed like a write. One PUT per delta is about $3.90/month per busy page, so batch deltas into segments.
- **Auth is not included.** You bring your own.

## 8. Simplifying concessions

Each one is safe now. Lift it when the symptom shows up.

- **One writer per page; no P2P, no offline multi-writer.**
  - Lift when: you need long offline edits. Then re-download on reconnect and reapply pending ops, as Figma does.
- **Last-writer-wins per field, with strings as whole values.**
  - Lift when: two people type in the same paragraph. Then move that field to Yjs.
- **`after: id` positions, not fractional indexes.**
  - Lift when: concurrent drags in one list become common. The stale-move race is already reproduced.
- **Pending ops kept in memory only,** so they are lost on a tab reload.
  - Lift when: reload losses happen in real use. Then persist them per tab, as Replicache does.
- **No fsync on appends;** fsync only snapshots and rewrites.
  - Lift when: the data matters and runs on a server. A DO handles this for you.
- **Stage-1 compaction only** (an appended snapshot line).
  - Lift when: load time or file size hurts. The 3.4 MB session log is close.
- **One home per page; no local↔cloud sync.**
  - Lift when: pages need to move often. Then add export/import through the adapter.
- **Events, no signals.**
  - Lift when: derived views get hard to keep right.
- **Search by scanning** (ripgrep, DuckDB).
  - Lift when: you need answers under 100 ms, or the logs pass a few tens of MB. Then use FTS5.
- **A hibernating relay, no server game loop.**
  - Lift when: you build a fast action game. Then Colyseus, in Containers or on Fly.
- **Git and snapshots as undo.**
  - Lift when: users need undo inside a page. Then a local stack of inverse ops, using `was` on `remove` and `move`.

## 9. Risks and open questions

- **Git `merge=union` after compaction.**
  - A branch that appended to a page compacted on main replays every old line again (F3).
  - Stage 2 must skip files changed on open branches, or `merge.mjs` needs a rule. **Needs your decision.**
- **Where pages live.** Tunnel to the PC, fully in the cloud, or both ([hosting idea](../ideas/hosting-tunnels-and-cloud-files.md)).
  - Agents writing code still need real files and git.
  - **Open.**
- **Hooks and listings.** `jsonl-schema`, `jsonl-guard` and `PageFiles` must accept the snapshot line and `page.<n>.jsonl` archives.
- **Windows.** Renaming over a file another process holds open can fail with `EPERM`/`EBUSY`. Retry with a short delay.
- **Migration effort.** About 20 direct writers and the room page have to move to the one writer, and 1,810 old `at` lines still replay through compatibility branches.
- **Untested here.**
  - DO behaviour was checked against a `node:sqlite` stand-in. Verify it under `wrangler dev`.
  - Cost figures are modelled (5 ms per message assumed), not measured.
- **Unverified data.** Adoption numbers are not yet script-verified (STATUS, next item 1), and the taxonomy is still incomplete.
- **Placement.** A DO stays in the region of its first writer. That is fine for a page, but worth knowing for a shared canvas.

## 10. Sources

**In this repo** (relative to `persistence-sync/`)
- [lew42/overview.md](lew42/overview.md): how your code works today, and 14 ranked gaps.
- [lessons/storage-compaction.md](lessons/storage-compaction.md): store adapter, compaction policy, F1–F10.
- [lessons/object-model.md](lessons/object-model.md): op vocabulary, T1–T6.
- [lessons/sync-protocol.md](lessons/sync-protocol.md): message vocabulary, R1–R9, DO notes.
- Research notes:
  - [collab_app_architectures](notes/collab_app_architectures.md)
  - [delta_logs_build_vs_buy](notes/delta_logs_build_vs_buy.md)
  - [sync_engines_crdts](notes/sync_engines_crdts.md)
  - [adopters_and_pairings](notes/adopters_and_pairings.md)
  - [adoption_metrics](notes/adoption_metrics.md)
  - [cloudflare_vs_postgres_platforms](notes/cloudflare_vs_postgres_platforms.md)
  - [object_dbs_file_layouts](notes/object_dbs_file_layouts.md)
  - [node_storage_orms](notes/node_storage_orms.md)
  - [search_indexing_jsonl_limits](notes/search_indexing_jsonl_limits.md)
  - [streaming_transports_media_voice](notes/streaming_transports_media_voice.md)
  - [game_netcode_streaming_ui](notes/game_netcode_streaming_ui.md)
  - [signals_reactivity_lists](notes/signals_reactivity_lists.md)
  - [fullstack_framework_data_paths](notes/fullstack_framework_data_paths.md)
- Ideas: [test-driven-development](../ideas/test-driven-development.md), [hosting-tunnels-and-cloud-files](../ideas/hosting-tunnels-and-cloud-files.md).

**Key external sources**
- [Figma: how multiplayer works (2019)](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- [Figma: making multiplayer more reliable (2022)](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- [tldraw sync docs](https://tldraw.dev/docs/sync)
- [Linear sync engine, reverse-engineered](https://github.com/wzhudev/reverse-linear-sync-engine)
- [Weidner: central-server architectures](https://mattweidner.com/2024/06/04/server-architectures.html)
- [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Durable Objects WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [DO storage API](https://developers.cloudflare.com/durable-objects/api/storage-api/)
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [Cloudflare Realtime SFU](https://www.cloudflare.com/products/turn-sfu/)
- [SQLite FTS5](https://sqlite.org/fts5.html)
- [MiniSearch](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html)
- [Colyseus state sync](https://docs.colyseus.io/state)
- [JSON Whisperer (LLM patches)](https://arxiv.org/html/2510.04717v1)
- [Supabase pricing](https://supabase.com/pricing)
- [$34k DO alarm incident (HN)](https://news.ycombinator.com/item?id=47787042)
