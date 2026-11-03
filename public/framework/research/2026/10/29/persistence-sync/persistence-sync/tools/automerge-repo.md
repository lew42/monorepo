# Automerge Repo

`id: automerge-repo` · category: `crdt-library` / `crdt-storage-network` · kind: `tool` · status: `active` (2026-05-18) · license: MIT

Profile by profile-automerge-repo, 2026-10-30. Sources are linked inline; **Inference:** marks judgment. Code links are pinned to commit `3ab7c33bbc628769e101691e0c32ef4f0c220d5c` (the shared clone HEAD, committed 2026-10-21).

## What it is

Automerge Repo is the storage and networking layer for Automerge documents. A `Repo` object holds many Automerge documents, saves their changes to a storage adapter, and syncs each document to peers over network adapters ([package.json description](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/package.json); [app-builder blurb](../data/ops/app-builder.jsonl)). It is for apps that want Automerge documents to persist and sync without writing the sync protocol themselves.

What sets it apart in its subcategory: it does not define the CRDT. It wraps the `@automerge/automerge` core with storage, transports and a per-document sync loop, where Yjs-style stacks usually split the same jobs across separate packages ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), storage section). **Inference:** that bundling is why its storage interface is the piece most worth copying.

## How it works

- **Data model:** each document is an Automerge document, a JSON-like CRDT object changed inside a `change` callback ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), Automerge section). Each document has a `DocHandle` ([DocHandle class](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L71)) that exposes `doc()`, `heads()`, `history()` and `view(heads)` ([L193](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L193), [L212](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L212), [L235](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L235), [L291](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L291)).
- **Addressing:** a document is named by a URL, `automerge:<docId>`, where the id is bs58check-encoded. The same URL can pin `#<heads>` or a `/<path>` into the document ([AutomergeUrl.ts](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/AutomergeUrl.ts#L47-L50)).
- **One change looks like:** the app calls `handle.change(...)`, and Automerge records binary changes with a hash and parent heads. For each connected peer, the synchronizer calls `A.generateSyncMessage(doc, syncState)` ([DocSynchronizer.ts#L716](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/synchronizer/DocSynchronizer.ts#L716)) and wraps the bytes in an envelope `{type: "sync", senderId, targetId, documentId, data}` ([messages.ts#L22-L32](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/network/messages.ts#L22-L32)). The receiver applies it with `A.receiveSyncMessage` ([DocSynchronizer.ts#L810](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/synchronizer/DocSynchronizer.ts#L810)).
- **Other envelopes:** `ephemeral` (presence, with a session id and sequence count, [messages.ts#L45-L57](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/network/messages.ts#L45-L57)), `request`, `doc-unavailable`, `remote-subscription-change` and `remote-heads-changed` ([messages.ts#L67-L114](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/network/messages.ts#L67-L114)).
- **Persistence:** every save writes an incremental chunk. Chunk keys are content hashes ([storage/keyHash.ts](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/storage/keyHash.ts), uses `fast-sha256`), so a duplicate write is harmless. Compaction writes one snapshot keyed by heads, then deletes only the incremental chunks it had loaded. Details and the trigger rule are in [lessons/storage-compaction.md](../lessons/storage-compaction.md) (pinned at this same commit).
- **Transport:** the library is transport-neutral. Network adapters are BroadcastChannel, MessageChannel and WebSocket ([packages list](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/)). The WebSocket adapters CBOR-encode messages ([client L189](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo-network-websocket/src/WebSocketClientAdapter.ts#L189), [server L157](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo-network-websocket/src/WebSocketServerAdapter.ts#L157)).
- **Runtime:** runs in the browser and in Node (`engines.node >= 22.13`, [package.json](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/package.json)). The sync server is a separate package, `@automerge/automerge-repo-sync-server` 0.3.0 (2026-09-30), not in this clone ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), storage section). Nothing here runs on Workers; a Durable Objects port is "under consideration" for the newer Subduction server ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), Automerge section).
- **Client use from plain JS:** the README and the vanillajs package show a plain ESM import from `@automerge/vanillajs` with adapters passed to `new Repo({network, storage})` ([automerge-vanillajs README](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-vanillajs/README.md)). **Inference:** that works without a bundler, but I did not run it, and the WASM init for the core was not checked.

## Code facts

- **Language:** TypeScript source in `src/`, compiled by `tsc` to `dist/` ([package.json scripts](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/package.json)). ESM (`"type": "module"`), with a `browser` field that disables `crypto` ([package.json](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/package.json)).
- **Style:** object-oriented. Classes that extend `EventEmitter` do the work: `Repo` ([Repo.ts#L71](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/Repo.ts#L71)), `DocHandle` ([L71](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L71)), `StorageSubsystem` ([storage/StorageSubsystem.ts#L38](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/storage/StorageSubsystem.ts#L38)), `NetworkSubsystem` ([network/NetworkSubsystem.ts#L23](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/network/NetworkSubsystem.ts#L23)), `CollectionSynchronizer` ([synchronizer/CollectionSynchronizer.ts#L94](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/synchronizer/CollectionSynchronizer.ts#L94)), one `DocSynchronizer` per open document ([DocSynchronizer.ts#L115](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/synchronizer/DocSynchronizer.ts#L115)), and `Presence` ([presence/Presence.ts#L32](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/presence/Presence.ts#L32)).
- **Wiring:** `Repo` builds `StorageSubsystem` ([Repo.ts#L136](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/Repo.ts#L136)), a `StorageSource` on top of it ([L158](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/Repo.ts#L158)), `NetworkSubsystem` ([L168](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/Repo.ts#L168)) and `CollectionSynchronizer` ([L176](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/Repo.ts#L176)).
- **Adapters:** a `NetworkAdapter` abstract class with `isReady`, `whenReady`, `connect`, `send`, `disconnect` ([network/NetworkAdapter.ts#L19-L43](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/network/NetworkAdapter.ts#L19-L43)). Storage adapters implement an interface with five methods on array keys ([StorageAdapterInterface.ts#L9-L42](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/storage/StorageAdapterInterface.ts#L9-L42)).
- **Key runtime dependencies** (`packages/automerge-repo/package.json`): `@automerge/automerge` ^3.2.6 (the CRDT core, WASM; [pnpm-workspace.yaml#L22-L23](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/pnpm-workspace.yaml#L22-L23)), `cbor-x` (wire encoding for WebSocket), `bs58check` (URL ids), `fast-sha256` (chunk keys), `eventemitter3`, `uuid`, `debug`, and `xstate` ^5.32.6. **Gap:** `xstate` is declared but I found no `from "xstate"` import in `src/`, so it may be dead weight.
- **Storage adapters:** `IndexedDBStorageAdapter` ([storage-indexeddb/src/index.ts#L55](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo-storage-indexeddb/src/index.ts#L55)) and `NodeFSStorageAdapter` ([storage-nodefs/src/index.ts#L37](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo-storage-nodefs/src/index.ts#L37)). No S3, R2 or SQLite adapter exists in this clone.
- **Transports:** `automerge-repo-network-websocket` (client and server), `-broadcastchannel`, `-messagechannel`.
- **How changes are represented:** the core stores binary Automerge changes, each hashed and linked to its parent heads. Sync messages are opaque Automerge sync-protocol bytes inside typed JSON-like envelopes (`messages.ts`). Storage holds the same bytes as `incremental` and `snapshot` chunks.

## Group-by positions

Axes from taxonomy.md section 4 that apply to `crdt-library`. Partition, transport and query are not listed for this category, so I skipped them.

- authority: `local-first`. Every peer merges what it receives, with no server that orders writes ([DocSynchronizer.ts#L810](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/synchronizer/DocSynchronizer.ts#L810)). Users are named in [taxonomy.md](../taxonomy.md) section 4 and [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md).
- conflict: `crdt`. Merge happens in `A.receiveSyncMessage` ([DocSynchronizer.ts#L810](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/synchronizer/DocSynchronizer.ts#L810)). Notes: [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md) (line 255).
- change-format: `crdt-updates`. Opaque binary changes and sync bytes ([messages.ts#L22-L32](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/network/messages.ts#L22-L32)).
- list-order: `list-crdt`. Sequence CRDT for lists, and no first-class move ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 255 "no list move").
- layout: `log-snapshot`. Incremental chunks plus head-keyed snapshots; NodeFS maps keys to paths ([lessons/storage-compaction.md](../lessons/storage-compaction.md), [NodeFS L174-L182](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo-storage-nodefs/src/index.ts#L174-L182)).
- client-model: `documents`. One `DocHandle` per document, and the document is the loading unit ([DocHandle.ts#L71](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L71)). **Inference:** a large document loads whole.
- reactivity: `events`. `DocHandle` is an `EventEmitter` ([DocHandle.ts#L180](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L180) uses `once("delete")`). Framework hooks (React, Solid, Svelte) are separate packages, not core.
- history: `keep-all`. Compaction re-encodes the history into a snapshot and keeps it ([lessons/storage-compaction.md](../lessons/storage-compaction.md)); `history()` and `view(heads)` read old states ([DocHandle.ts#L235](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L235), [L291](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/DocHandle.ts#L291)).

Features (tags from taxonomy.md section 5): `realtime` (WebSocket sync pushes changes while connected, **Inference**), `offline`, `multi-user-merge`, `presence` ([Presence.ts](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/presence/Presence.ts#L32), ephemeral envelopes), `undo-history` (version history via `view(heads)`, not an undo stack), `references` (automerge URLs with paths, [AutomergeUrl.ts](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/AutomergeUrl.ts#L47-L50)), `nested-trees` (JSON-like documents, [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md)), `indexeddb`, `filesystem-storage`, `browser-esm-no-bundler` (**Inference:** from the vanillajs README, not run), `open-source` (MIT), `self-hostable` (NodeFS storage plus the Node sync server).

## Pairs with

- `automerge`: the CRDT core it wraps, a required dependency ([package.json](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/package.json)).
- `automerge-repo-sync-server`: the Node server that relays and persists documents, from [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md). New id, see report.

## Alternatives

Substitutes: you would pick one of these instead.

- `yjs`: a different CRDT with a larger editor-binding ecosystem and its own providers (y-indexeddb, Hocuspocus). Pick it for rich-text editors ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md)).
- `loro`: a CRDT with a native movable list and trees. Pick it when you need list move ([taxonomy.md](../taxonomy.md) section 4, list-order).

## Avoid with

None verified as a specific tool. The category-level rule applies: a CRDT document and an ORM writing the same fields diverge ([taxonomy.md](../taxonomy.md) section 6, conflicts).

## Adopters

The [Automerge July 2026 blog](https://automerge.org/blog/2026-july/) names these projects. Wiring is not verified for any of them; the notes say no confirmed commercial production users were found ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md)).

- **Patchwork** (Ink & Switch, in-house): the blog lists it; wiring not checked. (secondary, via notes)
- **Backstitch** (Godot collaboration with branching and merging): listed by the blog; wiring not checked. (secondary, via notes)
- **Braid** (issue tracker for LLM agents), **Coln** (pre-alpha), **Teamtype** (co-editing local files): listed by the blog; wiring not checked. (secondary, via notes)

## Status

- Last stable release: 2.5.6 on 2026-05-18. The npm `latest` tag points to 2.6.0-alpha.3 (2026-08-07), and the clone is at 2.6.0-alpha.5 ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md); [adoption metrics](../notes/adoption_metrics.csv)).
- Maintainers: the package author is Peter van Hardenberg ([package.json](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/package.json)). Roadmap and release news come from the Automerge blog ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md)).
- License: MIT ([package.json](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/package.json); [notes/adoption_metrics.csv](../notes/adoption_metrics.csv)).

## Fit for lew42

**Inference:** The owner's framework would gain a tested answer to concurrent edits across offline clients without a central merge, and a storage design (five key-range methods, content-hashed incremental chunks, head-keyed snapshots) that maps onto append-only JSONL logs. It would lose the plain `Item`/`List` object model: documents must be built inside `change` callbacks, and the core is WASM with binary changes instead of JSON deltas. The sync server is Node and not Workers-ready, which cuts against the Cloudflare-leaning design. My recommendation is to borrow the storage ideas (chunk keys, compaction order, the small adapter interface) now, and to adopt the library only if offline multi-writer merging becomes a real requirement.

## Lessons

- **Compaction writes the snapshot first, then deletes only the chunks this process loaded.** Concurrent compactions cannot lose each other's data, and a crash leaves a duplicate, not a gap ([StorageSubsystem.ts#L286-L328](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/storage/StorageSubsystem.ts#L286-L328); [lessons/storage-compaction.md](../lessons/storage-compaction.md)).
- **Compact when `snapshotSize < 1024 || incrementalSize >= snapshotSize`.** Total storage stays under about twice the snapshot with no tuning ([StorageSubsystem.ts#L378-L396](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/storage/StorageSubsystem.ts#L378-L396)).
- **Storage is five methods on array keys.** `load`, `save`, `remove`, `loadRange`, `removeRange`, plus an optional `close`. **Inference:** any backend with prefix listing can implement it ([StorageAdapterInterface.ts#L9-L42](https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/src/storage/StorageAdapterInterface.ts#L9-L42)).

## Gaps

- I did not run the library, so the plain-ESM and WASM claims are untested.
- The sync server is not in this clone; its features come from notes only.
- Cloudflare Workers support is unverified (nothing in this clone targets it).
- No S3, R2 or SQLite storage adapter was found in this clone.
- Adopter wiring is unverified; only names came from the blog via notes.
- The trigger "how often `occasionally` is" for compaction is now answered by the size rule, but how often `save` runs was not traced here.
- `xstate` is declared with no import found in `src/`.
- Subcategory `crdt-storage-network` is my proposal; taxonomy.md defines no subcategory list.

## Sources

- https://github.com/automerge/automerge-repo/blob/3ab7c33bbc628769e101691e0c32ef4f0c220d5c/packages/automerge-repo/package.json
- https://automerge.org/blog/2026-july/ (named via notes/adopters_and_pairings.md)
- https://automerge.org/docs/reference/under-the-hood/storage/ (via notes/sync_engines_crdts.md and lessons/storage-compaction.md)
- https://registry.npmjs.org/@automerge%2fautomerge-repo (via notes/sync_engines_crdts.md)
- notes/sync_engines_crdts.md
- notes/adopters_and_pairings.md
- notes/adoption_metrics.csv
- lessons/storage-compaction.md
- taxonomy.md
