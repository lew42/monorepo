# Adopters and pairings: who uses which sync/persistence/realtime tools, and how they wire them together (as of Oct 2026)

Method note: public write-ups were supplemented by reading the source of the open-source apps. Each repo was shallow-cloned at HEAD on 2026-10-29: tldraw main, Outline main, Plane preview, AFFiNE canary, Huly develop, HedgeDoc develop, Penpot develop, Logseq master, Actual master, Trilium main, SiYuan master, any-sync main, jupyter-collaboration main, Proton WebClients main, Excalidraw master and excalidraw-room master. Repo links point at those default branches. Line counts are my own count of non-test source files in the named directories at that HEAD.

---

## Q1. For each tool, who are the named adopters, and what is the full stack, data flow and custom glue around it?

### Takeaway
Almost every serious adopter splits state into two tiers.
- **Document tier.** Rich text or canvas lives in a CRDT or a per-document room: Yjs plus Hocuspocus, a Durable Object per file, or Figma's multiplayer server.
- **Metadata tier.** File lists, users, permissions and comments live in Postgres, sometimes exposed through a query-sync engine (Zero, Electric, LiveGraph, Linear's engine).

The tool covers the merge or transport layer. Teams still write persistence hooks, auth, snapshot/history, out-of-band-edit handling and metadata replication themselves. That glue runs from about 1k lines (HedgeDoc) to about 21k lines (tldraw.com).

### Cited Findings

#### Yjs (CRDT for rich text and structured docs)
- **Outline** (wiki).
  - Stack: `@hocuspocus/server` 1.1.3 plus `@hocuspocus/extension-redis` and `extension-throttle`, `yjs` ^13.6.33, `y-prosemirror`, Koa, Sequelize, ioredis and socket.io. — [Outline package.json](https://github.com/outline/outline/blob/main/package.json)
  - Persistence: the Yjs binary lives in a `Document.state` column in Postgres, written alongside ProseMirror JSON `content` and `revisionCount`. — [documentCollaborativeUpdater.ts](https://github.com/outline/outline/blob/main/server/commands/documentCollaborativeUpdater.ts)
- **Outline glue code.**
  - A custom `PersistenceExtension` does several jobs:
    - It lazily converts legacy `content` or `text` into a Y.Doc on first load, inside a `SELECT … FOR UPDATE` transaction with a double-check.
    - It tracks unsaved docs and retries persistence up to 5 times.
    - It captures editor attribution synchronously from the ydoc `update` event, because Hocuspocus's `onChange` hook runs too late in its async chain. — [PersistenceExtension.ts](https://github.com/outline/outline/blob/main/server/collaboration/PersistenceExtension.ts)
  - An `APIUpdateExtension` subscribes to the Redis channel `collaboration:api-update:*`. When a document is edited through the REST API, it reloads DB state, diffs it against the live doc's state vector and applies the update. This merges out-of-band edits into open sessions. — [APIUpdateExtension.ts](https://github.com/outline/outline/blob/main/server/collaboration/APIUpdateExtension.ts)
  - Further extensions handle authentication, awareness identity, connection limits, editor version, metrics and views. The `server/collaboration/` directory is about 1,741 lines including tests. — [outline/server/collaboration](https://github.com/outline/outline/tree/main/server/collaboration)
- **Plane** (project management, Pages feature).
  - A Node `apps/live` service runs Hocuspocus. Its `@hocuspocus/extension-database` fetch and store handlers do not touch the DB directly. They call the Django API (`GET/PATCH /pages/{id}/description/`). — [database.ts](https://github.com/makeplane/plane/blob/preview/apps/live/src/extensions/database.ts), [core.service.ts](https://github.com/makeplane/plane/blob/preview/apps/live/src/services/page/core.service.ts)
  - Every store writes three formats: `description_binary` (Yjs), `description_html` and `description_json`. On first load, HTML is converted to a Yjs binary. — [database.ts](https://github.com/makeplane/plane/blob/preview/apps/live/src/extensions/database.ts)
  - The service also has a Redis extension, title-sync and force-close-across-servers extensions, and PDF export. `apps/live/src` is about 5,012 non-test lines. — [plane/apps/live/src](https://github.com/makeplane/plane/tree/preview/apps/live/src)
  - The client uses `HocuspocusProvider` plus `IndexeddbPersistence` for offline caching (third-party code tour). — [Instagit summary of Plane live](https://instagit.com/makeplane/plane/plane-live-app-realtime-collaboration/)
- **AFFiNE** (Notion/Miro-style workspace).
  - Stack: NestJS, GraphQL, Prisma, Postgres (+pgvector), Redis/BullMQ, Socket.io sync events (`space:join`, `push-doc-update`, `server-update-doc`, `awareness`), BlockSuite on a Yjs doc store, `y-octo` (a Rust Yjs implementation), IndexedDB on the client, and S3/filesystem blobs. — [AFFiNE architecture (Mintlify mirror)](https://www.mintlify.com/toeverything/AFFiNE/contributing/architecture)
  - The Prisma schema has `updates` (raw Yjs update blobs as bytea), `snapshots` (merged doc plus state vector), `snapshot_histories` (with `expiredAt`) and `Blob` tables. — [schema.prisma](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/schema.prisma)
  - Glue: the server squashes updates into snapshots under a per-doc lock (`SingletonLocker`, `lockDocForUpdate`). It does this with a native Rust merge (`mergeUpdatesInApplyWay`) and falls back to `Y.mergeUpdates`, recording codec timing metrics. — [doc storage](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/src/core/doc/storage/doc.ts), [merge-updates.ts](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/src/core/doc/merge-updates.ts)
- **Proton Docs** (end-to-end encrypted docs, launched July 3, 2024). The editor uses `lexical`, `@lexical/yjs`, `yjs` and `y-protocols`. — [docs-editor package.json](https://github.com/ProtonMail/WebClients/blob/main/applications/docs-editor/package.json), [Proton blog, 2024-07-03](https://proton.me/blog/docs-proton-drive)
- **Proton Docs glue code.**
  - Updates are encrypted client-side as "commits" sent over a custom `WebsocketConnection`. — [docs-core/lib/Realtime](https://github.com/ProtonMail/WebClients/tree/main/packages/docs-core/lib/Realtime)
  - Compaction runs **on the client**. `SquashDocument` asks the server to `lockDocument`, decrypts the commit, squashes it, re-encrypts it and uploads the result. — [SquashDocument.ts](https://github.com/ProtonMail/WebClients/blob/main/packages/docs-core/lib/UseCase/SquashDocument.ts)
  - Comments have their own encrypt/decrypt use cases. — [docs-core/lib/UseCase](https://github.com/ProtonMail/WebClients/tree/main/packages/docs-core/lib/UseCase)
- **JupyterLab real-time collaboration.**
  - The server side is Python, not JS: `pycrdt` (a Yjs-compatible Rust core), `pycrdt-websocket` and `jupyter_ydoc`. — [jupyter-server-ydoc pyproject](https://github.com/jupyterlab/jupyter-collaboration/blob/main/projects/jupyter-server-ydoc/pyproject.toml)
  - Update history persists in `SQLiteYStore` or `TempFileYStore` from `pycrdt.store`. — [stores.py](https://github.com/jupyterlab/jupyter-collaboration/blob/main/projects/jupyter-server-ydoc/jupyter_server_ydoc/stores.py)
  - A `DocumentRoom(YRoom)` with a `save_delay` writes the merged doc back to the notebook file. — [rooms.py](https://github.com/jupyterlab/jupyter-collaboration/blob/main/projects/jupyter-server-ydoc/jupyter_server_ydoc/rooms.py)
- **Huly** (all-in-one work platform).
  - A `server/collaborator` service runs `@hocuspocus/server` ^2.15.2 with `yjs`. Its storage extension calls `saveCollabYdoc` and `loadCollabYdoc` against a platform storage adapter (blob storage), and converts legacy markup to YDoc on the fly. About 1,649 lines. — [collaborator package.json](https://github.com/hcengineering/platform/blob/develop/server/collaborator/package.json), [storage/platform.ts](https://github.com/hcengineering/platform/blob/develop/server/collaborator/src/storage/platform.ts)
  - The dev stack runs MongoDB, Elasticsearch and MinIO, and there is also a CockroachDB adapter in the communication package. — [Huly README](https://github.com/hcengineering/platform/blob/develop/README.md)
- **HedgeDoc 2** (markdown pads).
  - Stack: NestJS backend, raw `ws`, `yjs` 13.6.32 and knex migrations. — [backend package.json](https://github.com/hedgedoc/hedgedoc/blob/develop/backend/package.json)
  - An in-memory `RealtimeNoteStore` holds live Y.Docs. A timer (`persistInterval`) and teardown both call `saveRealtimeNote`. That creates a new **Revision** row containing the text content plus the encoded Yjs state, so history and persistence are the same mechanism. About 1,046 lines. — [realtime-note.service.ts](https://github.com/hedgedoc/hedgedoc/blob/develop/backend/src/realtime/realtime-note/realtime-note.service.ts)
- **Ghostwriter v6** (SpecterOps; announced 2025-06-18).
  - Stack: Tiptap editor, Hocuspocus, a Hasura GraphQL layer, and Django 4.2 on Postgres 16.4.
  - It **does not store Yjs at all**. The Hocuspocus extension loads and saves the existing Django models through GraphQL, converting HTML to and from Yjs on every load and save.
  - Workarounds:
    - A random UUID is embedded per load so that clients with stale history are rejected.
    - Out-of-band GraphQL edits get overwritten, so some features were removed.
    - Nginx was added in dev to route traffic to Hocuspocus.
  - [SpecterOps blog, 2025-06-18](https://specterops.io/blog/2025/06/18/ghostwriter-v6-introducing-collaborative-editing/)
- **Hashnode, via Liveblocks' hosted Yjs.** Covered under Liveblocks below.

#### Hocuspocus and Tiptap Cloud
- Adopters found in source: Outline (1.1.3), Plane, Huly (2.15) and Ghostwriter (see above). — [Outline package.json](https://github.com/outline/outline/blob/main/package.json), [Huly collaborator package.json](https://github.com/hcengineering/platform/blob/develop/server/collaborator/package.json), [SpecterOps](https://specterops.io/blog/2025/06/18/ghostwriter-v6-introducing-collaborative-editing/)
- Ecosystem extensions include `@hocuspocus/extension-database` (v4.4.0 on jsDelivr) and `@hocuspocus/extension-rocksdb`. Tiptap sells the hosted option as "Tiptap Cloud" or "Tiptap Collab". — [extension-database README](https://cdn.jsdelivr.net/npm/@hocuspocus/extension-database@4.4.0/README.md), [Tiptap Cloud](https://tiptap.dev/cloud)

#### Automerge
- No confirmed commercial production users were found.
- The July 2026 Automerge blog names these projects using it:
  - Patchwork (Ink & Switch, in-house)
  - Backstitch (Godot project collaboration with branching and merging)
  - Braid (issue tracker for LLM agents)
  - Coln (pre-alpha)
  - Teamtype (formerly Ethersync; co-editing local files across editors)
  - [This Month in Automerge: July '26](https://automerge.org/blog/2026-july/)
- Infrastructure state:
  - Automerge 3.3.x and Hexane v1 (columnar storage, 2–9x speedups).
  - automerge-repo 2.6 alphas are hardening long-running sync servers.
  - The new **Subduction** sync server uses a redb backend with per-peer rate limiting. Running it on Cloudflare Durable Objects is "under consideration".
  - **Keyhive** (access control and E2EE) is still a work in progress.
  - [Automerge July '26](https://automerge.org/blog/2026-july/)
- In Nov 2025, Ink & Switch reported that the reference sync server has "memory pressure and timeouts under heavy load", and that Keyhive was nearly ready for a public debut. GAIOS (in development) uses Automerge plus Keyhive. — [Ink & Switch Dispatch 014, 2025-11-27](https://www.inkandswitch.com/newsletter/dispatch-014/)

#### Liveblocks (hosted rooms: presence, Storage, Yjs, comments, notifications)
- **Hashnode** (2024-07-02).
  - It added collaboration to its existing **Tiptap** editor using Liveblocks Sync Datastore and Text Editor (Yjs), plus Comments and Notifications through React primitives. The goal was to sell to larger organizations.
  - The DB and webhook wiring are not described.
  - [Liveblocks blog](https://liveblocks.io/blog/how-hashnode-added-collaboration-to-their-text-editor-to-sell-to-larger-organizations)
- **Resend.** A multiplayer email-broadcast editor with presence, live cursors and collaborative styling. The stack is not described. — [Liveblocks blog](https://liveblocks.io/blog/how-resend-transformed-email-collaboration-with-real-time-multiplayer-editing)
- **Vercel.** Live reactions on the Vercel Ship livestream. Only the title was seen; not fetched. — [Liveblocks blog](https://liveblocks.io/blog/how-vercel-used-live-reactions-to-improve-engagement-on-their-vercel-ship-livestream)
- **Liveblocks' own architecture** (Cloudflare case study, © 2026).
  - One Durable Object per room. R2 holds comment attachments and version histories. Queues carry messages, and Workers KV serves as an edge cache.
  - Scale: about 0.5B messages in 24h, and 60fps cursors. WebSocket Hibernation removes billable duration while idle.
  - It moved from AWS EC2 containers plus MongoDB, which were hard to scale for WebSockets.
  - [Cloudflare case study: Liveblocks](https://www.cloudflare.com/case-studies/liveblocks)
- **Customer glue for "own your data".**
  - A `ydocUpdated` webhook is throttled to **once every 60s**. Your endpoint verifies it with `WebhookHandler`, calls `getYjsDocument(roomId)` from `@liveblocks/node` and writes JSON into your own Postgres (guides exist for Supabase, Neon and PlanetScale).
  - The sample uses `insert` where it should use `upsert`.
  - [Liveblocks guide: sync Yjs to Supabase](https://liveblocks.io/docs/guides/how-to-synchronize-your-liveblocks-yjs-document-data-to-a-supabase-postgres-database)

#### Replicache / Zero (Rocicorp)
- **tldraw.com** runs Zero for app-level data (users, files, file state, workspaces). The canvas itself uses tldraw sync on Durable Objects.
  - `zero-cache` runs on **Fly.io** (region `fra`) as the Docker image `rocicorp/zero`. It needs a 1GB volume for the SQLite replica (`ZERO_REPLICA_FILE=/data/sync-replica.db`), with upstream, CVR and change DBs all pointed at the same Postgres. It has separate replication-manager and view-syncer configs. — [flyio.template.toml](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/zero-cache/flyio.template.toml)
  - Local dev runs Postgres plus pgbouncer, zero-cache, the workers and the client through process-compose. Auth is Clerk. — [apps/dotcom/README.md](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/README.md), [getAuth.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/utils/tla/getAuth.ts)
  - Postgres is **Supabase, in Frankfurt**, reached from Workers through **Hyperdrive** (fallback: pooler) with **Kysely** plus `pg`. — [postgres.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/postgres.ts), [sync-worker README](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/README.md)
  - Shared custom mutators are written with `createBuilder(schema)` and `Transaction<TlaSchema>`, with role checks and limits such as `MAX_NUMBER_OF_WORKSPACES`. There are 56 hand-written SQL migration files under `zero-cache/migrations`. — [mutators.ts](https://github.com/tldraw/tldraw/blob/main/packages/dotcom-shared/src/mutators.ts), [zero-cache/migrations](https://github.com/tldraw/tldraw/tree/main/apps/dotcom/zero-cache/migrations)
- **Ano** (Slack alternative; post dated 2026-05-12).
  - Stack: Zero, Postgres as source of truth, IndexedDB on web and SQLite on iOS, ZQL with incremental view maintenance, React hooks and Swift.
  - Mutators run on the client (optimistic) and the server (authoritative), so there is "No invalidation logic. No cache keys. No event bus." The post contrasts this with Slack-style fanout plus a Redis bus.
  - Rejected alternatives:
    - Replicache: you hand-write the read API and conflict resolution.
    - Electric: thin reactive query story.
    - PowerSync: weaker reactive reads.
    - Convex: lock-in.
    - Liveblocks: not suited to large message histories.
    - Firestore: no query language or schema.
    - Yjs/Automerge: CRDTs suit docs, not ordered message streams.
  - [HN mirror of Ano post](https://hackernews-dynamic.seasondane.workers.dev/news/48191182)
- **Suga** (cloud dev platform; reported 2026-04-14).
  - Stack: Zero with a client SQLite store and Postgres. Canvas state sits in **JSONB columns**.
  - Glue:
    - Custom mutators that read the JSONB, spread it and overwrite only the targeted fields, so two users moving different nodes don't clobber each other.
    - "Bulk" mutators that replace the whole state, used for snapshot-based undo.
    - Auth-header injection for server-to-server calls.
    - Token auth on preview domains, because cookies failed there.
  - [Pulse/The New Stack summary](https://www.pulse.bot/saas/news/from-clobbered-drafts-to-real-time-sync-8c860c40-9c87-41eb-afe2-f716434073bc/)
- **nibfont** (multiplayer font editor; 2026-03-09). Chose Zero ("just works", small client, integrates cleanly with **Drizzle**). It needed **separate infrastructure for presence and cursors and chat**, because Zero lacks realtime presence. — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- Zero 0.18 introduced custom mutators. The older RLS-style permissions are listed under "Old Stuff" on a `/deprecated/` path. — [Zero 0.18 release notes](https://zero.rocicorp.dev/docs/release-notes/0.18)

#### ElectricSQL (Postgres read-path sync over HTTP)
- Named in the 1.0 release post: **Trigger.dev** (powers Trigger.dev Realtime), **Otto** (spreadsheet where every cell is an AI agent; streams agent updates) and **IP.world** (stress-tested in production). — [Electric 1.0 release](https://electric.ax/blog/2025/03/17/electricsql-1.0-released)
- **Trigger.dev details** (2025-07-17).
  - Data flow: Postgres `runs` table, then WAL, then Electric, then HTTP long-poll (20s), then React `useRealtimeRun`.
  - Scale: about 20k updates/sec at peak, more than 500GB of inserts a day, under 100ms to browsers.
  - Glue:
    - Signed JWTs carrying per-run read scopes, so no DB lookup is needed for auth.
    - Redis Lua sliding-window concurrent-connection limits.
    - `@unkey/cache`.
    - A cache mapping each time filter to a shape ID (1-week fresh, 2-week stale), because Electric shapes need fixed WHERE clauses and "last hour" filters would create endless shapes.
  - They chose this over WebSockets to avoid initial-query-plus-separate-channel races.
  - [Trigger.dev blog](https://trigger.dev/blog/how-we-built-realtime)
- A counter-example: nibfont dropped Electric plus TanStack DB after about 2 months. Long-polling felt "slow and brittle", and writes require your own backend endpoints. — [johnny.sh, 2026-03-09](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- In April 2026 Electric introduced **Durable Streams**: append-only HTTP logs with offsets, resumable and CDN-cacheable, generalized from its sync protocol, for AI agent sessions. The stated reason is that Postgres can't absorb token-rate writes: 50 tok/s × 1,000 sessions is 50k writes/s against roughly 20k sustainable. — [Electric blog, 2026-04-08](https://deploy-preview-4204--electric-next.netlify.app/blog/2026/04/08/data-primitive-agent-loop)

#### PowerSync (Postgres/Mongo to client SQLite)
- **PrayerMate.**
  - It moved from separate native iOS and Android apps with a custom sync layer on **Firebase Realtime Database** to a single **Flutter** app with PowerSync. The backend is Amazon RDS plus a **self-hosted PostgREST** server for uploads.
  - Glue:
    - PostgREST, the biggest pain point.
    - Edge cases for first sign-in, a second device and sign-out.
    - Carrying over encryption.
    - Attachment sync.
  - Groups support was not rebuilt yet.
  - [geero.net (dated 2025-01 by URL)](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync)
- PowerSync partnered with MongoDB (2024-10-17), so MongoDB Atlas can be a source DB. — [VentureBeat/BusinessWire](https://venturebeat.com/business/powersync-partners-with-mongodb-to-offer-enterprise-grade-sync-engine/)

#### Convex, InstantDB, Jazz, Triplit
- **Convex: Conduit** (AI guest messaging for real-estate managers). It moved async work from **Amazon SQS** to the Convex scheduler, and runs external API calls in Convex Actions outside transactions. Built on it: VoIP, workflows, upsells and messaging. — [Convex case study](https://www.convex.dev/case-studies/hostai)
- **Convex: LanguageHopper.com** (Matt Luo, guest post on Convex's blog, so not independent). He chose Convex for realtime sync after evaluating Firebase, PlanetScale, Supabase and Neon. — [Convex Stack](https://stack.convex.dev/why-choose-convex-database-for-backend)
- **InstantDB.**
  - Architecture: triples in Postgres. InstaQL compiles to Datalog on the client and SQL on the server. The server tails the WAL and sends websocket invalidations. Permissions use CEL.
  - Status: **the team joined OpenAI**. Cloud signups are closed and all cloud apps shut down **2027-08-31**. The code is open source with a self-host guide.
  - No named production apps were found.
  - [Instant about](https://www.instantdb.com/about), [Instant team joins OpenAI](https://instantdb.com/essays/instant_team_joins_openai)
- **Jazz.** The showcase lists 11 apps without stating production status: Opacity, Invoice Radar, Reconfigured, Wageso, Tilly, Learn Anything, Cuppl, MTOR, Hend, Motley and Spicy Golf. — [jazz.tools/showcase](https://jazz.tools/showcase)
- **Triplit.**
  - **Acquired by Supabase on 2025-10-08**. The co-founder now works on Supabase's integrations with Electric, Zero and PowerSync. Triplit is not being built into Supabase. — [Supabase blog](https://supabase.com/blog/triplit-joins-supabase)
  - nibfont dropped it over poor better-auth integration and maintenance uncertainty. — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- **LiveStore** (bonus).
  - Runs on Cloudflare with D1 and uses one SQLite per user, which makes cross-user sharing hard (an org-level hack is needed). — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
  - Overtone is its dogfood production app. — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)

#### Cloudflare Durable Objects (and PartyKit, the Agents SDK)
- **tldraw.com (`apps/dotcom/sync-worker`, about 21,236 non-test lines across 97 files)** — [sync-worker/src](https://github.com/tldraw/tldraw/tree/main/apps/dotcom/sync-worker/src)
  - One `TLFileDurableObject` per file. It uses `SQLiteSyncStorage` through `DurableObjectSqliteSyncWrapper(ctx.storage)`. On a cold DO, it loads the snapshot from R2 and initializes SQLite. — [TLFileDurableObject.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/TLFileDurableObject.ts)
  - It throttles persistence to R2. A **version chain** of keyframe plus delta-segment objects in R2 provides history; the chain head is kept in DO storage with a fingerprint and hash check so that a woken DO doesn't append to a chain that isn't its own. — [versionChain.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/versionChain.ts)
  - All R2 operations go through one queue of 2 concurrent operations, because "Cloudflare allows at most six simultaneous open connections". — [TLFileDurableObject.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/TLFileDurableObject.ts)
  - Comments sync through the room as a separate "object lane" with per-record authorizers. They persist to **Postgres** (not the R2 blob) through a durable **outbox** (10 attempts, parked for 7 days), "so Zero replicates them to the app-level view quickly". — [TLFileDurableObject.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/TLFileDurableObject.ts), [outboxDrain.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/outboxDrain.ts)
  - Separate workers handle asset upload, image resize and user content. The sync-worker also hosts thumbnails, OG images, search, invites and an MCP server. — [apps/dotcom](https://github.com/tldraw/tldraw/tree/main/apps/dotcom)
  - SDK 4.3 (2026-01-19) made SQLite the default pluggable storage. The previous in-memory implementation "could struggle" under load and restarts. Wrappers exist for DO and Node. — [tldraw SDK 4.3](https://tldraw.dev/blog/tldraw-sdk-4.3)
  - The public starter is "the same setup that runs tldraw.com": a DO per room plus R2 assets plus bookmark unfurling. The developer supplies auth (a tokenized `uri` function), `TLAssetStore` and user store. — [tldraw collaboration docs, edited 2025-12-26](https://tldraw.dev/sdk-features/collaboration)
- **Logseq DB sync** (new database version).
  - A Cloudflare Worker with a `SyncDO` (`new_sqlite_classes`) per graph, **D1** for graph metadata and usage stats, and **R2** (`logseq-sync-assets-prod`) for assets. A Node.js adapter supports self-hosting. — [wrangler.toml](https://github.com/logseq/logseq/blob/master/deps/db-sync/worker/wrangler.toml), [db-sync README](https://github.com/logseq/logseq/blob/master/deps/db-sync/README.md)
  - The protocol is JSON messages carrying Transit-encoded Datascript tx-data. — [protocol.cljs](https://github.com/logseq/logseq/blob/master/deps/db-sync/src/logseq/db_sync/protocol.cljs)
  - Glue includes: checksum and drift-finding tools, an E2EE handler, personal access tokens, semantic search, asset handlers, and D1 SQL migrations applied in CI (not at runtime). Review rules require versioned protocol changes, idempotent retries and old-client/new-server compatibility. About 10,157 lines. — [db-sync review rules](https://github.com/logseq/logseq/blob/master/.agents/skills/logseq-review-workflow/rules/modules/db-sync.md), [db_sync source](https://github.com/logseq/logseq/tree/master/deps/db-sync/src/logseq/db_sync)
- **Liveblocks** runs on DOs (above). It is the named customer on Cloudflare's DO product page ("Using Durable Objects, we can provide serverless capabilities without a dedicated team"). — [Cloudflare DO page](https://www.cloudflare.com/developer-platform/products/durable-objects/)
- **Cloudflare Agents SDK.** "Each agent session has a durable identity, local SQL storage, real-time connections", plus scheduling. `PiHarness` stores agent state in the DO's SQLite and resumes after eviction. — [Cloudflare Agents docs](https://developers.cloudflare.com/agents/)
- **PartyKit** (acquired by Cloudflare) is an open-source platform for multiplayer apps built on Durable Objects, with Yjs and React integrations. The acquisition page shown did not display a date. — [Cloudflare blog](https://blog.cloudflare.com/de-de/cloudflare-acquires-partykit)
- **y-durableobjects** runs Yjs on Workers/DOs "eliminating Node.js dependencies", with a Hono route (`yRoute`), `getYDoc()`/`updateYDoc()` RPC and requires Hono ≥4.3. — [napolab/y-durableobjects](https://github.com/napolab/y-durableobjects)
- **Drizzle on DO SQLite.** Use `drizzle-orm/durable-sqlite` and run migrations in the constructor inside `ctx.blockConcurrencyWhile`. Do all DB work inside one DO method to avoid an RPC per query. — [Drizzle docs](https://orm.drizzle.team/docs/connect-cloudflare-do)

#### Supabase Realtime and Firebase/Firestore
- **Supabase as Postgres host.** tldraw.com's Postgres (upstream for Zero) is on Supabase. — [postgres.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/postgres.ts)
- **Supabase Realtime guidance.** Supabase now steers users from "Postgres Changes" to **Broadcast from Database**, because Postgres Changes "has some limitations as your application scales". This needs:
  - A per-table trigger calling `realtime.broadcast_changes`.
  - An RLS policy on `realtime.messages`.
  - A client call to `setAuth()` before subscribing.
  - [Supabase docs](https://supabase.com/docs/guides/realtime/migrate-from-postgres-changes)
- **Excalidraw (excalidraw.com) uses Firebase for persistence only.**
  - It uses Firestore (`runTransaction` on a scene doc holding `sceneVersion`, IV and ciphertext) and Firebase Storage for files. — [firebase.ts](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/data/firebase.ts)
  - The room key lives in the URL fragment (`#room=<id>,<key>`). — [data/index.ts](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/data/index.ts)
  - Live traffic goes through a separate socket.io relay, **excalidraw-room**: about 153 lines that just broadcast `encryptedData, iv` to the room, plus volatile broadcasts and follow-mode. It was last committed in Dec 2023. — [excalidraw-room src/index.ts](https://github.com/excalidraw/excalidraw-room/blob/master/src/index.ts)
  - Clients reconcile elements by `version`, then a `versionNonce` tiebreak, and order them by fractional index. — [PyShine source tour, 2026-09-30](https://pyshine.com/Excalidraw-Virtual-Whiteboard-Source-Tour/)
- **PrayerMate's earlier sync** was a custom layer on Firebase RTDB, "never really intended" for its use case, and the main source of bug reports. — [geero.net](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync)

#### PocketBase
- At v0.41.1 PocketBase is a volunteer project. It scales "Only on a single server, aka. vertical", and claims 10,000+ realtime connections on a $4 Hetzner VPS. Litestream is recommended for backup and replication. The FAQ names no adopters. — [PocketBase FAQ](https://pocketbase.io/faq/)

#### Colyseus and LiveKit
- **Colyseus.**
  - Server-authoritative Node.js rooms with binary schema state sync, matchmaking and Colyseus Cloud (32 locations, from $15/mo).
  - Named games:
    - **Pixels.xyz**, **Bloxd.io**, **Kirka.io**, **Make it Meme**, **SongTrivia2** (TypeScript clients)
    - Eleven Puzzles' *Unboxing the Cryptic Killer* (Unity)
    - *Raft Wars Multiplayer* (Defold)
  - Eleven Puzzles says its operating cost was "substantially lower than alternatives".
  - [colyseus.io](https://colyseus.io)
- **LiveKit: OpenAI ChatGPT Advanced Voice** (2024-10-03).
  - The ChatGPT app embeds the LiveKit client SDK. Audio goes over **WebRTC** to LiveKit Cloud. A server-side agent (`MultimodalAgent`) bridges to GPT-4o over a **WebSocket** (the Realtime API).
  - The framework handles buffered playback, interruption with context rollback, function calling, load balancing and failover, and Twilio/Telnyx telephony.
  - LiveKit argues WebSockets handle packet loss poorly on client links.
  - [LiveKit blog](https://livekit.com/blog/openai-livekit-partnership-advanced-voice-realtime-api)
- A JSNation 2026 talk (2026-06-15) says ChatGPT voice shipped on LiveKit's open-source stack by Sept 2023. It recommends warm idle pools of agent processes. — [GitNation](https://gitnation.com/contents/open-source-voice-ai-how-we-built-chatgpts-voice-mode-infrastructure)
- **xAI / "SpaceXAI" Grok Voice** models became available inside LiveKit Agents (2026-08-21). The joint patient-intake agent uses a cascaded STT→LLM→TTS pipeline over SIP. — [x.ai story](https://x.ai/stories/livekit)

#### Drizzle vs Prisma
- **A team that moved Prisma → Drizzle** (PkgPulse, 2026-03-08).
  - Reasons: Prisma's query engine binary didn't run in V8 isolates (Vercel Edge, Cloudflare Workers), plus bundle size and opaque generated SQL.
  - Losses: `prisma migrate dev`, Studio and concise `include`/`_count`. A 4-join report took 35–40 lines in Drizzle against 10–12 in Prisma.
  - Effort: about 3h for the schema and about 2 days for queries.
  - [PkgPulse](https://www.pkgpulse.com/guides/why-i-switched-prisma-to-drizzle-almost-back)
- **Prisma 7** (2025-11-19) shipped a Rust-free TypeScript client (`provider = "prisma-client"`): 90% smaller bundle, 3x faster queries and simpler deploys to Vercel Edge and Cloudflare Workers. That removes the main edge reason people left. — [Prisma 7 announcement](https://prisma.io/blog/announcing-prisma-orm-7-0-0)
- ORMs found in collaborative apps' source:
  - AFFiNE: **Prisma**, storing Yjs blobs as `Bytes @db.ByteA`. — [schema.prisma](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/schema.prisma)
  - tldraw: **Kysely** on Workers through Hyperdrive. — [postgres.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/postgres.ts)
  - Outline: **Sequelize**. — [package.json](https://github.com/outline/outline/blob/main/package.json)
  - HedgeDoc: **knex**. — [backend package.json](https://github.com/hedgedoc/hedgedoc/blob/develop/backend/package.json)
  - nibfont: **Drizzle with Zero**. — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)

#### Server-authoritative custom engines (Figma, Linear) for reference
- **Figma** (2022-10-20).
  - A Rust multiplayer service holds each open file in memory over websockets. A **DynamoDB journal** records sequence-numbered changes about every 0.5s, and **S3 checkpoints** of the whole file are written every 30–60s. Recovery is checkpoint plus journal replay.
  - A DynamoDB lock table lets only one instance write a file's journal.
  - Postgres was rejected for the journal because of write volume.
  - Results: 95% of edits are saved within about 600ms; 2.2B changes a day.
  - [Figma blog](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **Figma LiveGraph** handles non-file data (comments and similar). It tails the Postgres WAL. The new design ("LiveGraph 100x", in Go) has three parts: edge, a read-through cache sharded by query hash, and an invalidator per shard. — [Figma LiveGraph blog](https://www.figma.com/blog/livegraph-real-time-data-at-scale/)
- **Linear.**
  - Client: a MobX object graph plus IndexedDB, with a persisted transaction queue. Writes go out as GraphQL mutations; the server pushes delta packets over a WebSocket ordered by `lastSyncId`.
  - Loading: full, partial or local bootstrap, lazy hydration, and rollback on rejection.
  - Conflicts: last-write-wins for most data; CRDT only for issue descriptions.
  - [fujimon.com, 2024-08-14](https://www.fujimon.com/blog/linear-sync-engine), [reverse-linear-sync-engine (CTO: "probably the best documentation that exists")](https://github.com/wzhudev/reverse-linear-sync-engine)

### Inferences
- The "two-tier" pattern recurs across very different tools:
  - tldraw: DO plus R2 for canvas; Postgres plus Zero for file lists, users and comments.
  - Figma: multiplayer plus S3/DynamoDB for files; LiveGraph plus Postgres for everything else.
  - Plane and Outline: Yjs for page body; relational rows for everything else.
- In the user's Item/List/Page vocabulary, "Page" bodies map to the document tier and "List" membership and permissions map to the metadata tier.
- The cleanest Yjs adopters store the Yjs binary as the source of truth (Outline, AFFiNE, HedgeDoc). Teams that keep HTML or JSON as the source of truth and convert on each load (Ghostwriter) lose history and get overwrite bugs.
- Plane stores both, plus HTML and JSON derivations for rendering and search. That costs triple writes but keeps REST consumers working.
- Hosted options (Liveblocks, Convex, Instant) cut server code, but Instant's shutdown and Triplit's acquisition show the platform risk is real within 12–18 months.

### Gaps
- Evernote's editor stack, Linear's choice of CRDT library for descriptions, and whether tldraw.com previously used Yjs: no reliable sources found.
- Named Supabase Realtime production adopters with engineering write-ups: none found, only tutorials and Supabase docs.
- PowerSync beyond PrayerMate: no other named customer write-up was fetched.
- PocketBase production adopters: none named in primary sources.
- Resend, Vercel and Hashnode back-end wiring for Liveblocks (webhook vs REST, DB) is not described in the case studies.
- The PartyKit acquisition date was not shown on the fetched page (widely reported as 2024; not verified here).

---

## Q2. Per-tool compatibility dataset: pairs with / alternatives / avoid with

### Takeaway
The consistent pairing rules:
- CRDT libraries pair with a websocket room server plus blob/bytea persistence.
- Query-sync engines (Zero, Electric, PowerSync) pair with Postgres and need a separate presence channel.
- Durable Objects pair with DO-SQLite, R2 and D1/Hyperdrive, and clash with Node-only servers.
- The most common real conflict is two writers to the same state: REST/ORM writes to fields that a live CRDT session also owns.

### Cited Findings
Format: each entry is *Tool/Pairing — reason — basis*. "Inferred" means my judgment from the cited fact.

#### Yjs
- **Pairs with**
  - Hocuspocus — Node room server with persistence, auth and Redis extensions — Outline, Plane, Huly ([Outline](https://github.com/outline/outline/blob/main/package.json), [Plane](https://github.com/makeplane/plane/blob/preview/apps/live/src/extensions/database.ts), [Huly](https://github.com/hcengineering/platform/blob/develop/server/collaborator/package.json))
  - y-prosemirror / Tiptap / Lexical — editor bindings — Outline (y-prosemirror), Ghostwriter (Tiptap), Proton Docs (`@lexical/yjs`) ([Outline](https://github.com/outline/outline/blob/main/package.json), [SpecterOps](https://specterops.io/blog/2025/06/18/ghostwriter-v6-introducing-collaborative-editing/), [Proton](https://github.com/ProtonMail/WebClients/blob/main/applications/docs-editor/package.json))
  - Postgres bytea column or table — store the encoded state or updates — Outline `Document.state`, AFFiNE `updates`/`snapshots` ([Outline](https://github.com/outline/outline/blob/main/server/commands/documentCollaborativeUpdater.ts), [AFFiNE](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/schema.prisma))
  - Redis pub/sub — multi-instance fanout and out-of-band update notices — Outline, Plane ([APIUpdateExtension](https://github.com/outline/outline/blob/main/server/collaboration/APIUpdateExtension.ts), [Plane live](https://github.com/makeplane/plane/tree/preview/apps/live/src/extensions))
  - y-indexeddb — client offline cache — Plane ([Instagit](https://instagit.com/makeplane/plane/plane-live-app-realtime-collaboration/))
  - pycrdt / y-crdt (Rust) — non-JS servers that speak the Yjs format — JupyterLab; AFFiNE's y-octo native merge ([Jupyter](https://github.com/jupyterlab/jupyter-collaboration/blob/main/projects/jupyter-server-ydoc/pyproject.toml), [AFFiNE](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/src/core/doc/merge-updates.ts))
  - Liveblocks or Tiptap Cloud — hosted Yjs backend — Hashnode ([Liveblocks](https://liveblocks.io/blog/how-hashnode-added-collaboration-to-their-text-editor-to-sell-to-larger-organizations))
  - y-durableobjects or PartyKit — Yjs rooms on Cloudflare ([y-durableobjects](https://github.com/napolab/y-durableobjects), [Cloudflare/PartyKit](https://blog.cloudflare.com/de-de/cloudflare-acquires-partykit))
  - Client-side encryption — the server relays and stores opaque commits; clients squash — Proton Docs ([SquashDocument.ts](https://github.com/ProtonMail/WebClients/blob/main/packages/docs-core/lib/UseCase/SquashDocument.ts))
- **Alternatives**
  - Automerge, Loro — other CRDT libraries ([Automerge](https://automerge.org/blog/2026-july/), [PkgPulse comparison](https://www.pkgpulse.com/guides/yjs-vs-automerge-vs-loro-crdt-libraries-2026))
  - tldraw sync — server-authoritative per-record diffs, not a CRDT ([tldraw docs](https://tldraw.dev/sdk-features/collaboration))
  - Liveblocks Storage (LiveObject/LiveList) — hosted structured state ([Liveblocks Yjs docs](https://liveblocks.io/docs/products/sync/text-editing/yjs))
- **Avoid with**
  - REST/ORM writes to the same field while a Yjs session is open — they get overwritten unless you build a merge-in path. Outline built a Redis-driven `APIUpdateExtension`; Ghostwriter removed features instead ([Outline](https://github.com/outline/outline/blob/main/server/collaboration/APIUpdateExtension.ts), [SpecterOps](https://specterops.io/blog/2025/06/18/ghostwriter-v6-introducing-collaborative-editing/))
  - HTML/JSON as the source of truth with Yjs regenerated per load — loses CRDT history and needs stale-client UUID guards — Ghostwriter ([SpecterOps](https://specterops.io/blog/2025/06/18/ghostwriter-v6-introducing-collaborative-editing/))
  - Ordered message streams / chat history — CRDTs "fit documents, not ordered message streams" (Ano's judgment) ([Ano](https://hackernews-dynamic.seasondane.workers.dev/news/48191182))
  - Node-only y-websocket / Hocuspocus server on Workers — y-durableobjects exists to remove Node deps (inferred) ([y-durableobjects](https://github.com/napolab/y-durableobjects))

#### Hocuspocus
- **Pairs with**
  - Tiptap — same vendor (ueberdosis); Ghostwriter ([SpecterOps](https://specterops.io/blog/2025/06/18/ghostwriter-v6-introducing-collaborative-editing/))
  - `extension-database` with an HTTP API backend — Plane calls Django for fetch and store ([Plane](https://github.com/makeplane/plane/blob/preview/apps/live/src/extensions/database.ts))
  - `extension-redis` and `extension-throttle` — horizontal scale and abuse limits — Outline ([Outline](https://github.com/outline/outline/blob/main/package.json))
  - Hasura/GraphQL — reuse an existing API for load and save — Ghostwriter ([SpecterOps](https://specterops.io/blog/2025/06/18/ghostwriter-v6-introducing-collaborative-editing/))
- **Alternatives**
  - y-websocket, y-durableobjects, PartyKit, Liveblocks Yjs, Tiptap Cloud ([y-durableobjects](https://github.com/napolab/y-durableobjects), [Liveblocks](https://liveblocks.io/docs/products/document/yjs), [Tiptap Cloud](https://tiptap.dev/cloud))
- **Avoid with**
  - Cloudflare Workers/DO runtime — Hocuspocus is a Node server (inferred from the Node-dependency note) ([y-durableobjects](https://github.com/napolab/y-durableobjects))
  - Default `onChange` timing for attribution or "dirty" tracking — Outline found it runs too late and hooked the ydoc `update` event directly ([PersistenceExtension.ts](https://github.com/outline/outline/blob/main/server/collaboration/PersistenceExtension.ts))

#### Automerge
- **Pairs with**
  - automerge-repo — storage and network adapters ([Automerge blog](https://automerge.org/blog/2026-july/))
  - Subduction sync server (redb backend) ([Automerge blog](https://automerge.org/blog/2026-july/))
  - Keyhive — access control and E2EE, still a work in progress ([Dispatch 014](https://www.inkandswitch.com/newsletter/dispatch-014/))
  - Local files / editors — Teamtype ([Automerge blog](https://automerge.org/blog/2026-july/))
- **Alternatives**
  - Yjs, Loro ([PkgPulse comparison](https://www.pkgpulse.com/guides/yjs-vs-automerge-vs-loro-crdt-libraries-2026))
- **Avoid with**
  - The reference sync server under heavy multi-document load — memory pressure and timeouts reported in Nov 2025 ([Dispatch 014](https://www.inkandswitch.com/newsletter/dispatch-014/))
  - Durable Objects hosting — not yet supported, only "under consideration" ([Automerge blog](https://automerge.org/blog/2026-july/))

#### Liveblocks
- **Pairs with**
  - Tiptap or Lexical plus React/Next.js — Hashnode ([Liveblocks](https://liveblocks.io/blog/how-hashnode-added-collaboration-to-their-text-editor-to-sell-to-larger-organizations))
  - Your own Postgres through the `ydocUpdated` webhook (60s throttle) plus `@liveblocks/node` ([Liveblocks guide](https://liveblocks.io/docs/guides/how-to-synchronize-your-liveblocks-yjs-document-data-to-a-supabase-postgres-database))
  - Liveblocks Comments and Notifications — Hashnode ([Liveblocks](https://liveblocks.io/blog/how-hashnode-added-collaboration-to-their-text-editor-to-sell-to-larger-organizations))
- **Alternatives**
  - Self-hosted Yjs plus Hocuspocus; PartyKit/DO; Convex for app state ([Ano's comparison](https://hackernews-dynamic.seasondane.workers.dev/news/48191182))
- **Avoid with**
  - Large message histories or chat — Ano's judgment ([Ano](https://hackernews-dynamic.seasondane.workers.dev/news/48191182))
  - Needing your DB to be up to date within seconds — the webhook is throttled to 60s (inferred) ([Liveblocks guide](https://liveblocks.io/docs/guides/how-to-synchronize-your-liveblocks-yjs-document-data-to-a-supabase-postgres-database))

#### Zero (and Replicache)
- **Pairs with**
  - Postgres with logical replication — upstream source of truth — tldraw, Ano, Suga ([tldraw Fly config](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/zero-cache/flyio.template.toml), [Ano](https://hackernews-dynamic.seasondane.workers.dev/news/48191182))
  - Supabase Postgres via pgbouncer/Hyperdrive — tldraw ([postgres.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/postgres.ts))
  - Fly.io (long-lived host with a disk volume) for zero-cache — tldraw ([flyio.template.toml](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/zero-cache/flyio.template.toml))
  - Drizzle for schema — nibfont ([johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026))
  - Clerk auth — tldraw ([getAuth.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/utils/tla/getAuth.ts))
  - React hooks, plus Swift on iOS — Ano ([Ano](https://hackernews-dynamic.seasondane.workers.dev/news/48191182))
  - A per-document realtime room (DO) for heavy canvas data, with Zero for metadata — tldraw ([TLFileDurableObject.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/TLFileDurableObject.ts))
  - A separate presence/cursor channel — nibfont ([johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026))
- **Alternatives**
  - Electric, PowerSync, Convex, InstantDB, Triplit, LiveStore, Replicache (predecessor; you hand-write reads and conflicts) ([Ano](https://hackernews-dynamic.seasondane.workers.dev/news/48191182), [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026))
- **Avoid with**
  - Hosting zero-cache on Workers — it needs a persistent SQLite replica file and always-on machines (`auto_stop_machines="off"`) (inferred) ([flyio.template.toml](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/zero-cache/flyio.template.toml))
  - High-frequency ephemeral state (cursors, presence) — no presence support ([johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026))
  - Whole-document JSONB blobs written by default mutators — concurrent writers clobber each other; field-merge mutators are needed — Suga ([Pulse](https://www.pulse.bot/saas/news/from-clobbered-drafts-to-real-time-sync-8c860c40-9c87-41eb-afe2-f716434073bc/))
  - Cookie auth on dynamic preview domains — Suga switched to tokens ([Pulse](https://www.pulse.bot/saas/news/from-clobbered-drafts-to-real-time-sync-8c860c40-9c87-41eb-afe2-f716434073bc/))

#### ElectricSQL
- **Pairs with**
  - Postgres plus a WAL replication slot — Trigger.dev ([Trigger.dev](https://trigger.dev/blog/how-we-built-realtime))
  - A JWT-scoped auth proxy plus Redis rate limiting — Trigger.dev ([Trigger.dev](https://trigger.dev/blog/how-we-built-realtime))
  - React hooks / TanStack DB — Trigger.dev, nibfont ([Trigger.dev](https://trigger.dev/blog/how-we-built-realtime), [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026))
  - CDN/HTTP caching — the sync protocol is plain HTTP ([Electric blog](https://deploy-preview-4204--electric-next.netlify.app/blog/2026/04/08/data-primitive-agent-loop))
  - Durable Streams for AI token streams ([Electric blog](https://deploy-preview-4204--electric-next.netlify.app/blog/2026/04/08/data-primitive-agent-loop))
- **Alternatives**
  - Zero, PowerSync, Supabase Realtime, Convex ([johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026))
- **Avoid with**
  - Dynamic WHERE clauses (time windows) — shapes explode, so a shape-ID cache is needed — Trigger.dev ([Trigger.dev](https://trigger.dev/blog/how-we-built-realtime))
  - Expecting a built-in write path — you build backend endpoints ([johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026))
  - Postgres as the sink for token-rate agent output — about 50k writes/s exceeds roughly 20k sustainable ([Electric blog](https://deploy-preview-4204--electric-next.netlify.app/blog/2026/04/08/data-primitive-agent-loop))

#### PowerSync
- **Pairs with**
  - Postgres (RDS) plus PostgREST or your own API for uploads, a Flutter SDK and client SQLite — PrayerMate ([geero.net](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync))
  - MongoDB Atlas ([VentureBeat](https://venturebeat.com/business/powersync-partners-with-mongodb-to-offer-enterprise-grade-sync-engine/))
  - Supabase as host — Supabase is working on integrations ([Supabase](https://supabase.com/blog/triplit-joins-supabase))
- **Alternatives**
  - Electric, Zero, Firebase RTDB/Firestore (what PrayerMate replaced) ([geero.net](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync))
- **Avoid with**
  - Running a PostgREST layer you don't otherwise need — PrayerMate's biggest setup pain ([geero.net](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync))
  - Fine-grained reactive UI invalidation expectations — "weaker on reactive reads" (Ano's opinion) ([Ano](https://hackernews-dynamic.seasondane.workers.dev/news/48191182))

#### Convex
- **Pairs with**
  - React/Next.js; the Convex scheduler (replaces SQS); Actions for external APIs — Conduit ([Convex case study](https://www.convex.dev/case-studies/hostai))
- **Alternatives**
  - Firebase, Supabase, InstantDB, Zero ([Convex Stack](https://stack.convex.dev/why-choose-convex-database-for-backend))
- **Avoid with**
  - A separate external queue such as SQS — it duplicates the scheduler; Conduit removed SQS ([Convex case study](https://www.convex.dev/case-studies/hostai))
  - A separate ORM or Postgres for the same data — Convex is the database. LanguageHopper used Drizzle only with other DBs (inferred) ([Convex Stack](https://stack.convex.dev/why-choose-convex-database-for-backend))
  - A requirement to own Postgres — "hosted lock-in" (Ano) ([Ano](https://hackernews-dynamic.seasondane.workers.dev/news/48191182))

#### InstantDB / Triplit / Jazz
- **InstantDB**
  - Pairs with: React; Postgres underneath; CEL permissions ([Instant](https://www.instantdb.com/about))
  - Alternatives: Convex, Firebase, Zero ([Instant](https://www.instantdb.com/about))
  - Avoid with: new production use on Instant Cloud — shutdown on 2027-08-31 ([Instant essay](https://instantdb.com/essays/instant_team_joins_openai))
- **Triplit**
  - Avoid with: better-auth (integration friction, per nibfont) and long-term reliance, since it is community-maintained after the Supabase acquisition ([johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026), [Supabase](https://supabase.com/blog/triplit-joins-supabase))
- **Jazz**
  - Alternatives: Evolu, Convex, Zero ([johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026))
  - The adopter list is in the [showcase](https://jazz.tools/showcase); no pairing write-ups were found.

#### Cloudflare Durable Objects
- **Pairs with**
  - DO-embedded SQLite (`new_sqlite_classes`) — tldraw `SQLiteSyncStorage`, Logseq `SyncDO` ([tldraw](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/TLFileDurableObject.ts), [Logseq](https://github.com/logseq/logseq/blob/master/deps/db-sync/worker/wrangler.toml))
  - R2 for snapshots, history and assets — tldraw, Logseq, Liveblocks ([tldraw](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/versionChain.ts), [Liveblocks](https://www.cloudflare.com/case-studies/liveblocks))
  - D1 for cross-document metadata — Logseq ([Logseq README](https://github.com/logseq/logseq/blob/master/deps/db-sync/README.md))
  - Hyperdrive to external Postgres — tldraw ([postgres.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/postgres.ts))
  - Queues and KV — Liveblocks ([Cloudflare case study](https://www.cloudflare.com/case-studies/liveblocks))
  - WebSocket Hibernation — idle rooms stop billing — Liveblocks ([Cloudflare case study](https://www.cloudflare.com/case-studies/liveblocks))
  - Drizzle `durable-sqlite` ([Drizzle](https://orm.drizzle.team/docs/connect-cloudflare-do))
  - Hono plus y-durableobjects ([y-durableobjects](https://github.com/napolab/y-durableobjects))
  - Agents SDK ([Cloudflare](https://developers.cloudflare.com/agents/))
  - Kysely plus `pg` on Workers — tldraw ([postgres.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/postgres.ts))
- **Alternatives**
  - A long-lived Node room server (Hocuspocus, Colyseus) on Fly or a VM; hosted Liveblocks; a Figma-style custom server ([Colyseus](https://colyseus.io), [Figma](https://www.figma.com/blog/making-multiplayer-more-reliable/))
- **Avoid with**
  - Node-only servers or native binaries — Hocuspocus/y-websocket servers, and Prisma ≤6's Rust engine ([y-durableobjects](https://github.com/napolab/y-durableobjects), [PkgPulse](https://www.pkgpulse.com/guides/why-i-switched-prisma-to-drizzle-almost-back))
  - Unbounded parallel R2/fetch calls from one DO — six-connection limit; tldraw caps R2 at 2 in-flight ([TLFileDurableObject.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/TLFileDurableObject.ts))
  - Cross-document queries inside DOs — use D1 or Postgres for lists and search (Logseq D1; tldraw Postgres plus Zero) (inferred) ([Logseq](https://github.com/logseq/logseq/blob/master/deps/db-sync/README.md))
  - Runtime schema migration — Logseq requires CI-applied D1 migrations; Drizzle requires migrating inside `blockConcurrencyWhile` ([Logseq rules](https://github.com/logseq/logseq/blob/master/.agents/skills/logseq-review-workflow/rules/modules/db-sync.md), [Drizzle](https://orm.drizzle.team/docs/connect-cloudflare-do))
  - Hosting Zero's zero-cache — tldraw runs it on Fly instead (inferred) ([flyio.template.toml](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/zero-cache/flyio.template.toml))

#### Supabase Realtime
- **Pairs with**
  - Supabase Postgres plus RLS on `realtime.messages`, plus `broadcast_changes` triggers ([Supabase docs](https://supabase.com/docs/guides/realtime/migrate-from-postgres-changes))
  - Presence-based cursor components ([Supabase realtime-cursor](https://supabase.com/ui/docs/nextjs/realtime-cursor))
  - As a Postgres host for Zero, Electric or PowerSync — tldraw; Supabase's integration push ([postgres.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/postgres.ts), [Supabase](https://supabase.com/blog/triplit-joins-supabase))
- **Alternatives**
  - Firebase, Convex, Liveblocks presence, Electric (read-path sync)
- **Avoid with**
  - "Postgres Changes" at scale — Supabase itself recommends Broadcast ([Supabase docs](https://supabase.com/docs/guides/realtime/migrate-from-postgres-changes))
  - A second sync engine listening to the same tables and pushing to the same UI state — two owners of client state (inferred)

#### Firebase / Firestore
- **Pairs with**
  - A separate websocket relay for live traffic, with Firestore for durable encrypted snapshots and Firebase Storage for files — Excalidraw ([firebase.ts](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/data/firebase.ts), [excalidraw-room](https://github.com/excalidraw/excalidraw-room/blob/master/src/index.ts))
- **Alternatives**
  - Supabase, Convex, InstantDB, PowerSync (PrayerMate's replacement) ([geero.net](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync))
- **Avoid with**
  - A hand-built cross-platform offline-sync layer on top of RTDB — PrayerMate's main bug source ([geero.net](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync))
  - Relational/query-heavy app state — "no real query language or schema" (Ano's opinion) ([Ano](https://hackernews-dynamic.seasondane.workers.dev/news/48191182))

#### PocketBase
- **Pairs with**
  - Litestream for replication and backup; a single VPS ([PocketBase FAQ](https://pocketbase.io/faq/))
- **Alternatives**
  - Supabase, Firebase, Convex ([dev.to comparison](https://dev.to/truongandev/pocketbase-vs-supabase-which-backend-wins-in-2026-55ab))
- **Avoid with**
  - Horizontal or multi-region scaling — vertical only ([PocketBase FAQ](https://pocketbase.io/faq/))

#### Colyseus
- **Pairs with**
  - Node hosting (AWS, Fly, Railway), Unity/Defold/JS clients, Colyseus Cloud ([colyseus.io](https://colyseus.io))
- **Alternatives**
  - DO-based rooms (PartyKit), custom websocket servers
- **Avoid with**
  - The Workers runtime — it is "a standard Node.js application" (inferred) ([colyseus.io](https://colyseus.io))
  - Long-lived document persistence — room state is in-memory and authoritative, so durable storage is BYO (inferred)

#### LiveKit
- **Pairs with**
  - OpenAI Realtime API over a server-side WebSocket; WebRTC to clients; Twilio/Telnyx SIP; Agents framework (Python/Node) ([LiveKit](https://livekit.com/blog/openai-livekit-partnership-advanced-voice-realtime-api))
  - Grok Voice via LiveKit Inference ([x.ai](https://x.ai/stories/livekit))
- **Alternatives**
  - Raw WebRTC (LiveKit says it's hard at scale) ([LiveKit](https://livekit.com/blog/openai-livekit-partnership-advanced-voice-realtime-api))
- **Avoid with**
  - Client-side WebSockets for audio — poor packet-loss behaviour, per LiveKit ([LiveKit](https://livekit.com/blog/openai-livekit-partnership-advanced-voice-realtime-api))
  - Using it as a document sync layer — it is a media/data-channel layer (inferred)

#### Drizzle
- **Pairs with**
  - Workers/edge, DO SQLite (`durable-sqlite`), D1, Zero (nibfont), Neon/PlanetScale ([Drizzle](https://orm.drizzle.team/docs/connect-cloudflare-do), [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026), [Convex Stack](https://stack.convex.dev/why-choose-convex-database-for-backend))
- **Alternatives**
  - Prisma, Kysely (tldraw), Sequelize (Outline), knex (HedgeDoc) ([postgres.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/postgres.ts))
- **Avoid with**
  - DO code paths that query before migrations finish — migrate in `blockConcurrencyWhile` ([Drizzle](https://orm.drizzle.team/docs/connect-cloudflare-do))
  - Teams relying on Prisma-style `include` for complex reports — 3–4x more lines ([PkgPulse](https://www.pkgpulse.com/guides/why-i-switched-prisma-to-drizzle-almost-back))

#### Prisma
- **Pairs with**
  - NestJS plus Postgres, including bytea blobs for CRDT updates — AFFiNE ([schema.prisma](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/schema.prisma))
  - Prisma 7's Rust-free client on Workers/Edge ([Prisma 7](https://prisma.io/blog/announcing-prisma-orm-7-0-0))
- **Alternatives**
  - Drizzle, Kysely
- **Avoid with**
  - Pre-v7 Prisma on V8 isolates — engine binary ([PkgPulse](https://www.pkgpulse.com/guides/why-i-switched-prisma-to-drizzle-almost-back))

### Inferences
- "Avoid with" conflicts fall into four families:
  1. Runtime mismatch (Node servers on Workers).
  2. Dual ownership of the same state (REST writes vs live CRDT; two sync engines on one table).
  3. Wrong data shape for the engine (CRDT for chat, query-sync for cursors, JSONB doc blobs in row-sync).
  4. Platform lifecycle risk (Instant, Triplit).
- For a Cloudflare-leaning stack, the friction points are zero-cache (needs Fly or a VM), Hocuspocus (needs Node) and Prisma ≤6. DO-native options are tldraw sync-core, y-durableobjects, PartyKit/partyserver, the Agents SDK, and Drizzle/Kysely.

### Gaps
- No verified sources on Loro production adopters, y-sweet/Jamsocket adopters, or Hocuspocus 4 runtime support (the fetched page lacked details).
- No primary source naming a team that ran two sync engines on the same tables and backed out. That "avoid" entry is inferred.

---

## Q3. Open-source collaborative apps you can read: sync and storage stack in a line or two

### Takeaway
Of 16 readable codebases:
- 7 use Yjs: Outline, Plane, AFFiNE, Huly, HedgeDoc, Proton Docs, and JupyterLab via pycrdt.
- 2 use a Durable Object per document: tldraw, Logseq DB.
- 2 use custom server-authoritative change logs: Penpot, Excalidraw.
- 5 use their own log or snapshot sync: Actual, Trilium, SiYuan, Anytype, Obsidian (closed).
Nearly all keep blobs in S3/R2/MinIO and metadata in Postgres or SQLite.

### Cited Findings
- **tldraw (tldraw.com).** A DO per file with DO-SQLite (`SQLiteSyncStorage`). Snapshots and a keyframe+delta version chain go to R2; assets go to R2 through separate workers. App metadata lives in Supabase Postgres via Hyperdrive/Kysely and syncs to clients via Zero (zero-cache on Fly). Auth is Clerk. — [sync-worker](https://github.com/tldraw/tldraw/tree/main/apps/dotcom/sync-worker/src), [zero-cache](https://github.com/tldraw/tldraw/tree/main/apps/dotcom/zero-cache)
- **Excalidraw.** A stateless socket.io relay (excalidraw-room) forwards AES-GCM-encrypted scene diffs. Encrypted scenes persist in Firestore and files in Firebase Storage. The key is in the URL fragment, and clients reconcile by element version and versionNonce. — [excalidraw-room](https://github.com/excalidraw/excalidraw-room/blob/master/src/index.ts), [firebase.ts](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/data/firebase.ts)
- **AFFiNE.** BlockSuite on Yjs (Rust y-octo for server merges). Socket.io carries doc updates and awareness. NestJS with Prisma stores updates, snapshots and snapshot_histories in Postgres; blobs go to S3 or the filesystem; the client caches in IndexedDB. — [schema.prisma](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/schema.prisma), [architecture](https://www.mintlify.com/toeverything/AFFiNE/contributing/architecture)
- **Outline.** Hocuspocus 1.1.3 (Redis and throttle extensions) plus y-prosemirror. The Yjs state goes in the `documents.state` Postgres column, with ProseMirror JSON alongside, via Sequelize. REST edits are merged into live docs via Redis pub/sub. — [PersistenceExtension.ts](https://github.com/outline/outline/blob/main/server/collaboration/PersistenceExtension.ts)
- **Plane.** A Node "live" service runs Hocuspocus with database and Redis extensions. Persistence goes through the Django REST API into Postgres as `description_binary`, `description_html` and `description_json`. The client caches with y-indexeddb. — [database.ts](https://github.com/makeplane/plane/blob/preview/apps/live/src/extensions/database.ts)
- **Penpot.**
  - Clojure backend on Postgres. Clients send change vectors with `revn`/`vern`; the server takes a transaction-level lock per file (`xact-lock!`) and rejects stale `revn` with `:revn-conflict` after replaying "lagged changes". — [files_update.clj](https://github.com/penpot/penpot/blob/develop/backend/src/app/rpc/commands/files_update.clj)
  - Fanout uses a Redis-backed msgbus to websocket subscribers. — [msgbus.clj](https://github.com/penpot/penpot/blob/develop/backend/src/app/msgbus.clj), [websocket.clj](https://github.com/penpot/penpot/blob/develop/backend/src/app/http/websocket.clj)
  - File data can live in a "storage" (object storage/S3) backend rather than in the DB. — [fdata.clj](https://github.com/penpot/penpot/blob/develop/backend/src/app/features/fdata.clj)
- **Logseq (DB version).** Datascript tx-data travels as Transit over websocket to a Cloudflare Worker with a SQLite-backed `SyncDO` per graph. D1 holds graph and user metadata and R2 holds assets; there are E2EE and checksum tooling, plus a Node adapter for self-hosting. — [wrangler.toml](https://github.com/logseq/logseq/blob/master/deps/db-sync/worker/wrangler.toml), [README](https://github.com/logseq/logseq/blob/master/deps/db-sync/README.md)
- **Anytype.** Go any-sync: each object is an encrypted DAG of content-addressed changes inside an ACL'd space. Sync nodes store and replicate, consensus nodes validate ACL changes, and file nodes store IPLD files. It works peer-to-peer and offline, with any-store as the local object store. — [any-sync README](https://github.com/anyproto/any-sync), [any-sync concepts](https://sync.any.org/concepts/)
- **Actual Budget.**
  - Local SQLite plus a `messages_crdt` table of field-level LWW messages with HLC timestamps. A merkle trie over timestamps finds divergence. — [Using CRDTs in the Wild (James Long)](https://jlongster.com/using-crdts-in-the-wild), [packages/crdt](https://github.com/actualbudget/actual/tree/master/packages/crdt/src/crdt)
  - The sync server keeps a per-group SQLite file with a `messages_binary(timestamp, is_encrypted, content)` table and a merkle trie, and uses a protobuf protocol. — [sync-simple.js](https://github.com/actualbudget/actual/blob/master/packages/sync-server/src/sync-simple.js)
- **HedgeDoc 2.** NestJS plus raw `ws` plus Yjs. Live notes are held in memory and periodically persisted as Revision rows containing content and the Yjs state; migrations use knex. — [realtime-note.service.ts](https://github.com/hedgedoc/hedgedoc/blob/develop/backend/src/realtime/realtime-note/realtime-note.service.ts)
- **Huly.** A Hocuspocus 2.15 collaborator service saves and loads Y.Docs to blob storage (MinIO in dev). Platform data sits in MongoDB or CockroachDB/Postgres adapters, with Elasticsearch for full text. — [storage/platform.ts](https://github.com/hcengineering/platform/blob/develop/server/collaborator/src/storage/platform.ts), [README](https://github.com/hcengineering/platform/blob/develop/README.md)
- **SiYuan.** The Go kernel uses SQLite as the query index over JSON block files. Sync and backups go through **dejavu**, a content-addressed repo (indexes→files→chunks, deduplicated, AES-encrypted), to SiYuan cloud, S3, WebDAV or a local folder. — [conf/sync.go](https://github.com/siyuan-note/siyuan/blob/master/kernel/conf/sync.go), [dejavu](https://github.com/siyuan-note/dejavu), [go.mod](https://github.com/siyuan-note/siyuan/blob/master/kernel/go.mod)
- **Trilium (TriliumNext).** A server with SQLite records every change in an `entity_changes` table (with a hash). Clients push then pull over HTTP (`/api/sync/*`), then verify with sector content hashes (`checkContentHash`). — [sync.ts](https://github.com/TriliumNext/Trilium/blob/main/packages/trilium-core/src/services/sync.ts), [entity_changes.ts](https://github.com/TriliumNext/Trilium/blob/main/packages/trilium-core/src/services/entity_changes.ts)
- **JupyterLab RTC.** A Python `jupyter-server-ydoc` uses pycrdt (Yjs format) plus pycrdt-websocket, with update logs in an SQLiteYStore. Rooms save the merged doc back to the notebook file on disk after `save_delay`. — [pyproject](https://github.com/jupyterlab/jupyter-collaboration/blob/main/projects/jupyter-server-ydoc/pyproject.toml), [rooms.py](https://github.com/jupyterlab/jupyter-collaboration/blob/main/projects/jupyter-server-ydoc/jupyter_server_ydoc/rooms.py)
- **Proton Docs.** Lexical plus Yjs. Updates are E2E-encrypted as commits over a custom websocket. The server stores opaque commits, and clients squash under a server-issued lock and re-encrypt. — [docs-editor package.json](https://github.com/ProtonMail/WebClients/blob/main/applications/docs-editor/package.json), [SquashDocument.ts](https://github.com/ProtonMail/WebClients/blob/main/packages/docs-core/lib/UseCase/SquashDocument.ts)
- **Obsidian Sync (closed source, files-on-disk).** Files are E2E-encrypted (AES-256-GCM, scrypt key derivation) and stored on DigitalOcean. The server keeps readable metadata for routing plus version history (1–12 months). Local vaults are plain files. — [Obsidian Sync security](https://www.mintlify.com/obsidianmd/obsidian-help/sync/security)
- Measured size of sync/collab server code at HEAD (non-test):
  - tldraw sync-worker: 21,236 lines
  - Logseq db-sync: 10,157
  - Plane live: 5,012
  - AFFiNE core/doc plus core/sync: 4,311
  - Huly collaborator: 1,649
  - HedgeDoc realtime: 1,046
  - Outline collaboration: about 1,741 including tests
  - excalidraw-room: 153
  - Source: repos above, counted 2026-10-29.

### Inferences
- Code size tracks product surface (history, comments, thumbnails, permissions, MCP) more than the sync primitive. Excalidraw's 153-line relay works because the client owns the merge rules and persistence is a separate Firestore write.
- The Yjs plus Hocuspocus apps are the cheapest server-side, at 1–5k lines, but they inherit Node hosting and the dual-write problem.

### Gaps
- The Logseq file-based (non-DB) sync stack was not examined.
- Obsidian's merge algorithm for concurrent Markdown edits is not documented on the fetched page.
- Penpot's realtime presence and pointer channel details were only partially inspected.

---

## Q4. What real stack archetypes exist, and who uses each?

### Takeaway
Six archetypes cover essentially every adopter found, plus voice/AV media as a separate seventh category. Most products combine two: a document-tier archetype (b, c or e) with a metadata-tier archetype (a, d, or plain Postgres).

### Cited Findings

| # | Archetype | Typical stack | Named adopters (sources) |
|---|---|---|---|
| a | **Postgres + query-sync engine** | Postgres (Supabase/RDS) → Zero / Electric / PowerSync → client SQLite or IndexedDB → React/Flutter | tldraw.com metadata via Zero ([fly config](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/zero-cache/flyio.template.toml)); Ano via Zero ([post](https://hackernews-dynamic.seasondane.workers.dev/news/48191182)); Suga via Zero ([Pulse](https://www.pulse.bot/saas/news/from-clobbered-drafts-to-real-time-sync-8c860c40-9c87-41eb-afe2-f716434073bc/)); nibfont via Zero ([johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)); Trigger.dev and Otto via Electric ([Electric 1.0](https://electric.ax/blog/2025/03/17/electricsql-1.0-released)); PrayerMate via PowerSync ([geero](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync)) |
| b | **Yjs + room server + Postgres/S3** | Yjs plus editor binding → Hocuspocus / y-websocket / socket.io / pycrdt → Postgres bytea or blob store, plus Redis fanout | Outline, Plane, AFFiNE, Huly, HedgeDoc, Ghostwriter, JupyterLab, Proton Docs (Q3 sources) |
| b′ | **Hosted collab rooms** | Liveblocks / Tiptap Cloud → webhook to your DB | Hashnode, Resend, Vercel ([Liveblocks](https://liveblocks.io/blog/how-hashnode-added-collaboration-to-their-text-editor-to-sell-to-larger-organizations)) |
| c | **Durable Object per document + SQLite + R2** | Worker → DO (SQLite) per room → R2 snapshots and assets; D1 or Postgres (Hyperdrive) for cross-doc metadata | tldraw.com ([sync-worker](https://github.com/tldraw/tldraw/tree/main/apps/dotcom/sync-worker/src)); Logseq DB sync ([wrangler](https://github.com/logseq/logseq/blob/master/deps/db-sync/worker/wrangler.toml)); Liveblocks internals ([case study](https://www.cloudflare.com/case-studies/liveblocks)); Cloudflare Agents ([docs](https://developers.cloudflare.com/agents/)); PartyKit ([Cloudflare](https://blog.cloudflare.com/de-de/cloudflare-acquires-partykit)) |
| d | **BaaS realtime** | Firebase/Firestore, Supabase (Realtime + Postgres + RLS), Convex, InstantDB, PocketBase | Excalidraw persistence on Firestore ([firebase.ts](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/data/firebase.ts)); PrayerMate (former, RTDB); Conduit and LanguageHopper on Convex ([Convex](https://www.convex.dev/case-studies/hostai)); tldraw Postgres on Supabase |
| e | **Server-authoritative custom websocket + Postgres (or equivalent)** | Custom server holds doc state, orders and validates changes, journals and checkpoints; Postgres for metadata | Figma (Rust + DynamoDB journal + S3 checkpoints + LiveGraph/Postgres) ([Figma](https://www.figma.com/blog/making-multiplayer-more-reliable/)); Linear (MobX object graph + IndexedDB + GraphQL + WS deltas) ([reverse-LSE](https://github.com/wzhudev/reverse-linear-sync-engine)); Penpot (Clojure + Postgres + Redis msgbus) ([files_update.clj](https://github.com/penpot/penpot/blob/develop/backend/src/app/rpc/commands/files_update.clj)); Excalidraw (relay + client LWW); Colyseus games (Pixels, Bloxd.io) ([colyseus.io](https://colyseus.io)) |
| f | **Files/log on disk + sync** | Local files or SQLite + change log or snapshots → dumb or encrypted sync server or object store | Obsidian Sync ([security](https://www.mintlify.com/obsidianmd/obsidian-help/sync/security)); SiYuan/dejavu → S3/WebDAV ([sync.go](https://github.com/siyuan-note/siyuan/blob/master/kernel/conf/sync.go)); Actual (CRDT message log + merkle) ([jlongster](https://jlongster.com/using-crdts-in-the-wild)); Trilium (entity_changes push/pull) ([sync.ts](https://github.com/TriliumNext/Trilium/blob/main/packages/trilium-core/src/services/sync.ts)); Anytype (encrypted DAG) ([any-sync](https://sync.any.org/concepts/)); JupyterLab (writes back to .ipynb) |
| g | **Realtime media / voice** (separate concern) | WebRTC SFU (LiveKit) + agent worker → model over WebSocket | OpenAI ChatGPT Advanced Voice ([LiveKit](https://livekit.com/blog/openai-livekit-partnership-advanced-voice-realtime-api)); xAI Grok Voice ([x.ai](https://x.ai/stories/livekit)) |

### Inferences
- Common combinations:
  - c + a: tldraw.
  - b + plain Postgres REST: Outline, Plane.
  - e + LiveGraph-style query sync: Figma.
  - e alone with an object-graph client: Linear.
- Pure single-archetype products are mostly small (Excalidraw) or local-first (Actual, Obsidian).

### Gaps
- None of the sources quantify the relative popularity of each archetype. The table shows that each pattern exists, not how common it is.

---

## Q5. For each archetype, what glue code did teams commonly have to write?

### Takeaway
Regardless of tool, teams wrote:
1. Auth/permission checks at connection and per record.
2. Persistence scheduling (throttle, retry, lock).
3. Compaction/snapshotting plus history.
4. A path for out-of-band writes.
5. Metadata replication to a queryable DB.
6. Blob/asset upload.
7. Protocol/schema versioning across old and new clients.
Presence is free only in rooms-based tools (Liveblocks, Hocuspocus awareness, tldraw); query-sync engines need a second channel.

### Cited Findings
- **(a) Postgres + sync engine**
  - Auth: JWT read scopes (Trigger.dev); Clerk plus per-file roles in mutators (tldraw); token auth on preview domains plus server-to-server header injection (Suga). — [Trigger.dev](https://trigger.dev/blog/how-we-built-realtime), [mutators.ts](https://github.com/tldraw/tldraw/blob/main/packages/dotcom-shared/src/mutators.ts), [Pulse](https://www.pulse.bot/saas/news/from-clobbered-drafts-to-real-time-sync-8c860c40-9c87-41eb-afe2-f716434073bc/)
  - Write path: Electric needs your own endpoints (nibfont); PowerSync needed PostgREST (PrayerMate); Zero needs custom mutators, including field-merge on JSONB (Suga). — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026), [geero](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync), [Pulse](https://www.pulse.bot/saas/news/from-clobbered-drafts-to-real-time-sync-8c860c40-9c87-41eb-afe2-f716434073bc/)
  - Migrations: 56 hand-written SQL migrations for tldraw's Zero schema. — [zero-cache/migrations](https://github.com/tldraw/tldraw/tree/main/apps/dotcom/zero-cache/migrations)
  - Query shaping: a shape-ID cache for time filters, plus Redis connection limits (Trigger.dev). — [Trigger.dev](https://trigger.dev/blog/how-we-built-realtime)
  - Presence: separate infrastructure (nibfont). — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
  - Account edge cases (first login, second device, logout) and encryption (PrayerMate). — [geero](http://www.geero.net/2025/01/rewriting-prayermate-sync-with-powersync)
  - Undo: snapshot-based "bulk" mutators (Suga). — [Pulse](https://www.pulse.bot/saas/news/from-clobbered-drafts-to-real-time-sync-8c860c40-9c87-41eb-afe2-f716434073bc/)
- **(b) Yjs + room server**
  - Persistence extension: load and convert legacy content under a row lock; dirty tracking; retries; attribution (Outline). — [PersistenceExtension.ts](https://github.com/outline/outline/blob/main/server/collaboration/PersistenceExtension.ts)
  - Multi-format writes (binary + HTML + JSON) for rendering, search and REST consumers (Plane). — [database.ts](https://github.com/makeplane/plane/blob/preview/apps/live/src/extensions/database.ts)
  - Out-of-band edit merging over Redis (Outline), or removing features (Ghostwriter). — [APIUpdateExtension.ts](https://github.com/outline/outline/blob/main/server/collaboration/APIUpdateExtension.ts), [SpecterOps](https://specterops.io/blog/2025/06/18/ghostwriter-v6-introducing-collaborative-editing/)
  - Compaction: server squash under a lock with a native Rust merger (AFFiNE); client-side encrypted squash under a server lock (Proton). — [AFFiNE doc.ts](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/src/core/doc/storage/doc.ts), [SquashDocument.ts](https://github.com/ProtonMail/WebClients/blob/main/packages/docs-core/lib/UseCase/SquashDocument.ts)
  - History: expiring snapshot_histories (AFFiNE); a Revision per persist (HedgeDoc). — [schema.prisma](https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/schema.prisma), [HedgeDoc](https://github.com/hedgedoc/hedgedoc/blob/develop/backend/src/realtime/realtime-note/realtime-note.service.ts)
  - Auth and connection-limit extensions (Outline); token validation before upgrade (Plane). — [outline/server/collaboration](https://github.com/outline/outline/tree/main/server/collaboration), [Instagit](https://instagit.com/makeplane/plane/plane-live-app-realtime-collaboration/)
  - Cross-server force-close and drain on deploy (Plane). — [plane/apps/live/src](https://github.com/makeplane/plane/tree/preview/apps/live/src)
  - Stale-history protection via a load UUID (Ghostwriter). — [SpecterOps](https://specterops.io/blog/2025/06/18/ghostwriter-v6-introducing-collaborative-editing/)
- **(b′) Hosted rooms.** A webhook receiver (60s throttled) plus REST fetch of the doc to mirror it into your DB (Liveblocks). — [Liveblocks guide](https://liveblocks.io/docs/guides/how-to-synchronize-your-liveblocks-yjs-document-data-to-a-supabase-postgres-database)
- **(c) DO per document**
  - Cold-start hydration from R2 into DO-SQLite.
  - Throttled snapshot persistence.
  - A keyframe+delta version chain in R2 that the read path can serve without waking the DO.
  - An R2 concurrency queue (two in flight, under the six-connection limit).
  - A Postgres outbox with retries and parking for records other systems must query (comments).
  - Hyperdrive pooling.
  - Asset upload and resize workers.
  - Per-record authorizers.
  - All of the above: tldraw. — [TLFileDurableObject.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/TLFileDurableObject.ts), [versionChain.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/versionChain.ts), [outboxDrain.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/outboxDrain.ts)
  - Logseq: D1 schema migrations in CI; checksums and drift detection; E2EE endpoints; a protocol compatibility discipline; a Node adapter so self-hosters don't need Cloudflare. — [Logseq README](https://github.com/logseq/logseq/blob/master/deps/db-sync/README.md), [review rules](https://github.com/logseq/logseq/blob/master/.agents/skills/logseq-review-workflow/rules/modules/db-sync.md)
  - In the tldraw SDK, the developer still supplies auth (tokenized URI), the asset store and the user store. — [tldraw docs](https://tldraw.dev/sdk-features/collaboration)
- **(d) BaaS**
  - Supabase: a per-table broadcast trigger plus RLS on `realtime.messages` plus client `setAuth`. — [Supabase](https://supabase.com/docs/guides/realtime/migrate-from-postgres-changes)
  - Excalidraw: client-side encryption, a separate relay server, and scene-version caching to skip redundant Firestore writes. — [firebase.ts](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/data/firebase.ts)
  - PocketBase: Litestream backups. — [FAQ](https://pocketbase.io/faq/)
  - Convex: little glue reported, but the write-ups are vendor-hosted. — [Convex](https://www.convex.dev/case-studies/hostai)
- **(e) Custom server-authoritative**
  - Figma: journal plus checkpoint plus recovery replay; a lock table for single-writer; byte-for-byte validation (400K checks) before rollout; a delayed job to checkpoint closed files. — [Figma](https://www.figma.com/blog/making-multiplayer-more-reliable/)
  - Linear: a transaction queue in IndexedDB; rollback; three bootstrap modes; lazy hydration; sync-ID gap detection. — [reverse-LSE](https://github.com/wzhudev/reverse-linear-sync-engine)
  - Penpot: revn conflict detection, lagged-change replay and per-file transaction locks. — [files_update.clj](https://github.com/penpot/penpot/blob/develop/backend/src/app/rpc/commands/files_update.clj)
- **(f) Files/log + sync**
  - Actual: HLC, merkle diffing, clock-drift rejection and a "reset sync" escape hatch, with a server of about 300 lines. — [jlongster](https://jlongster.com/using-crdts-in-the-wild)
  - Trilium: sector content-hash verification. — [sync.ts](https://github.com/TriliumNext/Trilium/blob/main/packages/trilium-core/src/services/sync.ts)
  - SiYuan: chunk dedup and encryption with multiple storage providers. — [dejavu](https://github.com/siyuan-note/dejavu)
  - Obsidian: key derivation, a deterministic-hash dedup trade-off and retention policy. — [Obsidian](https://www.mintlify.com/obsidianmd/obsidian-help/sync/security)

### Inferences
- **Adoption replaces:** the merge algorithm, the wire protocol, client caching and offline queues (Zero/PowerSync/Yjs providers), and reconnection.
- **It does not replace:** auth and permissions, persistence policy, history, blob storage, search indexing, metadata replication, migrations, or deploy-time draining.
- In every codebase inspected, that second list is the larger share of the glue.

### Gaps
- Few sources describe search indexing of CRDT documents explicitly. Plane's HTML/JSON columns and Outline's `content`/`text` columns suggest the approach, but no write-up confirms the motivation.

---

## Q6. Which archetype is closest to the user's design (vanilla-JS Item/List/Page objects, deltas over websockets, JSONL logs, Cloudflare-leaning), and what does that imply?

### Takeaway
The user's design is archetype **(c) DO-per-document**, with an **(e) Linear-style object-graph client**. It is closest to **tldraw sync**: server-authoritative per-record diffs (not a CRDT), one DO room per document, DO-SQLite plus R2 snapshots, and a keyframe+delta history chain, which corresponds to the user's JSONL log. Adopting tools would mainly remove protocol and merge code. The evidence (tldraw at about 21k lines, Logseq at about 10k) says the coordinating glue stays: auth, persistence policy, history, assets and metadata indexing. A query-sync engine for "Lists" would add a non-Cloudflare component (zero-cache needs Fly or a VM).

### Cited Findings
- tldraw sync is server-authoritative, with a `TLSocketRoom` per room ID over WebSocket, conflict resolution on the server and client-side queuing of offline changes. — [tldraw docs](https://tldraw.dev/sdk-features/collaboration)
- `TLSocketRoom` accepts a generic `schema?: StoreSchema<R>`, defaulting to `createTLSchema()`. The engine is typed over arbitrary record types, not only tldraw shapes. — [TLSocketRoom.ts](https://github.com/tldraw/tldraw/blob/main/packages/sync-core/src/lib/TLSocketRoom.ts)
- License: `@tldraw/sync-core` 5.6.0 is "SEE LICENSE IN LICENSE.md" (the tldraw license, not MIT). — [sync-core package.json](https://github.com/tldraw/tldraw/blob/main/packages/sync-core/package.json), [sync-worker README](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/README.md)
- tldraw's own history design mirrors a JSONL-log-plus-checkpoint approach: a keyframe plus delta segments in R2, with chain state in DO storage. — [versionChain.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/versionChain.ts)
- Figma's journal (about every 0.5s) plus checkpoint (every 30–60s) is the same pattern at scale. — [Figma](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- tldraw moved from in-memory room storage to SQLite in Jan 2026 because in-memory persistence "could struggle" under load and restarts. — [tldraw SDK 4.3](https://tldraw.dev/blog/tldraw-sdk-4.3)
- Logseq independently chose the same Cloudflare shape: Worker, SQLite DO per graph, D1 metadata, R2 assets. It also keeps a Node adapter for self-hosting. — [Logseq README](https://github.com/logseq/logseq/blob/master/deps/db-sync/README.md)
- Liveblocks (DO per room plus R2 history plus KV) is the hosted version of this archetype. Its Storage product (LiveObject/LiveList) is the closest hosted equivalent of Item/List objects. — [Cloudflare case study](https://www.cloudflare.com/case-studies/liveblocks), [Liveblocks Yjs docs](https://liveblocks.io/docs/products/sync/text-editing/yjs)
- Linear's client model (decorated model classes, MobX observables, a `save()` that triggers sync, a persisted transaction queue, server-assigned `lastSyncId` total order) is the closest public analogue to an Item/List/Page object graph with deltas. — [fujimon](https://www.fujimon.com/blog/linear-sync-engine), [reverse-LSE](https://github.com/wzhudev/reverse-linear-sync-engine)
- If "Lists" (cross-document collections and queries) were moved to Zero, tldraw's experience shows the cost: Postgres plus pgbouncer, Hyperdrive, zero-cache on Fly with a disk volume, 56 SQL migrations, and an outbox to get DO-held records into Postgres. — [flyio.template.toml](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/zero-cache/flyio.template.toml), [outboxDrain.ts](https://github.com/tldraw/tldraw/blob/main/apps/dotcom/sync-worker/src/outboxDrain.ts)
- For DO-native building blocks, the Cloudflare Agents SDK gives per-instance identity, SQL storage, websockets and scheduling. y-durableobjects gives Yjs rooms without Node. Drizzle supports DO-SQLite migrations. — [Cloudflare Agents](https://developers.cloudflare.com/agents/), [y-durableobjects](https://github.com/napolab/y-durableobjects), [Drizzle DO](https://orm.drizzle.team/docs/connect-cloudflare-do)

### Inferences
- **"If you go this route" stacks, assuming Cloudflare-first:**
  1. **Keep custom, borrow patterns.** DO per Page (DO-SQLite as the live store, the JSONL log as R2 delta segments plus periodic keyframes). D1 for Lists and indexes. R2 for blobs. Drizzle or Kysely for DO-SQLite and D1 migrations. Hibernatable websockets for presence. This is closest to the existing code; the evidence suggests budgeting for tldraw-like glue (outbox, R2 queueing, cold-start hydration, version chain).
  2. **Adopt tldraw sync-core for the room protocol** with a custom `StoreSchema` of Item/List/Page records, on DOs with `SQLiteSyncStorage` plus R2. This removes protocol, diff and reconnect code but adds a non-MIT license dependency. It stays LWW-per-record, so rich text would still need Yjs inside a record or a separate room.
  3. **Yjs on DO** (y-durableobjects or PartyKit) for Page bodies, plus D1 for Lists. You get CRDT text merging and editor bindings (Tiptap/Lexical/ProseMirror), but you must solve compaction and history yourself (see AFFiNE/Proton) and avoid dual-writing fields over REST (see Outline/Ghostwriter).
  4. **Hybrid tldraw.com-style.** DO rooms for Pages, plus Postgres plus Zero for Lists, users and permissions. This is the richest query layer, but zero-cache runs off-Cloudflare (Fly) and you need an outbox from DO into Postgres.
- **What adopting still leaves to write (from Q5):** auth and permissions, persistence throttling and retries, snapshots and history, blob storage, metadata replication and indexing, migrations, protocol versioning and presence (if using a query-sync engine).
- **Decision lever:** the user's existing delta and JSONL design already does what tldraw sync-core or a Yjs provider would replace. The remaining work (the larger share in every codebase inspected) is the same either way. Adoption is most justified for collaborative rich text (Yjs) or rich relational queries (Zero), not for the per-document delta pipe itself.

### Gaps
- No source compares team velocity or bug rates for custom versus adopted sync layers.
- tldraw license terms for non-tldraw use of `@tldraw/sync-core` were not read in full. Check LICENSE.md before relying on option 2.
- Cloudflare Agents SDK `setState` and `useAgent` state-sync semantics were not confirmed from the fetched docs page.
