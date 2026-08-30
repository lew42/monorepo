# Durable Objects — what this becomes in production

The dev server's real job is not watching files. It is **deciding what order edits happened
in**. Everything else here — the snapshot, the log, the offset, the replay — works because
one process saw every append in one order.

Production is static hosting, so that job needs an owner. On Cloudflare there is exactly one
thing that does it: a **Durable Object**, which is single-threaded by construction — one
object, one order, no locks.

*Everything below was fetched from `developers.cloudflare.com` on 2026-08-30 and is cited.
Prices and limits move; re-check before spending on them.*

## The shape

**One DO per page url.** `env.PAGES.getByName(pathname)` — never one object for the site,
which the docs name as the anti-pattern ("never route all traffic through one Durable Object
instance", [rules-of-durable-objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)).

| here (dev) | there (a DO) |
|---|---|
| `page.jsonl`, appended | a SQLite table, one row per delta, `INTEGER PRIMARY KEY` as the id |
| `page.json`, the snapshot | a `snapshot` row, rewritten by a compaction alarm |
| chokidar sees the append | the DO *is* the writer — there is nothing to watch |
| `Tail` pushes to subscribers | `for (const ws of ctx.getWebSockets()) ws.send(line)` |
| the byte offset a client resumes from | the last row id, in `ws.serializeAttachment()` |
| `rpc:write` / `rpc:append` | one WebSocket message in, one broadcast out |

**Fan-out is a loop.** There is no broadcast primitive — you iterate `ctx.getWebSockets()`
(or your own map) and `send()` each ([websocket-hibernation-server](https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/)).

**Use the Hibernation API, not `ws.accept()`.** `ctx.acceptWebSocket(ws)` plus the class
methods `webSocketMessage` / `webSocketClose` / `webSocketError` lets the runtime evict the
object **while the sockets stay connected** — and *"Billable Duration (GB-s) charges do not
accrue during hibernation"* ([websockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)).
A page nobody is editing costs nothing but storage. The plain `addEventListener("message")`
form pins the object in memory and bills the whole time it is connected; Cloudflare's own
worked example puts the difference at **$20.65/mo vs ~$142/mo** for 100 objects × 100 sockets
([pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)).

Two consequences of hibernation, and both are load-bearing:

- **In-memory state is destroyed.** Rebuild any session map in the constructor from
  `ctx.getWebSockets()` + `ws.deserializeAttachment()`, or a woken object broadcasts to
  nobody. The attachment is structured-clone, **16,384 bytes max** — so keep it one integer.
- **Keepalives must not wake it.** `ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"))`
  answers pings without a wake-up; a ping routed through `webSocketMessage` reinstates
  duration billing on every heartbeat.

## What the framework's client swaps

**One url, and nothing else** — if the contract holds. `ext/JSONL`'s wire is already
subscribe-with-an-offset, receive-batches-of-lines, replay-through-`read()`, re-subscribe-on-reset.
That is the same protocol a DO speaks. The change is in `dev/Socket/Socket.js`: point the
WebSocket at the DO's url instead of `window.location.host`, and swap the byte `offset` for a
row id. `Stream`, `JSONL`, `live.js` and every page above them are untouched.

## The numbers

| | |
|---|---|
| Requests | 1M/mo included, then **$0.15/M**. **WebSocket messages bill 20:1** — 100 inbound messages = 5 requests. Outbound messages and protocol pings are free. |
| Duration | 400,000 GB-s/mo included, then **$12.50/M GB-s**, metered at a fixed 128 MB. Hibernating time is not billed. |
| SQLite rows | 25B read / 50M written per month included, then **$0.001/M** read and **$1.00/M** written. |
| Storage | 5 GB-mo included, then **$0.20/GB-month**. |
| Free plan | **Yes**, SQLite-backed classes only: 100k requests/day, 13,000 GB-s/day, 5 GB. |
| Paid | Workers Paid is **$5/mo minimum** and covers Workers, Pages Functions, KV and DO usage. |

[pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) (page dated
2026-08-25), [workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

**A page like these three costs nothing measurable.** A viewer that never edits sends zero
messages; the object hibernates 10 seconds after the last edit and bills only storage.

## The limits

- **32,768 WebSocket connections per object** — "CPU and memory usage of a given workload may
  further limit the practical number" ([api/state](https://developers.cloudflare.com/durable-objects/api/state/)).
  ⚠ This number is not on the limits page and may be stale.
- **~1,000 requests/sec** per individual object before an `overloaded` error. One presenter
  and a room of readers is nowhere near it; a shared canvas with 500 writers is.
- **10 GB storage per object**, 2 MB per row, 32 MiB per received message.
- **CPU 30 s per request** (raisable to 5 min); wall clock unlimited while I/O is in flight.
- **Unlimited objects**; 500 classes per account (100 free).
- [limits](https://developers.cloudflare.com/durable-objects/platform/limits/) (dated 2026-06-01).
  ⚠ That page contradicts itself on the free storage cap — 5 GB in the table, 1 GB in the FAQ.

## Durability, and the log

`ctx.storage.sql.exec()` is the SQLite backend
([sql-storage](https://developers.cloudflare.com/durable-objects/api/sql-storage/)). The
guarantee that matters for an append log is the **output gate**: *"the system will pause
outgoing network messages from the Durable Object until all previous writes have been
confirmed flushed to disk"* — so **the delta is durable before the broadcast leaves**, and
there is no window where a viewer has a line the object would lose
([storage-api](https://developers.cloudflare.com/durable-objects/api/storage-api/)).

Compaction — fold the log into the snapshot — belongs in `alarm()`. ⚠ Alarms are
**at-least-once** and retry up to 6 times, so the handler must be idempotent
([alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)). **There is no
documented append-log-plus-snapshot pattern in Cloudflare's docs.** The pieces are blessed;
this shape is ours.

Point-in-time recovery covers the last **30 days** — `getBookmarkForTime()` restores the
whole page to a moment, which is version history for free
([sqlite-storage-api](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)).

## Local dev

`wrangler dev` runs on Miniflare, which is `workerd` — the production runtime. **Durable
Objects always run locally** and cannot be marked remote; **no paid account is needed**
([local-development](https://developers.cloudflare.com/workers/development-testing/local-development/)).
`--persist-to <dir>` chooses where local state lives. ⚠ Whether it persists across a restart
by default is **unverified** — pass `--persist-to` and be sure.

```jsonc /wrangler.jsonc
{
  "durable_objects": { "bindings": [{ "name": "PAGES", "class_name": "PageStream" }] },
  "exports": { "PageStream": { "type": "durable-object", "storage": "sqlite" } }
}
```

The `exports` field supersedes `migrations`; the legacy form is
`"migrations": [{ "tag": "v1", "new_sqlite_classes": ["PageStream"] }]`. **Storage type is
immutable once a namespace exists** — pick SQLite
([migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)).

## Is a DO actually required?

**Yes, for many readers.** A plain Worker gets one `WebSocketPair` and shares nothing: *"If
your application needs to coordinate among multiple WebSocket connections… you will need
clients to send messages to a single-point-of-coordination"*
([websockets](https://developers.cloudflare.com/workers/runtime-apis/websockets/)).

- **Pub/Sub is gone** — every `developers.cloudflare.com/pub-sub/*` url 404s. (The retirement
  *date* I could not verify from Cloudflare; the 404s are verified.)
- **PartyKit is Cloudflare's** (acquired 2024, now `github.com/cloudflare/partykit`) and
  `partyserver` is a DO wrapper, not an alternative.
- **`@cloudflare/actors`** is Cloudflare's own SDK over DOs, in beta, and intended to become
  "the recommended way to build on Durable Objects" — still a DO underneath.

Polling a static `page.jsonl` on a CDN is the honest no-DO fallback: no fan-out, seconds of
latency instead of milliseconds, and it costs nothing. For a live presentation that is not
enough; for a page that changes hourly it is plenty.

## The gotchas that would bite this design

1. **A deploy disconnects everyone.** Every push restarts all instances and drops all sockets.
   Resume-from-offset is the *normal* path here, not the exceptional one — which is the one
   thing this design already has, because a reload has always had to work.
2. **Rebuild sessions in the constructor**, or a woken object silently broadcasts to nobody.
3. **A byte offset is the wrong cursor.** Use the row id, and keep it in the attachment.
4. **Don't hold a SQL cursor across an `await`** while replaying — you lose snapshot isolation.
5. **Batch several deltas into one message.** 20:1 request billing is on *inbound* messages,
   and the docs recommend batching anyway. `Stream.push()` already writes a batch per edit.
6. **An object never moves after creation** — the first writer's geography sets latency for
   every later reader.

## What this does not solve

The same thing the local version does not solve: **two people editing the same field.** A DO
gives a total order, which makes last-writer-win *correct* rather than *arbitrary* — it does
not merge. Merging is a CRDT or an OT layer above the log, and neither is here. See
[`decisions.md`](./decisions.md).
