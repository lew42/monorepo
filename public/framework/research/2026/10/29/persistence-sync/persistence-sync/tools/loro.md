# Loro

`id: loro` · category: `crdt` / `crdt-core` · kind: `tool` · status: `active` (2026-10-22) · license: MIT

Profile by profile-loro, 2026-10-30. Sources are linked inline; **Inference:** marks judgment. Code links are pinned to commit `75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73` (the shared clone HEAD, read from `.git/refs/heads/main`).

## What it is

Loro is a CRDT library. It merges concurrent edits to text, lists, maps, counters and trees, so copies of one document converge without a server deciding the order, including after offline edits ([Loro README](https://github.com/loro-dev/loro); [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), Loro section). It is for apps that keep a nested tree of items that users reorder and move.

What sets it apart in its subcategory: it has a native movable list (`MovableList`) and a movable tree (`LoroTree`). Simulating a move as delete plus insert breaks under concurrent edits, because the deleted element and two inserted copies can all survive ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), MovableList section). **Inference:** that makes Loro the closest of the CRDT libraries to a reorderable Page/Item/List model.

## How it works

- **Data model:** a `LoroDoc` holds named containers: `LoroText`, `LoroList`, `LoroMovableList`, `LoroMap`, `LoroTree` and `LoroCounter` ([loro-js README](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/loro-js/README.md#L106)). Containers nest, so a map can hold a list. Element ids are Lamport ids (`elem_id: IdLp` in [list_op.rs](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/src/container/list/list_op.rs#L26-L30)).
- **One change looks like:** local edits collect in a pending transaction, and `doc.commit(options)` seals them as one change ([lib.rs#L1212](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L1212)). The options take an `origin` and a `message`, and the origin is a runtime tag, not stored ([lessons/object-model.md](../lessons/object-model.md), section 6).
- **Move:** `list.mov(from, to)` ([lib.rs#L4775](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L4775)) stores one `Move { from, to, elem_id }` op ([list_op.rs#L26-L30](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/src/container/list/list_op.rs#L26-L30)). The element keeps its id, so a concurrent move cannot duplicate it.
- **Tree:** ops are `Create`, `Move` and `Delete`, and each carries a `parent` and a `FractionalIndex` `position` ([tree_op.rs#L18-L27](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/src/container/tree/tree_op.rs#L18-L27)). Sibling order is a fractional index. `enableFractionalIndex(jitter)` ([lib.rs#L5543](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L5543)) adds random digits so two peers inserting at the same spot do not collide.
- **Persistence:** the library writes no files and keeps no log of its own. `export({ mode })` returns bytes in one of three modes: `snapshot`, `update` (optionally from a version vector) or `shallow-snapshot` (up to frontiers) ([lib.rs#L1672-L1676](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L1672-L1676)). The app stores those bytes.
- **Transport:** none in the library. Loro's separate `loro-protocol` (MIT) carries many rooms per connection, with a 256 KiB message limit and fragmentation for larger updates. Its Node `SimpleServer` has `onLoadDocument`, `onSaveDocument` and `saveInterval` hooks ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), sync layer section; [loro-dev/protocol](https://github.com/loro-dev/protocol)). Only the notes were read for this, not the protocol repo.
- **Runtime:** the Rust core is compiled to WASM with wasm-bindgen. The npm package `loro-crdt` has entries for bundler, browser, nodejs, web and base64 ([crates/loro-wasm/package.json](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/package.json)). A second, pure TypeScript implementation, `loro.js` 0.4.0, runs without WASM and is marked experimental ([loro-js README](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/loro-js/README.md#L3-L4)).
- **Client use from plain JS:** the `./web` export is an ESM wasm-bindgen build ([crates/loro-wasm/package.json](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/package.json)). The notes say it loads its WASM from `import.meta.url` with no bundler ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), browser loading). **Inference:** that fits the no-build rule, but nothing here loaded it in a browser.

## Code facts

- **Language:** Rust core. `crates/loro-internal` holds the containers, events and undo logic. `crates/loro-wasm/src/lib.rs` is the wasm-bindgen wrapper that the JS API comes from. `loro-js/src` is a separate pure TypeScript runtime and codec, about 32,000 lines of `.ts` by `wc -l`, built to ES2022 ESM ([loro-js/package.json](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/loro-js/package.json)).
- **Style:** object-oriented on the JS side. `LoroDoc` and each container are wasm-bindgen classes with methods, such as `mov` ([lib.rs#L4775](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L4775)) and `subscribe` ([lib.rs#L5480](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L5480)). Inside the Rust core, enums model the ops (`ListOp`, `TreeOp`).
- **Main classes:** `LoroDoc`, `LoroText`, `LoroList`, `LoroMovableList`, `LoroMap`, `LoroTree`, `LoroCounter`.
- **Key deps (Rust, `loro-internal`):** `postcard` (binary encoding), `serde` and `serde_columnar`, `generic-btree`, `im`, `append-only-bytes` and `rustc-hash`. In-repo crates: `loro-delta`, `loro-rle`, `fractional_index` and `loro-common` ([crates/loro-internal/Cargo.toml](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/Cargo.toml)). The WASM wrapper pins `wasm-bindgen =0.2.100` ([crates/loro-internal/Cargo.toml](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/Cargo.toml)).
- **How changes and moves are represented:** a change is a set of ops, each with an id. A list move is one `Move` op on an element id. A tree move is one `Move` op with a new parent and a fractional position. A subscriber gets a typed diff. A tree move event names the old and new parent and index ([lessons/object-model.md](../lessons/object-model.md), section 6, which cites [lib.rs#L7281-L7308](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L7281-L7308)).
- **Bundle size:** `loro_wasm_bg.wasm` is about 3.6 MB uncompressed, from the 1.17.1 tarball typings ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), browser loading). **Not measured here:** no build was run, so this is the notes' figure. `loro.js` has no measured size.

## Group-by positions

Axes from taxonomy.md section 4 that apply to `crdt`. Layout is unclear for Loro, so it is written out below rather than guessed.

- authority: `local-first`. Every replica merges what it receives. A sync server, if used, relays or stores bytes ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), hosting line). **Inference:** an app that puts a server in charge of permissions makes this `hybrid`.
- conflict: `crdt`. Fugue for text, Kleppmann's move algorithm for `MovableList`, and a movable tree with cycle handling ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), container types; [Loro blog: movable tree](https://www.loro.dev/blog/movable-tree)).
- change-format: `crdt-updates`. Binary update and snapshot bytes. A JSON form of the ops also exists: `exportJsonUpdates` ([lib.rs#L1790](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L1790)).
- list-order: `list-crdt`. `MovableList` gives a move that keeps the element's identity. Text uses Fugue ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), MovableList section). Tree children use the `fractional` option instead, see the How it works section.
- layout: **unclear.** The library stores nothing. The repo's only storage example, the Node `SimpleServer`, saves full snapshot bytes on an interval, which is closer to `file-rewrite` than to an append log ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), sync layer). An append log of `update` bytes is possible, but no example in the repo shows one (**Inference**).
- client-model: `documents`. One `LoroDoc` per room, with nested containers inside ([loro-js README](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/loro-js/README.md#L106)). **Inference:** a large document loads whole, the same trade-off as Automerge.
- reactivity: `events`. `subscribe` exists on the doc and on each container. Batches carry `by: "local" | "import" | "checkout"` and typed diffs ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), typings section; [lessons/object-model.md](../lessons/object-model.md), section 6).
- history: `keep-all` by default. Full history stays, and `checkout` time-travels ([Loro docs](https://loro.dev/docs)). `truncate` is also available: a shallow snapshot drops history before the given frontiers, and the start version must be synchronized on every endpoint first ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), shallow snapshot section).

Features (taxonomy.md section 5): `offline`, `multi-user-merge`, `undo-history` (an `UndoManager` that merges steps within an interval, see [lessons/object-model.md](../lessons/object-model.md), section 6), `nested-trees`, `list-move`, `browser-esm-no-bundler` (the web build, see How it works), `open-source` (MIT) and `self-hostable` (no hosted service, [notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), hosting line).

## Pairs with

- `lew42-framework`: **Inference:** an `Item` maps to a `LoroMap`, a `List` to a `MovableList`, and nested pages to a `LoroTree` ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), Loro fit section). It is a mapping on paper, not a tested binding.
- `mobx-keystone`: the mobx-keystone repo ships a Loro binding, `mobx-keystone-loro`, and a helper that makes the binding emit a native Loro move instead of remove plus add ([lessons/object-model.md](../lessons/object-model.md), mobx-keystone section).
- Not an id yet: `loro-protocol`, the MIT sync server and protocol ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), sync layer). It needs its own profile before it gets an id, so it is listed in the report instead.

## Alternatives

Substitutes: you would pick one of these instead.

- `yjs`: the other CRDT library in this subcategory. The notes list Hocuspocus among its server-side backends ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), server-side Yjs backends). **Inference:** pick Yjs when you need that server ecosystem. Whether Yjs has a native list move was not checked in this profile; the taxonomy's list-crdt entry only says move needs special support ([taxonomy.md](../taxonomy.md), list-crdt).
- `automerge`: the same role, with its own storage and network layer in `automerge-repo`. Pick it when you want that layer included ([profile: automerge-repo](automerge-repo.md)).

## Avoid with

Genuine conflicts only.

- `yjs` on the same document or field: two CRDT owners of one state. Each library merges its own copy and the other's edits look like conflicts, so pick one per field (**Inference**; the two-owners rule in [taxonomy.md](../taxonomy.md)). Sharing one server is fine: `loro-protocol` can also carry Yjs bytes ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), sync layer).

## Adopters

- None verified. The notes found no named production users, only anonymous testimonials on loro.dev ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), hosting line; [notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md), gaps). The closest real use is the mobx-keystone binding above, which is an integration, not an adopter.

## Status

- Latest release: `loro-crdt` 1.17.1, dated 2026-10-22 in the notes from the npm registry, with frequent 1.x releases since 1.0 in 2024 ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), status line; [npm: loro-crdt](https://registry.npmjs.org/loro-crdt)). The pure-TS `loro.js` is 0.4.0 and labelled experimental ([loro-js/package.json](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/loro-js/package.json); [loro-js README](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/loro-js/README.md#L3-L4)).
- License: MIT, from the [LICENSE file](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/LICENSE) (`Copyright (c) 2023 Loro`).
- No acquisition, shutdown or successor found in the notes.

## Fit for lew42

**Inference:** lew42's `Item`, `List` and `Page` map almost one to one onto Loro's containers: `LoroMap`, `MovableList` and `LoroTree` ([notes/sync_engines_crdts.md](../notes/sync_engines_crdts.md), Loro fit section). It would gain concurrent-safe moves and reorders, merges between tabs and devices after offline edits, and a `subscribe` with typed diffs that could be re-emitted as `Item` change events. It would lose the readable JSONL delta log: Loro's update bytes are binary. `exportJsonUpdates` gives a JSON form ([lib.rs#L1790](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L1790)) that could feed a JSONL file, but its size was not measured. The cost is a dependency: the WASM build is about 3.6 MB, and CLAUDE.md says to ask before adding an npm dependency. The pure-TS `loro.js` avoids WASM, but it is experimental and its README says so. lew42's `store.replaying` flag would map to Loro's `by: local | import | checkout` tag. **Recommendation:** borrow the ideas now (move by id, a source tag, fractional sibling order) and do not adopt. Revisit only if live multi-writer editing becomes a requirement, then prototype with `loro.js` or the web build behind a test, after the owner agrees to the dependency.

## Lessons

- **A move keeps the element's id.** `ListOp::Move { from, to, elem_id }` ([list_op.rs#L26-L30](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/src/container/list/list_op.rs#L26-L30)). The public `mov` doc says it "avoids creating surplus values in the list, unlike a delete followed by an insert" ([lib.rs#L4764-L4775](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L4764-L4775)).
- **Tree siblings order by a fractional index, with optional jitter.** `TreeOp::Create` and `TreeOp::Move` both carry `position: FractionalIndex` ([tree_op.rs#L18-L27](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-internal/src/container/tree/tree_op.rs#L18-L27)). `enableFractionalIndex(jitter)` adds random digits ([lib.rs#L5543](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L5543)).
- **Compaction is an export mode, not a separate tool.** `update` (from a version vector), `snapshot` and `shallow-snapshot` (up to frontiers) are the modes of one `export` call ([lib.rs#L1672-L1676](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/crates/loro-wasm/src/lib.rs#L1672-L1676)).
- **A second implementation tested against the first.** `loro.js` lists the paths it checks against the Rust build, uses randomized differential tests against the WASM build, and exchanges fixtures in both directions ([loro-js README, compatibility status](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/loro-js/README.md#L149-L167)). It also tells users to keep their own interop test ([loro-js README](https://github.com/loro-dev/loro/blob/75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73/loro-js/README.md#L186-L188)).

## Lesson for Lew42

- **Copy the move shape, not the library.** A move that keeps the element's id is what makes concurrent reorders safe. lew42's `move` should keep `id`, and add `was` so a move can be inverted (already proposed in [lessons/object-model.md](../lessons/object-model.md)).
- **Ask before adding the WASM build or `loro.js`.** CLAUDE.md asks before any new npm dependency. The WASM build is about 3.6 MB, and `loro.js` is experimental and says so in its README.
- **If a CRDT ever lands, test it against a reference.** Loro's own pure-TS port is checked against the WASM build with randomized differential tests. lew42 would need the same kind of failing test spec, per COORDINATION.md.

## Gaps

- Nothing was built or run in a browser. The 3.6 MB WASM size comes from the notes, and `loro.js` has no measured size.
- Not checked: the `browser/` entry (the one bundlers pick by default), whether `./web` runs under a static server, and Cloudflare Workers or Durable Objects compatibility. The repo gives no evidence either way.
- Performance figures (MovableList about 80% slower to encode and decode, about 50% more memory, and 10,000 tree moves in 28 ms) come from the Loro docs and blog as the notes cite them. They were not re-measured.
- Production adopters: none verified.
- `loro-protocol` is not profiled. It needs its own profile and id.
- The undo semantics are as `loro.js` describes them. A movable-list move undo is simplified there, and the Rust build was not tested for that.

## Sources

- https://github.com/loro-dev/loro (README; pinned code at `75e4bf2bf01cb6f2f3e37c50156ca0b335ef9b73`)
- https://github.com/loro-dev/protocol (protocol README; read through the notes only)
- https://loro.dev/docs and https://loro.dev/docs/tutorial/list
- https://www.loro.dev/blog/movable-tree
- https://loro.dev/docs/advanced/shallow_snapshot
- https://registry.npmjs.org/loro-crdt (1.17.1 typings, via the notes)
- notes/sync_engines_crdts.md, lessons/object-model.md, notes/adopters_and_pairings.md
