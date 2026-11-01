# Node.js persistence tooling for a swappable `Item.store` (ORMs, KV abstractions, embedded DBs, append-only logs, serialization) — as of late Oct 2026

Scope note: version/date facts were pulled directly from the npm registry (registry.npmjs.org) on 2026-10-29. Per coordinator instruction, GitHub stars and npm download counts are omitted (another researcher covers them). "Who uses it" evidence is mostly from npm dependency manifests of the adopting product (primary, verifiable) plus the adopters' own docs/blogs. The web-search budget ran out partway through, so a few adopter stories could not be researched (see Gaps).

## 1. What category are Drizzle and Prisma, and do they fit an object/document model with nested items, lists and references?

### Takeaway
Drizzle and Prisma are both **schema-first SQL ORMs**. You declare tables and columns up front: Drizzle in TS/JS code, Prisma in its own `.prisma` schema/contract language with a codegen step. Relations become foreign keys and join tables. They do support JSON/JSONB columns, but they are built around relational tables, not around "an object graph of Items with change events". In 2026 Prisma moved even further toward TypeScript-only codegen, and Drizzle 1.0 is still in RC. For a plain-JS, document-ish, delta-log design, both are a poor fit as the primary abstraction. At most they could be the SQL backend *inside* one `store` implementation.

### Cited Findings
**Drizzle**
- Drizzle describes itself as a "Headless ORM for NodeJS, TypeScript and JavaScript" and "a thin typed layer on top of SQL", with "exactly 0 dependencies" (~7.4 kB). It can be used "as a JavaScript library" but "shines with TypeScript." — [Drizzle README](https://cdn.jsdelivr.net/npm/drizzle-orm@0.45.4/README.md)
- Version status: npm `latest` is still **0.45.4** (published 2026-10-08). 1.0 has been in pre-release a long time: `1.0.0-beta.1` 2025-11-03, `1.0.0-rc.1` 2026-04-30, `1.0.0-rc.5` 2026-10-21. — [npm registry: drizzle-orm](https://registry.npmjs.org/drizzle-orm)
- 1.0 beta changes: Relational Query Builder v2, `defineRelations`, a new migrations folder layout, new MSSQL/CockroachDB dialects. The maintainers warned "something will definitely break." — [newreleases: drizzle v1.0.0-beta.2](https://newreleases.io/project/github/drizzle-team/drizzle-orm/release/v1.0.0-beta.2)
- Drizzle schemas are defined in TS with no generation step. `relations()` is metadata only, so foreign keys still need `.references()` on columns. — [Makerkit, Drizzle vs Prisma 2026 (updated Sept 2026)](https://makerkit.dev/blog/md/tutorials/drizzle-vs-prisma)
- JSON support: Postgres `json` and `jsonb` columns with defaults. `.$type<T>()` gives compile-time typing only and "does not check runtime values." — [Drizzle PG column types](https://orm.drizzle.team/docs/column-types/pg)
- SQLite drivers: libsql, `node:sqlite`, better-sqlite3, Bun SQLite, Cloudflare D1, Cloudflare Durable Objects, Expo SQLite, OP SQLite. — [Drizzle SQLite getting started](https://orm.drizzle.team/docs/get-started-sqlite)
- No change-stream or change-event feature appeared in any Drizzle doc fetched. — (absence noted from the pages above)

**Prisma**
- Prisma 7.0.0 shipped 2025-11-19 and 7.10.1 on 2026-10-15. npm `latest` for `prisma` is now **8.0.0-rc.28** (2026-10-27), while `@prisma/client` stays at 7.10.1. — [npm registry: prisma](https://registry.npmjs.org/prisma); [npm registry: @prisma/client](https://registry.npmjs.org/@prisma/client)
- Prisma 7 moved query execution from the Rust engine into JS ("Rust-free"). The new `prisma-client` generator is "TypeScript-only, by design." — [Prisma 7 AMA blog (2026-02-13)](https://www.prisma.io/blog/prisma-7-ama-clearing-up-the-why-behind-the-changes)
- The old `prisma-client-js` generator is "in maintenance mode." Since v7, `prisma-client` is the default and writes generated code into your project source with a required `output` path. — [Prisma blog: why Prisma generates into node_modules (updated 2026-07-06)](https://www.prisma.io/blog/why-prisma-orm-generates-code-into-node-modules-and-why-it-ll-change)
- Prisma ORM 8 ("Prisma Next"): a `contract.prisma` replaces `schema.prisma`, `prisma contract emit` replaces `prisma generate`, and queries look like `db.orm.public.User.include("posts").all()`. It is described as "a typed data layer for TypeScript". PostgreSQL is RC, MongoDB early access, SQLite experimental (`@prisma/orm-sqlite`), and MySQL/SQL Server/CockroachDB "not yet". — [Prisma docs: ORM 8](https://prisma.io/docs/orm/next)
- Prisma 8 GA is "expected in October 2026" and requires Node 22.18+/24.11+/26+ **and TypeScript 5.9+**. Prisma 7 gets fixes for 18 months after 8 reaches GA. Prisma 6 gets security patches only, through 19 Nov 2026. — [Prisma release status](https://www.prisma.io/docs/orm/release-status)
- Prisma 8 RC breaking change: `count()` now returns a `bigint`, so code that calls `JSON.stringify` on aggregates breaks. — [newreleases: Prisma 8.0.0-rc.1](https://newreleases.io/project/github/prisma/orm/release/v8.0.0-rc.1)
- Makerkit (Sept 2026) recommends pinning an explicit 7.x because `latest` resolves to an 8.0 RC. — [Makerkit](https://makerkit.dev/blog/md/tutorials/drizzle-vs-prisma)

**Other ORMs and query builders (for the comparison table)**
- **Kysely**: "Kysely IS NOT an ORM". It is a query builder that emits exactly the SQL you write. Nested relations use SQL JSON functions through the `jsonArrayFrom` / `jsonObjectFrom` helpers. SQLite needs `ParseJSONResultsPlugin` to parse JSON results. Latest 0.29.7 (2026-10-17), next 0.30.0-beta.2. — [Kysely relations recipe](https://kysely.dev/docs/recipes/relations); [npm registry: kysely](https://registry.npmjs.org/kysely)
- **MikroORM 7** went stable on 2026-03-11. It replaced Knex with Kysely internally, added `defineEntity`, querying of JSON array elements via `$elemMatch`, and maps arrays inside embeddables to JSON by default. Latest 7.2.5 (2026-10-09). — [MikroORM 7 released](https://mikro-orm.io/blog/mikro-orm-7-released); [npm registry](https://registry.npmjs.org/@mikro-orm/core)
- MikroORM supports vanilla JS through `defineEntity` (optionally with `class: Author`, so you keep your own class and methods) or through `EntitySchema`. Persistence uses Unit-of-Work style `em.create()` + `em.flush()`. — [MikroORM usage with JS](https://mikro-orm.io/docs/usage-with-js)
- **TypeORM 1.0** released 2026-05-19 under a new steering committee and maintainer team. It requires Node 20+ and added a SQLite `jsonb` column type. Latest 1.1.2 (2026-10-08). This contradicts PkgPulse's March 2026 characterization of TypeORM as "in maintenance mode." — [TypeORM 1.0 blog](https://typeorm.io/blog/typeorm-1-0); [PkgPulse State of Node ORMs 2026](https://www.pkgpulse.com/guides/state-of-nodejs-orms-2026)
- **Sequelize**: stable 6.37.8 (2026-03-07). v7 is still alpha (`@sequelize/core` 7.0.0-alpha.48, 2026-02-04). PkgPulse calls it "maintained but not evolving." — [npm registry: sequelize](https://registry.npmjs.org/sequelize); [npm: @sequelize/core](https://registry.npmjs.org/@sequelize/core); [PkgPulse](https://www.pkgpulse.com/guides/state-of-nodejs-orms-2026)
- **Objection.js**: the original author said in Nov 2022, "I won't be working on Objection anymore." @lehni maintained it from 2023. In 2026 Vincit removed his access, and development continues at `ditojs/objection` under the same npm name. 4.x is current (4.4.1 published 2026-10-26). It peer-depends on knex ^3.3.0 and supports graph inserts/upserts and storing "complex documents as single rows." — [Objection discussion #2463](https://github.com/Vincit/objection.js/discussions/2463); [Objection 4.4.1 README](https://cdn.jsdelivr.net/npm/objection@4.4.1/README.md); [package.json](https://cdn.jsdelivr.net/npm/objection@4.4.1/package.json)
- **Knex** 3.3.0 published 2026-06-26. — [npm registry: knex](https://registry.npmjs.org/knex)

**Who uses them and how they wire it (ORMs)**
- **Payload CMS (Drizzle)**: `@payloadcms/db-postgres` and `@payloadcms/db-sqlite` 3.92.1 both depend on `drizzle-orm` 0.45.2, with `pg` and `@libsql/client` respectively. Payload's own docs list Mongo/Mongoose, Postgres/Drizzle and SQLite/Drizzle adapters. — [npm: @payloadcms/db-postgres](https://registry.npmjs.org/@payloadcms/db-postgres/latest); [npm: @payloadcms/db-sqlite](https://registry.npmjs.org/@payloadcms/db-sqlite/latest); [Payload DB overview](https://payloadcms.com/docs/database/overview)
  - How Payload maps a *document* CMS onto Drizzle: it generates a Drizzle schema from Payload config (`payload generate:db-schema`) and uses Drizzle `push` in dev (with data-loss warnings) and migrations in prod. Relationships go into `_rels`-suffixed tables and localized fields into `_locales` tables. Blocks are relational by default, but a `blocksAsJSON` option stores them in a JSON column instead. Raw Drizzle is exposed as `payload.db.drizzle`. — [Payload Postgres adapter](https://payloadcms.com/docs/database/postgres)
  - Payload notes that MongoDB "avoids the DDL changes" that complicate keeping prod/staging relational DBs in sync. — [Payload DB overview](https://payloadcms.com/docs/database/overview)
- **Astro DB (Drizzle + libSQL)**: `@astrojs/db` 0.21.3 depends on `drizzle-orm` ^0.45.2 and `@libsql/client`. — [npm: @astrojs/db](https://registry.npmjs.org/@astrojs/db/latest)
- **Keystone 6 (Prisma)**: `@keystone-6/core` 8.2.0 depends on `@prisma/client` ^7.9.0. — [npm: @keystone-6/core](https://registry.npmjs.org/@keystone-6/core/latest)
- **n8n (TypeORM fork)**: `n8n` 2.45.6 depends on `@n8n/typeorm` 0.12.0 (its own fork), which depends on `sqlite3` and `pg`. n8n defaults to SQLite at `~/.n8n/database.sqlite` and supports PostgreSQL. — [npm: n8n](https://registry.npmjs.org/n8n/latest); [npm: @n8n/typeorm](https://registry.npmjs.org/@n8n/typeorm/latest); [n8n supported DBs](https://docs.n8n.io/hosting/configuration/supported-databases-settings/)
- **Medusa (MikroORM)**: `@medusajs/deps` 2.22.1 pins `@mikro-orm/core` and `@mikro-orm/postgresql` 6.6.14, so it is still on v6. — [npm: @medusajs/deps](https://registry.npmjs.org/@medusajs/deps/latest)
- **Better Auth (Kysely)**: `better-auth` and `@better-auth/core` 1.7.14 depend on `kysely`. MikroORM 7's `@mikro-orm/sql` depends on `kysely` 0.29.6. — [npm: better-auth](https://registry.npmjs.org/better-auth/latest); [npm: @mikro-orm/sql](https://registry.npmjs.org/@mikro-orm/sql/latest)
- **Strapi, Ghost, Directus (Knex)**: `@strapi/database` 5.60.0 uses knex 3.3.0, `ghost` 6.73.0 uses knex 2.4.2, `@directus/api` 41.0.0 uses knex 3.1.0. — [npm: @strapi/database](https://registry.npmjs.org/@strapi/database/latest); [npm: ghost](https://registry.npmjs.org/ghost/latest); [npm: @directus/api](https://registry.npmjs.org/@directus/api/latest)

### Inferences
- Category, in plain words: Prisma and Drizzle sit at the "typed relational schema → SQL" end of the spectrum. The user's Item/List model is closer to the "document store + event log" end (NeDB, CouchDB/PouchDB, LiveStore, tldraw sync, Linear's sync engine). Mapping a recursive Item tree onto an ORM means one of two things: (a) a generic table such as `items(id, parent_id, kind, data JSON, seq)`, where the ORM adds little over raw SQL, or (b) a per-type schema plus migrations, which fights a dynamic object model. Payload's `blocksAsJSON` escape hatch shows that even a large product found per-field relational mapping heavy for nested content.
- None of these ORMs gives change streams. The user's change events must come from his own Item layer, whichever store sits underneath (true of every option here except CouchDB `_changes`, RxDB observables and unstorage `watch`).
- For a plain-JS author, Prisma 7/8 is the worst fit: TS-only generator, TS 5.9+ requirement for 8, mandatory codegen. Drizzle works from JS but loses most of its value, which is type inference. Kysely, Knex, and MikroORM via `defineEntity`/`EntitySchema` are the least TS-dependent.
- If he ever wants SQL inside a `SqliteStore`, the lowest-friction choice is raw `node:sqlite`/better-sqlite3 (or D1/DO `sql.exec`) with a single `items` / `deltas` table. A query builder like Kysely is optional on top.

### Gaps
- No primary source fetched confirming whether Prisma 7 `prisma-client-js` still officially supports `.js`-only projects; it is "maintenance mode" only.
- Drizzle 1.0 GA date unknown (still RC on 2026-10-21).
- TypeORM `EntitySchema` (its plain-JS path) was not re-verified for 1.0.

## 2. Is there a mature "universal adapter" that lets one Item API sit over files, SQLite and S3/R2?

### Takeaway
Not in the shape he needs. **unstorage** (UnJS) is the closest mature option. One async KV API spans `fs`, SQL (via db0: SQLite/node:sqlite/libSQL/Postgres/D1), S3, Cloudflare R2/KV, Redis, Mongo and more, plus mounts and a `watch()`. But it is whole-value get/set: no append primitive, no transactions, partial watch semantics, and key listing is weak on some backends. **Keyv** is cache-oriented (TTL, namespaces). **TinyBase** persisters and **RxDB** storages span many backends but impose their own data model, and RxDB's Node filesystem/SQLite storages are paid. The pragmatic answer is a tiny house-made `store` interface shaped around his log, e.g. `append(id, deltas)`, `read(id, fromSeq)`, `snapshot(id, seq, state)`, `loadSnapshot(id)`. Implement it per backend, optionally using unstorage for the blob/snapshot side.

### Cited Findings
**unstorage**
- Built-in drivers include: memory, `fs`, `fs-lite`, localstorage, indexeddb, `db0` (SQL), mongodb, planetscale, redis, upstash, `s3`, `cloudflare-kv-binding`, `cloudflare-kv-http`, `cloudflare-r2-binding`, azure-*, netlify-blobs, vercel-blob, http, github (read-only), `overlay`, lru-cache, deno-kv. The common API "stays the same across drivers," but key listing (`getKeys`) "is hard or impossible on some services." `fs` watching requires optional `chokidar`. — [unstorage drivers](https://unstorage.unjs.io/drivers)
- API: `hasItem`, `getItem`, `setItem` (`undefined` removes), `setItems`/`getItems` (experimental batch), `getItemRaw`/`setItemRaw`, `removeItem`, `getKeys`, `clear`, `getMeta`/`setMeta`, `mount`/`unmount`, `watch`/`unwatch`, `dispose`. `watch` fires `"update"`/`"remove"` with the key. Native-watch drivers report external changes. Other drivers emit only for individual `setItem`/`setItemRaw`/`removeItem` calls, and "batch writes (`setItems`) and `clear` do not currently emit events." — [unstorage guide](https://unstorage.unjs.io/guide)
- Releases: stable 1.17.6 (2026-10-14). 2.0 has been in alpha since 2025 and reached `2.0.0-beta.0` on 2026-10-20. npm `latest` now points to 2.0.0-beta.0 (dist-tags: `latest: 2.0.0-beta.0`). — [releasealert: unstorage](https://releasealert.dev/github/unjs/unstorage); [npm registry: unstorage](https://registry.npmjs.org/unstorage)
- **db0** (UnJS SQL connector) supports better-sqlite3, `node:sqlite`, Bun SQLite, libSQL, PostgreSQL, PGlite, MySQL, Cloudflare D1, PlanetScale, Neon, Hyperdrive. Connectors lazy-load their libraries. Latest 0.4.2 (2026-10-27); the db0 package page says development "is in the early stages." — [db0 connectors](https://db0.unjs.io/connectors); [UnJS db0 page](https://unjs.io/packages/db0); [npm registry: db0](https://registry.npmjs.org/db0)
- **Who uses unstorage and how**: Nitro (the server engine under Nuxt) builds its storage layer on unstorage ("a runtime-agnostic persistence layer"). Apps call `useKV()` (formerly `useStorage()`) and pick drivers per mount in config (`kv: { redis: { driver: "redis" } }`), with `$development.kv` overrides. Root storage is in-memory by default. Mount options must be JSON-serializable because they are baked into the build. — [Nitro storage guide](https://nitro.build/guide/storage)
  - `nitropack` 2.13.5 depends on `unstorage` ^1.17.6 and `db0` ^0.3.4. `astro` 7.4.4 depends on `unstorage` ^1.17.5. `vinxi` depends on unstorage. `@nuxthub/core` depends on unstorage. — [npm: nitropack](https://registry.npmjs.org/nitropack/latest); [npm: astro](https://registry.npmjs.org/astro/latest); [npm: vinxi](https://registry.npmjs.org/vinxi/latest); [npm: @nuxthub/core](https://registry.npmjs.org/@nuxthub/core/latest)
  - Nuxt Content v3 depends on `db0` ^0.4.1 and better-sqlite3. It asks which SQLite connector to use and can use native `node:sqlite` on Node ≥22.5. — [npm: @nuxt/content](https://registry.npmjs.org/@nuxt/content/latest); [Nuxt Content install](https://content.nuxt.com/docs/getting-started/installation)

**Keyv**
- "A small, Promise-based key-value store". Official adapters: Redis, Valkey, MongoDB, SQLite, PostgreSQL, MySQL, Etcd, Memcache, DynamoDB, Cloudflare KV, BigMap, plus in-memory. No file adapter listed. Serializers: JSON default, `@keyv/serialize-superjson`, `@keyv/serialize-msgpackr`. Namespaces, TTL, and `before:*`/`after:*` hooks. Latest 6.1.0 (2026-10-06). — [Keyv docs](https://keyv.org/docs/); [npm registry: keyv](https://registry.npmjs.org/keyv)
- Users: `cacheable-request` 13 (used by `got` 16) and `cache-manager` 7 depend on keyv ^5.6.0, i.e. as an HTTP/app cache backend. — [npm: cacheable-request](https://registry.npmjs.org/cacheable-request/latest); [npm: cache-manager](https://registry.npmjs.org/cache-manager/latest)

**Multi-backend "data model + persisters" libraries**
- **TinyBase** (10.0.1, 2026-09-24) persisters include File, `SqliteNodePersister` (node:sqlite), better-sqlite3, Bun, SQLite WASM, libSQL, PGlite, Postgres, `DurableObjectStoragePersister` (KV), `DurableObjectSqlStoragePersister`, IndexedDB, localStorage, Automerge, Yjs, Remote, PartyKit. `startAutoSave`/`startAutoLoad`/`startAutoPersisting`. Basic persisters save a "JSON-serialized version" of the whole Store. — [TinyBase persistence intro](https://tinybase.org/guides/persistence/an-intro-to-persistence/); [npm](https://registry.npmjs.org/tinybase)
- **RxDB** (17.6.0, 2026-10-05) RxStorages: free = Memory, LocalStorage, Remote, Electron IPC, Dexie, MongoDB, DenoKV, FoundationDB. **Premium** = IndexedDB, OPFS, **Filesystem Node**, **SQLite**, Expo FS, plus the sharding/worker wrappers. — [RxDB storages](https://rxdb.info/rx-storage.html)
- RxDB replication is checkpoint-based: the server implements `pullHandler`, `pushHandler`, `pullStream$`. Conflicts are resolved client-side, with a default handler that keeps master state. Documents need last-write-time ordering and soft deletes (`_deleted`). Plugins exist for HTTP, WebSocket, CouchDB, GraphQL, WebRTC, Firestore, Supabase, NATS and others. — [RxDB replication](https://rxdb.info/replication.html)
- **Dexie** is an "IndexedDB wrapper for offline-first web applications", with Dexie Cloud for sync. It is browser-oriented and not a Node file store. 4.4.7 (2026-10-19). RxDB 17.6 depends on dexie 4.4.2. — [Dexie getting started](https://dexie.org/docs/Tutorial/Getting-started); [npm: rxdb](https://registry.npmjs.org/rxdb/latest)

**Document stores with their own file format**
- **lowdb** 7.0.1, last published **2023-12-26** (stale-ish). It has an adapter pattern where a custom adapter needs only `read()` and `write(data)`, so it is very plain-JS. It serializes the whole `db.data` on every write, and the README warns of performance problems around 10–100 MB. No cluster support; ESM-only. — [lowdb README](https://cdn.jsdelivr.net/npm/lowdb@7.0.1/README.md); [npm](https://registry.npmjs.org/lowdb)
- **LokiJS** 1.5.12, last published **2021-04-20**, so stale. — [npm registry: lokijs](https://registry.npmjs.org/lokijs)
- **NeDB**: the original `nedb` 1.8.0 was last published 2016 (abandoned). The fork **@seald-io/nedb** 4.1.2 (2025-07-07) is maintained "for the needs of Seald." — [npm: nedb](https://registry.npmjs.org/nedb); [npm: @seald-io/nedb](https://registry.npmjs.org/@seald-io/nedb); [Seald NeDB README](https://cdn.jsdelivr.net/npm/@seald-io/nedb@4.1.2/README.md)
- **PouchDB** 9.0.0 (2024-05-24) is the latest release, with none in ~2.4 years (slow). It lives under `apache/pouchdb`. — [PouchDB 9.0.0 post](https://pouchdb.com/2024/05/24/pouchdb-9.0.0.html); [npm](https://registry.npmjs.org/pouchdb)
- CouchDB revision model: every update must carry the `_rev` it replaces (stale → 409). History is a revision tree, and concurrent replicated edits become branches. A deterministic algorithm picks the same "winner" on all peers while losers are preserved as `_conflicts`. Compaction drops non-leaf bodies but keeps revision IDs. — [CouchDB conflicts docs](https://docs.couchdb.org/en/stable/replication/conflicts.html)

**Cloudflare targets (DO, D1, R2)**
- SQLite-backed Durable Objects went GA on 2025-04-07 with a 10 GB SQLite DB per object. — [CF changelog](https://developers.cloudflare.com/changelog/2025-04-07-sqlite-in-durable-objects-ga/)
- DO storage API: `ctx.storage.sql.exec()` (cannot run `BEGIN`/`SAVEPOINT`), a synchronous KV API `ctx.storage.kv` (stored in hidden `__cf_kv`), `transactionSync()`, implicit per-method transactions, 30-day point-in-time recovery via bookmarks, and alarms. — [DO SQL storage API](https://developers.cloudflare.com/durable-objects/api/sql-storage)
- DO limits: 10 GB per object (the FAQ says 1 GB on Free, which conflicts with the table), key+value ≤2 MB, row ≤2 MB, SQL statement ≤100 KB. — [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- D1 limits: 10 GB max DB on Paid ("cannot be further increased"), 500 MB on Free, 50,000 DBs/account, 2 MB row, 1,000 queries per Worker invocation (a `batch()` counts as one). — [D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
- R2 `PutObject` supports `If-Match` / `If-None-Match`. With competing create-if-absent writes, "at most one request succeeds and every other request fails with a `412 PreconditionFailed`." — [R2 S3 extensions](https://developers.cloudflare.com/r2/api/s3/extensions/)
- S3 added `If-None-Match: *` (Aug 2024) and `If-Match: <etag>` (Nov 2024). This enables an object-store append-only log: write numbered keys `log/<version>.json` with `If-None-Match: *`, and on 412 rebase and retry. A compare-and-swap manifest works via `If-Match`. SlateDB adds a writer epoch to fence old writers. — [Mohak Chugh, S3 conditional writes (2026-07-07)](https://mohakchugh.is-a.dev/blog/s3-conditional-writes-distributed-coordination)

**Who wires a "swappable store" behind a live object model (closest real-world analogues)**
- **tldraw sync**: exactly one `TLSocketRoom` per room holds the authoritative document and relays changes over WebSockets. Storage is pluggable: `InMemorySyncStorage` (default; you must save `getSnapshot()` yourself in an `onChange` callback) or `SQLiteSyncStorage`, which runs either in a Durable Object's built-in SQLite or in Node via `better-sqlite3` or `node:sqlite`. Earlier templates stored room *snapshots* in R2; R2 now holds only binary assets, and there is a one-time R2→SQLite migration path. `onCommittedChanges` can mirror records to your own DB. — [tldraw sync docs](https://tldraw.dev/docs/sync)
- **Cloudflare Agents SDK**: agent state is "one value per Agent", stored in the DO's SQLite and broadcast to every connected client. `setState()` stores and broadcasts, `validateStateChange()` can reject client writes, `onStateChanged(state, source)` reacts (ignore `"server"` to avoid loops), and `this.sql` is available for data clients don't need. — [CF Agents state docs](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/)

### Inferences
- unstorage is a good fit for the **snapshot/blob half** of his store (`setItem('items/<id>/snapshot', json)` works the same on fs, S3, R2 and KV). It is a poor fit for the **append-only delta half**. Object stores and KV have no append, so `append` becomes read-modify-write, a new key per batch, or a SQL table. That is exactly why he should own the `store` interface rather than adopt one.
- A practical backend matrix for his interface:
  - Files: JSONL append + periodic snapshot file (what he has).
  - SQLite (`node:sqlite`, D1, DO): `deltas(item_id, seq, json)` + `snapshots(item_id, seq, json)`.
  - S3/R2: one object per delta batch (`items/<id>/log/<seq>.json`, written with `If-None-Match: *`) + snapshot object + CAS manifest.
- tldraw's and Cloudflare Agents' designs both validate his architecture (authoritative in-memory object + websocket fan-out + pluggable persistence). Both moved state to **DO SQLite** rather than R2 snapshots.
- PouchDB/CouchDB is the only option with built-in revisioned multi-master replication. It is document-per-row with whole-document revisions, not field-level deltas, and PouchDB's release cadence has slowed.

### Gaps
- Could not verify a per-driver `watch` support matrix for unstorage, or the concrete breaking changes in unstorage 2.0 beta.
- No source found on whether TinyBase persists incrementally (row-level) vs whole-store for the file/SQLite persisters.
- Keyv key-iteration support per adapter was not confirmed.

## 3. What do people recommend for append-only JSONL + periodic snapshot (compaction) in Node?

### Takeaway
The proven recipe is the same across NeDB, Redis AOF, Figma and event-sourcing guides:
1. Append each change (with a monotonically increasing sequence number) to a log.
2. Periodically write a full **snapshot/base** that records the sequence number it covers.
3. Write it crash-safely: temp file → fsync → atomic rename → fsync the directory.
4. Start a fresh log segment, and on load replay `snapshot + deltas with seq > snapshot.seq`.
5. Trigger compaction by size ratio, by time, or on open/close.

In Node, **@alcalzone/jsonl-db** is a ready-made JSONL implementation of this pattern, used in production by **Z-Wave JS** and **ioBroker**. **@seald-io/nedb** is the document-store version. **Emmett** is the TS-first event-sourcing framework, with PostgreSQL/SQLite/Mongo/EventStoreDB stores.

### Cited Findings
**NeDB (append-only document store) — how it compacts**
- "uses an append-only format, meaning that all updates and deletes actually result in lines added at the end of the datafile". The DB is compacted every time it is loaded. There is a manual `compactDatafileAsync()` and an interval-based `setAutocompactionInterval()` / `stopAutocompaction()`. — [Seald NeDB README](https://cdn.jsdelivr.net/npm/@seald-io/nedb@4.1.2/README.md)
- Appends use `appendFile` of newline-joined serialized docs. Deletes are `$$deleted` marker lines and index definitions are `$$indexCreated` lines. Compaction rewrites the in-memory docs plus index lines via `crashSafeWriteFileLinesAsync` and emits `compaction.done`. Corrupt lines are skipped up to `corruptAlertThreshold` (default 10%); above that, loading fails ("Cautiously refusing to start NeDB to prevent dataloss"). — [NeDB persistence.js](https://cdn.jsdelivr.net/npm/@seald-io/nedb@4.1.2/lib/persistence.js)
- Crash-safe rewrite sequence: fsync parent dir, fsync the existing file, write `filename~`, fsync the temp file, rename over `filename`, fsync parent dir. On startup `ensureDatafileIntegrity`: if `filename` is missing but `filename~` exists, the temp file is renamed into place. — [NeDB storage.js](https://cdn.jsdelivr.net/npm/@seald-io/nedb@4.1.2/lib/storage.js)

**Redis AOF — how it compacts**
- AOF rewrite replaces the log with the shortest command sequence that rebuilds the dataset, and runs non-blocking via fork. Since 7.0 it uses multi-part AOF: one **base** file (snapshot, RDB or AOF format), one or more **incremental** files, and a **manifest**. Rewrite: the child writes a new base while the parent opens a new incremental file. The new manifest is persisted and swapped atomically, then old files are deleted. A failed rewrite leaves old base + incrementals valid. — [Redis persistence docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- Defaults: `auto-aof-rewrite-percentage 100`, `auto-aof-rewrite-min-size 64mb`, `aof-use-rdb-preamble yes`, `appendfsync everysec` ("usually the right compromise between speed and data safety"), and `aof-load-truncated yes` (load a truncated tail and log a warning). — [redis.conf](https://raw.githubusercontent.com/redis/redis/unstable/redis.conf)

**@alcalzone/jsonl-db (ready-made JSONL + compaction for Node)**
- A Map-like API (`set/get/has/delete/clear`, iteration) over an append-only JSONL file. `autoCompress` triggers: `sizeFactor` (compress when `uncompressedSize >= size * sizeFactor`), `intervalMs`, `onClose`, `onOpen`, with minimum thresholds `sizeFactorMinimumSize` and `intervalMinChanges`. `throttleFS` (`intervalMs`, `maxBufferedCommands`) batches file writes, and buffered data can be lost on crash. A lockfile prevents concurrent access. Version 4.0.2 (2025-10-15). — [jsonl-db README](https://cdn.jsdelivr.net/npm/@alcalzone/jsonl-db@4.0.2/README.md); [npm](https://registry.npmjs.org/@alcalzone/jsonl-db)
- **Users**: `zwave-js` and `@zwave-js/core` 15.31.2 depend on `@alcalzone/jsonl-db` ^4.0.2. ioBroker's `@iobroker/db-states-jsonl` and `@iobroker/db-objects-jsonl` 7.2.5 depend on ~3.1.1, i.e. ioBroker's JSONL states/objects databases. — [npm: zwave-js](https://registry.npmjs.org/zwave-js/latest); [npm: @iobroker/db-states-jsonl](https://registry.npmjs.org/@iobroker/db-states-jsonl/latest); [npm: @iobroker/db-objects-jsonl](https://registry.npmjs.org/@iobroker/db-objects-jsonl/latest)

**Figma — snapshot + journal at scale (closest to his websocket-streamed live objects)**
- The multiplayer server holds each open file in memory. Every **30–60 s** it checkpoints the whole file (binary, compressed) to S3. A checkpoint-only design risked losing ~60 s of work and caused write spikes on redeploy. They added a **journal** (a write-ahead log in DynamoDB): each change gets an incrementing sequence number, each checkpoint records the sequence number it covers, writes are batched (~0.5 s target), and a DynamoDB lock table ensures one writer per file. Recovery = latest checkpoint + replay journal entries with a higher sequence number. Result: "95% of edits to a Figma file get saved within 600ms." — [Figma: Making multiplayer more reliable (2022-10-20)](https://www.figma.com/blog/making-multiplayer-more-reliable/)

**Event-sourcing guidance and libraries**
- Typical snapshot policy: snapshot every N events, storing aggregate id + version + state. Load = latest snapshot + events with version > snapshot.version. Use optimistic concurrency (append only if the stream version matches the expected one), and snapshot only after a successful append. — [OneUptime: Event sourcing in Node (2026-01-26)](https://oneuptime.com/blog/post/2026-01-26-nodejs-event-sourcing/markdown)
- **Emmett** (Oskar Dudycz) is a Node/TS library of event-sourcing building blocks (Deciders, command handlers, projections). It has "Built-in support for PostgreSQL, EventStoreDB, MongoDB, SQLite, and In-Memory storage" and "First-class TypeScript support." Packages: `emmett-postgresql`, `emmett-esdb`, `emmett-mongodb`, `emmett-sqlite`, `emmett-expressjs`. Inline projections run in the same transaction as the append (Postgres). Snapshots are not mentioned in the docs. Version 0.42.4 (2026-08-12), still 0.x. — [Emmett GitHub](https://github.com/event-driven-io/emmett); [Emmett getting started](https://event-driven-io.github.io/emmett/getting-started.html); [Introducing Emmett](https://event-driven.io/en/introducing_emmett); [npm](https://registry.npmjs.org/@event-driven-io/emmett)
  - `emmett-sqlite` 0.42.4 depends on the `sqlite3` package. `emmett-esdb` still depends on the old `@eventstore/db-client`. — [npm: emmett-sqlite](https://registry.npmjs.org/@event-driven-io/emmett-sqlite/latest); [npm: emmett-esdb](https://registry.npmjs.org/@event-driven-io/emmett-esdb/latest)
- **KurrentDB** Node client `@kurrent/kurrentdb-client` 1.3.1 (2026-06-29): gRPC with `appendToStream` / `readStream`. The older `@eventstore/db-client` was last published 2024-05-10 (stale). — [KurrentDB client README](https://cdn.jsdelivr.net/npm/@kurrent/kurrentdb-client@1.3.1/README.md); [npm: @eventstore/db-client](https://registry.npmjs.org/@eventstore/db-client)
- **LiveStore** (0.5.0, 2026-10-15) is event-sourced SQLite: an eventlog plus materializers that turn events into SQLite state, with sync providers (Cloudflare, ElectricSQL, S2) and a Node adapter. — [LiveStore docs](https://docs.livestore.dev/); [npm](https://registry.npmjs.org/@livestore/livestore)

**Products that ship "log of mutations + compaction" (wiring details)**
- **Actual Budget** (local-first budgeting): `@actual-app/core` depends on better-sqlite3 ^13 and `@actual-app/crdt` (protobuf + murmurhash). The docs say Actual "stores all mutations in the budget file by default, causing it to grow over time." A "sync reset" compresses history into a single file and issues a new sync ID, and other devices must re-download. With E2E encryption, the server is just "passing around changes." — [npm: @actual-app/core](https://registry.npmjs.org/@actual-app/core/latest); [@actual-app/crdt package.json](https://cdn.jsdelivr.net/npm/@actual-app/crdt/package.json); [Actual sync docs](https://actualbudget.org/docs/getting-started/sync/)
- **Linear** (per an unofficial reverse-engineering write-up): models are JS classes registered via decorators, held in an in-memory object pool keyed by UUID (observed by MobX), and persisted to IndexedDB per user/workspace, one table per model plus `_meta` and `_transaction`. A database-wide monotonic `lastSyncId` detects gaps. The server broadcasts delta packets over WebSocket to all clients, including the sender. Local edits are queued transactions sent as GraphQL mutations, and "Client-side operations will never directly modify the tables in the local database": local tables change only when the server's delta arrives. References are lazily hydrated. — [wzhudev/reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)

### Inferences
- Recommended concrete design for his JSONL store (synthesized from NeDB + Redis + Figma):
  - Each delta line carries `{seq, itemId, op, path, value}`.
  - `snapshot.json` carries `{seq, state}`.
  - Compaction rule like jsonl-db's `sizeFactor` (e.g. log ≥ 2× snapshot size) plus `onClose`.
  - Write the snapshot via `snapshot.json~` → fsync → rename → fsync dir (NeDB's sequence), then rotate to a new log segment named by start seq (Redis multi-part: base + incr + manifest) rather than truncating in place.
  - On load, tolerate a torn last line (Redis `aof-load-truncated`, NeDB `corruptAlertThreshold`).
- His websocket streaming means the in-memory Item is authoritative and the log is the durability layer. That is the Figma/tldraw shape, which favors "batch appends every ~0.5–1 s + snapshot every N changes or T seconds" over fsync-per-change.
- Emmett/KurrentDB are heavier (aggregates, streams, projections) and TS-first. Worth borrowing concepts (expected-version append, inline projections) more than adopting them for a vanilla-JS framework.
- Linear's "local state changes only on server ack" rule is a clean way to keep replicas consistent without CRDTs. His server-authoritative Item could do the same for clients.

### Gaps
- No HN/Reddit threads gathered (search budget exhausted), so community recommendations come from library docs and engineering blogs only.
- No source located for a widely used generic "JSONL + snapshot" library beyond jsonl-db/NeDB. Snapshot support in Emmett was not found in its docs.
- Actual Budget's internal CRDT/merkle details were not confirmed from primary docs (only the package deps and user docs).

## 4. Which are pleasant from plain JS with classes, and how do serialization formats handle references, cycles and deltas?

### Takeaway
**Most pleasant from plain JS:** `node:sqlite` / better-sqlite3 (synchronous, tiny API), lmdb-js, unstorage, Keyv, lowdb, @seald-io/nedb, jsonl-db, Kysely/Knex used untyped, and MikroORM via `defineEntity({ class })`.
**Least pleasant:** Prisma (TS-only codegen) and, to a lesser degree, Drizzle (works, but the value is TS inference).

For **serialization with references and cycles**, **devalue** (SvelteKit) and **seroval** (Solid/TanStack) handle cycles and repeated references and allow custom class revival. **superjson** focuses on types (Date/Map/Set/BigInt) plus `registerClass`. For **deltas**, Immer patches (array paths) and RFC 6902 JSON Patch suit field-level logs. JSON Merge Patch can't express "set to null" or array-element edits.

### Cited Findings
**Embedded engines from plain JS**
- `node:sqlite`: added v22.5.0. Unflagged in v23.4.0/v22.13.0 "but still experimental". It became "Stability: 1.2 - Release candidate" in v25.7.0, and the v26.13.0 docs still show 1.2 RC. There is no transaction helper (manual `BEGIN`/`COMMIT` with `db.isTransaction`). — [Node.js sqlite docs (v26.13.0)](https://nodejs.org/api/sqlite.html)
  - It supports sessions/changesets (`createSession()`, `changeset()`, `applyChangeset()`), custom scalar/aggregate/window functions, and `sqlite.backup()`. — [node sqlite.md (main)](https://gh.hhj520.top/nodejs/node/blob/main/doc/api/sqlite.md)
  - Per PhotoStructure, RC status applies in Node v25.7.0+ and v24.15.0+. — [PhotoStructure library comparison](https://photostructure.github.io/node-sqlite/documents/library-comparison.html)
  - Conflict: a dev.to guide claims "Node.js v26 stabilized it fully," but the official v26.13.0 docs still say Release Candidate. — [dev.to node:sqlite guide](https://dev.to/jangwook_kim_e31e7291ad98/nodejs-built-in-sqlite-a-practical-guide-no-npm-install-required-2f0d) vs [Node docs](https://nodejs.org/api/sqlite.html)
  - Node 25.7.0's headline was SQLite's promotion to RC. — [Machine Herald (Feb 2026)](https://machineherald-io.pages.dev/article/2026-02/28-nodejs-ships-three-releases-in-february-as-sqlite-hits-release-candidate-and-native-typescript-stabilizes)
- `node:sqlite` vs better-sqlite3: both are synchronous only. better-sqlite3 leads on large multi-row reads and lacks sessions/changesets. `node:sqlite`'s SQLite version is tied to the Node release. The `sqlite3` (async) package is described as "deprecated and unmaintained as of December 2025" — contradicted by npm, where `sqlite3` 6.0.1 was published 2026-03-12 with no deprecation flag. — [PhotoStructure comparison](https://photostructure.github.io/node-sqlite/documents/library-comparison.html); [npm: sqlite3](https://registry.npmjs.org/sqlite3)
  - The dev.to guide says better-sqlite3's node-gyp native build "often fails on CI and Alpine," while node:sqlite avoids this; and that node:sqlite lacks `db.transaction()` and `serialize()`/`deserialize()`. — [dev.to guide](https://dev.to/jangwook_kim_e31e7291ad98/nodejs-built-in-sqlite-a-practical-guide-no-npm-install-required-2f0d)
  - better-sqlite3 latest 13.0.3 (2026-08-05). — [npm](https://registry.npmjs.org/better-sqlite3)
- **libSQL / Turso**: `@libsql/client` 0.18.0 (2026-09-02). libSQL (the C fork) is production-ready, keeps SQLite's single-writer model, and powers Turso Cloud. The Rust rewrite ("Turso Database", formerly Limbo) is in beta, with MVCC concurrent writes "still developing"; per OpenReplay (Apr 2026) it is "not production-ready yet." — [OpenReplay: Turso Rust evolution](https://blog.openreplay.com/turso-rust-sqlite-evolution/); [npm: @libsql/client](https://registry.npmjs.org/@libsql/client)
  - `@tursodatabase/database` 0.8.3 (2026-10-12) "has not yet reached 1.0" yet "runs in production at multiple organizations", with a recommendation to keep backups. The API is async, and `@tursodatabase/sync` does bidirectional sync to Turso Cloud. (Partially conflicts with OpenReplay's "not production-ready".) — [@tursodatabase/database README](https://cdn.jsdelivr.net/npm/@tursodatabase/database@0.8.3/README.md)
- **DuckDB**: `@duckdb/node-api` ("Neo", 2.0.0-r.1, 2026-10-21) has native Promises. Appenders flush on `flushSync()`/`closeSync()` or about every 204,800 rows, which suits bulk writes. The old `duckdb` package's last release was 1.4.4 (2026-01-30). — [@duckdb/node-api README](https://cdn.jsdelivr.net/npm/@duckdb/node-api@2.0.0-r.1/README.md); [npm: duckdb](https://registry.npmjs.org/duckdb)
- **LMDB (lmdb-js)** 3.5.9 (2026-10-23): synchronous memory-mapped reads, async batched writes (promises resolve on commit), MessagePack by default with a `structuredClone` option that "preserves object cycles", `transaction`/`transactionSync`/`childTransaction`, `ifVersion` optimistic locking, and ordered `getRange` cursors. The only documented event is `beforecommit`. Runs on Node, Deno and Bun. — [lmdb-js README](https://cdn.jsdelivr.net/npm/lmdb@3.5.9/README.md)
  - **Users**: Gatsby 5.16.1 depends on lmdb 2.5.3. Gatsby 4 adopted lmdb-store as a shared datastore because Redux state "could not be shared across CPU cores," enabling `n-1` parallel query workers. The earlier v3.7 experiment cited "Lower peak memory usage" and OOMs from persisting Redux to disk on large sites. `@parcel/cache` 2.16.4 depends on lmdb 2.8.5. — [npm: gatsby](https://registry.npmjs.org/gatsby/latest); [Gatsby v4 release notes](https://www.gatsbyjs.com/docs/reference/release-notes/v4.0/); [Gatsby v3.7 notes](https://www.gatsbyjs.com/docs/reference/release-notes/v3.7/); [npm: @parcel/cache](https://registry.npmjs.org/@parcel/cache/latest)
- **Level**: `level` 10.0.0 and `classic-level` 3.0.0 were both published 2025-04-20, with nothing since (~18 months; slow). `level` exports classic-level in Node and browser-level in browsers, with sublevels. Node 18+. — [level README](https://cdn.jsdelivr.net/npm/level@10.0.0/README.md); [npm: level](https://registry.npmjs.org/level); [npm: classic-level](https://registry.npmjs.org/classic-level)

**Serialization with references and cycles**
- **devalue** 6.0.3 (2026-10-13) handles cyclic and repeated references, Map, Set, Date, RegExp, BigInt, `undefined`, ±Infinity/NaN/-0, ArrayBuffer/typed arrays, URL, URLSearchParams and Temporal. Custom classes go through `reducers` (stringify) and `revivers` (parse); the README revives a `Vector` class with its methods. `uneval` emits JS (must be eval'd); `stringify`/`parse` are eval-free. It throws on functions and non-POJOs without a reducer. — [devalue README](https://github.com/sveltejs/devalue); [npm](https://registry.npmjs.org/devalue)
  - Users: `@sveltejs/kit` 3.1.0 depends on devalue ^5.9.4, and `astro` 7.4.4 on devalue ^6.0.2. — [npm: @sveltejs/kit](https://registry.npmjs.org/@sveltejs/kit/latest); [npm: astro](https://registry.npmjs.org/astro/latest)
- **seroval** 1.7.5 (2026-10-29) handles cyclic and mutual references across objects, arrays, Maps and Sets, plus NaN/Infinity/-0, BigInt, RegExp, Date and array holes. It has plugins and streaming (doc sections). — [seroval README](https://cdn.jsdelivr.net/npm/seroval@1.7.5/README.md)
  - Users: `solid-js` 1.9.17, `@solidjs/start` 2.1.0 and `@tanstack/router-core` depend on seroval. — [npm: solid-js](https://registry.npmjs.org/solid-js/latest); [npm: @tanstack/router-core](https://registry.npmjs.org/@tanstack/router-core/latest)
- **superjson** 2.2.6 (2025-11-27, ~11 months since last publish) supports Date, Map, Set, BigInt, RegExp, undefined, Error and URL. Output is `{json, meta}`. It exposes `registerClass`, `registerCustom`, `registerSymbol` and `allowErrorProps`. A `dedupe` option serializes referentially equal objects once and replaces the rest with `null`. — [superjson README](https://cdn.jsdelivr.net/npm/superjson@2.2.6/README.md); [superjson index.d.ts](https://cdn.jsdelivr.net/npm/superjson@2.2.6/dist/index.d.ts)

**Delta / patch formats**
- **Immer patches** (Immer 11.2.9, 2026-10-22): `enablePatches()`, then `produceWithPatches` → `[next, patches, inversePatches]` and `applyPatches`. The format resembles RFC 6902 but `path` is an array, not a JSON-Pointer string. Patches are correct but not guaranteed minimal. Documented uses are undo/redo and sending patches incrementally "over WebSockets." — [Immer patches docs](https://immerjs.github.io/immer/patches/); [npm](https://registry.npmjs.org/immer)
  - Users: `@reduxjs/toolkit` 2.13.0 depends on immer ^11. — [npm: @reduxjs/toolkit](https://registry.npmjs.org/@reduxjs/toolkit/latest)
- **fast-json-patch** (RFC 6902) 3.1.1 was last published **2022-03-24** (stale). **rfc6902** 5.3.0 (2026-07-23) is an actively published alternative. **json-merge-patch** 1.0.2 was last published 2021 (stale). — [npm: fast-json-patch](https://registry.npmjs.org/fast-json-patch); [npm: rfc6902](https://registry.npmjs.org/rfc6902); [npm: json-merge-patch](https://registry.npmjs.org/json-merge-patch)
- JSON Merge Patch limits: null means delete (you can't store null), arrays are replaced whole, and a non-object patch replaces the whole target. RFC 7386 is obsoleted by RFC 7396. — [RFC 7386](https://www.rfc-editor.org/rfc/rfc7386)

### Inferences
- For his Item delta log, a path-based op (`{op:'set'|'del'|'insert', path:[...], value}`), essentially Immer's patch shape, maps directly onto `Item.set` change events and replays trivially. Merge Patch is too lossy for Lists.
- For references between Items, the cleanest approach is to **serialize references as ids** (`{$ref: 'item-id'}`) in his own `toJSON`/`fromJSON`. That keeps each Item's log independent and lets any backend (row, object, line) store it; this is how Linear's object pool works (UUID-keyed models with lazily hydrated references). Use devalue/seroval only when a *single* payload contains a cyclic graph, e.g. a websocket bootstrap. devalue's reducer/reviver pair maps nicely onto class-based Items.
- lmdb-js is a strong "local, fast, plain-JS" alternative to JSONL if he outgrows files: sync reads fit a synchronous `get()`, and the `structuredClone` encoder preserves cycles. It is Node/Bun/Deno only, not Workers.

### Gaps
- `structuredClone` behavior (handles cycles, drops class prototypes, throws on functions) was not verified against a fetched source in this pass. The only sourced statement is lmdb's `structuredClone` encoder preserving cycles.
- Could not confirm from a primary source whether superjson restores shared references and cycles on `parse` (only the `dedupe` doc comment was seen).
- A Node security advisory (CVE-2026-58041, "node:sqlite stale ... cached prepared statement") appeared in search results but was not fetched or verified.

## 5. Simplifying concessions: the simple, common setups, what each gives up, and when you don't need it

### Takeaway
Most production systems in this space start with one or more of these deliberate simplifications:
- one SQLite file
- no ORM
- a KV/blob abstraction
- whole-snapshot writes on an interval
- a single authoritative process per document

Each costs a specific capability (multi-writer scale, typed relations/migrations, queries/transactions, durability window, multi-region writes). For a single-server framework that streams live Items over websockets, nearly all of them are safe defaults until a concrete need appears.

### Cited Findings
- **Single SQLite file instead of a networked/cloud DB.** You give up concurrent writers and horizontal scale. libSQL keeps SQLite's single-writer model, and Turso's MVCC concurrent writes are still in beta. — [OpenReplay](https://blog.openreplay.com/turso-rust-sqlite-evolution/)
  - n8n ships SQLite by default (`~/.n8n/database.sqlite`) with PostgreSQL as the scale-up path. — [n8n DB docs](https://docs.n8n.io/hosting/configuration/supported-databases-settings/)
  - Cloud SQLite has hard caps: D1 10 GB per DB ("cannot be further increased"), DO 10 GB per object. — [D1 limits](https://developers.cloudflare.com/d1/platform/limits/); [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- **No ORM (raw SQL / query builder).** You give up schema-driven migrations, relation loading and typed models. Kysely explicitly "IS NOT an ORM" and nests relations with SQL JSON helpers. — [Kysely relations](https://kysely.dev/docs/recipes/relations)
  - Payload, which does use an ORM, still offers `blocksAsJSON` to drop relational structure for a JSON column. — [Payload Postgres](https://payloadcms.com/docs/database/postgres)
- **KV/blob abstraction (unstorage/Keyv) instead of a DB.** You give up queries, transactions, reliable key listing on some backends, and change events for batch writes/`clear`. — [unstorage drivers](https://unstorage.unjs.io/drivers); [unstorage guide](https://unstorage.unjs.io/guide)
- **Snapshot-on-interval instead of per-change durability.** You give up the last N seconds on crash. Figma's checkpoint-only design (every 30–60 s) risked ~60 s of lost work until they added a journal. — [Figma](https://www.figma.com/blog/making-multiplayer-more-reliable/)
  - jsonl-db's `throttleFS` loses buffered data on crash. — [jsonl-db](https://cdn.jsdelivr.net/npm/@alcalzone/jsonl-db@4.0.2/README.md)
  - Redis's default `appendfsync everysec` is "usually the right compromise between speed and data safety." — [redis.conf](https://raw.githubusercontent.com/redis/redis/unstable/redis.conf)
- **Whole-file rewrite (lowdb) instead of append-only.** You give up write efficiency for large data: lowdb serializes the whole `db.data` per write, with problems around 10–100 MB, and recommends Postgres/Mongo for scale. — [lowdb README](https://cdn.jsdelivr.net/npm/lowdb@7.0.1/README.md)
- **Compaction only on load (NeDB default) instead of background compaction.** The file grows for the lifetime of the process; NeDB adds an opt-in interval. — [NeDB README](https://cdn.jsdelivr.net/npm/@seald-io/nedb@4.1.2/README.md)
- **Single process owns the file (lockfile) / single authoritative room.** You give up multi-process writers. jsonl-db uses a lockfile, and lowdb doesn't support cluster. — [jsonl-db](https://cdn.jsdelivr.net/npm/@alcalzone/jsonl-db@4.0.2/README.md); [lowdb](https://cdn.jsdelivr.net/npm/lowdb@7.0.1/README.md)
  - tldraw requires exactly one `TLSocketRoom` per room globally and uses Durable Objects to guarantee that. — [tldraw sync](https://tldraw.dev/docs/sync)
  - Figma uses a DynamoDB lock so one server writes a file's journal. — [Figma](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **Whole-state value instead of deltas.** Cloudflare Agents stores "one value per Agent" and broadcasts it on `setState`. That is simple, but you lose a history/audit log and send full state per change. — [CF Agents state](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/)
  - TinyBase basic persisters save a JSON-serialized whole Store. — [TinyBase](https://tinybase.org/guides/persistence/an-intro-to-persistence/)
- **Server-authoritative ordering instead of CRDT/multi-master.** You give up offline concurrent edits that merge. Linear's client only updates its local DB when the server's delta arrives. — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
  - CouchDB instead preserves conflicts and picks a deterministic winner. — [CouchDB conflicts](https://docs.couchdb.org/en/stable/replication/conflicts.html)
  - Actual Budget's mutation history grows until a "sync reset" compacts it, which forces other devices to re-sync. — [Actual sync](https://actualbudget.org/docs/getting-started/sync/)
- **Snapshots in object storage instead of a DB.** tldraw moved room state from R2 snapshots to DO SQLite, keeping R2 for binary assets. — [tldraw sync](https://tldraw.dev/docs/sync)
  - Correct concurrent writes to S3/R2 need conditional puts (`If-None-Match` / `If-Match`). — [R2](https://developers.cloudflare.com/r2/api/s3/extensions/); [S3 conditional writes](https://mohakchugh.is-a.dev/blog/s3-conditional-writes-distributed-coordination)

### Inferences
- **When you genuinely don't need the feature**, case by case:
  - Single SQLite file / JSONL: fine while one Node process owns the data and the dataset fits on one disk. Multi-writer is only needed with multiple app servers writing the same Items.
  - No ORM: fine when the schema is generic (`items`, `deltas`, `snapshots`) rather than per-type tables, which matches a dynamic Item model.
  - Interval snapshots: fine if deltas are appended (even batched every ~0.5–1 s). The snapshot interval then only affects load time, not durability. Only snapshot-only designs lose data.
  - KV abstraction: fine for snapshots and blobs; not for the append log or anything needing queries.
  - Single authoritative process per Item tree: fine unless you need active-active multi-region writes. Even Figma and tldraw use one owner per document.
  - Server-authoritative over CRDT: fine unless clients must edit offline for long periods and merge.
- **Recommended minimal path for this user:**
  - Keep JSONL + snapshot.
  - Add `seq` numbers, size-ratio compaction, crash-safe rename and torn-line tolerance.
  - Define a 4-method `store` interface.
  - Make SQLite (`node:sqlite` or DO SQLite) the second backend.
  - Treat S3/R2 as a snapshot/archive target (with conditional writes) rather than the live log.

### Gaps
- Could not research (web search budget exhausted) published data-flow write-ups for some adopters, e.g. how Payload handles migrations at scale, or how n8n/Z-Wave JS chose their compaction thresholds. Adopter lists above come from npm dependency manifests plus the adopters' own docs.
