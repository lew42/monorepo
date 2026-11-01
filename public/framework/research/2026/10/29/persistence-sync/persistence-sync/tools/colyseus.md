# Colyseus

`id: colyseus` · category: `realtime` / `game-server` · kind: `tool` · status: `active` (2026-10-22) · license: MIT

Profile by profile-colyseus, 2026-10-30. Sources are linked inline; **Inference:** marks judgment. Code links are pinned to commit `390cf3833cf76f588f140a01b1d5daf9e4fd5fbb` (`colyseus/schema`, the shared clone HEAD, committed 2026-10-29, package version 5.0.43). The room server (`colyseus/colyseus`) is not cloned here, so its claims come from the notes and are marked as such.

## What it is

Colyseus is a Node.js multiplayer server. It runs each match or session as a "room", keeps the room's state in memory, and sends that state to every connected client. Its state layer, `@colyseus/schema`, is the part this profile focuses on: you declare typed state classes, change plain properties on the server, and each tick the encoder sends only the bytes that changed ([package.json](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/package.json); [notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), Colyseus section).

What sets it apart in its subcategory: the state is a typed tree in which every object has a stable id, and each client can get its own filtered view of that tree (`.view()`). The schema layer is a small binary delta encoder that can be used on its own, and the room server is the part that drives it.

## How it works

- Data model: a tree of `Schema` classes. Declare them with `schema({ name: t.string(), ... }, "Name")`, which returns a real class. Child schemas, `t.array()` and `t.map()` nest inside. Each instance gets a numeric `refId`. Server and client must share the same definition and field order ([README: schema definition](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/README.md#L22-L47); [README: limitations](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/README.md#L294-L307)).
- Field limit: a Schema holds at most 63 fields (`MAX_FIELDS = 63`). The README says 64; the code wins. See Gaps. ([Metadata.ts#L18](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/Metadata.ts#L18), [spec.ts#L1](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoding/spec.ts#L1))
- One change looks like: a `refId`, then per field an index and an op byte (ADD, REPLACE, DELETE, DELETE_AND_ADD and collection ops), then the new value. The op codes are bit flags ([spec.ts#L7-L27](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoding/spec.ts#L7-L27)).
- Recording: each Schema instance has a `ChangeTree` that keeps one op per field per tick. Only the latest value is encoded ([ChangeTree.ts#L439-L464](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/ChangeTree.ts#L439-L464), [getValue#L817-L819](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/ChangeTree.ts#L817-L819)).
- Persistence: none. The state lives in memory for the life of the room. Colyseus keeps no history, so a late joiner gets a full snapshot from `encodeAll()`, not a replay ([lessons/object-model.md](../lessons/object-model.md), section 3).
- Transport: none inside `@colyseus/schema`. `encode()` returns a `Uint8Array`, and the room server sends those bytes over its socket. The docs list WebSocket (default), uWebSockets.js, WebTransport and Bun WebSockets for the server ([notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), 0.18 section).
- Runtime: the room server is a long-lived Node process. The schema package is plain JS/TS with an ESM build and no runtime dependencies ([package.json](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/package.json)).
- Client use from plain JS: the README says `schema()` "runs in plain JavaScript and TypeScript alike, with no compiler configuration". The room client SDK was not read (see Gaps).

Encoder and decoder entry points:

- Server: `new Encoder(state)`; `encodeAll()` for a join ([Encoder.ts#L222](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Encoder.ts#L222), [L449](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Encoder.ts#L449)); `encode()` for each patch tick ([L278-L285](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Encoder.ts#L278-L285)).
- Views: `encodeView` sends only fields and objects a client's `StateView` includes ([L484](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Encoder.ts#L484); [StateView.ts#L89](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/StateView.ts#L89)).
- Unreliable channel: `encodeUnreliable` runs on its own cadence, for fields tagged `@unreliable` ([L293](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Encoder.ts#L293), [annotations.ts#L241](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/annotations.ts#L241)).
- Client: `new Decoder(state)` and `decoder.decode(bytes)` ([README: decoder](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/README.md#L271-L282); [Decoder.ts#L13](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/decoder/Decoder.ts#L13)).

## Code facts

- Language: TypeScript source in `src/`, built with `tsc` and rollup into ESM, CJS and `.d.ts` files ([package.json](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/package.json)).
- OO vs functional: mostly classes (`Schema` [L21](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/Schema.ts#L21), `ChangeTree` [L188](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/ChangeTree.ts#L188), `Encoder`, `Decoder`, `Root` [L30](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Root.ts#L30), `StateView`). The public API is functional: `schema()` [annotations.ts#L754](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/annotations.ts#L754) and `defineTypes()` [L607](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/annotations.ts#L607) build the classes from plain field maps.
- Main classes: `Schema` (state node), `ChangeTree` (per-instance dirty record), `Root` (refId table), `Encoder`, `Decoder`, `StateView` (per-client filter), `ArraySchema` / `MapSchema` / `CollectionSchema` / `SetSchema` / `StreamSchema` in `src/types/custom/`.
- Key deps: none at runtime (no `dependencies` key). Optional peer: `typescript >=5.0.0`. Dev only: `@msgpack/msgpack` (the benchmark comparison), `mocha`, `tsx`, `typescript-7` ([package.json](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/package.json)).
- Transports: none in this package. The socket code is in the room server, which is not cloned.
- How changes are represented: a flat map of refId to ChangeTree; each ChangeTree holds one op byte per field, marks the field dirty, and `encode()` writes the dirty fields with their current values. The wire is positional: field index, not field name.

## Group-by positions

Axes that apply to `realtime` in taxonomy.md:

- authority: `server`. One authoritative copy per room; clients receive patches and send messages back ([notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), authoritative server section; [notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md) Colyseus section: "Server-authoritative Node.js rooms").
- conflict: `lww`. Last write wins per field; the schema keeps one op per field per tick ([ChangeTree.ts#L439-L464](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/ChangeTree.ts#L439-L464)). Also `rebase` for a client's own unacknowledged inputs under 0.18 prediction, which lives in the room server, not in this package ([notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), 0.18 section).
- change-format: `id-ops`. Ops address a refId and a field index, not a path ([spec.ts#L7-L27](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoding/spec.ts#L7-L27); [taxonomy.md](../taxonomy.md), `id-ops` users).
- partition: `room-per-doc`. Each room is one actor holding the live copy ([taxonomy.md](../taxonomy.md), `room-per-doc` users: "Colyseus rooms").
- transport: `websocket` (default), plus `webtransport` through `@fails-components/webtransport` ([notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), transports and the WebTransport note).

Features (tags from taxonomy.md section 5): `realtime`, `partial-loading` (per-client `StateView` filters), `nested-trees` (child schemas, arrays, maps), `multi-user-merge` (LWW per field at the server), `node-only` (the room server), `browser-esm-no-bundler` (the schema package), `open-source` (MIT), `self-hostable`.

Left out: `client-model`, `reactivity`, `list-order` and `history`, because the taxonomy does not apply those axes to `realtime`.

## Pairs with

- `uwebsockets-js`: a socket server that the Colyseus docs list as a transport option, so it sits under the rooms as the wire layer ([notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), 0.18 transports).

## Alternatives

Substitutes: you would pick one of these instead.

- `nakama`: the other game server in the same subcategory ([taxonomy.md](../taxonomy.md), realtime). **Inference:** Nakama delivers client messages to a match in per-tick batches ([notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), Nakama tick section), so you write the state sync yourself, where Colyseus gives you the diffed state tree.
- `socket-io`: a generic event socket with no shared state tree. **Inference:** choose it for chat-style events where no object model needs to stay in sync; choose Colyseus when clients need a live mirror of a typed tree.

## Avoid with

Genuine conflicts only.

- `cloudflare-durable-objects`: runtime mismatch. Colyseus is Node-only, so a room server cannot run inside Workers or a Durable Object. A tick loop inside a Durable Object keeps it from hibernating and bills for duration ([taxonomy.md](../taxonomy.md), Conflicts; [notes/cloudflare_vs_postgres_platforms.md](../notes/cloudflare_vs_postgres_platforms.md) sections 1 and 5).

## Adopters

- **Colyseus showcase games**: Pixels.xyz, Bloxd.io, Kirka.io, Make it Meme and SongTrivia2 (TypeScript clients); Unboxing the Cryptic Killer by Eleven Puzzles (Unity); Raft Wars Multiplayer (Defold). All are listed as Colyseus users on colyseus.io; the notes do not say how each one wires its room server. (Vendor showcase, as recorded in [notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md) Colyseus section. Not checked against the adopters' own repos.)
- Eleven Puzzles says its operating cost was "substantially lower than alternatives". This is the vendor's reported quote, not verified.

## Status

- Colyseus server: 0.18.10, released 2026-10-22; repository last pushed 2026-10-26; about 7,490 stars. Source: [notes/adoption_metrics.csv](../notes/adoption_metrics.csv), Colyseus row. The 0.18 release (August 2026) added prediction, a fixed timestep and rewind ([notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), 0.18 section; [colyseus.io/blog/colyseus-018-is-here](https://colyseus.io/blog/colyseus-018-is-here/) as cited there).
- `@colyseus/schema`: package version 5.0.43; the clone's HEAD commit is "bump 5.0.43", dated 2026-10-29. Version 5 changed the field limit to 63 ([notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), field-limit note).
- Maintainer: the package author is Endel Dreyer; Colyseus is a company that also sells Colyseus Cloud ([package.json](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/package.json); [notes/adopters_and_pairings.md](../notes/adopters_and_pairings.md)).
- License: MIT. The LICENSE file reads "Copyright (c) 2018 Endel Dreyer, MIT License" ([LICENSE](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/LICENSE)).

## Fit for lew42

**Inference:** Colyseus is the closest existing model to the `Item` idea: a typed object tree, per-property changes, a stable id per object, per-client views and `onAdd` / `onRemove` / `onChange` events ([notes/game_netcode_streaming_ui.md](../notes/game_netcode_streaming_ui.md), Colyseus section). Lew42 would gain its refId rule, its one-op-per-field rule and its explicit delete op. Lew42 would lose three things if it adopted the server: the record (a room holds state only in memory, so the JSONL log would still be the record), the dynamic shape (every field must be declared up front, with at most 63 per object), and Workers hosting (the server needs Node). Verdict: borrow the ideas (see Lessons and Lesson for Lew42), and skip the server for now.

## Lessons

- **One op per field per tick**: `record()` keeps one op byte per field. A second write to the same field in the same tick reuses the slot, and the encoder reads the current value at encode time, so only the latest value goes out ([ChangeTree.ts#L439-L464](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/ChangeTree.ts#L439-L464), [getValue#L817-L819](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/ChangeTree.ts#L817-L819)).
- **refIds are never reused**: a counter that only goes up gives each object a stable id, so a client that missed a delete cannot see an old id bound to a new object ([Root.ts#L31-L37](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Root.ts#L31-L37), [assigned at L174-L189](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/Root.ts#L174-L189)).
- **Clearing a field is its own op**: `DELETE` is separate from `ADD`, and a delete followed by an add in one tick becomes `DELETE_AND_ADD` ([spec.ts#L7-L27](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoding/spec.ts#L7-L27), [ChangeTree.ts#L439-L464](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/encoder/ChangeTree.ts#L439-L464)).

## Lesson for Lew42

- Copy the latest-op-per-field rule within one flush. It fixes gap 2 in [lessons/object-model.md](../lessons/object-model.md). Keep the history: merge only inside one flush, because lew42's log is the record and Colyseus has none.
- Give every `Item` an id that is never reused, and write changes by that id rather than by list position. This is the fix for the stale-edit-after-move case in [lessons/object-model.md](../lessons/object-model.md).
- Do not adopt the room server yet. It is Node-only, keeps no history and needs a long-lived process. Borrow its schema ideas, and keep JSONL as the record.

## Gaps

- The room server (`colyseus/colyseus`: tick loop, `patchRate`, prediction, rewind, transports) is not cloned. Its claims come from the notes and the 0.18 blog and were not checked against source.
- Not read: `@colyseus/database`, the room client SDK (its `Callbacks` API), and `@fails-components/webtransport`. The feature tags `sqlite` and `postgres` are left out until `@colyseus/database` is read.
- The adopter list is the vendor's showcase on colyseus.io. The games' own repos were not checked.
- The README says 64 fields per Schema; the code sets `MAX_FIELDS = 63` and throws above it ([Metadata.ts#L18](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/Metadata.ts#L18), [L160-L163](https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src/Metadata.ts#L160-L163)). The README is stale on this point.
- The benchmark figure in the notes (9 vs 26, units not stated) was not reproduced.

## Sources

- https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/README.md
- https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/package.json
- https://github.com/colyseus/schema/blob/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/LICENSE
- https://github.com/colyseus/schema/tree/390cf3833cf76f588f140a01b1d5daf9e4fd5fbb/src (all code links above)
- https://colyseus.io/blog/colyseus-018-is-here/ (cited in notes/game_netcode_streaming_ui.md)
- https://docs.colyseus.io/state (cited in notes/game_netcode_streaming_ui.md)
- notes/game_netcode_streaming_ui.md, notes/adopters_and_pairings.md, notes/adoption_metrics.csv, notes/cloudflare_vs_postgres_platforms.md
- lessons/object-model.md, taxonomy.md
