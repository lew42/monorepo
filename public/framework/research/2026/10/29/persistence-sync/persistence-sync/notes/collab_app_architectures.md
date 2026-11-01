# How production real-time collaborative apps architect data model, sync and persistence (and what stacks people pair in 2025-2026)

Research date: 2026-10-29. Dates of sources noted inline. Note for the report writer: the shared web-search budget ran out near the end of research, so a few planned lookups (tldraw.com's metadata stack, Excalidraw's fractional-index PR, Logseq RTC protocol internals, more HN "best stack" threads) were not done. These are listed under Gaps.

Context for synthesis: the user is building a vanilla-JS framework with an Item/List/Page object model (pages nested in pages, like Notion), stored as append-only JSONL deltas on the file system and streamed over websockets. The Inferences sections tie each finding back to that design.

---

## Q1. Case-by-case architecture, end to end (UI → client state → transport → server → storage)

### Takeaway
Most successful products that are not text editors (Figma, tldraw, Linear, Notion, Excalidraw) do **not** use a full CRDT for their structured data. They use **server-ordered, record/property-level last-writer-wins** with optimistic local application and rebase. Real CRDTs (Yjs, Automerge, custom) show up where concurrent **text** editing or true **peer-to-peer/local-first** is required (Zed, AFFiNE, Anytype, Actual, plus Linear/Notion text fields added later). Persistence nearly always follows the **snapshot/checkpoint + incremental log** pattern, with the log kept short by periodic compaction.

### Cited Findings

#### Figma (canvas "multiplayer"), 2019 and 2022 posts
- **Topology:** clients connect over WebSockets. **Each multiplayer document gets its own server process**, and every client editing that document connects to it — [Figma, How Figma's multiplayer technology works (Oct 16, 2019)](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Data model:** a document is a tree of objects (root → pages → nested layers), effectively `Map<ObjectID, Map<Property, Value>>`, i.e. rows of (ObjectID, Property, Value). New features usually just add properties — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Authority:** the design is "inspired by CRDTs" but is not a true CRDT. The server is the central authority and defines event order, so no timestamps are needed. "Since Figma is centralized (our server is the central authority), we can simplify our system." The team rejected OT as "unnecessarily complex for our problem space" — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Conflict rule:** property-level LWW. Different properties, or the same property on different objects, never conflict. For the same property, the value that reaches the server last wins. Values are atomic, so concurrent text edits inside one value cannot merge — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Client:** local changes apply immediately. Incoming server updates that conflict with unacknowledged local changes are discarded to avoid flicker — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Create/delete:** existence is a LWW boolean. A deleted object's data is not kept on the server; it lives in the deleting client's undo buffer. Object IDs embed a client ID, so clients can create objects offline without collisions — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Tree/ordering:** a child stores a link to its parent as a property. Order among siblings uses **fractional indexing** (positions between 0 and 1; an insert takes the average of its neighbours). **Parent link and position are stored in one property so they update atomically.** The server rejects parent updates that would form a cycle. Clients may briefly see a cycle, which is handled by temporarily removing the affected objects from the tree. The author calls this "imperfect but acceptable" for a rare case — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Offline:** clients can edit offline. On reconnect a client downloads a fresh copy, reapplies its offline edits on top, and opens a new WebSocket — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Non-document data** (comments, users, teams, projects) lives in Postgres and syncs through a separate system — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Persistence (2022):** file state is held in memory. **Checkpoints every 30–60 s** encode the whole file in a binary format, compress it and upload it to **S3** (cross-region replicated). Checkpoints underpin version history — [Figma, Making multiplayer more reliable (Oct 20, 2022)](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **Journal (WAL):** an asynchronous transaction log written about every 0.5 s, storing incremental changes. Each change gets a **per-file incrementing sequence number**, and each checkpoint records the current sequence number. Recovery = load the latest checkpoint, then apply newer journal entries. Clients send updates every 33 ms, so journal entries cover sequence ranges. LWW makes replaying ranges safe. The journal lives in **DynamoDB**, chosen over Postgres for horizontal write scaling. A separate DynamoDB lock table ensures only one multiplayer instance writes a given file's journal — [Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **Scale/validation:** more than 2.2B changes per day. 95% of changes persisted within about 600 ms. Validation rule: checkpoint A + journal must rebuild checkpoint B **byte-identically**. About 400K consecutive successful validations ran in a dark launch. The server is written in **Rust**, which let one encapsulated type own all file mutations so every path is journaled — [Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **Two sync engines:** Multiplayer (canvas, CRDT-inspired, read/write, per file, up to 100 clients per file, raw file data) vs. **LiveGraph** (all other data, GraphQL-like, read-only subscriptions, writes via REST, backed by Postgres + Redis). Lesson: "not all data fits the CRDT model"; ephemeral, derived and server-driven data need different sync — [Second Brain notes on Arushi Bandi's talk "A Tale of Two Sync Engines" (note dated Dec 8, 2025; secondary)](https://second-brain-nuxt.vercel.app/a-tale-of-two-sync-engines)
- **LiveGraph 100x** (Go): invalidators tail the Postgres replication stream (sharded to match physical shards), a read-through cache is sharded by query hash, and edge servers re-fetch on invalidation. Figma moved from pushing minimal diffs through every layer (stateful, hard to recover) to stateless invalidation — [Figma, LiveGraph: real-time data at scale (undated)](https://www.figma.com/blog/livegraph-real-time-data-at-scale/)

#### Notion (blocks, page-as-tree)
- **Everything is a block:** text, images, list items, database rows and pages. Fields: `id` (UUID v4), `type`, `properties` (e.g. `title`), `content` (an **ordered array of child block IDs**) and `parent` (an upward pointer used for permissions). "Turn into" changes only `type`, and properties are kept — [Notion, The data model behind Notion's flexibility (May 18, 2021)](https://www.notion.com/blog/data-model-behind-notion)
- **Nested pages:** a page is just a block whose children render in their own view. Pages nest without limit. Indenting moves a block into the previous block's `content` array. Parent and content pointers "mirror each other, apart from a few edge cases" the team was still cleaning up. Parent pointers were added because blocks could appear in multiple content arrays, and searching all content arrays for ancestors was too slow — [Notion 2021](https://www.notion.com/blog/data-model-behind-notion)
- **Ops:** UI actions become **operations** (each creates or updates one record), batched into **transactions** that the server commits or rejects as a unit. Example: pressing Enter creates a to-do block (the client generates the ID) plus an op inserting that ID into the parent's `content` array, in one transaction — [Notion 2021](https://www.notion.com/blog/data-model-behind-notion)
- **Client → server:** the client applies the transaction locally at once. `TransactionQueue` (IndexedDB/SQLite) holds pending transactions, sent as JSON to `/saveTransactions`. The server loads the "before" state, applies ops to a copy ("after"), validates permissions and coherence, commits, then asynchronously schedules version-history snapshots, search indexing and **MessageStore** notifications — [Notion 2021](https://www.notion.com/blog/data-model-behind-notion)
- **Real-time:** each client holds a WebSocket to MessageStore and subscribes to the records it renders. On change, the client gets a version notification, compares it with its cache, and calls `syncRecordValues` to fetch new data. This is **notify-then-pull, not push-diff**. Page loads use `loadPageChunk`, which walks the content tree down from a starting block — [Notion 2021](https://www.notion.com/blog/data-model-behind-notion)
- **Client cache:** `RecordCache` (an LRU on SQLite or IndexedDB) in native apps. On the web (2024), WASM SQLite persisted via OPFS runs in Web Workers. Only one "active" tab uses SQLite, and a SharedWorker routes queries to it; Web Locks detect tab close. Concurrent multi-tab writes corrupted some databases before this design. Result: **20% faster page navigation** (28–33% in Australia, China and India) — [Notion, How we sped up Notion in the browser with WASM SQLite (Jul 10, 2024)](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite)
- **Server DB:** application-level sharding of Postgres, finished 2021. **480 logical shards** (each a Postgres schema) on 32 physical DBs, with **workspace ID** as the shard key. They sharded every table reachable from `block` by foreign key and chose this over Citus/Vitess. Migration used double-writes to an audit log, a backfill, and dark reads. Lessons: shard earlier, aim for zero downtime, use a combined primary key — [Notion, Herding elephants: sharding Postgres at Notion (Oct 6, 2021)](https://www.notion.com/blog/sharding-postgres-at-notion)
- **Scale (2024):** 96 physical instances × 5 logical shards (still 480). More than **200B blocks**. **"90% of Notion upserts are updates."** CDC pipeline: Debezium → Kafka → Apache Hudi on S3 → Spark. Snowflake was a poor fit for update-heavy ingest. **Block permissions are not stored; they are computed by walking the ancestor tree to the workspace root**, which became expensive and was moved to Spark — [Notion, Building and scaling Notion's data lake (Jul 1, 2024)](https://www.notion.com/blog/building-and-scaling-notions-data-lake)
- **Offline (2025):** the old SQLite cache was best-effort. Offline Mode added persistent tables `offline_page` and `offline_action` (`origin_page_id`, `from_page_id`, `impacted_page_id`, `type`). Pages marked offline are **"dynamically migrated to our new CRDT data model for conflict-resolution."** Rich-text conflict resolution, reference tracking and background sync were the hard parts. Updates are pushed on per-page channels, and reconnect compares `lastDownloadedTimestamp` with server `lastUpdatedTime` — [Notion, How we made Notion available offline (Dec 11, 2025)](https://notion.com/blog/how-we-made-notion-available-offline)

#### Linear (sync engine)
- Best public documentation is a reverse-engineering study that Linear's CTO Tuomas Artman called "probably the best documentation that exists - internally or externally" — [wzhudev/reverse-linear-sync-engine (2025)](https://github.com/wzhudev/reverse-linear-sync-engine)
- **Client:** models (`Issue`, `Team`…) are classes extending `Model`, registered in a `ModelRegistry`. Loaded instances live in an **Object Pool** keyed by UUID. Property setters are **MobX** observables, and setters also record old/new values for transaction generation — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **Local storage:** IndexedDB, with one database per workspace, **one table per model**, plus `_meta` (holding `lastSyncId`) and `_transaction` (unsent transactions) — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **Writes:** create/update/delete/archive/unarchive become **transactions**. They are queued, cached in IndexedDB and sent in batches. In-memory models change immediately, but local tables change only after server approval, and rejected transactions roll back — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **Ordering:** a **global, monotonically increasing `syncId`** orders every change across the whole database (compared to OT revision numbers, but database-wide rather than per file). The server broadcasts **delta packets** of **sync actions**, which may include server-added side effects, to all clients including the originator. On WebSocket connect, a handshake compares sync IDs to fetch missed packets — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **Bootstrapping:** full, partial or local. Load strategies are `instant`, `lazy`, `partial`, `explicitlyRequested` and `local`. Partial indexes (e.g. `assigneeId-<id>`) track what has been fetched — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **Conflicts:** HN summary: "naive last-write-wins, no conflict detection, no OT, no CRDT," with a server-controlled global sync ID — [HN discussion of the reverse-engineering post (~mid-2025)](https://news.ycombinator.com/item?id=44123131) (read via [hn.svelte.dev mirror](https://hn.svelte.dev/item/44123131))
- Linear used LWW and no CRDTs "until recently"; **CRDTs are now used only for issue descriptions**. Artman says conflicts are uncommon in Linear — [Yuya Fujimoto, Linear's sync engine architecture (Aug 13, 2024)](https://www.fujimon.com/blog/linear-sync-engine)
- Linear shipped collaborative editing of "all documents and issue descriptions" with live cursors on Dec 6, 2023 (no technology named) — [Linear changelog (Dec 6, 2023)](https://linear.app/changelog/2023-12-06-editor-improvements)
- Artman: the engine was built for speed and offline support, not developer friendliness at first. It fits apps where data per screen is limited even if the total dataset is large. The RPC-plus-WebSocket approach breaks because responses race with other users' updates, so "you end up building another sync engine." He advises starting with emerging off-the-shelf engines before building your own — [localfirst.fm #15 transcript](https://localfirst-fm.vercel.app/15/transcript)
- *Unverified secondary claim:* a third-party "Architecture Maps" page (Mar 2026, no citations) says the server is TypeScript/Node GraphQL on GCP, with Postgres as primary store, MongoDB as a sync cache for delta packets, REST `/sync/bootstrap` and `/sync/delta` endpoints, and Yjs for descriptions only — [ggprompts Architecture Maps (unsourced)](https://ggprompts.github.io/htmlstyleguides/architecture/linear/index.html). Treat as unconfirmed.

#### Google Docs (OT)
- The document is stored as an **ordered revision log** of three mutation types: insert text, delete text, apply style to a range. The editor replays the log to display the document — [Google Drive Blog, What's different about the new Google Docs: Conflict resolution (Sep 22, 2010)](https://drive.googleblog.com/2010/09/whats-different-about-new-google-docs_22.html) (full text via [PDF copy](https://idl.uw.edu/future-scholarly-communication/files/2010-GoogleDocs-OT.pdf))
- The server is the ordering point. It transforms a stale incoming change against every revision committed since that client's last sync, then stores it as the next revision. Each client tracks its last synced revision, unsent changes, the sent-but-unacknowledged change and current state. **Only one change is in flight per client at a time**; newer edits wait in a pending queue — [Google Docs OT PDF (2010)](https://idl.uw.edu/future-scholarly-communication/files/2010-GoogleDocs-OT.pdf)

#### tldraw (tldraw sync)
- Production on tldraw.com. The server-side `TLSocketRoom` holds the authoritative document. **Exactly one `TLSocketRoom` per room globally**; with duplicates, users "can't see each other and may overwrite each other's changes." `InMemorySyncStorage` is the default (lost on restart unless snapshots are saved via `onChange`), and **`SQLiteSyncStorage` is recommended for production**. The recommended self-host is the Cloudflare template (one Durable Object per room, R2 for assets), or `@tldraw/sync-core` in any Node backend that supports WebSockets. Auth, rate limits, long-term history and room listing are left to you — [tldraw docs: sync](https://tldraw.dev/docs/sync)
- Data is flat **records keyed by ID**. Changes are `RecordsDiff {added, updated: [from,to], removed}`. Presence (cursors, selection, viewport) is a separate record type and is not document data — [tldraw docs: collaboration](https://tldraw.dev/sdk-features/collaboration)
- `SQLiteSyncStorage` "stores documents, tombstones, metadata, and clock values in SQLite tables". There are wrappers for Durable Object storage (`DurableObjectSqliteSyncWrapper`) and Node's `node:sqlite` (Node 22.5+) — [tldraw reference: SQLiteSyncStorage (v5.6.0)](https://tldraw.dev/reference/sync-core/SQLiteSyncStorage)
- Cloudflare template: "persists room state in its built-in SQLite storage, so it survives restarts and hibernation"; images and videos go to R2 and are edge-cached — [tldraw-sync-cloudflare README](https://github.com/tldraw/tldraw-sync-cloudflare)
- **Internals (source-code analysis, secondary):** server-authoritative push/pull/rebase, explicitly not a CRDT. There is a monotonic `documentClock`, and each record stores `lastChangedClock`. Tombstones map deleted IDs to their deletion clock. Tombstones are pruned beyond 5000 (plus 1000 extra), and a client older than `tombstoneHistoryStartsAtClock` gets a full `wipe_all` resync. Wire ops are `put`, `patch` (property-level ObjectDiff with `append` for string/array growth) and `remove`. `push_result` is one of `commit`, `discard` or `rebaseWithDiff` (server-corrected). The client undoes speculative changes, applies server events, then reapplies pending ones, git-rebase style, at about 30 fps with collaborators and about 1 fps solo. The server migrates and validates records per schema version, so clients on different schema versions can collaborate. Stated weaknesses: no P2P or offline-first, LWW on the same field, one process per room, no sub-document sync, and optimistic state not persisted — [Grida research: tldraw sync architecture (~2024–2026; secondary)](https://grida.co/docs/wg/research/crdt/tldraw)
- Cloudflare's own pitch: "One object per document coordinates real-time edits from multiple users"; every Durable Object has an embedded SQLite DB and is a WebSocket server — [Cloudflare Durable Objects product page](https://www.cloudflare.com/developer-platform/products/durable-objects/)

#### Excalidraw
- (2020) End-to-end encrypted. A central Socket.IO server **only relays encrypted messages and stores nothing**. Shared state is an array of `ExcalidrawElement`s, with per-user state (selection, canvas) moved out. Merge is a union by ID. Each edit increments `version`, and on equal versions the lower random `versionNonce` wins, so all peers converge. Deletes are `isDeleted` tombstones, stripped when saving. Multiplayer undo was unsolved, so the undo stack was cleared on remote update — [Excalidraw blog, Building Excalidraw's P2P collaboration feature (Mar 29, 2020)](https://plus.excalidraw.com/blog/building-excalidraw-p2p-collaboration-feature)
- (Current code, secondary) Each room is stored in **Firestore as `{sceneVersion, iv, ciphertext}`** (AES-GCM). Reconcile order: the element the local user is editing wins, then the higher `version`, then the lower `versionNonce`. Each element has an **`index` fractional-index string for z-order**, and elements are re-sorted by it after reconcile. Locally, `localStorage` plus IndexedDB (`idb-keyval` `files-db` for image blobs) — [PyShine Excalidraw source tour (Sep 30, 2026; secondary)](https://pyshine.com/Excalidraw-Virtual-Whiteboard-Source-Tour/)

#### Discord (scale context only)
- Messages moved from 177 Cassandra nodes to **72 ScyllaDB nodes** (cutover May 2022). Partition key is **(channel_id, time bucket)**. Rust data services in front of the DB do **request coalescing** and consistent-hash routing by channel to tame hot partitions. p99 historical fetch went from 40–125 ms to about 15 ms, and inserts to a steady 5 ms. Uncompacted tombstones stalled the migration at 99.9999% — [Discord, How Discord stores trillions of messages (Mar 6, 2023)](https://discord.com/blog/how-discord-stores-trillions-of-messages)

#### Obsidian (files on disk + Obsidian Sync)
- Obsidian Sync merges Markdown with **Google's diff-match-patch**, which can produce duplicate text. **Other file types (including canvases) use "last modified wins".** Settings JSON is merged key-wise with local keys winning. Since 1.9.7 you can choose "Create conflict file" per device instead — [Obsidian Help: Sync troubleshooting](https://obsidian.md/help/sync/troubleshoot)
- "Obsidian does not yet support collaborative live editing on the same file." Shared vaults hold up to 20 users, each with a Sync subscription. Collaborators have owner-equivalent permissions, and end-to-end-encrypted vaults require the password — [Obsidian Help: Collaborate on a shared vault](https://obsidian.md/help/sync/collaborate)
- References are **by filename/path** (`[[Note]]`, `[[Folder/Note]]`), with headings (`#`) and **block IDs `^id`** (an Obsidian-only extension). Obsidian can **auto-rewrite internal links on rename** — [Obsidian Help: Links](https://obsidian.md/help/links)
- Philosophy: "Apps are ephemeral, but your files have a chance to last" — [Steph Ango (Obsidian CEO), File over app (Jul 1, 2023)](https://stephango.com/file-over-app)

#### Logseq (files → DB)
- See Q4 for detail. The DB version stores on-disk data in **SQLite** while the app reads from in-memory **DataScript**, and **"the database version is always canonical"**; Markdown is export-only — [Logseq DB Unofficial FAQ (Jul 27, 2026)](https://logseq.io/page/e87c7359-51f7-44fe-87b3-4a0cd9f2dee3/695feeec-88be-4c5b-8bf2-572513c2f730)

#### Anytype (any-sync)
- A **Space** holds Objects under an ACL. Each **Object is a DAG of content-addressed Changes** starting from a root. "Once enacted, a Change cannot be altered—only built upon." A new change references all current heads, which merges concurrent branches. Some changes are **"probabilistically promoted to snapshots"** inside the same DAG, so clients needn't traverse all history. State is rebuilt by topological sort on change hashes. Node roles are sync nodes, **consensus nodes** (ACL changes only, which need the network) and file nodes (IPLD) — [any-sync concepts](https://sync.any.org/concepts/)
- The Go `ObjectTree` API has changes with `PreviousIds`, `SnapshotId`, `IsSnapshot`, `AclHeadId`, `Signature`; storage methods `Heads`, `CommonSnapshot`, `AddAll`, `GetAfterOrder`; and a `ShouldBeEncrypted` flag per change — [pkg.go.dev any-sync objecttree v0.10.3](https://pkg.go.dev/github.com/anyproto/any-sync/commonspace/object/tree/objecttree@v0.10.3)

#### AFFiNE / BlockSuite (Yjs)
- BlockSuite is the editor: a block is the smallest unit, a page is a collection of blocks, and the store is a "Y.js document store". `y-octo` is a Rust Yjs implementation. Client: IndexedDB for Yjs updates, CacheStorage for assets. Server: **NestJS + GraphQL + Prisma, PostgreSQL** (metadata, users, permissions; pgvector), **Redis + BullMQ**, and **S3 or filesystem for blobs**. Sync runs over **Socket.io** with events `space:join`, `push-doc-update`, `server-update-doc` and `awareness` — [AFFiNE architecture (Mintlify docs)](https://www.mintlify.com/toeverything/AFFiNE/contributing/architecture)
- Each doc is stored as a **snapshot plus a queue of updates**. On load, pending updates are squashed into the snapshot under a lock keyed by (space ID, doc ID), and merged updates are deleted. The Rust `mergeUpdatesInApplyWay` is about 10x faster than JS `mergeUpdates`. Sync uses state vectors (`getDocDiff`) — [AFFiNE storage/CRDT docs](https://mintlify.com/toeverything/AFFiNE/api/storage/crdt)
- **Each page is its own Yjs document** (separate `doc-id` entries). Postgres holds "periodic snapshots and incremental updates". Self-host is Docker Compose with Postgres and blobs on the local filesystem — [AFFiNE local-first docs](https://mintlify.com/toeverything/AFFiNE/features/local-first)

#### Zed (CRDT text buffers)
- An operation-based text CRDT. Each replica gets a **centrally assigned replica ID** plus a local sequence number. Positions are **anchors (insertion ID, offset)**, and inserted text is never mutated, only split into fragments. Deletes are tombstones carrying version vectors. Concurrent inserts at one spot are ordered by Lamport timestamp, then replica ID. Undo is a per-operation **undo count map** (odd means undone), so each user undoes only their own ops — [Zed blog, How CRDTs make multiplayer text editing part of Zed's DNA (Dec 1, 2022)](https://zed.dev/blog/crdts)
- Server: the collab server uses **Postgres** (v15 locally) plus a **LiveKit** dev server, runs on Kubernetes on DigitalOcean (`collab.zed.dev`), and clients connect over WebSocket — [Zed collab README](https://git.secluded.site/zed/blob/ex/crates/collab/README.md?source=1)
- Persisted channel buffers use tables **`buffers(id, epoch)`**, **`buffer_operations(buffer_id, epoch, lamport_timestamp, replica_id, local_timestamp, version, is_undo, value[protobuf])`** and **`buffer_snapshots(buffer_id, epoch, text)`**. Load = snapshot for the current epoch, then replay that epoch's ops. Only edit and undo ops are stored; selections and diagnostics are not — [Zed commit "Start work on storing channel buffers" (migration dated ~Aug 19, 2023)](https://git.secluded.site/zed/commit/ff5035ea3761026deadc595e483fd1bd8057230c)
- Sharing a project gives collaborators access to the host's local file system within that project — [Zed docs: collaboration overview](https://zed.dev/docs/collaboration/overview)

#### Actual Budget (CRDT over SQLite)
- All writes go through `insert/update/delete`, which emit **single-field messages `(dataset, row, column, value, timestamp)`**. Delete = set `tombstone = 1`. Per-field LWW. **Hybrid logical clock** timestamps (time + counter + node ID, sortable as a string); clocks drifting more than 1 minute are rejected. A **Merkle tree** over message timestamps lets clients compare root hashes and find the divergence point. Applied messages go to a **`messages_crdt` table** while normal tables hold current state (data stored twice; a large DB is about 16 MB). The **server is about 300 lines** and just stores and forwards messages. **No compaction**: the log grows indefinitely, and Long proposed an "epoch" cutoff. Lessons: cross-field invariants can't be enforced, schema changes must handle old messages, and ordering needs sync-aware design — [James Long, Using CRDTs in the wild (Jun 6, 2019)](https://archive.jlongster.com/using-crdts-in-the-wild)
- The web build used **absurd-sql** (SQLite blocks mapped onto IndexedDB, with Atomics for sync I/O, requiring HTTPS). Undo/redo works by inverting message batches. Merkle leaves are about 10-minute windows in base-3, and old branches are pruned, so a very-late client is rejected or detached. Long did not use research on tree-integrity CRDTs and "coded defensively" instead — [localfirst.fm #7 transcript (James Long)](https://localfirst-fm.vercel.app/7/transcript)

### Inferences
- Two families exist. (1) **Server-sequenced LWW-per-property/record** (Figma, tldraw, Linear, Notion's main path, Excalidraw-ish) is the default for structured object graphs. (2) **CRDT** is used for text and for genuinely decentralized or offline-first products (Zed, AFFiNE, Anytype, Actual), and is increasingly embedded only inside rich-text fields of otherwise-LWW apps (Linear descriptions, Notion offline pages).
- The user's Item/List/Page model maps most closely to **Figma's `(ObjectID, Property, Value)` + parent-link-and-fractional-position** and to **tldraw's flat records + RecordsDiff**. Both are server-authoritative and avoid CRDT complexity.

### Gaps
- Google Docs' current storage backend (post-2010) was not found. The 2010 post does not describe snapshots.
- Linear's server stack is not officially published. The only stack details are from an unsourced third-party page.
- Excalidraw+ (paid) server persistence was not researched.
- No official tldraw statement on snapshot frequency. SQLite storage appears to persist per transaction, but this is not confirmed.

---

## Q2. Who uses file-system / object-storage-friendly layouts (one file/object per document), and how do they handle nested docs and references?

### Takeaway
"One blob per document plus a short log" is common at the **storage** layer: Figma checkpoints in S3, Excalidraw rooms in Firestore, y-sweet/Hocuspocus Yjs blobs in S3, tldraw's one Durable Object (with SQLite) per room, Automerge-repo's per-doc keys. **Nesting and references are always by stable ID in records, never by file path.** The path/filename approach (Obsidian, original Logseq) forces link rewriting on rename and whole-file rewrites, which is one of the reasons Logseq left files.

### Cited Findings
- **Figma:** the whole file is encoded in binary, compressed and stored as one S3 checkpoint object every 30–60 s, with an incremental journal in DynamoDB keyed per file — [Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/). Nesting is a parent-link property on the child plus a fractional position in the same property, with cycles rejected by the server — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **tldraw:** one Durable Object per room, with room state in that object's embedded SQLite. Assets go to R2 — [tldraw-sync-cloudflare](https://github.com/tldraw/tldraw-sync-cloudflare). Records are flat, with parent-child as fields on records. There is no sub-document sync — [Grida analysis](https://grida.co/docs/wg/research/crdt/tldraw)
- **Excalidraw:** one Firestore document per room containing `{sceneVersion, iv, ciphertext}` — [PyShine source tour](https://pyshine.com/Excalidraw-Virtual-Whiteboard-Source-Tour/)
- **Y-Sweet** (Jamsocket, Rust): "Persists document data to S3-compatible storage", citing Figma's approach. A path starting with `s3://` is treated as a bucket — [y-sweet README](https://github.com/jamsocket/y-sweet). (Observed: docs.jamsocket.com now redirects to a Modal post, "Jamsocket is joining Modal", and jamsocket.xyz shows "Jamsocket has joined Modal Labs", so project maintenance status is uncertain.)
- **Hocuspocus:** `onStoreDocument` (debounced) and `onLoadDocument` hooks. Ready extensions exist for **SQLite and S3**. Save as `Uint8Array`. Warning: do not store as JSON and rebuild to binary, because content will duplicate — [Hocuspocus persistence guide](https://tiptap.dev/docs/hocuspocus/guides/persistence)
- **Automerge-repo** is designed for plain key-value/filesystem stores. Keys are `[docId, "incremental", hash(change)]` and `[docId, "snapshot", heads]`. A backend implements only `load/save/remove/loadRange/removeRange` — [Automerge docs: storage](https://automerge.org/docs/reference/under-the-hood/storage/)
- **AFFiNE:** each page is a separate Yjs doc (per `doc-id`). Blobs go to S3 or the filesystem — [AFFiNE local-first](https://mintlify.com/toeverything/AFFiNE/features/local-first); [AFFiNE architecture](https://www.mintlify.com/toeverything/AFFiNE/contributing/architecture)
- **Yjs subdocuments** are the official nested-document mechanism. A subdoc is stored as a value in a parent's shared type (`folder.set('my-document.txt', subDoc)`), identified by a GUID that providers use as the room name, and lazily loaded with `load()`. "Not all providers support subdocuments yet," and official providers treat them as separate entities — [Yjs docs: subdocuments](https://docs.yjs.dev/api/subdocuments)
- **Obsidian:** one Markdown file per note. Links are by filename/path, with `^blockid` for block refs. Links are auto-updated on rename — [Obsidian links](https://obsidian.md/help/links). Real-time co-editing is not supported; sync is file-level — [Obsidian collaborate](https://obsidian.md/help/sync/collaborate)
- **Notion** (not file-based, for contrast): nested pages are blocks in a `content` array with a mirrored `parent` pointer. Permissions are computed by walking ancestors, which became expensive at 200B blocks — [Notion 2021](https://www.notion.com/blog/data-model-behind-notion); [Notion data lake 2024](https://www.notion.com/blog/building-and-scaling-notions-data-lake)
- **Logseq file graph:** "Creating a block requires rewriting the whole file, and renaming a page updates every file that references it" — [Logseq: Why the database version (Apr 29, 2024)](https://discuss.logseq.com/t/why-the-database-version-and-how-its-going/26744)
- **Anytype:** each object is its own change DAG inside a Space, and the Space is the unit of sync and ACL — [any-sync concepts](https://sync.any.org/concepts/)

### Inferences
- For the user's design, **one JSONL log (+ periodic snapshot file) per Page** is well supported by precedent (Figma, Automerge-repo, Zed, AFFiNE). Child pages should be **separate documents referenced by ID**. The parent/order relationship should be stored **on the child** as `{parentId, fractionalIndex}` in one atomic property (Figma), not as an array in the parent. This avoids Notion's mirrored content/parent dual-write and array-merge conflicts.
- Avoid filename/path as identity. Logseq's rename pain and Obsidian's link rewriting both stem from it. Use stable IDs in references and treat titles as properties.
- Permission inheritance by ancestor walk works at small scale but needed denormalization at Notion scale. Caching the ancestor path on each page is a cheap hedge.

### Gaps
- Whether AFFiNE uses Yjs subdocs or a workspace root doc listing pages was not confirmed.
- Excalidraw's handling of embedded/linked scenes was not researched.

---

## Q3. Who chose event logs / deltas, and how do they compact?

### Takeaway
Nearly everyone stores **deltas plus a periodic full snapshot**, recording on the snapshot the log position it covers. Recovery is "load latest snapshot, replay later deltas". The variations are in how the log position is identified (per-file sequence number, epoch, global sync ID, content hash/heads, document clock) and in whether compaction needs a lock. tldraw shows an alternative: keep **per-record state + per-record `lastChangedClock` + tombstones** instead of an op log, so "compaction" reduces to tombstone pruning.

### Cited Findings
- **Figma:** journal entries carry per-file sequence numbers, and checkpoints record the current sequence number. Recovery = latest checkpoint + journal entries after it. A lock table ensures a single writer per file journal. Checkpoints happen every 30–60 s. The correctness test is that checkpoint A + journal rebuilds checkpoint B byte-identically — [Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/). Future plans included catching up clients from journal entries and exposing the journal for webhooks and time-lapse — [Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **Google Docs:** the canonical store is an ordered revision log of insert/delete/style mutations, replayed to render — [Google Docs OT (2010)](https://idl.uw.edu/future-scholarly-communication/files/2010-GoogleDocs-OT.pdf)
- **Zed:** `buffer_operations` keyed by `(buffer_id, epoch, lamport_timestamp, replica_id)`, plus `buffer_snapshots` per epoch. Load = epoch snapshot + replay that epoch's ops. Bumping the epoch is the compaction boundary — [Zed commit](https://git.secluded.site/zed/commit/ff5035ea3761026deadc595e483fd1bd8057230c)
- **AFFiNE:** snapshot + update queue per doc. On load, pending updates are merged into the snapshot under a (space, doc) lock and the merged updates are deleted. A worker-coordination constraint lets only one worker compact a document at a time (`compactPendingDocUpdates`) — [AFFiNE CRDT storage](https://mintlify.com/toeverything/AFFiNE/api/storage/crdt); [DeepWiki AFFiNE (secondary)](https://deepwiki.com/toeverything/AFFiNE/4.2-document-processing-and-y-octo-crdt)
- **Automerge-repo (lock-free compaction on a plain directory):** every change is saved as an incremental chunk keyed by its hash. At some point the repo combines all chunks into a snapshot keyed by the doc's **heads**, then deletes only the incremental chunks **it had loaded**. Two concurrent compactors can leave two snapshots, which are merged on load (valid because it's a CRDT). This avoids transactions, which would be "very fiddly for simple mediums like a directory on the local filesystem" — [Automerge storage](https://automerge.org/docs/reference/under-the-hood/storage/)
- **y-leveldb:** stores incremental updates. `flushDocument` (dev only) merges all updates into one entry. A state vector is kept per doc. The repo was **archived Mar 7, 2026** and is deprecated — [y-leveldb](https://github.com/yjs/y-leveldb)
- **Hocuspocus:** overwrites the full binary Y.Doc state on a debounced store (snapshot-only, no log) — [Hocuspocus persistence](https://tiptap.dev/docs/hocuspocus/guides/persistence). An HN commenter named the hard parts as keeping active docs in an LRU in memory and garbage-collecting merged update blobs without CPU spikes — [HN: Hocuspocus 4 (May 20, 2026)](https://alt-hn.vercel.app/item/48208834)
- **Yjs community** framing (Feb 16, 2025): either (1) debounce and overwrite a snapshot (compact, fast load) or (2) append updates (optionally merging consecutive ones) — [discuss.yjs.dev poll](https://discuss.yjs.dev/t/poll-persistence-solutions/3732)
- **PowerSync + Yjs:** one Postgres row per Yjs update (BYTEA, Base64 over sync), applied with `Y.applyUpdateV2`, with seen IDs tracked. An edge function `merge-document-updates` periodically merges updates — [PowerSync blog (Jan 16, 2024; updated Nov 17, 2025)](https://powersync.com/blog/postgres-and-yjs-crdt-collaborative-text-editing-using-powersync.md)
- **Linear:** global `syncId` orders all sync actions. Clients catch up via delta packets after their `lastSyncId`, otherwise they re-bootstrap — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **tldraw:** no op log. There is a `documentClock` and per-record `lastChangedClock`. Tombstones are pruned beyond 5000; clients older than `tombstoneHistoryStartsAtClock` get a full `wipe_all` resync — [Grida analysis](https://grida.co/docs/wg/research/crdt/tldraw)
- **Anytype:** an append-only content-addressed change DAG with probabilistically chosen snapshot changes embedded in the DAG — [any-sync concepts](https://sync.any.org/concepts/)
- **Actual:** `messages_crdt` grows forever, with no compaction (2019), and an "epoch" cutoff was proposed — [James Long 2019](https://archive.jlongster.com/using-crdts-in-the-wild). Merkle branches older than a window are pruned, so very late clients are rejected — [localfirst.fm #7](https://localfirst-fm.vercel.app/7/transcript)
- **LiveStore:** "All data modifications are captured as an immutable, ordered sequence of events". SQLite state is "a projection of this eventlog". A central sync backend enforces a global total order, and pending local events are rebased on upstream before push. LWW by default — [LiveStore: How LiveStore works](https://docs.livestore.dev/evaluation/how-livestore-works/)
- **Weidner on event logs:** event sourcing gives intent, permissions, audit, history and undo. Log size is "only going to be a few megabytes per document anyway" for text events, and compaction is possible — [localfirst.fm #14 (Matthew Weidner)](https://localfirst-fm.vercel.app/14/transcript). OT-ish servers must keep past ops for transforms, and GC'ing that log prevents processing of very-late (offline) ops — [Weidner, Architectures for central server collaboration (Jun 4, 2024)](https://mattweidner.com/2024/06/04/server-architectures.html)
- **HN:** the simplest approach is an updates table where the client stores its last update ID and fetches newer ones on reconnect. The counterpoint: "after some time you want a 'materialized view'" — [HN thread on Linear reverse-engineering](https://hn.svelte.dev/item/44123131)
- **Discord (scale warning):** tombstones left uncompacted in Cassandra stalled the migration at 99.9999% — [Discord 2023](https://discord.com/blog/how-discord-stores-trillions-of-messages)

### Inferences
- The user's append-only JSONL deltas per page fit the Figma model directly. Concrete recipe from precedent:
  1. The server assigns a per-page monotonically increasing `seq` to each accepted delta (Figma sequence numbers, or the Linear syncId per page).
  2. Append batched deltas to `page.jsonl`.
  3. Periodically write `page.snapshot.json` containing `{seq: N, state}`.
  4. Recover by loading the snapshot and replaying lines with `seq > N`.
  5. Compact by starting a new log segment after the snapshot, so the old segment can be deleted. This is lock-free in the Automerge style: delete only the segments the snapshot covered.
  6. Reconnecting clients send `lastSeq`. If it is older than the oldest retained delta, send the full snapshot (tldraw's `wipe_all`).
- With LWW-per-property, replaying a range twice is idempotent (Figma relies on this), which makes crash recovery forgiving.
- A per-record `lastChangedSeq` (tldraw) lets catch-up be computed from state alone, without the log. This is a good fallback when logs are compacted aggressively.

### Gaps
- Figma's journal retention/truncation policy after a checkpoint is not stated in the post.
- Zed's code that advances epochs or writes snapshots was not found in the commit examined.
- Automerge-repo's compaction trigger heuristic is not documented on the storage page.

---

## Q4. What did Logseq (and others) learn going files → DB?

### Takeaway
Logseq found that Markdown-as-source-of-truth blocks **real-time collaboration, stable block IDs and timestamps, reliable multi-device sync, undo, and performance on large graphs**. The DB version makes **SQLite (on disk) + DataScript (in memory) canonical, with Markdown as export**. Two-way Markdown sync remains an aspiration, not a shipped feature. Notion made a similar move at a smaller scale: its best-effort SQLite cache became a persistent store plus a CRDT data model to support offline editing.

### Cited Findings
- Reasons given by tienson (Logseq co-founder), Apr 29, 2024:
  - "Real-time collaboration on Markdown is very hard"; creating a block rewrites the whole file, and a rename updates every referencing file.
  - File-based structured data lacks persistent IDs and timestamps.
  - Templates and properties are hard to maintain.
  - The file app lacked web support, **lost data when syncing across multiple clients**, performed poorly on large graphs, and had unreliable undo.
  - The team "had to build a persistent database from scratch" to run on web, Electron and mobile, handle up to 50,000 pages, and survive browser storage eviction.
  - The long-term goal was "seamless two-way sync between the database and markdown files".

  Source: [Logseq forum, Why the database version and how it's going (Apr 29, 2024)](https://discuss.logseq.com/t/why-the-database-version-and-how-its-going/26744)
- The current design keeps on-disk data in SQLite, while the app reads from in-memory DataScript. **"the database version is always canonical."** Markdown export only; MD edits are not read back, and continuous one-way export is under consideration. Goals were better sync, RTC and less data loss. Beta was announced Jul 13, 2026. RTC is part of paid Logseq Pro, and self-hosted sync is open source — [Logseq DB Unofficial FAQ (Jul 27, 2026)](https://logseq.io/page/e87c7359-51f7-44fe-87b3-4a0cd9f2dee3/695feeec-88be-4c5b-8bf2-572513c2f730)
- The README states the DB version is beta, the **RTC is alpha**, "data loss is possible", and it mentions regular SQLite DB backups — [Logseq README](https://github.com/logseq/logseq/)
- The `deps/db` library: "datascript for the frontend and SQLite for the backend", and it "defines the core schema and fns for DB graphs" — [Logseq deps/db README](https://fossies.org/linux/logseq/deps/db/README.md)
- DataScript storage mechanics: each B-tree node gets a 64-bit address. Store writes only new nodes (incremental). `d/restore` "does exactly zero reads" and loads lazily. `collect-garbage` removes unreferenced nodes — [DataScript storage docs](https://github.com/tonsky/datascript/blob/master/docs/storage.md). The SQL adapter's example table is `datascript(addr INTEGER primary key, content TEXT)` — [datascript-storage-sql](https://cljdoc.org/d/io.github.tonsky/datascript-storage-sql/2.0.0)
- The earlier announcement thread (Aug 6, 2023) said "Logseq has issues when using Markdown (or Org) files as storage". The old design kept a graph DB updated both by watching and parsing MD files and by typing (dual source of truth) — [Logseq forum, Database version: too drastic choice?](https://discuss.logseq.com/t/database-version-too-drastic-choice/20346)
- A user-quoted concern: "With Sqlite however, the database is a single file, so the data loss is way more dangerous." Another user argued that a non-bidirectional DB increases conflicts with Syncthing or Dropbox — [Logseq forum, bidirectional thread (Apr 2024)](https://discuss.logseq.com/t/is-there-still-a-bi-directional-approach-of-db-markdown-or-only-export-to-markdown-remains/26051?page=2)
- **Notion parallel:** the best-effort SQLite cache was insufficient for offline. They added persistent offline tables and migrated offline pages to a CRDT model. The team names "reference tracking, background syncing, and rich-text conflict resolution" as the hard problems — [Notion offline (Dec 11, 2025)](https://notion.com/blog/how-we-made-notion-available-offline)
- **Obsidian** stays files-first and accepts no live co-editing; Markdown merges via diff-match-patch can duplicate text — [Obsidian troubleshoot](https://obsidian.md/help/sync/troubleshoot); [Obsidian collaborate](https://obsidian.md/help/sync/collaborate)

### Inferences
- The lesson isn't "files are bad". It's that a **human-editable text file as the canonical store** conflicts with multi-writer real-time editing: there are no stable IDs, writes amplify (whole-file rewrites), external edits create dual sources of truth, and file-sync tools do blind merges. The user's design (machine-oriented JSONL deltas keyed by stable IDs, one writer per page via the server) **avoids most of Logseq's problems**, as long as the server process is the single writer and files are not hand-edited concurrently.
- If the user wants human-readable export (Markdown), precedent says to make it a derived one-way projection (Logseq DB, Notion export), not a bidirectional source.

### Gaps
- Logseq's RTC protocol and server architecture (op format, server stack) were not found before the search budget ran out.
- Whether Logseq's browser build uses OPFS was not confirmed. The `logseq/sqlite-wasm` README notes that OPFS requires worker builds and COOP/COEP headers but says nothing of Logseq's own use — [logseq/sqlite-wasm](https://github.com/logseq/sqlite-wasm)

---

## Q5. Simplifying concessions: what each company deliberately gave up, and why it was fine

### Takeaway
Every successful system narrowed the problem. Common concessions: **a central server instead of P2P**, **LWW at property or record granularity instead of semantic merge**, **atomic values (no intra-string merge) except where text matters**, **one process per document**, **notify-then-refetch instead of fine-grained diffs**, **a dumb relay server**, and **dropping long offline windows or very old clients by forcing a full resync**. The justification is almost always that **same-field concurrent conflicts are rare** in the product's real usage.

### Cited Findings
- **Figma:**
  - Gave up OT ("unnecessarily complex for our problem space") and a true CRDT, using server authority instead, so no timestamps or decentralized machinery are needed.
  - Property-level LWW with atomic values, so concurrent text edits in one value don't merge.
  - Deleted-object data lives in the client's undo buffer, not on the server.
  - Offline reconnect = re-download and reapply.
  - The transient reparenting-cycle case is handled "imperfectly but acceptably".
  - Why fine: "Figma isn't a text editor", and the server orders events.

  Sources: [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/). Checkpoints were initially only every 30–60 s (up to about 60 s of loss on crash), accepted until the 2022 journal — [Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/). Journal data is not cross-region replicated; checkpointing within 30 minutes was deemed enough, and global tables were rejected at about 6x cost — [Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **Figma (metadata):** LiveGraph is read-only, with writes via plain REST — [Tale of Two Sync Engines notes](https://second-brain-nuxt.vercel.app/a-tale-of-two-sync-engines). Hard range queries accept over-invalidation and a more restrictive schema — [LiveGraph 100x](https://www.figma.com/blog/livegraph-real-time-data-at-scale/)
- **Linear:** "naive last-write-wins, no conflict detection, no OT, no CRDT" for structured data — [HN](https://hn.svelte.dev/item/44123131). CRDT only for issue descriptions. Why fine: conflicts are uncommon in Linear — [Fujimoto 2024](https://www.fujimon.com/blog/linear-sync-engine). Local tables change only after server approval, and rejected transactions roll back — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **Notion:**
  - Record-level operations validated by the server (before/after states).
  - Real-time via "version changed" notifications plus refetch (`syncRecordValues`), not op streaming.
  - The client cache was best-effort for years.

  Sources: [Notion 2021](https://www.notion.com/blog/data-model-behind-notion); [Notion offline 2025](https://notion.com/blog/how-we-made-notion-available-offline). The SQLite-in-browser rollout limited writes to one active tab via a SharedWorker rather than solving multi-writer — [Notion WASM SQLite 2024](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite). It also chose app-level sharding by workspace so most queries stay single-shard — [Notion sharding 2021](https://www.notion.com/blog/sharding-postgres-at-notion)
- **tldraw:**
  - No CRDT; LWW on the same field (the losing change can be dropped).
  - Exactly one room process.
  - No P2P or offline-first, and optimistic state is not persisted across tab close.
  - No sub-document sync.
  - Stale clients beyond the tombstone horizon get a full wipe-and-resync.
  - Presence is in memory only.

  Source: [Grida analysis](https://grida.co/docs/wg/research/crdt/tldraw). Auth, rate limits and history are left to the integrator — [tldraw docs](https://tldraw.dev/docs/sync)
- **Excalidraw (2020):**
  - The relay server stores nothing.
  - Whole-element LWW by `version` with a deterministic `versionNonce` tie-break.
  - Tombstones are tolerated because sessions are small.
  - Multiplayer undo is simply disabled (the stack is cleared on remote update).

  Source: [Excalidraw 2020](https://plus.excalidraw.com/blog/building-excalidraw-p2p-collaboration-feature)
- **Google Docs:** only one change in flight per client, which limits the transformation cases — [Google Docs OT (2010)](https://idl.uw.edu/future-scholarly-communication/files/2010-GoogleDocs-OT.pdf)
- **Zed:** replica IDs are assigned centrally at session start, so there is no decentralized ID problem, and users can undo only their own operations — [Zed 2022](https://zed.dev/blog/crdts). Only edit and undo ops are persisted; selections and diagnostics are not — [Zed commit](https://git.secluded.site/zed/commit/ff5035ea3761026deadc595e483fd1bd8057230c)
- **Actual:** a 300-line "really, really stupid" relay server, field-level LWW, no log compaction, no enforcement of cross-field invariants, rejection of clocks skewed by more than 1 minute, and detaching very-late clients — [James Long 2019](https://archive.jlongster.com/using-crdts-in-the-wild); [localfirst.fm #7](https://localfirst-fm.vercel.app/7/transcript)
- **Obsidian:** no live co-editing at all. File-level sync with text merge for Markdown and LWW for everything else, and no fine-grained permissions — [Obsidian collaborate](https://obsidian.md/help/sync/collaborate); [Obsidian troubleshoot](https://obsidian.md/help/sync/troubleshoot)
- **Hocuspocus users:** a single small VM or container. One user reports about 3,000 users on 1 vCPU / 1 GB, and the maintainer claims more than 25k concurrent connections per instance. Commenters preferred this over serverless — [HN Hocuspocus 4 (May 2026)](https://alt-hn.vercel.app/item/48208834)
- **Weidner:** most collaborative apps don't process many ops per second, so simpler approaches' performance cost is acceptable. Use event sourcing for app data plus an embedded text CRDT only for text, and keep ephemeral presence out of the persisted log — [localfirst.fm #14](https://localfirst-fm.vercel.app/14/transcript)
- **Electric:** "conflicts are rare in practice", so blunt strategies are "perfectly serviceable for many applications". Start with the simplest write pattern — [Electric writes guide](https://electric.ax/docs/guides/writes)

### Inferences
- For a solo-built framework, the evidence strongly supports adopting Figma/tldraw's concessions wholesale:
  - server authority with a single writer per page;
  - property-level LWW;
  - atomic values;
  - re-download and replay on long disconnects;
  - presence kept out of the log.

  Then add a text CRDT (e.g. Yjs) **only** for rich-text item bodies if and when concurrent same-paragraph editing matters.

### Gaps
- No primary source quantifies conflict rates (e.g. % of writes that collide) for Figma or Linear. "Rare" is asserted qualitatively.

---

## Q6. Commonly recommended / paired stacks in 2025-2026 ("if you go this route, you use X, Y and Z")

### Takeaway
Five convergent architectures recur, each with a characteristic set of paired components:
- **(A)** room-per-document server authority (Durable Objects or one process per doc);
- **(B)** Yjs + a Yjs server (Hocuspocus, y-sweet, Liveblocks, PartyKit);
- **(C)** Postgres + a sync engine (Zero, Electric, PowerSync, or a custom Linear-style engine);
- **(D)** a local-first CRDT/event log with a thin relay;
- **(E)** files on disk + file sync.

A cross-cutting pattern is splitting **document sync** from **relational/metadata sync** and from **ephemeral presence**.

### Cited Findings

**(A) Server-authoritative room per document (Figma, tldraw)**
- tldraw route: `@tldraw/sync` client (`useSync`) → WebSocket → Cloudflare Worker routing → **one Durable Object per room** running `TLSocketRoom` → **`SQLiteSyncStorage` via `DurableObjectSqliteSyncWrapper`** (DO's embedded SQLite) → **R2** for assets. Alternatively, `@tldraw/sync-core` in Node with `node:sqlite` — [tldraw docs](https://tldraw.dev/docs/sync); [SQLiteSyncStorage](https://tldraw.dev/reference/sync-core/SQLiteSyncStorage); [tldraw-sync-cloudflare](https://github.com/tldraw/tldraw-sync-cloudflare)
- Figma route: custom client → WebSocket → per-document **Rust** multiplayer process with in-memory state → **DynamoDB journal** (≈0.5 s) + **S3 checkpoints** (30–60 s) + a DynamoDB lock table. **Postgres** holds non-document data, served in real time by **LiveGraph** (Go; Postgres replication stream → invalidators → cache → edge) — [Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/); [LiveGraph 100x](https://www.figma.com/blog/livegraph-real-time-data-at-scale/)
- Cloudflare positions DOs as "one object per document" with embedded SQLite and WebSockets. Liveblocks is a named customer — [Cloudflare DO](https://www.cloudflare.com/developer-platform/products/durable-objects/)
- PartyKit = write your own server class on Cloudflare's edge. You bring your own sync model and your own persistence — [PkgPulse comparison (Mar 9, 2026; partly unsourced)](https://www.pkgpulse.com/guides/liveblocks-vs-partykit-vs-hocuspocus-realtime-2026)

**(B) Yjs + a Yjs server (rich-text/doc editors)**
- Typical pairing: **Tiptap/ProseMirror editor + Yjs + Hocuspocus** (Node WebSocket server), persisted through the Database/SQLite/S3 extension as a `Uint8Array` blob. The managed option is Tiptap Cloud — [Hocuspocus persistence](https://tiptap.dev/docs/hocuspocus/guides/persistence); [PkgPulse](https://www.pkgpulse.com/guides/liveblocks-vs-partykit-vs-hocuspocus-realtime-2026)
- Alternatives: **Y-Sweet** (Rust, S3-compatible persistence, session backend per doc) — [y-sweet](https://github.com/jamsocket/y-sweet); **Liveblocks** (managed: presence, storage, comments, notifications; automatic persistence; free tier of 50 MAU) — [PkgPulse](https://www.pkgpulse.com/guides/liveblocks-vs-partykit-vs-hocuspocus-realtime-2026)
- Full product example (AFFiNE): **BlockSuite + Yjs (y-octo Rust) + IndexedDB on the client + Socket.io + NestJS/GraphQL/Prisma + Postgres (snapshot + updates tables) + Redis/BullMQ + S3/filesystem blobs** — [AFFiNE architecture](https://www.mintlify.com/toeverything/AFFiNE/contributing/architecture); [AFFiNE CRDT storage](https://mintlify.com/toeverything/AFFiNE/api/storage/crdt)
- Note: "Yjs isn't a sync engine, it's a data structure for managing distributed concurrent updates" — [HN commenter](https://hn.svelte.dev/item/44123131)

**(C) Postgres + sync engine (structured, Linear-like apps)**
- **Zero (Rocicorp):** 1.0 stable as of the InfoQ report of Jun 8, 2026, after about 2 years and more than 50 releases — [InfoQ (Jun 8, 2026)](https://infoq.com/news/2026/06/zero-version-1). Pairing: **Postgres** (source of truth) → logical replication → **zero-cache** (keeps a **SQLite replica**, runs incremental view maintenance, enforces permissions, holds WebSockets) → client (Replicache-based, **IndexedDB** cache, ZQL `useQuery`). Writes are mutators applied optimistically to IndexedDB, sent over WebSocket, executed against Postgres, then replicated back and reconciled, with "Pending optimistic mutations … replayed on top". Session affinity to one zero-cache instance is required — [Zero architecture docs](https://www.mintlify.com/rocicorp/mono/concepts/architecture); [Zero sync model docs](https://www.mintlify.com/rocicorp/mono/concepts/sync-model). Founder: "just a fancy cache"; limitations include Postgres-only and no surfaced rejected-write errors — [InfoQ](https://infoq.com/news/2026/06/zero-version-1)
- **Electric:** read-path only ("Electric does not do write-path sync"), streaming Postgres "shapes" to clients. You pair it with your own write API. Its write patterns, from simplest: online writes → `useOptimistic` → shared persistent optimistic store → through-the-DB sync with PGlite shadow tables — [Electric writes guide](https://electric.ax/docs/guides/writes)
- **PowerSync:** Postgres ↔ client SQLite. Yjs updates can be stored as rows for text — [PowerSync Yjs blog](https://powersync.com/blog/postgres-and-yjs-crdt-collaborative-text-editing-using-powersync.md)
- **Custom (Linear):** MobX object graph + IndexedDB per workspace + a transaction queue + WebSocket delta packets ordered by a global syncId + a server source of truth. Text fields use a CRDT — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine); [Fujimoto 2024](https://www.fujimon.com/blog/linear-sync-engine)
- **Scaled-up variant (Notion):** client SQLite (native) and WASM SQLite on OPFS with a SharedWorker (web) + transaction API + MessageStore WebSocket notifications + app-sharded Postgres (480 logical shards by workspace) + CDC (Debezium→Kafka→Hudi→S3) for analytics — [Notion 2021](https://www.notion.com/blog/data-model-behind-notion); [Notion WASM 2024](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite); [Notion data lake 2024](https://www.notion.com/blog/building-and-scaling-notions-data-lake)
- **DIY Postgres-first:** a logical replication slot → change-processor worker → WebSocket/SSE subscription API + auth/RLS middleware. Plan early for pooling, lag and conflict policy (LWW or OT) — [LavX summary of HN 46374814 (undated aggregator)](https://news.lavx.hu/article/building-a-real-time-sync-engine-on-postgres-what-works-what-doesnt)

**(D) Local-first CRDT / event log with thin relay**
- **Actual:** local SQLite + `messages_crdt` log with HLC + Merkle-tree diffing + a dumb relay server storing messages — [James Long 2019](https://archive.jlongster.com/using-crdts-in-the-wild)
- **Anytype:** per-object change DAG + snapshots in the DAG + ACL list + sync/consensus/file nodes + encryption per change — [any-sync concepts](https://sync.any.org/concepts/)
- **Automerge-repo:** Automerge docs + storage adapter (filesystem/IndexedDB; snapshot and incremental chunk keys) + sync server — [Automerge storage](https://automerge.org/docs/reference/under-the-hood/storage/)
- **LiveStore:** event log + SQLite materialized state + sync backend with global order + git-style rebase + LWW default — [LiveStore docs](https://docs.livestore.dev/evaluation/how-livestore-works/). It fits per-user data better than heavily shared data, because each user maps to one SQLite instance — [Choosing a sync engine in 2026 (Mar 9, 2026)](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)

**(E) Files on disk + file sync**
- **Obsidian:** Markdown vault + Obsidian Sync (E2E-optional; diff-match-patch for MD, LWW for others; version history/file recovery). No live co-editing — [Obsidian collaborate](https://obsidian.md/help/sync/collaborate); [Obsidian troubleshoot](https://obsidian.md/help/sync/troubleshoot)

**Practitioner opinions (2026)**
- One developer chose **Zero** for a font editor because it "just works" with Drizzle. He added separate infra for presence and chat, and called Electric (with TanStack DB) "radioactive waste that should be avoided at all costs" (long polling; writes need a custom backend). Triplit became community-maintained after the Supabase acqui-hire (Aug 2025). Jazz and Convex were described as very batteries-included — [Choosing a sync engine in 2026 (Mar 9, 2026; single-author opinion)](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- InfoQ places Zero in a field with ElectricSQL, InstantDB, PowerSync and Convex, and points fully decentralized needs to Jazz — [InfoQ (Jun 2026)](https://infoq.com/news/2026/06/zero-version-1)
- HN (mid-2025) lists Electric, Replicache, LiveStore, TinyBase, PowerSync, Firestore, and Loro/Yrs/Automerge as options. There is "little standardization". MongoDB Realm sync is deprecated — [HN thread](https://hn.svelte.dev/item/44123131)
- Artman: "start with emerging off-the-shelf engines before building your own" — [localfirst.fm #15](https://localfirst-fm.vercel.app/15/transcript)

**Cross-cutting splits**
- Figma separates file multiplayer from LiveGraph metadata sync — [Tale of Two Sync Engines notes](https://second-brain-nuxt.vercel.app/a-tale-of-two-sync-engines)
- tldraw separates presence records (never persisted) from document records — [tldraw collaboration](https://tldraw.dev/sdk-features/collaboration); [Grida](https://grida.co/docs/wg/research/crdt/tldraw)
- Weidner keeps ephemeral events separate from the persisted log — [localfirst.fm #14](https://localfirst-fm.vercel.app/14/transcript)
- AFFiNE uses a separate `awareness` channel — [AFFiNE architecture](https://www.mintlify.com/toeverything/AFFiNE/contributing/architecture)

### Inferences
- The user's architecture is pattern (A), self-hosted: one authoritative in-memory page per process plus a JSONL journal plus snapshots, which is Figma's design with the filesystem standing in for DynamoDB/S3. The closest off-the-shelf analogue to study is **tldraw sync-core**: record diffs, a server clock, `push_result` commit/rebase and per-record clocks. **Automerge-repo's storage layout** is the best reference for safe file-based compaction.
- If the user later needs relational queries across pages (search, backlinks, permissions), precedent (Figma LiveGraph, Notion) adds a separate index/DB fed from the journal rather than querying the logs.

### Gaps
- No StackShare-style or "best tech stack 2025/2026" posts from reputable primary sources were found. The available listicles (PkgPulse, Velt and others) are vendor or SEO content, partly unsourced. Use them only as weak signals.
- tldraw.com's own app-level stack (file lists, users) was not verified; the search budget ran out.
- Replicache's maintenance status and its relation to Zero could not be confirmed. The page found asked the question without an answer.

---

## Q7. What's the simplest architecture that still supports multi-user real-time editing?

### Takeaway
The minimum proven design is: **one authoritative in-memory copy per document on a single server process, clients apply edits optimistically and send small property-level ops over a WebSocket, the server serializes them (assigning sequence numbers), applies LWW per property, rebroadcasts, appends to a log, and periodically snapshots.** Clients rebase pending ops on server echoes, and reconnect by `lastSeq` or by full reload. Figma, tldraw and Linear all run variants of this. A text CRDT is the only common add-on, and only for collaborative prose.

### Cited Findings
- Weidner calls server-side serial application of CRDT-ish ops "dead simple" and server reconciliation (undo pending, apply remote, redo pending) "the most flexible way" to implement optimistic updates. He argues CRDT and OT are mostly optimizations over it in a central-server model — [Weidner 2024](https://mattweidner.com/2024/06/04/server-architectures.html)
- Figma: "CRDT literature can be relevant even if you're not creating a decentralized system"; "Multiplayer for a visual editor like ours wasn't as intimidating as we thought." One process per document plus property LWW — [Figma 2019](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- tldraw's working protocol: `connect(lastServerClock)` → `push(diff)` → `push_result(commit|discard|rebaseWithDiff)` + `patch` broadcasts. The server validates and migrates. About 16 ms server batching — [Grida analysis](https://grida.co/docs/wg/research/crdt/tldraw)
- Google Docs keeps one change in flight per client, with the server as the ordering point — [Google Docs OT (2010)](https://idl.uw.edu/future-scholarly-communication/files/2010-GoogleDocs-OT.pdf)
- Excalidraw shipped real-time collab with a stateless relay plus per-element `version`/`versionNonce` LWW and tombstones — [Excalidraw 2020](https://plus.excalidraw.com/blog/building-excalidraw-p2p-collaboration-feature)
- Actual shows a 300-line store-and-forward server is enough for multi-device sync when clients do HLC-ordered per-field LWW — [James Long 2019](https://archive.jlongster.com/using-crdts-in-the-wild)
- HN: an updates table plus a client-tracked last update ID is the simplest catch-up mechanism, though you eventually want a materialized view — [HN](https://hn.svelte.dev/item/44123131)
- Artman on why naive RPC plus WebSocket fails: an RPC response can arrive after another user's update to the same property, so you need a queue and sync ordering anyway — [localfirst.fm #15](https://localfirst-fm.vercel.app/15/transcript)
- Hocuspocus deployments reportedly run on one small VM — [HN Hocuspocus 4](https://alt-hn.vercel.app/item/48208834)
- tldraw warns that more than one room process per document breaks things (users can't see each other and overwrite), so single-writer-per-document must be enforced — [tldraw docs](https://tldraw.dev/docs/sync). Figma enforces it with a DynamoDB lock table — [Figma 2022](https://www.figma.com/blog/making-multiplayer-more-reliable/)

### Inferences
- Concrete minimal blueprint matching the user's stack:
  1. **UI binding:** Items are observable. A setter records `{id, prop, old, new}` (Linear's MobX setter trick).
  2. **Client state:** an in-memory record map plus a pending-ops queue. Apply locally at once, and on server `ack(seq)` drop from the queue. On a remote op, apply unless it conflicts with a pending local op on the same `(id, prop)` (Figma's flicker rule), or do full rebase (tldraw).
  3. **Transport:** WebSocket; batch ops every ~16–33 ms (tldraw, Figma); a separate presence channel that is never persisted.
  4. **Server:** one in-memory page per process. Enforce a single writer (a file lock, or Figma-style lock record). Validate (e.g. reject parent cycles), assign `seq`, apply LWW, broadcast.
  5. **Storage:** append `{seq, ops}` to `page.jsonl`. Snapshot every N seconds or ops, recording `seq`. Rotate segments. Child pages are separate files, referenced by `parentId + fractionalIndex` on the child.
  6. **Reconnect:** the client sends `lastSeq`. The server replays from the log if it is retained, otherwise sends the snapshot.
  7. **Validation:** test that snapshot + log replay equals the next snapshot (Figma's byte-identical check).
- The main thing this simple design does not handle is concurrent edits *within one text value*. If needed, store that field as a Yjs/Automerge doc (or as Yjs update blobs in the same JSONL), as Linear and Notion did later.

### Gaps
- No primary source gives throughput limits for a single Node process per document under heavy fan-out. The Hocuspocus 25k-connection figure is a maintainer claim, not a benchmark.
