# Storage and compaction: lessons from battle-tested stores

Status: complete (lessons-storage agent, 2026-10-29).

**What this is.** Five storage layers (plus Redis AOF as an optional sixth) that already solved "append changes, replay on load, compact without losing data", read at the source level. Each section says what the library does, shows the key code, says what failure it prevents, and then says what lew42 should do about it.

**At a glance (what each one teaches):**

- **automerge-repo:** compaction deletes only the chunks it already loaded; write the new snapshot first.
- **jsonl-db:** one writer loop per file, a lockfile, a fsynced three-file swap, recovery on open.
- **nedb:** temp + fsync + rename; refuse to load a mostly-corrupt file; do not compact on load.
- **y-leveldb / Hocuspocus:** the merged state gets a higher seq, delete only below it; debounce with a max cap; keep in memory if the store fails.
- **ZODB FileStorage:** a commit byte, torn tails cut to a side file (never dropped), indexes are disposable caches, pack keeps `.old`.
- **Redis AOF:** base + incremental files named by a manifest; old files become "history".

Jump to: [Top recommendations](#top-recommendations-for-the-store-ranked) · [Adapter interface](#proposed-store-adapter-interface) · [Compaction policy](#compaction-policy-that-keeps-history)

**lew42 code under study:** `lew42/monorepo` at commit `9ba46ee8`. Permalink prefix used below: `L42 = https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895`.

**How lew42 stores today (one paragraph).** One `.jsonl` file per root object (page, session, task). In the browser, `Item.Store` batches a tick's deltas in a microtask and posts them ([Store.js L173-L214](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L173-L214)). Servex's `record_lines` applies each line to the warm live root, then `fs.appendFileSync` ([page_tools.js L1101-L1119](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L1101-L1119), [write_line L175-L184](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L175-L184)). A fallback append de-duplicates by `by`+`ts` in the last 64 KB ([RecordWriter.js L67-L99](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L67-L99)). The dev server tails by byte offset and only ever sends whole lines ([Tail.js L54-L74](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L54-L74)); a shrunk file sends `jsonl_reset` and the reader replays from 0. On load, a torn line is skipped with a warning ([Store.js L91-L96](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L91-L96)). There is **no compaction, no snapshot line, no fsync** yet; compaction is designed as "move old lines to `page.<n>.jsonl`, restart with a snapshot line" ([Page doc/architecture.md L63-L71](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L63-L71)) and "the snapshot is appended, written only by Servex" ([design-decisions-2026-10-27.md L91](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L91)). `Server/Compact.mjs` is a dry-run planner only.

---

## 1. automerge-repo: content-addressed chunks, compaction deletes only what it loaded

**Pinned:** `automerge/automerge-repo` at `3ab7c33b` (prefix `AM = https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c`).

**What it does.** Each document is stored as many small binary chunks under array keys: `[docId, "incremental", sha256(bytes)]` for each save and `[docId, "snapshot", hash(heads)]` for a compacted whole. Load reads all snapshots, then all incrementals, concatenates them and lets Automerge merge (duplicates are harmless). Saves are throttled per document (100 ms default).

**Key mechanism** ([StorageSubsystem.ts L286-L328](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/storage/StorageSubsystem.ts#L286-L328), trimmed):

```ts
async #saveTotal(documentId, doc, sourceChunks) {   // sourceChunks = what THIS process loaded or wrote
  const binary = A.save(doc)
  const snapshotHash = headsHash(A.getHeads(doc))
  const key = [documentId, "snapshot", snapshotHash]
  const oldKeys = new Set(sourceChunks.map(c => c.key).filter(k => k[2] !== snapshotHash))
  await this.#storageAdapter.save(key, binary)      // 1. write the new snapshot FIRST
  for (const key of oldKeys)                         // 2. then delete only chunks we know are inside it
    await this.#storageAdapter.remove(key)
  ...
}
```

When to compact ([L378-L396](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/storage/StorageSubsystem.ts#L378-L396)): `snapshotSize < 1024 || incrementalSize >= snapshotSize`. So total storage stays under about 2x the snapshot, and the rule needs no tuning.

The adapter is five methods on `string[]` keys and `Uint8Array` values ([StorageAdapterInterface.ts L9-L42](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/storage/StorageAdapterInterface.ts#L9-L42)): `load`, `save`, `remove`, `loadRange(prefix)`, `removeRange(prefix)`, plus optional `close`. The NodeFS adapter maps a key to a path (`ab/cdef.../snapshot/<hash>`) ([index.ts L174-L182](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo-storage-nodefs/src/index.ts#L174-L182)), serves reads of in-flight writes from a memory cache because `writeFile` is not atomic ([L39-L48](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo-storage-nodefs/src/index.ts#L39-L48)), and caps concurrent file opens at 100 to avoid `EMFILE` ([L15-L21](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo-storage-nodefs/src/index.ts#L15-L21)).

**Why.** Several tabs or processes can share one storage (IndexedDB, a folder). The docs: a tab "only deletes the incremental changes it had previously loaded", and because a key is derived from its content, "even if we overwrite data another process has written it must contain the same changes" ([automerge.org storage docs](https://automerge.org/docs/reference/under-the-hood/storage/)). So two concurrent compactions cannot lose each other's data, and the storage needs no locks or transactions. Write-then-delete order means a crash mid-compaction leaves a duplicate, never a gap. Save failures are caught and logged; the change stays in memory and the next save includes it ([StorageSource.ts L94-L110](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/StorageSource.ts#L94-L110)).

**Lesson for lew42.**

- **Adapt the "delete only what you folded" rule.** lew42's compaction worry is exactly this: "a snapshot line computed from memory can miss a line appended during the compute" ([design-decisions L91](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L91)). Automerge's answer: record **which bytes you replayed** (for a file, the byte offset; for a DB, the max `seq`), write the snapshot as "state as of offset N", and only archive lines `< N`. Lines appended after N stay live. lew42 already tracks offsets per reader in Tail.js, so this is cheap.
- **Adapt write-new-then-remove-old.** Never truncate `page.jsonl` first. Write the snapshot (and archive segment) durably, then switch.
- **Ignore content-hash keys for lines.** lew42's lines are not idempotent CRDT changes (replaying a `move` twice is not a no-op), so duplicate chunks would corrupt state. The lew42 analogue of idempotency is the `by`+`ts` twin check, which already exists ([RecordWriter.fresh L71-L75](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L71-L75)); the adapter interface below adds a cursor and `ifHead` so it can become exact.
- **Adopt the size-ratio trigger.** "Compact when the deltas since the last snapshot are bigger than the snapshot" is better than a fixed 1 MB: it bounds replay cost to about 2x and never fires on a small, stable page.
- **Adopt the key-prefix adapter shape**, but for logs (append + range read), not blobs: see "Proposed store adapter interface" below.

---

## 2. @alcalzone/jsonl-db: one writer, a persistence loop, and a three-file swap

**Pinned:** `AlCalzone/jsonl-db` at `46865f4e`. Used by Z-Wave JS (ioBroker) to hold device caches on small boards, where power cuts are common.

**What it does.** A key-value `Map` kept in memory, persisted as JSONL lines `{"k":key,"v":value}` (a line with no `v` is a delete). Every change goes into an in-memory journal; one background loop drains it to disk, optionally throttled, and rewrites ("compresses") the file when it has grown too much. A lockfile stops a second process from opening the same file.

**Key mechanism 1, compaction as a three-file swap** ([db.ts L1070-L1102](https://github.com/AlCalzone/jsonl-db/blob/46865f4edecfcfbedc196c6b02e0c8ae96ce073f/src/lib/db.ts#L1070-L1102), trimmed):

```ts
private async doCompress() {
  // 1. flush the journal to the live file, fsync, close
  this._handle = await this.writeJournalToFile(this._handle, this.drainJournal())
  await this._handle.close()
  // 2. write the whole state to file.jsonl.dump
  await this.dumpInternal(this.dumpFilename, true)
  // 3. fsync the directory, then swap: live -> .bak, .dump -> live
  await fsyncDir(dir)
  await fs.rename(this.filename, this.backupFilename)
  await fs.rename(this.dumpFilename, this.filename)
  await fsyncDir(dir)
  // 4. only now delete the old log
  await fs.unlink(this.backupFilename)
  this._handle = await fs.open(this.filename, "a+")
}
```

**Key mechanism 2, recovery on open** ([L489-L567](https://github.com/AlCalzone/jsonl-db/blob/46865f4edecfcfbedc196c6b02e0c8ae96ce073f/src/lib/db.ts#L489-L567)), pseudocode:

```
if file.jsonl exists and size > 0: delete .bak and .dump; use it
else if .bak exists and size > 0: rename .bak -> file.jsonl  (complete old data)
else if .dump exists and size > 0: rename .dump -> file.jsonl (may be partial, last resort)
```

**Key mechanism 3, the write loop** ([L844-L1008](https://github.com/AlCalzone/jsonl-db/blob/46865f4edecfcfbedc196c6b02e0c8ae96ce073f/src/lib/db.ts#L844-L1008)). One `while(true)` waits on `Promise.race` of: "journal over `maxBufferedCommands`", "throttle timer elapsed", "compress-by-time timer", "compress-by-size needed", "outside task (dump/compress/stop)". All file work happens in this one loop, so a dump can never interleave with an append. Each flush coalesces the journal (last write per key wins), writes it as one string, then `fd.sync()` ([L1011-L1063](https://github.com/AlCalzone/jsonl-db/blob/46865f4edecfcfbedc196c6b02e0c8ae96ce073f/src/lib/db.ts#L1011-L1063)).

**Triggers** ([L315-L327](https://github.com/AlCalzone/jsonl-db/blob/46865f4edecfcfbedc196c6b02e0c8ae96ce073f/src/lib/db.ts#L315-L327), [L827-L842](https://github.com/AlCalzone/jsonl-db/blob/46865f4edecfcfbedc196c6b02e0c8ae96ce073f/src/lib/db.ts#L827-L842)): compress when `lineCount >= max(sizeFactorMinimumSize, sizeFactor * liveKeys)`, or every `intervalMs` if at least `intervalMinChanges` happened, or on open, or on close.

**Load** ([L410-L472](https://github.com/AlCalzone/jsonl-db/blob/46865f4edecfcfbedc196c6b02e0c8ae96ce073f/src/lib/db.ts#L410-L472)): first pass reads only the key of each line with string search (no `JSON.parse`) and keeps the last line per key; second pass parses only those survivors. A bad line rejects `open()` unless `ignoreReadErrors` is set; the README warns that ignoring "may result in inconsistent data".

**Why.** The changelog is a list of failures fixed: 1.2.3 "a crash that happens while compressing the DB when the `.bak` file exists"; 1.2.5 "Prevent opening one DB file in multiple instances ... using lockfiles"; 2.1.0 "recover from crashes that happened while compressing the DB" and "Ensure that the DB files are flushed to disk when closing or renaming files"; 2.4.2 "`dump` and `compress` are now properly sequenced and should no longer conflict"; 2.5.3 "Consider lockfiles from the future to be stale" ([README changelog](https://github.com/AlCalzone/jsonl-db/blob/46865f4edecfcfbedc196c6b02e0c8ae96ce073f/README.md)). The directory fsync before and after the renames is there because a rename is only durable once the directory entry is on disk. The README is honest about the throttle: "buffered data will be lost in case the process crashes".

**Lesson for lew42.**

- **Adopt one serialized writer loop per file.** lew42 has several writers to one file: Servex `record_lines`, the dev server's `Append.js` fallback, `LogLine`, hooks ([RecordWriter.js header L1-L16](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L1-L16)). They are safe today only because every write is one `appendFileSync` of whole lines (O_APPEND keeps lines whole) and the twin check reads the tail. Compaction breaks that: a rename while another process appends to the old inode loses the append. jsonl-db's answer is a lock plus one loop. For lew42: compaction runs **only inside Servex** (already the plan) and every other writer must go through Servex or take the same lock. A lockfile beside the log (`page.jsonl.lock`, with stale-mtime detection like `proper-lockfile`) is enough for the file adapter; a Durable Object gives this for free (one instance per page).
- **Adopt the "write the new file fully, fsync, rename, fsync dir" sequence** for any rewrite, plus the recovery check on open. lew42 has no rewrite today, but the planned compaction ("restart the live file with one snapshot line") is a rewrite of `page.jsonl`. Tail.js already handles a shrunk file with `jsonl_reset` ([Tail.js L89-L102](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L89-L102)), so readers survive the swap.
- **Adapt, do not copy, the delete step.** jsonl-db deletes `.bak`. lew42's rule is "never destructive". Rename the old log to its archive name instead of unlinking it (see the compaction policy below).
- **Adopt `fd.sync()` after a batch, behind a flag.** lew42's `write_line` and `Append.js` call `appendFileSync` with no fsync ([page_tools.js L181-L182](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L181-L182), [Append.js L84-L100](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.js#L84-L100)). On a dev PC that is fine for normal lines; it matters for the compaction swap, where a power cut between rename and data flush can leave an empty file.
- **Adopt the two-pass load idea later, for big logs.** For lew42, the analogue is: find the last snapshot line first (scan backwards from the end), then parse only lines after it.
- **Keep lew42's torn-line tolerance, but only at the tail.** lew42 skips any unparsable line anywhere ([Store.js L91-L96](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L91-L96)). jsonl-db refuses by default. A torn **last** line is a normal crash artifact; a bad line in the **middle** means real corruption, and for a delta log (where later lines depend on earlier ones) replaying past it silently can build the wrong tree. Warn loudly (or refuse) on a mid-file bad line.

## 3. @seald-io/nedb: append on change, compact on every load, corruption threshold

**Pinned:** `seald/nedb` at `84b6fc9b` (the maintained fork of Louis Chatriot's NeDB).

**What it does.** An embedded MongoDB-like store: all documents live in memory; each insert, update or remove appends the full new document (or `{_id, $$deleted:true}`) as one line. On every load it replays the file (last line per `_id` wins) and immediately rewrites it compacted. Optional `setAutocompactionInterval` repeats the rewrite on a timer.

**Key mechanism 1, crash-safe rewrite** ([storage.js L236-L251](https://github.com/seald/nedb/blob/84b6fc9bc5f6aa2ab99a451186730dbb9a3baf1f/lib/storage.js#L236-L251)):

```js
const crashSafeWriteFileLinesAsync = async (filename, lines, modes) => {
  const tempFilename = filename + '~'
  await flushToStorageAsync({ filename: path.dirname(filename), isDir: true }) // dir fsync
  if (await existsAsync(filename)) await flushToStorageAsync({ filename })     // old file on disk
  await writeFileLinesAsync(tempFilename, lines)                              // write new copy
  await flushToStorageAsync({ filename: tempFilename })                       // fsync new copy
  await renameAsync(tempFilename, filename)                                   // atomic swap
  await flushToStorageAsync({ filename: path.dirname(filename), isDir: true }) // dir fsync
}
```

and on load ([L260-L272](https://github.com/seald/nedb/blob/84b6fc9bc5f6aa2ab99a451186730dbb9a3baf1f/lib/storage.js#L260-L272)): if `db` is missing but `db~` exists, the rewrite died between delete and rename, so rename `db~` back. (On POSIX the rename replaces atomically, so this is mostly a Windows / odd-filesystem guard.)

**Key mechanism 2, corruption threshold** ([persistence.js L237-L292](https://github.com/seald/nedb/blob/84b6fc9bc5f6aa2ab99a451186730dbb9a3baf1f/lib/persistence.js#L237-L292)):

```js
lineStream.on('data', line => waterfall(async () => {
  try { const doc = model.deserialize(line)
        if (doc.$$deleted) delete dataById[doc._id]; else dataById[doc._id] = doc }
  catch { corruptItems++ }
  dataLength++
}))
// at end:
if (corruptItems / dataLength > this.corruptAlertThreshold)   // default 0.1
  reject(new Error('... Cautiously refusing to start NeDB to prevent dataloss.'))
```

**Key mechanism 3, memory first, then append, one queue** ([datastore.js L698-L704](https://github.com/seald/nedb/blob/84b6fc9bc5f6aa2ab99a451186730dbb9a3baf1f/lib/datastore.js#L698-L704)): `_insertInCache(doc)` then `await persistence.persistNewStateAsync([doc])`, and every public call runs through `executor.pushAsync`, a single FIFO, so compaction and appends never overlap ([datastore.js L332-L334](https://github.com/seald/nedb/blob/84b6fc9bc5f6aa2ab99a451186730dbb9a3baf1f/lib/datastore.js#L332-L334)).

**Why.** The header comment in persistence.js spells out the durability contract ([L11-L40](https://github.com/seald/nedb/blob/84b6fc9bc5f6aa2ab99a451186730dbb9a3baf1f/lib/persistence.js#L11-L40)): "compaction forces the OS to physically flush data to disk, while appends to the data file do not ... a server crash can never cause complete data loss ... The worst that can happen is a crash between two syncs", "NeDB being very close to Redis AOF persistence with `appendfsync` option set to `no`." The threshold exists because a torn last line is normal after a crash, but a file that is mostly garbage means something is badly wrong, and silently loading it, then compacting it (load always compacts), would **permanently drop** the unreadable records. The serialization-hook check refuses to start if only one of the two hooks is set, for the same reason ([L71-L79](https://github.com/seald/nedb/blob/84b6fc9bc5f6aa2ab99a451186730dbb9a3baf1f/lib/persistence.js#L71-L79)). Note what nedb does **not** do: no lockfile; two processes on one file corrupt it.

**Lesson for lew42.**

- **Adopt the corruption threshold, adapted to deltas.** lew42 skips every bad line with one console warning ([Store.js L91-L96](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L91-L96)); `Server/Compact.mjs` keeps unparsable lines verbatim ([Compact.mjs L21-L27](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/Compact.mjs#L21-L27)). Good. Add the counter: a compaction (snapshot) must **refuse** to run on a log with any mid-file unparsable line, because the snapshot would bake the skip in forever. nedb's "load always compacts" is the trap to avoid: it turns a read-time tolerance into a write-time loss.
- **Adopt the temp-file + fsync + rename + dir-fsync helper** as the one way the store rewrites anything (snapshot files, `settings.jsonl`, `directory.json`, `FileSaver`). lew42's `FileSaver` "rewrites the file through `FsFile.write`" ([Item readme](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/readme.md)); check that path uses this sequence.
- **Adopt "memory first, then one FIFO to disk".** lew42 already mutates memory first and batches per microtask ([Store.js L168-L178](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L168-L178)). What is missing is the server-side FIFO: `record_lines` is synchronous inside Servex (good, it is a FIFO by accident), but `Append.js` in the dev server is a second process with its own order. Route all writes through one queue per file before compaction exists.
- **Ignore "compact on every load".** It is cheap for nedb (state = latest doc per id) but for lew42 it would destroy history, and a page load happens in the browser, which must never rewrite.
- **Write down the durability contract** the way nedb's header does: "appends are not fsynced; a crash can lose the last ~N seconds; compaction is fsynced." One paragraph in `core/Item/readme.md` would settle what the store promises.

## 4. Yjs persistence: y-leveldb (merge after N updates) and Hocuspocus (debounced whole-state store)

**Pinned:** `yjs/y-leveldb` at `7207eb9a`; `ueberdosis/hocuspocus` at `74c12e67`.

Two opposite designs for the same CRDT.

### 4a. y-leveldb: an update log with a numeric clock, merged when it gets long

**What it does.** Each Yjs update is stored under the key `['v1', docName, 'update', clock]`, `clock` counting up from 0 ([y-leveldb.js L304](https://github.com/yjs/y-leveldb/blob/7207eb9ad58c0975e648207d354783b585e2a769/src/y-leveldb.js#L304)). Loading a doc reads the whole range and applies each update; if there were more than `PREFERRED_TRIM_SIZE = 500` updates, it writes the merged state as one new update and deletes the old range.

**Key mechanism** ([L402-L425](https://github.com/yjs/y-leveldb/blob/7207eb9ad58c0975e648207d354783b585e2a769/src/y-leveldb.js#L402-L425) and [L485-L499](https://github.com/yjs/y-leveldb/blob/7207eb9ad58c0975e648207d354783b585e2a769/src/y-leveldb.js#L485-L499), trimmed):

```js
const storeUpdate = async (db, docName, update) => {
  const clock = await getCurrentUpdateClock(db, docName)       // last key, reverse scan, limit 1
  await levelPut(db, ['v1', docName, 'update', clock + 1], update)
  return clock + 1
}
const flushDocument = async (db, docName, stateAsUpdate, stateVector) => {
  const clock = await storeUpdate(db, docName, stateAsUpdate)  // 1. append the merged state as the NEWEST entry
  await writeStateVector(db, docName, stateVector, clock)
  await clearUpdatesRange(db, docName, 0, clock)              // 2. delete everything BELOW it
  return clock
}
getYDoc(docName) { return this._transact(async db => {
  const updates = await getLevelUpdates(db, docName)
  ... apply each ...
  if (updates.length > PREFERRED_TRIM_SIZE) await flushDocument(db, docName, encodeStateAsUpdate(ydoc), ...)
}) }
```

Every public method goes through `_transact`, a promise chain that serializes all work on the db ([L440-L466](https://github.com/yjs/y-leveldb/blob/7207eb9ad58c0975e648207d354783b585e2a769/src/y-leveldb.js#L440-L466)); its `@todo` admits it is one global queue, not per room.

**Why.** The merged state is written with a clock **higher** than every update it contains, then only the range **below** it is deleted. A crash after step 1 leaves the old updates plus the merged copy, which Yjs merges harmlessly. Compaction happens on read, where the full state is already in memory, so it costs almost nothing extra. The stored state vector is tagged with the clock it was computed at, so `getStateVector` can tell it is stale by comparing to the current last clock ([L505-L522](https://github.com/yjs/y-leveldb/blob/7207eb9ad58c0975e648207d354783b585e2a769/src/y-leveldb.js#L505-L522)).

### 4b. Hocuspocus: debounce, then store the whole state; keep it in memory if the store fails

**What it does.** Hocuspocus keeps the live Y.Doc in memory. On change it schedules `onStoreDocument` with a debounce of 2 s and a hard cap of 10 s (`maxDebounce`) ([Hocuspocus.ts L25-L40](https://github.com/ueberdosis/hocuspocus/blob/74c12e670324f7659f7d905df28736a82be0ec9d/packages/server/src/Hocuspocus.ts#L25-L40)). The Database extension then stores `Y.encodeStateAsUpdate(doc)`, the full state ([Database.ts L56-L61](https://github.com/ueberdosis/hocuspocus/blob/74c12e670324f7659f7d905df28736a82be0ec9d/packages/extension-database/src/Database.ts#L56-L61)); the SQLite extension is a single-row upsert per document ([SQLite.ts L6-L19](https://github.com/ueberdosis/hocuspocus/blob/74c12e670324f7659f7d905df28736a82be0ec9d/packages/extension-sqlite/src/SQLite.ts#L6-L19)). No log, no history.

**Key mechanism** ([util/debounce.ts L14-L58](https://github.com/ueberdosis/hocuspocus/blob/74c12e670324f7659f7d905df28736a82be0ec9d/packages/server/src/util/debounce.ts#L14-L58), trimmed):

```ts
const debounce = async (id, func, debounce, maxDebounce) => {
  const old = timers.get(id)
  const start = old?.start || Date.now()        // first change of the burst
  const run = async () => {
    timers.delete(id)
    if (runningExecutions.has(id)) await runningExecutions.get(id)   // never two stores at once
    ...
  }
  if (old?.timeout) clearTimeout(old.timeout)
  if (debounce === 0 || Date.now() - start >= maxDebounce) return run()  // cap: busy doc still saves
  timers.set(id, { start, timeout: setTimeout(run, debounce), func: run })
}
```

And on failure ([Hocuspocus.ts L517-L557](https://github.com/ueberdosis/hocuspocus/blob/74c12e670324f7659f7d905df28736a82be0ec9d/packages/server/src/Hocuspocus.ts#L517-L557)): `"Caught error during storeDocumentHooks. Document stays in memory to avoid data loss"`; the document is not unloaded, so the next change retries.

**Why.** Debounce alone starves a document that never goes quiet (a live call); `maxDebounce` guarantees a save at least every 10 s. Waiting for the running store before starting the next prevents an older state from finishing last and overwriting a newer one. Unloading only after a successful store prevents the classic "evicted from memory before it hit disk".

### Lesson for lew42

- **Adopt y-leveldb's "snapshot gets a higher seq, delete only below it".** This is the same rule as automerge's, in log form, and it fits lew42 exactly: append the snapshot line to `page.jsonl` (seq N), then everything before N is archivable. lew42's decided direction already says "the snapshot is appended (never a rewrite)" ([design-decisions L91](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L91)). y-leveldb shows the second half: the reader starts from the **last** snapshot line, and the archiver moves the prefix before it.
- **Adopt "compact where the state is already built".** lew42's blocker is "it needs a node-side replay that matches `Page.set()` exactly" ([Page architecture.md L69-L71](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L69-L71)). Servex's `record_lines` already keeps a **warm live root** and applies every line to it ([page_tools.js L1101-L1119](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L1101-L1119)). That warm root's `toJSON()` is the snapshot, computed by the one writer, at a known offset. Add a self-check: replay the snapshot into a fresh root and compare `toJSON()` before accepting it.
- **Adopt the "hidden key component" for a per-file sequence.** y-leveldb finds the next clock with one reverse scan. lew42's lines have no sequence number; offsets play that role for files but not for SQLite or R2. Give the store a cursor (`gen:offset` for files, `rowid` for SQLite, `seq` for R2) assigned by the one writer; see the adapter interface below.
- **Adopt Hocuspocus's debounce + maxDebounce for snapshots only**, not for deltas. lew42's deltas should keep appending per microtask (that is the streaming record). A *snapshot* is the whole state, like Hocuspocus's store: debounce it (30 s quiet, 10 min cap) and trigger by size, as in the compaction policy below.
- **Adopt "keep it in memory if the write failed".** lew42's `Store.flush` drops lines on the floor when it is off localhost and only warns once ([Store.js L185-L191](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L185-L191)); on a failed send it does not re-queue. A small "unsent" queue, retried on the next flush or on reconnect, is the Hocuspocus rule.
- **Ignore Hocuspocus's single-row overwrite** for lew42's pages: it throws history away, which breaks the owner's "never destructive" rule. It is a fine model for the *current-state index* rows lew42 already uses for sessions ([Page architecture.md L73-L78](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L73-L78)).

## 5. ZODB FileStorage: a status byte for "not committed yet", a disposable index, and pack to `.old`

**Pinned:** `zopefoundation/ZODB` at `c50a0941`. One file (`Data.fs`) has held Zope/Plone databases since the late 1990s. Mechanism only; the Python is not the point.

**What it does.** `Data.fs` is an append-only sequence of transaction records. Each record: an 8-byte tid (also a timestamp), a length, **a 1-byte status**, user/description, then data records (oid, tid, back-pointer to the object's previous record, data), then the **length again** at the end ([format.py L17-L80](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/format.py#L17-L80)). An in-memory index maps each oid to the offset of its current record; it is cached in `Data.fs.index` but can always be rebuilt by scanning. "Pack" copies only what is still reachable into `Data.fs.pack`, then swaps.

**Key mechanism 1, the 'c' (checkpoint) flag** ([format.py L30-L39](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/format.py#L30-L39), [FileStorage.py L802-L885](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/FileStorage.py#L802-L885)), pseudocode:

```
vote():   write header with status 'c', copy data from the .tmp file, write trailing length, flush
          on any error: truncate the file back to the old end ("we don't want any turd at the end")
finish(): seek back, overwrite the status byte with ' ' (committed), flush, fsync
          only now: pos = nextpos, index.update(tindex)    # the index learns about it last
abort():  truncate back to pos
```

So the commit point is **one byte**. A record with status `'c'` was never finished and is not data.

**Key mechanism 2, recovery while scanning** ([FileStorage.py L1655-L1705](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/FileStorage.py#L1655-L1705), [_truncate L1783-L1805](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/FileStorage.py#L1783-L1805)):

```
if header is short:                         truncate here (torn tail)
if pos + len > file_size or status == 'c':  _truncate(file, pos)  # incomplete last txn
if header lengths are inconsistent:
    read the REDUNDANT length at the very end of the file
    if it says the tail is garbage:  _truncate(file, pos)  # crash debris at the end
    else:                            panic("invalid transaction header")  # mid-file corruption: stop
_truncate(file, pos): copy bytes pos..end to Data.fs.tr0 (tr1, tr2 ...), THEN truncate
```

**Key mechanism 3, the index is a cache with a sanity check** ([L369-L397](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/FileStorage.py#L369-L397), [L399-L461](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/FileStorage.py#L399-L461)). The `.index` file stores the index plus the file position it covers, written to `.index_tmp` then renamed. On open, `_check_sanity` walks back up to 5 data records from that position, using the trailing lengths, and checks each one is where the index says; if not, it ignores the index and rescans ([L463-L510](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/FileStorage.py#L463-L510)). The class docstring says the ancillary files "can be lost without affecting data integrity" ([L195-L235](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/FileStorage.py#L195-L235)).

**Key mechanism 4, pack** ([FileStorage.py L1210-L1290](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/FileStorage.py#L1210-L1290), [fspack.py L400-L497](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/fspack.py#L400-L497), [copyRest L621-L673](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/fspack.py#L621-L673)):

```
phase 1 (no commit lock): copy reachable records with tid < packtime into Data.fs.pack
phase 2 (commit lock, released between txns): copy EVERY txn after packtime, one at a time,
        until the end of the file (writers keep appending meanwhile)
swap (write lock): rename Data.fs -> Data.fs.old ; rename Data.fs.pack -> Data.fs
if not pack_keep_old: remove Data.fs.old      # pack_keep_old defaults to True
```

**Why.** The comments name the failures. Vote truncates on error because a half-written record "at the end" would poison every later read. Recovery copies the cut bytes to `.trN` because the tail "may also be corrupted, in which case, we don't want to totally lose the data". The redundant trailing length tells "bad data in the middle of the file" from "a turd that Win 9x dropped at the end when the system crashed" ([L1686-L1705](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/FileStorage.py#L1686-L1705)). Pack copies the post-packtime tail under the commit lock, one transaction at a time, so writers are only paused briefly, and it reopens the file unbuffered because a buffered reader "could read stale data from the tail end of the file" ([fspack.py L455-L470](https://github.com/zopefoundation/ZODB/blob/c50a0941d40b22ff5b6fb30a5eab625fa4beba62/src/ZODB/FileStorage/fspack.py#L455-L470)). `.old` is kept by default so a bad pack can be undone.

**Lesson for lew42.**

- **Adopt "cut bytes are moved aside, never dropped".** When lew42 finds a torn tail it skips it in memory only ([Store.js L91-L96](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L91-L96)), and `append_once` adds a leading newline so the next line is whole ([RecordWriter.js L95-L97](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L95-L97)). That is already ZODB-grade for the append path. When compaction lands, any line it cannot parse goes to `page.jsonl.trN` (or the archive), never into the void. This matches the owner's "never destructive" rule exactly.
- **Adopt "mid-file corruption stops, tail corruption is trimmed".** Same lesson as nedb, with ZODB's tool for telling them apart: lew42 lines end with `\n`, so "last line has no trailing newline" = torn tail; "a line in the middle fails to parse" = stop and report.
- **Adapt the 'c' flag as a batch marker, only if needed.** lew42 has no multi-line transactions yet, and the design doc wants one ([design-decisions L90](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L90): "send both as one delta ARRAY, one JSONL line"). One line per batch is the simpler JSONL version of the 'c' byte: a line is either whole or torn. Prefer that over a begin/commit marker.
- **Adopt "the index is a disposable cache that records the offset it covers".** lew42's warm root in Servex uses `size:mtime` as a signature ([page_tools.js L746](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L746)). Any future snapshot or index file should store `{covers: <byte offset or seq>, ...}`, be checked against the log on open, and be thrown away and rebuilt if it does not match. The log is the truth; snapshots are caches.
- **Adopt pack's two phases** if compaction must run while writers append: copy up to offset N without a lock, then take the lock, copy N..end, swap. For lew42 the simpler form is enough: only Servex writes, so "take the per-file lock, snapshot at current end, release" is a few milliseconds.
- **Adopt `pack_keep_old = true` as the default, and never remove it automatically.** That is the archive in the compaction policy below.

## 6. Optional: Redis multi-part AOF (base + incr files, a manifest, history files)

**Pinned:** `redis/redis` at `41888396` (sparse clone, `src/aof.c` only).

**What it does.** Since Redis 7 the append-only file is a **set of files** named by a small manifest: one base file (a snapshot), then incremental files, each with a `seq` and a type `b` / `i` / `h` (history) ([aof.c L200-L228](https://github.com/redis/redis/blob/41888396080aab24ad5218f2e45e66158e24884b/src/aof.c#L200-L228)). A rewrite first opens a **new** incr file for live writes, then a child writes a new base; on success the old base and incr files become `h` and are deleted in the background.

**Key mechanism** (pseudocode from [rewriteAppendOnlyFileBackground L3291-L3320](https://github.com/redis/redis/blob/41888396080aab24ad5218f2e45e66158e24884b/src/aof.c#L3291-L3320), [markRewrittenIncrAofAsHistory L510-L539](https://github.com/redis/redis/blob/41888396080aab24ad5218f2e45e66158e24884b/src/aof.c#L510-L539), [writeAofManifestFileToDir L544-L616](https://github.com/redis/redis/blob/41888396080aab24ad5218f2e45e66158e24884b/src/aof.c#L544-L616), [aofDelHistoryFiles L693-L715](https://github.com/redis/redis/blob/41888396080aab24ad5218f2e45e66158e24884b/src/aof.c#L693-L715)):

```
rewrite:
  flush; open incr seq K+1 for new writes          # live writes never touch the files being replaced
  child: write new base from memory
  on success: every incr except the current one -> type 'h'; old base -> 'h'
              write manifest.tmp, fsync, rename -> manifest, fsync dir   # the ONE commit point
              unless aof-disable-auto-gc: unlink 'h' files in background
load:
  read manifest; load base; replay incr files in seq order
  last file ends mid-command: truncate to last good offset if aof-load-truncated (default yes)
  bad format in the middle: refuse to start, point the operator at redis-check-aof
```

On a short write, Redis `ftruncate`s back to the last good size so no half command stays in the file ([flushAppendOnlyFile L1505-L1540](https://github.com/redis/redis/blob/41888396080aab24ad5218f2e45e66158e24884b/src/aof.c#L1505-L1540)); on load, an incomplete `MULTI/EXEC` at the end is reverted like a torn tail ([loadSingleAppendOnlyFile L2036-L2075](https://github.com/redis/redis/blob/41888396080aab24ad5218f2e45e66158e24884b/src/aof.c#L2036-L2075)).

**Why.** Before 7.0, a rewrite buffered concurrent writes in memory and wrote them to disk twice (the Redis persistence docs, summarized in [notes/delta_logs_build_vs_buy.md](../notes/delta_logs_build_vs_buy.md)). Opening a fresh incr file first means the rewrite never races the writer, and the manifest rename makes "which files are current" a single atomic fact.

**Lesson for lew42.**

- **Adopt the shape: segments + a manifest, with history as a file type rather than a deletion.** This is the cleanest fit for "JSONL now, R2 later": R2 has no append (only `put`, with `onlyIf` conditions; [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)), so a page on R2 must be immutable segment objects plus a manifest object. Redis's `'h'` type is exactly lew42's "archive, never delete": just never run the history GC.
- **Adopt "open the new segment first, then build the snapshot".** For lew42's file adapter: rename-free compaction is possible. New lines go to `page.jsonl` as always; compaction writes `page.snap.<seq>.json` and a manifest line, and archives the prefix. No writer ever has to switch files mid-flight.
- **Ignore the forked child.** lew42's state is small and in one process; build the snapshot synchronously from the warm root.

## Top recommendations for the store (ranked)

Each is one change, with the library it comes from. The first five matter before compaction ships; the rest make it pleasant.

1. **One writer per file, with a lock for the exceptions.** Compaction runs only in Servex, under a per-file lock (`page.jsonl.lock`, stale after ~10 s); the dev server's fallback `Append.js` and `RecordWriter.append_once` take the same lock before appending, so no line lands on a file mid-swap. *(jsonl-db lockfile + loop, nedb executor, y-leveldb `_transact`; a Durable Object gives this for free.)*
2. **Snapshot "as of cursor N", archive only what is before N.** The snapshot line records `of: {gen, offset}`; lines after N are carried over verbatim. *(automerge "delete only chunks it loaded", y-leveldb "merged update gets a higher clock, clear below it", ZODB pack `copyRest`.)*
3. **Archive, never truncate.** The old log becomes `page.<n>.jsonl` (the owner's own name, [Page architecture.md L63-L71](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L63-L71)) and nothing deletes it automatically. *(ZODB `pack_keep_old`, Redis history files with auto-GC off.)*
4. **One crash-safe rewrite helper:** write `x.tmp`, fsync, rename over `x`, fsync the directory; on open, a leftover `x.tmp` is recovered or moved aside, never silently deleted. *(nedb `crashSafeWriteFileLinesAsync`, jsonl-db `tryRecoverDBFiles`, Redis manifest.)*
5. **Torn tail is trimmed, mid-file damage stops.** A last line with no `\n` is moved to `page.jsonl.tr0` by the writer; an unparsable line in the middle makes compaction refuse and the load warn loudly (today [Store.js L91-L96](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L91-L96) skips both the same way). *(ZODB `_truncate` + redundant length, Redis `aof-load-truncated`, nedb `corruptAlertThreshold`.)*
6. **Size-ratio trigger with a debounce cap.** Compact when bytes since the last snapshot ≥ max(64 KB, snapshot size), after 30 s quiet or at most every 10 min while busy. *(automerge `#shouldCompact`, Hocuspocus `debounce`/`maxDebounce`.)*
7. **Snapshot self-check.** Before switching, replay the snapshot into a fresh root and compare `toJSON()`; a mismatch aborts. This answers the open question "a node-side replay that matches `Page.set()` exactly" ([Page architecture.md L69-L71](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L69-L71)) by testing it each time. *(ZODB `_check_sanity`: caches are verified, the log is truth.)*
8. **Readers detect a swapped file by generation, not only by size.** `Tail.read` resets when `size < from` ([Tail.js L54-L57](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L54-L57)); add an inode (or `gen` from line 1) check so a compacted file that happens to be larger still resets. *(ZODB `.index` stores the position it covers; jsonl-db reopens its handle after the swap.)*
9. **The browser keeps unsent lines.** `FsFile.send` returns `false` and the lines are gone ([FsFile.js L156-L166](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/filesystem/FsFile.js#L156-L166), [Store.js L185-L191](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L185-L191)); keep the stamped lines in an `unsent` queue and resend them unchanged on reconnect (same `by`+`ts`, so the twin check makes the resend safe). *(Hocuspocus "stays in memory to avoid data loss", automerge "the next save includes it".)*
10. **Write the durability contract down and fsync the risky steps.** One paragraph in `core/Item/readme.md`: appends are not fsynced (a power cut can lose the last seconds), compaction and snapshots are. *(nedb's persistence.js header, jsonl-db `fd.sync()` per batch.)*

## Failing tests (one per recommendation)

**The owner's rule** ([COORDINATION.md](../../COORDINATION.md), "Every recommendation comes with a failing test"): a fix is worth making only if a test fails today and passes after it. Below is one spec per recommendation above, numbered the same (F1 = recommendation 1).

**How these were checked.** I ran a throwaway probe for the "today" claim of each spec, against this checkout (`9ba46ee8`), from the scratchpad. Nothing was written in the repo. Where the probe showed a different failure than expected, the spec follows the probe. "Probe:" says what I saw.

**Harness.** Plain Node scripts using `core/Test/Test.js`, the same shape as [persistence.test.mjs](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/persistence.test.mjs) and [Stream.test.mjs](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Stream.test.mjs):

- Make a temp root with `fs.mkdtempSync`. Set `SERVEX_PUBLIC` for `page_tools.js` ([L15](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L15)) and `process.chdir(ROOT)` for `Append.js` / `Tail.js` / `Runtime.js` (they resolve `public` from the cwd, [Append.js L13](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.js#L13)).
- `register("…/Servex/agents/site-hooks.mjs")` for site-absolute imports.
- Run with `node <file>`; a failure sets the exit code. Remove the temp root in `finally`.

**Shared mocks, said once.**

- *Real websocket (F9):* the `ws` package the dev server already uses, on port 0, and the real browser `Socket.js` on top of Node's own `WebSocket`. Mocked: `sessionStorage` (a Map) and `show_reconnecting`/`hide_reconnecting` (a DOM banner). `ext/filesystem/FsFile.js` cannot be imported in Node: its UI imports touch `document` when the module loads. So the test maps that one module to a shim whose `socket()` and `send()` are copied verbatim from [FsFile.js L82-L91 and L156-L166](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/filesystem/FsFile.js#L82-L166). Recheck the copy if those lines change.
- *A second process (F1, F4):* `child_process.fork` of a tiny script that drives the real `Append` or `Runtime` handler with a recording socket object, as [Append.test.mjs](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.test.mjs) does.
- *Compaction (F2, F3, F6, F7, F8):* the compactor does not exist yet, so these tests call a planned `Compactor.compact(file)` / `Compactor.due(file)` and are **red today because the module is missing**. That alone is a weak "fails today". Each of them therefore also asserts the concrete thing that is wrong in today's code, so the red has a reason you can read.

### F1. A file rewrite never loses a line another process appended

- **Checks:** two writers on one record file never lose each other's lines. Today's in-place rewriters ([SessionConsolidate.mjs L109-L110](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/SessionConsolidate.mjs#L109-L110), reading and then `writeFileSync`-ing a moved task's `.jsonl`) take no lock. The dev server's fallback ([Append.js L84-L100](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.js#L84-L100)) also appends on its own.
- **Setup:** temp `public/t/task.jsonl` with 2 lines; a forked child running the real `Append` handler. Nothing mocked but the socket object.
- **Steps (deterministic):** parent reads the file → sends the child "go"; the child appends `{log:{msg:"tab line"}}` through `Append.append` and gets its answer → parent writes back its replaced text, as SessionConsolidate does.
- **Expected:** either the tab line is in the file, or the tab was refused (so it can retry).
- **Today:** the tab is told `"append successful"` and the line is gone. Probe: exactly that. A free-running version (3,000 appends against a loop of rewrites) lost 305 of 3,000.
- **After the fix:** the rewrite holds `page.jsonl.lock` from its read through its write. `Append` waits for or refuses the lock, or forwards to `record_lines`.
- **Honesty check:** real but rare. SessionConsolidate runs by hand, and the lost line has to arrive in the same few milliseconds. That is why the test forces the order rather than racing. Also cover: the rewrite going through `record_lines`, and a lockfile left by a crashed holder (stale after ~10 s).

### F2. A snapshot keeps the lines appended while it was computed

- **Checks:** snapshot as of cursor N. Lines appended after N stay live, and nothing before N is lost.
- **Setup:** temp `session.jsonl` with 3,000 lines, one-writer.test's seed ([one-writer.test.mjs L43-L45](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/one-writer.test.mjs#L43-L45)); the real `run_item` for appends; the planned `Compactor.compact(file)`.
- **Steps:** start `compact(file)`; while it builds the state, append 20 lines with `run_item` (as one-writer.test case 1 does). Then `Session.replay(lines of the new live file)` and `Session.replay(archive + live)`.
- **Expected:** both replays equal the live root. All 20 new lines are in the live file after the snapshot line. The archive is byte-identical to the file as it was at N.
- **Today:** no compactor. The thing the test would catch is the race named in [design-decisions L91](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L91): a snapshot from memory "can miss a line appended during the compute".
- **Honesty check:** real once compaction exists (agents append to session files all the time). Also cover: a line appended between the archive step and the rename, and a crash between them (F4).

### F3. A history line that was archived can still be read

- **Checks:** archive, never truncate. Every line that ever existed is still on disk after compaction.
- **Setup:** temp `page.jsonl` built through real `record_lines` (50 lines); `Compactor.compact`.
- **Steps:** keep a copy of the bytes; compact; read `page.1.jsonl`.
- **Expected:** `page.1.jsonl` is byte-identical to the copy. The live file's line 1 is `{snapshot, of:{file:"page.1.jsonl", offset}}`, and `of.offset` equals the copy's length.
- **Today:** no compactor. The only compaction code is [Compact.mjs](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/Compact.mjs), a dry run whose planned output folds lines and lists `git show <commit>` as the undo ([L117-L129](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/Compact.mjs#L117-L129)). For a gitignored session `page.jsonl` ([.gitignore L153-L154](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.gitignore#L153-L154)) that undo does not exist.
- **Second case, a real git merge** (`git init` in the temp dir, the repo's own `.gitattributes`): branch A compacts, branch B appends one line, then merge.
  - **Expected:** the compactor refuses a file changed on an open branch, or the merge result replays to A's state plus B's line, with no warnings.
  - **Probe:** the union merge gave `snapshot line, title, add a, add b, add c`, so the whole old history is back after the snapshot. `Page` replay happens to absorb the repeated `add`s (`List.add` with a known id), so the result looked right. A log with non-idempotent lines (a `move`, a counter, a task `log`) would double.
- **Honesty check:** the merge case is real: worktrees append to page logs, and every `.jsonl` merges with `union` ([.gitattributes L13](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.gitattributes#L13)).

### F4. A crash in the middle of a rewrite leaves the old file or the new one, never an empty one

- **Checks:** the crash-safe rewrite helper (temp file, fsync, rename).
- **Setup:** temp `public/t/doc.json` holding 8 MB of valid JSON; a forked child running the real [Runtime.write L30-L43](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Runtime.js#L30-L43). This is `rpc:write`, the path `FsFile.write` and `FileSaver` use. The child gets a 256 MB body.
- **Steps:** the child starts the write. The parent polls `fs.statSync(file).size` and sends SIGKILL the moment it changes. Then `JSON.parse` the file.
- **Expected:** the file parses, as either the old version or the new one; a leftover `doc.json.tmp` is allowed.
- **Today:** Probe: 5 of 5 runs left a **0-byte file**, because `writeFileSync` truncates first ([Runtime.js L37](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Runtime.js#L37)). A kill at a random moment usually missed the window (10 of 10 intact), which is why the test kills on the first size change.
- **Honesty check:** the window is real but short. It needs the dev server killed (Ctrl-C, a crash, Servex restarting it) during a save. For `.jsonl` this path is closed: `FsFile.write` refuses logs ([FsFile.js L99-L103](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/filesystem/FsFile.js#L99-L103)). It matters for `.json` saves and for the future compactor. SIGKILL does not test power loss (data still in the page cache survives a process kill), so fsync is not covered here. Say so in the test header. Also cover: the recovery on open from the policy (tmp present, live file missing).

### F5. A line appended after a torn tail is not glued onto it

- **Checks:** a torn last line (no `\n`) is set aside, and every later line stays whole.
- **Setup:** temp `public/t/page.jsonl` = one good line + `{"content":{"add":{"type":"text","id":"p1","text":"half` (no newline). Real `record_lines`, real `Append`, nothing mocked. Variant: a copy of the real tracked log [ux-consolidate/session.jsonl](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/sessions/2026/08/21/ux-consolidate/session.jsonl), one of two tracked `.jsonl` files in this checkout (of 10,359) that end without `\n`.
- **Steps:** `record_lines(file, [{description:"after the tear", by, ts}])`; separately `Append.append(...)` on another copy; then parse every line.
- **Expected:** the new line parses on its own line. The torn bytes are in `page.jsonl.tr0`, or at least on a line of their own.
- **Today:** Probe: both writers answer success and write the new line **onto the torn one**: one bad line, and the new line is lost to every reader. `write_line` appends with no newline check ([page_tools.js L181-L182](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L181-L182)), and so does `Append.js` ([L94](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Append.js#L94)). Other writers already guard it: `append_once` ([RecordWriter.js L95-L97](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L95-L97)), `LogLine.write` ([L110-L118](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/LogLine.mjs#L110-L118)), `Sessions.append` ([L621-L626](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/Sessions.js#L621-L626)). On the real file, the next `record_lines` turned 12 good lines into 11. The real file is valid, it just lacks a final newline.
- **Second check, same test:** a mid-file bad line. Feed a log with one bad line in the middle to the planned compactor. **Expected:** it refuses. **Today:** `Store.parse` skips it with the same warning as a torn tail ([Store.js L91-L96](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L91-L96)).
- **Honesty check:** the glue is real now, not only after compaction. Any hand edit, `git` merge or older writer that leaves no final newline makes the very next one-writer append unreadable.

### F6. Compaction triggers on the size ratio, after a quiet spell, with a cap

- **Checks:** `due(file)` is true only when bytes since the last snapshot ≥ max(64 KB, snapshot size) and the file has been quiet for 30 s, or 10 min have passed since the first line not yet in a snapshot.
- **Setup:** temp files built with real `record_lines`; the clock fixed, as [persistence.test.mjs L16-L17](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/persistence.test.mjs#L16-L17) fixes `Date`; the planned `Compactor.due`.
- **Steps / expected:** 10 KB log → false. 200 KB with a 50 KB snapshot, last write 5 s ago → false. Same at 31 s → true. Busy (a write every second) for 11 min → true.
- **Today:** no trigger exists. The only size signal is `large: true` past 1 MB in the write answer ([page_tools.js L186-L194](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L186-L194)), which nothing acts on. Checked: the largest tracked `session.jsonl` is 3.4 MB.
- **Honesty check:** a pure policy test; the states are real (busy voice sessions write for hours). Weakness: it tests the policy, not that Servex calls it. Add one integration assert: after 70 KB of real `record_lines` writes and a fake 31 s pass, `page.jsonl` line 1 is a snapshot.

### F7. A snapshot replays to the same tree, for every class that saves

- **Checks:** snapshot self-check. `make(snapshot)` equals the live root, for Item, List, Task, Session and Page, as roots of their own files.
- **Setup:** the persistence matrix's own roots and `shape()` ([persistence.test.mjs L51-L58](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/persistence.test.mjs#L51-L58)); real classes, nothing mocked.
- **Steps:** build each root from a few real lines. Take `live.toJSON()`, rebuild through each route a compactor could use, and compare `shape()`.
- **Today (probe):**
  - **As a line** (`Class.replay([live.toJSON()])`): wrong for all five. The whole object lands in `data` (`data: {type, id, data}`), and children are dropped. `replay_line` treats any object as a delta ([Item.js L462-L475](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L462-L475)).
  - **Through `Item.hydrate`** ([L416-L447](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Item.js#L416-L447)): Board, Session and Task come back equal. A **List** root comes back as a plain Item with members under `data["0"]`, `data["1"]`, because `List.toJSON()` is a bare array ([List.js L381](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/List/List.js#L381)). A **Page** gains `id: "p"` it did not have.
- **Expected:** a `{snapshot}` line rebuilds an equal tree for all five, and an unequal one makes `compact()` refuse.
- **Honesty check:** not invented. These are the exact routes a compactor would take, and they are the open question in [Page architecture.md L69-L71](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/doc/architecture.md#L69-L71). Also cover: nested children with their own file (`_own_file` / `Task.open_ref`), which a snapshot must keep as references, not inline.

### F8. A reader resets when the file is rewritten, even if it got longer

- **Checks:** a subscribed tab notices a whole-file rewrite by generation (inode or a line-1 `gen`), not only by size.
- **Setup:** Stream.test's wiring, all real: `Tail.js`, `live.js`, `Page`, a fake socket passing frames through `Socket.prototype.message` ([Stream.test.mjs L31-L41](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Stream.test.mjs#L31-L41)). A temp `page.jsonl` of 3 lines, with an url in line 2.
- **Steps:** `await Page.jsonl(url)`. Rewrite the file in place with the url replaced by a longer one (SessionConsolidate's shape, [L110](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/SessionConsolidate.mjs#L110)); `Tail.changed(file)`. Compare the page to `Page.replay(lines of the file)`.
- **Expected:** a `jsonl_reset`, then a page equal to a fresh replay.
- **Today:** Probe: no reset. Tail sends the bytes past the old offset as if they were new lines ([Tail.js L54-L57](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Server/plugins/SocketServer/Tail.js#L54-L57)): one torn fragment, warned as "unparsed line" ([Store.js L94](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L94)), plus a repeat of a line already applied. The open page keeps the old url until a reload, with no error shown.
- **Honesty check:** real today: SessionConsolidate rewrites `.jsonl` urls while tabs may be open. After compaction the file usually **shrinks** (the reset already works), but a big snapshot line can make it longer. Also cover: a rewrite to the exact same length (size check blind, inode check catches it).

### F9. A line sent over a socket that dies is not lost

- **Checks:** a change made in a tab reaches the file even if the socket drops while the line is in flight.
- **Setup (real sockets):** an http server on port 0 with a real `ws` WebSocketServer. Each connection gets a real `Append` handler. A switch makes the server **terminate the connection the moment an `append` frame arrives**, before it writes or answers. On the client: the real `Socket.js` (Node's `WebSocket`), a real `Item` root with a `List`, a real `Item.Store` attached. Mocks as listed above.
- **Steps:** `root.cards.add({id:"c1"})`, wait 1.5 s. Turn the drop off and let the socket reconnect (it does by itself). `root.cards.add({id:"c2"})`, then read the file.
- **Expected:** the file holds c1 and c2, each once.
- **Today:** Probe: the server got the c1 frame and the file has only c2. No warning was printed: `request()` parks a resolver that nobody ever settles when the socket closes ([Socket.js L346-L358](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/dev/Socket/Socket.js#L346-L358); `reconnect()` never touches `requests`, [L88-L109](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/dev/Socket/Socket.js#L88-L109)). So `FsFile.send` never reaches its `return false`, and `Store.flush` has already handed the line off ([Store.js L180-L199](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L180-L199)). The tab still shows c1, so the owner sees no loss until a reload.
- **Honesty check:** real: restarting `node server.js` is routine ([live.js L66-L69](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L66-L69)). The window is narrow, from the frame being sent to it being written; the test forces it. Not covered: a record file (`page.jsonl`, `task.jsonl`), which goes to Servex over HTTP first ([Store.js L199-L213](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L199-L213)); one more case should kill that HTTP request mid-flight. Also cover: the resent line must not twin when the first attempt did land (server writes, then dies before answering).

### F10. The stated durability contract holds for every writer

- **Checks:** recommendation 10 is mostly a readme paragraph, which a test cannot fail. The part that can be tested is the claim "no writer ever leaves a half-written line". So this test checks the claim, not the prose.
- **Setup:** temp root; each record writer in turn: `record_lines`, `Append`, `LogLine.write`, `RecordWriter.append_once`, `Sessions.append`.
- **Steps:** seed a torn tail (as in F5), call the writer once, then parse.
- **Expected:** every writer leaves only parseable lines, plus at most one side-file.
- **Today:** `record_lines` and `Append` fail (see F5); the other three pass.
- **Honesty check:** this overlaps F5 on purpose: one test per writer, so a new writer added later gets checked too. The fsync half of the contract cannot be tested without pulling the power; leave it as documentation.

## Proposed store adapter interface

The smallest set that fits **JSONL files**, **Durable Object SQLite** and **R2 segments**. It works on *logs* (append + range read), not on blobs, because that is what lew42 is. Keys are page/record ids; a **cursor** is opaque to callers (`"<gen>:<pos>"`), and each adapter decides what `pos` means.

```js
class Store {   // one instance per backend; methods take the record key
  head(key)                     // → cursor after the last line, or null if the record does not exist
  append(key, lines, {ifHead})  // all lines or none, in order; → new head. ifHead: refuse if head moved (CAS)
  read(key, {from})             // async iterator of {line, cursor}; no `from` = start at the latest snapshot
  tail(key, from, onLines)      // live lines after `from`; calls onLines(null, "reset") if `from` is no longer valid
  snapshot(key, state, covers)  // store `state` as "everything up to cursor `covers`"; → cursor of the snapshot
  archive(key, before)          // move whole segments that end before `before` to history; never deletes
  history(key)                  // → [{gen, from, to, ref}] archived segments and snapshots, oldest first
  exclusive(key, fn)            // run fn as the only writer of key (compaction, migrations)
}
```

| Method | JSONL files (today) | DO SQLite | R2 segments |
|---|---|---|---|
| cursor `pos` | byte offset in `page.jsonl` | `rowid` | `seq` (segment start + line index) |
| `append` | one `appendFile` of joined lines (+ optional fsync) | one `transactionSync` insert | buffer in a DO, then `put seg-<seq>.jsonl` |
| `read` | snapshot line 1, then lines | `SELECT ... WHERE seq > snap.seq` | manifest → snapshot → segments |
| `tail` | Tail.js offsets | DO broadcasts over its WebSockets | not live; pair with a DO |
| `snapshot` | new file, line 1 = `{snapshot, of}` | `snapshots` table (state > 2 MB: chunk or R2) | `snap-<seq>.json` + manifest |
| `archive` | old log → `page.<n>.jsonl` | rows → `history` table or exported to R2 | manifest marks segments `h` |
| `exclusive` | `page.jsonl.lock` or "Servex only" | implicit (one DO per page is single-threaded) | manifest `put` with `onlyIf: {etagMatches}` |

Notes:
- `append` returning the new head, plus `ifHead`, is what lets the twin check become exact instead of "scan the last 64 KB" ([RecordWriter.js L19-L22](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/RecordWriter.js#L19-L22)).
- `read` without `from` starting at the latest snapshot is the whole point of compaction: load cost becomes "one snapshot + recent lines".
- R2 has no append (`put` only, with `onlyIf` conditions; a failed condition returns `null`) per the [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/), so R2 is the **archive tier**, not the hot log. DO SQLite limits (2 MB per row/value, 10 GB per object) are in [notes/cloudflare_vs_postgres_platforms.md](../notes/cloudflare_vs_postgres_platforms.md).
- What the adapter does **not** do: parse lines, know about Items, or decide when to compact. `Item.Store` keeps replay, echo skip and nesting ([Store.js L98-L130](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Item/Store.js#L98-L130)); a small `Compactor` owns the policy below.

## Compaction policy that keeps history

**Rule:** compaction never removes a line from the world. It moves the old prefix of the log into an archive file, and the live file restarts with one snapshot line that names the archive. Truncation (cutting the prefix and throwing it away) is not allowed.

**Two stages.** Stage 1 is what the owner already decided: Servex *appends* one snapshot line to the end of `page.jsonl` ([design-decisions L91](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ai/design-decisions-2026-10-27.md#L91)); a reader that finds the last snapshot line replays only what follows it. No rewrite, no new files, and it cuts replay time, but not the bytes a browser fetches. Stage 2, below, archives the prefix so the live file is short. Build stage 1 first; stage 2 only when file size hurts.

**When** (all must hold):
- bytes since the last snapshot ≥ max(64 KB, size of the last snapshot) (automerge);
- the file is quiet for 30 s, or 10 min have passed since the first un-snapshotted line (Hocuspocus);
- it runs in the one writer (Servex), never in a browser, never as a side effect of loading (unlike nedb);
- the log has no mid-file parse errors (nedb, ZODB).

**Steps, JSONL file adapter** (all inside `exclusive(key)`, so no append can interleave):

1. `N` = current end offset; `state` = the warm root's `toJSON()` at N (Servex already holds it, [page_tools.js L1101-L1119](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/Servex/agents/page_tools.js#L1101-L1119)).
2. Self-check: replay `state` into a fresh root; its `toJSON()` must equal `state`. If not, stop and log.
3. Archive: hard-link `page.jsonl` to `page.<n>.jsonl` (`fs.linkSync`; a copy + fsync where links are not available). The archive is now every byte, untouched.
4. Write `page.jsonl.tmp`: line 1 = `{"snapshot": state, "of": {"file": "page.<n>.jsonl", "offset": N, "gen": n}, "recent": [last 256 by|ts]}`, then any lines after N (normally none, because of the lock). fsync it.
5. Rename `page.jsonl.tmp` over `page.jsonl`; fsync the directory. Readers get `jsonl_reset` and replay the short file ([live.js L52-L64](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/ext/JSONL/live.js#L52-L64)).
6. Log one line to the page's own log or a ledger: `{"compacted": {"archive": "page.<n>.jsonl", "bytes_before": ..., "bytes_after": ...}}`.

`recent` in step 4 keeps the `by`+`ts` twin check working across the swap: a late fallback line whose twin was folded into the snapshot is still recognised.

**On open (recovery, jsonl-db style):**
- `page.jsonl` missing, `page.jsonl.tmp` present → rename tmp into place.
- both present → the swap never happened; move tmp to `page.jsonl.tr<k>` (kept, not deleted) and use `page.jsonl`.
- last line has no trailing newline → the writer moves those bytes to `page.jsonl.tr<k>` and truncates to the last newline (ZODB); readers just skip it, as today.

**History stays one click down.** A reader that wants the past follows `of.file` from the snapshot to `page.<n>.jsonl`, whose own first line may be an older snapshot pointing further back. Archives are never deleted by code; old ones can be gzipped later, and deletion is an explicit owner command only ([CLAUDE.md "Never destructive"](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/CLAUDE.md)). Do not count on git as the undo: a session folder's `page.jsonl` is gitignored ([.gitignore L153-L154](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.gitignore#L153-L154)), so for those files the archive is the only copy.

**Same policy on the other backends.** DO SQLite: insert into `snapshots(seq, state)`, then move rows `seq ≤ N` to `history` (or export them to R2 as `seg-<from>-<to>.jsonl`) in one transaction. R2: write `snap-<N>.json`, then update the manifest with `onlyIf: {etagMatches}`, marking old segments as history, never deleting them.

**Things to check in lew42 before building it:**
- The jsonl hooks (`jsonl-schema.mjs`, `jsonl-guard.mjs`, [Page readme](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/public/framework/core/Page/readme.md)) will see a snapshot line and a new `page.<n>.jsonl`; they need a rule for both.
- `Server/plugins/PageFiles.js` and `Page.listing()` will list `page.<n>.jsonl` as a file of the folder; decide whether archives show.
- Git: every `*.jsonl` is `merge=union` ([.gitattributes L1-L13](https://github.com/lew42/monorepo/blob/9ba46ee87219cb9ac5b99b887f0869a5aa4c6895/.gitattributes#L1-L13)), which assumes a log is never rewritten. A worktree that appended to a page that was compacted on the main branch merges into "snapshot line, then every old line again, then the new line" (tried with a real `git merge`; see test F3 below). Stage-2 compaction must skip files changed on any open branch, or land through `Server/merge.mjs` with a rule for it.
- Windows (the owner's machine): renaming over a file another process holds open can fail with `EPERM`/`EBUSY` (chokidar, the editor); retry a few times with a short delay, as `graceful-fs` does.
