# Taxonomy: shared vocabulary for tool records

Owner: taxonomy agent. Updated 2026-10-30.

What this is: the field names, categories, layers, decision axes and feature tags that every agent uses when writing tool ops. Rules of use:

- Every record has exactly **one `category`** and **one `subcategory`** (section 3). Categories are the main way to browse.
- `layers`, `strategies` and `features` are small, fixed vocabularies. Use only the tags defined here. If one is missing, propose it in your final report instead of inventing it.
- Reuse the ids in the id map (section 7). Check it before you create a new id.

Sections: 1 Record schema · 2 Stack layers · 3 Categories and subcategories · 4 Decision axes · 5 Feature tags · 6 Compatibility rules · 7 Id map

## 1. Record schema (`data/tools.jsonl`)

One JSON object per tool. Ops set these fields, and `scripts/build.mjs` folds them.

- `id`: lowercase kebab-case, stable. Take it from the id map (section 7).
- `name`: display name.
- `kind`: one of
  - `tool`: software you install or run (a library, server or engine).
  - `platform`: a hosted service you rent (Supabase, Cloudflare D1, LiveKit Cloud).
  - `protocol`: a spec or wire format (WebSocket, MoQ, AG-UI).
  - `pattern`: a documented design studied as precedent, often in-house (Figma multiplayer, Linear's sync engine). Filed under the category of what it does.
  - `strategy`: a proposed, not-yet-built combination. Category `stack`, subcategory `proposed-stack`.
  - `own`: the owner's framework (`lew42-framework`).
- `category`: exactly one main category id from section 3 (`ui`, `state`, `stack`, `crdt`, `sync`, `backend`, `storage`, `event-log`, `realtime`, `media`, `editor`, `search`), as a string.
- `subcategory`: exactly one subcategory id from that category's table in section 3, as a string.
- `parent`: optional id of the tool this one extends or grew out of (marionette → `backbone`, `react-router` → `react`). Not tagged yet.
- `layers`: list of layer ids from section 2 that the tool covers.
- `strategies`: list of `"axis: option"` strings from section 4, e.g. `"conflict: lww"`. Use only axes scoped to the tool's category. A tool that supports several options of one axis gets several strings.
- `features`: list of feature tags from section 5.
- `pairs_with`: `[{id, why}]`, tools commonly used together.
- `alternatives`: `[{id, why}]`, substitutes, where you would pick one of them.
- `avoid_with`: `[{id, why}]`, genuine conflicts only: two owners of the same state, a runtime mismatch, or the wrong data shape. Never mere substitutes.
- `adopters`: `[{name, how, src}]`, named users and how they wire it.
- `status`: `{id, date, note}`. `id` is one of the status values below. `date` is when that state began (archived, moved, shut down) or, for active, preview and stale, the last release that shows it. `note` is optional.
- `license`: SPDX string from the CSV or the notes. Leave it out when GitHub reports `NOASSERTION` and the notes say nothing.
- `metrics`: merged from `notes/adoption_metrics.csv` by the build (`stars`, `weekly_downloads`, `latest_release_date` (the last release), `forks`, `flags`, ...). Never set it by op.
- `summary`: one or two sentences.
- `lessons`: `[{id, path, why}]`, pointers into `lessons/*.md`.
- `sources`: list of URLs or notes paths (`notes/sync_engines_crdts.md`). Every op also carries `src`; the build collects those too.

Status values:

- `active`: a release within about 12 months, and no announced wind-down.
- `preview`: no stable release yet (alpha, beta, RC, "do not use in production").
- `maintenance`: the maintainers say fixes only, or point users to a successor.
- `stale`: no release for 12+ months and no announcement. It may still work.
- `moved`: development continues under another repo, host or package name.
- `archived`: the repo is read-only and no continuation is announced.
- `shut-down`: a hosted service has ended or has an announced end date (`date` = the end date).

## 2. Stack layers

| layer | what it covers |
|---|---|
| ui-binding | Rendering state to the DOM and wiring user input back to state. |
| client-state | In-memory state on the client and its change tracking (signals, models, a CRDT doc, a query cache). |
| client-storage | Durable storage on the user's device: IndexedDB, OPFS, client SQLite, local files. |
| transport | The wire between client and server: WebSocket, SSE, HTTP polling, WebRTC, WebTransport. |
| sync-authority | The logic that orders, validates, merges and fans out changes (a room server, a sync engine, a Durable Object, a CRDT merge). |
| app-server | Request handling around the data: routing, server functions, auth, permissions, business logic. |
| storage | The durable store of record on the server side: a database, SQLite file or JSONL log. |
| blob-storage | Large or immutable binary objects: assets, snapshots, archived log segments (R2, S3). |
| query | Indexing and querying beyond lookup by key: SQL, full-text, vector, live queries. |
| media | Audio and video transport, plus speech AI (speech-to-text, text-to-speech, voice agents). |
| runtime | Where server code runs and how it is hosted: Node, Workers, a VM, a managed platform. |

## 3. Categories and subcategories

Two levels. Every tool has exactly one `category` (the main browse level, below) and one `subcategory` inside that category. Subcategories group tools by what they actually do. Members are listed by weekly downloads, then stars; a subcategory marked "none yet" is defined for future records.

Reference designs (kind `pattern`, such as Figma multiplayer or Linear's sync engine) are filed under the category and subcategory of what they do; `kind` tells them apart from installable tools.

### Main categories

| category | name | definition | group by |
|---|---|---|---|
| `ui` | UI | Libraries that render state to the page and wire user input back: component frameworks, template binders and DOM patchers. | subcategory · `reactivity` · feature `browser-esm-no-bundler` |
| `state` | Client state | Reactive primitives, stores, model trees and data caches that hold app data in the browser and say when it changes. | subcategory · `reactivity` · `change-format` |
| `stack` | Full-stack frameworks | Frameworks that own routing, server code and the data path between server and UI. | subcategory · `reactivity` · `transport` |
| `crdt` | CRDTs | Libraries whose documents merge concurrent edits from any replica in any order, plus the providers that store and ship them. | subcategory · `list-order` · `history` |
| `sync` | Sync | Servers, engines and client databases that keep many copies of shared state in step. | subcategory · `authority` · `conflict` |
| `backend` | Backends | Server sides you rent or run as a product: bundled backends, cloud platforms, and the runtimes server code runs in. | subcategory · feature `self-hostable` / `hosted-only` · `transport` |
| `storage` | Storage | Databases, ORMs, storage adapters and change formats that persist data on a server or a device. | subcategory · `layout` · feature `node-only` / `runs-on-cloudflare-workers` |
| `event-log` | Event logs | Append-only streams of events or records, and the libraries that build state from them. | subcategory · `history` |
| `realtime` | Realtime | Socket libraries, wire protocols and multiplayer game servers for live client-server channels. | subcategory · `transport` · `authority` |
| `media` | Media | Audio and video routing, live streaming, speech AI and voice agents. | subcategory · `transport` |
| `editor` | Editors | Ready-made editors and canvases with their own document model. | subcategory · `change-format` · `list-order` |
| `search` | Search | Full-text, fuzzy, vector and hybrid search. | subcategory · `query` |

### How to tell the categories apart

- `ui`: renders the page. Frameworks that also own routing and server code are `stack`; editors with their own document model are `editor`.
- `stack`: owns routing, server code and the data path. A UI library alone is `ui`; a hosted data backend is `backend`.
- `crdt`: the mergeable document library and its storage or network providers. A server that hosts many such documents is `sync` / `room-server`.
- `sync`: keeps copies in step. `room-server` holds one live document per room; `sync-engine` replicates a server database into clients; `local-first-db` is a client database that is its own source of truth.
- `backend`: `baas` is one vendor's hosted bundle (database + auth + realtime + files behind one client SDK); a BaaS that can also be self-hosted (Supabase, Appwrite, Convex) stays `baas`. `self-hosted-backend` is the same bundle with no first-party hosting (PocketBase, Parse Server). `cloud-platform` is separate primitives (Workers, Durable Objects, queues) wired together with your own server code. A hosted database alone is `storage` / `managed-db`.
- `storage`: persists data. `managed-db` is a rented database and nothing else; `database-server` is the engine you run (or rent) as its own process; `embedded-db` runs inside your process.
- `event-log`: append-only streams read by offset. A key-value file that happens to be an append log (jsonl-db, NeDB) is `storage` / `embedded-db`.
- `realtime`: the live channel itself and game rooms. Audio and video routing is `media`.
- Cloudflare products are filed by what they do: Workers and Durable Objects are `backend` / `cloud-platform`; D1 is `storage` / `managed-db`; R2 is `storage` / `object-storage`; workerd, Wrangler and Miniflare are `backend` / `js-runtime`. Tools that run on or pair with Cloudflare are linked from `pairs_with` on those Cloudflare records, never tagged "cloudflare".

### ui: UI

| subcategory | category | definition | members |
|---|---|---|---|
| `component-framework` | `ui` | Component frameworks with their own rendering model (virtual DOM, compiler or signals): React, Vue, Svelte, Solid, Lit, Angular. | `react`, `vue`, `solid`, `lit`, `svelte`, `angular` |
| `template-binding` | `ui` | Small libraries that bind HTML templates or the DOM to reactive state, usually with no build step. | `knockout`, `uhtml`, `arrowjs` |
| `dom-diff` | `ui` | Standalone DOM patchers: given new HTML or a new list, they update the live DOM in place by morph or keyed diff. | `morphdom`, `idiomorph`, `udomdiff` |
| `agent-ui` | `ui` | Protocols and SDKs that let an AI agent stream or edit UI (component trees as data, state deltas, sandboxed HTML apps). | none yet |

### state: Client state

| subcategory | category | definition | members |
|---|---|---|---|
| `signals` | `state` | Fine-grained reactive primitives (signal, computed, effect; observables; reactive proxies) that work without a UI framework. | `vue-reactivity`, `preact-signals`, `alien-signals`, `mobx`, `signal-polyfill` |
| `state-store` | `state` | App-level state containers with subscribe (one store, atoms or a proxy snapshot), mostly used from React. | `zustand`, `jotai`, `valtio` |
| `model-tree` | `state` | Model and collection classes, or a typed state tree, that emit change events or patches and snapshots. Closest to lew42's Item and List. | `backbone`, `mobx-state-tree`, `mobx-keystone` |
| `client-data-layer` | `state` | Client caches and collections that fetch or sync from a server and keep query results live. | `tanstack-query`, `tanstack-db`, `warpdrive-ember-data` |

### stack: Full-stack frameworks

| subcategory | category | definition | members |
|---|---|---|---|
| `meta-framework` | `stack` | Full-stack frameworks built on a UI framework: routing, loaders or server functions, server rendering. Persistence and realtime are bring-your-own. | `next-js`, `react-router`, `astro`, `sveltekit`, `nuxt`, `remix`, `solidstart`, `qwik` |
| `server-driven` | `stack` | The server renders HTML or diffs and pushes them to a thin client library over HTTP, WebSocket or SSE. | `hotwire-turbo`, `phoenix-liveview`, `htmx`, `livewire` |
| `live-data-stack` | `stack` | Full-stack frameworks with a built-in live data path from the store to the UI (Meteor's DDP; the owner's framework). | `meteor`, `lew42-framework` |
| `proposed-stack` | `stack` | A proposed, not-yet-built combination of tools and strategies (kind `strategy`), written by the report agents. | none yet |

### crdt: CRDTs

| subcategory | category | definition | members |
|---|---|---|---|
| `crdt-core` | `crdt` | The CRDT document library itself (maps, lists, text, trees), independent of storage and transport. | `yjs`, `loro`, `automerge` |
| `crdt-adapter` | `crdt` | Storage providers, network providers and repos that plug a CRDT library into a store or a wire. | `y-websocket`, `automerge-repo`, `y-leveldb` |

### sync: Sync

| subcategory | category | definition | members |
|---|---|---|---|
| `room-server` | `sync` | Holds one live copy per room or document in memory, orders or merges changes, fans them out over WebSockets and persists them. Does not query across documents. | `agents-sdk`, `partyserver-partysocket`, `hocuspocus`, `liveblocks`, `partykit`, `y-sweet`, `automerge-repo-sync-server` |
| `sync-engine` | `sync` | Replicates an authoritative server database (usually Postgres) into client stores by query or shape, with optimistic writes. | `electricsql`, `zero`, `powersync-js`, `replicache` |
| `local-first-db` | `sync` | A client-side database that is its own source of truth and replicates to peers or through a thin server. | `triplit`, `rxdb`, `pouchdb`, `gun`, `tinybase`, `livestore`, `orbitdb`, `jazz-classic`, `jazz` |

### backend: Backends

| subcategory | category | definition | members |
|---|---|---|---|
| `baas` | `backend` | One vendor's backend product: database + auth + realtime + file storage behind one client SDK, with little server code to write. Hosted by the vendor, even if it can also be self-hosted. | `supabase`, `firebase-js-sdk`, `convex`, `instantdb`, `appwrite` |
| `self-hosted-backend` | `backend` | The same bundle as a BaaS, shipped only as software you run yourself (one binary or one server), with no first-party hosting. | `pocketbase`, `parse-server` |
| `cloud-platform` | `backend` | Separate compute, actor, queue and networking primitives that you assemble into a backend with your own server code: Cloudflare Workers and Durable Objects, AWS, Fly.io. | `cloudflare-durable-objects`, `cloudflare-workers` |
| `js-runtime` | `backend` | JavaScript runtimes, plus the local emulators and CLIs that server code runs in. | `workerd`, `miniflare`, `workers-sdk` |

### storage: Storage

| subcategory | category | definition | members |
|---|---|---|---|
| `orm` | `storage` | ORMs and SQL query builders: typed access to a relational database, with or without a model layer. | `drizzle-orm`, `kysely`, `prisma`, `typeorm`, `sequelize`, `mikroorm`, `objection-js` |
| `storage-abstraction` | `storage` | One key-value or blob API over many backends (files, SQLite, S3/R2, KV, Redis). | `keyv`, `unstorage` |
| `embedded-db` | `storage` | A database engine or file-backed store that runs inside your own process (Node, browser or Durable Object). | `pglite`, `better-sqlite3`, `lmdb-js`, `libsql`, `dexie-js`, `duckdb-node-neo`, `lowdb`, `lokijs`, `classic-level`, `duckdb-node`, `nedb`, `turso`, `alcalzone-jsonl-db` |
| `object-db` | `storage` | Transparent object persistence: change an object's attribute and it is saved on commit. | `zodb` |
| `database-server` | `storage` | A database engine that runs as its own server process, self-run or rented. | `postgres`, `redis` |
| `managed-db` | `storage` | A hosted database and nothing else (no auth or realtime bundle), so you still bring your own server: Cloudflare D1, Neon, Turso Cloud. | `cloudflare-d1` |
| `object-storage` | `storage` | Object and blob stores, and the snapshot-plus-segment layouts built on them: Cloudflare R2, S3. | `cloudflare-r2` |
| `delta-format` | `storage` | Specs and small libraries for encoding changes and list order: patches, ordering keys. | `immer`, `fast-json-patch`, `fractional-indexing` |
| `serialization` | `storage` | Serializers that carry types, references and cycles through JSON. | `seroval`, `devalue`, `superjson` |

### event-log: Event logs

| subcategory | category | definition | members |
|---|---|---|---|
| `event-store` | `event-log` | A server, protocol or client for append-only streams, read and resumed by offset or position. | `kurrentdb-node-client`, `kurrentdb-server`, `durable-streams` |
| `event-sourcing` | `event-log` | Libraries for event-sourced apps (commands, aggregates or deciders, projections) on top of a store. | `nestjs-cqrs`, `emmett`, `castore` |

### realtime: Realtime

| subcategory | category | definition | members |
|---|---|---|---|
| `socket-library` | `realtime` | Server and client libraries that implement or wrap a live channel (WebSocket, WebRTC data channels). | `ws`, `socket-io`, `geckos-io`, `uwebsockets-js` |
| `game-server` | `realtime` | Multiplayer game servers and netcode frameworks: rooms, tick loops, prediction, rollback. | `colyseus`, `nakama` |
| `transport-protocol` | `realtime` | A web standard for a live channel: WebSocket, SSE, WebRTC, WebTransport. | none yet |

### media: Media

| subcategory | category | definition | members |
|---|---|---|---|
| `sfu` | `media` | Selective forwarding units and WebRTC stacks that route audio and video between participants. | `livekit-server`, `mediasoup`, `janus-gateway`, `pion-webrtc` |
| `media-sdk` | `media` | Client SDKs and hosted kits that add calls and rooms to an app. | `livekit-client-sdk-js` |
| `speech-ai` | `media` | Speech-to-text, text-to-speech and speech-to-speech models and APIs. | `faster-whisper`, `whisper`, `piper1`, `kokoro-tts`, `whisper-cpp`, `piper` |
| `voice-agent` | `media` | Frameworks that chain speech-to-text, an LLM and text-to-speech, with turn detection and interruption. | `livekit-agents-js`, `livekit-agents`, `pipecat` |
| `live-streaming` | `media` | One-to-many broadcast: ingest and playback protocols and services. | none yet |

### editor: Editors

| subcategory | category | definition | members |
|---|---|---|---|
| `rich-text` | `editor` | Rich-text and block editors. | `prosemirror`, `tiptap`, `lexical`, `blocksuite` |
| `canvas` | `editor` | Whiteboards and infinite-canvas editors. | `excalidraw`, `tldraw` |
| `page-builder` | `editor` | Visual page builders that edit a tree of components and props. | `grapesjs`, `puck`, `craft-js`, `plasmic` |

### search: Search

| subcategory | category | definition | members |
|---|---|---|---|
| `search-library` | `search` | In-process search indexes for the browser or Node. | none yet |
| `search-engine` | `search` | A search index inside a database (SQLite FTS5), or a standalone search server. | none yet |
| `managed-search` | `search` | Hosted search and vector services. | none yet |

## 4. Decision axes (strategies)

Tag format: `"axis: option"`. Each axis lists the main categories (section 3) where it applies. Users come from the notes (`notes/*.md`).

| axis | the question it answers |
|---|---|
| authority | Who holds the truth for a piece of state? |
| conflict | How do concurrent edits to the same thing resolve? |
| change-format | What does one change look like on the wire and in the log? |
| list-order | How are ordered children stored and moved? |
| layout | How is persisted state laid out on disk or in a bucket? |
| partition | What unit is scaled out: a room, a tenant database, a shard, or nothing? |
| transport | Which client-server channel carries live changes? |
| client-model | What shape of data does the client hold? |
| reactivity | How do state changes reach the UI? |
| query | What querying or search do you get? |
| history | What happens to old changes? |

### authority

Applies to: crdt, sync, backend, realtime, stack.

- `server`: one authoritative copy per document or database. Clients apply edits optimistically and accept the server's order. Simplest merge and permissions, but committing needs the server online. Users: Figma, Linear, tldraw sync, Zero. (notes/collab_app_architectures.md Q7; notes/delta_logs_build_vs_buy.md §5)
- `local-first`: every replica is authoritative and merges on sync. The server, if any, relays or backs up. Works offline and peer-to-peer; merge rules, history GC and permissions get hard. Users: Automerge apps, Actual Budget, Anytype, Evolu. (notes/adopters_and_pairings.md Q3; notes/sync_engines_crdts.md)
- `hybrid`: a local-first data model (usually a CRDT) with a central server that authorizes, stores and relays. Offline edits still merge, and the server stays the place of record. Users: Outline and Plane (Yjs + Hocuspocus), AFFiNE, Proton Docs, Jazz 2. (notes/adopters_and_pairings.md Q3; notes/sync_engines_crdts.md, Jazz)

### conflict

Applies to: crdt, sync, backend, state, editor, realtime, storage.

- `lww`: last writer wins per property, field, cell or record. Trivial and usually enough, but one of two concurrent edits to the same value is lost silently. Users: Figma (per property), Linear, Excalidraw (per element version), TinyBase MergeableStore, Evolu. (notes/delta_logs_build_vs_buy.md §1, §5)
- `rebase`: server reconciliation. The client rewinds its pending changes, applies the server's, then replays its own (named mutators). Flexible business rules, but mutations must be safe to run twice. Users: Replicache, Zero, Figma (drops server changes that conflict with unacked local ones), Colyseus prediction. (notes/delta_logs_build_vs_buy.md §5; notes/game_netcode_streaming_ui.md A1-A3)
- `ot`: operational transformation of ops against concurrent ops, on the server. Proven for text, but transform cases grow with the square of op types. Users: Google Docs. (notes/collab_app_architectures.md Q1)
- `crdt`: a merge function that converges in any order (sequence CRDTs for text and lists, maps). Needed for character-level text and true offline multi-writer; costs metadata, tombstones and history growth. Users: Yjs (Outline, AFFiNE), Automerge (GoodNotes, Bowtie), Loro, Actual Budget. (notes/sync_engines_crdts.md)
- `lock`: a single writer, a lock, or a version check that rejects stale writes. Simple and safe; contended edits fail and retry instead of merging. Users: Penpot (`revn` check under a per-file lock), CouchDB/PouchDB (`_rev`, 409), lmdb-js `ifVersion`, ProseMirror collab. (notes/adopters_and_pairings.md Q3; notes/node_storage_orms.md §2, §4; notes/delta_logs_build_vs_buy.md §5)

### change-format

Applies to: crdt, sync, backend, state, storage, event-log, ui, editor, realtime, stack.

- `snapshot`: send or store the whole state. Simplest replay, but size grows with the document and there is no per-change history. Users: Hocuspocus storage, Craft.js/GrapesJS/Puck saves, Cloudflare Agents `setState`, TinyBase FilePersister. (notes/game_netcode_streaming_ui.md B3; notes/node_storage_orms.md §2)
- `path-patch`: JSON Patch-style ops addressed by path and array index. Standard and readable, but breaks under concurrent or reordered list edits because indices shift. Users: mobx-state-tree, Immer, AG-UI `STATE_DELTA`, json-render. (notes/delta_logs_build_vs_buy.md §1; notes/game_netcode_streaming_ui.md B1-B2)
- `id-ops`: ops addressed by stable object id and property (`{id, key, value}` plus create and delete). Survive moves and concurrency; need client-side id generation and an id index. Users: Figma, tldraw (`RecordsDiff`), Linear, A2UI, Colyseus schema. (notes/delta_logs_build_vs_buy.md §1; notes/collab_app_architectures.md Q1)
- `crdt-updates`: opaque CRDT update blobs. Merge anywhere in any order, but not human-readable without the library. Users: Yjs, Automerge, Loro. (notes/sync_engines_crdts.md)
- `events`: domain events (`todoCreated`) materialized into state. Keep intent and let you rebuild projections; event schemas must be versioned forever. Users: LiveStore, Emmett, KurrentDB. (notes/sync_engines_crdts.md; notes/node_storage_orms.md §3)
- `row-changes`: row-level insert/update/delete from a table or query (CDC, shapes, DDP `added`/`changed`/`removed`). Fit relational data and partial sync; nested documents must be flattened into rows. Users: Electric, Zero, Supabase Realtime, Meteor DDP, PocketBase SSE. (notes/fullstack_framework_data_paths.md §1, §4)

### list-order

Applies to: crdt, state, editor, sync, storage, ui.

- `index`: array position. Natural for one writer; concurrent inserts and moves need rebasing or rejection. Users: JSON Patch and Immer, MobX arrays, Notion (ordered child-id arrays, server-ordered), Puck. (notes/delta_logs_build_vs_buy.md §2; notes/signals_reactivity_lists.md §4)
- `fractional`: each child stores a sortable position key between its neighbours, often in the same property as its parent link. A move is one LWW write; concurrent inserts can interleave (fine for objects, bad for text). Users: Figma, Loro tree, Excalidraw, rocicorp fractional-indexing. (notes/delta_logs_build_vs_buy.md §2)
- `list-crdt`: a sequence CRDT (RGA, YATA, Fugue) with an id per element. No interleaving, and it merges offline; costs tombstones and metadata, and move needs special support (Loro MovableList). Users: Yjs, Automerge, Loro, list-positions. (notes/sync_engines_crdts.md, ordered lists; notes/delta_logs_build_vs_buy.md §2)
- `insert-after`: each insert names the element it follows, and a central server applies inserts in its own order. Text collaboration without CRDT or OT in under 300 lines, but it needs a server. Few named users: Weidner's "Collaborative Text Editing without CRDTs or OT" (2025). (notes/delta_logs_build_vs_buy.md §2)

### layout

Applies to: storage, sync, crdt, event-log, editor.

- `file-rewrite`: one file or blob per document, rewritten whole (atomically) on save. Readable and trivial; loses edits between saves, keeps no history, slows with big documents. Users: lowdb, TinyBase FilePersister, Obsidian and Jupyter files, Hocuspocus (one blob per document, overwritten). (notes/object_dbs_file_layouts.md Q5; notes/node_storage_orms.md §2)
- `log-snapshot`: an append-only log plus periodic snapshots that record the log position they cover. Load = snapshot + later entries. Durable per change with history; needs compaction and crash-safe rotation. Users: NeDB, jsonl-db, ZODB FileStorage, automerge-repo, Figma (journal + checkpoints), lew42. (notes/node_storage_orms.md §3; notes/collab_app_architectures.md Q3)
- `db-rows`: state stored as rows in a database (central or per document), with transactions and indexes. Queries and transactions come free; schema migrations, and less human-readable. Users: Linear, Notion, tldraw (records in Durable Object SQLite), Outline (a Postgres column). (notes/object_dbs_file_layouts.md Q4)
- `object-segments`: immutable numbered segment objects + a snapshot + a small manifest in object storage, using conditional writes. Cheap and bottomless with no append needed; per-PUT cost and latency need batching. Users: Figma S3 checkpoints, Delta Lake, Litestream, turbopuffer. (notes/object_dbs_file_layouts.md Q3, Q6)

### partition

Applies to: sync, backend, storage, realtime.

- `room-per-doc`: one single-threaded process or actor per document or room, holding the live copy. Ordering for free and cheap idle rooms; no cross-document transactions, and cross-document queries need another store. Users: Figma (process per document), tldraw (Durable Object per file), Liveblocks (Durable Object per room), Colyseus rooms. (notes/sync_engines_crdts.md, concessions; notes/cloudflare_vs_postgres_platforms.md §6)
- `db-per-tenant`: many small databases, one per tenant, user or entity. Isolation and easy limits; cross-tenant queries and migrations across N databases. Users: Turso, Cloudflare D1 guidance, Actual Budget (SQLite per group), LiveStore (SQLite per user). (notes/cloudflare_vs_postgres_platforms.md §2; notes/adopters_and_pairings.md Q3)
- `sharded`: one logical database split across shards by key. Scales writes, at an operational cost. Users: Notion (480 logical Postgres shards by workspace), PlanetScale. (notes/collab_app_architectures.md Q1)
- `single`: one database or server for everything. Simplest, but scales only vertically. Users: PocketBase, Outline and Plane (one Postgres), a Supabase project. (notes/fullstack_framework_data_paths.md §4, §9)

### transport

Applies to: realtime, sync, backend, media, stack, event-log.

- `websocket`: one long-lived, two-way TCP connection. Works everywhere, including Durable Objects with hibernation; one lost packet stalls everything behind it. Users: Figma, tldraw, Linear, Convex. (notes/streaming_transports_media_voice.md Q1, Q5, Q7)
- `sse`: a server-to-client event stream over HTTP; writes go through normal requests. Plain HTTP that proxies and CDNs handle, with auto-reconnect; one direction only. Users: PocketBase realtime, Durable Streams, htmx SSE, Electric. (notes/fullstack_framework_data_paths.md §3, §4; notes/sync_engines_crdts.md)
- `http-poll`: periodic or long-poll requests, often after a data-free "poke". Works anywhere and caches; adds latency and request overhead. Users: Electric (long-poll shapes), Replicache (pull after poke), Trilium (push/pull). (notes/sync_engines_crdts.md; notes/delta_logs_build_vs_buy.md §5; notes/adopters_and_pairings.md Q3)
- `webrtc`: UDP media and data channels over ICE/DTLS, usually through an SFU. Low latency and unreliable channels; needs signaling, TURN and an SFU. Users: LiveKit, Discord voice, OpenAI Realtime in the browser, geckos.io. (notes/streaming_transports_media_voice.md Q3, Q4)
- `webtransport`: HTTP/3 (QUIC) streams and datagrams. No head-of-line blocking across streams; Cloudflare Workers and Durable Objects cannot terminate it, and few servers exist. Users: Colyseus (via `@fails-components/webtransport`), MoQ. (notes/streaming_transports_media_voice.md Q1; notes/game_netcode_streaming_ui.md A3)

### client-model

Applies to: sync, crdt, backend, state, storage, stack.

- `query-rows`: the client subscribes to queries and receives row sets. Partial loading and joins; objects must be rebuilt from rows. Users: Zero, Electric, InstantDB, Convex, TanStack DB. (notes/sync_engines_crdts.md, plain-JS section)
- `documents`: the client holds whole documents, one per room. A simple loading unit that works offline per document; big documents load whole, and cross-document queries need a separate index. Users: Yjs, Automerge, Liveblocks Storage, tldraw, Excalidraw. (notes/collab_app_architectures.md Q2)
- `object-graph`: identity-mapped model objects with id references, loaded lazily. Closest to OO code; you write loading and eviction. Users: Linear (object pool + MobX), mobx-keystone, WarpDrive, ZODB, lew42. (notes/fullstack_framework_data_paths.md §6; notes/object_dbs_file_layouts.md Q2)

### reactivity

Applies to: ui, state, stack, crdt.

- `events`: explicit change events or callbacks (`on('change')`). Simple, and they say what changed (good for deltas); manual wiring and no automatic dependency tracking. Users: Backbone, Colyseus `listen`, Yjs `observe`, lew42 `delta` events. (notes/signals_reactivity_lists.md §4, §6)
- `signals`: getters record dependencies at runtime, writes mark dependents dirty, and derived values recompute lazily. Automatic and fine-grained, but they say that something changed, not what. Users: Preact Signals, Solid, Vue, Svelte 5, @tldraw/state. (notes/signals_reactivity_lists.md §1, §3)
- `proxies`: plain-object mutation intercepted by a Proxy, then tracked or snapshotted. Natural syntax; identity and class quirks, and op streams are opt-in. Users: MobX 7, Valtio, Vue `reactive`, Alpine. (notes/signals_reactivity_lists.md §3)
- `re-render`: re-run a render function and diff the output (virtual DOM or keyed template diff). Simple mental model; work grows with the tree on each update. Users: React, Lit (`repeat`), udomdiff. (notes/signals_reactivity_lists.md §4, §8)
- `morph`: the server sends fresh HTML and the client morphs the DOM in place. No client state code, but a round trip per change, and DOM state can be lost. Users: Turbo 8 (idiomorph), htmx 4, Phoenix LiveView, morphdom. (notes/fullstack_framework_data_paths.md §3)

### query

Applies to: search, storage, sync, backend, event-log, state.

- `none`: get and put by key, no secondary queries. Users: Keyv, unstorage, Workers KV, the Durable Object KV API. (notes/node_storage_orms.md §2)
- `client-index`: an in-memory index or live query inside the process. Instant and offline; bounded by RAM and per device. Users: MiniSearch, TinyBase indexes, TanStack DB live queries, Orama. (notes/search_indexing_jsonl_limits.md §2)
- `sql`: SQL with indexes, joins and aggregates. Users: SQLite, Postgres, DuckDB over JSONL, D1. (notes/search_indexing_jsonl_limits.md §5)
- `full-text`: tokenized, ranked text search (BM25, FTS5). Users: SQLite FTS5, MiniSearch, Meilisearch, Pagefind. (notes/search_indexing_jsonl_limits.md §1-2)
- `vector`: embedding similarity search. Users: Cloudflare Vectorize, turbopuffer, pgvector (AFFiNE). (notes/search_indexing_jsonl_limits.md §2; notes/adopters_and_pairings.md Q3)
- `hybrid`: full-text and vector results fused, often reranked. Users: Cloudflare AI Search, Anthropic's Contextual Retrieval, Typesense and Meilisearch. (notes/search_indexing_jsonl_limits.md §1-2)

### history

Applies to: crdt, event-log, storage, sync.

- `keep-all`: never discard changes; compaction only re-encodes. Full audit, undo and time travel; storage grows and loads may replay a lot. Users: Automerge, KurrentDB and other event stores, Anytype's change DAG, classic Jazz. (notes/sync_engines_crdts.md, event-log section)
- `truncate`: write a snapshot, then delete what it covers. Bounded size; loses per-change history and undo past the snapshot. Users: Redis AOF rewrite, NeDB, y-leveldb, Kafka compaction, Loro shallow snapshots. (notes/search_indexing_jsonl_limits.md §5)
- `archive`: keep a snapshot in the hot store and move sealed segments to cheap storage. Bounded hot size with history kept; one more tier to manage. Users: tldraw (keyframe + delta version chain in R2), Litestream retention, Obsidian Sync version history. (notes/adopters_and_pairings.md Q3; notes/object_dbs_file_layouts.md Q3)

## 5. Feature tags

Flags that are true of the tool as shipped, not of what you could build on it.

| tag | meaning |
|---|---|
| realtime | Pushes changes to connected clients as they happen (no manual refetch). |
| offline | Keeps working without a connection and syncs later; edits made offline are kept. |
| multi-user-merge | Merges concurrent edits from several users automatically (LWW, rebase, OT or CRDT). |
| presence | Built-in ephemeral state: who is online, cursors, selections. |
| undo-history | Built-in undo/redo or version history. |
| partial-loading | Loads a subset (a query, shape, page or lazy child) instead of everything. |
| references | First-class references between records or documents (ids that resolve, links, relations). |
| nested-trees | Models nested trees directly (maps in maps, a tree type, parent/child records). |
| list-move | Has a first-class move for list items, not delete plus reinsert. |
| sqlite | Uses or can use SQLite as its store. |
| postgres | Uses or requires Postgres. |
| jsonl | Reads or writes newline-delimited JSON (JSONL/NDJSON) logs or streams. |
| filesystem-storage | Can persist to plain files or a local directory. |
| s3-r2 | Can persist to S3-compatible object storage, including R2. |
| indexeddb | Can persist in the browser's IndexedDB. |
| runs-on-cloudflare-workers | Its server part runs inside Workers or Durable Objects. |
| node-only | Its server part needs Node (or a native addon or long-lived process) and cannot run on Workers. |
| browser-esm-no-bundler | Loads in the browser from plain ESM (or a script tag) without a build step. |
| typescript-required | Practical use needs TypeScript or a codegen/compile step. |
| framework-bound | Practical use needs a specific UI framework (React, Vue...); name it in the summary. |
| self-hostable | You can run the whole thing on your own machine or account. |
| hosted-only | Only available as a vendor-hosted service. |
| open-source | The part you would run is under an OSI-approved license (FSL, BSL and similar are not). |
| full-text-search | Built-in ranked text search. |

## 6. Compatibility rules (category level)

Use these when filling `pairs_with`, `alternatives` and `avoid_with`. Each rule names a main category or a subcategory id from section 3. Strategy-level rules follow at the end.

### Natural pairs

- `crdt` + `room-server`: a CRDT doc needs a server that relays updates, checks auth and persists state (Yjs + Hocuspocus at Outline, Plane, Huly). (notes/adopters_and_pairings.md Q2)
- `crdt` + `editor`: editor bindings carry the CRDT into rich text (y-prosemirror, Tiptap Collaboration, `@lexical/yjs`). (notes/adopters_and_pairings.md Q2)
- `room-server` + `cloud-platform`: one Durable Object per room is the native home for a room server (tldraw sync, Liveblocks, PartyServer, y-partyserver). (notes/cloudflare_vs_postgres_platforms.md §6)
- `room-server` + `object-storage`: room snapshots, history and assets go to R2/S3 (tldraw, Hocuspocus S3, Y-Sweet). (notes/adopters_and_pairings.md Q2; notes/sync_engines_crdts.md)
- `room-server` + `managed-db` or `database-server`: cross-document metadata (users, file lists, permissions) lives in a queryable database next to the rooms (Logseq D1, tldraw Postgres, Figma Postgres). (notes/adopters_and_pairings.md Q1)
- `sync-engine` + `database-server`: Zero, Electric and PowerSync replicate from Postgres (PowerSync also MongoDB, MySQL, SQL Server). (notes/sync_engines_crdts.md)
- `sync-engine` + `room-server` or `realtime`: query-sync engines have no presence channel, so cursors and chat need a second one (Zero). (notes/adopters_and_pairings.md Q2; notes/sync_engines_crdts.md)
- `client-data-layer` + `sync-engine`: TanStack DB collections are fed by Electric, PowerSync, RxDB or Convex adapters. (notes/fullstack_framework_data_paths.md §5)
- `orm` + `database-server`, `managed-db` or `embedded-db`: an ORM is the typed data-access layer over a SQL database (Drizzle on D1, DO SQLite, Postgres). (notes/node_storage_orms.md §1)
- `stack` + `orm`: meta-frameworks ship no persistence, so apps add Drizzle or Prisma (Astro DB is Drizzle + libSQL). (notes/fullstack_framework_data_paths.md §2)
- `signals` + `ui` or `dom-diff`: signals decide what changed, a renderer or DOM diff applies it (Preact Signals in Lit, uhtml on alien-signals). (notes/signals_reactivity_lists.md §3, §9)
- `model-tree` + `crdt`: model trees can bind to a CRDT for multi-user sync (mobx-keystone Yjs and Loro bindings). (notes/signals_reactivity_lists.md §5)
- `server-driven` + `dom-diff`: Turbo 8 and htmx 4 morph server HTML with idiomorph. (notes/signals_reactivity_lists.md §9; notes/fullstack_framework_data_paths.md §3)
- `search` + `embedded-db`: SQLite FTS5 sits inside the same SQLite as the data (Durable Object SQLite, D1, node:sqlite, better-sqlite3). (notes/search_indexing_jsonl_limits.md §2)
- `event-store` + `search`: indexes are projections of the log, rebuilt from it and tracked by high-water mark. (notes/search_indexing_jsonl_limits.md §3)
- `sfu` + `speech-ai`: voice agents ride on an SFU (ChatGPT voice on LiveKit, Cloudflare Realtime Agents). (notes/streaming_transports_media_voice.md Q3, Q4)
- `game-server` + `realtime`: game rooms pick WebSocket by default and UDP-like channels for fast action games. (notes/game_netcode_streaming_ui.md A4)

### Substitutes (pick one)

- `baas` vs `sync-engine` + `database-server` + `orm` + auth: a BaaS bundles what a typical app assembles from 5-8 pieces. (notes/fullstack_framework_data_paths.md §8)
- `baas` vs `self-hosted-backend`: the same bundle, rented or self-run. (notes/fullstack_framework_data_paths.md §4, §9)
- `managed-db` vs `database-server`: the same engine, rented or self-run.
- `sync-engine` vs `local-first-db`: server-authoritative row sync versus a client database that is its own source of truth. (notes/sync_engines_crdts.md, candidate profiles)
- `crdt` vs a server-authoritative `room-server` with LWW (tldraw sync style): in a centralised app a CRDT is "merely an optimization over server reconciliation" except for text. (notes/delta_logs_build_vs_buy.md §5)
- `storage-abstraction` vs `orm`: whole-value get/set across backends versus relational tables. (notes/node_storage_orms.md §2)
- `signals` vs `state-store` vs `model-tree`: three ways to hold client state; pick one per state. (notes/signals_reactivity_lists.md §3, §5)
- `server-driven` vs `ui` + `client-data-layer`: render on the server and morph, or keep state in the client. (notes/fullstack_framework_data_paths.md §3, §9)
- Within a category, tools are usually substitutes (Yjs vs Automerge vs Loro; Drizzle vs Prisma).

### Conflicts (avoid)

- Two sync authorities over the same state: REST or ORM writes to fields that a live CRDT session also owns, or two sync engines on one table. Outline and Plane had to route REST edits into the live doc. (notes/adopters_and_pairings.md Q2)
- `crdt` documents vs schema-first `orm` editing the same fields: the ORM's row and the CRDT's state diverge unless one is derived from the other. (notes/adopters_and_pairings.md Q2, Q3)
- Node-only servers (y-websocket server, Socket.IO, Colyseus, zero-cache, Prisma ≤6's Rust engine) vs a Workers/Durable Objects runtime. (notes/adopters_and_pairings.md Q2, Durable Objects)
- `sync-engine` rows for high-frequency ephemeral state (cursors, drags): wrong shape; use a presence channel. (notes/adopters_and_pairings.md Q2 inferences)
- A CRDT for append-only data (chat, logs): wrong shape; an append log or `event-store` fits. (notes/adopters_and_pairings.md Q2 inferences)
- Whole-document JSON blobs inside a row-sync engine: defeats partial sync and row-level merge. (notes/adopters_and_pairings.md Q2 inferences)
- `game-server` tick loops inside Durable Objects: a running timer prevents hibernation and bills duration. (notes/cloudflare_vs_postgres_platforms.md §1, §5)
- Cross-document queries inside per-room actors: put lists and search in D1 or Postgres instead. (notes/adopters_and_pairings.md Q2, Durable Objects)

### Strategy-level rules

- `list-order: index` + several concurrent writers: indices shift and ops land in the wrong place; use `fractional`, `list-crdt` or server rejection. (notes/delta_logs_build_vs_buy.md §1-2)
- `change-format: path-patch` + `authority: local-first`: path ops cannot be reordered safely; use `id-ops` or CRDT updates. (notes/delta_logs_build_vs_buy.md §1)
- `conflict: lww` for character-level text: concurrent typing loses edits; use a text CRDT, OT or `insert-after` for that field only. (notes/delta_logs_build_vs_buy.md §5)
- `history: truncate` + `authority: local-first` with long offline windows: deleting history safely needs every replica to have synced (consensus). (notes/sync_engines_crdts.md, event-log section)
- `authority: server` makes compaction simple: snapshot at sequence N and drop entries ≤ N. (notes/sync_engines_crdts.md, event-log inferences)

## 7. Id map

Use the `id` values already in `data/tools.jsonl`; section 3 lists every id under its subcategory. Ids added by the taxonomy agent for records missing from the CSV: `cloudflare-d1`, `cloudflare-durable-objects`, `cloudflare-r2`, `cloudflare-workers`, `durable-streams`, `postgres`. An alias table (name, repo and package → id) is not written yet; the build matches CSV rows to ids by name, package and repo.
