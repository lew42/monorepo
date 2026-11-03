# Lessons: sync protocols for lew42's streaming layer

Owner: `lessons-sync` agent. Status: complete (2026-10-30).

**What this page does.** It reads the source code and specs of five proven sync protocols and says what lew42's websocket + JSONL streaming layer should take from each. The five are tldraw sync, Meteor DDP, Replicache/Zero, Electric Durable Streams and y-protocols. Each recommendation comes with a test spec that fails today (the owner's rule). Every "today" claim was run against the real code. The probe scripts are listed in [Appendix A](#appendix-a-how-the-today-results-were-checked).

**The short answer.** lew42 already has the hard parts right. The log has one writer, one order and a cursor you can resume from. It is missing four small things that every one of these protocols has:

1. A server sequence number on every line.
2. A client id on every write, so a retry is harmless.
3. A clear reply for each write: "accepted at seq N" or "refused, because".
4. A real reconnect handshake (`hello {since}` → catch-up, or "start over from a snapshot").

Presence is a fifth, separate, throwaway channel. It is not built yet.

Pinned commits used below:
- lew42: [`lew42/monorepo@9ba46ee`](https://github.com/lew42/monorepo/tree/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895)
- tldraw: [`tldraw/tldraw@38e6c84`](https://github.com/tldraw/tldraw/tree/38e6c84dcaebee164aeeb961113f14e1a317e6ea)
- Meteor: [`meteor/meteor@e587c05`](https://github.com/meteor/meteor/tree/e587c05d3abd25484adfd5e2e55373fd5c725469)
- Rocicorp: [`rocicorp/mono@f779973`](https://github.com/rocicorp/mono/tree/f779973493b4109a59e35dbf71ad44103c4ae054)
- Durable Streams: [`durable-streams/durable-streams@461b402`](https://github.com/durable-streams/durable-streams/tree/461b40267aabd644558f9b19dbb9507dd5f691cf)
- y-protocols: [`yjs/y-protocols@73b2ff7`](https://github.com/yjs/y-protocols/tree/73b2ff75486c9879843718dc6c7fc52d63aea4fe)

Sections:
0. [lew42 today (the baseline)](#0-lew42-today-the-baseline)
1. [tldraw sync-core](#1-tldraw-sync-core)
2. [Meteor DDP](#2-meteor-ddp)
3. [Replicache / Zero](#3-replicache--zero)
4. [Electric Durable Streams](#4-electric-durable-streams)
5. [y-protocols](#5-y-protocols)
6. [Cross-cutting answers](#6-cross-cutting-answers)
7. [What changes on a Durable Object](#7-what-changes-on-a-durable-object)
8. [Top recommendations, each with a failing test](#8-top-recommendations-each-with-a-failing-test)
9. [Proposed message vocabulary](#9-proposed-message-vocabulary)
- [Appendix A: how the "today" results were checked](#appendix-a-how-the-today-results-were-checked)

---

## 0. lew42 today (the baseline)

There are two stacks.

**Dev stack (Node, what runs today).** One WebSocket per tab. Every frame is `{method, args}` (call a method on the other side) or `{index, response}` (a reply to a request). The tab's reply slot is the array index of its resolver ([wire.md](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/dev/Socket/doc/wire.md#L104-L118)).

- **Write.** `Item.Store` batches a tick's lines and sends `append(url, lines)`. The server checks the lines, skips any whose `by|ts` is already in the file's last 64 KB, appends them, and answers `"append successful"` ([Append.js#L65-L105](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.js#L65-L105), [Store.js#L173-L214](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L173-L214)). Record files go through Servex's `POST /api/item` first ([RecordWriter.js#L43-L65](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L43-L65)).
- **Read.** `subscribe(url, byteOffset)` → `jsonl(path, lines, offset, from, ends)`. Each socket keeps its own byte offset per file. If the file is now shorter than the offset, the server sends `jsonl_reset` ([Tail.js#L54-L131](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L54-L131)). On reconnect, the tab subscribes again from each reader's offset ([live.js#L66-L74](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L66-L74)).
- **Own echo.** The writer applies its own change at once. When the line comes back, it is dropped by an exact string match against `sent` ([Store.js#L100-L130](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L100-L130)).

**Production sketch (Cloudflare).** One `Room` Durable Object per url. Deltas live in a SQLite table with an autoincrement id. The client connects with `?since=<id>` and gets every row after it, then live `{type:"message", id, …}` frames ([room.js#L30-L77](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/worker/room.js#L30-L77)). His design doc already names the main traps: a deploy disconnects everyone, use a row id not a byte offset, and rebuild sessions after hibernation ([durable-objects.md#L146-L157](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/imagine/stream/doc/durable-objects.md#L146-L157)).

**What is already good:**
- **One writer decides the order.** That is the property every server-authoritative protocol below depends on.
- **Resume from a cursor.** Both stacks have one.
- **Torn half-lines are never read.** An offset always lands just past a `\n`.
- **Batched writes.** One frame per tick.

---

## 1. tldraw sync-core

**What it is.** The open-source sync engine behind tldraw.com. Each room is a server-authoritative store of records (shapes, pages, and so on), run in one Cloudflare Durable Object per file. Clients apply their edits at once ("speculatively") and rebase them when the server answers. It is the closest match to what lew42 wants: Figma-style, record-level, last write wins, one DO per room.

**Messages** ([protocol.ts#L112-L290](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/protocol.ts#L112-L290)):
- client → server
  - `connect {connectRequestId, lastServerClock, protocolVersion, schema}`
  - `push {clientClock, diff?, presence?}`
  - `ping`
- server → client
  - `connect {hydrationType: "wipe_all"|"wipe_presence", serverClock, diff, schema, protocolVersion, isReadonly}`
  - `patch {diff, serverClock}`
  - `push_result {clientClock, serverClock, action: "commit"|"discard"|{rebaseWithDiff}}`
  - `data [patch|push_result…]` (batched)
  - `pong`, `custom`, `incompatibility_error`

**Key mechanism 1: catch-up or wipe.** The server keeps one `documentClock`. Every record row stores `lastChangedClock`, and every delete leaves a tombstone row with its clock. To reconnect, the client sends the last clock it saw. If that clock is older than the oldest tombstone the server still keeps, the server cannot say what was deleted, so it sends everything and tells the client to wipe ([SQLiteSyncStorage.ts#L713-L748](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/SQLiteSyncStorage.ts#L713-L748)):

```ts
getChangesSince(sinceClock) {
  const clock = this.storage.getClock()
  if (sinceClock === clock) return undefined          // nothing new
  if (sinceClock > clock) sinceClock = -1             // client is from the future: start over
  const wipeAll = sinceClock < this.storage._getTombstoneHistoryStartsAtClock()
  if (wipeAll) { /* every record as a put */ }
  else { /* rows with lastChangedClock > since, plus tombstones with clock > since */ }
  return { diff, wipeAll }
}
```

Tombstones are capped at 5,000. Above that, the oldest are pruned and the "history starts at" clock moves forward ([InMemorySyncStorage.ts#L25-L27](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/InMemorySyncStorage.ts#L25-L27)).

**Key mechanism 2: the push result is computed, not assumed.** The server applies the push and then compares what actually changed with what the client asked for ([TLSyncRoom.ts#L1583-L1617](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncRoom.ts#L1583-L1617)):
- **The same:** `commit`.
- **Nothing changed** (refused, or a no-op): `discard`.
- **Something else** (a validator changed it, or it merged with a concurrent edit): `rebaseWithDiff` carrying the real result.

The server sends `patch` to every other session but never echoes the change back to its sender ([TLSyncRoom.ts#L666-L668](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncRoom.ts#L666-L668)).

**Key mechanism 3: the client rebase** ([TLSyncClient.ts#L969-L1029](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncClient.ts#L969-L1029)):

```
undo speculativeChanges                      // back to the last state the server confirmed
for msg in buffered server messages:
  patch       -> apply msg.diff
  push_result -> check msg.clientClock == pendingPushRequests[0].clientClock (else reset)
                 commit: apply our own request.diff · discard: drop it · rebaseWithDiff: apply the server's diff
speculativeChanges = re-apply the pending pushes still in flight + unsent changes
lastServerClock = last msg.serverClock
```

The rebase is throttled to frame rate. On any mismatch, the client throws away its speculative state and reconnects ([TLSyncClient.ts#L1022-L1034](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncClient.ts#L1022-L1034)).

**Reconnect.** Pending pushes are dropped on disconnect ([TLSyncClient.ts#L710-L732](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncClient.ts#L710-L732)). On `connect`, the client undoes its speculative edits, applies the server's diff (after a wipe if `wipe_all`), re-applies its edits on top, and sends them as one new push ([TLSyncClient.ts#L739-L827](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncClient.ts#L739-L827)). A lost push is therefore re-sent as a diff against the new state. Because diffs are "set this field to X", sending one twice is harmless. That is why tldraw needs no mutation-id table.

**Presence.** Presence is a separate record scope, never stored. It rides on `push.presence` and is removed when the session goes. On every connect, the server sends all peers' presence except your own ([TLSyncRoom.ts#L1176-L1188](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncRoom.ts#L1176-L1188)). The client sends at 1 fps when alone and 30 fps with others ([TLSyncClient.ts#L47-L50](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncClient.ts#L47-L50)).

**Durable Object details** ([TLFileDurableObject.ts](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/apps/dotcom/sync-worker/src/TLFileDurableObject.ts)):
- **Ping without waking.** The runtime itself answers `{"type":"ping"}` with `setWebSocketAutoResponse`, so a ping never wakes the object ([L597-L600](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/apps/dotcom/sync-worker/src/TLFileDurableObject.ts#L597-L600)).
- **Sessions survive hibernation.** Each session's state (id, schema, presence) is stored in the socket's attachment. On wake, `getWebSockets()` plus `handleSocketResume` rebuild the session list ([L410-L416](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/apps/dotcom/sync-worker/src/TLFileDurableObject.ts#L410-L416), [L486-L513](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/apps/dotcom/sync-worker/src/TLFileDurableObject.ts#L486-L513)).
- **Schema re-check.** A resumed session's schema is checked again, because the build may have changed while the socket slept ([TLSyncRoom.ts#L835-L840](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncRoom.ts#L835-L840)).
- **Batched sends.** Data messages to one session are sent at most once per 1/60 s ([TLSyncRoom.ts#L507-L545](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncRoom.ts#L507-L545)).

**Versioning.** One integer `TLSYNC_PROTOCOL_VERSION = 8` ([protocol.ts#L4](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/protocol.ts#L4)). Older versions are mapped forward where they are compatible. Anything else is closed with `CLIENT_TOO_OLD` or `SERVER_TOO_OLD` ([TLSyncRoom.ts#L1103-L1124](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncRoom.ts#L1103-L1124)). New optional fields need no version bump ([protocol.ts#L122-L127](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/protocol.ts#L122-L127)).

**Liveness.** The client pings every 5 s. It resets the connection only when a ping has gone unanswered for 10 s, not on mere silence, because hidden tabs throttle timers ([TLSyncClient.ts#L611-L664](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncClient.ts#L611-L664)).

**Why it is designed this way.** One server clock gives every client a total order, which makes "catch up since N" trivial. Edits are records with last-write-wins fields, so a diff applied twice gives the same result, and pending changes can be rebased by undo, apply, redo. That avoids a CRDT and avoids per-mutation bookkeeping.

**Lesson for lew42.**
- **Adopt** the per-push reply (`commit` / `discard` / `rebase`). lew42 today answers a string per frame, and a tab that applied its own edit never learns the real result. Test [R3](#r3-tell-the-writer-what-actually-happened-to-its-write).
- **Adopt** "the sender gets an ack, not an echo." lew42 echoes every line to its writer and filters it with an exact string match ([Store.js#L123-L130](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L123-L130)). That works, but it is the cause of the divergence in R3.
- **Adopt** catch-up-or-wipe with a "history starts at" cursor. That is exactly what compaction needs. Test [R4](#r4-say-start-over-when-the-log-was-rewritten).
- **Adapt** the rebase. lew42's lines are verbs (`add`, `move`, `set`), not record diffs. Re-applying is safe for `set` and for `add` with an id (`List.insert` returns the existing member, [List.js#L230-L246](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L230-L246)), but not for `move` or a text append. So lew42 needs client mutation ids (section 3) where tldraw does not.
- **Adopt** auto-response ping, attachment-based session rebuild and a schema re-check on wake when the Room DO grows up.
- **Ignore** the separate record scopes and down-migrations for now. lew42 has no schema versioning on its lines yet. A single `v` in `hello` (section 9) is enough to start.

---

## 2. Meteor DDP

**What it is.** The Distributed Data Protocol: JSON over WebSocket between a Meteor client and server, around since 2012. It has two halves. Subscriptions keep a client-side cache of documents. Methods are RPCs whose writes come back as data messages. Its spec is the clearest written statement of "an RPC result and its data becoming visible are two separate events."

**Messages** ([DDP.md](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp/DDP.md)):
- connect
  - `connect {version, support[], session?, receivedCount?}`
  - `connected {session}`
  - `failed {version}`
- liveness: `ping {id?}`, `pong {id?}`
- data
  - `sub {id, name, params}` / `unsub {id}` / `nosub {id, error?}`
  - `added {collection, id, fields}` / `changed {collection, id, fields?, cleared?[]}` / `removed {collection, id}`
  - `ready {subs[]}`
  - `addedBefore` / `movedBefore` (ordered; specified but unused)
- methods
  - `method {method, params, id, randomSeed?}`
  - `result {id, error?, result?}`
  - `updated {methods[]}`
- errors: `error {reason, offendingMessage}`

**Key mechanism 1: `result` and `updated` are separate** ([DDP.md#L194-L221](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp/DDP.md#L194-L221)). `result` says the method ran. `updated` says "every data message caused by this method has now been sent to you." Only after `updated` does the client drop its stub's guess and show the server's copy ([document_processors.js#L118-L175](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp-client/common/document_processors.js#L118-L175)):

```
on updated {methods}:
  for each doc a stub of this method wrote:
    delete serverDoc.writtenByStubs[methodId]
    if no other pending stub wrote it: replace the local doc with serverDoc.document   // the server's truth wins
  run the method's "data visible" callback once everything buffered is flushed
```

**Key mechanism 2: session resume, recently built.** For years DDP specified `session` but never resumed, so a reconnect meant a full resync ([message_processors.js#L35-L65](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp-client/common/message_processors.js#L35-L65)). At this commit (2026-10-28), resume works:
- **The client** sends its old `session` and `receivedCount`, the number of messages it got ([connection_stream_handlers.js#L149-L159](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp-client/common/connection_stream_handlers.js#L149-L159)).
- **The server**, while the socket is gone, buffers up to 100 outgoing messages for a 15 s grace period ([livedata_server.js#L1325-L1335](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp-server/livedata_server.js#L1325-L1335)).
- **It resumes only if** `sentCount === receivedCount`. Then it flushes the buffer in order, before anything else ([livedata_server.js#L1508-L1550](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp-server/livedata_server.js#L1508-L1550)).

Otherwise the client resets its stores, re-subscribes, and waits until every sub is `ready` again ("quiescence") before swapping the data in, so the UI never flickers through an empty state ([message_processors.js#L70-L126](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp-client/common/message_processors.js#L70-L126)).

**Key mechanism 3: methods are re-sent unless they opt out.** On reconnect, unanswered methods are re-sent. A method called with `noRetry` fails with `invocation-failed` instead ([connection_stream_handlers.js#L165-L198](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp-client/common/connection_stream_handlers.js#L165-L198)). DDP has no server-side dedup, so a re-sent non-idempotent method can run twice. Meteor leaves that to the app.

**Versioning.** The client proposes `version` and lists `support`. The server answers `failed {version}` with the best one it speaks and closes the socket. Unknown fields must be ignored, so minor additions need no new version ([DDP.md#L24-L80](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp/DDP.md#L24-L80), [livedata_server.js#L1477-L1503](https://github.com/meteor/meteor/blob/e587c05d3abd25484adfd5e2e55373fd5c725469/packages/ddp-server/livedata_server.js#L1477-L1503)).

**Why it is designed this way.** Meteor's server is a cache of Mongo, not a log, so it cannot replay history. Reconnect therefore was (and mostly still is) "send everything again". `result` and `updated` are split because a method's return value can arrive before its side effects do.

**Lesson for lew42.**
- **Adopt** `ready` after catch-up. Today a stream "has caught up" only by a 1.5 s timer guess. When that timer fires, the reader is dropped from live updates for good. Test [R5](#r5-catch-up-ends-with-an-explicit-ready-and-a-stream-never-quietly-goes-static).
- **Adopt** `changed {fields, cleared}` as the shape of a field update. It matches lew42's `set`, plus a list of fields to delete.
- **Adopt** an error reply for unknown or malformed frames (`error {reason, offendingMessage}`). Today the dev server silently ignores a method it has no handler for, so the caller's `request()` waits forever (run in probe H). That is why `stream.js` races every append against a timer ([stream.js#L170-L178](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/imagine/stream/stream.js#L170-L178)).
- **Adopt** `version` + `support` → `failed {version}`. It is the cheapest working version handshake. See section 6.
- **Ignore** session resume by message count. lew42 already has something better: a persistent log cursor. Meteor's buffer dies after 15 s and on a deploy, while lew42's offset or row id survives both.
- **Ignore** the stub/serverDoc bookkeeping. It exists because Meteor runs arbitrary method code on the client. lew42's edits are plain data lines.

---

## 3. Replicache / Zero

**What it is.** Rocicorp's sync engines. Replicache is a client-side store that syncs with your own push and pull endpoints. Zero is its successor, with its own server (`zero-cache`) over Postgres. Both use named mutators run on the client first, then for real on the server. Both have the most explicit idempotency rule of the five: one counter per client, kept in the same transaction as the write.

**Messages.**
- **Replicache (HTTP)**
  - `push {clientGroupID, mutations:[{clientID, id, name, args}], pushVersion, schemaVersion}`
  - `pull {clientGroupID, cookie, pullVersion, schemaVersion}` → `{cookie, lastMutationIDChanges:{clientID:n}, patch:[put|del|clear]}`
  - **poke**: an empty "pull now" hint sent over any socket ([server push](https://doc.replicache.dev/reference/server-push), [server pull](https://doc.replicache.dev/reference/server-pull), [poke](https://doc.replicache.dev/byob/poke))
- **Zero (one WebSocket)**
  - `push {clientGroupID, mutations, pushVersion, requestID}` → `pushResponse {mutations:[{id:{clientID,id}, result}]}`
  - `pokeStart {pokeID, baseCookie}` · `pokePart {lastMutationIDChanges, rowsPatch, mutationsPatch}` · `pokeEnd {pokeID, cookie, cancel?}`
  - `ackMutationResponses`, `ping` / `pong`, `error`
  - sources: [push.ts](https://github.com/rocicorp/mono/blob/f779973493b4109a59e35dbf71ad44103c4ae054/packages/zero-protocol/src/push.ts#L6-L97), [poke.ts](https://github.com/rocicorp/mono/blob/f779973493b4109a59e35dbf71ad44103c4ae054/packages/zero-protocol/src/poke.ts#L7-L95)

**Key mechanism 1: `lastMutationID`, in the same transaction.** Each client numbers its mutations 1, 2, 3 and so on. The server keeps `lastMutationID` per client, and bumps and checks it inside the transaction that applies the mutation ([zql-database.ts#L78-L94](https://github.com/rocicorp/mono/blob/f779973493b4109a59e35dbf71ad44103c4ae054/packages/zero-server/src/zql-database.ts#L78-L94), [process-mutations.ts#L794-L814](https://github.com/rocicorp/mono/blob/f779973493b4109a59e35dbf71ad44103c4ae054/packages/zero-server/src/process-mutations.ts#L794-L814)):

```ts
// INSERT INTO clients (clientGroupID, clientID, lastMutationID) VALUES (…, 1)
//   ON CONFLICT DO UPDATE SET lastMutationID = current.lastMutationID + 1 RETURNING lastMutationID
const { lastMutationID } = await transactionHooks.updateClientMutationID()
if (receivedMutationID < lastMutationID) throw new MutationAlreadyProcessedError(…)   // a retry: skip, answer "alreadyProcessed"
else if (receivedMutationID > lastMutationID) throw new OutOfOrderMutation(…)        // a gap: refuse, the client must resend in order
```

A mutation that the app refuses is still recorded as processed, with its error stored, so the client stops retrying it ([process-mutations.ts#L721-L779](https://github.com/rocicorp/mono/blob/f779973493b4109a59e35dbf71ad44103c4ae054/packages/zero-server/src/process-mutations.ts#L721-L779)). Replicache's spec says the same: "the server must still mark the mutation as processed" ([server push](https://doc.replicache.dev/reference/server-push)).

**Key mechanism 2: rebase by mutation id.** On pull or poke, the client rewinds to the last server state, applies the patch, then replays only the local mutations with `id > lastMutationID` ([pull.ts#L353-L400](https://github.com/rocicorp/mono/blob/f779973493b4109a59e35dbf71ad44103c4ae054/packages/replicache/src/sync/pull.ts#L353-L400)). It refuses a response whose `lastMutationID` goes backwards, or whose cookie does not match the base it rebases on ([pull.ts#L221-L252](https://github.com/rocicorp/mono/blob/f779973493b4109a59e35dbf71ad44103c4ae054/packages/replicache/src/sync/pull.ts#L221-L252)). "How it works": confirmed mutations are "no longer re-run by the client on new server state", and that is what stops a change from applying twice ([how it works](https://doc.replicache.dev/concepts/how-it-works)).

**Key mechanism 3: cookie and clear.** The cookie is opaque and orderable. If the server does not know the client's cookie, it answers `clear` plus a full set of `put`s ([server pull](https://doc.replicache.dev/reference/server-pull)). That is the same "start over" as tldraw's `wipe_all`.

**Key mechanism 4: atomic pokes.** A Zero poke is `pokeStart` … `pokePart`* … `pokeEnd`. Nothing applies until `pokeEnd`, and `cancel: true` throws the whole poke away ([poke.ts#L7-L32](https://github.com/rocicorp/mono/blob/f779973493b4109a59e35dbf71ad44103c4ae054/packages/zero-protocol/src/poke.ts#L7-L32)).

**Versioning.** One integer `PROTOCOL_VERSION = 53` with a written history of what each bump changed, plus `MIN_SERVER_SUPPORTED_SYNC_PROTOCOL = 30`. The rule: deploy the server before the clients ([protocol-version.ts#L1-L87](https://github.com/rocicorp/mono/blob/f779973493b4109a59e35dbf71ad44103c4ae054/packages/zero-protocol/src/protocol-version.ts#L1-L87)).

**Why it is designed this way.** Pushes travel over plain HTTP, which can time out after the server committed. The only safe retry is one the server can recognise. A per-client counter costs one row per client, with no per-mutation table and no TTL. And because it is updated in the same transaction as the effect, "applied" and "counted" can never disagree.

**Lesson for lew42.**
- **Adopt** a per-tab `client` id and a per-tab counter `n` on every client op. Check it in the same step that appends the line. This replaces the `by|ts` twin check, which can't tell two tabs apart and silently drops a real edit today (test [R1](#r1-give-every-write-a-client-id-and-counter-and-dedupe-on-that-not-on-byts)). It also makes a retry after a lost ack safe (test [R2](#r2-a-write-whose-socket-died-is-retried-and-lands-exactly-once)).
  - On the dev server, the "transaction" is the synchronous `appendFileSync` plus an in-memory map that is rebuilt from the file on boot.
  - On a DO, it is one SQLite statement batch. The DO's single thread and output gate make it atomic.
- **Adopt** "a refused op still counts as processed, and the reason is returned" (R3).
- **Adopt** `clear` / start-over when the cursor is unknown (R4).
- **Adapt** the poke. lew42's broadcast already carries the data, so there is no need for a separate pull. But keep the "a batch applies all or nothing" rule: `Store.read` applies a batch line by line, and a throw half-way leaves a half-applied batch.
- **Ignore** client groups, multi-part binary pokes and query-driven partial sync. One room per page means one subscription per room.

---

## 4. Electric Durable Streams

**What it is.** An open HTTP protocol, with about 400 conformance tests, for a URL-addressed append-only stream. You `POST` to append and `GET ?offset=` to read: catch-up, long-poll, or SSE. Electric extracted it from its Postgres sync. It is the closest published spec to lew42's "a page is a `.jsonl` you tail from an offset". The repo also ships a Cloudflare Durable Object server.

**Messages** (HTTP; [PROTOCOL.md](https://github.com/durable-streams/durable-streams/blob/461b40267aabd644558f9b19dbb9507dd5f691cf/PROTOCOL.md)):
- **`PUT`** creates a stream. **`POST`** appends, with optional `Producer-Id/Epoch/Seq` and `Stream-Seq`. **`POST` with `Stream-Closed: true`** closes it. **`DELETE`** and **`HEAD`** do what they say.
- **`GET ?offset=X`** catches up. It returns data plus `Stream-Next-Offset` and `Stream-Up-To-Date: true` when the reader is at the tail.
- **`GET ?offset=X&live=long-poll`** waits for new data. `live=sse` streams `event: data` + `event: control {streamNextOffset, upToDate, streamClosed}`.
- **Sentinels:** `offset=-1` is the start. `offset=now` is the tail, for "future data only", for example presence.
- **Errors:** `410 Gone` means the offset is before what the server still keeps. `409` means a sequence gap or a closed stream.

**Key mechanism 1: offsets are opaque, sortable, and never reused** ([PROTOCOL.md#L1184-L1240](https://github.com/durable-streams/durable-streams/blob/461b40267aabd644558f9b19dbb9507dd5f691cf/PROTOCOL.md#L1184-L1240)). They are strictly increasing, and servers "MUST NOT" use anything that can repeat, such as raw timestamps. The Cloudflare server encodes `readSeq_byteOffset` as two zero-padded numbers, so a string comparison is a numeric comparison ([store.ts#L115-L125](https://github.com/durable-streams/durable-streams/blob/461b40267aabd644558f9b19dbb9507dd5f691cf/packages/server-cloudflare/src/store.ts#L115-L125)). The first part (`readSeq`) also changes when the log is rewritten.

**Key mechanism 2: idempotent producers, Kafka style** ([PROTOCOL.md#L361-L436](https://github.com/durable-streams/durable-streams/blob/461b40267aabd644558f9b19dbb9507dd5f691cf/PROTOCOL.md#L361-L436)):

```
if epoch <  state.epoch: 403 (a stale tab or zombie: fenced off)
if epoch >  state.epoch: seq must be 0; accept; state = {epoch, lastSeq: 0}
if seq <= state.lastSeq: 204 (duplicate: success, nothing written)
if seq == state.lastSeq+1: 200, append
if seq >  state.lastSeq+1: 409 Producer-Expected-Seq: lastSeq+1
```

The `epoch` part solves a problem a plain counter does not: a reloaded tab restarts at seq 0, and the epoch tells the server it is a new run of the same producer.

**Key mechanism 3: JSON mode keeps message boundaries.** A POST of `[a, b]` stores two messages, a GET returns a JSON array, and an empty array is a 400 ([PROTOCOL.md#L1264-L1295](https://github.com/durable-streams/durable-streams/blob/461b40267aabd644558f9b19dbb9507dd5f691cf/PROTOCOL.md#L1264-L1295)). That is lew42's `append(url, [objects])` exactly.

**Durable Object.** The repo's Cloudflare server keeps one DO per stream on SQLite. It relies on the DO input gate to serialise every validate-then-write, and on the output gate for "durable before ack" ([stream-object.ts#L1-L15](https://github.com/durable-streams/durable-streams/blob/461b40267aabd644558f9b19dbb9507dd5f691cf/packages/server-cloudflare/src/stream-object.ts#L1-L15)).

**Why it is designed this way.** Plain HTTP and opaque offsets let a CDN cache catch-up reads, and let a server hide chunk-file ids inside an offset. `Up-To-Date` (caught up for now) is kept separate from `Closed` (no more data ever), so a client knows when to switch to live mode without guessing.

**Lesson for lew42.**
- **Adopt** "the server mints the cursor, and the client never does arithmetic on it." Today the dev client keeps byte offsets and the DO keeps row ids. If the cursor is a server `seq` (a number) everywhere, the client code is the same on both servers. His design doc already says the byte offset is the wrong cursor ([durable-objects.md#L152](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/imagine/stream/doc/durable-objects.md#L152)).
- **Adopt** `410 Gone` as a distinct answer ("your cursor is before the start of history: reload the snapshot"). It is the same idea as tldraw's `wipe_all` (R4).
- **Adopt** an explicit `upToDate` marker at the end of catch-up (R5).
- **Adopt** the epoch idea in the client id: a new `client` id per page load, and `n` from 1. That gives the same fencing without a separate epoch.
- **Adopt** `offset=now` as the presence subscription: future data only, no history (R7).
- **Adapt** the HTTP transport. Keep the WebSocket, but make the static fallback the catch-up `GET`: a `page.jsonl` on the CDN *is* a catch-up read. This is what `Store.load()` already does off localhost.
- **Ignore** forks, subscriptions and webhooks. They are useful for agent pipelines later, not for the page wire.

---

## 5. y-protocols

**What it is.** The tiny binary wire protocol under every Yjs provider (y-websocket, Hocuspocus, y-partykit). It has two parts. **Sync** exchanges CRDT state vectors and updates. **Awareness** is a separate, never-stored channel for cursors and "who is here".

**Messages** ([PROTOCOL.md](https://github.com/yjs/y-protocols/blob/73b2ff75486c9879843718dc6c7fc52d63aea4fe/PROTOCOL.md)):
- **sync**
  - `SyncStep1(stateVector)`: "here is what I have"
  - `SyncStep2(update)`: "here is what you are missing"
  - `Update(update)`
- **awareness**: `awarenessUpdate([clientID, clock, stateJSON]…)`
- **outer framing**: `0` = sync, `1` = awareness; higher numbers are free for the app

**Key mechanism 1: the handshake is symmetric** ([sync.js#L13-L36](https://github.com/yjs/y-protocols/blob/73b2ff75486c9879843718dc6c7fc52d63aea4fe/src/sync.js#L13-L36)):
- The client sends Step1.
- The server replies with Step2, then its own Step1.
- The client replies with Step2.

Each side tells the other what it has, and gets back only what it is missing. This works because CRDT updates merge in any order and applying one twice does nothing. That property needs no sequence numbers, acks or rebase: a lost update is re-sent on the next handshake.

**Key mechanism 2: awareness is its own CRDT with timeouts** ([awareness.js#L13-L82](https://github.com/yjs/y-protocols/blob/73b2ff75486c9879843718dc6c7fc52d63aea4fe/src/awareness.js#L13-L82), [L246-L289](https://github.com/yjs/y-protocols/blob/73b2ff75486c9879843718dc6c7fc52d63aea4fe/src/awareness.js#L246-L289)):

```
each client owns one entry: (state | null, clock, lastUpdated)
apply incoming entry iff clock > known clock   (or same clock and state = null: an "offline" notice)
every 3 s:  if my state is older than 15 s, re-send it (a heartbeat with clock+1)
            drop any remote entry not refreshed for 30 s
on leave:   send state = null with clock+1
a peer that says *I* am offline: bump my clock and re-send (never let others delete me)
```

**Read-only.** A server can enforce read-only by looking at the first two bytes. Step1 and awareness may be let through, while Step2 and Update are refused ([PROTOCOL.md#L164-L178](https://github.com/yjs/y-protocols/blob/73b2ff75486c9879843718dc6c7fc52d63aea4fe/PROTOCOL.md#L164-L178)).

**Why it is designed this way.** Awareness is high-frequency and worthless after a few seconds, so it must never touch the document log. A per-client clock with a timeout makes it self-healing: a crashed tab disappears 30 s later, with no server cleanup code at all.

**Lesson for lew42.**
- **Adopt** the awareness rules as the presence channel:
  - one entry per client;
  - a `clock` per entry;
  - re-send every 15 s, drop after 30 s;
  - `null` on leave;
  - never written to `page.jsonl` or the DO's `deltas` table.
- **Adopt** the read-only filter by message type. lew42 already has one at the frame level ([Socket.js#L7-L8](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Socket.js#L7-L8)). Keep it type-based: `presence` allowed, `op` refused for readers.
- **Adapt** the state-vector handshake to a single number. One server-ordered log needs one cursor, not a vector. If lew42 later adds Yjs for rich text inside a field, use y-protocols unchanged for that field's sub-channel (outer type ≥ 2).
- **Ignore** CRDT sync for the page model itself. With one DO per page, server order plus last-write-wins per field is what tldraw does and what lew42 wants (Figma-like).

---

## 6. Cross-cutting answers

**Sequence numbers and gap detection.**
- **The pattern.** Every protocol here except y-protocols has one server-minted, monotonically increasing number per room: tldraw's `serverClock`, Replicache's cookie, Durable Streams' offset, lew42's DO row `id`.
- **What the client does with it.** It stores the last value it applied. It ignores anything less than or equal to that value (duplicate). If a frame's `prev` is not the client's last value, it has missed something and asks again.
- **lew42 today.**
  - **The dev wire** carries byte offsets and `from`. The client already uses `from` and `ends` to skip lines it has seen ([live.js#L35-L51](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L35-L51)). But when `from` is past its own offset, it applies the frame anyway: a gap goes unnoticed (test [R6](#r6-detect-a-gap-and-ask-again-never-apply-across-it)).
  - **The DO** sends `id` but nothing checks it.
- **Fix.** Use a `seq` per line. Every broadcast carries `seq` and `prev`. If `prev ≠ last`, re-subscribe from `last`.

**Write acknowledgment.**
- **What tldraw and Zero send:** one reply per client op that names the op (`clientClock` or mutation id) and says what happened (commit, discard, rebase, or alreadyProcessed / error).
- **lew42 dev today:** one string per frame, `"append successful"` or `"append refused: …"`, keyed by the reply slot's array index. There is no server position in the reply and nothing ties it to the edit.
- **lew42's DO today:** no ack at all. The sender only sees its own broadcast.
- **Fix.** Reply `ack {client, n, seq}` or `reject {client, n, why}`.
- **On a DO, acks are cheap and safe to send at once:** the output gate holds outgoing messages until the SQLite write is durable ([storage API](https://developers.cloudflare.com/durable-objects/api/storage-api/), quoted in [durable-objects.md#L88-L96](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/imagine/stream/doc/durable-objects.md#L88-L96)).

**Client mutation ids and idempotency.**
- **The pattern.** Replicache, Zero and Durable Streams all use (client id, counter). DDP has a method `id` but does not dedupe it. tldraw gets away without ids because its diffs can safely apply twice.
- **lew42 today.** It dedupes on `by|ts` within the last 64 KB ([RecordWriter.js#L67-L75](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L67-L75)).
  - **Failure 1: dropped edits.** `by` is `"owner"` for every tab, and `ts` is unique only within one tab ([RecordWriter.js#L33-L38](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L33-L38)). So two tabs in the same millisecond collide, and the second edit is dropped while its sender is told "append successful" (R1).
  - **Failure 2: unsafe retries.** Page lines from `Item.Store` carry no `ts`, so they cannot be deduped at all, and a retry after a lost ack would double a `move` (R2).
- **Fix.** `{client, n}` on every op, checked in the same step as the append.

**Optimistic local apply and rebase on conflict.**
- **What tldraw and Replicache do.**
  - Apply locally at once.
  - Keep the local edits that are not yet confirmed.
  - When server data arrives: undo them, apply the server's changes, redo them.
  - Drop each edit as its ack arrives.
- **lew42 today.** It applies locally and then drops its own echo. When another tab's edit to the same field arrives after its own, it applies that and ends on the other tab's value. Meanwhile the other tab ends on *this* tab's value. Both tabs disagree with each other and with the file, and stay that way until reload. This was run with two real tabs over a real socket (R3).
- **Fix.** The minimal version, without full undo and redo: keep a per-field "pending" map. A remote `set` of a field you have a pending write to is held until your ack arrives. Then apply in `seq` order. An ack whose `seq` is lower than a remote change you already held means your write lost: apply the held value.

**Reconnect: catch-up or snapshot.**
- **When to catch up, when to start over.** Catch up from the cursor when the server still has every op after it. Start over (`wipe_all`, `clear`, `410`) when the cursor is before what the server still keeps, after compaction, or when the log was rewritten.
- **lew42 today.** `jsonl_reset` handles only "the file got shorter". If the log was rewritten and is now at least as long as the reader's offset (compaction racing an append, or a migration that rewrites a live `page.jsonl`), the server sends the bytes after the old offset as if they were new lines. The reader gets a torn line, lines it already had, or neither of the lines it was missing (R4).
- **Fix.** Each log keeps a `base` (the first seq it still has) and an `epoch` that changes when the log is rewritten. `hello` sends both, and a mismatch answers `reset {snapshot}`.

**Presence as an ephemeral channel.**
- **The rule.** All five keep it out of the document log. tldraw puts it in a separate scope, y-protocols in a separate sub-protocol, Durable Streams reads it with `offset=now`.
- **Fix.** For lew42: `presence {client, clock, state}` frames are relayed by the room and never stored. Each tab refreshes at 15 s and is dropped at 30 s, and sends `null` on leave. On `hello`, the server sends a `presence` snapshot.
- **On a DO**, keep presence in each socket's attachment (it survives hibernation, max 16 KB), not in SQLite (R7).

**Protocol versioning.** Three working styles:
- **DDP:** `version` + `support[]` → `failed {version}`.
- **tldraw:** one integer; mapped forward where possible, otherwise closed with a "too old" reason.
- **Zero:** one integer plus a minimum supported version, and "deploy the server first".

All three also say: ignore unknown fields, and add only optional fields without a version bump. lew42 has no version on the page wire today. The cheapest fix is `hello {v: 1}` and a `reject {why: "client-too-old"}` close. Clients reconnect after every deploy anyway (section 7), so this is where an old tab learns to reload (R8).

---

## 7. What changes on a Durable Object

Sources: Cloudflare's [WebSocket reference](https://developers.cloudflare.com/durable-objects/reference/websockets/), last updated 2026-09-30. Its two key quotes: "Deploying a new version restarts every Durable Object, which disconnects any existing connections", and the attachment's "Maximum serialized size is 16,384 bytes". The [2026-10-12 runtime-update grace period](https://developers.cloudflare.com/changelog/post/2026-10-12-longer-runtime-update-grace-period/) (as summarised [here](https://vpsranking.com/news/serverless/serverless-2026-10-12-cloudflare-runtime-update-grace-period/)) gives up to 20 minutes on *runtime* updates, but says WebSockets "may disconnect before the grace period ends", hibernated ones included. lew42's own [durable-objects.md](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/imagine/stream/doc/durable-objects.md) covers the rest.

1. **Reconnect is the normal path, not the exception.** Every deploy drops every socket in every room at once. A client must reconnect with backoff and **jitter**, or every tab in the world hits the new build in the same 500 ms. tldraw backs off 500 ms → 2 s when the tab is visible and up to 5 min when it is hidden ([ClientWebSocketAdapter.ts#L405-L436](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/ClientWebSocketAdapter.ts#L405-L436)). lew42's dev socket backs off 250 ms × 2ⁿ ([Socket.js#L88-L109](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/dev/Socket/Socket.js#L88-L109)), without jitter. The room page does not reconnect at all ([room/page.js#L47-L68](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/imagine/platform/local/room/page.js#L47-L68)). Test R8.
2. **In-flight writes are lost on deploy.** That is why client ids and retries (R1, R2) matter more in production than in dev. The Room DO today stores a resent message twice (run in probe I).
3. **Hibernation erases memory, not sockets.** Anything per-session (client id, last acked `n` per client, presence) must be in the attachment or in SQLite. The per-client `n` table belongs in SQLite: `clients(client TEXT PRIMARY KEY, n INTEGER)`, updated in the same `exec` batch as the delta insert.
4. **Pings must not wake the object.** Use `setWebSocketAutoResponse("ping","pong")`. lew42's Room already does ([room.js#L23-L24](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/worker/room.js#L23-L24)). The client must send that exact string, and treat "no pong for 2 intervals" as dead (R9).
5. **Presence wakes the object on every message.** Each presence frame bills a request (at the 20:1 inbound rate) and wakes it. So throttle presence on the client (tldraw: 1 fps alone, 30 fps with others) and batch it with ops in one frame.
6. **The output gate gives "durable before ack" for free.** Write the row, then send the ack and the broadcast in the same handler. No extra await is needed.
7. **Compaction belongs in an alarm, and alarms run at least once.** The fold (snapshot at seq N, delete rows ≤ N, set `base = N+1`) must be idempotent, and must move `base` in the same transaction. Then `hello {since < base}` gets `reset`, not a silent gap (R4).
8. **One object, one location.** A room's latency is set by where the first writer was. This is fine for a page, worth knowing for a shared canvas (from his doc).

---

## 8. Top recommendations, each with a failing test

Ranked by how much data they save, then by cost.

| # | Recommendation | Source | Today |
|---|---|---|---|
| R1 | Give every client op `{client, n}`; dedupe on that, not on `by\|ts`. | Replicache / Zero `lastMutationID`, Durable Streams producers | Two tabs, same ms: second edit silently dropped, sender told "successful" |
| R2 | Retry an op whose socket died; the server applies it exactly once. | Zero `alreadyProcessed`, DS `204` duplicate, DDP method resend | Lost edit; request waits forever |
| R3 | Ack each op with its `seq` (or reject with a reason); hold remote writes to a field with a pending local write until the ack. | tldraw `push_result`, DDP `result`/`updated` | Two tabs end on each other's value, neither matches the file |
| R4 | Each log has `base` + `epoch`; a stale cursor gets `reset`, never bytes from a rewritten file. | tldraw `wipe_all`, Replicache `clear`, DS `410` | Torn or repeated lines after a compaction race or a migration rewrite |
| R5 | Catch-up ends with `ready {seq}`; a stream never silently drops to a one-time fetch. | DDP `ready`, DS `Up-To-Date` | Page opened during a restart never updates again |
| R6 | Broadcast carries `prev`; on `prev ≠ last`, re-subscribe from `last`. | tldraw `serverClock`, Replicache cookie order check | Second reader on one path misses lines, no error |
| R7 | Presence is its own frame, never stored, 15 s refresh / 30 s expiry, `null` on leave. | y-protocols awareness, tldraw presence scope | No presence channel; the obvious place to put it (`page.jsonl`) would log every cursor move |
| R8 | `hello {v, client, since}` / `welcome {v, seq}`; reconnect with backoff + jitter everywhere, including the room page. | DDP `connect/failed`, tldraw `connect`, Zero `PROTOCOL_VERSION` | Room page never reconnects after a deploy |
| R9 | App-level ping every 5 s; reset only on an unanswered ping. | tldraw health check, DDP heartbeat | Half-open socket: tab shows "connected", edits vanish |

Each spec below follows the owner's rule: a real component wherever one can run, and anything mocked is named.

**Harness notes for every spec.**
- **Shape.** Plain Node scripts using `core/Test/Test.js`, like [Tail.test.mjs](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.test.mjs). That means `process.chdir(ROOT)`, `register(site-hooks.mjs)` and a scratch folder under `public/` removed in `finally`.
- **"Real ws server"** means: `http.createServer()` on port 0, then `new SocketServer({ server: { http } })` with `SocketServer.Socket.use(Tail)` and `.use(Append)`, the same wiring as [run.js#L44-L45](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/run.js#L44-L45).
- **"Real tab"** means: the real `public/framework/dev/Socket/Socket.js`, with `globalThis.location` pointing at that port. It needs:
  - a three-line DOM shim (`window`, `sessionStorage`, a `document` stub) for its reconnect strip;
  - the `ws` package as `WebSocket`, because Node 22's built-in WebSocket fires `error` but never `close` on a refused connect, so `Socket.js` would never retry;
  - a stand-in for `ext/filesystem/FsFile.js`, which needs a DOM to import, that makes the same one RPC `FsFile.send` makes ([FsFile.js#L156-L166](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/filesystem/FsFile.js#L156-L166)).
- **"Two tabs"** means two `worker_threads`, each with its own module graph, its own `Socket.js` singleton over its own real connection, and its own `Item` + `Store`.
- **The file watcher** is the one thing every spec calls by hand: `Tail.changed(FILE)` stands in for chokidar's `change` event, so the test controls when it fires (the existing Tail tests do the same).

### R1. Give every write a client id and counter, and dedupe on that, not on `by|ts`

- **Name:** `Server/plugins/SocketServer/Append.twin.test.mjs`. Checks: "two different tabs' edits are both written, even when they carry the same `by` and `ts`".
- **Setup (real):** the real `Append` handler on two server-side sockets; a real `public/<scratch>/page.jsonl`; the real `RecordWriter.fresh` check that `Append.js` calls. Nothing mocked.
- **Steps:**
  1. Tab A appends `[{add:{id:"c1",title:"from A"}, by:"owner", ts:"2026-10-30T10:00:00.123Z"}]`.
  2. Tab B appends `[{add:{id:"c2",title:"from B"}, by:"owner", ts:"2026-10-30T10:00:00.123Z"}]`.
- **Expected:** both lines are in the file. If the server refuses a line, it says so to that tab.
- **Today:** the file has one line. Tab B's edit is gone and tab B's reply is `"append successful"` (run in probe A). Cause: the twin key is `` `${l.by}|${l.ts}` `` ([RecordWriter.js#L71-L75](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L71-L75)), and `by` is "owner" for every tab ([Store.js#L205](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L205), [RecordWriter.js#L44](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L44)), while `ts` is unique only inside one tab's `stamp()` ([RecordWriter.js#L33-L38](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L33-L38)). The same key is used at the Servex door ([page_tools.js#L1101-L1106](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L1101-L1106)).
- **Honesty check:** this is real, but rare. It needs two tabs (or a tab and a phone) on one record, both stamping the same millisecond. The odds grow with an AI agent and the owner editing the same session, which is the stated goal. The test hand-sets equal `ts` to make it deterministic. That is a legitimate way to stage a real race, not an invented state. **Edge cases:**
  - a third tab writing the same `ts` an hour later, after the first line has fallen out of the 64 KB tail: it is accepted today, by luck;
  - a retry of the same `{client, n}` must still be skipped, which is R2.
- **Fix shape:** the server keeps `last[client]`. It skips `n ≤ last`, refuses `n > last+1` with `reject {why:"gap", expected}`, and appends `n == last+1`. Rebuild `last` from the file on boot (dev) or keep it in a `clients` table (DO).

### R2. A write whose socket died is retried, and lands exactly once

- **Name:** `public/framework/core/Item/Store.retry.test.mjs`. Checks: "an edit sent just before the dev server restarts reaches the file exactly once after reconnect".
- **Setup (real):** a real ws server (Tail + Append); a real tab (`Socket.js` over `ws`); a real `Item` with a real `Store` opened live; a real `page.jsonl`. **The one staged fault:** a tiny plugin registered before `Append` that, for the first append, calls `ws.terminate()` and throws. That is the real socket closed after the frame reached the server and before the write, which is what a restart mid-edit does. **Mocked:** the FsFile stand-in (needs a DOM). A second variant kills the socket after the write and before the reply.
- **Steps:**
  1. `item.set({title:"T1"})`.
  2. The server socket dies.
  3. The tab reconnects on its own (backoff).
  4. Wait up to 5 s.
- **Expected:** the file has exactly one `{"set":{"title":"T1"}}` line. In the variant where the write landed but the ack was lost, the retry is recognised and the file still has exactly one line.
- **Today:** the file has no line, and the tab's `request()` slot never resolves (run in probe E: "NEVER ANSWERED", file `{"n":1}` only). Cause:
  - the reply is matched only by array index, and nothing re-sends on reconnect ([Socket.js#L346-L355](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/dev/Socket/Socket.js#L346-L355));
  - `Store.flush` has already put the line in `sent` and moved on ([Store.js#L193-L199](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L193-L199)).

  Only `stream.js` races a timer, and then it only warns ([stream.js#L170-L178](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/imagine/stream/stream.js#L170-L178)). (A write sent *while* the socket is already down is fine today: `send()` parks on `ready` and goes out after reconnect. Probe D confirmed that, so the spec does not test it.)
- **Honesty check:** real. The dev server restarts on every server-code change (the reconnect strip says "server restarting…"), and on a DO every deploy does this. The lost-ack variant is just as real and is the one that makes a naive retry write twice. **Edge cases:**
  - a `move` retried after its ack was lost must not move twice;
  - a refused op must not be retried forever (R1's `reject`);
  - the page reloads with a pending op: either persist pending ops per tab (Replicache does) or accept the loss and say so in the UI.
- **Fix shape:** the Store keeps `pending = [{client, n, line}]` until `ack {n}`. On `welcome`, it re-sends every pending op in order, and the server's R1 check skips the ones it already has.

### R3. Tell the writer what actually happened to its write

- **Name:** `public/framework/core/Item/Store.converge.test.mjs`. Checks: "two tabs that set the same field at the same time end with the same value, and it is the value a fresh load gives".
- **Setup (real):** a real ws server (Tail + Append); two real tabs (two worker threads, each its own `Socket.js` connection, `Item`, `Store` opened live); a real `page.jsonl`. **Mocked:** the FsFile stand-in; the watcher (`Tail.changed` called once after both lines are on disk, the moment chokidar's single event would fire).
- **Steps:**
  1. Tab A runs `item.set({title:"from A"})` and its line is on disk.
  2. Tab B runs `item.set({title:"from B"})` and its line is on disk.
  3. The watcher fires.
  4. Wait 300 ms.
  5. Read both tabs' titles, and a fresh replay of the file.
- **Expected:** all three say `"from B"`, the last line in the file.
- **Today:** tab A says `"from B"`, tab B says `"from A"`, and a fresh load says `"from B"`. The tabs disagree with each other and with the file, and stay that way until reload (run in probe C2). Cause:
  - each tab applies its own write at once and then drops its own echo ([Store.js#L103-L130](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L103-L130));
  - so tab B applies A's older line *after* its own newer one;
  - the reply carries no position to order against ([Append.js#L105](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.js#L105)).
- **Honesty check:** real, and the core multi-user case: two people (or a person and an agent) editing the same title. The test controls only *when* the watcher fires; both writes and both deliveries are the real code. **Edge cases:**
  - three writers;
  - a `set` of a different field must still apply at once (do not hold everything);
  - a list `move` racing a `remove` of the same member.
- **Fix shape:**
  - The server answers `ack {client, n, seq}` and broadcasts `op {seq, client, n, line}` to the others only.
  - The tab keeps a `pending[field] = n`. A remote `op` that touches a pending field is held until the ack.
  - On the ack, apply held ops with `seq > ack.seq`. A held op with `seq < ack.seq` has already been overwritten by our own write.

  This is tldraw's rebase, cut down to last-write-wins per field.

### R4. Say "start over" when the log was rewritten

- **Name:** `Server/plugins/SocketServer/Tail.rewrite.test.mjs`. Checks: "a reader whose cursor points into a rewritten log is told to reset; it is never sent bytes from the middle of a line".
- **Setup (real):** the real `Tail` and `Append` handlers; a real `public/<scratch>/wire.jsonl` (case A) and `page.jsonl` (case B). Case B runs the exact write that `Server/page-files-migrate.mjs` makes. **Mocked:** the watcher, as above.
- **Steps, case A (compaction racing an edit):**
  1. A reader subscribes at the end of a 3-line log (offset 240).
  2. Tab 1's `clear()` truncates the log ([stream.js#L206-L210](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/imagine/stream/stream.js#L206-L210)).
  3. Tab 2's longer edit is appended before the watcher runs.
  4. One `change` event fires.
- **Steps, case B (a migration merges an old log into a live one):**
  1. A reader subscribes at the end of a 1-line `page.jsonl`.
  2. The file is rewritten as `old lines + newer`, the migration's own write ([page-files-migrate.mjs#L83-L88](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/page-files-migrate.mjs#L83-L88)).
  3. One `change` event fires.
- **Expected:** in both cases the reader gets `jsonl_reset` (later `reset`) and re-reads the file. It is never sent a line fragment, and it ends with every line the file holds.
- **Today:**
  - **Case A:** the reader gets the torn fragment `ted, "}` as a "line" (run in probe G). Cause: the reset fires only when `size < from` ([Tail.js#L54-L57](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L54-L57)), and nothing tells a rewrite from an append.
  - **Case B:** the reader gets the fragment `og file"}}}` as its first "line", then the old lines `o2` and `o3` a second time as if they were new, and never `o1` (run in probe M). Same cause.
- **Honesty check:**
  - **Case A** is real but needs two windows and a compaction in the same chokidar tick. `compact()` is a button today, so it is rare. It becomes common once compaction runs in a DO alarm.
  - **Case B** is real whenever a migration runs while a tab has that page open. Migrations are one-off scripts, so it is occasional.
  - **Dropped:** a `git merge` with `merge=union` (this repo's `.gitattributes`; [merge.mjs#L333-L339](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/merge.mjs#L333-L339)) was also tried (probe F). It came out right: union keeps the main tree's lines first, so the live tab's offset still pointed at a line boundary. It is not a failing case, so it is not in the spec.

  Do not weaken case A to "no torn line": the reader must also end with every line. **Edge cases:** a rewrite to *exactly* the old size (the mtime changes, the size does not); a rename-over (`fs.renameSync`) rather than an in-place write.
- **Fix shape:**
  - **Dev:** keep the file's first line hash (or inode + birthtime) next to each socket's offset, and send `reset` when it changes; better, give each log an `epoch` line or sidecar that rewriters bump.
  - **DO:** `base` and `epoch` columns in `meta`, moved in the same transaction as the fold.

### R5. Catch-up ends with an explicit `ready`, and a stream never quietly goes static

- **Name:** `public/framework/ext/JSONL/live.restart.test.mjs`. Checks: "a page that opens its live log while the dev server is restarting still receives lines appended after the server is back".
- **Setup (real):** a real ws server (Tail); a real tab (`Socket.js` over `ws`); the real `live.js` `stream()`; a real `.jsonl`. The restart is real: the HTTP server is closed and listened again on the same port. **Mocked:** `fetch` (the static fallback read) returns the file from disk, because the probe has no static file server; the watcher.
- **Steps:**
  1. Stop the server.
  2. Open `stream(reader)`.
  3. Wait 2.2 s (past the 1.5 s `WAIT`).
  4. Start the server and wait for the tab to reconnect.
  5. Append `{n:2}` and fire the watcher.
- **Expected:** the reader has `[1, 2]`.
- **Today:** the reader has `[1]`, and the socket is connected (run in probe H). Cause: the 1.5 s timer removes the reader from `streams` for good and falls back to a one-time `load()` ([live.js#L124-L129](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L124-L129)), so the reconnect's re-subscribe skips it ([live.js#L71-L74](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L71-L74)). That code's own comment names this as the "needs a reload" bug of 2026-09-19 ([Tail.js#L22-L40](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L22-L40)). That bug's other cause was fixed. This one remains.
- **Honesty check:** real. The dev server restarts on every server-code change, and the owner opens pages all the time. On a DO, "opened during a deploy" is the same state. **Edge cases:**
  - the server answers but slower than 1.5 s (a cold boot), and the late `jsonl` frame must still land once;
  - a server that predates `ready` (keep the fallback, but keep the reader registered too).
- **Fix shape:** keep the reader registered whatever the timer does, and treat the timer only as "show what the static file says meanwhile". The server ends every catch-up with `ready {seq}` (DDP `ready`, DS `Up-To-Date`), so the client never has to guess.

### R6. Detect a gap and ask again; never apply across it

- **Name:** `public/framework/ext/JSONL/live.gap.test.mjs`. Checks: "a second reader of a path that is already live ends with every line".
- **Setup (real):** the real `Tail` and real `live.js` on one tab, both ends in process with frames **queued** so the test controls arrival order (the pattern of [Tail.test.mjs#L51-L66](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.test.mjs#L51-L66)); a real `.jsonl`. **Mocked:** the socket transport (the queue), so the order is deterministic.
- **Steps:**
  1. Lines 1–2 exist, and reader 1 is live at their end.
  2. Reader 2 (a board card on the same log) calls `stream()`. Its subscribe-from-0 is queued.
  3. Line 3 is appended and the watcher fires. The live frame (`from` = reader 1's offset) is delivered first.
  4. Reader 2's subscribe is handled.
- **Expected:** reader 2 has `[1, 2, 3]`.
- **Today:** reader 2 has `[3]` (run in probe K). Cause:
  - the live frame starts past reader 2's offset 0, and `jsonl()` applies it anyway, then moves reader 2's offset to the end ([live.js#L41-L46](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L41-L46));
  - the later catch-up frame then looks old and is skipped.
- **Honesty check:** plausible. It needs the server to fire a live frame for the path in the round-trip window of the second subscribe. On a busy log (an agent session streaming lines) with a card and a page open, that window is real, but the test forces the order. The real fix also covers a dropped frame on a DO. **Edge cases:** the frame `from > offset` must trigger a re-subscribe from the reader's own offset, not be dropped silently.
- **Fix shape:** every broadcast carries `seq` and `prev`. A reader applies only `prev == last`, ignores `seq ≤ last`, and on `prev > last` asks `sub {since: last}` again.

### R7. Presence is its own throwaway channel

- **Name:** `worker/room.presence.test.mjs`. Checks: "a cursor update reaches the other sockets and is never stored; a tab silent for 30 s disappears".
- **Setup:** the real `Room` class from `worker/room.js`. **Mocked:** the DO runtime, because workerd/Miniflare is not installed in this environment. That means `ctx.storage.sql` backed by `node:sqlite` (the same SQLite engine a DO uses), `ctx.getWebSockets()` as an array, and fake sockets that record `send`, `serializeAttachment` and `deserializeAttachment`. When run on the owner's machine, the same steps should run under `wrangler dev` with two real WebSockets instead.
- **Steps:**
  1. Two sockets join.
  2. Alice sends `{type:"presence", clock:1, state:{cursor:[10,20]}}`.
  3. Advance a fake clock 31 s with no refresh.
  4. Bob reconnects.
- **Expected:** Bob gets the presence frame. `SELECT COUNT(*) FROM deltas` is still 0. After 31 s Alice's entry is gone (a `presence {state:null}` goes out). Bob's `welcome` holds only live entries.
- **Today:** the frame is dropped (it has no `text`, [room.js#L64-L66](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/worker/room.js#L64-L66)), so nothing reaches Bob. A presence frame with `text` would be **stored** in `deltas`. On the dev wire, `presence` is an unknown method, so the request never gets an answer (probe H).
- **Honesty check:** this is a missing feature, not a bug, so "fails today" means "is not built". That is honest as long as the spec says so. It is included because the obvious quick fix (put cursors in the log) is the one every protocol here avoids. **Edge cases:**
  - hibernation: presence must live in each socket's attachment and be rebuilt from `getWebSockets()` on wake;
  - a peer claiming another's `client` id: the server sets `client` from the socket, never from the frame;
  - throttle (1 fps alone, 30 fps with others).

### R8. A version handshake, and reconnect with backoff everywhere

- **Name:** `public/imagine/platform/local/room/room.reconnect.test.mjs`. Checks: "after every socket is dropped (a deploy), the room page reconnects, sends its last id, and shows the message posted while it was away".
- **Setup (real):** the real room `page.js` (its `connect()`); a real `ws` server that speaks the Room's frames, including `?since=` catch-up ([room.js#L38-L43](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/worker/room.js#L38-L43)). **Mocked:** `/app.js` (the view layer needs a DOM), with a stub `Page` that keeps the options; the Durable Object, which is played by the ws server because workerd is not installed here.
- **Steps:**
  1. Connect.
  2. Bob posts "before".
  3. Terminate every server socket.
  4. Bob posts "while away".
  5. Wait 3 s.
- **Expected:** a second connect with `since=1`. The page shows both messages. A `hello {v}` that the server does not support gets `reject {why:"client-too-old"}` and the page asks for a reload.
- **Today:** one connect only. The page shows `["before"]` and still says "connected as alice" (run in probe J). Cause: the `close` listener only handles "never opened" ([room/page.js#L65-L67](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/imagine/platform/local/room/page.js#L65-L67)), and the page never stores its last id. A second gap: the dev `Socket.js` backoff has no jitter ([Socket.js#L106-L108](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/dev/Socket/Socket.js#L106-L108)). That is harmless with one machine, but a thundering herd after a production deploy. Assert spread, not exact delays.
- **Honesty check:** real, and certain in production: "Deploying a new version restarts every Durable Object, which disconnects any existing connections" ([Cloudflare](https://developers.cloudflare.com/durable-objects/reference/websockets/)). **Edge cases:**
  - a reconnect that lands on an object still booting;
  - a tab hidden during the deploy (back off longer, as tldraw does, then reconnect on `visibilitychange`).

### R9. Notice a half-open socket

- **Name:** `public/framework/dev/Socket/Socket.halfopen.test.mjs`. Checks: "when the server stops answering without closing, the tab notices within ~10 s, reconnects, and re-sends its pending ops".
- **Setup (real):** a real ws server (Append); a real tab (`Socket.js` over `ws`). The half-open state is staged on the real server socket with `ws._socket.pause()`: bytes go in and nothing comes back, with no FIN. Nothing is mocked on the client.
- **Steps:**
  1. Pause the server's TCP socket.
  2. Send an append.
  3. Wait 12 s.
- **Expected:** the tab has reset the connection (`connected` became false and then true again). The append is re-sent (R2) and answered.
- **Today:** after 12 s the tab still says `connected = true`, and the append is unanswered (run in probe L). The dev wire has no ping at all.
- **Honesty check:** real: laptop sleep and resume, a wifi switch, a phone on the LAN (which this server accepts), a proxy that drops idle connections. The pause is a faithful stand-in. **Edge cases:**
  - a hidden tab whose own timers are throttled must not reset itself just for being quiet. Only an *unanswered ping* counts, as in tldraw ([TLSyncClient.ts#L645-L655](https://github.com/tldraw/tldraw/blob/38e6c84dcaebee164aeeb961113f14e1a317e6ea/packages/sync-core/src/lib/TLSyncClient.ts#L645-L655));
  - on a DO, the ping must be the exact auto-response string, so it never wakes the object.

---

## 9. Proposed message vocabulary

One WebSocket per tab, JSON frames, one `type` field per frame. Unknown fields are ignored (DDP rule). Several frames can be batched as `{type:"batch", frames:[…]}` (tldraw's `data`). Seven message types cover connect and catch-up, client ops, broadcast, ack and reject, and presence.

| type | dir | fields | from |
|---|---|---|---|
| `hello` | c → s | `v`, `client`, `room`, `since?`, `epoch?` | tldraw `connect`, DDP `connect` |
| `welcome` | s → c | `v`, `seq`, `epoch`, `base`, `presence[]` | tldraw `connect` |
| `reset` | s → c | `seq`, `epoch`, `base`, `snapshot` (or `snapshot_url`) | tldraw `wipe_all`, Replicache `clear`, DS `410` |
| `ready` | s → c | `seq` | DDP `ready`, DS `Up-To-Date` |
| `op` | c → s | `client`, `n`, `line` (or `lines[]`) | Replicache mutation, tldraw `push` |
| `op` | s → c | `seq`, `prev`, `client`, `n`, `by`, `at`, `line` | tldraw `patch` |
| `ack` | s → c | `client`, `n`, `seq` | tldraw `commit`, Zero push result |
| `reject` | s → c | `client`, `n?`, `why`, `expected?` | tldraw `discard`, Zero `alreadyProcessed`, DDP `error` |
| `presence` | both | `client`, `clock`, `state` (`null` = left) | y-protocols awareness |
| `ping` / `pong` | both | none (the exact strings, so a DO can auto-respond) | tldraw, DDP |

**Rules.**
1. **The server sets `seq`, `by` and `at`. The client sets `client` and `n`.** `client` is a fresh id per page load, which works like an epoch. `n` starts at 1 and goes up by one per op.
2. **The server checks each op's `n` against `last[client]`, in the same step as the write:**
   - `n ≤ last`: re-send the old `ack`; nothing is written.
   - `n == last+1`: write it, then `ack`.
   - `n > last+1`: `reject {why:"gap", expected}`.
   - A refused op still advances `last` and answers `reject {why}`, so it is never retried.
3. **The sender gets `ack`, not an echo.** Everyone else gets `op`.
4. **Cursors:**
   - `hello.since < base` → `reset`.
   - `hello.epoch ≠ epoch` → `reset`.
   - Otherwise, every `op` with `seq > since`, then `ready`.
5. **Presence is never written to the log.** The server relays it and expires it after 30 s without a refresh.
6. **Errors.** `hello.v` unsupported → `reject {why:"client-too-old"|"server-too-old"}` and close. Unknown `type` → `reject {why:"unknown-type"}`, never silence.

**What a line on disk becomes.** The JSONL line keeps its shape. The server only wraps it with `seq` and meta keys that replay already strips (`by`, `ts`, [Item.js#L468-L475](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L468-L475)). On the dev server, add `seq` as another stripped key. On a DO, `seq` is the row id.

**Examples.**

```json
{"type":"hello","v":1,"client":"t-7f3a","room":"/framework/x/page.jsonl","since":41,"epoch":"e2"}
{"type":"welcome","v":1,"seq":44,"epoch":"e2","base":1,"presence":[{"client":"t-19bc","clock":7,"state":{"name":"Mike","cursor":[220,64]}}]}
{"type":"op","seq":42,"prev":41,"client":"t-19bc","n":12,"by":"mike","at":"2026-10-30T10:00:01.002Z","line":{"set":{"title":"Plan"}}}
{"type":"op","seq":43,"prev":42,"client":"agent-3","n":5,"by":"agent","at":"2026-10-30T10:00:01.050Z","line":{"content":{"add":{"id":"p9","text":"Draft"}}}}
{"type":"op","seq":44,"prev":43,"client":"t-19bc","n":13,"by":"mike","at":"2026-10-30T10:00:02.400Z","line":{"content":{"move":{"id":"p9","after":null}}}}
{"type":"ready","seq":44}

{"type":"op","client":"t-7f3a","n":1,"lines":[{"set":{"title":"Plan v2"}},{"content":{"p9":{"set":{"text":"Draft 2"}}}}]}
{"type":"ack","client":"t-7f3a","n":1,"seq":46}
{"type":"op","client":"t-7f3a","n":1,"lines":[{"set":{"title":"Plan v2"}}]}
{"type":"ack","client":"t-7f3a","n":1,"seq":46}
{"type":"op","client":"t-7f3a","n":3,"line":{"set":{"x":1}}}
{"type":"reject","client":"t-7f3a","n":3,"why":"gap","expected":2}
{"type":"op","client":"t-7f3a","n":2,"line":{"title":"no verb"}}
{"type":"reject","client":"t-7f3a","n":2,"why":"page.jsonl is a page's log: each line is ONE object with ONE verb as its key"}

{"type":"hello","v":1,"client":"t-a001","room":"/framework/x/page.jsonl","since":3,"epoch":"e1"}
{"type":"reset","seq":46,"epoch":"e2","base":40,"snapshot_url":"/framework/x/page.json"}

{"type":"presence","client":"t-7f3a","clock":8,"state":{"name":"Ana","cursor":[300,90],"selection":["p9"]}}
{"type":"presence","client":"t-7f3a","clock":9,"state":null}
{"type":"hello","v":0,"client":"t-old","room":"/framework/x/page.jsonl"}
{"type":"reject","why":"client-too-old"}
"ping"
"pong"
```

The second `op` with `n:1` above is a retry after a lost ack. It gets the same `ack` and nothing is written (R2). On the dev server, the same vocabulary can sit beside today's `{method,args}` frames: `hello`, `op` and `presence` become three new `rpc:` handlers, and `jsonl` frames gain `seq` and `prev`. Nothing else has to move at once.

---

## Appendix A: how the "today" results were checked

Each "today" result above was run, not inferred. The probe scripts are in this session's scratchpad, `/tmp/claude-0/-home-claude/e3fd9043-ad4b-5d36-9e28-17f46c3e0b52/scratchpad/probe/`, and import lew42's real modules from `/home/claude/lew42/data-shapes-2` read-only. They write only to a scratch `public/` inside the probe folder.

| Probe | Spec | What it ran | Result |
|---|---|---|---|
| `probe-ab.mjs` (A) | R1 | real `Append` + `RecordWriter.fresh`, two tabs, same `by`/`ts` | 1 line written, both told "append successful" |
| `probe-e.mjs` | R2 | real ws server + real `Socket.js` (`ws` client), socket terminated before the write | request never answered, file missing the line |
| `probe-d.mjs` | R2 (control) | same, but the append is sent while the server is down | parked, sent after reconnect, written once (works) |
| `probe-c2.mjs` | R3 | two worker-thread tabs, real `Item`/`Store`/`Socket.js` over real ws | tab A "from B", tab B "from A", file "from B" |
| `probe-g.mjs` | R4 A | real `Tail` + `Append`, truncate then a longer append, one change event | reader gets a torn fragment, no reset |
| `probe-m.mjs` | R4 B | real `Tail`, the migration's exact rewrite (`old + newer`) of a tailed `page.jsonl` | reader gets a fragment and two repeated lines, misses one |
| `probe-f.mjs` | R4 (dropped) | real `git merge` with `merge=union` on a tailed `page.jsonl` | correct: union keeps the main side first, so the offset still lands on a line boundary; not a failing case |
| `probe-h.mjs` | R5 | real ws server stopped and restarted, real `live.js` `stream()` | reader stays at `[1]` while connected |
| `probe-k.mjs` | R6 | real `Tail` + real `live.js`, queued frames | second reader gets `[3]`, misses 1–2 |
| `probe-i.mjs` | R2/R7 (DO) | real `Room` class, `node:sqlite` stand-in for DO storage | a resent message is stored twice |
| `probe-j.mjs` | R8 | real room `page.js` vs a `ws` server playing the Room | one connect only, message missed, status still "connected" |
| `probe-l.mjs` | R9 | real ws server, server TCP socket paused | tab says connected after 12 s; append unanswered |

Mocks used by the probes, and why:
- **`hooks.mjs`:** maps `ws` to a global install and stubs `Server/plugins/MCP.js`, because the repo's `node_modules` (`ws`, `express`) is not installed in this sandbox.
- **`fsfile-stub.mjs`** replaces `FsFile`, whose import chain needs a DOM. It makes the same RPC.
- **`app-stub.mjs`** replaces `/app.js` for the room page.
- **`dom.mjs`** provides minimal `window`, `document` and `sessionStorage`, and the `ws` client as `WebSocket`. Node 22's own WebSocket never fires `close` on a refused connect, so `Socket.js` would never retry under it. That is an artefact of Node, not a lew42 bug.
- **`do-ctx.mjs`** stands in for the Durable Object runtime with `node:sqlite`.

On the owner's machine, with `npm install` done, the specs need only the DOM shim and the two stubs.
