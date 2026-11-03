# Homegrown persistent, streaming object model on append-only delta logs: engineering notes and build-vs-buy evidence

Context: vanilla-JS `Item` / `List extends Item` / `Page extends Item` tree with get/set and change events. Deltas are appended to JSONL, replayed on load, and streamed over a homegrown websocket server. The `store` adapter should be swappable (JSONL → SQLite/cloud/S3-R2). Research is current as of late October 2026. GitHub star counts and npm download stats are out of scope; another researcher covers them.

---

## 1. Delta/op formats: JSON Patch, JSON Merge Patch, MST patches, Automerge/Yjs ops, Figma-style property LWW. Should ops be ID-addressed or path-addressed?

### Takeaway
Path-addressed formats such as JSON Patch and MST patches address array elements by numeric index. That works for a single writer applying ops strictly in order, but it breaks once ops are concurrent, reordered or rebased. Every production collaborative system examined (Figma, Linear, Automerge, Yjs, Excalidraw) addresses objects by a stable ID and changes properties on those objects. For this framework, use ID-addressed `{id, key, value}` property ops plus explicit create/delete ops, and treat paths only as a derived view.

### Cited Findings
**JSON Patch (RFC 6902)**
- The operations are "add", "remove", "replace", "move", "copy" and "test"; any other op value is an error. Operations "are applied sequentially in the order they appear in the array," and evaluation stops at the first error, in which case the whole patch fails. — [RFC 6902](https://www.rfc-editor.org/rfc/rfc6902)
- Index semantics: "If the target location specifies an array index, a new value is inserted into the array at the specified index," so later elements shift. "-" appends to the end. For move, "The "from" location MUST NOT be a proper prefix of the "path" location". "test" checks that the target equals a given value, and can serve as a precondition. — [RFC 6902](https://www.rfc-editor.org/rfc/rfc6902)
- The list-index pitfall: Weidner calls the alternative to stable positions *index transformations*. They need many edge cases (for example insert versus delete at the same index), and he recommends "immutable positions" instead, meaning ordered IDs that move with each element. — [Weidner, Architectures for Central Server Collaboration (2024)](https://mattweidner.com/2024/06/04/server-architectures.html)

**JSON Merge Patch (RFC 7396)**
- "Null values in the merge patch are given special meaning to indicate the removal of existing values in the target." Because of this, an explicit null cannot be stored. "it is not possible to patch part of a target that is not an object," so arrays are replaced wholesale. The RFC also says "The merge patch format is not appropriate for all JSON syntaxes." — [RFC 7396](https://www.rfc-editor.org/rfc/rfc7396)

**MobX-State-Tree patches**
- "Patches are constructed according to JSON-Patch, RFC 6902", using ops replace/add/remove with path and value. "Patches are emitted immediately when a mutation is made and don't respect transaction boundaries." Paths are relative to where the listener is attached. "A single mutation can result in multiple patches, for example when splicing an array." "Patches can be reverse applied, which enables many powerful patterns like undo / redo." — [MST Patches docs](https://mobx-state-tree.js.org/concepts/patches)

**Automerge**
- Each operation has an ID formed from "a counter and the actorId that generated it," written for example `'1@01234567'`. When the same property is assigned concurrently, Automerge picks a deterministic "winner" by operation ID rather than wall-clock time, ordering "based on the counter first" with actor as tie-break. Losing values are "relegated to a conflicts object" and can be read with `Automerge.getConflicts`. — [Automerge: Conflicts](https://automerge.org/docs/documents/conflicts/)
- Lists use an RGA sequence CRDT, text uses Peritext with marks, and counters merge by summing concurrent increments. — [Automerge: Documents reference](https://automerge.org/docs/reference/documents/)

**Yjs**
- Updates are binary (`Uint8Array`, "highly compressed"), so they can't go through `JSON.stringify` and need base64 for text transport. They are "commutative, associative, and idempotent." Sync works by exchanging state vectors (the "next expected clock from each client") and sending only the diff via `encodeStateAsUpdate(doc, remoteStateVector)`. `Y.mergeUpdates` compacts stored updates, but it "doesn't garbage-collect deleted content". Doing that requires loading the updates into a `Y.Doc`. — [Yjs: Document Updates](https://docs.yjs.dev/api/document-updates)

**Figma-style ID-keyed property LWW**
- A Figma document is a tree of objects, each with an ID and a property map, described as `Map<ObjectID, Map<Property, Value>>`. The server keeps the latest value per property per object. Edits to different properties, or to the same property on different objects, never conflict, and the server defines event order. Updates are atomic per property value, so two concurrent text edits leave one of the two values, never a merge. — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- Creating and deleting objects are explicit operations. Writing to an unknown ID does not create an object, and existence is modelled as an LWW boolean. — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- Excalidraw's version is coarser. Each element carries a `version` that increments on every edit, merges keep the highest version per element, a random `versionNonce` breaks ties (lower wins), and deletes set `isDeleted` (tombstones). The team says this "solved most of our collaboration problems." — [Excalidraw P2P collaboration (2020)](https://plus.excalidraw.com/blog/building-excalidraw-p2p-collaboration-feature)
- Weidner's general rule: "Use that UID in operations involving the content, instead of using a mutable descriptor like its index in a list." Fields users change independently, such as position and size, should be separate LWW registers so one edit doesn't overwrite the other. — [Weidner, CRDT Survey Part 2 (2023)](https://mattweidner.com/2023/09/26/crdt-survey-2.html)
- Weidner distinguishes *mutations*, which are high-level and intent-carrying (for example "pick up loot"), from *state changes*, which are low-level writes. Mutations give more control over rebasing and business logic. State changes are simpler and reusable but "hide user intent from the server." — [Weidner, Architectures (2024)](https://mattweidner.com/2024/06/04/server-architectures.html)

### Inferences
- Recommended op vocabulary for `Item`/`List`/`Page`, in Figma style:
  - `{"op":"create","id":"<id>","type":"Page","props":{...}}`
  - `{"op":"set","id":"<id>","key":"title","value":"Hello"}`, with one op per changed property. This maps directly onto `Item.set()` change events.
  - `{"op":"delete","id":"<id>"}`, which is a tombstone or LWW existence flag.
  - Membership and order inside a parent becomes one property on the child: `{"op":"set","id":"<child>","key":"parent","value":{"id":"<listId>","pos":"a0V"}}`. Figma stores parent and position as a single property so they update atomically.
  - Each op is wrapped in a log envelope such as `{seq, clientId, clientOpId, ts, schemaVersion, ops:[...]}`. See question 3.
- A path view (`/pages/3/items/5/title`) can still be computed for debugging or JSON-Patch export. It should not be the stored or wire format, because paths change whenever siblings are inserted, removed or moved. ID addressing also lets an op apply even if the target has since moved to another parent.
- JSON Merge Patch is a reasonable *snapshot diff* or REST PATCH format. It is a poor log format: it can't express null values or array edits, and it carries no ordering or identity metadata.
- MST is useful prior art for undo through reverse patches. Its patches, however, are index-paths on arrays and are emitted per mutation rather than per transaction, which are the same weaknesses as JSON Patch.
- Automerge and Yjs ops are opaque internal formats tied to their libraries. Adopting them means adopting the library and its history-retention model, which runs against the user's write-your-own preference. They are worth studying, but you can't hand-write those ops.

### Gaps
- There is no authoritative source that benchmarks JSON Patch index drift in concurrent settings. The pitfall is argued from the RFC's semantics plus Weidner's analysis, not from a measured study.
- MST's `recordPatches` and the reverse-patch (`oldValue`) format were not on the fetched page, so the exact inverse-patch shape is unverified.

---

## 2. List ordering: array indices, fractional indexing, list CRDTs (RGA, Fugue), and representing move

### Takeaway
For lists of Items (pages, blocks, cards), the pragmatic choice is fractional-index string keys stored as a property on each child, with a server-assigned tiebreak. This is what Figma and Loro do. A move is then a single LWW write to `{parent, pos}`. The cost is possible interleaving of concurrent multi-item inserts, which is acceptable for object lists but not for character-level text. Only character-level collaborative text needs a real list CRDT such as Fugue, or Weidner's server-ordered "insert-after ID" approach.

### Cited Findings
**Fractional indexing**
- Figma gives each child a fractional position strictly between 0 and 1 and sorts siblings by it. An insert takes the midpoint of its neighbours. Positions are arbitrary-precision strings: the leading "0." is dropped and digits are base-95 ASCII, which avoids float precision exhaustion. If two clients produce the same position, "the server resolves this by assigning a unique position to the second insert." Index strings can grow, which Figma accepts because growth is bounded by user activity. — [Figma: Realtime editing of ordered sequences](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/)
- Figma accepts interleaving of concurrently inserted items because "objects in a design rarely overlap." A reorder changes only the moved object's index, so it is one value edit rather than delete plus insert. — [Figma: Realtime editing of ordered sequences](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/)
- `fractional-indexing` (rocicorp) provides `generateKeyBetween(a, b)`, where null means open-ended, and `generateNKeysBetween(a, b, n)`. The batch version "spaces out indexes more evenly and leads to shorter keys." The default alphabet is base-62. Keys sort with plain `<` / `Array.prototype.sort`, and the README warns "Do not use `localeCompare`" because it is case-insensitive. Random jitter is optional and reduces concurrent collisions without eliminating them. The library is based on David Greenspan's "Implementing Fractional Indexing". — [rocicorp/fractional-indexing](https://github.com/rocicorp/fractional-indexing)
- Evan Wallace (Figma co-founder) breaks ties by object ID and suggests adding "a random offset to the end of the fraction during each insert." He warns "the resulting objects may be interleaved," which makes the technique unsuitable for text. Moves leave nothing behind: "Objects can be reordered any number of times without leaving any additional information behind." — [Wallace, CRDT: Fractional Indexing](https://madebyevan.com/algos/crdt-fractional-indexing/)
- Loro's movable tree orders siblings by fractional index and notes: "Fractional Index has an interleaving issue, but we believe this is acceptable for tree structures." — [Loro: Tree tutorial](https://loro.dev/docs/tutorial/tree)

**List CRDTs and alternatives**
- Weidner and Kleppmann show that most replicated-list algorithms, across both CRDTs and OT, can interleave concurrently inserted passages. They define "maximal non-interleaving" and introduce Fugue/FugueMax; FugueMax is proven to satisfy it. Published in IEEE TPDS vol. 36 no. 11, November 2025. — [Kleppmann: Fugue paper page](https://martin.kleppmann.com/2025/11/01/fugue-minimizing-interleaving.html), [arXiv 2305.00583](https://arxiv.org/pdf/2305.00583)
- Automerge lists use RGA. — [Automerge docs](https://automerge.org/docs/reference/documents/)
- `list-positions` implements Fugue-based immutable positions and can export `lexicographicString(pos)` for database `ORDER BY`. Its README example says concurrent inserts give "HelloWorld" or "WorldHello," never "HWeolrllod." — [list-positions](https://github.com/mweidner037/list-positions)
- "Collaborative Text Editing without CRDTs or OT" (May 2025): every character gets a unique ID, clients send "insert after <ID>" ops, the server applies them literally in its own order, and deletes become tombstones. The author calls it "dead simple." The companion library Articulated includes `IdListSimple`, a reference implementation under 300 SLOC that fuzz tests show matches the optimised version. In a decentralised setting with Lamport timestamps, the approach "technically" becomes a text CRDT equivalent to RGA/Causal Trees. — [Weidner, Text without CRDTs (2025)](https://mattweidner.com/2025/05/21/text-without-crdts.html), [Articulated](https://github.com/mweidner037/articulated)

**Move**
- Kleppmann (PaPoC 2020): existing list CRDTs "behave poorly when users concurrently move list elements," so an explicit move operation is needed. It can be layered on any list CRDT, and moving *ranges* is left open. — [Kleppmann, Moving Elements in List CRDTs](https://martin.kleppmann.com/2020/04/27/papoc-list-move.html)
- Recommended pattern: give each element a location-independent UID and store its position as an LWW register. "Move an element by setting its `position` to a new list CRDT position at the intended place." Concurrent moves resolve by LWW, and edits to the element still apply after it moves. For trees, store each node's parent as an LWW value, and "don't actually loop over the subtree deleting nodes." — [Weidner, CRDT Survey Part 2](https://mattweidner.com/2023/09/26/crdt-survey-2.html)
- Delete plus reinsert as a move duplicates subtrees under concurrency: "The concurrent moves will duplicate the moved subtree." The authors report this behaviour in Dropbox and bugs in Google Drive. — [Kleppmann et al., A highly-available move operation for replicated trees (PDF)](https://martin.kleppmann.com/papers/move-op.pdf)
- Da & Kleppmann (PaPoC 2024) say naive JSON-CRDT move can introduce "duplicates or cycles" and propose a move algorithm, with integration into Automerge planned rather than done. — [Extending JSON CRDTs with Move Operations](https://martin.kleppmann.com/2024/04/22/json-crdt-move.html)

### Inferences
- For `List extends Item`, keep the in-memory array as a *derived, sorted view* of children whose `parent.id === list.id`, sorted by `pos` with ties broken by child ID. Persist and stream only `set parent/pos` ops. This removes index drift from the log entirely.
- With a single server sequencer, the server can do what Figma does: detect a duplicate `pos` under the same parent and rewrite it before appending to the log. Clients can then use plain `generateKeyBetween` without jitter.
- Array indices remain acceptable on the wire in one case: the server serialises all ops, and clients either wait for ack or rebase pending ops onto the server's result. See question 8.
- Rich text inside a Page is the only place a real sequence structure is needed. The cheapest options are a whole-string LWW (Figma's approach) or Weidner's server-ordered insert-after-ID list (under 300 lines).

### Gaps
- Greenspan's Observable article did not render, so its exact key-growth analysis (prepend/append optimisation) is cited only through the rocicorp README.
- No data was found on typical fractional key length after realistic editing sessions. Figma says only that growth is "acceptable".

---

## 3. Event log mechanics: sequence numbers and clocks, idempotent replay, snapshots and compaction, JSONL crash safety, log granularity, file counts, schema versioning

### Takeaway
With a single authoritative server, a per-log monotonically increasing integer `seq` assigned by the server is enough for ordering. Add a per-client op ID so replays and resends are idempotent. Lamport clocks or HLCs only become necessary with multiple writers and no sequencer. Proven recovery is "latest snapshot + log entries with seq > snapshot.seq" (Figma), compaction is "rewrite current state as a new base file, then atomically switch" (Redis 7, NeDB), and a torn final line is truncated on load while mid-file corruption is a hard stop (Redis). Version every log line with weak-schema upcasting on read.

### Cited Findings
**Sequence numbers and clocks**
- Figma assigns an incrementing integer sequence number per file to every change, and each checkpoint records the current sequence number. — [Figma: Making multiplayer more reliable (Oct 20, 2022)](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- Linear, per the reverse-engineering write-up: `lastSyncId` is a single monotonically increasing counter for the whole database. Clients compare it with the server's on connect and request the missing delta packets. Bootstrap streams model records as JSON lines, and the last line carries metadata including `lastSyncId`. This is reverse-engineered, not official. — [wzhudev/reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- Replicache keeps a per-client high-water mark, `lastMutationID`. The client "discards any pending mutations it has for each client with id ≤ lastMutationID," and without it "the change would be applied twice." — [Replicache: How it works](https://doc.replicache.dev/concepts/how-it-works)
- Hybrid logical clocks (Kulkarni & Demirbas, 2014) pair `l`, which tracks the maximum physical time seen and stays within ε of it, with a counter `c` that increments when `l` doesn't advance. HLC "captures the causality relationship like LC" (Lamport clocks). It fits in 64 bits as 48 bits of physical time plus 16 bits for `c`. — [Demirbas, Hybrid Logical Clocks (2014)](https://muratbuffalo.blogspot.com/2014/07/hybrid-logical-clocks.html)
- Weidner: decentralised systems need a shared total order that extends causal order, for example logical timestamps, and clients must keep the full op log. A central server avoids that need. — [Weidner, Architectures (2024)](https://mattweidner.com/2024/06/04/server-architectures.html)

**Idempotent replay**
- Figma: a batched journal entry can straddle a checkpoint (for example checkpoint at seq 7, entry 5–9). Replaying it still gives the correct state at seq 9 "because of last-writer-wins conflict resolution." Absolute property sets are naturally idempotent. — [Figma: Making multiplayer more reliable](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- Linear caches unsent transactions in IndexedDB and replays them on restart. The write-up warns that non-idempotent transactions, such as deleting something already deleted, can error on resend. — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- Yjs updates are idempotent and commutative by design. — [Yjs: Document Updates](https://docs.yjs.dev/api/document-updates)
- Fowler: replayed events must not re-trigger side effects, because "those external systems don't know the difference between real processing and replays". Wrap external calls in "gateways" that can be "disabled during the replay processing." — [Fowler, Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

**Snapshots and compaction**
- Figma before its journal: the whole file was held in memory and a full checkpoint (encoded, compressed, uploaded to S3) was written every 30–60s, so "we could lose up to 60 seconds of work on the server-side if multiplayer crashes."
- Figma after: incremental journal writes to DynamoDB about every 0.5s (target "<1s of data loss"), with entries carrying start and end sequence numbers.
- Recovery reads the latest checkpoint, then journal entries with seq above the checkpoint's, then applies them.
- Rollout was validated by replaying checkpoint A plus the journal and checking for a byte-for-byte match with checkpoint B, about 400K consecutive successes in dark launch. At publication the journal handled ">2.2B received changes per day" and persisted 95% of changes "within ~600ms."
- A DynamoDB lock table keyed (lock UUID, file key), plus conditional writes, ensures a single writer per file. — [Figma: Making multiplayer more reliable](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- Redis AOF rewrite exists because "if you are incrementing a counter 100 times, you'll end up with a single key... but 100 entries in your AOF." Redis 7+ uses *multi-part AOF*: one base file (snapshot) plus incremental files, tracked by a manifest. On rewrite the parent opens a new incremental file and a child writes a new base. Redis then writes a temp manifest and "performs an atomic replacement operation" to activate it. Failed rewrites are retried "at a slower and slower rate." Before 7.0, rewrite buffered concurrent writes in memory and wrote them to disk twice. — [Redis persistence docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- Kafka log compaction keeps "the latest value for each message key". A null-valued record is a tombstone, kept for `delete.retention.ms` (default 24h). "The offset for a message never changes," and "Compaction will never reorder messages, just remove some." A reader starting from offset 0 sees "at least the final state of all records in the order they were written". `min.compaction.lag.ms` keeps a recent head uncompacted, and the active segment is never compacted. — [Confluent: Kafka log compaction](https://docs.confluent.io/kafka/design/log_compaction.html)
- NeDB appends every update and delete as a new line and compacts to one line per document *every time the database loads*. It also offers `compactDatafile()` and `setAutocompactionInterval` with a 5s minimum, and no other operation can run during compaction. The README says the project "is no longer maintained." — [NeDB README](https://github.com/louischatriot/nedb)
- Dudycz calls snapshots "a tactical hotfix or optimisation" and recommends treating them "as a last resort." He prefers shortening stream lifecycles ("closing the books") first. Snapshots create "a versioning problem", because a snapshot schema change means rebuilding from events. Strategies are every event, every N events, on a specific event type, or on a schedule. — [Dudycz, Snapshots in Event Sourcing (2021)](https://kurrentdb.kurrent.io/blog/snapshots-in-event-sourcing/)
- Fowler: snapshots "can be made at any time in parallel without bringing down the running application," and state can be rebuilt "by re-running the events from the event log on an empty application." — [Fowler, Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

**Crash safety of appends**
- `write(2)`: with O_APPEND, "The adjustment of the file offset and the write operation are performed as an atomic step." Also: "a successful write() may transfer fewer than count bytes," and "A successful return from write() does not make any guarantee that data has been committed to disk... The only way to be sure is to call fsync(2)." On NFS, even space reservation isn't guaranteed. — [write(2) man page](https://man7.org/linux/man-pages/man2/write.2.html)
- SQLite assumes that when a file grows, "the new file space originally contains garbage and then later is filled in with the data actually written... the file size is updated before the file content." It also assumes sector writes are not atomic, and that the OS buffers and reorders writes so fsync is needed at key points. On Unix it syncs the *directory* containing a journal so the file "will appear in the directory following a power failure." — [SQLite: Atomic Commit](https://www.sqlite.org/atomiccommit.html)
- Pillai et al. (OSDI 2014) found "a total of 60 vulnerabilities" in update protocols across eleven widely used applications, including databases, KV stores, version control and others. The file-system "persistence properties" those protocols rely on "vary widely among six popular Linux file systems." — [USENIX OSDI '14: All File Systems Are Not Created Equal](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/pillai)
- Redis on a truncated AOF tail "will be able to load the AOF anyway, just discarding the last non well formed command" (`aof-load-truncated`, the default). Corruption *mid-file* makes Redis abort at startup. `redis-check-aof --fix` may discard "the AOF portion from the invalid part to the end of the file". — [Redis persistence docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- Redis fsync policies: `always` is "Very very slow, very safe" (with group commit). `everysec` is the default and "you may lose 1 second of data". `no` leaves flushing to the OS, about every 30s on Linux. — [Redis persistence docs](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- NeDB does not fsync appends, so a crash can lose up to about 30s, which it compares to Redis `appendfsync no`. `corruptAlertThreshold` (default 10%) refuses to start if more of the file than that is corrupt. — [NeDB README](https://github.com/louischatriot/nedb)

**Log granularity, file count, object storage**
- Figma keeps one sequence and one journal *per file (document)* and runs one multiplayer process per document. — [Figma: Making multiplayer more reliable](https://www.figma.com/blog/making-multiplayer-more-reliable/), [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- Linear uses one global sequence for the whole database and filters it into per-user sync groups. — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- Tonsky's file-sync design gives each client its own append-only op log, chunked into files, so a dumb file-sync service such as Dropbox never sees write conflicts. Readers track their read offset in each file. — [Tonsky, Local, first, forever (2024)](https://tonsky.me/blog/crdt-filesync/)
- ext4 sizing: the mke2fs default `inode_ratio = 16384` (one inode per 16 KiB) and the "small" profile uses 4096. This caps how many tiny files a volume can hold. — [mke2fs.conf(5)](https://man7.org/linux/man-pages/man5/mke2fs.conf.5.html)
- S3 supports "at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per partitioned Amazon S3 prefix," with no limit on prefix count. Scaling is gradual and 503 Slow Down responses are possible during it. — [AWS S3 performance guidelines](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html)
- S3 conditional writes (`If-None-Match` on PutObject/CompleteMultipartUpload) launched Aug 20, 2024. They let a writer create an object only if it doesn't exist, which can implement "create log segment N exactly once." — [AWS What's New, Aug 2024](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes)

**Schema versioning and upcasting**
- Greg Young (DDD eXchange 2017) prefers *weak schema* (JSON mapped by property name, missing fields default) with two rules: never rename, and never change a property's meaning. A new version is only acceptable if it can be converted from the old one; otherwise it is a new event type. Old versions are *upcast* to the latest on read. Young argues strongly against modifying stored events and prefers copy-and-replace (transform the stream into a new stream). — [InfoQ on Greg Young's versioning talk (2017)](https://www.infoq.com/news/2017/07/versioning-event-sourcing)
- Ink & Switch's Cambria uses bidirectional lenses that translate *JSON Patch operations* between schema versions. It concludes "Data translations in decentralized systems should be performed on read, not on write," and notes that old clients can reintroduce renamed fields. — [Ink & Switch: Cambria (2020)](https://www.inkandswitch.com/cambria/)
- Linear's client stores a `__schemaHash` over model metadata to decide when the local database needs migrating or a full re-bootstrap. — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)

### Inferences
- **Envelope.** One JSON object per line: `{"v":1,"seq":1043,"t":1730200000000,"c":"<clientId>","cid":57,"ops":[...]}`. `seq` is assigned by the server's single writer for that log. `c`/`cid` is the client op ID used for idempotent resend, Replicache style: the server keeps `lastCid[clientId]` and drops duplicates. `t` is informational only and never used for ordering. Group a user action's ops into one line so a line is the atomic unit.
- **Append discipline.** Do one `write()` per serialised line ending in `\n`, on an fd opened with O_APPEND, from a single process. Choose an fsync policy explicitly: batch with fsync every N ms (Redis `everysec`-like, also Figma's ~0.5s journal cadence) or fsync per batch before acking clients.
- **Load discipline.**
  - Parse line by line.
  - If the *final* line lacks `\n` or fails to parse, truncate it and continue (Redis `aof-load-truncated`).
  - If an *interior* line fails, stop and alert rather than silently skipping (Redis aborts on mid-file corruption).
  - Optionally add a per-line CRC so garbage tails can be detected after power loss, since SQLite's "file grows before content" assumption means a tail can be zero-filled garbage that still parses badly.
- **Snapshot plus compaction** (Redis multi-part AOF pattern applied to JSONL):
  1. Freeze `seq = N`.
  2. Write `snapshot-N.json` to a temp name, fsync it, rename it, then fsync the directory.
  3. Start `log-N+1.jsonl`.
  4. Update a tiny `manifest.json` (temp + rename) naming the current snapshot and log segments.
  5. Delete old segments only after the manifest switch.
  6. On load, read the manifest, then the snapshot, then replay segments with seq > N.
  This equals Figma's checkpoint plus journal. It also maps cleanly onto SQLite (a `snapshots` table plus an `ops` table with an integer primary key) and S3/R2 (immutable `seg-<startSeq>.jsonl` objects created with If-None-Match, plus a manifest object).
- **Granularity.** One log per *Page* (document) is the sweet spot. A per-Item log explodes file counts (inode_ratio limits, S3 request costs) and loses atomic multi-item transactions. A global log forces loading everything and serialises every write through one point. A per-Page log matches Figma, enables lazy loading per page, and keeps the sequencer per page. Child Items of a page live in that page's log; nested child *Pages* get their own logs and are referenced by ID.
- With a weak schema plus "add fields, never rename or repurpose" (Greg Young), most schema evolution needs no migration code. For the rest, use an `upcast(line)` function keyed by `v`, run on read, and rewrite the snapshot when the snapshot shape changes (Dudycz's versioning warning).

### Gaps
- The fetched mke2fs page did not confirm that inode count is fixed at filesystem creation. That is standard ext4 behaviour but unverified here.
- The S3 `If-Match` (compare-and-swap) conditional-write announcement of Nov 2024 could not be fetched (robots blocked), and S3 append semantics for general-purpose buckets were not verified. Treat S3/R2 as "immutable segment objects plus a manifest", not as appendable files.
- No source compared the fsync cost of per-op versus batched appends for Node.js specifically.
- No source was found on R2-specific conditional write semantics.

---

## 4. References and identity: stable IDs, serialising references and cycles, lazy loading child pages, mapping a page tree to directories/S3 keys

### Takeaway
Generate IDs on the client, collision-free without server coordination. Figma includes a client ID, and UUIDv7 or ULID add time-sortability. Serialise every reference as a bare ID, never as a nested object, which makes cycles a non-issue in storage. Store each child's parent as a property, and key storage by ID, not by tree path, so moves never rename files or objects. Lazy-load child Pages by resolving ID references on demand, as Linear and MST do.

### Cited Findings
- Figma generates object IDs on the client and includes a unique client ID so clients never collide. Server-assigned IDs were rejected because "object creation needs to be able to work offline." — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- UUIDv7 (RFC 9562, May 2024) puts a 48-bit big-endian Unix-ms timestamp in the most significant bits, so values sort as raw bytes and improve index locality. Monotonicity within a millisecond uses a counter or sub-ms precision, and the RFC advises checking that each new UUID exceeds the previous one. — [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562)
- ULID is 128 bits: a 48-bit ms timestamp plus 80 random bits, encoded as 26 Crockford base32 characters that sort lexicographically. Within the same millisecond the random part increments by 1, and generation fails on overflow. — [ULID spec](https://github.com/ulid/spec)
- Weidner: the creator assigns the UID at creation time using UUID-like IDs so concurrent creators don't collide. — [Weidner, CRDT Survey Part 2](https://mattweidner.com/2023/09/26/crdt-survey-2.html)
- MST's `types.reference` serialises as the target's identifier: the snapshot stores `selectedTodo: "47"`. References resolve through an identifier cache "looked up through the entire tree but per type". Custom references supply `get(identifier, parent)` and can "trigger a data fetch when trying to resolve the reference." `safeReference` removes itself when its target dies. Identifiers cannot change after initialisation. — [MST: Identifiers and references](https://mobx-state-tree.js.org/concepts/references)
- Figma stores each child's parent link as a property, which preserves object identity across moves, since recreating objects would drop concurrent edits. The server rejects parent updates that would create a cycle. Clients can briefly hold cycles from unacknowledged changes; Figma temporarily removes the affected objects from the tree until server state arrives, a trade-off it acknowledges. — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- Tree-move CRDT without a server: operations are applied in timestamp order. A replica receiving an earlier-timestamped op undoes later ops, applies the new one and redoes them. A move that would form a cycle is ignored, and the log must keep ignored ops. Worst case is O(nd). — [Kleppmann et al., move-op paper](https://martin.kleppmann.com/papers/move-op.pdf)
- Linear's model metadata declares property kinds (`reference`, `referenceCollection`, `backReference`, and others) and load strategies (`instant`, `lazy`, `partial`, `explicitlyRequested`, `local`). `LazyReferenceCollection` loads related models on demand. Partial indexes (for example `assigneeId-<id>`) record which queries were already fetched, and `BatchModelLoader` batches network loads. A delta for a model that isn't loaded triggers a load, and lazy hydration doesn't overwrite models already in memory. The in-memory object pool is a map keyed by UUID. — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- Figma, by contrast, downloads a full copy of the document on open. Its unit of loading is the whole document. — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)

### Inferences
- **IDs.** Use UUIDv7 or ULID generated on the client. Both are time-sortable, so per-page logs and S3 listings have locality. nanoid is shorter but random-only, with no time order; its trade-offs were not verified in this research. A ULID's millisecond prefix also gives a free rough creation time for debugging.
- **Serialisation.** In snapshots and ops, any Item-valued property is stored as `{"$ref":"<id>"}` or a bare ID string in a known ref-typed field. The live object graph can have cycles (child → parent → child), but the serialised form is a flat `id → props` map, so it has none. Hydration is two passes: create all objects by ID, then resolve refs. This is MST's model.
- **Tree validity.** With a single server sequencer, a Figma-style server check is enough: reject `set parent` if the new parent is a descendant of the child. Kleppmann's undo-do-redo machinery is only needed without a sequencer.
- **Lazy child pages.** A `Page` holds `{"$ref":"<childPageId>"}` placeholders. Dereferencing calls `store.loadPage(id)`, which reads that page's manifest, snapshot and log segments, and subscribes to its websocket channel. Unloaded pages receive no deltas. On subscribe the client sends `lastSeq` and the server sends missing ops, or a fresh snapshot if compaction has removed them (Linear's catch-up / full-bootstrap split).
- **Directory/S3 mapping.** Key storage by ID, not by tree path, for example `pages/<pageId>/manifest.json`, `pages/<pageId>/snap-<seq>.json`, `pages/<pageId>/log-<startSeq>.jsonl`. Moving or renaming a page is then a single `set parent` op, with no file moves and no prefix rewrites. A human-readable path tree, if wanted, is a derived index. ULID/UUIDv7 prefixes also spread S3 prefixes, which per-prefix request-rate limits reward.

### Gaps
- No primary source directly discusses mapping a document tree to filesystem directories or S3 keys. The ID-keyed recommendation is inferred from Figma's parent-link design and S3 prefix guidance.
- nanoid's spec and collision characteristics were not fetched.

---

## 5. Conflict handling for multi-user: server-authoritative ordering, LWW per property, when CRDT/OT is needed, presence/awareness

### Takeaway
With a central server, server-defined ordering plus LWW per property (Figma, Linear) covers almost all non-text structured editing. CRDTs and OT are, in Weidner's words, "merely optimizations over server reconciliation" in a centralised setting. They become necessary only for character-level text merging or genuinely decentralised or long-offline multi-writer editing, and even there the evidence (Moment) shows offline conflict results are often unsatisfying. Keep presence as a separate ephemeral channel.

### Cited Findings
- In centralised collaboration, CRDTs and OT are "merely **optimizations** over server reconciliation," and their algebraic properties matter for decentralised collaboration. Text and lists are the main exception and are best handled with local data structures such as immutable positions. — [Weidner, Architectures (2024)](https://mattweidner.com/2024/06/04/server-architectures.html)
- Weidner's server-side options:
  - *Serialisation*: reject stale ops, client re-downloads and retries, as in ProseMirror collab.
  - *CRDT-ish ops*: ops that "make sense" against newer state, like "add 1 to the like count" instead of "set to 6". The server applies them serially, which he calls "dead simple."
  - *OT-ish*: transform ops on the server, which costs O(active users) per op plus a retained op log.
  — [Weidner, Architectures (2024)](https://mattweidner.com/2024/06/04/server-architectures.html)
- Weidner's client-side options:
  - Wait for ack: simple, but stalls on high latency.
  - *Server reconciliation*: undo pending ops, apply remote ops, redo pending ops. He calls it "the most flexible way to implement optimistic local updates."
  - CRDT.
  - OT, whose transformation cases grow as O(op types²).
  — [Weidner, Architectures (2024)](https://mattweidner.com/2024/06/04/server-architectures.html)
- Figma chose not to use OT ("unnecessarily complex for our problem space"). Its system is CRDT-inspired but simplified because "our server is the central authority." Clients apply local changes immediately and *discard incoming server changes that conflict with unacknowledged local changes* to prevent flicker. — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- In the earlier Figma post, simultaneous changes conflict only when they touch the same property of the same object, and the most recent change wins. Some layout features had to change because one object's action affected others and caused unintended conflicts. — [Figma: Multiplayer editing in Figma](https://www.figma.com/blog/multiplayer-editing-in-figma/)
- Linear uses last-writer-wins. Fujimoto's notes say Tuomas Artman reports "conflicts are actually not that common in Linear," and that CRDTs were adopted only recently and only for issue descriptions (rich text). — [Fujimoto, Linear's sync engine architecture (Aug 2024)](https://www.fujimon.com/blog/linear-sync-engine)
- Hovley's summary of Linear's rule: "Whatever value comes in last for the field, is the value of the field." Most edits touch single-property fields such as title or assignee. — [Hovley, Technically Speaking](https://paulhovley.substack.com/p/technically-speaking-how-400-million)
- In Linear, transactions execute only on the server, and local model tables are not changed until the server confirms, so rejected changes roll back cleanly. Delta packets are broadcast to all clients *including the sender*. — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- Replicache uses named mutators that run optimistically on the client and again on the server ("the server is authoritative"). On pull, the client rewinds to the last server state, applies the patch and replays pending mutations, and conflicts are resolved in application code. Pokes are data-free hints to pull soon. — [Replicache: How it works](https://doc.replicache.dev/concepts/how-it-works)
- Moment.dev's offline-editing study found "roughly 20-30% of direct conflicts we tried produced results" the team judged unacceptable with CRDT/OT. Its example is "Colour" versus delete-all merging to "u". It concludes "Offline editing is a UI/UX problem, not an algorithms problem." The author and date aren't stated on the page; the context suggests Moment, late 2024 or later. — [Moment: Lies I was told about collaborative editing, Pt. 1](https://www.moment.dev/blog/lies-i-was-told-pt-1)
- HN discussion of Paul Butler's "You might not need a CRDT" (Dec 2022): commenter Joeri says the server-authoritative approach "breaks down as soon as you have an offline scenario." mathgladiator notes "A CRDT assumes that every participate has equal rights to all data", which conflicts with permissions. The original article URL now redirects to Modal after Jamsocket's acquisition. — [HN thread 33865672 (via Algolia API)](https://hn.algolia.com/api/v1/items/33865672)
- The Linear reverse-engineering author, a self-described CRDT advocate, says CRDTs add metadata overhead and are harder with partial sync and permissions because they are designed for decentralised systems. — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)

**Presence and awareness**
- Yjs awareness lives outside the document CRDT, in y-protocols. Each client has a state ("an increasing clock attached to a schemaless JSON object") keyed by client ID, and receivers overwrite only on a newer clock. Setting the state to null means offline. "If a client doesn't receive updates from a remote peer for 30 seconds, it marks the remote client as offline," so clients must rebroadcast periodically. — [Yjs: Awareness](https://docs.yjs.dev/api/about-awareness)
- Figma routes only document changes through multiplayer. Comments, users, teams and projects sync through a separate Postgres-backed system. — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)

### Inferences
- For the user's Item/List/Page model, a **websocket server that is the single sequencer per Page** is the right default:
  1. Validate each op.
  2. Assign `seq`.
  3. Append to the log.
  4. Broadcast to all subscribers, including the sender (Linear).
  - Clients apply optimistically and keep a pending queue.
  - On the echo of their own op, they drop it from pending.
  - When a remote op touches a key that has a pending local write, they ignore it until their own op is acknowledged (Figma's flicker rule).
- Prefer *intent ops* where LWW is wrong, for example `increment`, `appendChild`, or `toggle-if`. Weidner's "CRDT-ish" ops are cheap to support when the server applies everything serially.
- Text fields: start with whole-value LWW (Figma). Upgrade a specific field to Yjs/Automerge or Weidner's insert-after list only when users actually co-edit the same paragraph. Linear did exactly this for issue descriptions.
- Presence (cursors, selections, "who's here") goes over the same websocket as a separate message type. It is never written to the JSONL log, it is last-value-per-client with a heartbeat timeout of about 30s (Yjs), and it is cleared on disconnect.

### Gaps
- No primary Linear engineering doc (as opposed to talks, notes and reverse-engineering) confirming conflict handling was retrievable. The "Scaling the Linear Sync Engine" page is a video landing page without text.
- The original "You might not need a CRDT" article (driftingin.space) is offline and archive access was blocked, so its arguments are known only via the HN thread.

---

## 6. Build-vs-buy: evidence from people who built their own sync engines, typical size of a minimal homegrown implementation, and the hard parts that bite

### Takeaway
The best-documented successes (Figma, Linear) built their own engines, but they invested heavily: about a year for Figma multiplayer, and about half a year for Linear's sync stack plus command menu, built by an engineer on his fourth sync engine. Both engines were scoped tightly to their data model (property LWW, server authority). Vendor churn has been severe: Replicache is in maintenance mode, Jamsocket was acquired, Instant's cloud is shutting down, and Electric rewrote from scratch. That strengthens the case for a small homegrown core with a swappable store. The irreducible pieces of a minimal engine are each small, from tens to a few hundred lines. The pain comes from compaction, migrations, offline merge, partial loading, undo and crash durability.

### Cited Findings
**Who built their own, and the cost**
- Figma's multiplayer took about a year to build. The team weighed a cheaper "baton-passing" single-editor mode but rejected it. — [Figma: Multiplayer editing in Figma (Evan Wallace)](https://www.figma.com/blog/multiplayer-editing-in-figma/)
- Figma deliberately built a custom, simpler, server-centralised system instead of OT or a true CRDT. — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- Tuomas Artman (Linear): "we spent like half a year building out, the sync stack and the command" menu. On an earlier Uber prototype, "the sync engine obviously took quite a bit of time to put together," while the app on top took about a week. He says a sync engine means "you're effectively just building the front end," avoiding "two different code paths" for local and remote edits. — [localfirst.fm #15 with Tuomas Artman](https://localfirst-63yrl41b9-schickling-pro.vercel.app/15)
- Linear's engine is described as "Tuomas's 4th sync engine." — [Hovley, Technically Speaking](https://paulhovley.substack.com/p/technically-speaking-how-400-million)
- Figma's later reliability work (journal plus checkpoints, a DynamoDB lock table, a dark-launch validation of about 400K byte-for-byte replays) shows durability alone grew into a substantial project years after launch. — [Figma: Making multiplayer more reliable (2022)](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- Antoine (Aug 2025) replaced PGlite + Electric with a homegrown wa-sqlite sync and reactivity layer in "a couple of months." It is single-player, uses a full fetch then polling by `updated_at`, has trigger-based dirty flags and change log, and uses BroadcastChannel for reactivity. He left Electric because startup grew past a minute ("it could take more than a minute to start the application") as data grew without compaction, and PGlite live queries leaked memory. — [Antoine, Lessons learned building a sync-engine with SQLite](https://antoine.fi/sqlite-sync-engine-with-reactivity)

**Minimal implementation sizes (component level)**
- Weidner's `IdListSimple`, a collaborative list/text reference implementation behaviourally identical to the optimised library in fuzz tests, is under 300 SLOC. — [Weidner, Text without CRDTs](https://mattweidner.com/2025/05/21/text-without-crdts.html)
- Jake Lazaroff's interactive tutorial (Oct 2023) implements an LWW Register in roughly 25 lines and an LWW Map in roughly 80–90 lines, including comments. These line counts are estimates from reading the code, not stated by the author. — [Lazaroff, An Interactive Intro to CRDTs](https://jakelazaroff.com/words/an-interactive-intro-to-crdts/)
- In the HN thread, commenter pookha mentions a real-world CRDT in "200 or three hundred lines of code". This is anecdotal. — [HN thread 33865672](https://hn.algolia.com/api/v1/items/33865672)
- Tonsky's per-client op-log-over-Dropbox demo is "a very simple proof-of-concept." — [Tonsky, Local, first, forever](https://tonsky.me/blog/crdt-filesync/)

**Arguments for buying, and vendor-risk evidence**
- Instant's essay (by Nikita Prokopov): "It's also ill-advised to try to solve data sync *while also working on a product*," and "These problems require patience, thoroughness, and extensive testing." The listed hard problems are stale data, failed requests, late or out-of-order updates, ambiguous retries, and exactly-once delivery. Instant is a vendor, so this is self-interested. — [Instant: Sync Engines are the Future](https://www.instantdb.com/essays/sync_future)
- Instant's team joined OpenAI on Aug 22, 2026. Instant Cloud apps shut down Aug 31, 2027, with backups for a year after; self-hosting docs exist. — [Runtime Wire on Instant joining OpenAI](https://runtimewire.com/article/instant-team-joins-openai-cloud-shutdown)
- Replicache "is now in maintenance mode." It is open-sourced and free, and users are told to "migrate to Zero as they are able." — [replicache.dev](https://replicache.dev/)
- Zero's docs show a "v1" line with an API reference for `@rocicorp/zero` v1.11.0, built on query-driven sync into a local normalised store with custom mutators. — [Zero docs](https://zero.rocicorp.dev/docs/introduction)
- Jamsocket (maker of Y-Sweet, Plane and DriftDB, and author of "You might not need a CRDT") joined Modal on July 10, 2025. Products keep operating while core functionality migrates. — [Modal: Jamsocket is joining Modal](https://modal.com/blog/jamsocket-is-joining-modal)
- ElectricSQL rewrote its stack in July 2024 ("Electric Next"). The old system's active-active replication was too complex: "The complexity of the stack has provided a wide surface for bugs." Early adopters hit performance and reliability problems. The rewrite cut to read-path "Shapes" over HTTP, "start with read-path only", and quotes Gall's law: "A complex system that works is invariably found to have evolved from a simple system that worked." — [Electric: A new approach to building Electric](https://electric.ax/blog/2024/07/17/electric-next)
- Pesterhazy's curated sync-engine reading list opens with "So you want to write a sync system... Good luck." He expects most apps will need their own system because "every app has slightly different needs," and advises against CRDTs as the basis unless you're truly peer-to-peer. — [pesterhazy gist: Building an offline realtime sync engine](https://gist.github.com/pesterhazy/3e039677f2e314cb77ffe3497ebca07b)

**Hard parts that bite (from CRDT and local-first experience)**
- Ink & Switch (local-first essay): CRDT history growth caused memory and disk problems in PushPin, and history "can't easily be truncated because a collaborator may reconnect months later." Schema evolution is hard without an authoritative schema. Network transport is "unsolved", and they propose "cloud peers." CouchDB conflict code "is difficult to write correctly." — [Ink & Switch: Local-first software](https://www.inkandswitch.com/essay/local-first/)
- Kleppmann's "CRDTs: The Hard Parts" (Hydra, Jul 2020) covers interleaving anomalies, list and tree move, and metadata overhead: "many published algorithms have anomalies that cause them to behave strangely in some situations." — [Kleppmann, CRDTs: The Hard Parts](https://martin.kleppmann.com/2020/07/06/crdt-hard-parts-hydra.html)
- Weidner (OT-ish server): garbage-collecting the op log breaks delayed or offline edits. This is the compaction-versus-offline tension. — [Weidner, Architectures](https://mattweidner.com/2024/06/04/server-architectures.html)
- Excalidraw's tombstone approach means "the size of your list grows forever," so deleted elements are pruned when saving to persistent storage. — [Excalidraw P2P (2020)](https://plus.excalidraw.com/blog/building-excalidraw-p2p-collaboration-feature)
- Linear's later talk covers read and write paths becoming very outdated and loading huge datasets into memory. — [Fujimoto, Linear's sync engine architecture](https://www.fujimon.com/blog/linear-sync-engine)
- In Linear's client, cached transactions replayed after restart can fail if not idempotent. — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- Crash-consistency is easy to get wrong even for mature systems: 60 vulnerabilities across 11 widely used applications. — [Pillai et al., OSDI '14](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/pillai)
- NeDB, the closest prior art to "JSONL + replay + compact on load" in JS, kept the whole database in memory, blocked during compaction, did not fsync appends, and is now unmaintained. — [NeDB README](https://github.com/louischatriot/nedb)

### Inferences
- **Size of a minimal homegrown core.** This is an estimate assembled from the component sizes above, not a cited figure. A server-authoritative, LWW-per-property, per-Page-log core plausibly fits in a few hundred to about 1,500 lines of JS:
  - Op apply/emit on `Item`/`List`: a few hundred lines.
  - JSONL store with truncate-tail recovery, snapshot plus manifest and compaction: a few hundred.
  - Websocket sequencer with per-client op-ID dedupe and lastSeq catch-up: a few hundred.
  - Fractional index: use the rocicorp library or about 100 lines.
  - Client pending queue and reconciliation: a few hundred.
  The year-scale efforts (Figma, Linear) went into scale, performance, partial loading, durability engineering and product polish, not the core algorithm.
- **Hard parts, ranked** for this user's design:
  1. **Compaction versus catch-up.** Once old segments are deleted, a client with an old `lastSeq` needs a snapshot, not deltas.
  2. **Schema migrations** across stored logs and snapshots.
  3. **Partial and lazy loading** with subscriptions per Page.
  4. **Undo/redo** under concurrency.
  5. **Offline multi-writer merge**, which the evidence says to avoid or reduce to "re-download and reapply."
  6. **Crash durability** (fsync, torn tails, atomic snapshot swap).
- **Build-vs-buy verdict** for this user. His requirements are a homegrown object model, his own websocket server, a swappable store, and a preference for his own code. The recent vendor churn (Replicache maintenance mode, Jamsocket acquisition, Instant Cloud shutdown, Electric rewrite) makes depending on a hosted sync service a real longevity risk. The patterns are well documented and small enough to implement with AI agents if scope is held to the concessions in question 8. The one place to "buy" is a library, not a service: Yjs, Automerge or Articulated for any field that genuinely needs collaborative text.

### Gaps
- No verified total line count for any production homegrown sync engine was found. Linear's and Figma's code sizes are not public.
- The localfirst.fm transcript file (SRT) could not be parsed, so Artman's quotes come from a summary page and may be imperfectly transcribed.
- No published postmortem was found from a team that built a homegrown JSONL/delta-log store and later regretted it. Electric is the nearest example, and it was a vendor rewrite, not a homegrown failure.
- The Instant essay's publication date was not stated on the page.

---

## 7. Undo/redo from a delta log

### Takeaway
Make undo a *local, per-user stack of inverse ops*, not a rewind of the shared log. Each recorded op captures the prior value (Fowler, MST reverse patches), consecutive edits are grouped into one step (Yjs `captureTimeout`), only the user's own origin is tracked (Yjs `trackedOrigins`), and undo is submitted as a new forward op that is sequenced and logged like any other. Figma's guiding rule: undoing, copying and redoing back to the present must leave the document unchanged.

### Cited Findings
- Figma: "if you undo a lot, copy something, and redo back to the present (a common operation), the document should not change." An undo updates the redo history at the time of the undo, and a redo updates the undo history at the time of the redo, so redo doesn't overwrite others' changes. Because the server deletes all data of deleted objects, the deleting client's undo buffer holds that data and restores it on undo. — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- Fowler: "Reversal is the most straightforward when the event is cast in the form of a difference". Otherwise "the event should ensure it stores everything needed for reversal during processing." Reversing a few events can be much cheaper than replaying from a snapshot. — [Fowler, Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- MST: "Patches can be reverse applied, which enables many powerful patterns like undo / redo." — [MST Patches](https://mobx-state-tree.js.org/concepts/patches)
- Yjs `UndoManager`:
  - It is scoped to chosen shared types and adds "a reverse-operation on its stack" when they change.
  - It tracks only selected transaction origins (local changes by default via `trackedOrigins`).
  - It merges edits within `captureTimeout` (default 500ms) into one step; `stopCapturing()` forces a boundary.
  - `stackItem.meta` can save and restore cursor position.
  — [Yjs: UndoManager](https://docs.yjs.dev/api/undo-manager)
- Stewen & Kleppmann (PaPoC 2024): concurrency creates a "non-linear operation history" that makes undo and redo hard to define. They survey mainstream tools, derive principles, and give an undo/redo algorithm for the multi-value register that they argue matches user expectations. — [arXiv 2404.11308](https://arxiv.org/abs/2404.11308)
- Weidner: server reconciliation's undo-pending, apply-remote, redo-pending cycle needs either an undo stack or persistent data structures, which are "easier than CRDT or OT data structures." — [Weidner, Architectures](https://mattweidner.com/2024/06/04/server-architectures.html)
- Articulated's `IdList` is persistent (immutable, structure-sharing), which makes rollbacks easy, for example in server reconciliation. — [Articulated](https://github.com/mweidner037/articulated)
- Kleppmann's tree-move log stores the old parent (`oldp`) with each `LogMove` entry, which "is what makes undo possible" for the undo-do-redo algorithm. — [move-op paper](https://martin.kleppmann.com/papers/move-op.pdf)

### Inferences
- **Recording.** When `Item.set(key, value)` runs from a local user action, push `{id, key, before, after}` onto the current undo group. Seal the group on a timer (about 500ms) or at explicit boundaries such as `stopCapturing()`. For create, store the full props so undo can delete the object. For delete, store the full props and parent/pos so undo can recreate it with the *same ID* (Figma keeps deleted data in the client's undo buffer).
- **Undo.** Emit inverse ops (`set key = before`) as a *new* transaction through the normal sequencer. Never truncate or rewrite the shared log. Undo stays consistent with streaming, persistence and other users, and the log keeps full history.
- **Multi-user semantics.** Before undoing a property, it is reasonable to check whether its current value still equals `after`. If another user has since changed it, skip that property or warn. This is a policy choice, not from a source; Stewen & Kleppmann discuss the design space.
- **Redo.** Pop from the redo stack and re-emit `after` values, refreshing them as Figma does (redo updates the undo history at the time of the redo).
- **Undo is client-side and per user.** It is not persisted to the JSONL log, although the resulting undo ops are. If undo should survive reload, persist the undo stack separately as a per-viewer convenience.
- Server-side "time travel" (view page at seq N) comes for free: replay snapshot plus ops up to N. This is Fowler's temporal query, distinct from user undo.

### Gaps
- The full Stewen & Kleppmann semantics (for example whether undo restores the value *before* the undone op or skips over concurrent ops) were not extracted, because only the abstract was fetched.
- Linear's undo/redo chapter in the reverse-engineering write-up was truncated and not retrieved.

---

## 8. Simplifying concessions: common simple setups, what each gives up, and when you don't need that feature

### Takeaway
Every production homegrown engine examined got simple by *declining* features: a single sequencer, LWW per property, snapshot plus truncate, and online-first with "re-download and reapply" on reconnect. Each concession removes a whole class of algorithms (consensus, CRDT merge, history GC, offline rebase). The deciding question for each is not "is this feature nice" but "do my users actually concurrently edit the same thing, offline, for long periods?" For a single developer's framework with a small number of collaborators, almost all of these concessions are safe defaults, and each can be lifted locally later (for example, one CRDT text field) without redesigning the log.

### Cited Findings
- **Single server sequencer.** Figma runs one server process per multiplayer document, and "the server can define the order of events." — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Single global counter.** Linear orders all transactions via a single `lastSyncId`. — [reverse-linear-sync-engine](https://github.com/wzhudev/reverse-linear-sync-engine)
- **Serial server application.** It removes the need for CRDT algebra: "you don't need to use literal CRDTs," and serial server application is "dead simple." — [Weidner, Architectures](https://mattweidner.com/2024/06/04/server-architectures.html)
- **LWW per property.** Two concurrent edits to the same property keep one value. Text fields are not merged. — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **LWW at Linear.** LWW is used, and Linear adopted a CRDT only for issue descriptions. — [Fujimoto](https://www.fujimon.com/blog/linear-sync-engine)
- **Snapshot plus truncate.**
  - Redis rewrites the AOF into a compact base, losing per-command history. — [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
  - NeDB compacts on every load. — [NeDB](https://github.com/louischatriot/nedb)
  - Kafka compaction keeps only the latest value per key, and tombstones disappear after `delete.retention.ms`, so lagging consumers "may miss them." — [Confluent: Log compaction](https://docs.confluent.io/kafka/design/log_compaction.html)
  - Garbage-collecting the op log breaks delayed or offline edits in OT-ish designs. — [Weidner](https://mattweidner.com/2024/06/04/server-architectures.html)
- **Coarse checkpoints only.** Before its journal, Figma could lose up to 60s of server-side work. — [Figma: Making multiplayer more reliable](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- **No real offline merge.** A Figma client reconnecting after offline edits downloads a fresh copy, reapplies its offline edits on top and opens a new socket. This keeps "connection logic simple." — [Figma: How multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **What true offline merge costs.** About 20–30% of direct conflicts gave unacceptable results under CRDT/OT. — [Moment](https://www.moment.dev/blog/lies-i-was-told-pt-1)
- **Server-authoritative designs and offline.** They "break down as soon as you have an offline scenario" (HN commenter Joeri). — [HN 33865672](https://hn.algolia.com/api/v1/items/33865672)
- **Array indices with server ordering (serialisation).** The server rejects stale ops, and the client re-downloads and retries, as in ProseMirror collab and `git pull --rebase`. It is simple, but frequent rejections can hurt performance or lock out users. — [Weidner, Architectures](https://mattweidner.com/2024/06/04/server-architectures.html)
- **Wait for ack.** It is simple, but updates can block indefinitely on high latency. — [Weidner, Architectures](https://mattweidner.com/2024/06/04/server-architectures.html)
- **Fractional index instead of list CRDT.** It gives up non-interleaving, which Figma and Loro accept for objects and trees. — [Figma: ordered sequences](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/), [Loro](https://loro.dev/docs/tutorial/tree)
- **Whole-element versioning.** Excalidraw keeps the highest version per element, with a nonce tie-break and tombstones. — [Excalidraw](https://plus.excalidraw.com/blog/building-excalidraw-p2p-collaboration-feature)
- **Relaxed fsync.** `everysec` can lose about 1s, and `no` lets Linux flush about every 30s. — [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- **Whole DB or document in memory.**
  - NeDB holds "a copy of the whole database" in memory. — [NeDB](https://github.com/louischatriot/nedb)
  - Figma downloads the full document on open. — [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Additive-only weak schema.** No renames and no semantic changes, so old readers can read new events. — [InfoQ / Greg Young](https://www.infoq.com/news/2017/07/versioning-event-sourcing)
- **Read-path first.** Electric's rewrite deliberately started with "read-path only" and staged writes later. — [Electric Next](https://electric.ax/blog/2024/07/17/electric-next)

### Inferences
**Trade-off table for a homegrown Item/List/Page delta-log system.** The "What you give up" and "You don't need it when" columns are judgements built from the evidence column, not directly sourced claims.

| Concession (simple setup) | What you give up | You genuinely don't need that when... | When to lift it, and the cheapest upgrade | Evidence |
|---|---|---|---|---|
| **Single server-authoritative sequencer per Page** (one process/lock assigns `seq`) | Peer-to-peer or serverless collaboration, multi-region active-active writes, editing when the server is unreachable | Users are online when collaborating and one server (or one owner per page) is acceptable | Need multi-writer without a server: add HLC/Lamport ordering per op (essentially a CRDT); Figma uses a lock table for one writer per doc | [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/), [Figma reliability](https://www.figma.com/blog/making-multiplayer-more-reliable/), [Weidner](https://mattweidner.com/2024/06/04/server-architectures.html) |
| **LWW per property, keyed by object ID** | Merging concurrent edits to the *same* property (two people typing in one title or paragraph); one write silently wins | Concurrent same-field edits are rare (Linear: "conflicts are actually not that common") and fields are small | One field becomes a co-edited document: make just that field a Yjs/Automerge text, or a server-ordered insert-after-ID list (Weidner, under 300 SLOC) | [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/), [Fujimoto](https://www.fujimon.com/blog/linear-sync-engine), [Weidner 2025](https://mattweidner.com/2025/05/21/text-without-crdts.html) |
| **Periodic full snapshot + truncate old log segments** | Fine-grained history and time-travel before the snapshot; delta catch-up for long-absent clients (they need a full snapshot); undo across the snapshot boundary if undo relied on the log | Nobody needs an audit trail or long history; clients can afford to reload a page snapshot after a long absence | Need history: archive old segments to cold storage (S3/R2) instead of deleting; keep a Kafka-style "latest per key" compaction plus a retained recent head | [Redis](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/), [Kafka](https://docs.confluent.io/kafka/design/log_compaction.html), [NeDB](https://github.com/louischatriot/nedb) |
| **No offline editing** (or Figma-style "on reconnect: reload, reapply pending ops, accept LWW outcome") | Quality merges after long offline sessions; guaranteed preservation of offline intent | Offline use is short (flaky connections, not week-long trips) or single-user per page | Long offline multi-writer is a real requirement: keep pending ops as intent ops and rebase via server reconciliation; accept that some conflicts need UI (Moment) | [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/), [Moment](https://www.moment.dev/blog/lies-i-was-told-pt-1), [Replicache](https://doc.replicache.dev/concepts/how-it-works) |
| **Array indices in ops + server serialisation** (reject or rebase stale index ops) | Optimistic concurrent list edits without rejections; stable references to list slots | One editor per list at a time, or clients wait for ack before the next list op | Move to fractional-index `pos` on each child (one property; moves become one LWW write) | [RFC 6902](https://www.rfc-editor.org/rfc/rfc6902), [Weidner](https://mattweidner.com/2024/06/04/server-architectures.html) |
| **Fractional index ordering instead of a list CRDT** | Non-interleaving of concurrently inserted runs; keys can grow | Lists hold objects (pages, blocks, cards) and not characters; interleaving is harmless or fixable by hand | Character-level text: Fugue-based list-positions, or Articulated insert-after IDs | [Figma](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/), [Fugue](https://martin.kleppmann.com/2025/11/01/fugue-minimizing-interleaving.html), [Loro](https://loro.dev/docs/tutorial/tree) |
| **Whole-Item versioning** (Excalidraw: version + nonce per element) instead of per-property ops | Concurrent edits to *different* properties of the same Item: one whole Item wins | Items are small and edited by one person at a time | Switch to per-property ops (same log, finer keys) | [Excalidraw](https://plus.excalidraw.com/blog/building-excalidraw-p2p-collaboration-feature) |
| **Wait-for-ack (no optimistic UI)** | Instant local feel; usable on high-latency links | LAN or low-latency use, low edit rates, or a single-user app | Optimistic apply plus pending queue; drop conflicting incoming values for pending keys (Figma) or full server reconciliation | [Weidner](https://mattweidner.com/2024/06/04/server-architectures.html), [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/) |
| **Relaxed fsync** (batch every ~0.5–1s, or rely on OS flush) | The last ~1s (or ~30s with no fsync) of acknowledged edits on power loss or kernel crash | The data is not transactional or financial and clients can re-send unacked ops | fsync before acking each batch (Redis `always`-style, with group commit) | [Redis](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/), [NeDB](https://github.com/louischatriot/nedb), [Figma](https://www.figma.com/blog/making-multiplayer-more-reliable/) |
| **Whole Page in memory; load a full page at a time** | Partial loading within a page; very large pages | Pages are modest in size; the tree is split into child Pages that load lazily | Linear-style lazy references and partial indexes; split large pages | [NeDB](https://github.com/louischatriot/nedb), [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/), [reverse-linear](https://github.com/wzhudev/reverse-linear-sync-engine) |
| **Additive-only weak schema** (never rename, never repurpose; defaults for missing fields) | Clean renames and restructures in stored data | The model evolves by adding properties (Figma: new features usually mean new properties) | Per-line `v` plus upcast-on-read; rewrite snapshots; Cambria-style lenses for bidirectional needs | [Greg Young/InfoQ](https://www.infoq.com/news/2017/07/versioning-event-sourcing), [Cambria](https://www.inkandswitch.com/cambria/), [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/) |
| **Local-only undo stack of inverse ops** (not shared or global undo) | Undo that survives reload or follows the user across devices; "undo someone else's change" | Undo is a per-session convenience | Persist the undo stack per user; add Stewen & Kleppmann-style register undo semantics | [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/), [Yjs UndoManager](https://docs.yjs.dev/api/undo-manager), [Stewen & Kleppmann](https://arxiv.org/abs/2404.11308) |
| **Ephemeral presence** (not logged; heartbeat timeout) | Persisted "last seen" or activity history | Presence is only for live cursors and who-is-here | Write a separate low-priority activity log | [Yjs awareness](https://docs.yjs.dev/api/about-awareness) |
| **Server-side cycle rejection for reparenting** (instead of a tree-move CRDT) | Correct concurrent moves without a server | The sequencer exists, so the server can validate | Kleppmann undo-do-redo tree-move algorithm (O(nd) per remote op) | [Figma](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/), [move-op paper](https://martin.kleppmann.com/papers/move-op.pdf) |

**CAP-style framing.**
- The single-sequencer choice is effectively choosing *consistency and simplicity over availability under partition*. During a partition clients can't commit; they can only queue.
- Snapshot-plus-truncate trades *history* for *bounded storage and fast load*.
- LWW trades *merge fidelity* for *zero merge code*.
- Online-first trades *offline autonomy* for *simple reconnection*.
- Each concession above is local: lifting one (for example making one text field a CRDT) does not invalidate the per-Page JSONL log design, which is the main reason to start with all of them in place.

**Suggested default bundle for this user.** Rows 1, 2, 3 (archive rather than delete if cheap), 4 (Figma-style reload-and-reapply), 6, 9 (batch fsync about 1s), 10 (per-Page loading), 11, 12, 13 and 14. Lift row 5 immediately: use `pos` properties, not indices, because the cost is negligible and it removes the main JSON-Patch pitfall.

### Gaps
- No source quantifies how often real users hit same-property concurrent conflicts, beyond Linear's qualitative "not that common" and Moment's 20–30% figure. Moment's figure covers deliberately constructed direct conflicts, not natural frequency.
- No source gives an explicit "concessions table" for homegrown sync. The table synthesises the cited systems' choices.
