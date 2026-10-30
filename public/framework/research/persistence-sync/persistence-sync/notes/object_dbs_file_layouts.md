# Object Databases / Transparent Persistence and File-System + Object-Storage Layouts for Recursive Document Trees (as of Oct 2026)

Context for the report writer: the user's framework has `Item` (get/set + change events), `List extends Item` (wraps arrays of Items), and `Page extends Item` (recursive, like Notion pages). He persists append-only JSONL delta logs on the local file system, streams them over websockets, wants a swappable `store` adapter, and likes the file system because S3/R2 buckets map onto it. He is open to Python.

Research note: the shared web-search budget ran out near the end of this task. A few planned look-ups (GemStone customer names, Actual Budget/Anytype layouts, the Delta Lake put-if-absent wording, the Pydantic contrast) were not done. They are listed under Gaps.

---

## Q1. What is the strongest long-lived analog to the Item/JSONL design (ZODB FileStorage), and what were its pain points?

### Takeaway
ZODB's FileStorage, from the late 1990s and still maintained (ZODB 6.3, April 2026), is almost the same design: a persistent base class whose attribute assignment marks the object dirty, plus one append-only transaction-log file, an in-memory oid→offset index, and periodic "pack" compaction. Its 25+ years of pain points are what to plan for: unsaved in-place mutation of plain containers, class names baked into the stored data (rename/migration pain, a painful Py2→Py3 conversion), opaque storage that other tools can't query, write conflicts on hot shared objects, pack/rebuild cost of one huge file, and a single-server bottleneck.

### Cited Findings
**How ZODB's transparent persistence works**
- Classes subclass `persistent.Persistent`, which hooks attribute access and update. Assigning an attribute marks the object changed, and changes are saved on transaction commit. — [ZODB docs: Writing persistent objects](https://zodb-docs.readthedocs.io/en/latest/guide/writing-persistent-objects.html)
- **Key gotcha:** mutating a plain mutable value (list, dict, set) does *not* mark the object changed. You must set `_p_changed = True` or use `PersistentList`, `PersistentMapping`, or BTrees. The docs recommend BTrees over PersistentMapping because they scale and handle conflicts better. — [ZODB docs](https://zodb-docs.readthedocs.io/en/latest/guide/writing-persistent-objects.html); also [Wikipedia: ZODB](https://en.wikipedia.org/wiki/Zope_Object_Database) ("Changes inside a list aren't noticed automatically")
- Special attributes: `_p_changed` (None = ghost, True = dirty, False = saved), `_p_oid` (unique id), `_p_serial` (revision tid), `_p_jar` (connection). `_v_` attributes are volatile and never saved. "Ghosts" are unloaded shells that load their state lazily on access, and the cache can turn saved objects back into ghosts to free memory. — [ZODB docs](https://zodb-docs.readthedocs.io/en/latest/guide/writing-persistent-objects.html)
- Only objects derived from Persistent are units of storage and atomicity. If a sub-object (e.g. "Wheel") isn't Persistent, two threads changing different wheels conflict on the parent. — [Wikipedia: ZODB](https://en.wikipedia.org/wiki/Zope_Object_Database)
- Chris McDonough (Pyramid/Zope dev, HN 2013 "Why I Like ZODB"): "It's best to keep object records small when using ZODB." Split large objects into several persistent objects, use BTrees instead of dicts to ease write conflicts, and plan object structure in advance. Write conflicts are "hairy to deal with." Large non-persistent structures get plain pickle's drawbacks (slow loading). The per-thread in-memory cache of live objects usually removes the need for Redis/memcached. — [mcdonc HN comments](https://grivy.duckdns.org/threads?id=mcdonc)

**FileStorage internals (the direct analog of his JSONL log)**
- FileStorage stores data in a single file that acts like a transaction log. New records are appended, and packing rewrites the file to free space. It keeps in-memory indexes plus `.index` and `.lock` side files. — [ZODB storages reference](https://zodb.org/en/latest/reference/storages.html)
- Each transaction record has a header (tid, length, status byte, user/description/extension) **and a redundant copy of the transaction length after it**. Status `'c'` (checkpoint flag) is set first and cleared at finish, so an interrupted commit is recognizable. Data records hold oid, tid, a previous-record pointer, and data or a backpointer. — [FileStorage source](https://zodb-docs.readthedocs.io/en/latest/_modules/ZODB/FileStorage/FileStorage.html)
- `.index` (oid → file offset) is saved via write `.index_tmp` → rename. On startup it is sanity-checked against the last few transactions. If it is missing or bad, the **whole data file is scanned to rebuild the index**. — [FileStorage source](https://zodb-docs.readthedocs.io/en/latest/_modules/ZODB/FileStorage/FileStorage.html)
- Crash recovery: scanning stops at a partial/invalid transaction, and in read-write mode the damaged tail is **truncated (after saving it to a `name.trN` file)**. Mid-file corruption (redundant lengths disagree) raises `CorruptedTransactionError` rather than being silently cut. — [FileStorage source](https://zodb-docs.readthedocs.io/en/latest/_modules/ZODB/FileStorage/FileStorage.html)
- Pack: write current records to `.pack`, rename the data file to `.old`, rename `.pack` → data file, rebuild index. `pack_keep_old` controls whether `.old` is kept. — [FileStorage source](https://zodb-docs.readthedocs.io/en/latest/_modules/ZODB/FileStorage/FileStorage.html)
- `pack(pack_time, referencesf)` discards non-current revisions as of pack time, **then garbage-collects objects unreachable from the root** (persistence by reachability). — [ZODB storages reference](https://zodb.org/en/latest/reference/storages.html)
- Blobs: FileStorage takes a `blob_dir`. Uncommitted blob data goes to a temp directory and "commits can then be done with a simple rename." — [ZODB storages reference](https://zodb.org/en/latest/reference/storages.html)
- Alternative "DirectoryStorage" kept one file per object revision and avoided rebuilding `Data.fs.index` after unclean shutdown. It suited small user counts. — [ZODB overview (Laurence Rowe)](https://zodb.org/en/stable/articles/ZODB-overview.html)

**Pain points documented**
- Write ConflictErrors under write-heavy loads, mainly from catalogue indexes (some indexes don't support conflict resolution). Zope retries a transaction up to 3 times. Mitigations deferred indexing (QueueCatalog) or offloaded it to Solr. — [ZODB overview](https://zodb.org/en/stable/articles/ZODB-overview.html)
- Schema changes lack enforced migrations ("can bite you later"). Undo is unreliable when indexes are involved. Non-transactional side effects (MailHost) can send duplicate emails, and external calls need a participating Data Manager. — [ZODB overview](https://zodb.org/en/stable/articles/ZODB-overview.html)
- Classes are stored by fully qualified name, so moving/renaming a class breaks stored objects unless you keep import aliases (which clutter code) or write migrations (`zope.generations`). Multi-client schema changes need a multi-step rollout. — [ZODB docs](https://zodb-docs.readthedocs.io/en/latest/guide/writing-persistent-objects.html); [Wikipedia](https://en.wikipedia.org/wiki/Zope_Object_Database)
- The Python 2→3 migration showed the cost of opaque pickles. Pickles encode Python-version-specific types, so a Py2 database can't be read by Py3 as-is, and "Python 3 will wrongly interpret a pickle created with Python 2 that contains non-ASCII characters." It needed the `zodbupdate --convert-py3` tool, packing to 0 days first (irreversibly losing history), and verification with `zodbverify`. Plone's own docs call the procedure "still work in progress" and warn that starting Py3 on the old DB "will destroy the database." — [Plone 6 docs: Migrate a ZODB from Python 2.7 to 3](https://6.docs.plone.org/backend/upgrading/version-specific-migration/upgrade-zodb-to-python3.html)
- Opaque storage: Newt DB (ZODB + RelStorage + Postgres) adds a read-only **JSON copy of each object in a JSONB column** so data is searchable and readable from non-Python apps, while still loading from the native format because "JSON is lossy." — [Newt DB architecture](https://newt-db.readthedocs.io/en/latest/how-it-works.html)
- Scaling: the GIL limits one Python process to one CPU, so the recommendation is one client per processor sharing a ZEO server. Cross-database references across partitioned storages cause problems. — [ZODB overview](https://zodb.org/en/stable/articles/ZODB-overview.html). ZEO is a single point of failure, and the alternatives are ZRS, ZeoRAID, RelStorage, and NEO. — [Wikipedia](https://en.wikipedia.org/wiki/Zope_Object_Database)
- RelStorage stores pickles in PostgreSQL/MySQL/Oracle with no ZEO server, but moves conflict resolution to the app server (worse worst case under latency). — [ZODB overview](https://zodb.org/en/stable/articles/ZODB-overview.html)

**Status/longevity**
- Created by Jim Fulton (Zope Corp) in the late 1990s, as a Persistent Object System during development of Principia, which became Zope. — [Wikipedia](https://en.wikipedia.org/wiki/Zope_Object_Database)
- ZODB 6.3 released April 14, 2026, requires Python ≥3.10 (3.10–3.14), runs on CPython and PyPy, "an ACID Transactional database." — [PyPI: ZODB](https://pypi.org/project/ZODB/)
- Durus (CNRI's MEMS Exchange team) is a simpler ZODB-like Python object store: single-threaded, client/server, read-optimized, aggressive client caches, clients see others' commits on `abort()`/`commit()`. Its default `FileStorage` is "an append-only journal with an on-disk index," and `pack()` removes garbage. `SqliteStorage` is experimental. Latest release Durus 4.3, Oct 1, 2024. — [Durus GitHub](https://github.com/nascheme/durus); [PyPI: Durus](https://pypi.org/project/durus)

### Inferences
- His design ≈ ZODB FileStorage with JSON in place of pickles and **per-page logs in place of one global Data.fs**. JSON avoids ZODB's worst long-term pain: opaque, language- and version-bound pickles with class paths baked in. He should still avoid storing JS class/constructor names as raw strings in records, or at least keep a type registry with aliases, because ZODB's rename pain is caused by exactly that.
- `List extends Item` is his answer to ZODB's "mutating a plain list isn't tracked" gotcha (PersistentList). Any place that stores a raw array/object inside an Item's value will reproduce that bug class. Enforce that nested mutable values are Items or immutable.
- Copy ZODB's crash-recovery tricks directly: (1) per-record length/checksum (ZODB stores length twice), (2) truncate a partial tail on open but save it aside first (`.trN`), (3) treat mid-file corruption as fatal rather than silently dropping data, (4) keep a rebuildable index/snapshot written via temp+rename, (5) a lock file for single-writer.
- mcdonc's "keep records small" plus the conflict-error history argue for **Page as the unit of persistence and conflict** (one log per page), with large collections inside a page split into their own Items or a BTree-like structure.
- Pack = GC by reachability from root. With a page tree he needs an equivalent: orphaned pages (deleted from parent's children) should be collectable, or he needs explicit tombstones.

### Gaps
- No quantitative data found on FileStorage's practical size ceilings (index RAM per object, pack time vs. file size). NEO figures (see Q6) are the nearest proxy.
- Did not find a single authoritative "lessons learned" retrospective from ZODB core maintainers. Pain points are assembled from docs, the overview article, Plone migration docs, and HN comments.

---

## Q2. Which other systems make "set a property and it's persisted" work, what did they learn, and which pattern (Active Record / Data Mapper / Unit of Work) fits an Item with a swappable store?

### Takeaway
Every successful transparent-persistence system detects changes on the object but **commits them through a separate transaction/session (Unit of Work)**: ZODB's transaction, Realm's write block, GemStone's commit, SQLAlchemy's Session. The ones that tied the object model to a vendor-hosted sync service (Realm/Atlas Device Sync) left users stranded when the service was retired (EOL Sept 30, 2025). For an Item with a swappable store, the best fit is Active-Record-style ergonomics (`item.set()`) on top of a Unit of Work + Identity Map, with the store as a thin Data Mapper/adapter.

### Cited Findings
**GemStone/S (Smalltalk object DB)**
- Persistence by reachability: "Persistence is established by attaching new objects to other persistent objects," all derived from a named root (AllUsers). Sessions work on a consistent snapshot, changes are private until commit, and commit checks for conflicts and refuses conflicting ones. — [GemStone/S 64 Programming Guide 3.7](https://docs.gemtalksystems.com/GemStone64/3.7.x/GS64-ProgGuide-3.7/1-IntroToGemStone.htm)
- Reduced-conflict (Rc) collection classes let concurrent adds to the same collection not conflict. It supports optimistic or pessimistic concurrency and explicit locks. A shared page cache means the repository isn't limited by RAM. — [GemStone Programming Guide](https://docs.gemtalksystems.com/GemStone64/3.7.x/GS64-ProgGuide-3.7/1-IntroToGemStone.htm)
- c2 wiki: GemStone gives "the illusion of an infinite amount of persistent, transactional RAM," then adds "For better or for worse." Business logic lives in the server, playing the role of stored procedures. — [c2 wiki: GemStone](https://c2wiki.gothdyke.mom/GemStone.html)

**Realm / Atlas Device Sync**
- MongoDB announced deprecation of Atlas Device Sync + Realm SDKs in September 2024. — [realm-js README](https://github.com/realm/realm-js); [MongoDB forum](https://mongodb.com/community/forums/t/device-sync-and-edge-server-are-deprecated/296035)
- Device Sync removal date: **September 30, 2025**. MongoDB's suggested alternatives: Ditto, PowerSync, ObjectBox, AWS AppSync, HiveMQ, Ably, Parse, Cedalo, or custom builds via partners. — [MongoDB Device Sync deprecation page](https://www.mongodb.com/docs/atlas/app-services/sync/device-sync-deprecation)
- MongoDB stopped active feature development on all SDKs, including non-sync parts ("keep the lights on"). A non-sync community build exists on npm and a `community` git branch, and MongoDB welcomed community maintainers. — [realm-js discussion #6884](https://github.com/realm/realm-js/discussions/6884)
- Community reaction: shock, a one-year window called inadequate, loss of trust, and no migration guidance for schemas/sync rules/users. — [MongoDB forum thread](https://mongodb.com/community/forums/t/device-sync-and-edge-server-are-deprecated/296035)

**ObjectBox, Isar, Hive**
- ObjectBox (vendor claims): embedded object-oriented NoSQL DB that "is not an ORM," with native object references/relations, ACID + MVCC, reactive observers, automatic schema migration, ObjectBox Sync, and a MongoDB connector. It runs on Java/Kotlin/Swift/Dart/C/C++/Go/Python. — [ObjectBox site](https://objectbox.io/mobile-database/)
- A Feb 2025 Flutter DB comparison matrix (hosted on greenrobot.org, the ObjectBox vendor, so biased) says Isar and Hive (same author) are "not maintained anymore" and marks Realm sync "Deprecated, End of life in Sep 2025." — [greenrobot matrix](https://greenrobot.org/wordpress/wp-content/uploads/2025_02_13flutter_databases_comparison_matrix.htm)

**GunDB (graph, real-time, references)**
- Nested objects are stored as separate nodes. Reading the parent returns "a link to the address," not the inline data, and you traverse with `.get()`. `.set()` adds nodes to an unordered collection. "GUN saves everything as a partial update." — [Gun wiki: Graph Guide](https://github.com/amark/gun/wiki/Graph-Guide)
- Jared Forsyth's evaluation: no native arrays (sets are unordered, sorted arrays experimental), per-attribute last-write-wins via a hybrid logical clock, no change history/undo, no schema validation, and it requires an active server. Built-in storage is flat files in Node and localStorage/IndexedDB in browsers. Code readability and documentation are poor. Production users include notabug and Iris. — [Jared Forsyth: Local-first database: gun.js](https://hn.jakechampion.name/reader/https://jaredforsyth.com/posts/local-first-database-gun-js)

**OrbitDB (append-only logs on IPFS)**
- Serverless P2P DB: IPFS (Helia) for storage, libp2p pubsub for sync, Merkle-CRDTs. All DB types (events, documents, keyvalue, keyvalue-indexed) are built on OpLog, "an immutable, cryptographically verifiable, operation-based CRDT." Eventually consistent. — [OrbitDB GitHub](https://github.com/orbitdb/orbitdb)

**Ink & Switch / Automerge (CRDT history lessons)**
- CRDT histories "pile up." Memory and disk became a real problem in the PushPin prototype, and truncation is hard because a collaborator may reconnect late. — [Ink & Switch: Local-first software](https://www.inkandswitch.com/essay/local-first/)

**Patterns (naming contrast)**
- Active Record: an object that "wraps a row in a database table or view," carrying both data and data-access logic. — [Fowler: Active Record](https://martinfowler.com/eaaCatalog/activeRecord.html)
- Data Mapper: a layer of mappers that moves data between objects and DB while keeping them independent. Objects "don't even know a database exists." It suits rich object models whose structure differs from the storage schema. — [Fowler: Data Mapper](https://martinfowler.com/eaaCatalog/dataMapper.html)
- Unit of Work: "keeps track of everything you do during a business transaction that can affect the database," then works out the needed writes. It avoids many small DB calls and long transactions. — [Fowler: Unit of Work](https://martinfowler.com/eaaCatalog/unitOfWork.html)
- SQLAlchemy Session = Unit of Work + Identity Map. Mapped attributes are instrumented so changes generate events the Session records. Pending changes are flushed before queries/commit (autoflush). There is one in-memory object per primary key, held weakly by default. Commit expires objects so they reload. — [SQLAlchemy Session basics](https://docs.sqlalchemy.org/en/20/orm/session_basics.html)
- Django (Active Record): "instantiating a model in no way touches your database," so you must call `save()`. `update_fields` limits columns written. Races like `x += 1; save()` lose updates, and the fix is relative updates with `F()` (an operation, not a value). — [Django model instance reference](https://docs.djangoproject.com/en/5.2/ref/models/instances/)
- Cloudflare Agents SDK (closest modern analog to "set state → persisted + broadcast"): `this.setState()` stores state in the Durable Object's SQLite and broadcasts it to all connected clients over WebSocket. `validateStateChange()` can reject changes, and `onStateChanged()` fires after store and broadcast. — [Cloudflare Agents: store and sync state](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/)

### Inferences
- Recommended shape: **Item = Active-Record-like facade** (`page.set('title', x)` works and emits a change event) → **a Unit of Work (per tick/microtask or explicit `store.transaction()`) collects dirty Items and their deltas** → **the `store` adapter is a Data Mapper/storage interface** that serializes deltas and snapshots to fs, R2, SQLite, or IndexedDB. This is ZODB's architecture (Persistent marks dirty → Connection/transaction → IStorage) and SQLAlchemy's (instrumented attrs → Session → engine).
- An **Identity Map** (one live Item instance per id per process) is needed once Pages reference each other. ZODB's connection cache and SQLAlchemy's identity map both exist for this reason.
- Deltas should be operations, not just values, wherever concurrent edits matter (Django's `F()` lesson, GunDB's per-attribute LWW, CRDT oplogs).
- Realm's lesson is about owning the sync and storage layer. His file-system/JSONL + swappable-store approach avoids vendor lock-in.
- GunDB and Notion both flatten nesting into nodes linked by id. The page tree should be stored as id-linked records, not as physically nested JSON (see Q3).

### Gaps
- Could not load the Realm SDK docs page that confirms writes must occur inside `realm.write()` and that managed objects are "live." This is widely known but unverified here.
- Pydantic contrast not researched. Pydantic is a validation/serialization library with no persistence; that is general knowledge, not sourced here.
- No sourced list of GemStone production customers (search budget exhausted).

---

## Q3. What's the cleanest way to map a nested page tree onto both a local directory and an R2/S3 bucket?

### Takeaway
Use a **flat, id-keyed key space with one "unit" per page**, where each page owns a small head/manifest pointer, a full-state snapshot object, and immutable, sequentially numbered delta-segment objects. Express the hierarchy as data (parentId + ordered children ids, as Notion does), not as nested directories. This is the same shape used by Delta Lake (`_delta_log/000…N.json` + checkpoints + `_last_checkpoint`), Figma (S3 checkpoints + journal), automerge-repo (snapshot + incremental chunks), Litestream (LTX segments + compaction + lease), and Cloudflare's own DO storage internals. It works on a local disk and on R2/S3, which have no append on standard buckets, but now have strong consistency and conditional (CAS) writes.

### Cited Findings
**Object-store constraints (status Oct 2026)**
- S3 has had strong read-after-write consistency for PUTs, overwrites, and LIST since Dec 1, 2020, at no extra cost. — [AWS What's New, Dec 2020](https://aws.amazon.com/about-aws/whats-new/2020/12/amazon-s3-now-delivers-strong-read-after-write-consistency-automatically-for-all-applications)
- S3 conditional writes: `If-None-Match: *` (write-once) launched Aug 2024, and `If-Match: <ETag>` (compare-and-swap) launched Nov 2024, plus bucket-policy enforcement via `s3:if-match`/`s3:if-none-match`. — [Simon Willison, Nov 26 2024](https://simonwillison.net/2024/Nov/26/s3-conditional-writes)
- Supported on PutObject, CompleteMultipartUpload, and CopyObject. Concurrent conditional writes to the same key: first finisher wins, the others get 412. 409 if a delete races. `If-Match` on a missing object → 404. — [S3 User Guide: conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html)
- AWS (June 2025) promotes If-None-Match for write-once dataset files and If-Match for a shared registry/metadata file as a way to build multi-writer apps "without external locking." — [AWS Storage Blog](https://aws.amazon.com/blogs/storage/building-multi-writer-applications-on-amazon-s3-using-native-controls)
- **Append is only on S3 Express One Zone directory buckets** (announced Nov 2024): PutObject with `x-amz-write-offset-bytes` = current size, up to 10,000 parts per object (reset via CopyObject), each append billed as a PUT. — [S3 docs: appending to objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/directory-buckets-objects-append.html); [AWS What's New, Nov 2024](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-express-one-zone-append-data-object)
- Atomic `RenameObject` (June 18, 2025) is also Express One Zone only. — [AWS What's New, June 2025](https://aws.amazon.com/about-aws/whats-new/2025/06/amazon-s3-express-one-zone-atomic-renaming-objects-api)
- S3 Express One Zone prices (Apr 10, 2025, us-east-1): $0.11/GB-month, PUT $0.00113/1,000, GET $0.00003/1,000, upload $0.0032/GB, retrieval $0.0006/GB. — [AWS News Blog](https://aws.amazon.com/blogs/aws/up-to-85-price-reductions-for-amazon-s3-express-one-zone)
- S3 Standard us-east-1 (secondary source, Oct 2026): $0.023/GB-month, PUT/COPY/POST/LIST $0.005/1,000, GET $0.0004/1,000, egress $0.09/GB after 100 GB free. — [Upstash: S3 pricing 2026](https://upstash.com/blog/aws-s3-pricing-explained-2026). Standard-IA / One Zone-IA bill a 128 KB minimum per object (bad for tiny delta objects). — [AWS S3 pricing](https://aws.amazon.com/s3/pricing/)
- **R2**: strongly consistent reads-after-writes, metadata, deletes, and listings. Concurrent writes to the same key: last to complete wins. `If-Match`/`If-None-Match` are checked atomically, and with concurrent `If-None-Match: *` only one succeeds. Caveat: a 404 doesn't prove an in-flight earlier write won't commit later. Custom-domain caching relaxes consistency (Worker bindings and the S3 API bypass the cache). — [R2 consistency](https://developers.cloudflare.com/r2/reference/consistency/)
- R2 Workers binding: `onlyIf` (etagMatches/etagDoesNotMatch/uploadedBefore/After). A failed conditional `put()` returns null. `list()` supports prefix/delimiter/cursor with limit ≤1000. — [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- R2 pricing: $0.015/GB-month standard, Class A $4.50/M, Class B $0.36/M, egress free, free tier 10 GB / 1M A / 10M B. **ListObjects is Class A** (same price as PUT). HeadObject/GetObject are Class B. Deletes are free. A PutObject returning 412 is still billed as Class A. — [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- R2 release notes for 2025–2026 show no append feature (only dashboard changes and CRC-64/NVME checksums). — [R2 release notes](https://developers.cloudflare.com/r2/platform/release-notes/)

**Proven segment + snapshot layouts on object storage**
- **Delta Lake**: `_delta_log/` holds one newline-delimited JSON file per commit named by 20-digit zero-padded version (`00000000000000000000.json`). Parquet checkpoints capture full state so readers don't replay everything. `_last_checkpoint` is a pointer file "so readers can avoid listing a large log directory." — [Delta PROTOCOL.md](https://www.github.com/delta-io/delta/blob/master/PROTOCOL.md)
- **Figma**: originally in-memory state with S3 checkpoints every ~30–60 s (up to ~1 min loss). They added a DynamoDB journal with incrementing sequence numbers. Recovery = latest checkpoint + replay of higher-sequence journal entries, and a lock table enforces one writer per file. — [Figma: Making multiplayer more reliable](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **automerge-repo**: keys are `[docId, "snapshot"|"incremental", id]`. An incremental chunk's id is the hash of its change, and a snapshot's id is the document heads. Compaction writes a snapshot, then deletes only chunks it has loaded, so it is lock-free and safe with concurrent writers. Adapter interface: `load`, `save`, `remove`, `loadRange(prefix)`, `removeRange(prefix)`. — [Automerge storage docs](https://automerge.org/docs/under-the-hood/storage)
- **Litestream v0.5**: LTX files = sorted, transaction-aware page changesets. Compaction levels are 30 s → 5 min → 1 h, and point-in-time restore needs ~a dozen files. A monotonically increasing TXID replaced "generations," with one replica per DB. — [Fly.io: Litestream v0.5.0](https://fly.io/blog/litestream-v050-is-here/). It uses S3 conditional writes to implement a time-based single-writer lease (`lock.json` with generation counter, expiry, owner ID; losers get 412). — [Fly.io: Litestream Revamped](https://fly.io/blog/litestream-revamped/); [Litestream S3 advanced guide](https://litestream.io/guides/s3-advanced/)
- **turbopuffer**: each namespace has its own object-storage prefix. Each write adds a WAL file, and concurrent writes are batched to **one WAL entry per second per namespace**, with a CAS commit point. p50 165 ms for a 500 kB write. Object-store PUT p50 100 ms / p99 195 ms. — [turbopuffer architecture](https://turbopuffer.com/docs-md/architecture.md)
- **y-s2** (Yjs rooms): updates go to a durable stream, checkpoints go to R2 with the last sequence number in metadata, the stream prefix is trimmed after a checkpoint, and a lease + fencing token ensures a single checkpointer. — [s2.dev: durable Yjs rooms](https://s2.dev/blog/durable-yjs-rooms)
- **Cloudflare DO SQLite internals** do the same thing for you: each commit goes to 5 followers in different data centers (ack on 3), change batches go to object storage every 10 s or 16 MB, and full snapshots are uploaded when accumulated logs exceed DB size. — [Cloudflare blog: SQLite in Durable Objects](https://blog.cloudflare.com/sqlite-in-durable-objects)

**Tree modeling and how apps settle file layouts**
- Notion: everything is a block with a UUID, a type, properties, `content` (an ordered list of child ids), and a `parent` pointer, which exists mainly for permissions because a block can appear in multiple content arrays. Edits are operations on single records grouped into transactions. The client applies them locally, queues them in IndexedDB/SQLite until the server accepts, and stays subscribed via WebSocket. — [Notion: data model](https://www.notion.com/blog/data-model-behind-notion)
- Logseq (file graphs): adding a block can require rewriting the whole file, renaming a page updates every referencing file, and multi-client sync caused data loss. Large graphs performed poorly, and real-time collaboration on Markdown files is "extremely challenging." — [Logseq: Why the database version](https://discuss.logseq.com/t/why-the-database-version-and-how-its-going/26744)
- Obsidian: a vault is a folder (with subfolders) of plain Markdown. The `.obsidian` folder holds settings, and `workspace.json` changes whenever you open a file (exclude from git). An IndexedDB metadata cache can fall out of sync and be rebuilt. External edits are auto-refreshed. Nesting vaults is discouraged because links are vault-local. — [Obsidian: How Obsidian stores data](https://obsidian.md/help/data-storage)
- Jupyter: one JSON file per notebook (`metadata`, `nbformat`, `cells`), with outputs embedded inline. — [nbformat docs](https://nbformat.readthedocs.io/en/latest/format_description.html)
- VS Code-family editors keep UI/extension state in a SQLite key-value DB (`state.vscdb`, `ItemTable`). In Cursor (a VS Code fork) it grew from 3.1 GB to 97 GB because local chat/agent history is never auto-compacted. Deleting the file breaks chats. — [Cursor forum](https://forum.cursor.com/t/state-vscdb-grew-from-3-1-gb-97-gb-macos/166013)
- Git: each loose object is a zlib file at `.git/objects/xx/<rest-of-hash>`. Because many small loose files are wasteful, git packs them into packfiles with delta compression plus an `.idx` offset index (on `git gc`, push, or too many loose objects). — [Pro Git: Packfiles](https://git-scm.com/book/en/v2/Git-Internals-Packfiles)
- Whole-file sync (Dropbox/Drive) yields conflicts that "need to be merged manually." — [Ink & Switch: Local-first](https://www.inkandswitch.com/essay/local-first/)

**Crash safety for local appends and snapshots**
- Atomic replace: create temp file on the same FS → write → fsync temp → rename over target → **fsync the containing directory**. Write errors may only surface at fsync/close, so check them. — [LWN: Ensuring data reaches disk](https://lwn.net/Articles/457667/)
- The 2009 ext4 delayed-allocation episode (zero-length files after crash when apps did write+rename without fsync) shows POSIX gives no crash-atomicity for rename without fsync. ext4 added a default heuristic from 2.6.30. — [LWN comments on ext4 data loss](https://lwn.net/Articles/323436/)
- ALICE (OSDI 2014) studied 11 apps (LevelDB, GDBM, LMDB, SQLite, PostgreSQL, HSQLDB, Git, Mercurial, HDFS, ZooKeeper, VMware Player) and found 60 static vulnerabilities and >4,000 failing crash states. 27 vulnerabilities came from assuming in-order persistence. 3 apps assumed content-atomic appends. Persist-before-rename fixed only 3. "It is risky to assume that any particular property will be supported by all file systems." — [The Morning Paper on ALICE](https://blog.acolyer.org/2016/02/11/fs-not-equal/); [USENIX abstract](https://www.usenix.org/node/186195)

### Inferences
**Recommended layout (same keys locally and in R2):**
```
<root>/
  pages/<pageId>/head.json                  # {snapSeq, lastSeq, segments:[...], schema} — CAS-updated
  pages/<pageId>/snap/<seq:012>.json        # full page state (own props + ordered child ids + parentId)
  pages/<pageId>/log/<firstSeq:012>.jsonl   # immutable sealed segment of deltas firstSeq..k
  pages/<pageId>/log/open.jsonl             # LOCAL ONLY: the live append file
  blobs/<sha256>                            # content-addressed attachments (git/IPFS style)
  tree/roots.json                           # top-level page ids (or a root Page)
```
- **Flat ids, not nested directories, for hierarchy.** On R2/S3 a "move" is copy+delete per key (rename is Express One Zone only), so nested-path layouts make moving a subtree O(subtree size) in requests and non-atomic. Logseq's rename-rewrites-many-files pain is the local version of the same problem. Keep `parentId` + ordered `children[]` in the page record (the Notion model), which makes a move two small record edits. If he wants Obsidian-like human browsing, generate a nested Markdown/JSON **export mirror** as a derived, rebuildable view.
- **Locally**: append deltas to `log/open.jsonl` (one JSON object per line with `seq` and a short checksum/length). fsync per batch (group commit). On open, truncate a torn last line but save it aside (ZODB's `.trN` trick). Write snapshots and `head.json` via temp → fsync → rename → fsync dir.
- **On R2/S3 (no append)**: every N ms / N ops, seal the buffered deltas into a new immutable `log/<firstSeq>.jsonl` with `If-None-Match: *` (a second writer can't create the same segment, which gives Delta-style mutual exclusion and fencing). Then update `head.json` with `If-Match: <etag>` (CAS). Readers do GET head → GET snapshot → GET listed segments, with **no LIST on the hot path** (LIST is Class A on R2; Delta uses `_last_checkpoint` for the same reason). Zero-pad sequence numbers so prefix listing is ordered when needed for recovery.
- **Compaction**: write a new snapshot → CAS head to point at it → delete superseded segments (deletes are free on R2). Delete only segments you've folded in (automerge-repo rule) to stay safe with concurrent writers. Keep old snapshots/segments for a retention window if you want history (Litestream/DO PITR do 30 days).
- **Cost sanity check (calculation from R2's $4.50/M Class A)**: one PUT per delta at 1 delta/s for 8 h/day ≈ 28,800 PUTs/day ≈ 864k/month ≈ **$3.90/month per continuously active page**. Batching to one segment per 10 s cuts that to ≈ $0.39. A snapshot every 5 min of activity adds ≈ $0.13. On S3 Standard ($5/M PUT) the numbers are similar. This is why turbopuffer batches to 1 WAL object/s/namespace and DO batches every 10 s/16 MB.
- **Single writer per page** makes everything simpler: either a lease object with conditional writes (Litestream's `lock.json`, Figma's lock table) or a Durable Object per page/workspace as the natural single writer.
- **Swappable store adapter**: model it on automerge-repo's interface (`load`, `save`, `remove`, `loadRange(prefix)`, `removeRange(prefix)`) plus optional `saveIfAbsent` and `saveIfMatch(etag)`. That interface maps cleanly onto fs (paths), R2/S3 (keys + conditional headers), IndexedDB, and a SQLite `kv(key PRIMARY KEY, value BLOB)` table.
- One file per Item (git-loose-object style) is the worst fit for buckets (PUT per item, LIST costs, small-file overhead). Git itself packs loose objects. A single global log (ZODB Data.fs style) is the worst fit for R2 (no append, whole-file rewrite on pack). **Per-page log + snapshot is the sweet spot.**

### Gaps
- Could not confirm from the Delta protocol excerpt the exact wording of the "atomic put-if-absent for commit files" requirement. That section wasn't in the fetched portion.
- Found no evidence of append support on S3 general-purpose buckets or R2 as of Oct 2026. Absence in release notes is not proof.
- No authoritative per-object minimum billing info for R2 Standard (the pricing page doesn't mention one).

---

## Q4. When does SQLite (local or Durable Object) beat JSONL files?

### Takeaway
SQLite wins once you need any of these: crash-safe multi-record transactions without hand-rolling fsync protocols, many small records (it is faster and denser than one-file-per-record), indexed queries across pages (backlinks, search, "children of X"), or a hosted single-writer per document (Durable Object SQLite: GA April 2025, 10 GB per object, 30-day point-in-time recovery, websocket hibernation). JSONL wins for human readability, git diffs, trivial append, and direct 1:1 mapping to bucket objects. A common hybrid is SQLite as the working store with an `ops` table + a `pages` JSON(B) column, exported or streamed to JSONL/R2 snapshots.

### Cited Findings
- SQLite reads/writes ~10 KB blobs **~35% faster** than individual files via fread/fwrite and uses **~20% less disk** (filesystem block padding). With mmap + blob API it was ~2x faster on Mac/Android and ~10x on Windows. Writes are 5–15x slower than reads for both. Caveats: cold cache and hardware variance. — [SQLite: 35% Faster Than the Filesystem](https://www2.sqlite.org/fasterthanfs.html)
- SQLite as an application file format: atomic transactions even across power loss, continuous saving, incremental updates (only changed parts written), coordinated concurrent access (many readers, serialized writers), SQL queryability with indexes, and backward-compatible extensibility (format stable since 2004). — [SQLite: Application file format](https://sqlite.org/appfileformat.html)
- SQLite's atomic commit relies on a journal written and flushed before the DB, a commit point marked by a single atomic delete, and checksums. It assumes fsync is honest (warning that some drives lie). — [SQLite: Atomic commit](https://sqlite.org/atomiccommit.html)
- Hand-rolled crash consistency is error-prone: 60 vulnerabilities across 11 mature apps in the ALICE study. — [The Morning Paper on ALICE](https://blog.acolyer.org/2016/02/11/fs-not-equal/)
- SQLite JSONB (from 3.45.0): binary JSON stored as a BLOB, 5–10% smaller, processed in less than half the CPU of text JSON. — [SQLite JSONB](https://sqlite.org/jsonb.html)
- **Durable Objects SQLite**: GA on 2025-04-07, 10 GB per object, available on the Free plan. — [DO release notes](https://developers.cloudflare.com/durable-objects/release-notes/). Limits: 2 MB max row/value, 100 columns, 100 KB SQL statement, 100 bound params, unlimited objects. — [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits)
- DO SQL API is synchronous ("No awaits!"). Output gates hold responses until writes are durable. 30-day point-in-time recovery is on by default. Design advice: "scale out, not up," one DO per document/user (single-threaded). SQLite must be chosen at class creation. — [Cloudflare blog: SQLite in DOs](https://blog.cloudflare.com/sqlite-in-durable-objects)
- DO pricing (Paid): rows read 25B/month included then $0.001/M. Rows written 50M/month included then $1.00/M. Storage 5 GB-month included then $0.20/GB-month. Free plan: 5M rows read/day, 100k rows written/day, 5 GB. Storage billing targeted to start Jan 7, 2026. Requests $0.15/M after 1M. **Incoming WebSocket messages billed 20:1** (100 messages = 5 requests), and outgoing messages are free. — [DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing); [Changelog: SQLite storage billing](https://developers.cloudflare.com/changelog/2026-01-07-durable-objects-sqlite-storage-billing)
- WebSocket Hibernation: the DO is evicted while clients stay connected, so no duration charges accrue while hibernating. `serializeAttachment` holds ≤16,384 bytes per connection. Pings are auto-answered without waking. — [DO WebSockets best practices](https://developers.cloudflare.com/durable-objects/best-practices/websockets/). Max WebSocket message raised to 32 MiB (2025-10-25). — [DO release notes](https://developers.cloudflare.com/durable-objects/release-notes/)
- Litestream replicates local SQLite to S3/R2-style storage (LTX segments + compaction + lease). v0.5.0 shipped around Oct 2025. — [Fly.io: Litestream v0.5.0](https://fly.io/blog/litestream-v050-is-here/). A post titled "Hold Off on Litestream 0.5.0" urged caution at release (contents not reviewed here). — [mtlynch.io](https://mtlynch.io/notes/hold-off-on-litestream-0.5.0). LiteFS needed Consul for leader election, which likely hurt adoption, and its ideas are moving into Litestream. — [Fly.io: Litestream Revamped](https://fly.io/blog/litestream-revamped/)
- Turso: database-per-tenant ("as many databases as you need – one or more per tenant"), with embedded replicas for local reads. — [Turso multi-tenancy](https://turso.tech/multi-tenancy). libSQL (C fork) is production. The Rust rewrite "Turso Database" (ex-Limbo) with MVCC concurrent writes was "not production-ready yet" as of Apr 2026. — [OpenReplay: Turso evolution](https://blog.openreplay.com/turso-rust-sqlite-evolution/)
- Browser: Notion runs SQLite in WASM persisted via OPFS. A SharedWorker elects one active tab holding the only connection (multi-tab writes had corrupted DBs under the OPFS VFS). Page navigation was 20% faster, and 28–33% faster in Australia/China/India. — [Notion: WASM SQLite](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite)
- Downsides seen in practice: Logseq DB users "can't hand-edit the underlying files" and get export only. — [Kompozy: Logseq 2.0 DB beta](https://kompozy.io/news/logseq-2-0-db-version-beta). An unbounded SQLite KV state file grew to 97 GB in Cursor. — [Cursor forum](https://forum.cursor.com/t/state-vscdb-grew-from-3-1-gb-97-gb-macos/166013)

### Inferences
- **Stay with JSONL when:** single writer per page, pages are moderate (≲ a few MB of state), you value `cat`/`grep`/git-diffability and 1:1 mapping to R2 objects, and queries are "load one page and its children." Do the Q1/Q3 crash hygiene (per-line checksums, torn-tail truncation, temp+rename snapshots).
- **Switch to SQLite (local) when:** you need cross-page queries (backlinks, full-text, "all pages tagged X"), multi-page atomic operations (moving a page = edit two parents + child atomically), or thousands of tiny Items where file-per-item overhead bites. Suggested schema: `pages(id PK, parent_id, sort_key, state JSONB, snap_seq)`, `ops(page_id, seq, op JSONB, ts, PRIMARY KEY(page_id, seq))`, plus indexes. Replicate with Litestream, or keep exporting per-page snapshots/segments to R2 so buckets still mirror the data.
- **Use a Durable Object (SQLite) per page or per workspace when** he wants a hosted, authoritative single writer with websockets. It already matches his stream-over-websockets model (Agents SDK `setState` and tldraw sync are existence proofs). Watch the 2 MB row cap (store ops in rows, not whole pages in one row, if pages get large) and rows-written billing ($1/M past 50M/month: 1 row per delta is cheap at human typing rates).
- SQLite's internal approach (WAL → batches → snapshots) is the same segment+snapshot pattern he would hand-build on R2. The question is whether to own that code (JSONL + R2) or rent it (DO SQLite/Litestream).

### Gaps
- No benchmark found comparing append-only JSONL vs SQLite inserts for op-log workloads specifically.
- Whether DO "rows written" counts index updates was not verified.

---

## Q5. Simplifying concessions: simple layouts people commonly use, what each gives up, and when you don't need more

### Takeaway
Many production systems start, and some stay, with one of three simple layouts: (a) one JSON/Markdown file per document, overwritten atomically; (b) one SQLite file; (c) periodic snapshot objects in a bucket with no log. Each is fine for single-writer, human-paced editing with small documents. Each gives up durability-between-saves, history, or human-editability, and you add a delta log only when you need sub-second durability, multi-writer merging, or undo/history.

### Cited Findings
- **(a) One file per document (snapshot overwrite).** Jupyter stores each notebook as one JSON file with outputs embedded. — [nbformat](https://nbformat.readthedocs.io/en/latest/format_description.html). Obsidian stores each note as a plain Markdown file in a folder vault. — [Obsidian data storage](https://obsidian.md/help/data-storage). Costs: adding a block can rewrite the whole file, renames cascade, and multi-client file sync caused data loss in Logseq. — [Logseq](https://discuss.logseq.com/t/why-the-database-version-and-how-its-going/26744). Whole-file sync conflicts must be merged manually. — [Ink & Switch](https://www.inkandswitch.com/essay/local-first/). Correct overwrite needs temp+fsync+rename+dir-fsync. — [LWN](https://lwn.net/Articles/457667/)
- **(b) Single SQLite file.** Used by Logseq DB ("canonical source of truth"). — [Kompozy](https://kompozy.io/news/logseq-2-0-db-version-beta). Also VS Code-family state (`state.vscdb`). — [Cursor forum](https://forum.cursor.com/t/state-vscdb-grew-from-3-1-gb-97-gb-macos/166013). Also the Notion client cache. — [Notion WASM SQLite](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite). Gives up hand-editable files (Logseq DB users get export only), and you need Litestream or a DO to get it into a bucket. In the browser, multi-tab access needs coordination (Notion's SharedWorker). Unbounded growth must be managed (Cursor's 97 GB).
- **(c) Snapshot objects in a bucket, no log.** Figma originally checkpointed in-memory file state to S3 every ~30–60 s, accepting up to ~1 minute of loss and write spikes on redeploy, before adding a journal. — [Figma](https://www.figma.com/blog/making-multiplayer-more-reliable/). tldraw sync's older approach stored room snapshots in R2, and the current template persists to DO SQLite with a fallback that migrates from R2 once. — [tldraw sync docs](https://tldraw.dev/docs/sync)
- **Snapshot + log without building it yourself:** DO SQLite gives a 30-day PITR and internal WAL batching for free. — [Cloudflare blog](https://blog.cloudflare.com/sqlite-in-durable-objects)

### Inferences
| Layout | Gives up | Good enough when |
|---|---|---|
| One JSON file per page, debounced atomic overwrite (temp→fsync→rename) | History/undo across sessions, the edits between saves (debounce window), concurrent-writer merging (last writer wins whole file), and large-doc efficiency (rewrite whole file per save) | Single user/writer per page, pages < ~1 MB, losing a few seconds on crash is acceptable. On R2 add `If-Match` on overwrite to detect clobbering. |
| Single SQLite file (local) | Human-readable, git-diffable files; direct bucket mapping (needs Litestream/export); easy multi-tab browser access | One machine or one server process owns the data and you want queries + transactions. Pair with Litestream for off-site copies. |
| Snapshot objects in R2, no log | Durability between snapshots, history, cheap tiny edits (each save = full-object PUT) | Low edit rates, small docs, and a server (or DO) holding live state in memory, i.e. Figma's original model. Costs ≈ $4.50 per million saves on R2. |
| JSONL delta log per page + periodic snapshot (his current design) | Simplicity (needs compaction, torn-tail handling, head pointer) | Needed for streaming deltas to clients, undo/history, sub-second durability, or multi-writer merging. |
- He can keep the delta-log design and still take these concessions: (1) a single writer per page (lease or DO) removes most conflict machinery; (2) "snapshot on idle, log only while active" bounds log growth; (3) treat the log as disposable after compaction unless history is a feature.

### Gaps
- No first-hand data found on the share of production apps using each simple layout. The examples are illustrative, not a survey.

---

## Q6. Named companies/products using each system or layout, and how

### Takeaway
The segment + snapshot pattern on object storage is used by Figma, Delta Lake/Databricks, turbopuffer, Litestream, automerge-repo, and Cloudflare's own DO storage. Transparent object persistence in production is mostly Zope/Plone/Nexedi (ZODB), GemStone/Smalltalk shops, and mobile DBs (ObjectBox, formerly Realm). File-per-doc is Obsidian/Jupyter, and single-SQLite is Logseq DB, VS Code/Cursor, and the Notion client.

### Cited Findings
- **ZODB**: bundled with the Zope application server. — [Wikipedia](https://en.wikipedia.org/wiki/Zope_Object_Database). Plone's backend docs cover migrating Plone sites' ZODB to Python 3. — [Plone 6 docs](https://6.docs.plone.org/backend/upgrading/version-specific-migration/upgrade-zodb-to-python3.html). **Nexedi** runs ZODB on its own distributed storage **NEO**, including its internal ERP5 instance (migrated Oct 20, 2015) and shacache.org (2011). One NEO server with 60 Zope instances stores 83,724 GB, "very stable" at 1+ TB, with tests to 150 TB. A known bottleneck: replication too slow for a 20 TB out-of-date node. — [NEO (Nexedi)](https://neo.nexedi.com/). Newt DB layers ZODB on Postgres with a JSONB mirror. — [Newt DB](https://newt-db.readthedocs.io/en/latest/how-it-works.html)
- **Durus**: built by CNRI's MEMS Exchange team for Python-powered websites. — [Durus GitHub](https://github.com/nascheme/durus)
- **GemStone/S**: commercial Smalltalk object DB from GemTalk Systems, with clients often in a VisualWorks image. — [GemStone docs](https://docs.gemtalksystems.com/GemStone64/3.7.x/GS64-ProgGuide-3.7/1-IntroToGemStone.htm); [c2 wiki](https://c2wiki.gothdyke.mom/GemStone.html)
- **Realm → successors**: MongoDB's official migration targets include Ditto, PowerSync, ObjectBox, and AWS AppSync. — [MongoDB deprecation page](https://www.mongodb.com/docs/atlas/app-services/sync/device-sync-deprecation). ObjectBox claims use in BMW cars (vendor matrix claim). — [greenrobot matrix](https://greenrobot.org/wordpress/wp-content/uploads/2025_02_13flutter_databases_comparison_matrix.htm)
- **GunDB**: notabug and Iris named as production users. — [Jared Forsyth](https://hn.jakechampion.name/reader/https://jaredforsyth.com/posts/local-first-database-gun-js)
- **Figma**: in-memory multiplayer server, S3 checkpoints, and a DynamoDB journal. 95% of edits saved within 600 ms, >2.2B changes journaled/day, p99 flush < 1 s. Validated by replaying ~400K checkpoints byte-identically. — [Figma blog](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **Notion**: block records with parent pointer + child-id arrays, operation transactions, WebSocket subscriptions. Client-side SQLite on desktop/mobile and (2024) browser via WASM/OPFS. — [Notion data model](https://www.notion.com/blog/data-model-behind-notion); [Notion WASM SQLite](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite)
- **tldraw**: one Durable Object per room, room state in DO SQLite (`SQLiteSyncStorage`), assets in R2, and earlier R2 room snapshots. — [tldraw sync docs](https://tldraw.dev/docs/sync)
- **Cloudflare Agents SDK**: agent state persisted in DO SQLite and synced to clients via WebSocket. — [Cloudflare Agents docs](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/)
- **Logseq**: split (announced ~May 2026) into **Logseq OG** (Markdown file graphs, security/maintenance fixes only, "Markdown will always be supported through Logseq OG") and **Logseq** (SQLite DB graphs, main line, E2E-encrypted sync). — [Logseq announcement](https://logseq.io/p/e3YDyX5AYr). Logseq 2.0 Beta (DB) released July 13, 2026, and RTC sync is paid/invite-only alpha. — [Kompozy](https://kompozy.io/news/logseq-2-0-db-version-beta)
- **Obsidian**: Markdown vault folders plus an IndexedDB metadata cache. — [Obsidian help](https://obsidian.md/help/data-storage). **Jupyter**: one JSON per notebook. — [nbformat](https://nbformat.readthedocs.io/en/latest/format_description.html). **VS Code/Cursor**: SQLite `state.vscdb`. — [Cursor forum](https://forum.cursor.com/t/state-vscdb-grew-from-3-1-gb-97-gb-macos/166013). **Git**: content-addressed loose objects + packfiles. — [Pro Git](https://git-scm.com/book/en/v2/Git-Internals-Packfiles)
- **Delta Lake** (Databricks' open table format): NDJSON commit objects + Parquet checkpoints in object storage. — [Delta PROTOCOL.md](https://www.github.com/delta-io/delta/blob/master/PROTOCOL.md)
- **turbopuffer**: object storage as source of truth with per-namespace WAL objects batched at 1/s. — [turbopuffer architecture](https://turbopuffer.com/docs-md/architecture.md)
- **Litestream** (Ben Johnson / Fly.io): SQLite → S3-compatible storage via LTX segments, compaction, and a conditional-write lease. — [Fly.io](https://fly.io/blog/litestream-revamped/)
- **Turso**: SQLite database-per-tenant platform (libSQL). — [Turso](https://turso.tech/multi-tenancy)
- **y-s2 (S2)**: Yjs rooms as stream + R2 checkpoints. — [s2.dev](https://s2.dev/blog/durable-yjs-rooms)

### Inferences
- Figma's journey (snapshots only → snapshots + journal with a single-writer lock) is the closest large-scale precedent for his evolution path. Delta Lake is the closest precedent for "NDJSON log files as bucket objects + checkpoints + pointer file." tldraw/Agents SDK are the closest precedents for "DO per document + websockets."

### Gaps
- No sourced named GemStone customers, Realm-local-only adopters after EOL, or OrbitDB production users (search budget exhausted).
- turbopuffer's architecture page names no customers. Customer names (e.g. reports of Cursor using it) were not verified here.
- Delta Lake's adopter list was not researched beyond its Databricks origin.
