# Sync engines, local-first databases and CRDT libraries for JS/Node (state as of 29 Oct 2026)

Scope: tools that persist and stream object/list state in real time, judged against one specific design. That design is a vanilla-JS framework with an `Item` base class (get/set that fires change events), `List extends Item` wrapping an array of Items, `Page extends Item` with pages nested inside pages, references between items, append-only JSONL delta logs replayed on load, and a custom socket server. The user wants swappable storage (JSONL files, SQLite, cloud DB, S3/R2) and a file-system-friendly layout.

Method notes:
- Versions and dates come from the npm registry (queried 29 Oct 2026), GitHub raw READMEs and source files, and official docs and blogs.
- Some API details were checked against the typings in the published npm tarballs.
- GitHub API access and some CDN hosts (jsdelivr, esm.sh, rxdb.info) were blocked from this environment. I could not test CDN loading directly.
- The web-search budget ran out late in the session. Adopter details for some tools (Electric, TinyBase, RxDB, Convex) could not be researched further and are listed as gaps.
- Per the coordinator, star and download statistics are left out. Release dates are kept only where they show whether a tool is maintained or abandoned.

---

## Candidate profiles: what each tool is, its data model, storage, server needs, vanilla-JS fit and lock-in

### Takeaway
The candidates fall into three groups:
1. **CRDT document libraries** (Yjs, Automerge, Loro). These are embeddable and storage- and transport-agnostic, and they map best onto an Item/List object model.
2. **Database-centric sync engines** (Zero, Electric, PowerSync, InstantDB, Convex, Triplit, Jazz 2). These assume a server database, usually Postgres, and a relational or query model.
3. **Local stores with sync bolted on** (TinyBase, RxDB, LiveStore, Evolu).

For a nested Page/Item/List tree with reorders and multi-user editing, only the CRDT libraries model it natively. Loro is the closest fit because it has native movable lists and trees. The database-centric engines would force the user's objects into rows.

### Cited Findings

#### Yjs (+ y-websocket, y-leveldb, Hocuspocus, YHub, y-sweet)
- **Releases:** the latest stable is 13.6.33 (2026-09-23), and 13.6.x patches ship every one to three months through 2026. v14 has been in prerelease since 14.0.0-0 (2022-08-18). The newest beta is 14.0.0-16 (2025-12-07), and the npm `latest` tag still points to 13.x. — [npm registry: yjs](https://registry.npmjs.org/yjs)
- **Yjs 14:** it was announced at FOSDEM '26. It unifies the shared types into one `Type` interface ("essentially an XML element with optional name, attributes, and children"), adds a zod-like schema, and adds CRDT-agnostic "deltas" in `lib0/delta` that can be rebased, diffed and applied. Attribution (who changed what) is aimed at suggestion and track-changes modes. The source post (24 Apr 2026) gives no release date. — [Y.js 14 & @y/prosemirror](https://nick-the-sick.pckt.blog/yjs-14-at-yprosemirror-wwv64pw)
- **Update model:** updates are "commutative, associative, and idempotent". State vectors let peers exchange only diffs. `Y.mergeUpdates` combines updates, and "the merged document update is always smaller than the separate updates". Merging updates without a `Y.Doc` "doesn't garbage-collect deleted content"; that requires loading into a Y.Doc. — [Yjs docs: Document Updates](https://docs.yjs.dev/api/document-updates)
- **Y.Array:** methods are insert, delete, push, unshift, get, slice, toArray, toJSON. There is **no move method**. `observe` returns a Quill-style array delta such as `[{retain: 2}, {delete: 1}]`, and `observeDeep` exists for nested types. — [Yjs docs: Y.Array](https://docs.yjs.dev/api/shared-types/y.array)
- **Ordered trees:** the Yjs README points to a third-party `yjs-orderedtree` utility ("Class for ordered trees via Y.Map. Handles insert, delete, and move operations for folder-like hierarchies"). — [Yjs README](https://github.com/yjs/yjs)
- **Servers:** y-websocket-server "is intended as a development server or as a starting point". For production it points to YHub ("the official Yjs backend") and Hocuspocus. — [y-websocket-server README](https://github.com/yjs/y-websocket-server)
- **YHub:** "beta software". It needs Redis 6.2+ or Valkey plus S3 or Postgres storage. The server holds no Y.Doc in memory and streams updates through Redis streams, with a worker that persists to S3 or Postgres. It is dual-licensed AGPL or proprietary ("Please contact me to buy a license"). @y/hub 0.10.1 was released 2026-10-16. — [YHub README](https://github.com/yjs/yhub); [npm @y/hub](https://registry.npmjs.org/@y%2fhub)
- **Hocuspocus 4** (stable since 8 May 2026):
  - It runs on Bun, Deno, Cloudflare Workers and Node, via crossws in place of `ws`, and requires Node 22+.
  - Store hooks now fire on every document change, including server-side edits.
  - The SQLite extension moved to better-sqlite3.
  - The wire protocol is backward compatible.
  - The current release is 4.8.0 (2026-10-28), MIT.
  - Sources: [Tiptap blog: Hocuspocus 4 stable](https://tiptap.dev/blog/release-notes/hocuspocus-4-stable-release); [npm @hocuspocus/server](https://registry.npmjs.org/@hocuspocus%2fserver)
- **Hocuspocus persistence is snapshot-overwrite, not an append log:**
  - The Database extension's `onStoreDocument` stores `Y.encodeStateAsUpdate(data.document)`, the full state. — [Database.ts](https://github.com/ueberdosis/hocuspocus/blob/main/packages/extension-database/src/Database.ts)
  - The SQLite extension uses one row per document name with `ON CONFLICT(name) DO UPDATE SET data = $data`. — [SQLite.ts](https://github.com/ueberdosis/hocuspocus/blob/main/packages/extension-sqlite/src/SQLite.ts)
  - The S3 extension writes `{prefix}{documentName}.bin` to S3, MinIO, R2 or B2, and suggests pairing with Redis for horizontal scaling. — [extension-s3 README](https://github.com/ueberdosis/hocuspocus/tree/main/packages/extension-s3)
- **y-sweet:** a Rust Yjs server that "Persists document data to S3-compatible storage, like Figma". `npx y-sweet serve /path/to/data` persists to a directory, and a path starting with `s3://` uses a bucket. It has a vanilla JS example and is MIT. The last npm release was 0.9.1 (2025-09-16). — [y-sweet README](https://github.com/jamsocket/y-sweet); [running.md](https://github.com/jamsocket/y-sweet/blob/main/docs/running.md); [npm y-sweet](https://registry.npmjs.org/y-sweet)
- **y-partyserver (Cloudflare):** `onLoad` initialises `this.document`. `onSave` "is called periodically after the document has been edited, and when the room is emptied". Debounce defaults are `debounceWait` 2000 ms and `debounceMaxWait` 10000 ms. — [y-partyserver README](https://github.com/cloudflare/partykit/tree/main/packages/y-partyserver)
- **Bundle size:** an aggregator claims about 18 kB min+gz for Yjs (pure JS, no WASM), about 320 kB for Automerge and about 180 kB for Loro. These figures are unverified and from a low-quality source; see the Loro and Automerge WASM sizes below, which point to much larger downloads for those two. — [PkgPulse, 12 Apr 2026](https://www.pkgpulse.com/guides/yjs-vs-automerge-vs-loro-crdt-libraries-2026)

#### Automerge (3.x) + automerge-repo
- **Automerge 3.0** (14 Jul 2025):
  - Memory use is cut "by over 10x", using the compressed format at runtime. Their example: Moby Dick took 700 MB in v2 and 1.3 MB in v3.
  - It uses "the same file format as Automerge 2".
  - It removed the old `Text` API.
  - Source: [Automerge 3.0 blog](https://automerge.org/blog/automerge-3/)
- **Releases:**
  - Automerge 3.5.0 (2026-09-16) adds authorship: "Automerge changes can now record an author". — [This Month in Automerge: Sept '26](https://automerge.org/blog/2026-september/)
  - The npm `latest` tag for `@automerge/automerge-repo` and `-storage-nodefs` points to **2.6.0-alpha.3** (2026-08-07). The last plain-stable release is 2.5.6 (2026-05-18). This mislabelled tag is a minor maturity flag. — [npm registry: automerge-repo](https://registry.npmjs.org/@automerge%2fautomerge-repo)
- **automerge-repo storage design:**
  - Every change is saved as an "incremental" chunk.
  - The repo "occasionally" compacts all loaded changes into a "snapshot" chunk keyed by document heads, then deletes "only the incremental changes it had previously loaded". This makes concurrent compaction across processes and tabs safe.
  - Keys are `[documentId, "snapshot"|"incremental", identifier]`. The backend must support range queries.
  - Adapter interface: `load`, `save`, `remove`, `loadRange`, `removeRange`. The design "needs no concurrency control from the adapter implementor".
  - Source: [Automerge: Under the hood: Storage](https://automerge.org/docs/reference/under-the-hood/storage/)
- **Built-in adapters:** IndexedDB and NodeFS. "Roll your own" should be "straightforward to build on top of any key/value store which supports range queries". NodeFS is "safe for multiple processes to use the same data directory". — [Automerge docs: Storage](https://automerge.org/docs/reference/repositories/storage/)
- **NodeFS adapter layout:**
  - Path is `baseDirectory/<first 2 chars of docId>/<rest of docId>/<chunk type>/<id>`, one binary file per chunk. The default directory is `automerge-repo-data`.
  - Reads are capped at 100 concurrent file operations because "loadRange() can fan out across thousands of chunk files for a single document".
  - Source: [NodeFS adapter source](https://github.com/automerge/automerge-repo/blob/main/packages/automerge-repo-storage-nodefs/src/index.ts)
- **List API:** the public list API in the 3.5.0 typings has `insertAt`, `deleteAt`, `splice` and `updateText`. There is **no list move function**; "move" appears only as a cursor-resolution option. — [@automerge/automerge 3.5.0 tarball typings](https://registry.npmjs.org/@automerge/automerge/-/automerge-3.5.0.tgz)
- **Move research vs shipped code:** a 2023 SPLASH paper, "Extending Automerge: Undo, Redo, and Move", exists. A 2025 paper notes Automerge "requires a specific move operation". — [SPLASH 2023 listing](https://2023.splashcon.org/details/plf-2023-papers/2/Extending-Automerge-Undo-Redo-and-Move); [Melda move paper (arXiv 2503.04811)](https://arxiv.org/html/2503.04811v1). Neither shows move shipping in the JS API (see the typings above).
- **WASM loading:**
  - Node needs nothing special.
  - Bundlers need plugins: Webpack `asyncWebAssembly`, or Vite `vite-plugin-wasm` plus `vite-plugin-top-level-await`.
  - The escape hatch is `/slim` imports plus `initializeWasm(url)` or `initializeBase64Wasm`.
  - Source: [Automerge docs: library initialization](https://automerge.org/docs/library_initialization/)
- **No-bundler builds:** the 3.5.0 tarball ships `dist/iife/iife.js` (about 5 MB), which sets `window.Automerge`. The `automerge.wasm` file is about 3.6 MB uncompressed. — [@automerge/automerge 3.5.0 tarball](https://registry.npmjs.org/@automerge/automerge/-/automerge-3.5.0.tgz)
- **New in 2026:**
  - **Subduction**, Ink & Switch's P2P sync protocol based on "Sedimentree" history sharding. It is encryption-friendly and has WebSocket, HTTP long-poll and Iroh transports plus a filesystem storage crate. It is marked "early release preview… DO NOT use for production". — [Subduction README](https://github.com/inkandswitch/subduction)
  - **Keyhive/ARK** (`@automerge/automerge-repo-keyhive`) "adds access control and end-to-end encryption to automerge-repo". — [This Month in Automerge: Aug '26](https://automerge.org/blog/2026-august/)
  - `@automerge/automerge-repo-sync-server` 0.3.0 was released 2026-09-30. — [npm registry](https://registry.npmjs.org/@automerge%2fautomerge-repo-sync-server)

#### Loro
- **Status:** loro-crdt 1.17.1 (2026-10-22), MIT. 1.0 shipped in 2024, with frequent 1.x releases since. — [npm registry: loro-crdt](https://registry.npmjs.org/loro-crdt); [Loro README](https://github.com/loro-dev/loro)
- **Container types:** Text (Fugue), rich text (Peritext-style), Moveable Tree, Moveable List, LWW Map, Counter, plus "Mergeable map-key children via ensureMergeable*". It also offers time travel, Git-like version control and shallow snapshots. — [Loro README](https://github.com/loro-dev/loro)
- **Export/import:**
  - `doc.export({mode:"update"})` produces deltas, and `doc.export({mode:"snapshot"})` produces full state.
  - `doc.checkout(version)` time-travels.
  - Map keys must be strings, and cyclic links should be avoided.
  - Source: [Loro docs intro](https://loro.dev/docs)
- **MovableList vs List:**
  - MovableList adds `set` and `move`, using Kleppmann's "Moving Elements in List CRDTs" algorithm.
  - Simulating move with delete+insert on a plain List breaks under concurrency: "the deletion of the original element and the insertion of two new elements".
  - Cost: MovableList is "approximately 80% slower in encode/decode and consumes about 50% more memory" than List when only inserts and deletes are used.
  - Source: [Loro docs: List and MovableList](https://loro.dev/docs/tutorial/list)
- **Movable tree:**
  - It uses Kleppmann et al.'s tree move operation. Deletion is a move to TRASH, and moves that would create a cycle are recorded but skipped.
  - Sibling order uses fractional indexes with PeerID tie-break and optional jitter (`setFractionalIndexJitter`).
  - API: `createNode`, `move`, `moveAfter`, `moveBefore`.
  - Benchmark: 10,000 random moves on 1,000 nodes took 28 ms.
  - Source: [Loro blog: Movable tree CRDTs](https://www.loro.dev/blog/movable-tree)
- **Shallow snapshots (compaction):**
  - `export({mode:"shallow-snapshot", frontiers})` trims history like a git shallow clone. In their example, 5421 bytes became 869 bytes.
  - Caveat: trimming can make later concurrent ops unmergeable, so the start version "must be synchronized across all endpoints before trimming".
  - Source: [Loro docs: Shallow snapshot](https://loro.dev/docs/advanced/shallow_snapshot)
- **Typings in 1.17.1:**
  - `subscribe(listener)` exists on the doc and on every container. Event batches carry `by: "local" | "import" | "checkout"`.
  - Diffs are typed as `ListDiff | TextDiff | MapDiff | TreeDiff | CounterDiff`, and tree diffs report `create`, `move` and `delete` actions.
  - `subscribeLocalUpdates((bytes) => …)` streams local update bytes.
  - `exportJsonUpdates()` and `importJsonUpdates()` exchange ops in JSON form.
  - Other methods: `commit({origin, message, timestamp})`, `importBatch`, `forkAt`, `getByPath`, `getContainerById`, `EphemeralStore` and `Awareness`.
  - Source: [loro-crdt 1.17.1 tarball typings](https://registry.npmjs.org/loro-crdt/-/loro-crdt-1.17.1.tgz)
- **Browser loading:** the `web/` build loads its WASM via `new URL('loro_wasm_bg.wasm', import.meta.url)` plus `fetch`. That is the standard wasm-bindgen "web" target, which works from native ES modules without a bundler. `loro_wasm_bg.wasm` is about 3.6 MB uncompressed. — [loro-crdt 1.17.1 tarball](https://registry.npmjs.org/loro-crdt/-/loro-crdt-1.17.1.tgz)
- **Sync layer: loro-protocol / loro-websocket** (MIT):
  - A transport-agnostic protocol that multiplexes many rooms per connection, with a 256 KiB maximum message size and fragmentation for larger updates.
  - It can also carry Yjs and Yjs Awareness, and supports E2EE via "%ELO".
  - The Node `SimpleServer` has `authenticate`, `onLoadDocument`, `onSaveDocument` and `saveInterval` (snapshot bytes) hooks. A Rust server offers optional SQLite snapshotting.
  - Source: [loro-dev/protocol README](https://github.com/loro-dev/protocol)
- **Hosting:** the Loro homepage says "You bring UI, auth, storage, and transport". There is no hosted service and no named adopters, only anonymous testimonials. — [loro.dev](https://loro.dev/)

#### Replicache / Rocicorp Zero
- **Replicache:** "Replicache is now in maintenance mode". It is free ("no longer charge for its use") and open-sourced in rocicorp/mono, and users are advised to "migrate to Zero as they are able". The last npm release was 15.3.0 (2025-07-02). — [replicache.dev](https://replicache.dev/); [npm replicache](https://registry.npmjs.org/replicache)
- **Zero 1.0** (InfoQ, 8 Jun 2026; the npm 1.0 tag dates from 2026-03-24):
  - It is "a very minor update" to 0.26.2.
  - "Only Postgres is supported for now".
  - The client bundle is 718 KB uncompressed (232 KB gzipped), as cited by critics.
  - Queries are written in ZQL and run on the local cache first.
  - Sources: [InfoQ: Zero version 1](https://infoq.com/news/2026/06/zero-version-1); [npm @rocicorp/zero](https://registry.npmjs.org/@rocicorp%2fzero)
- **Architecture:**
  - "replicates Postgres into a SQLite replica inside zero-cache, then syncs subsets of rows to clients based on the queries your app runs".
  - The client store is IndexedDB.
  - Mutators run optimistically on the client, then zero-cache calls your `ZERO_MUTATE_URL` endpoint, which applies them to Postgres.
  - "Do not generate IDs inside mutators, since mutators run multiple times."
  - Source: [Zero llms.txt](https://zero.rocicorp.dev/llms.txt)
- **Vanilla use:** the client typings expose `zero.materialize(query)`, which returns a view with listeners, so it can be used without React. Exports include react, solid, react-native and sqlite. Current release is 1.11.3 (2026-10-23), Apache-2.0. — [@rocicorp/zero 1.11.3 tarball](https://registry.npmjs.org/@rocicorp/zero/-/zero-1.11.3.tgz)
- **Pricing:** Cloud Zero is Hobby $30/mo, Professional $300/mo, and BYOC from $1000/mo. Zero is "open-source and self-hostable". — [zero.rocicorp.dev](https://zero.rocicorp.dev/)

#### ElectricSQL (+ Durable Streams, PGlite)
- **What it is:** "a read-path sync engine for Postgres" over an HTTP API that is CDN-friendly. Partial replication uses "Shapes". It requires Postgres with logical replication. — [Electric README](https://github.com/electric-sql/electric)
- **Writes:** "Client writes aren't built in", so you build your own endpoints. The same author calls the long-polling transport "extremely slow and brittle" (opinion, Mar 2026). — [johnny.sh: Choosing a Sync Engine in 2026](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- **Durable Streams** (9 Dec 2025):
  - "a persistent stream primitive and HTTP protocol for reliable, resumable, real-time data streaming".
  - Each stream has a URL. `PUT` creates it, `POST` appends and returns the next offset, and `GET` catches up or tails via long-poll or SSE.
  - Offsets are "opaque, monotonic". Framing is raw bytes such as NDJSON, or a JSON mode.
  - Clients resume from their saved offset, so the server holds no per-client session state.
  - The reference server is Node.js.
  - Source: [Electric: Announcing Durable Streams](https://electric.ax/blog/2025/12/09/announcing-durable-streams)
- **Hosted Durable Streams** (Jan 2026): idempotent producers and exactly-once semantics in 0.2.0, more than 400 conformance tests, and clients in 10 languages. — [Electric: hosted Durable Streams](https://electric.ax/blog/2026/01/22/announcing-hosted-durable-streams)
- **Databricks acquisition** (11 Aug 2026): "Electric Cloud is winding down". "everything we've previously open sourced stays open source", naming Postgres Sync, PGlite, TanStack DB and Durable Streams. — [Electric: joining Databricks](https://electric.ax/blog/2026/08/11/electric-joining-databricks.md)

#### PowerSync
- **What it is:** it "keeps a client-side SQLite database in sync with your backend database". Supported backends are Postgres, MongoDB, Azure DocumentDB, MySQL and SQL Server. — [powersync-service README](https://github.com/powersync-ja/powersync-service)
- **Write path:** "Writes are applied locally, and queued for upload to your backend API". You keep "full control over logic for applying writes". — [powersync.com](https://www.powersync.com/)
- **Licensing:** the service is licensed FSL-1.1-ALv2 (source-available, converting to Apache later). The JS SDKs are Apache-2.0 (`@powersync/web` 2.5.0 and `@powersync/node` 1.2.0, both 2026-10-19). — [powersync-service LICENSE](https://github.com/powersync-ja/powersync-service/blob/main/LICENSE); [npm @powersync/web](https://registry.npmjs.org/@powersync%2fweb)
- **Self-hosting:** via Docker (`journeyapps/powersync-service`). The dashboard is not available when self-hosting. — [PowerSync self-hosting](https://docs.powersync.com/self-hosting/getting-started)
- **SDK packages:** React, Vue, TanStack Query, Kysely and Drizzle integrations, plus a Yjs demo that stores Yjs CRDT data in Postgres through PowerSync. The demos use Vite or Webpack. — [powersync-js README](https://github.com/powersync-ja/powersync-js)

#### LiveStore
- **Model:**
  - "client-centric data layer… with a reactive embedded SQLite database powered by real-time sync (via event-sourcing)".
  - Events are committed, persisted locally, synced, and applied to SQLite through "materializers".
  - Apache-2.0.
  - Source: [LiveStore package README](https://github.com/livestorejs/livestore/tree/main/packages/@livestore/livestore)
- **Platforms:**
  - Sync providers: Cloudflare Workers, ElectricSQL, S2, or custom.
  - Adapters: web, Expo, Node, Cloudflare Durable Object, Electron, Tauri.
  - Integrations: React, Solid, Vue, Svelte and Custom Elements.
  - The 0.4 to 0.5 upgrade includes an Effect 3 to Effect 4 migration.
  - Source: [LiveStore docs](https://docs.livestore.dev/)
- **Releases:** 0.5.0 (2026-10-15). Peer dependencies include `effect` ^4 and OpenTelemetry. — [npm @livestore/livestore](https://registry.npmjs.org/@livestore%2flivestore)
- **Status:**
  - "beta"; development since 2021; "not yet ready for all production scenarios"; "no specific timeline for a 1.0 release".
  - Minor releases may change client or backend storage formats.
  - **Eventlog compaction is listed only under "Long-term"** (issue #136).
  - Source: [LiveStore: State of the project](https://docs.livestore.dev/evaluation/state-of-the-project/)
- **Eventlog growth:** the docs warn that you "need to be careful so eventlog doesn't grow too much". — [LiveStore: Event sourcing](https://docs.livestore.dev/evaluation/event-sourcing/)
- **Stated limits:** it does not sync with an existing database, has no hosted service, "Doesn't scale for unbounded amounts of data", and has no P2P. — [livestore.dev](https://livestore.dev/)
- **Vanilla use:** the custom-elements example uses `createStorePromise`, `queryDb`, `store.query`, `store.subscribe` and `store.commit(events.todoCreated(...))`. The worker imports use the bundler-specific `?worker` / `?sharedworker` suffixes, with OPFS storage. — [LiveStore: Custom Elements](https://docs.livestore.dev/framework-integrations/custom-elements/)
- **Sharing:** "Each user maps to one SQLite instance, which makes sharing data between users hard." (practitioner opinion) — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)

#### TinyBase
- **What it is:** "a reactive in-memory data store with persistence and synchronization". 7.3–16.4 kB, no dependencies. Data is key-value Values plus Tables/Rows/Cells, with indexes, relationships, queries and checkpoints (undo). React, Solid and Svelte bindings are optional. — [TinyBase readme](https://github.com/tinyplex/tinybase)
- **Major-version cadence:** v6 in Mar 2025, v7 in Dec 2025, v8 in Mar 2026, v9 in Jul 2026 and v10.0.1 on 2026-09-24. — [npm registry: tinybase](https://registry.npmjs.org/tinybase)
- **Persisters:** Session, Local, OPFS, File, IndexedDB, Remote, Durable Object KV and SQL, SQLite (Bun, wasm, Expo, RN, node, better-sqlite3), Postgres, PGlite, TinyJoin, LibSQL/Turso, PowerSync, Yjs, Automerge and PartyKit, plus `createCustomPersister`. SQL persisters store MergeableStore data only in "DpcJson" mode, not "DpcTabular". — [TinyBase persisters module docs (source)](https://github.com/tinyplex/tinybase/blob/main/src/@types/persisters/docs.js)
- **FilePersister:** it writes the **entire store as one JSON file**. The write is atomic: a temp file, then rename. It watches the file for external changes and supports both Store and MergeableStore. — [persister-file source](https://github.com/tinyplex/tinybase/blob/main/src/persisters/persister-file/index.ts)
- **MergeableStore:**
  - Each update gets a hybrid-logical-clock timestamp and a hash, and conflicts resolve "last write wins".
  - Synchronizers run over WebSocket (client and server, including a Durable Object server), BroadcastChannel or a custom medium.
  - Sources: [TinyBase: Using a MergeableStore](https://tinybase.org/guides/synchronization/using-a-mergeablestore/); [TinyBase: Synchronization](https://tinybase.org/guides/synchronization/); [TinyBase readme](https://github.com/tinyplex/tinybase)
- **Synclets:** a new sibling project from tinyplex. It composes a data connector (PGlite, SQLite, TinyBase, Browser, **Files**, Memory), a meta connector and a transport (WebSockets, BroadcastChannel, Memory). It is "pre-alpha". — [synclets.org](https://synclets.org/)

#### Jazz
- **Jazz 2.0 alpha:** "this is the Jazz 2.0 alpha with an entirely new API". It is now "a local-first relational database" with a Rust core (WASM and NAPI) and bundled SQLite, under the MIT license. — [Jazz README](https://github.com/garden-co/jazz)
- **2.0 releases:** 2.0.0-alpha.0 (2026-02-17) through alpha.59 (2026-10-04). Classic `jazz-tools` is at 0.20.19 (2026-07-03). — [npm jazz-tools](https://registry.npmjs.org/jazz-tools)
- **Why v2 changed:**
  - Classic Jazz used cryptographic permissions and CRDTs everywhere, which required replaying history to compute current values.
  - v2 makes "the Jazz server a trusted authority" for permissions, uses git-like snapshot DAGs, and adopts a relational, ORM-like query model.
  - Classic gets security patches and blocking fixes, and classic Jazz Cloud stays up "until everyone has had a fair chance to migrate", with no end date.
  - Source: [Jazz blog: What we learned from classic Jazz, 17 Apr 2026](https://jazz.tools/blog/what-we-learned-from-classic-jazz)
- **v2 API:** `s.table`, `s.defineApp`, `db.insert`, `db.update`, `db.delete` and `db.subscribe`. The plain-TypeScript setup uses Vite. Jazz Cloud v2 sync is at `https://v2.sync.jazz.tools/`, and "unclaimed apps are automatically deleted after 14 days". — [Jazz docs: install client](https://jazz.tools/docs/install/client)
- **Self-hosting and pricing:** "The single-tenant Jazz server will always be open source and is easy to self-host." Draft cloud pricing is $0.039/hr compute, $0.45/GB-month storage and $0.09/GB egress. — [jazz.tools](https://jazz.tools/)
- **Classic API:** CoMap, CoList, CoFeed, CoText and FileStream, with a non-React example using `jazz-tools/browser`, `$jazz.push`, `$jazz.set` and `.subscribe`. — [Classic Jazz docs](https://classic.jazz.tools/docs)

#### Triplit
- **Supabase deal:** Triplit "joins Supabase" (8 Oct 2025). The post says "Our focus isn't to directly integrate Triplit into our platform", and the founder "will spend time further open-sourcing the Triplit codebase". — [Supabase blog](https://supabase.com/blog/triplit-joins-supabase)
- **Releases and license:** the last npm release of `@triplit/client` was 1.0.50 (2025-07-31), licensed AGPL-3.0-only. — [npm @triplit/client](https://registry.npmjs.org/@triplit%2fclient)
- **Maintenance:** one practitioner says it was "acqui-hired by Supabase, leaving it community-maintained". — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- **Features:** "Pluggable storage providers like SQLite, IndexedDB, LevelDB, Memory", property-level CRDT conflict resolution, and a vanilla JS API. — [Triplit README](https://github.com/aspen-cloud/triplit)

#### InstantDB
- **Shutdown:** the team joined OpenAI, announced 22 Aug 2026. Instant Cloud apps are supported until 31 Aug 2027, with backups kept a further year. — [RuntimeWire](https://runtimewire.com/article/instant-team-joins-openai-cloud-shutdown)
- **Self-hosting:** the docs say "Instant is sunsetting. Services will continue until August 31st, 2027." Self-hosting runs on the JVM, at about $30/mo on a VPS and "at least $600/mo" on AWS. — [Instant docs: self-hosting](https://www.instantdb.com/docs/self-hosting)
- **Server stack:** the server is Clojure and needs Postgres with `wal_level = logical` and `pg_hint_plan`. — [instant server README](https://github.com/instantdb/instant/tree/main/server)
- **Vanilla API:** `@instantdb/core` offers `init({appId, schema})`, `db.subscribeQuery`, and `db.transact(db.tx.todos[id()].update(...))`. The docs example uses Vite. — [Instant docs: vanilla](https://www.instantdb.com/docs/start-vanilla)

#### RxDB
- **Storage:** storage is swappable through the RxStorage interface.
  - Free: Memory, LocalStorage, Dexie.
  - Premium (👑): IndexedDB, OPFS, SQLite and **Filesystem Node**.
  - Wrappers: sharding, memory-mapped, worker.
  - Source: [RxDB docs: RxStorage](https://github.com/pubkey/rxdb/blob/master/docs-src/docs/rx-storage.md)
- **Replication:**
  - Checkpoint-based pull and push. The server needs documents sortable by last write and soft deletes (`_deleted: true`).
  - "RxDB resolves all conflicts on the client"; the default handler keeps the master (server) state.
  - Plugins include HTTP, WebSocket, CouchDB, GraphQL, WebRTC, Firestore, Supabase, MongoDB, NATS and more.
  - Source: [RxDB: Replication](https://rxdb.info/replication.html)
- **Releases:** rxdb 17.6.0 (2026-10-05), Apache-2.0 core. — [npm rxdb](https://registry.npmjs.org/rxdb)

#### Convex
- **What it is:** "open-source reactive database" with server functions written in TypeScript.
  - Cloud has a free tier.
  - Self-hosting uses Docker or a binary with SQLite or Postgres backends.
  - The open-source repo omits Convex's internal test suites.
  - Source: [convex-backend README](https://github.com/get-convex/convex-backend)
- **Vanilla client:** `ConvexClient` works anywhere with WebSocket: `client.onUpdate(api.x, args, cb)` and `client.mutation(...)`. It uses generated `api`, or the untyped `anyApi`. The client docs don't cover offline or local-first. — [Convex docs: JavaScript client](https://docs.convex.dev/client/javascript)

#### PartyKit / Cloudflare Durable Objects
- **Acquisition:** Cloudflare acquired PartyKit on 5 Apr 2024, which is "built on Cloudflare's Durable Objects". — [Cloudflare blog](https://blog.cloudflare.com/cloudflare-acquires-partykit)
- **Successor packages:** the `cloudflare/partykit` repo now hosts PartyServer, which "enhances a standard Durable Object" with WebSockets, lifecycle hooks and broadcast. It also has PartySocket, y-partyserver, partysub, partysync ("experimental") and partywhen. — [cloudflare/partykit README](https://github.com/cloudflare/partykit)
- **Releases:** the legacy `partykit` CLI's last release was 0.0.115 (2025-05-21). `partyserver` is at 0.5.10 (2026-08-03) and `y-partyserver` at 2.2.0 (2026-04-24). — [npm partykit](https://registry.npmjs.org/partykit); [npm partyserver](https://registry.npmjs.org/partyserver)

#### Others found (2025–2026)
- **Evolu:** SQLite on each device with Kysely queries, "the last writer wins per column", and E2EE through MIT-licensed, self-hostable relays. Bindings cover React, Vue and Svelte. It "runs in production in Trezor Suite"; `@evolu/common` 8.24.1 was released 2026-10-29. — [evolu.dev](https://www.evolu.dev/); [npm @evolu/common](https://registry.npmjs.org/@evolu%2fcommon)
- **Liveblocks:**
  - Hosted LiveObject, LiveMap and LiveList, with deep subscriptions that report `"move"` updates on LiveList and `source.origin` of local or remote. — [Liveblocks client API](https://liveblocks.io/docs/api-reference/liveblocks-client)
  - The repo is Apache-2.0 with some AGPL components. A `@liveblocks/server` package ("Liveblocks backend server foundation", AGPL-3.0-or-later) first appeared 2026-02-10. — [Liveblocks README](https://github.com/liveblocks/liveblocks); [npm @liveblocks/server](https://registry.npmjs.org/@liveblocks%2fserver)
- **tldraw sync:**
  - It is server-authoritative: "TLSocketRoom stores the authoritative copy", with exactly one room per document globally.
  - On Durable Objects, room state persists to the DO's SQLite. `SQLiteSyncStorage` is recommended for production, and assets live in R2.
  - Source: [tldraw docs: sync](https://tldraw.dev/docs/sync)

### Inferences
- **How much the user would be fighting each tool behind his own Item/List classes:**
  - **Loro: least friction.** Each Item maps to a LoroMap, List to a LoroMovableList, and nested pages to a LoroTree or nested containers. Container-level `subscribe` gives typed diffs he can re-emit as Item change events.
  - **Yjs: moderate.** The mapping is the same but there is no move, so reorders need delete-and-reinsert or a fractional-index field. The tree needs a third-party pattern.
  - **Automerge: moderate to high.** The document is an immutable-style JSON object changed via `change(doc, d => …)`, with patches as the event source and no list move. Its strength is the automerge-repo storage and network plumbing.
  - **TinyBase: wrong shape.** Lists become rows with an order column, and LWW applies per cell.
  - **Zero, Electric, PowerSync, Instant, Convex and Jazz 2: impose a relational schema and a server database.** His Item tree would have to be flattened into tables.
- **Closest to the existing JSONL-over-socket design:**
  - Electric's Durable Streams is essentially that design standardised: a URL-addressed append-only log, NDJSON framing, offset-based resume.
  - LiveStore's eventlog is the closest application-level analogue, but it has no compaction yet and a heavy Effect/OpenTelemetry dependency stack.
- **Vanilla-JS, no-bundler fit, best to worst:**
  - **Pure ESM/JS:** TinyBase (zero deps) and Yjs (pure JS but depends on lib0, so it needs an import map or an ESM CDN).
  - **WASM with documented no-bundler paths:** Loro (wasm-bindgen web target) and Automerge (IIFE build or `/slim` plus `initializeWasm`). Both cost a multi-MB WASM download.
  - **Effectively bundler-assumed:** Jazz 2 (Vite in docs), LiveStore (`?worker` imports), Zero, PowerSync and Instant (Vite or Webpack demos).
  - This ranking is an inference; no CDN load test was possible here.
- **Lock-in:**
  - Lowest: the MIT CRDT libraries (Yjs, Automerge, Loro, TinyBase), since he can own server and storage.
  - Medium: Zero, PowerSync and Electric, which are open or source-available but tied to their own server components and Postgres.
  - Highest, or vendor-risk now realised: InstantDB (cloud sunset), Electric Cloud (winding down), Triplit (dormant) and Liveblocks (hosted-first).

### Gaps
- Could not run CDN (`esm.sh`/jsdelivr) import tests; these hosts were blocked from this environment.
- Did not verify Automerge's `automerge:` URL document-reference mechanism, or a cross-document reference pattern in Loro or Yjs, from primary docs this session.
- Convex backend licence (FSL vs Apache) was not verified; only the npm client licence (Apache-2.0) was seen.
- Liveblocks `@liveblocks/server`: purpose and whether it enables full self-hosting not confirmed.
- The Yjs v14 stable release date is unknown. A third-party mirror listing mentions "v14.0.0-rc.7", but npm shows only 14.0.0-16 as beta.

---

## Which ones are event-log/delta based like his JSONL approach, and how do they handle compaction/snapshots?

### Takeaway
Nearly every CRDT tool is internally a delta log with periodic snapshotting.
- **Most explicit:** automerge-repo, with incremental chunks compacted into head-keyed snapshots and safe under concurrency.
- **Most similar to a JSONL replay model:** y-leveldb (trim after 500 updates) and LiveStore (pure event-sourcing, but no compaction yet).
- **Server-side Yjs backends:** Hocuspocus, y-partyserver and Loro's SimpleServer simply overwrite a full-state snapshot.
- **Closest wire-level analogue to JSONL-over-socket:** Electric Durable Streams.

### Cited Findings
- **Automerge-repo:** every change is saved as an incremental chunk. The repo "occasionally" compacts all loaded changes into one snapshot chunk keyed by document heads, then deletes only the incremental chunks it had loaded. Two processes compacting concurrently produce harmless duplicate snapshots, and on load all chunks are merged order-independently. — [Automerge: Under the hood: Storage](https://automerge.org/docs/reference/under-the-hood/storage/)
- **Yjs:** updates are commutative and idempotent, and `Y.mergeUpdates` produces a smaller combined update. Garbage collection of deleted content requires loading into a Y.Doc. — [Yjs docs: Document Updates](https://docs.yjs.dev/api/document-updates)
- **y-leveldb:** stores each update separately. When a document's stored updates exceed `PREFERRED_TRIM_SIZE = 500`, it calls `flushDocument` with `Y.encodeStateAsUpdate(ydoc)`, replacing the update list with one merged state. This is effectively log compaction. — [y-leveldb source](https://github.com/yjs/y-leveldb/blob/master/src/y-leveldb.js)
- **Hocuspocus:** the Database extension stores the full `Y.encodeStateAsUpdate(document)` on each store, and the SQLite extension upserts one row per document. Persistence is snapshot-overwrite, not append-only. — [Database.ts](https://github.com/ueberdosis/hocuspocus/blob/main/packages/extension-database/src/Database.ts); [SQLite.ts](https://github.com/ueberdosis/hocuspocus/blob/main/packages/extension-sqlite/src/SQLite.ts)
- **YHub:** keeps recent updates in Redis streams and persists them to S3 or Postgres "in intervals" that you configure, via a background worker. — [YHub README](https://github.com/yjs/yhub)
- **y-partyserver:** `onSave` is debounced (2 s wait, 10 s max wait) and also runs when the room empties. — [y-partyserver README](https://github.com/cloudflare/partykit/tree/main/packages/y-partyserver)
- **Loro:** distinguishes `update` exports (deltas) from `snapshot` exports. Shallow snapshots trim history, and before trimming the start version "must be synchronized across all endpoints". `subscribeLocalUpdates` streams update bytes, and `exportJsonUpdates` gives a JSON op representation. — [Loro docs](https://loro.dev/docs); [Loro shallow snapshot](https://loro.dev/docs/advanced/shallow_snapshot); [loro-crdt typings](https://registry.npmjs.org/loro-crdt/-/loro-crdt-1.17.1.tgz)
- **Loro SimpleServer:** persists "snapshot bytes" through `onSaveDocument` on a `saveInterval` (example 60,000 ms). — [loro-dev/protocol README](https://github.com/loro-dev/protocol)
- **LiveStore:**
  - It is fully event-sourced: events go to an eventlog, which is materialized into SQLite. — [LiveStore README](https://github.com/livestorejs/livestore/tree/main/packages/@livestore/livestore)
  - Eventlog compaction is a "Long-term" roadmap item (issue #136). — [State of the project](https://docs.livestore.dev/evaluation/state-of-the-project/)
  - The docs warn you "need to be careful so eventlog doesn't grow too much". — [Event sourcing](https://docs.livestore.dev/evaluation/event-sourcing/)
- **Electric Durable Streams:** a per-URL append-only log with `POST` append and monotonic offsets. Clients resume from their saved offset and can use NDJSON framing. — [Announcing Durable Streams](https://electric.ax/blog/2025/12/09/announcing-durable-streams)
- **Linear (in-house):** transactions are executed on the server and broadcast as "delta packets". Every change increments a global `lastSyncId`, and clients detect gaps by comparing their `lastSyncId` to the server's. A "full bootstrap" (snapshot load) runs when the local database is missing or outdated. — [Reverse-engineering Linear's sync engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **Jazz v2:** moved away from replaying CRDT history ("required replaying a lot of history to compute current values") to "snapshot DAGs, similar to git". — [Jazz blog](https://jazz.tools/blog/what-we-learned-from-classic-jazz)
- **Tombstones (HN, Mar 2026):**
  - One commenter argues tombstones cannot be compacted meaningfully without consensus.
  - josephg (Diamond Types) counters that eg-walker lets clients load the current snapshot without history, and that lz4-compressed history can be smaller than the document.
  - rudi-c says Figma garbage-collects tombstones but offline clients make that risky.
  - Source: [HN: An Interactive Intro to CRDTs](https://alt-hn.vercel.app/item/47237460)

### Inferences
- **His JSONL design is the y-leveldb / automerge-repo pattern.** The proven compaction recipe is:
  1. Append deltas.
  2. Once the count or size crosses a threshold, write a snapshot whose name or key identifies the state it covers (automerge uses the heads hash; he could use the last sequence number).
  3. Delete only the deltas that snapshot covered.
  4. On load, read the newest snapshot plus any later deltas.
- **Server ordering simplifies compaction.** With a single sequence like Linear's `lastSyncId` or Durable Streams offsets, compaction is just "snapshot at offset N, drop lines ≤ N", with no consensus problem. The consensus issue only bites in multi-master or P2P CRDT setups.
- **Loro's JSON updates fit a JSONL log.** If he adopts Loro, `exportJsonUpdates` could be appended to JSONL to keep a human-readable log, with periodic `snapshot` or `shallow-snapshot` exports as checkpoints. The JSON format's size cost relative to binary was not measured.

### Gaps
- automerge-repo's exact compaction trigger (how often "occasionally" is) was not found.
- Hocuspocus's current default debounce timings were not verified for v4.
- LiveStore issue #136 content was not fetched.

---

## Which offer pluggable storage adapters, and specifically a filesystem adapter?

### Takeaway
- **Pluggable storage:** automerge-repo (tiny 5-method key/range interface, official NodeFS adapter), TinyBase (largest persister catalogue including a single-file FilePersister), RxDB (RxStorage, but its Node filesystem storage is paid), Hocuspocus (SQLite, S3 or custom database hooks), YHub (S3, Postgres or custom), y-sweet (directory or `s3://`), and Loro's SimpleServer (bring-your-own load and save hooks).
- **No human-readable per-item file layout:** none of them write one; filesystem adapters store binary chunks or one big JSON blob.

### Cited Findings
- **automerge-repo:**
  - The `StorageAdapter` interface is `load`, `save`, `remove`, `loadRange` and `removeRange`, and should be "straightforward to build on top of any key/value store which supports range queries". Official adapters are IndexedDB and NodeFS. — [Automerge docs: Storage](https://automerge.org/docs/reference/repositories/storage/); [Under the hood](https://automerge.org/docs/reference/under-the-hood/storage/)
  - NodeFS writes binary chunk files to `<base>/<2 chars>/<rest of docId>/<snapshot|incremental>/<id>`. — [NodeFS source](https://github.com/automerge/automerge-repo/blob/main/packages/automerge-repo-storage-nodefs/src/index.ts)
- **TinyBase:**
  - It has more than 25 persisters: file, OPFS, IndexedDB, local and session storage, SQLite variants, Postgres, PGlite, LibSQL, Durable Object KV and SQL, PowerSync, Yjs, Automerge, PartyKit, remote and custom. — [TinyBase persisters docs](https://github.com/tinyplex/tinybase/blob/main/src/@types/persisters/docs.js)
  - `createFilePersister(store, '/app/persisted.json')` rewrites the whole JSON file atomically (temp file plus rename) and watches it for external changes. — [persister-file source](https://github.com/tinyplex/tinybase/blob/main/src/persisters/persister-file/index.ts)
- **Yjs ecosystem:**
  - y-leveldb is a LevelDB directory and accepts "any levelup-compatible adapter". — [y-leveldb](https://github.com/yjs/y-leveldb)
  - The Yjs README lists other persistence providers: y-indexeddb, y-mongodb-provider, Firestore, op-sqlite and a Go/Postgres+Redis server. — [Yjs README](https://github.com/yjs/yjs)
  - Hocuspocus has SQLite (`db.sqlite`), S3-compatible (`.bin` per document, including R2) and a generic Database extension with `fetch`/`store` hooks. — [Hocuspocus README](https://github.com/ueberdosis/hocuspocus); [extension-s3](https://github.com/ueberdosis/hocuspocus/tree/main/packages/extension-s3)
  - y-sweet persists to a local directory or an `s3://` bucket. — [y-sweet running.md](https://github.com/jamsocket/y-sweet/blob/main/docs/running.md)
  - YHub persists to S3 or Postgres, "or implement your own storage provider". — [YHub](https://github.com/yjs/yhub)
- **Loro:** SimpleServer hooks are `onLoadDocument` and `onSaveDocument` ("persist snapshot bytes somewhere (e.g., filesystem/db)"). The Rust server has optional SQLite. — [loro-dev/protocol](https://github.com/loro-dev/protocol)
- **RxDB:** the "👑 Filesystem Node" storage is premium, as are IndexedDB, OPFS and SQLite. Free options are memory, localStorage and Dexie. — [RxDB RxStorage docs](https://github.com/pubkey/rxdb/blob/master/docs-src/docs/rx-storage.md)
- **Triplit:** advertises "Pluggable storage providers like SQLite, IndexedDB, LevelDB, Memory". — [Triplit README](https://github.com/aspen-cloud/triplit)
- **Subduction:** includes a `sedimentree_fs_storage` crate. — [Subduction README](https://github.com/inkandswitch/subduction)
- **Synclets:** has a "Files (file system)" data connector, pre-alpha. — [synclets.org](https://synclets.org/)
- **Database-backed engines:**
  - Zero needs Postgres, with a SQLite replica in zero-cache and IndexedDB on the client. — [Zero llms.txt](https://zero.rocicorp.dev/llms.txt)
  - PowerSync uses SQLite on the client and Postgres, MongoDB, MySQL or SQL Server as the source. — [powersync-service](https://github.com/powersync-ja/powersync-service)
  - Electric needs Postgres. — [Electric README](https://github.com/electric-sql/electric)
  - LiveStore uses SQLite (OPFS on the web, Durable Object on Cloudflare). — [LiveStore docs](https://docs.livestore.dev/)

### Inferences
- **automerge-repo's interface is the best template for his own adapters.** It is small, keys are array-paths, and range loading plus concurrency-safe compaction are designed in. The same 5 methods map cleanly onto files, SQLite, Postgres or S3/R2, where S3 supports prefix listing.
- **No off-the-shelf filesystem adapter gives a git-diffable, per-Item JSON tree.** If that matters, he will still write that layer himself, even on top of Loro or Yjs, for example by mirroring `toJSON()` per Page alongside a binary or JSONL op log.

### Gaps
- No S3/R2 adapter for automerge-repo was verified this session; only IndexedDB and NodeFS are official per the docs fetched.
- Not checked whether TinyBase can persist incrementally to a file (the source shows a whole-file rewrite).

---

## Which handle ordered list moves/reorders and nested trees well?

### Takeaway
- **Loro** is the only general-purpose library here with first-class concurrent-safe list moves (MovableList, Kleppmann algorithm) and a movable tree with cycle handling and fractional-index sibling order.
- **Yjs and Automerge** lack a list move in their shipped JS APIs.
- **Liveblocks** LiveList reports move updates.
- **Figma's in-house approach** (parent pointer plus fractional index stored as one property, server rejects cycles) is the standard simplified alternative.

### Cited Findings
- **Loro MovableList:** supports `set` and `move` with correct concurrent semantics. Emulating move as delete+insert yields duplicates under concurrency. MovableList costs about 80% slower encode/decode and about 50% more memory than List. — [Loro docs: List](https://loro.dev/docs/tutorial/list)
- **Loro Tree:**
  - Kleppmann's replicated-tree move; cycle-creating moves are "unsafe operations" that are recorded but skipped.
  - Fractional index ordering with PeerID tie-break.
  - 10,000 random moves on 1,000 nodes took 28 ms; in a depth-300 tree, 1,000 version switches took 701 ms.
  - Tree events report create, move and delete diffs.
  - Sources: [Loro blog: movable tree](https://www.loro.dev/blog/movable-tree); [loro-crdt typings](https://registry.npmjs.org/loro-crdt/-/loro-crdt-1.17.1.tgz)
- **Yjs:** Y.Array has no move method. — [Yjs docs: Y.Array](https://docs.yjs.dev/api/shared-types/y.array). Ordered trees with move are left to the third-party `yjs-orderedtree`. — [Yjs README](https://github.com/yjs/yjs)
- **Automerge:** the 3.5.0 public API offers `insertAt`, `deleteAt` and `splice` for lists, with no move. — [@automerge/automerge typings](https://registry.npmjs.org/@automerge/automerge/-/automerge-3.5.0.tgz). Move was researched in "Extending Automerge: Undo, Redo, and Move" (2023). — [SPLASH 2023](https://2023.splashcon.org/details/plf-2023-papers/2/Extending-Automerge-Undo-Redo-and-Move)
- **Liveblocks:** deep subscription updates on LiveList include type `"move"`. — [Liveblocks client API](https://liveblocks.io/docs/api-reference/liveblocks-client)
- **Figma:**
  - "Each child stores a link to its parent as one of its properties".
  - Order is a fractional position between 0 and 1, and "the parent link and position are stored as one property so they update together".
  - "Figma's multiplayer servers reject parent property updates that would cause a cycle". Clients temporarily hide objects in an unacknowledged cycle.
  - Source: [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Fractional indexing trade-off:** Loro says it is simpler than a movable-list CRDT for tree children, and its interleaving is acceptable for uses like layer lists. — [Loro blog: movable tree](https://www.loro.dev/blog/movable-tree)
- **TinyBase and Evolu:** their LWW-per-cell or per-column models have no list type at all. — [TinyBase MergeableStore](https://tinybase.org/guides/synchronization/using-a-mergeablestore/); [evolu.dev](https://www.evolu.dev/)

### Inferences
- **Two ways to model recursive Pages and reorderable Lists:**
  - (a) Loro: LoroTree for the page hierarchy, LoroMovableList for ordered Item collections, and LoroMap per Item.
  - (b) The Figma recipe on any store, including his own JSONL: every Item has `parentId` plus a fractional `order` key written atomically, and the server validates against cycles.
  - Option (b) works with Yjs, TinyBase, SQL rows or plain JSONL, and makes a move a single property write. That is far simpler than a list CRDT when a server orders all writes.
- **References between items** are naturally ID-valued properties (Linear stores `assigneeId` and derives `assignee`), so no tool needs special support. — [Reverse-engineering Linear](https://github.com/wzhudev/reverse-linear-sync-engine)

### Gaps
- No independent benchmark compares Loro MovableList against Yjs delete+reinsert at realistic sizes.
- Not verified whether Automerge has a move op in Rust or an unreleased branch.

---

## Which are easiest to drive from plain JS classes with events (no framework bindings required)?

### Takeaway
Easiest, in order:
1. **TinyBase:** zero dependencies, granular listeners, framework bindings optional.
2. **Yjs:** pure JS, `observe`/`observeDeep` with deltas and transaction origins.
3. **Loro:** per-container `subscribe` with typed diffs and a `by: local|import|checkout` tag, but it is WASM.
4. **Automerge:** patch callbacks; WASM loading is the main friction.

Engines such as Zero (`materialize` plus listeners), Instant (`subscribeQuery`), Convex (`onUpdate`), LiveStore (`store.subscribe`) and Jazz (`db.subscribe`) are usable without React. They deliver query results rather than object-level change events, and assume a bundler and their own server.

### Cited Findings
- **TinyBase:** "lets you listen to changes made to any part of your data". Bindings to React, Solid and Svelte are optional. It has no dependencies. — [TinyBase readme](https://github.com/tinyplex/tinybase)
- **Yjs:** `observe` returns Y.ArrayEvent deltas, and `observeDeep` covers nested types. Multiple changes in one `transact` are combined into a single delta. — [Yjs docs: Y.Array](https://docs.yjs.dev/api/shared-types/y.array). Transaction origins can be used to avoid echoing updates. — [Yjs docs: Document Updates](https://docs.yjs.dev/api/document-updates)
- **Loro:** `subscribe(listener)` exists on LoroDoc and on each container. `LoroEventBatch.by` is "local" | "import" | "checkout", and diffs are typed per container. `commit({origin, message})` tags local changes. — [loro-crdt typings](https://registry.npmjs.org/loro-crdt/-/loro-crdt-1.17.1.tgz)
- **Automerge:** Node needs no setup. Browsers without a bundler use `/slim` plus `initializeWasm` or `initializeBase64Wasm`. — [Automerge init docs](https://automerge.org/docs/library_initialization/). An IIFE build that sets `window.Automerge` ships in the package. — [automerge 3.5.0 tarball](https://registry.npmjs.org/@automerge/automerge/-/automerge-3.5.0.tgz)
- **Liveblocks:** `room.subscribe(node, cb, {isDeep:true})` with `source.origin` local or remote. — [Liveblocks client API](https://liveblocks.io/docs/api-reference/liveblocks-client)
- **Zero:** `zero.materialize(query)` returns a TypedView. — [@rocicorp/zero typings](https://registry.npmjs.org/@rocicorp/zero/-/zero-1.11.3.tgz)
- **Instant:** `db.subscribeQuery({todos:{}}, cb)`. — [Instant vanilla docs](https://www.instantdb.com/docs/start-vanilla)
- **Convex:** `client.onUpdate(...)`. — [Convex JS client](https://docs.convex.dev/client/javascript)
- **LiveStore:** `store.subscribe(query$, cb)` inside a custom element. — [LiveStore custom elements](https://docs.livestore.dev/framework-integrations/custom-elements/)
- **Jazz:** v2 uses `db.subscribe(app.todos, …)`. — [Jazz install](https://jazz.tools/docs/install/client). Classic Jazz has a plain-DOM example via `jazz-tools/browser`. — [Classic Jazz docs](https://classic.jazz.tools/docs)
- **Linear's in-house model** is the shape the user already has. It uses a local object graph backed by MobX and persisted to IndexedDB. Property setters call `propertyChanged`, which builds an `UpdateTransaction`. — [Reverse-engineering Linear](https://github.com/wzhudev/reverse-linear-sync-engine); [HN thread](https://hn.jakechampion.name/item/44123131)

### Inferences
- **The cleanest wrapping pattern** for Yjs or Loro is for each Item instance to hold a reference to its CRDT container:
  - `set()` writes into the container inside a transaction or commit tagged with an origin.
  - The container's `subscribe`/`observe` callback, filtered to remote or import origins, fires the Item's existing change events.
- **The friction points:**
  - Keeping a one-to-one identity map between Item instances and containers when remote ops create or move nodes.
  - Handling container re-creation after checkout or time travel (Loro `by: "checkout"`).
- **Query-oriented engines:** with Zero, Instant, Convex or Jazz he would diff query results back into Item instances himself. That is a much heavier impedance mismatch.

### Gaps
- No hands-on test of loading Yjs (lib0 dependency) or Loro WASM from a CDN with import maps in a no-bundler page.

---

## What is new in 2025–2026, and what is abandoned or at risk?

### Takeaway
- **Consolidation and acquisition:** Triplit went to Supabase (Oct 2025), Electric went to Databricks with Electric Cloud winding down (Aug 2026), and InstantDB's team went to OpenAI with its cloud sunsetting Aug 2027. Replicache is in maintenance mode, superseded by Zero 1.0.
- **Major rewrites:** Jazz 2.0 is a new relational API, Yjs 14 is a long-running beta, and LiveStore 0.5 moved to Effect 4.
- **New primitives:** Electric Durable Streams, Ink & Switch Subduction and Keyhive, Hocuspocus 4 multi-runtime support, YHub, and Synclets.

### Cited Findings
- **Abandoned or at risk:**
  - Triplit joined Supabase, 8 Oct 2025; its last npm release was 2025-07-31. — [Supabase blog](https://supabase.com/blog/triplit-joins-supabase); [npm](https://registry.npmjs.org/@triplit%2fclient)
  - Electric Cloud "is winding down" (11 Aug 2026); the open-source projects stay open. — [Electric](https://electric.ax/blog/2026/08/11/electric-joining-databricks.md)
  - InstantDB cloud runs until 31 Aug 2027 after the team joined OpenAI (22 Aug 2026). — [RuntimeWire](https://runtimewire.com/article/instant-team-joins-openai-cloud-shutdown); [Instant docs](https://www.instantdb.com/docs/self-hosting)
  - Replicache is in "maintenance mode". — [replicache.dev](https://replicache.dev/)
  - The legacy `partykit` CLI's last release was May 2025; the work continues as `partyserver`. — [npm partykit](https://registry.npmjs.org/partykit); [cloudflare/partykit](https://github.com/cloudflare/partykit)
  - `@vlcn.io/crsqlite-wasm` (cr-sqlite) has had no release since 0.16.0 (2023-12-16). — [npm @vlcn.io/crsqlite-wasm](https://registry.npmjs.org/@vlcn.io%2fcrsqlite-wasm)
  - `y-indexeddb`'s last release was 9.0.12 (2023-11-02). — [npm y-indexeddb](https://registry.npmjs.org/y-indexeddb)
- **Stable or new:**
  - Zero 1.0 (2026). — [InfoQ](https://infoq.com/news/2026/06/zero-version-1)
  - Hocuspocus 4 (8 May 2026). — [Tiptap](https://tiptap.dev/blog/release-notes/hocuspocus-4-stable-release)
  - Automerge 3.0 (Jul 2025) and 3.5 authorship (Sep 2026). — [Automerge 3](https://automerge.org/blog/automerge-3/); [Sept '26](https://automerge.org/blog/2026-september/)
  - Jazz 2.0 alpha (from Feb 2026). — [Jazz README](https://github.com/garden-co/jazz)
  - Durable Streams (Dec 2025; hosted Jan 2026). — [Electric](https://electric.ax/blog/2025/12/09/announcing-durable-streams)
  - Subduction preview. — [Subduction](https://github.com/inkandswitch/subduction)
  - Keyhive ARK guide (Aug 2026). — [Aug '26](https://automerge.org/blog/2026-august/)
  - YHub beta. — [YHub](https://github.com/yjs/yhub)
  - Synclets pre-alpha. — [synclets.org](https://synclets.org/)
  - TinyBase v7 through v10 within about 10 months. — [npm tinybase](https://registry.npmjs.org/tinybase)
  - Evolu in production in Trezor Suite. — [evolu.dev](https://www.evolu.dev/)
- **Outdated pages to be aware of:**
  - livestore.dev's homepage still shows "v0.4", but npm has 0.5.0 (2026-10-15). — [livestore.dev](https://livestore.dev/); [npm](https://registry.npmjs.org/@livestore%2flivestore)
  - triplit.dev shows a "© 2024" footer. — [triplit.dev](https://www.triplit.dev/)
  - The Cloudflare PartyKit post (2024) predates PartyServer. — [Cloudflare blog](https://blog.cloudflare.com/cloudflare-acquires-partykit)

### Inferences
- **Hosted sync startups have been fragile.** Three hosted sync/BaaS products (Triplit, Electric Cloud, Instant Cloud) shut or wound down in roughly 12 months. This supports keeping data and server under his own control: CRDT library plus own server and own storage.
- **The healthiest permissively licensed, self-hostable options** right now are Yjs plus Hocuspocus, Loro, Automerge (Ink & Switch-funded, with GoodNotes and Bowtie support contracts) and Zero (Rocicorp, with paying cloud customers). YHub is AGPL.

### Gaps
- Jamsocket/y-sweet business status after the last release (Sep 2025) was not verified.
- Liveblocks open-sourcing status not verified.

---

## Simplifying concessions: common simple setups, what each gives up, and when you don't need it

### Takeaway
Most production collaborative apps do **not** run fully decentralised CRDTs.
- **Figma** uses a central server with per-property last-writer-wins.
- **Linear** uses server-ordered transactions with a global sequence number and LWW.
- **tldraw** uses one authoritative room per document.

Each concession removes a whole class of hard problems: tombstone GC, consensus for compaction, move/cycle CRDTs, cryptographic permissions. The cost is a feature (offline merge, P2P, text-level merging, history) that many object-editing apps don't need. The user's current design (server-ordered JSONL deltas over his own socket) already sits in this "simplified" family.

### Cited Findings
- **Server-authoritative, per-property LWW (Figma):**
  - The server "is the ultimate authority". It tracks the latest value per property per object; edits to different properties don't conflict; the server orders events, so "no timestamps are needed".
  - **Gives up:** merging concurrent edits within one value ("Simultaneous edits to the same text can't merge"). Figma rejected OT as overkill and full CRDTs because those target decentralised systems.
  - Source: [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Cheap offline (Figma):** "the client downloads a fresh copy of the document, reapplies its offline edits on top, and opens a new WebSocket sync". **Gives up:** nothing major for property-level edits, because there is no long-lived divergent history to merge. — [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Server-ordered total log with a global sequence ID (Linear):**
  - All client transactions are totally ordered by an incrementing `sync id`. Clients use `lastSyncId` to detect missed packets. Offline transactions are cached in IndexedDB and resent.
  - Permission partitioning uses "sync groups".
  - The author describes the model as closer to OT than CRDT. A commenter summarises it as "naive last-write-wins… no conflict detection, no OT, no CRDT".
  - **Gives up:** P2P sync and multi-master writes, and needs the server online to commit.
  - Sources: [Reverse-engineering Linear's sync engine](https://github.com/wzhudev/reverse-linear-sync-engine); [HN thread](https://hn.jakechampion.name/item/44123131)
- **One process or room per document:**
  - Figma: "Servers run a separate process for each document". — [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
  - tldraw: exactly one `TLSocketRoom` per document globally, "Otherwise, users won't see each other and will overwrite others' changes"; Durable Objects give this per-room singleton with SQLite storage. — [tldraw sync docs](https://tldraw.dev/docs/sync)
  - **Gives up:** multi-region active-active writes to one document and cross-document transactions.
- **Snapshot-overwrite persistence instead of an append log:** Hocuspocus stores full state; y-partyserver `onSave` is debounced 2 s / 10 s max; Loro SimpleServer has `saveInterval`. **Gives up:** history and audit, plus durability for edits inside the debounce window if the process dies. — [Hocuspocus Database.ts](https://github.com/ueberdosis/hocuspocus/blob/main/packages/extension-database/src/Database.ts); [y-partyserver](https://github.com/cloudflare/partykit/tree/main/packages/y-partyserver); [loro-protocol](https://github.com/loro-dev/protocol)
- **LWW per cell or column:**
  - TinyBase MergeableStore uses HLC timestamps with "last write wins". — [TinyBase](https://tinybase.org/guides/synchronization/using-a-mergeablestore/)
  - Evolu uses "the last writer wins per column". — [evolu.dev](https://www.evolu.dev/)
  - **Gives up:** ordered-list merges and text merges; lists become rows with an order key.
- **Fractional indexing instead of a list CRDT:** Figma and Loro's tree both use it. **Gives up:** guaranteed non-interleaving of concurrently inserted runs, which is acceptable "for uses like layer lists". — [Loro movable tree](https://www.loro.dev/blog/movable-tree); [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Read-path-only sync with your own write API (Electric):** writes go through your normal backend endpoints. **Gives up:** built-in optimistic writes and rollback. — [Electric README](https://github.com/electric-sql/electric); [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- **Server-enforced permissions instead of cryptographic ones (Jazz v2):** Jazz abandoned crypto-first permissions for "the Jazz server as a trusted authority responsible for enforcing usefully complex permission policies". **Gives up:** zero-trust servers, partly kept via encrypted columns. — [Jazz blog](https://jazz.tools/blog/what-we-learned-from-classic-jazz)
- **Ephemeral state for high-frequency gestures:**
  - Livelymerge (Automerge) found dragging wrote about 120 ops per second. Their notes recommend "keeping rapidly changing state in an ephemeral object during a gesture and committing to the document once at the end". — [This Month in Automerge: Sept '26](https://automerge.org/blog/2026-september/)
  - Loro ships `EphemeralStore` and `Awareness` for this. — [loro-crdt typings](https://registry.npmjs.org/loro-crdt/-/loro-crdt-1.17.1.tgz)
- **History trimming:** Loro shallow snapshots shrink documents (5421 to 869 bytes in the example). **Gives up:** the ability to merge ops based on trimmed history, so trim only after all endpoints have synced. — [Loro shallow snapshot](https://loro.dev/docs/advanced/shallow_snapshot)
- **Online-only, server-reactive DB (Convex):** the client subscribes over WebSocket, and the client docs don't cover offline or local-first. **Gives up:** offline editing. — [Convex JS client](https://docs.convex.dev/client/javascript)
- **Practitioner opinions (HN, Mar 2026):**
  - "a central server is the right tool for the job in most cases", and permissions and locks are hard with CRDTs.
  - Figma "isn't using true CRDTs".
  - DocNode's design premise is that a server orders edits so no tombstones are created.
  - Source: [HN: An Interactive Intro to CRDTs](https://alt-hn.vercel.app/item/47237460)

### Inferences
- **When each concession is safe:**
  - **Server-ordered LWW per property** (his JSONL design, Figma, Linear) is enough when Items are mostly structured properties (titles, flags, positions, references) and long-form text fields are either edited by one person at a time or acceptable to LWW. He needs a real text CRDT (Yjs, Loro or Automerge Text) only for Google-Docs-style simultaneous typing in the same paragraph. That can be confined to specific text fields while everything else stays LWW.
  - **No true offline merge:** if offline means "a flaky connection for minutes", Figma's re-download-and-replay approach is enough. Full CRDT merge only matters for long offline divergence (days, field work) or P2P without a server.
  - **One room or process per Page (or per top-level workspace)** is fine until a single document needs multi-region write latency. Durable Objects or a single Node process per room covers most apps.
  - **Fractional index plus `parentId` with server-side cycle rejection** is enough for reorderable Lists and nested Pages when a server orders writes. A movable-list or tree CRDT (Loro) is only needed if there is no authoritative server.
  - **Snapshot plus truncated log** (compaction at a known sequence number) is safe with a single server sequence. The tombstone/consensus problem in the HN thread only applies to multi-master or P2P setups.

### Gaps
- No primary source quantifying how often LWW loses user-visible edits in practice.
- Did not find documentation on how Google Docs or Notion currently wire their sync. Not covered here (search budget exhausted).

---

## Who uses each tool, and how they wire it

### Takeaway
- **Yjs** has by far the longest list of named adopters, mostly for rich-text and editor collaboration behind Hocuspocus or a custom server.
- **Zero** has a growing list of named SaaS customers (tldraw, Tines, Shortcut, Productlane).
- **PowerSync** shows enterprise and mobile logos.
- **Automerge's** named users are fewer: GoodNotes, Bowtie, research and Ink & Switch projects.
- **Loro** has no publicly named adopters.

The best-documented "how they wired it" examples are in-house engines: Figma, Linear and tldraw.

### Cited Findings
- **Yjs (from its README "who is using Yjs" list):**
  - Linear, AWS SageMaker, Proton Docs ("E2E encrypted collaborative documents in Proton Drive"), NextCloud, Typst, Eclipse Theia, AppFlowy ("They use Yrs") and Multi.app (Yrs).
  - Synthesia (collaborative video editor), ToolJet, keystatic (git-based CMS) and Obsidian Collab (P2P E2EE).
  - Onplana ("Wiki pages are co-edited in real time with BlockNote over Yjs, synced through Hocuspocus") and Doory ("synced by a pycrdt server").
  - Editor bindings cover ProseMirror, Tiptap, BlockNote, Lexical, Quill, CodeMirror, Monaco and Slate.
  - Source: [Yjs README](https://github.com/yjs/yjs)
- **Hosted Yjs backends:** Tiptap's commercial "Tiptap Collab" is the hosted Hocuspocus. — [Hocuspocus README](https://github.com/ueberdosis/hocuspocus). y-sweet is offered hosted on Jamsocket. — [y-sweet](https://github.com/jamsocket/y-sweet)
- **PowerSync + Yjs wiring:** PowerSync's demo uses PowerSync "as both the persistence and connection provider", so Yjs CRDT data is stored in Postgres (Supabase). — [PowerSync Yjs demo](https://github.com/powersync-ja/powersync-js/tree/main/demos/yjs-react-supabase-text-collab)
- **Automerge:**
  - "users like GoodNotes and Bowtie" provide "support contracts and feature development funding". — [automerge.org](https://automerge.org/)
  - linXiv (desktop research app) uses Automerge via autosurgeon (Rust).
  - Livelymerge (Ink & Switch) uses an Automerge document as a live-programming heap. They had to move gesture state to ephemeral objects because dragging produced about 120 ops per second.
  - Source: [This Month in Automerge: Sept '26](https://automerge.org/blog/2026-september/)
- **Zero:**
  - Named testimonials: tldraw ("We switched to Zero itself"), Tines, Syntax.fm, OpenCode, Productlane ("rebuilt… from the ground up"), Shortcut, Ranger Budget and Base UI. — [zero.rocicorp.dev](https://zero.rocicorp.dev/)
  - Wiring: Postgres is the source of truth, zero-cache holds a SQLite replica, the client uses IndexedDB, and mutators run on the client and again server-side via `ZERO_MUTATE_URL`. — [Zero llms.txt](https://zero.rocicorp.dev/llms.txt)
  - One practitioner reported Zero has "no built-in real-time presence, so the author added separate infrastructure for cursors and chat". — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- **PowerSync:** customer logos include Christian Louboutin, Stanley Black & Decker, Allianz PNB Life, Snackpass and Configura. Testimonials name ZenHub, HabitKit, PrayerMate and Titan Gym. The logos come without case studies; wiring is client SQLite with writes "queued for upload to your backend API". — [powersync.com](https://www.powersync.com/)
- **LiveStore:** originally built inside Overtone (music app), with Linearlite demos and Outlyne listed. — [livestore.dev](https://livestore.dev/). One practitioner ran LiveStore mostly on Cloudflare with D1, then migrated to Zero. — [johnny.sh](https://johnny-sh.pages.dev/blog/choosing-a-sync-engine-in-2026)
- **Evolu:** Trezor Suite (SatoshiLabs) in production with local authentication backed by Trezor; also Linky (wallet and messaging). — [evolu.dev](https://www.evolu.dev/)
- **Figma (in-house):**
  - Clients connect to one process per document over WebSockets.
  - The server keeps the latest value per property per object.
  - Clients discard incoming server changes that conflict with their unacknowledged edits, to avoid flicker.
  - Deleted objects' data lives only in the deleting client's undo buffer.
  - Client-generated IDs embed a per-client ID.
  - Source: [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Linear (in-house):**
  - Models are defined with decorators. Property setters call `propertyChanged`, which builds an `UpdateTransaction`.
  - Transactions are sent to the server, executed, and broadcast as delta packets that may include server side effects.
  - Load strategies are per model: `instant`, `lazy`, `partial`, `explicitlyRequested` and `local`.
  - References are stored as IDs (`assigneeId`) with lazy reference collections.
  - Permissions are enforced via `subscribedSyncGroups`.
  - Source: [Reverse-engineering Linear's sync engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **tldraw sync (in-house, also sold as an SDK):** an authoritative `TLSocketRoom` per document on a Durable Object with SQLite storage, assets in R2 via a `TLAssetStore` you implement, and client and server versions that must match. — [tldraw sync docs](https://tldraw.dev/docs/sync)

### Inferences
- **Linear's engine is structurally almost identical to his framework.** Item get/set fires events, setters produce transactions, the server orders them into a log, and clients replay deltas. The features Linear added on top are the ones to plan for: per-model load strategies (lazy and partial), a global sequence ID for gap detection, offline transaction caching with resend, reversible client transactions for rejected writes, and sync-group permissioning.
- **Yjs's adopter list is dominated by rich-text editors.** That points to its strongest use case: embed a Yjs doc only for rich-text fields inside an otherwise LWW object model. Several apps on that list (Linear, AppFlowy) also have structured data that is not obviously Yjs, which suggests a hybrid design (inference; the README doesn't detail scope).

### Gaps
- No named adopters found for Loro, TinyBase, RxDB, Electric or Convex in sources fetched this session; the web-search budget ran out before these could be searched.
- No public write-ups found on how GoodNotes or Bowtie wire Automerge.
- Scope of tldraw's Zero use (app data vs canvas) is unclear from the testimonial.
