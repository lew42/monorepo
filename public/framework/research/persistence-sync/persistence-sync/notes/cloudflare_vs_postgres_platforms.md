# Cloudflare's Developer Platform as the Full Back End for a Real-Time Collaborative App, Compared with Supabase, Neon, Turso, PlanetScale, Fly.io, PocketBase and Firebase (as of October 2026)

All pages were accessed 2026-10-29. Where a pricing or docs page shows a "last updated" date, it is given inline. Unless marked otherwise, all prices are USD and come from first-party pricing pages.

## 1. Durable Objects (DOs): SQLite storage, pricing, WebSocket Hibernation, alarms, PITR, placement and throughput

### Takeaway
On the paid plan, each SQLite-backed DO holds 10 GB, and you can create an unlimited number of them. Billing is per request (WebSocket messages count 20:1), per GB-s of duration, per row read or written, and per GB-month stored. When the WebSocket Hibernation API is used correctly, idle connected rooms cost nothing in duration. That makes "one DO per document/room/channel" the native Cloudflare pattern for this app. The main cost traps are writing too many rows and keeping objects awake (game tick loops, timers, alarm loops). Spending can be alerted on but not hard-capped.

### Cited Findings
**Storage limits (SQLite backend)**
- Storage per object is 10 GB on Workers Paid. The number of objects is unlimited per account and per class. Storage per account is unlimited on Paid and 5 GB on Free. Accounts get 500 DO classes on Paid and 100 on Free. — [DO Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- The FAQ puts the Free-plan per-object limit at 1 GB (Paid: 10 GB, no account-wide limit). An empty SQLite DB takes about 12 KB. At the limit, writes fail with `SQLITE_FULL`, but reads and deletes still work. — [DO FAQ](https://developers.cloudflare.com/durable-objects/reference/faq/)
- SQL limits: 100 columns per table, max string/BLOB/row of 2 MB, SQL statements up to 100 KB, 100 bound parameters, and a 2 MB key+value maximum. — [DO Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- A received WebSocket message can be up to 32 MiB (raised from 1 MiB on 2025-10-31). CPU per request is 30 s by default and can be raised to 5 minutes with `limits.cpu_ms`. Each request can hold 6 simultaneous outgoing connections. — [DO Limits](https://developers.cloudflare.com/durable-objects/platform/limits/); [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)
- The memory limit is 128 MB per isolate (a Jun 30, 2026 memory chart shows P50–P999 against "the 128 MB limit"). — [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)
- From Jul 9, 2026, new namespaces must use SQLite. Accounts that do not already have a KV-backed namespace can no longer create one. — [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)

**Pricing (page last updated Oct 18, 2026)**
- Requests: Free 100,000/day. Paid includes 1M/month, then $0.15 per million. — [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- Duration: Free 13,000 GB-s/day. Paid includes 400,000 GB-s/month, then $12.50 per million GB-s. — [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- WebSocket billing: incoming messages are billed 20:1 as requests (100 messages count as 5 requests). "Outgoing messages and incoming protocol pings are not charged." — [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- Duration is billed on "the 128 MB of memory your Durable Object is allocated, regardless of actual usage." It is "billed in wall-clock time as long as the Object is active and not eligible for hibernation." — [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- SQLite storage pricing:
  - Rows read: Free 5M/day. Paid includes 25B/month, then $0.001 per million.
  - Rows written: Free 100k/day. Paid includes 50M/month, then $1.00 per million.
  - Stored data: Free 5 GB total. Paid includes 5 GB-month, then $0.20/GB-month.
  - Source: [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- SQLite storage billing started with a target date of Jan 7, 2026 (changelog entry dated 2025-12-12). Free-plan users are not charged. — [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/); [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)
- Legacy KV-backed storage (Paid only):
  - Read units: $0.20/M. Write units: $1.00/M. One unit is 4 KB.
  - Storage: $0.20/GB-month.
  - The deletes line is inconsistent: the table says $1.00/M, but a footnote says deletes are unmetered.
  - Source: [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- Worked examples on the pricing page:
  - Without hibernation: 100 DOs × 50 WebSockets, 1 msg/min, 8 h/day, comes to about $142.95/mo, of which $137.50 is duration.
  - With hibernation: 100 DOs × 100 WebSockets, 1 msg/min each, 10 ms of processing per message, comes to about $20.65/mo ($3.15 requests + $12.50 duration + the $5 minimum).
  - Source: [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)

**WebSocket Hibernation API**
- `ctx.acceptWebSocket(ws)` (unlike `ws.accept()`) lets the DO hibernate. Clients stay connected to Cloudflare's network while the object is evicted, and in-memory state is reset. When the next event arrives, the constructor runs again. — [DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- "Billable Duration (GB-s) charges do not accrue during hibernation." Protocol pings get automatic pongs and do not wake the object. — [DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- An idle DO that qualifies for hibernation incurs no duration charges, "even briefly before the runtime hibernates it." — [DO FAQ](https://developers.cloudflare.com/durable-objects/reference/faq/)
- Per-connection state: `serializeAttachment()` survives hibernation. The maximum serialized size is 16,384 bytes. — [DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- Hibernation is blocked by alarms, incoming requests, scheduled callbacks, and `setTimeout`/`setInterval`. An open outbound WebSocket prevents eviction for up to 15 min. — [DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- From compat date 2026-10-01, pending I/O also keeps an object running, each operation for up to 15 min, "and duration charges continue." This covers service-binding/RPC calls, `waitUntil()`, timers and `container.monitor()`. — [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)
- "Deploying a new version restarts every Durable Object and disconnects all WebSockets." — [DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- The docs say a DO can connect "thousands of clients per instance." No hard per-object connection maximum is published. — [DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)

**Throughput and design rules**
- Each object has a soft limit of 1,000 requests/sec and is single-threaded. When the request queue overflows, callers get an "overloaded" error. — [DO Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- Per-object throughput guidance: "approximately 500-1,000 requests per second for simple operations," about 500–750 for moderate work, and about 200–500 for complex operations or storage writes. Shard across DOs when you exceed this. — [Rules of DOs](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)
- Design rules from the same guide — [Rules of DOs](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/):
  - "Create one Durable Object per logical unit that needs coordination" (chat room, game session, document).
  - Do not create a single global DO.
  - For hierarchies, use a parent DO that tracks its children while each child owns its own state.
  - Use `getByName()` for deterministic routing.
  - `PRAGMA user_version` is not supported, so track schema versions yourself.

**Alarms**
- Alarms do not repeat. You must call `setAlarm()` again to reschedule. Alarms may fire more than once, so handlers must be idempotent. Only schedule an alarm when there is work to do. — [Rules of DOs](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)
- Recent alarm changes — [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/):
  - Feb 24, 2026: `deleteAll()` also clears the alarm.
  - Aug 25, 2026: `ctx.abort({retryAlarm:false})` was added.

**Point-in-time recovery (PITR)**
- You can restore the embedded SQLite DB, including KV data, to "any point in time in the past 30 days." The API is `getBookmarkForTime()` followed by `onNextSessionRestoreBookmark()` and then `ctx.abort()`. A restore returns an undo bookmark. "The PITR API is not supported in local development." — [SQLite Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
- Writes made with no intervening `await` are submitted atomically. `transactionSync()` is available. A cursor held across an `await` has no snapshot isolation. — [SQLite Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)

**Location hints and jurisdictions**
- Location hints: `wnam, enam, sam, weur, eeur, apac, apac-ne, apac-se, oc, afr, me`. `apac-ne` and `apac-se` were added Jun 19, 2026.
  - `sam`, `afr` and `me` do not spawn objects locally. For example, South America spawns in ENAM.
  - Hints are best-effort, and only the first `get()` honors them.
  - "Objects don't currently move after creation."
  - Source: [DO Data Location](https://developers.cloudflare.com/durable-objects/reference/data-location/); [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)
- Jurisdictions: `eu`, `us` (added Jun 26, 2026), and `fedramp`. The DO ID is still logged outside the jurisdiction. — [DO Data Location](https://developers.cloudflare.com/durable-objects/reference/data-location/); [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)

**Tooling updates, Oct 2025 – Oct 2026**
- Source for all items: [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)
- Oct 16, 2025: Data Studio (beta), a dashboard UI for viewing and editing DO SQLite.
- Mar 15, 2026: `ctx.id.name`.
- Jun 4, 2026: Budget alerts and current-period spend in product sidebars.
- Jun 25, 2026: Eviction test helpers in vitest-pool-workers.
- Jul 4, 2026: Declarative `exports`, replacing ordered migrations.
- Jul 24, 2026: DO ID in logs and traces.
- Sep 17, 2026: RPC tracing spans.

**DO SQLite vs D1**
- Pricing comparison:
  - Rows read and written cost the same on both: $0.001 per million reads and $1.00 per million writes, with 25B and 50M included.
  - Storage is $0.20/GB-month on DO versus $0.75/GB-month on D1.
  - Source: [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/); [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- D1 is built on DOs: "Each read replica is a separate Durable Object." — [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)

### Inferences
- With the Hibernation API, idle time between messages is not billed, even while sockets stay open. A pure event-driven relay therefore pays duration only for message-processing time, so it is very cheap. A game with a server tick loop (`setInterval`) cannot hibernate. It pays wall-clock duration of 128 MB × the full room lifetime, about $0.0058 per room-hour above the free allowance (see section 5).
- Rows written ($1/M) is the most likely cost driver for a delta-streaming editor. Batching deltas into one appended row per flush matches the user's JSONL append-log design and cuts this cost by one to two orders of magnitude.
- Every deploy disconnects every live socket. Clients need resilient reconnect and resync, which the user's delta protocol must handle anyway.
- A DO's location is fixed when it is created. A room first opened by a user on another continent stays there.
- DO SQLite is about 3.75× cheaper per GB than D1, has unlimited instances, and is synchronous and in-process. That makes it the better fit for "per-page/per-tenant SQLite" in this design. D1 suits a small global index or catalog DB.

### Gaps
- No published hard maximum on WebSocket connections per DO. The practical limits are CPU and the 128 MB memory cap.
- No published idle threshold (in seconds) before hibernation and eviction.
- No built-in DO export or dump tool was found. Data Studio is a viewer and editor, and export would have to be custom code.
- No hard spend cap for DO usage was found, only budget alerts (see section 6).

## 2. D1: limits, read replication, Time Travel, pricing, sharding and migrations

### Takeaway
D1 is still capped at 10 GB per database, and the cap cannot be raised. Accounts can have 50,000 databases on Paid (1 TB total, raisable). Each database is single-threaded. Cloudflare's guidance is to scale out with many small per-tenant or per-entity databases. Read replication (Sessions API, still labeled Beta) and 30-day Time Travel are free. However, Time Travel only restores in place and cannot fork, so it is not branching. Migrations tooling covers one database at a time.

### Cited Findings
- Limits (Paid / Free):
  - 50,000 / 10 databases per account; 10 GB / 500 MB maximum database size; 1 TB / 5 GB storage per account.
  - Time Travel: 30 / 7 days.
  - 1,000 / 50 queries per Worker invocation.
  - About 5,000 bindings per Worker script.
  - 30 s maximum query duration; 5 GB maximum `d1 execute` file import.
  - Source: [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)
- "The 10 GB per-database maximum cannot be increased." Account-level limits can be raised. Each DB is single-threaded, with throughput of roughly 1 divided by the average query duration. D1 "is designed to scale out across many smaller databases, such as per-user, per-tenant" with "no extra charge" for thousands of DBs. — [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)
- Pricing (page last updated Apr 21, 2026):
  - Rows read: Free 5M/day. Paid includes 25B/month, then $0.001 per million.
  - Rows written: Free 100k/day. Paid includes 50M/month, then $1.00 per million.
  - Storage: 5 GB included, then $0.75/GB-month.
  - "Read replication does not charge extra for read replicas."
  - Source: [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- Read replication — [D1 Read Replication](https://developers.cloudflare.com/d1/best-practices/read-replication/):
  - It requires the Sessions API (`withSession()`, defaulting to `first-unconstrained`, or `first-primary`, or a bookmark). Without it, all queries go to the primary.
  - It provides sequential consistency (read-your-writes, monotonic reads).
  - Replicas are in ENAM, WNAM, WEUR, EEUR, APAC and OC.
  - It works only through the Worker binding, not the REST API.
  - The sidebar labels it "Beta."
- Time Travel — [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/):
  - Restores to "any minute within the last 30 days."
  - The restore "overwrites the database in place." Time Travel "does not yet allow you to clone or fork an existing database to a new copy."
  - Restores are limited to 10 per 10 minutes per DB.
  - There is no charge.
  - For retention beyond 30 days, export to R2 using Workflows.
- Migrations — [D1 Migrations](https://developers.cloudflare.com/d1/reference/migrations/):
  - `wrangler d1 migrations create/list/apply` applies sequential `.sql` files.
  - Applied migrations are tracked in a `d1_migrations` table. `migrations_dir`, `migrations_table` and `migrations_pattern` are configurable.
  - The page does not cover applying migrations across many databases at once.
- Import and export — [D1 Import/Export](https://developers.cloudflare.com/d1/best-practices/import-export-data/):
  - Export: `wrangler d1 export --remote` with `--table`, `--no-data` and `--no-schema` options.
  - Raw `.sqlite3` files cannot be imported. Use `.dump` and strip the transaction statements first.
  - "A running export will block other database requests."
  - Export does not support virtual tables, which includes FTS5.
  - Large int64 values can lose precision.
- Community sharding pattern — [dev.to, Mar 14 2025](https://dev.to/araldhafeeri/scaling-your-cloudflare-d1-database-from-the-10-gb-limit-to-tbs-4a16):
  - Route with `hash(customer_id) % num_shards` across multiple D1 bindings.
  - A separate account DB or KV map handles login lookup.
  - Rebalancing is costly, and the shard count must be fixed in advance.
  - The article's code contains bugs.
- Developer concern — [AnswerOverflow / CF Discord](https://www.answeroverflow.com/m/1345869029906059305): a developer called D1 at 10 GB "quite complicated." Per-user DBs run into the 50k-database cap, and a raised limit "isn't guaranteed." No staff answer was captured.

### Inferences
- The worry about sharding and migrating D1 is valid if D1 is the primary store. It mostly goes away if per-document and per-tenant data lives in DO SQLite, which also has a 10 GB cap per object but unlimited objects addressed dynamically by name. D1 is then a small index: users, page directory, permissions.
- A D1-per-tenant design runs into two limits. Bindings are static in wrangler config (about 5,000 per script), and migrations run one database at a time. In practice, D1-per-tenant needs custom tooling at large tenant counts. DO-per-tenant needs custom in-constructor migrations, since the rules guide says to track schema versions yourself.
- Moving data out of a single D1 DB is mechanical (SQL dump), but the export blocks the DB while it runs. Plan exports for maintenance windows, or use replicas and Workflows.

### Gaps
- No GA date was found for D1 read replication. It is still shown as Beta.
- No Cloudflare-provided tool for fanning out migrations across N D1 databases was found.
- No evidence of runtime-created D1 bindings. Whether dynamic per-tenant D1 access requires the REST API was not verified.

## 3. Other Cloudflare primitives and 2025–2026 launches: R2, KV, Queues, Workflows, Hyperdrive, Workers, Containers, Realtime, Workers AI, Agents SDK, PartyServer

### Takeaway
Cloudflare now covers nearly every layer this app needs:
- Workers and DOs for compute, rooms and state.
- R2 for blobs and snapshots, with zero egress.
- Realtime SFU, TURN and RealtimeKit for voice and video.
- Workers AI for speech-to-text, text-to-speech and LLMs, plus an experimental `@cloudflare/voice` agent pipeline.
- Containers for anything that needs a full Linux process.
- Hyperdrive and PlanetScale (billed through Cloudflare since Jun 2026) for when Postgres is needed.

The 2025–2026 data launches extend DOs and R2 (DO Facets, Artifacts, KV Instant, Basin, K2). There is no first-party managed Postgres or local-first client-sync product.

### Cited Findings
**Workers, KV, Queues, Workflows, Hyperdrive, Containers** (Workers pricing page last updated Oct 2, 2026)
- Workers Paid (all from [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)):
  - Minimum $5/month per account.
  - Requests: 10M included, then $0.30/M.
  - CPU: 30M CPU-ms included, then $0.02 per million CPU-ms.
  - Static asset requests are free, and subrequests are not billed.
  - Free plan: 100k requests/day and 10 ms CPU per invocation.
- KV Paid ([Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)):
  - Reads: 10M/month included, then $0.50/M.
  - Writes, deletes and lists: 1M each included, then $5.00/M.
  - Storage: 1 GB included, then $0.50/GB-month.
- Queues: Paid includes 1M operations, then $0.40/M. Retention is 4 days by default, configurable up to 14. — [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- Workflows Paid ([Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)):
  - Requests and CPU are billed like Workers.
  - 500k steps/month included, then $0.80 per 100k.
  - Storage: $0.20/GB-month.
  - Step and storage billing has not started yet ("date announced in the Workflows billing changelog").
- Hyperdrive: Free 100k queries/day; Paid unlimited. Pooling and caching are at no extra cost, and Hyperdrive charges no egress. — [Hyperdrive Pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/)
- Containers (Paid only) — [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/):
  - Memory: 25 GiB-hours included, then $0.0000025/GiB-s.
  - CPU: 375 vCPU-min included, then $0.000020/vCPU-s.
  - Disk: 200 GB-hours included, then $0.00000007/GB-s.
  - Egress: $0.025/GB in North America and Europe (1 TB included); $0.04–0.05/GB elsewhere.
- Containers rebuilt (Sep 30, 2026) — [CF Blog](https://blog.cloudflare.com/faster-agent-sandboxes/):
  - Start "6x faster" (median time-to-interactive 4.049 s → 648 ms).
  - A `durable_object` scheduling policy lets DOs schedule and control containers.
  - Image and instance type can be chosen at runtime.
  - Filesystem snapshots are in public beta.
  - A burst test started 100,000 containers in 5.387 s.
  - The legacy `Container`/`Sandbox` classes get no updates after Dec 31, 2026.

**R2** (pricing page last updated Oct 26, 2026)
- Standard storage: $0.015/GB-month. Class A: $4.50/M. Class B: $0.36/M. — [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- Infrequent Access: $0.01/GB-month, $9.00/M Class A, $0.90/M Class B, plus $0.01/GB retrieval. — [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- Egress is free. The monthly free tier is 10 GB-month, 1M Class A and 10M Class B, and does not apply to IA storage. — [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- Event notifications → Queues — [R2 Event Notifications](https://developers.cloudflare.com/r2/buckets/event-notifications/):
  - `object-create` fires on Put, Copy and CompleteMultipartUpload. `object-delete` fires on Delete and LifecycleDeletion.
  - Up to 100 rules per bucket.
  - 5,000 messages/s per queue.

**Cloudflare Realtime (SFU, TURN, RealtimeKit)**
- SFU and TURN cost $0.05/GB of egress. "The first 1,000 GB each month is free," shared between SFU, TURN and the WebSocket adapter. Traffic published into Cloudflare is free. — [Realtime SFU Pricing](https://developers.cloudflare.com/realtime/sfu/platform/pricing/) (updated Sep 22, 2026)
- RealtimeKit (managed SDK) — [RealtimeKit Pricing](https://developers.cloudflare.com/realtime/realtimekit/pricing/) (updated Sep 3, 2026):
  - Participants: $0.002/min audio+video; $0.0005/min audio-only.
  - Recording and RTMP/HLS: $0.010/min, or $0.003/min audio-only.
  - Raw RTP to R2: $0.0005/min.
  - Real-time transcription is billed at Workers AI model pricing.
  - No free tier is stated.

**Workers AI** (pricing page last updated Oct 20, 2026)
- $0.011 per 1,000 Neurons. 10,000 Neurons/day are free. — [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- Speech-to-text, per audio minute — [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/):
  - `@cf/openai/whisper` and `whisper-large-v3-turbo`: $0.0005.
  - `@cf/deepgram/nova-3`: $0.0052.
  - `@cf/deepgram/flux` (WebSocket, conversational): $0.0077.
- Text-to-speech — [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/):
  - `@cf/myshell-ai/melotts`: $0.0002/audio-min.
  - `deepgram/aura-1`: $0.015 per 1k characters.
  - `aura-2-en` and `aura-2-es`: $0.030 per 1k characters.
- LLMs, per M tokens in / out — [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/):
  - llama-3.3-70b-fp8-fast: $0.293 / $2.253.
  - gpt-oss-120b: $0.35 / $0.75.
  - gpt-oss-20b: $0.20 / $0.30.

**Agents SDK and voice**
- Agent state "is stored in SQLite, survives restarts and hibernation, and syncs to every connected client." The API includes `setState()`, `validateStateChange()`, `onStateChanged(state, source)`, the React `useAgent` hook, readonly connections and `this.sql`. — [Agents: Store and Sync State](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/)
- `@cloudflare/voice` (experimental, Apr 2026) — [StartupHub.ai, Apr 15 2026](https://www.startuphub.ai/news/cloudflare-adds-voice-to-ai-agents):
  - `withVoice(Agent)` and `withVoiceInput(Agent)`.
  - React hooks plus a framework-agnostic `VoiceClient`.
  - Deepgram Flux/Nova-3 speech-to-text and Aura text-to-speech through Workers AI.
  - Audio streams over the existing WebSocket. Conversation history is kept in SQLite.
- Agents Week (Apr 20, 2026) — [CF Blog](https://blog.cloudflare.com/agents-week-in-review):
  - Experimental voice pipeline "in about 30 lines."
  - Durable Object Facets: Dynamic Workers instantiate DOs "with their own isolated SQLite databases."
  - Artifacts: git-compatible versioned storage.
  - Workflows: 50,000 concurrency.
  - Sandboxes GA.
  - PlanetScale Postgres and MySQL deployable through Cloudflare.
  - Project Think: a preview of the next edition of the Agents SDK.

**PartyKit / PartyServer**
- The `cloudflare/partykit` repo contains:
  - **PartyServer**: WebSocket handling, lifecycle hooks and broadcast on top of DOs.
  - **PartySocket**: a reconnecting client.
  - **Y-PartyServer**: Yjs support.
  - **partysub**: pub/sub across N DOs per room.
  - **partysync**: experimental DO→client state sync.
  - **partywhen**: scheduling.
  - **hono-party**: Hono middleware.
  - The README calls it "a Work in Progress."
  - Source: [GitHub cloudflare/partykit](https://github.com/cloudflare/partykit)

**Other 2025–2026 data and platform launches**
- Birthday Week 2026 (Sep 27 – Oct 5) — [CF Birthday Week](https://www.cloudflare.com/birthday-week/):
  - **Workers KV Instant** (powered by Quicksilver): "sub-2ms p99 read latency and 250ms global replication."
  - **Cloudflare Basin** (GA Oct 1): an Iceberg data platform on R2.
  - **Cloudflare K2**: serverless event streaming on R2.
  - **Artifacts** (open beta).
  - The Birthday Week page has no D1, Postgres or sync announcements.
- PlanetScale Postgres and MySQL can be created from the Cloudflare dashboard and billed on the Cloudflare invoice at PlanetScale's standard prices. They connect through Hyperdrive. (Jun 18, 2026.) — [CF Changelog](https://developers.cloudflare.com/changelog/post/2026-06-18-planetscale-databases-cloudflare-billing/)

### Inferences
- For Discord-style voice, the raw SFU is very cheap: 1 TB/month free, then $0.05/GB. But you build the client signaling and UI yourself. RealtimeKit, at $0.0005 per audio-only participant-minute, is about 10× the raw-SFU cost at scale (see section 5) but provides the client SDK.
- The Agents SDK state-sync model (server-authoritative JSON state broadcast to clients, persisted in DO SQLite) is conceptually close to the user's Item/List/Page delta streaming. But it syncs one state value per agent, with documented hooks mainly for React. The user's own framework on raw DOs (or PartyServer) is probably the better fit, with Agents/`@cloudflare/voice` used only for the AI-voice participant.
- "Durable Objects + SQLite" is Cloudflare's de facto sync primitive. No managed local-first or offline client-sync product (like ElectricSQL, Zero or PowerSync) was announced. `partysync` is experimental.
- Artifacts (versioned, forkable, git-compatible storage) may be relevant to page version history and forking. It was not evaluated in depth.

### Gaps
- R2 conditional writes (If-Match / If-None-Match on PUT) and multipart limits were not verified in this pass.
- Whether Containers CPU is billed on provisioned or actively used vCPU was not verified.
- No non-React `AgentClient` documentation was captured. Only the voice package's framework-agnostic `VoiceClient` is confirmed.
- No pricing was published for KV Instant, Basin or K2 on the pages read.

## 4. Developer workflow: local dev, remote bindings, local vs cloud data, branching, previews, observability, pain points

### Takeaway
Local development runs Miniflare/workerd with simulated bindings that start empty. Durable Objects cannot be remote-bound. There is no local↔cloud data sync; moving data is a manual export and import. There is no data branching: D1 Time Travel restores in place only. The new Worker Previews (beta, Sep 22 2026) give each branch its own isolated DO namespaces, but D1, KV and R2 stay shared unless you bind them to separate resources. Observability improved a lot in 2026 (per-object logs and traces, metrics, budget alerts).

### Cited Findings
**Local development and remote bindings** — [Workers Dev & Testing](https://developers.cloudflare.com/workers/development-testing/)
- `wrangler dev` and `vite dev` run Miniflare/workerd locally with simulated bindings. AI bindings always run remotely.
- Setting `remote: true` on a binding uses the deployed resource while code still runs locally.
- Durable Objects, Workflows, Hyperdrive, vars/secrets, static assets and Rate Limiting cannot be remote-bound.
- Remote writes modify real data and incur charges.
- Miniflare is "not a hardened sandbox."
- Local resources start empty. The page describes no sync mechanism.
- The DO PITR API is unavailable locally. — [SQLite Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
- To copy remote D1 to local: `d1 export --remote`, then `d1 execute --file` without `--remote`. Export blocks the DB and cannot handle FTS5 or virtual tables. — [D1 Import/Export](https://developers.cloudflare.com/d1/best-practices/import-export-data/)

**Branching and previews**
- D1 Time Travel cannot "clone or fork an existing database to a new copy." — [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- Worker Previews (Sep 22, 2026) — [CF Changelog](https://developers.cloudflare.com/changelog/post/2026-09-22-worker-previews/):
  - Each preview is "isolated from production and every other Preview," with its own URL and observability.
  - For DOs and Containers, Cloudflare "automatically provisions separate namespaces, storage... for each Preview."
  - Deploy with `npx wrangler preview` (Wrangler ≥4.135.0).
- A walkthrough of Previews — [Flavio Copes, Sep 24 2026](https://flaviocopes.com/cloudflare-worker-previews/):
  - Previews are an open beta.
  - KV, D1, R2 and Queues bindings are not inherited and must be declared in a `previews` block. Previews bound to the same D1 database share its rows.
  - Service bindings call production. Cron Triggers and queue consumers run only in production. Workflows are not created per preview.
- Before Previews existed, PR previews shared top-level bindings. If the D1 `database_id` pointed at production, every preview read and wrote production data, and `preview_database_id` applies only to local `wrangler dev`. The workaround was a Wrangler `env.staging` with every binding redeclared. — [dev.to, Apr 2026](https://dev.to/dobrinyonkov/your-pr-preview-is-talking-to-your-production-database-4544)

**Observability and tooling (2025–2026)** — source for all: [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)
- Data Studio for DO SQLite.
- Metrics filterable by object ID or name.
- A memory-usage chart.
- DO ID in logs and OpenTelemetry spans.
- RPC trace spans.
- A Deployments tab.
- `wrangler check startup`.
- Budget alerts.
- Vitest eviction helpers.
- Birthday Week added eight observability updates (logs, traces, analytics and alerts under "simpler and more predictable pricing") and made Logpush and higher limits available to all accounts. — [CF Birthday Week](https://www.cloudflare.com/birthday-week/)

**Known pain points**
- The $34,895 runaway-alarm bill (HN, Apr 2026) — [HN](https://news.ycombinator.com/item?id=47787042):
  - The cause: `onStart()` called `setAlarm()` unconditionally, across 60+ preview deployments that each created their own DOs. Usage peaked around 930 billion row reads/day, with zero users.
  - Usage notifications covered only CPU time.
  - There was "no hard spending cap for DO operations."
  - The thread does not report a Cloudflare response.
- Every deploy disconnects all WebSockets. — [DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- tldraw requires client and server versions to match, so the backend must deploy before the client. — [tldraw sync docs](https://tldraw.dev/docs/sync)
- Lock-in and cost — [The Register, Aug 12 2026](https://www.theregister.com/devops/2026/08/12/nodejs-creator-liberates-durable-objects-from-cloudflare-with-celld/5286954):
  - Ryan Dahl released **celld**, an Apache-2 self-hosted, Workers- and DO-API-compatible runtime that keeps per-object SQLite on S3-compatible storage.
  - Dahl estimated 100 resident DOs at $415/mo on Cloudflare versus about $49 on DigitalOcean.
  - Cloudflare countered that $415 assumes always-active objects, and idle hibernating objects cost about $20.65/mo.

### Inferences
- For this user, "local dev / cloud sync" means one of two things: a seed script plus a manual D1 export/import, or (for DOs) an app-level export endpoint that dumps a DO's SQLite or JSONL to R2 and a local loader. Neither is built in. His planned swappable store adapter plus the JSONL log format is a natural portable export format.
- Since Sep 2026, Previews give branch-isolated, empty DO state automatically. That is the closest Cloudflare gets to "branching" for DO-centric apps. It is isolation, not copy-on-write of production data.
- Preview deployments carry real cost risk: the $34k incident was multiplied across 60+ preview DO namespaces. Put guard code on alarms and set budget alerts.
- celld gives a credible exit path or self-host fallback for a DO-based design, which lowers lock-in risk.

### Gaps
- No Cloudflare product for copy-on-write data branching (D1 or DO) was found as of Oct 2026.
- The Worker Previews docs' "current limitations" page was not read directly.
- No first-party dashboard export for DO SQLite was confirmed.

## 5. Comparison and modeled monthly costs: Cloudflare vs Supabase, Neon, Turso, PlanetScale, Fly.io, PocketBase, Firebase

### Takeaway
For a realtime-heavy app, Cloudflare is far cheaper at both scales. Outgoing WebSocket fan-out is free, incoming messages are billed at 1/20th of a request, and idle sockets cost nothing. Supabase Realtime bills every sent and every received message ($2.50/M past 5M). At 100k MAU with cursor-rate multiplayer traffic, that comes to tens of thousands of dollars a month and exceeds self-serve throughput limits. Neon, Turso and PlanetScale are databases only: they still need a separate realtime layer, but they offer real data branching, which Cloudflare lacks.

### Cited Findings: competitor pricing
**Supabase** — [Supabase Pricing](https://supabase.com/pricing)
- Plans: Free $0 (2 projects); Pro from $25; Team from $599.
- Pro and Team include:
  - 100k MAU, then $0.00325/MAU.
  - 8 GB DB, then $0.125/GB.
  - 250 GB egress, then $0.09/GB.
  - 500 Realtime concurrent connections, then $10 per 1,000.
  - 5M Realtime messages, then $2.50/M.
  - $10 compute credit (one Micro).
- Free includes 50k MAU, 200 connections and 2M messages. Free projects are paused after 1 week of inactivity.
- Compute: Micro $10, Small $15, Medium $60, Large $110 (2 dedicated vCPU), XL $210, 2XL $410, up to 16XL $3,730.
- Branching: $0.01344 per branch-hour. PITR: $100/month per 7 days of retention.
- Realtime message counting: "Each broadcast message counts as one message sent plus one message per subscribed client that receives it." For example, 1 broadcast to 4 listeners counts as 5 messages. Overage is billed in 1M packages at $2.50. — [Supabase Realtime Messages](https://supabase.com/docs/guides/platform/manage-your-usage/realtime-messages)
- Realtime throughput limits (Free / Pro / Pro without spend cap / Team) — [Supabase Realtime Limits](https://supabase.com/docs/guides/realtime/limits):
  - Concurrent connections: 200 / 500 / 10,000 / 10,000.
  - Messages per second: 100 / 500 / 2,500 / 2,500.
  - Presence messages per second: 20 / 50 / 1,000 / 1,000.
  - Exceeding a limit can disconnect clients with a `tenant_events` error.

**Neon** — [Neon Pricing](https://neon.com/pricing)
- Branded "from Databricks."
- Free: 100 CU-hours/project, 1 GB storage per project (20 GB account total), max 2 CU, 10 branches/project, 6-hour restore window.
- Launch: $0.106/CU-hour. Scale: $0.222/CU-hour.
- Storage: $0.35/GB-month.
- Scale-to-zero: after 5 minutes (it cannot be disabled on Free; on Scale it is configurable from 1 minute to always-on).
- Branches: 10 included on Launch and 25 on Scale, then $1.50/branch-month (about $0.002/hour), with up to 5,000 per project.
- Instant restore: $0.20/GB-month; 7 days on Launch, 30 on Scale.
- Egress: 500 GB/project included, then $0.10/GB.
- No monthly minimum.
- After Databricks acquired Neon (May 2025), prices were cut on Nov 14, 2025: Launch from $0.14 to $0.106 and Scale from $0.26 to $0.222 per CU-hour. Vantage attributes the cut to Databricks' AWS discounts, which is Vantage's inference. — [Vantage](https://www.vantage.sh/blog/neon-acquisition-new-pricing)

**Turso** — [Turso Pricing](https://turso.tech/pricing)
- Free: $0; 100 DBs; 5 GB; 500M rows read and 10M rows written per month.
- Developer: $4.99; unlimited DBs; 9 GB (+$0.75/GB); 2.5B reads; 25M writes (+$1/M).
- Scaler: $24.92; 24 GB (+$0.50/GB); 100B reads; 100M writes (+$0.80/M).
- Pro: $416.58.
- Embedded syncs are metered by GB.
- PITR: 1, 10, 30 and 90 days by tier.
- PITR and branching "do not add usage cost."

**PlanetScale**
- Postgres single node "starting at $5/month." Metal (local NVMe) "starting at $50/month." HA = 1 primary + 2 replicas across 3 AZs, no price shown. — [PlanetScale Pricing](https://planetscale.com/pricing)
- Each branch runs on its own cluster, prorated to the millisecond. — [PlanetScale Postgres Pricing Docs](https://planetscale.com/docs/postgres/pricing)
- Network-attached storage includes the first 10 GB per cluster. — [PlanetScale Postgres Pricing Docs](https://planetscale.com/docs/postgres/pricing)
- Public egress: 100 GB included for production; 10 GB for PS-5 non-HA. — [PlanetScale Postgres Pricing Docs](https://planetscale.com/docs/postgres/pricing)

**Fly.io** — [Fly.io Pricing](https://fly.io/docs/about/pricing/)
- shared-cpu-1x: 256 MB $1.94/mo; 512 MB $3.19; 1 GB $5.70.
- performance-1x 2 GB: $31; performance-2x 8 GB: $82.01.
- Stopped machines pay only for rootfs.
- Volumes: $0.15/GB-month.
- Egress: $0.02/GB in North America and Europe; $0.04 in APAC and South America; $0.12 in Africa and India.

**PocketBase** — [PocketBase FAQ](https://pocketbase.io/faq/)
- Embedded SQLite (WAL); scales "Only on a single server, aka. vertical."
- "Can easily serve 10 000+ persistent realtime connections" on a $4 Hetzner CAX11.
- A volunteer project with "no promises for maintenance and support."

**Firebase** — [Firebase Pricing](https://firebase.google.com/pricing)
- Realtime Database: 100 simultaneous connections on Spark and 200K per DB on Blaze. Storage costs $5/GB. Downloads are 10 GB/mo on Spark; Blaze has 360 MB/day free, then $1/GB.
- Firestore free quota: 50K reads, 20K writes and 20K deletes per day; 1 GiB stored.
- Auth: 50K MAU free.

### Cost model (assumptions are the researcher's; rates come from the pages cited above)
**Shared assumptions**
- Small app: 1k MAU, 200 DAU, 1 active hour/day each, which gives 6,000 active user-hours/month. Peak concurrency is about 50.
- Growing app: 100k MAU, 20k DAU, 1 hour/day, which gives 600,000 user-hours/month. Peak concurrency is about 5,000.
- Average room size is 4, so each message fans out to 3 recipients. Payload is about 100 bytes.
- Traffic profile A, "chat/presence": 0.05 inbound messages/s per active user. That is 1.08M/month (small) or 108M/month (growing).
- Traffic profile B, "multiplayer editing" (throttled cursors plus deltas): 2 inbound messages/s per active user. That is 43.2M/month (small) or 4.32B/month (growing).

**Cloudflare (Workers Paid, rates from [DO Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [R2 Pricing](https://developers.cloudflare.com/r2/pricing/))**

Small app:
- **Profile A or B:** about $5–6. DO requests for B: 2.16M billed → about $0.17 of overage. Duration under hibernation at 5 ms per message: about 27.6k GB-s, which is within the 400k included. Rows written stay within the 50M included.
- **Game tick loop instead (no hibernation):** about $9. That is 1,500 room-hours × 3,600 s × 0.128 GB = 691k GB-s, so $3.64 of overage.

Growing app, profile A:
- Total about $30.
- DO requests: 5.4M billed → $0.66.
- DO storage: 50 GB → $9.
- R2: 500 GB → $7.35.
- Workers: 30M requests and 100M CPU-ms → $7.40.

Growing app, profile B (hibernating relay, batched writes):
- Total about $150.
- DO requests: 216M billed → $32.25.
- Duration: 4.32B messages × 5 ms × 0.128 GB = 2.76M GB-s → $29.56.
- Rows written: one row per room every 5 s = 108M → $58.
- Storage, R2 and Workers: about $23.

Growing app, profile B variants:
- **Naive per-delta writes** (0.2 writes/s per user × 2 rows = 864M rows): rows written become $814, for a total of about $905.
- **Game tick loop** (150k room-hours wall-clock = 69.1M GB-s): duration becomes $859, for a total of about $978.

Voice and AI on Cloudflare:
- **Voice via raw SFU** (10% of hours in voice, about 48 kbps Opus, 3 received streams): small app about 39 GB → $0. Growing app about 3.9 TB → (3,888 − 1,000) × $0.05 ≈ $144.
- **Voice via RealtimeKit audio-only:** small app 36k minutes → $18. Growing app 3.6M minutes → $1,800.
- **AI voice unit costs:** speech-to-text $0.0005/min (Whisper turbo) to $0.0077/min (Flux). Text-to-speech $0.0002/min (MeloTTS), or about $0.027 per minute of speech with Aura-2, assuming about 900 characters per minute.

**Supabase (Pro), rates from [Supabase Pricing](https://supabase.com/pricing) and [Supabase Realtime Messages](https://supabase.com/docs/guides/platform/manage-your-usage/realtime-messages)**
- Each inbound broadcast counts as 4 messages (1 sent + 3 received).
- **Small app, profile A:** 4.32M messages, which fits in the 5M included. Total $25. (Free tier is ruled out: 4.32M exceeds its 2M messages, and projects pause after a week of inactivity.)
- **Small app, profile B:** 172.8M messages, so 168 overage packages × $2.50 = $420. Total about $445. Peak rate is about 50 × 2 × 4 = 400 msg/s, close to Pro's 500 msg/s spend-capped limit.
- **Growing app, profile A:** about $1,190 total.
  - 432M messages → $1,067.50.
  - Peak connections: 5,000 → $45.
  - Compute: Medium $60 − $10 credit = $50.
  - Base: $25.
  - Peak rate is about 1,000 msg/s, which requires turning off the spend cap.
- **Growing app, profile B:** 17.28B messages → about $43,190/month in messages alone. A peak of about 40,000 msg/s is 16× Team's 2,500 msg/s limit, so this is Enterprise-only or not feasible on Supabase Realtime.

**Neon (DB only), rates from [Neon Pricing](https://neon.com/pricing)**
- **Small app:** 0.25 CU × about 8 active hours/day = 60 CU-hours → $6.36, plus about $0.70 storage. Total about $7, or $0 on the Free plan.
- **Growing app:** 2 CU always on = 1,460 CU-hours → $155 on Launch or $324 on Scale, plus 50 GB storage = $17.50. A separate realtime layer is still required.

**Turso (DB only), rates from [Turso Pricing](https://turso.tech/pricing)**
- **Small app:** $0–4.99.
- **Growing app** (108M batched writes, 50 GB): Scaler $24.92 + $6.40 write overage + $13 storage ≈ $44. A realtime layer is still required.

**Fly.io self-hosted WebSocket server, rates from [Fly.io Pricing](https://fly.io/docs/about/pricing/)**
- **Small app:** shared-cpu-1x 1 GB $5.70 + a 10 GB volume $1.50 ≈ $7.
- **Growing app (profile B):** e.g. 3 × performance-2x 8 GB ≈ $246, plus fan-out egress of about 1.3 TB × $0.02 ≈ $26. Total about $270–300, plus your own operations work (scaling, failover, room routing).

**PocketBase**
- One $4 VPS covers the small app, and per the FAQ possibly about 10k connections. It runs on one server only, with no horizontal scaling. — [PocketBase FAQ](https://pocketbase.io/faq/)

**Firebase Realtime Database, rates from [Firebase Pricing](https://firebase.google.com/pricing)**
- **Small app, profile B:** about 13 GB of fan-out downloads → about $3.
- **Growing app, profile B:** about 1.3 TB → about $1,290/month in downloads, before protocol overhead. 5,000 connections is well under 200K per DB.

### Inferences
- Cloudflare's billing model matches realtime fan-out unusually well. Outgoing messages are free, incoming messages are billed at 1/20th of a request, and there is no bandwidth egress from Workers. Supabase and Firebase bill per received message or per downloaded GB, so their costs scale with fan-out. The user's belief that "Supabase gets expensive at scale" holds most strongly for realtime traffic. Its Postgres compute is reasonably priced.
- Neon and Supabase "scale to zero" differently. Neon suspends compute after 5 minutes idle and bills by CU-hour. Supabase paid compute is billed hourly whether active or not (Free projects pause after a week). Cloudflare DOs bill per request and per processing time, with a $5 account minimum.
- On Cloudflare, the biggest swing factors are design choices, not scale: hibernation versus tick loops, and batched versus per-delta writes. Each can change the bill at 100k MAU by roughly 6×.
- Branching is where Postgres platforms clearly win. Neon has copy-on-write branches (included, then $1.50/branch-month). Supabase branches cost $0.01344/hour, about $9.81 per branch-month if always on. Turso branching is free. PlanetScale branches are billed as their own clusters. Cloudflare has none.
- Auth is not modeled on Cloudflare. Supabase Pro includes 100k MAU of auth, and Firebase includes 50K MAU. On Cloudflare you bring your own auth, which is an additional build cost.

### Gaps
- Supabase Realtime egress: whether Realtime traffic counts toward the 250 GB egress allowance was not verified.
- Supabase peak-connection billing method: not read.
- Firestore per-operation prices (per 100k) were not captured. Only free quotas are shown on the page.
- PlanetScale per-size prices (PS-5, PS-10, Metal sizes) are not on the pages read. They live in a pricing.md file or an API.
- Fly Managed Postgres prices were not captured.
- Supabase, Neon and Turso pricing pages show no "last updated" date. Values are as of the 2026-10-29 access.
- The cost models are the researcher's estimates. Message rates, processing time per message (5 ms), payload size and voice bitrate are assumptions, not measured.

## 6. Real-world reports and named companies (how they wire each service)

### Takeaway
The best-documented production collaborative apps on Durable Objects (Liveblocks, tldraw.com) use the same pattern:
- One DO per room.
- Built-in SQLite for room state.
- R2 for binaries and version history.
- Queues and KV around the edges.
- Hibernation to keep idle rooms cheap.

On the Postgres side, AI app builders dominate new database creation: Lovable and Bolt run on Supabase, and Replit runs on Neon.

### Cited Findings
- **Liveblocks** (collaboration infrastructure vendor) — [Cloudflare Case Study](https://www.cloudflare.com/case-studies/liveblocks/):
  - Durable Objects are "the core" of its real-time layer. Each room is backed by a DO, and WebSocket clients are forwarded to it.
  - Workers carry message traffic.
  - R2 stores comment attachments and document version histories.
  - Queues handle app messaging, and KV caches edge data.
  - WebSocket Hibernation stops billing for idle rooms.
  - Scale: up to 0.5B messages/day; 60 fps live cursors; a 10-engineer team.
  - It migrated from AWS EC2 + MongoDB. The team estimates self-hosting WebSockets would have needed at least four more people.
- **tldraw** — [tldraw sync docs](https://tldraw.dev/docs/sync):
  - The `sync-cloudflare` template "provides the same setup that runs on tldraw.com."
  - It uses "Durable Objects to provide a unique WebSocket server per room," with state persisted to DO SQLite (`SQLiteSyncStorage`) and R2 "to store large binary assets."
  - The template does not include auth, upload rate limits, long-term snapshot history, or room listing and search.
  - A migration path from R2 snapshots to SQLite is documented (one-time per room).
  - Hibernation is optional (`clientTimeout: Infinity` on hibernating platforms).
  - No per-room user or document size limits are published.
- **Layercode** (voice AI) — [CF Blog, Sep 27 2023](https://blog.cloudflare.com/ai-companies-building-cloudflare/): Workers run voice AI pipelines, DOs with DO SQL handle agent execution and storage, and Realtime provides WebRTC. This source is from 2023.
- **Azule.ai** — [CF Blog, Sep 27 2023](https://blog.cloudflare.com/ai-companies-building-cloudflare/): DOs with WebSockets for live chat, R2 for data including vector search, and D1 for the user database. This source is from 2023.
- **Cloudflare's own Unity demo, "Durable World"** — [CF Blog, May 26 2021](https://blog.cloudflare.com/building-real-time-games-using-workers-durable-objects-and-unity/):
  - A DO acts as a message router, with game logic on the client.
  - Clients send position at 5 Hz and interpolate.
  - It broadcasts the full state on each update, which the author flagged for optimization.
  - It avoided per-frame sends because of DO load.
- **Supabase customers** — [Sacra, Jun 11 2026](https://sacra.com/research/supabase-170m-year-growing-221-yoy/):
  - Lovable and Bolt.new white-label Supabase through Supabase for Platforms.
  - "60%+ of new Supabase databases" are created by AI coding agents.
  - Estimated ARR is about $170M (May 2026). Sacra's growth-rate figures are internally inconsistent.
  - Replit chose Neon instead.
- **PlanetScale through Cloudflare:** since Jun 18, 2026, Cloudflare customers can provision and pay for PlanetScale Postgres and MySQL on their Cloudflare invoice, wired through Hyperdrive. — [CF Changelog](https://developers.cloudflare.com/changelog/post/2026-06-18-planetscale-databases-cloudflare-billing/)
- **Limits and failures hit in production:**
  - A runaway DO alarm loop cost $34,895 in about 8 days with zero users (Apr 2026), with no hard spend cap available. — [HN](https://news.ycombinator.com/item?id=47787042)
  - D1 10 GB anxiety and the 50k-database cap. — [AnswerOverflow](https://www.answeroverflow.com/m/1345869029906059305)
  - The DO cost debate between Ryan Dahl and Cloudflare over celld ($415 versus $20.65/mo for 100 DOs). — [The Register](https://www.theregister.com/devops/2026/08/12/nodejs-creator-liberates-durable-objects-from-cloudflare-with-celld/5286954)

### Inferences
- The Liveblocks and tldraw architecture (DO per room, SQLite for state, R2 for blobs and history, hibernation) is a proven template that maps directly onto the user's Page objects. A Page or document becomes a DO, its delta log goes to SQLite rows, snapshots and assets go to R2, and a parent DO or D1 index lists children.
- Liveblocks handling 0.5B messages/day at 60 fps cursors shows that DO-based fan-out works at high message rates when rooms are sharded. It runs at a much larger scale than the "growing" model above.

### Gaps
- No public, dated 2025–2026 postmortem was found on a DO-based multiplayer game hitting per-object CPU or connection limits.
- No named production customers were confirmed for Turso, Neon (besides Replit), or PocketBase in this pass.
- The Layercode and Azule details date from 2023 and may be stale.

## 7. Simplifying concessions: simple Cloudflare setups, what each gives up, and when you don't need more

### Takeaway
A one-person framework author can run the whole stack on a few simple patterns:
- One DO per document, room or channel, with SQLite as the append log.
- Periodic snapshots to R2.
- A single D1 database (or a single "directory" DO) as the global index until it reaches about 1–5 GB.
- No local↔cloud data sync; seed and fixture data instead.
- Raw Realtime SFU for voice.

Each pattern gives up something specific: global queries, branching, cross-room transactions, or a ready-made UI. Each is adequate until a specific, observable symptom shows up.

### Cited Findings (supporting facts for each concession)
- **One DO per document or room:** this is Cloudflare's own recommended "atom of coordination." Each object handles about 500–1,000 simple requests/s, and parent/child DOs cover hierarchies. — [Rules of DOs](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)
  - Used by tldraw.com (DO per room + SQLite + R2 assets). — [tldraw sync docs](https://tldraw.dev/docs/sync)
  - Used by Liveblocks. — [Cloudflare Case Study](https://www.cloudflare.com/case-studies/liveblocks/)
- **Per-object ceilings:** 10 GB storage, 128 MB memory, single-threaded. — [DO Limits](https://developers.cloudflare.com/durable-objects/platform/limits/); [DO Changelog](https://developers.cloudflare.com/changelog/product/durable-objects/)
- **Snapshots to R2:** R2 has zero egress and 10 GB free; DO PITR covers 30 days. — [R2 Pricing](https://developers.cloudflare.com/r2/pricing/); [SQLite Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
  - tldraw ships an R2-snapshot → SQLite migration, so "snapshot only to R2" was its earlier, simpler design. — [tldraw sync docs](https://tldraw.dev/docs/sync)
- **Single D1 DB:** it holds 10 GB with free replicas and free 30-day Time Travel. — [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/); [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
  - D1 is single-threaded, at roughly 1 divided by the average query time. — [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)
- **No local↔cloud sync:** local bindings start empty. DOs cannot be remote-bound. — [Workers Dev & Testing](https://developers.cloudflare.com/workers/development-testing/)
  - PITR does not run locally. — [SQLite Storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
- **Previews instead of branching:** per-preview DO namespaces are automatic. — [CF Changelog](https://developers.cloudflare.com/changelog/post/2026-09-22-worker-previews/)
- **Hibernating relay instead of a server tick:** duration is not billed while hibernated. — [DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- **Raw SFU instead of RealtimeKit:** $0.05/GB after 1 TB free, versus $0.0005 per participant-minute. — [Realtime SFU Pricing](https://developers.cloudflare.com/realtime/sfu/platform/pricing/); [RealtimeKit Pricing](https://developers.cloudflare.com/realtime/realtimekit/pricing/)

### Inferences (concession → what you give up → when you need more)
1. **One DO per Page or room, with the JSONL-style delta log as SQLite rows.**
   - *Gives up:* cross-document queries and transactions (a search across all pages needs a separate index); capacity beyond 10 GB, 128 MB of RAM, or about 1k requests/s per document; and data-center placement, which is fixed when the object is first created.
   - *Need more when:* a single document or room approaches GBs; one room has hundreds of very chatty clients (then shard with partysub-style N DOs per room); or you need global search (then add D1, Vectorize or AI Search as an index fed by Queues).
2. **Periodic snapshot to R2, with 30-day PITR as the only backup.**
   - *Gives up:* restores older than 30 days, unless you keep versioned R2 snapshots; and a fine-grained version history UI.
   - *Need more when:* users expect "version history" or forking. Keep snapshot keys versioned in R2, or evaluate Artifacts.
3. **A single D1 database for the global index (users, page tree, ACLs) "until it hurts."**
   - *Gives up:* write throughput beyond one single-threaded primary; and a 10 GB ceiling that cannot be raised.
   - *Need more when:* the index DB passes a few GB, or p95 write latency climbs. Then move per-tenant data into DOs (not more D1 shards), or put Postgres behind Hyperdrive or PlanetScale.
   - An index-only DB holding users, page IDs and titles is unlikely to approach 10 GB at 100k MAU. This is an estimate, not measured.
4. **No local↔cloud data sync: seed scripts plus fixtures; prod data is pulled only through an export endpoint that writes JSONL to R2.**
   - *Gives up:* debugging against real production data locally, and realistic preview data.
   - *Need more when:* bugs depend on production data shape. Then write a DO "export to JSONL" RPC and a local import, using the user's planned store adapter.
5. **Worker Previews for branch isolation, accepting that D1, KV and R2 are separate staging resources rather than branches.**
   - *Gives up:* copy-on-write production data in previews, and automated schema-diff review.
   - *Need more when:* schema migrations on the index DB become risky. A Neon or Supabase-style branching workflow is the main thing Cloudflare does not offer.
6. **A hibernating relay instead of a server game loop.**
   - *Gives up:* a server-authoritative fixed-tick simulation.
   - *Need more when:* building competitive or real-time-physics games. Accept wall-clock DO billing (about $0.0058 per room-hour above the allowance), or run the game server in Containers or on Fly.
7. **Raw Realtime SFU for voice, plus Workers AI for AI voice (or experimental `@cloudflare/voice`).**
   - *Gives up:* a prebuilt meeting UI and SDK, and recording.
   - *Need more when:* you need video grids, recording or polished mobile SDKs. RealtimeKit then costs per participant-minute.
8. **The $5 Workers Paid plan with budget alerts and alarm guard code.**
   - *Gives up:* a hard spend cap; none exists.
   - *Need more when:* there are many preview environments or untrusted code. Add a kill-switch Worker and idempotent `getAlarm()`-guarded scheduling, as recommended after the $34k incident ([HN](https://news.ycombinator.com/item?id=47787042)).

### Gaps
- No Cloudflare-published benchmark was found for a single DO serving N concurrent WebSocket clients at a given message rate. The "hundreds of chatty clients" threshold above is an inference from the roughly 1k requests/s soft limit.
- No data was found on typical D1 index-DB sizes per MAU.
