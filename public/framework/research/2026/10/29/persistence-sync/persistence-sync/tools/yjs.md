# Yjs

`id: yjs` · category: `crdt` / `crdt-core` · kind: `tool` · status: `active` (2026-09-23) · license: MIT

Profile by profile-yjs, 2026-10-30. Sources are linked inline; **Inference:** marks judgment. Code links are pinned to commit `0e0dc3401b9753fbffb60699f6b68460cf1bcdf9` (the shared clone HEAD, committed 2026-10-23). That HEAD is the v14 development line, package `@y/y` version `14.0.0-rc.29` ([package.json#L2-L3](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/package.json#L2-L3)). The stable npm release is 13.6.x, so 13.x facts below come from the notes and docs, not from this clone.

## What it is

Yjs is a JavaScript library for data that several people or devices change at the same time. You put shared maps, lists and text inside a `Doc`, and Yjs merges concurrent edits on its own, in any order, so every copy ends up the same ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), Yjs section; [README](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/README.md#L4)).

What sets it apart in its subcategory: the library is only the merge engine. It has the widest set of editor bindings and room servers in the CRDT group, which is why most rich-text products pick it ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), Yjs section). Automerge bundles storage and networking into one repo layer; Yjs leaves those to separate packages ([automerge-repo profile](automerge-repo.md)).

## How it works

- **Data model:** a `Doc` ([Doc.js#L50](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Doc.js#L50)) holds shared types. In 13.x these are `Y.Map`, `Y.Array` and `Y.Text` ([docs: Y.Array](https://docs.yjs.dev/api/shared-types/y.array)). On the v14 line they are one class, `YNode`, exported as `Node` ([ynode.js#L681](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L681), [index.js#L25](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/index.js#L25)). The README still documents `Y.Array` ([README.md#L466](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/README.md#L466)), so the docs and the code disagree on the v14 names.
- **One change looks like:** the app edits inside `doc.transact(f, origin)` ([Doc.js#L179-L180](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Doc.js#L179-L180)). When the transaction ends, the doc emits `update` with the binary change bytes and the origin ([Transaction.js#L320](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Transaction.js#L320); the same with `updateV2` at [L327](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Transaction.js#L327)). The app sends those bytes to peers, and a peer applies them with `applyUpdate` ([encoding.js#L370](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/encoding.js#L370)).
- **Persistence:** the core stores nothing. Adapters do. Hocuspocus's Database extension saves the whole state with `Y.encodeStateAsUpdate` on each store, which overwrites the old copy ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), lines 41-44). `y-leveldb` keeps each update separately and, past 500 stored updates, replaces them with one merged state ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 292; [lessons/storage-compaction.md](../lessons/storage-compaction.md), section 4).
- **Transport:** the core has no network code. The wire protocol lives in `y-protocols`: a sync handshake (state vector out, missing updates back), then live updates, plus a separate awareness channel for presence ([lessons/sync-protocol.md](../lessons/sync-protocol.md), lines 284-301). Servers in use: `y-websocket` (a development server, [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 32), Hocuspocus (production, line 40), y-sweet (Rust, S3 storage, line 45).
- **Runtime:** the core is pure JavaScript with one runtime dependency, `lib0` ([package.json#L73-L75](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/package.json#L73-L75)). It runs in browsers and Node. Hocuspocus 4 runs on Bun, Deno, Cloudflare Workers and Node ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 35). `y-partyserver` runs Yjs rooms inside Durable Objects ([line 46](../notes/sync_engines_crdts.md)).
- **Client use from plain JS:** the package is ESM (`"type": "module"`, [package.json#L5](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/package.json#L5)). The notes say it "needs an import map or an ESM CDN" because of `lib0` ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 262). **Inference:** that works with no build step, but I did not run it.

## Code facts

- **Language:** JavaScript with ES modules and JSDoc types. The `.d.ts` files are generated for `dist/` ([package.json#L23-L25](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/package.json#L23-L25)). Source is in `src/`.
- **Style:** a mix. Shared types and the doc are classes that extend lib0's `ObservableV2` ([Doc.js#L5](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Doc.js#L5), [ynode.js#L681](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L681)). The real work is done by free functions that take the transaction as their first argument: `typeListInsertGenerics` ([ynode.js#L2342](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L2342)), `typeListDelete` ([L2415](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L2415)), `nodeMapSet` ([L2479](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L2479)).
- **Main types:** `Doc` (the document, [Doc.js#L50](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Doc.js#L50)); `YNode` for map, list and text roles on v14 (see above); `YEvent` for change records ([YEvent.js#L11](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/YEvent.js#L11)); `UndoManager` ([UndoManager.js#L155](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/UndoManager.js#L155)).
- **Update encoding:** binary, in two formats, V1 and V2 ([index.js#L9-L10](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/index.js#L9-L10)). The calls are `encodeStateAsUpdate` ([encoding.js#L433](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/encoding.js#L433)), `applyUpdate` ([L370](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/encoding.js#L370)), `mergeUpdates` ([L488](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/encoding.js#L488)) and `encodeStateVector` ([L610](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/encoding.js#L610)). Updates are "commutative, associative, and idempotent" ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 29).
- **observe / observeDeep:** `observe(f)` registers on the type's own handler ([ynode.js#L977-L978](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L977-L978)). `observeDeep(f)` registers on the deep handler, so nested changes reach it too ([L989-L990](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L989-L990)). When a type changes, `_callObserver` builds a `YEvent` and calls the handlers ([L955-L957](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L955-L957)). The `delta` getter gives a Quill-style list of retain, insert and delete steps ([L790](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L790)).
- **Transactions:** changes inside one `transact` are bundled. Observers fire once, after the transaction ends ([Doc.js#L168-L170](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Doc.js#L168-L170)). The `origin` argument is stored on the transaction and sent with each `update` event ([Transaction.js#L410](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Transaction.js#L410), [L320](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Transaction.js#L320)). **Inference:** that is how a sync server or client tells its own writes from remote ones and avoids sending an echo back.
- **Garbage collection:** `gc` defaults to `true` ([Doc.js#L54](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Doc.js#L54)), so deleted content is dropped. Keeping all history needs `gc: false` or snapshots.
- **Key dependencies:** `lib0` `^1.0.0-rc.35`, the only runtime dependency ([package.json#L73-L75](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/package.json#L73-L75)). `@y/protocols` is a dev dependency only.

## Group-by positions

Axes from taxonomy.md section 4 that apply to `crdt`.

- authority: `hybrid`. The library merges on every replica, but production use puts a room server in front that authorizes and stores the document (Outline, Plane) ([taxonomy.md](../taxonomy.md) section 4; [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), lines 33-44).
- conflict: `crdt`. Merging happens when an update is applied ([encoding.js#L354-L355](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/encoding.js#L354-L355)).
- change-format: `crdt-updates`. Opaque binary updates ([Transaction.js#L320](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Transaction.js#L320)).
- list-order: `list-crdt`. A sequence CRDT, with no move operation on `Y.Array` ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 30).
- layout: unclear. The core fixes no storage layout. Adopters store one state blob in a column (Outline), or an updates table plus a snapshots table (AFFiNE) ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md)).
- client-model: `documents`. One `Doc` per room. Nested documents use subdocs ([notes/collab_app_architectures.md](../notes/collab_app_architectures.md), line 128).
- reactivity: `events`. `observe` and `observeDeep` ([ynode.js#L977-L990](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js#L977-L990)).
- history: unclear. Garbage collection is on by default and drops deleted content ([Doc.js#L54](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Doc.js#L54)). Whether the app keeps history depends on its `gc` and snapshot settings.

Features (tags from taxonomy.md section 5): `offline` (updates merge after reconnect; storage providers such as y-indexeddb are listed in the Yjs README), `multi-user-merge`, `undo-history` ([UndoManager.js#L155](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/UndoManager.js#L155)), `nested-trees` (maps inside maps, and subdocs), `indexeddb` (through y-indexeddb), `runs-on-cloudflare-workers` (through `y-partyserver`, [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 46), `self-hostable` (Hocuspocus, MIT), `open-source` (MIT).

Presence is not in the core: awareness comes from `y-protocols` ([lessons/sync-protocol.md](../lessons/sync-protocol.md), line 301), so I did not tag it.

## Pairs with

- `hocuspocus`: the standard Node room server, with store hooks that save the full state. Stable 4.x runs on Workers too ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), lines 34-44).
- `y-websocket`: the development server, and a starting point for your own ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 32).
- `y-leveldb`: a log of updates that merges itself past 500 updates ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 292).
- `y-sweet`: a Rust server that stores the state in S3-compatible storage or a directory ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 45).
- `cloudflare-durable-objects`: `y-partyserver` keeps one Yjs room per Durable Object ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 46). The `y-partyserver` id is not in the id map yet (see report).
- `prosemirror`: `y-prosemirror` binds the doc to a ProseMirror editor ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), Outline entry).
- `lexical`: `@lexical/yjs` binds the doc to a Lexical editor ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), Proton Docs entry).

## Alternatives

Substitutes: you would pick one of these instead.

- `automerge`: a different CRDT with its own storage and network repo. Pick it when you want the storage and sync layer built in ([automerge-repo profile](automerge-repo.md)).
- `loro`: a CRDT with a native movable list and trees. Pick it when list move matters ([taxonomy.md](../taxonomy.md) section 4, list-order; [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 383).

## Avoid with

None verified as a specific tool. The category rule applies: a CRDT document and an ORM writing the same fields diverge ([taxonomy.md](../taxonomy.md) section 6). Plane shows the cost: it writes the Yjs binary and HTML and JSON copies of one description on every store ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), Plane entry).

## Adopters

Secondary, from the notes. Wiring was read from the notes and was not re-checked in each repo. The Yjs README lists more names ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 559).

- **Outline**: Hocuspocus plus y-prosemirror. The Yjs state sits in a Postgres `Document.state` column ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), lines 20-21).
- **Plane**: stores `description_binary` (Yjs) next to HTML and JSON copies ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), line 31).
- **AFFiNE** (BlockSuite editor): one Yjs doc per page, with updates and snapshots in Postgres ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), lines 35-36).
- **HedgeDoc**: a raw `ws` server with in-memory Y.Docs. A timer saves a Revision row with the encoded state ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), lines 51-52).
- **Proton Docs**: Lexical with `@lexical/yjs` and `yjs` in the browser editor ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), line 38).

## Status

- Latest stable: 13.6.33 on 2026-09-23 on npm. Patches come every one to three months. v14 has been in beta since 2022, with 14.0.0-16 on 2025-12-07 ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 27; [npm registry](https://registry.npmjs.org/yjs)). The clone's main is 14.0.0-rc.29, committed 2026-10-23.
- About 23,000 GitHub stars. Last push 2026-10-23 ([notes/adoption_metrics.csv](../notes/adoption_metrics.csv), row for yjs/yjs).
- License: MIT. The LICENSE file says MIT ([LICENSE#L1](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/LICENSE#L1)). The metrics CSV says NOASSERTION, which GitHub did not detect. The file wins.

## Fit for lew42

**Inference:** Yjs would give lew42 a tested merge for text that two people edit at once, and it works offline. Three things get in the way. Its shared types are not `Item` and `List` objects, and the v14 names are changing under it. Its updates are binary, so storing them in the JSONL delta logs would mean base64 lines, which are larger and harder to read. Its list has no move, so reordering needs the server to order the list. I would borrow the ideas now: bundling changes per transaction, tagging each change with its origin, and saving full state with a merged snapshot. I would adopt the library only for one rich-text field where two people edit the same text, and keep structured data on server-ordered last-writer-wins.

## Lessons

- **Batch changes per transaction, and fire observers once at the end.** `Doc.transact` bundles all changes in one call, and observers run after it ends ([Doc.js#L168-L180](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Doc.js#L168-L180)). lew42's get/set change events could batch the same way.
- **Tag every change with an origin.** The origin travels with each `update` event ([Transaction.js#L320](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Transaction.js#L320)), so a receiver can skip its own writes.
- **Merge stored updates into one state, past a threshold.** `mergeUpdates` joins a batch into one smaller update ([encoding.js#L488](https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/encoding.js#L488)), and y-leveldb does this at 500 stored updates ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 292).

## Lesson for Lew42

- **Use Yjs for rich-text fields only.** Put one Yjs doc in one text field inside an otherwise last-writer-wins object model. Most Yjs adopters are editors ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), line 597).
- **Do not use `Y.Array` for lists that users reorder.** It has no move, so a move becomes a delete plus an insert. Keep list order as a server-written position field ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), lines 383 and 398).
- **Store the binary state in one field, and never let a second writer touch that field.** Outline keeps the state in one column. Plane's three copies show how a second writer breaks it ([notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), lines 20-21 and 31).

## Gaps

- The clone is v14 (`14.0.0-rc.29`), not the 13.6.33 stable. 13.x facts come from the notes and docs. I did not clone the 13.6.33 tag, so the 13.x API names were not checked against code.
- The README on the clone's main still documents `Y.Array`, while the code exports `YNode`. Which one ships at v14 final is unknown.
- I did not run the library. The ESM and no-build claims are untested.
- Maintainers were not checked in this session.
- Adopter wiring comes from the notes and was not re-checked in each repo.
- `history` and `layout` are unclear, with reasons given above.
- `y-partyserver` has no id in the map, and the Cloudflare claim rests on it.

## Sources

- https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/README.md
- https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/package.json
- https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Doc.js
- https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/Transaction.js
- https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/utils/encoding.js
- https://github.com/yjs/yjs/blob/0e0dc3401b9753fbffb60699f6b68460cf1bcdf9/src/ynode.js
- https://docs.yjs.dev/ (via notes/sync_engines_crdts.md)
- https://docs.yjs.dev/api/shared-types/y.array (via notes/sync_engines_crdts.md)
- https://registry.npmjs.org/yjs (via notes/sync_engines_crdts.md)
- notes/sync_engines_crdts.md
- notes/adopters_and_pairings.md
- notes/adoption_metrics.csv
- notes/collab_app_architectures.md
- lessons/sync-protocol.md
- lessons/storage-compaction.md
- taxonomy.md
