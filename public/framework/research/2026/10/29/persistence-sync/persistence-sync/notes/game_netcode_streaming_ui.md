# Game netcode and state sync for web games (A) + streaming UI / AI agents editing pages live (B), as of Oct 2026

Context for the report writer: the user builds a vanilla-JS object framework (Item/List/Page objects with get/set change events, deltas streamed over WebSockets, JSONL delta logs). He wants one delta/streaming layer to serve a Figma/Webflow-like editor, Discord-like apps, games, and AI agents that create pages/items through tool calls, and he is interested in Cloudflare Durable Objects. Each section below ends with inferences that map findings onto that design.

Source-quality notes:
- The Valve Developer Wiki page "Source Multiplayer Networking" could not be fetched (site client error), so Source-engine tick and interp defaults are not cited.
- The boardgame.io multiplayer docs returned only metadata.
- tech-insider.org's "Multiplayer Game Servers on Cloudflare Durable Objects [2026]" looks unreliable. For example, it places the 32 MiB WebSocket message-limit increase in 2026, but Cloudflare's own changelog post is dated 2025-10-31. Its figures are used only with that caveat.
- Several items rely on secondary blogs (LogRocket on json-render, AgentPedia on Puck AI, codercops on WebTransport). These are flagged inline.

---

## A1. Core netcode models: what each technique does and when to use it

### Takeaway
Modern action netcode combines four pieces:
- an authoritative server that receives timestamped inputs and sends state;
- client-side prediction plus reconciliation for your own avatar;
- interpolation of everyone else about 100 ms in the past;
- server-side rewind (lag compensation) for hit tests.

Bandwidth comes from delta-compressing against the last snapshot the client acknowledged (the Quake 3 model), plus quantization and prioritization. Lockstep and rollback send only inputs and need determinism. Rollback is the fighting-game standard, and Photon Quantum and Rune use it as well.

### Cited Findings
**Authoritative server / client-server**
- Gambetta's rule: "don't trust the player." The server is "the one and only authority regarding everything that happens in the world." With 50 ms of latency each way, a keypress takes about a tenth of a second to show up, and "a lag of half a second ... makes the game unplayable." — [Gambetta, Client-Server Game Architecture](https://www.gabrielgambetta.com/client-server-game-architecture.html)
- Series recap:
  1. The server receives timestamped inputs from all clients and sends regular world snapshots.
  2. Clients apply their own inputs immediately (prediction) and reconcile with authoritative state.
  3. Other entities are drawn by blending past states (interpolation).
  4. The server rewinds the world to resolve shots (lag compensation).
  The result: "the player sees themselves in the present and other entities in the past." — [Gambetta, Lag Compensation](https://www.gabrielgambetta.com/lag-compensation.html)
- Entity interpolation: "you're always showing the user actual movement data, except you're showing it 100 ms 'late'." Dead reckoning works for predictable entities such as cars but is "essentially useless" for shooter characters that change direction abruptly. — [Gambetta, Entity Interpolation](https://www.gabrielgambetta.com/entity-interpolation.html)
- Lag compensation trade-off: a target who has just taken cover can still be hit for a few milliseconds. The author calls this "somewhat unfair" but "the most agreeable solution for everyone involved." — [Gambetta, Lag Compensation](https://www.gabrielgambetta.com/lag-compensation.html)

**History: lockstep, then client/server, then prediction**
- Peer-to-peer lockstep (Doom, RTS games) runs the same commands from the same start state. It suffers desync from non-determinism, "before you could turn, move or shoot you had to wait for the inputs from the most lagged modem player," and late joins are impractical. Quake's client/server model made the client a "dumb terminal," so "the game really only existed on the server." QuakeWorld added client-side prediction: "allowing the client to guess at the results of the users movement." Tim Sweeney: "The Server Is The Man." — [Gaffer On Games, What Every Programmer Needs To Know About Game Networking](https://gafferongames.com/post/what_every_programmer_needs_to_know_about_game_networking/)

**Snapshot interpolation vs. state sync vs. delta compression (Glenn Fiedler, "Networked Physics")**
- Snapshot interpolation at 10 snapshots/sec has a "minimum interpolation delay [of] 100ms." That is about 150 ms in practice with jitter, and 250–350 ms if one or two packets are lost. "The only way to reduce it is to increase the packet send rate."
- The 901-cube demo at 60 Hz started at 321 bits/cube, about 17.37 Mbps. Quantization brought each cube to 80 bits:
  - "smallest three" quaternions (128 to 29 bits);
  - position at 2 mm precision;
  - velocity dropped.
- Delta compression against an acked baseline was "a big win," and a stationary scene fell to about 15 kbps. Arithmetic coding beat the hand-tuned bit-packer by 25%.
- [Gaffer On Games, Snapshot Compression](https://gafferongames.com/post/snapshot_compression/)
- State synchronization sends "both input and state." It is "an approximate and lossy synchronization strategy." The design uses:
  - up to 32 inputs and 64 state updates per packet at 60 Hz;
  - a priority accumulator (e.g., player cube priority 1,000,000, interacting cubes 100, resting cubes 1), so objects that missed the budget go first next time;
  - a jitter buffer of "4-5 frames @ 60HZ";
  - delta compression that "requires a bidirectional ack system" and gives roughly "another order of magnitude improvement."
- [Gaffer On Games, State Synchronization](https://gafferongames.com/post/state_synchronization/)

**Quake 3 model: delta against the last acknowledged snapshot**
- Quake 3 runs on UDP, and "there is no trace of TCP/IP anywhere."
- The server keeps a ring of the 32 most recent snapshots per client plus an all-zero dummy baseline. Each update is diffed field-by-field (a change bit per field) against the last snapshot the client acknowledged. If no valid baseline exists, the server sends a full update against the dummy.
- Lost data never needs tracking because the next diff naturally carries it: "Resend OLD information that were not received and NEW information in a single message."
- Philosophy: "any information that is not received on first transmission is not worth sending again." Must-deliver events (quit, level change) go through a separate reliable NetChannel. Packets are split into 1400-byte chunks to avoid router fragmentation.
- [Fabien Sanglard, Quake 3 Network Model](https://fabiensanglard.net/quake3/network.php)

**Rollback (GGPO-style)**
- When remote input is missing, the game duplicates "the last known input from the remote player." When the real input differs, it reloads an earlier state and re-simulates "multiple frames forward" within one displayed frame.
- Players change direction about 5 times/sec, so only about 8% of 60 frames need real remote input.
- Modern games add a fixed input delay that "never changes": players can choose 0–8 frames in some games, while Killer Instinct and Injustice 2 fix it at 3 frames. Killer Instinct allows play at connections "that approach 200ms ping."
- [Infil, Netcode explainer p4](https://words.infil.net/w02-netcode-p4.html)
- Photon Quantum "utilizes a deterministic prediction/rollback architecture" and sends only inputs. Photon Fusion is "High Performance State Sync." — [Photon Products](https://doc.photonengine.com/photon/current/photon-products)

**Tick rates and interest management in practice**
- Nakama tick rates range "from once per second for turn-based games to dozens of times per second for fast-paced gameplay." Client messages are buffered and delivered to the match as a batch each tick. Best practice is at most one message per tick per presence in each direction, with payloads under the 1500-byte MTU. — [Heroic Labs, Nakama Authoritative Multiplayer](https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/llm.md)
- Colyseus 0.18's fixed-timestep example uses 30 Hz, and "the tick rate is advertised to clients through the join handshake." Remote entities are interpolated about 100 ms in the past. `allowRewindState({ maxRewindMs: 500 })` records positions per broadcast for lag compensation. — [Colyseus 0.18 release blog](https://colyseus.io/blog/colyseus-018-is-here/)
- Interest management in Colyseus: `@view()` fields are sent only to `StateView`s that include them, via `view.add(entity)`. Encoding uses `encodeAllView`/`encodeView`. — [@colyseus/schema README](https://cdn.jsdelivr.net/npm/@colyseus/schema@4.0.28/README.md)

### Inferences
- The Quake 3 "diff against last acked baseline" pattern maps directly onto a JSONL delta log. If each client acks a sequence number, the server can send "all changes since seq N, coalesced to latest value per property." That is the same mechanism a document sync uses for reconnection catch-up, so one mechanism can serve both.
- Prediction and reconciliation need inputs to be first-class messages with sequence numbers, separate from state deltas. The user's framework currently streams state deltas, so a game mode would add an "input/intent" channel with seq numbers, and the server's state deltas would carry `lastProcessedInput`.
- Interpolation needs timestamps or tick numbers on deltas, so a renderer can buffer about 100 ms and lerp between them.

### Gaps
- Source-engine defaults (tick rate, cl_interp, update/cmd rates) could not be cited because the Valve wiki fetch failed.
- No primary GGPO documentation was fetched. The determinism and save/load-state requirements of rollback come only indirectly from netplayjs and Colyseus docs (see A3).

---

## A2. How game state sync relates to document sync / CRDTs, and whether one delta system can serve both

### Takeaway
Production collaborative editors such as Figma and tldraw use the same core as authoritative game servers: a single server authority per room, an object map keyed by ID, last-writer-wins per property, optimistic local application, and rebasing on server state. Rocicorp says outright that its document sync is "server reconciliation" borrowed from games.

The differences are in delivery semantics:
- Documents need a durable, ordered, replayable log, plus undo and persistence.
- Fast games need tick-aligned, coalesced, quantized, interest-filtered, droppable updates, plus an input channel for prediction.

One delta layer can serve both if it supports both a durable op channel and an ephemeral latest-value channel.

### Cited Findings
- Figma models a document as `Map<ObjectID, Map<Property, Value>>`, a DOM-like tree of objects with IDs and property maps.
  - Clients use WebSockets with one server process per document, and "our server is the central authority."
  - Conflicts resolve last-writer-wins per property. Unrelated properties never conflict, and the server's ordering removes the need for timestamps.
  - Text is atomic per property, so two concurrent text edits yield one whole value, not a merge.
  - Figma rejected OT as "unnecessarily complex for our problem space" and is "CRDT-inspired" but "isn't using true CRDTs."
  - Reparenting stores a parent link on the child, and the server rejects edits that would create cycles.
  - Sibling order uses fractional indexing, with the parent link and position stored as one property so they update atomically.
  - [Figma, How Figma's multiplayer technology works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- Rocicorp (Replicache/Reflect, Oct 18, 2023) calls its approach "Transactional Conflict Resolution," "a twist on Server Reconciliation – a technique that has been popular in the video game industry for years."
  - Clients apply mutations immediately, the server linearizes them, and pending mutations are rebased by re-running the mutator code.
  - Only the mutator name and arguments go over the wire.
  - CRDTs: "Most CRDTs are good for one particular problem, but if that's not the problem you have, they're hard to extend." For example, a Yjs map loses concurrent counter increments under last-writer-wins.
  - "In Reflect, the server is the authority," which enables authorization such as rejecting guest edits. Sync runs "up to 120 times per second, per client."
  - [Rocicorp, Ready Player Two](https://rocicorp.dev/blog/ready-player-two)
- tldraw sync: `TLSocketRoom` "stores the authoritative copy of the document" and relays changes over WebSockets. You need "only ever one `TLSocketRoom` globally for each room," which maps to one Durable Object per room. State persists to the DO's built-in SQLite. On hibernation, `onSessionSnapshot` saves session state after about 5 s idle, so clients needn't reconnect on wake. Large binaries go to R2. — [tldraw sync docs](https://tldraw.dev/docs/sync)
- Colyseus tracks changes per property with a `ChangeTree` per Schema instance. "Only the latest mutation of each property is queued and sent to clients during the patchRate interval," and each instance has a `refId` for client-side matching. — [Colyseus State Synchronization docs](https://docs.colyseus.io/state)
- AG-UI (agent-to-frontend) uses `STATE_SNAPSHOT` for a full baseline and `STATE_DELTA` as RFC 6902 JSON Patch. "Patches are applied atomically (all or none)," and on inconsistency the frontend can request a fresh snapshot. — [AG-UI State Management](https://docs.ag-ui.com/concepts/state.md)
- A Yjs forum poster exploring a CRDT for game state struggled with "how to handle resolution when changes conflict with our game logic." Their example was seats a user can move to only "as long as the seat they are moving to is available." The page's replies were not retrievable. — [Yjs discuss](https://discuss.yjs.dev/t/exploring-the-use-of-a-crdt-for-game-state/1487)

### Inferences
- The user's Item model (get/set with change events) is per-property LWW at a server authority. That is the Figma, Colyseus, and tldraw model, and it is sufficient for both editors and most games. True CRDTs (Yjs, Automerge) mainly add value for character-level text merging and offline-first peer-to-peer. Game rules such as "seat must be free" need an authority, which CRDTs don't provide.
- Use one log with two delivery classes:
  - **Durable/ordered** (structure edits, chat messages, AI tool ops): append to JSONL, ack by seq, replay on reconnect.
  - **Ephemeral/coalesced** (positions, cursors, drag previews, streaming partial AI output): send only the latest value per property each tick. These can be dropped and are not written to the durable log, or only the settled value is written.
  Colyseus's "latest mutation per property per patchRate" and Quake's "don't resend stale data" are the ephemeral class. Figma's and tldraw's document ops are the durable class.
- Ordering children: use parent-link plus fractional index as one atomic property (Figma) rather than array indices. This also fixes the LLM index-shift problem in B2.
- Rebase-by-re-running-intent (Rocicorp) applies equally to game inputs and editor commands. If the framework's deltas are "intent ops" (e.g., `movePlayer(dx)`, `insertItem(parent, after, props)`) and not raw property sets, the server can validate them and clients can rebase pending ones.

### Gaps
- No primary source compared CRDT update size or memory growth (tombstones) against game update rates.
- No source quantified Figma's or tldraw's message rates.

---

## A3. Web-game frameworks and servers: models, APIs, limits, status (Oct 2026)

### Takeaway
Colyseus is the closest analogue to the user's Item model: a schema-based, per-property, binary delta-encoded state tree with per-client views and onAdd/onRemove/onChange/listen callbacks. Version 0.18 (Aug 20, 2026) added first-class prediction, fixed timestep, and rewind.

Cloudflare Durable Objects (directly, via PartyServer, or via the Agents SDK) give one single-threaded stateful room per object, with WebSocket hibernation and SQLite. That fits rooms and editors well. A tick loop prevents hibernation.

Hathora is gone (shut down May 5, 2026).

### Cited Findings
**Colyseus and @colyseus/schema**
- @colyseus/schema is "An incremental binary state serializer with delta encoding for games."
  - `Encoder.encodeAll()` sends full state and `encode()` sends changes since the last call.
  - Types: primitives (string, number, boolean, int8–64, uint8–64, float32/64), child Schemas, `ArraySchema`, and `MapSchema`. "You can't mix types inside arrays," and multi-dimensional arrays are unsupported.
  - Encoding quirks: NaN and null numbers become 0, null strings become "", and Infinity becomes `Number.MAX_SAFE_INTEGER`.
  - Encoder and decoder must share the schema and field order.
  - `Reflection.encode/decode` lets clients decode without the class definition.
  - Benchmark vs msgpack+fossil-delta: updating x/y of one entity encodes to 9 vs. 26 (units unstated).
  - [@colyseus/schema 4.0.28 README](https://cdn.jsdelivr.net/npm/@colyseus/schema@4.0.28/README.md)
- Field-limit conflict, explained by versions: the schema 4.x README says "up to 64 fields." The current docs and the 0.18 migration guide say 63 ("Defining the 64th field throws"), a breaking change in schema 5. — [Colyseus State docs](https://docs.colyseus.io/state); [Migrating to 0.18](https://docs.colyseus.io/migrating/0.18)
- On join, the server sends the state types, then full state. The handshake is skipped on reconnection or when the client supplies the classes. Client callbacks come via `Callbacks.get(room)`: `onAdd`/`onRemove` for collections, `onChange` per instance, and `listen` per property with new and previous values. — [Colyseus State docs](https://docs.colyseus.io/state)
- 0.18 (Aug 20, 2026), "intended to be the last release before 1.0":
  - Netcode: `defineInput()` with a sanitize/clamp map; `setFixedTimestep()` (30 Hz example); prediction via `predict.reconciler` (rewind local entity, replay unacked inputs, smooth); `allowRewindState` / `rewind.lastSeenBy(sessionId)`.
  - Schema 5: about 2.4× faster encoder; decorator-free `schema()`/`t.*` syntax; `.patchOnly()`/`.fullStateOnly()` delivery modifiers; `t.quantized()` (8/16/32-bit floats); `t.angle()`; `view.subscribe()`; experimental `t.stream()`.
  - New packages: `@colyseus/database` (Drizzle on SQLite/Postgres: cloud saves with optimistic locking, leaderboards, audit log) and `@colyseus/admin`. Also a WebRTC P2P `WebRTCPlugin`.
  - [Colyseus 0.18 blog](https://colyseus.io/blog/colyseus-018-is-here/)
- Client prediction mechanics:
  - Each `input.send()` gets a seq. The handle tracks `sentCount`, `lastProcessed` ("the canonical reconcile ack"), and `pendingCount`. The loop is "predict → adopt-on-ack → replay."
  - Corrections fade "~63% per smoothMs."
  - The `step(ctx, state, cmd)` function must be "shared with the server." RNG and collision results are frozen with `ctx.memo`, and sounds and particles sit behind `!ctx.isReplay`.
  - Remote entities use modes `lerp` ("Interpolate snapshots at now − delay"), `extrapolate`, `damped`, `reckon`, or `raw`.
  - [Colyseus Netcode: Client Prediction](https://docs.colyseus.io/netcode/client-prediction)
- Transports listed in the docs: WebSocket (default), uWebSockets.js, WebTransport, Bun WebSockets. — [Migrating to 0.18 (sidebar)](https://docs.colyseus.io/migrating/0.18)

**Geckos.io (WebRTC "UDP" for Node)**
- "Real-time client/server communication over UDP using WebRTC and Node.js," with unordered and unreliable data channels by default.
- Deployment must open 9208/tcp (signaling) and 1025–65535/udp.
- v3 is built on node-datachannel 0.5.x, is ESM-only, and needs Node ≥16. `reliable: true` just resends (default 10 times at 150 ms) and is "NOT meant to be used as the default."
- It recommends socket.io or WebSocket for those without UDP port-forwarding experience, and your own STUN/TURN in production.
- [geckos.io GitHub](https://github.com/geckosio/geckos.io)

**Nakama (Heroic Labs)**
- An authoritative match handler has 7 functions (Init, JoinAttempt, Join, Leave, Loop, Terminate, Signal).
- State is in-memory and isolated per match, and changes are not sent automatically: your handler broadcasts op code plus payload. Matches end only when a lifecycle function returns nil state.
- In relayed mode the server passes messages without validation. "In authoritative matches received messages are not automatically rebroadcast."
- [Nakama Authoritative Multiplayer](https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/llm.md)

**Cloudflare Durable Objects (DO)**
- Limits (SQLite-backed): 10 GB storage per object; key+value or row 2 MB; WebSocket message size 32 MiB (received); CPU 30 s per request by default, configurable to 5 min, reset by each incoming HTTP request or WebSocket message.
- Throughput: soft limit 1,000 requests/sec per object; "Each individual Object is inherently single-threaded"; excess requests queue, then return overloaded errors.
- Alarm handlers have a 15-minute wall time.
- The FAQ's Free-plan storage figure (1 GB) conflicts with the table (10 GB/object, 5 GB/account Free).
- [Cloudflare DO Limits](https://developers.cloudflare.com/durable-objects/platform/limits)
- The 32 MiB message-size increase is a Cloudflare changelog item dated 2025-10-31. — [Cloudflare changelog](https://developers.cloudflare.com/changelog/post/2025-10-31-increased-websocket-message-size-limit/)
- WebSocket Hibernation:
  - `this.ctx.acceptWebSocket(server)`, unlike `ws.accept()`, allows hibernation. On a message, the runtime re-runs the constructor, so keep it light.
  - `serializeAttachment`: "Maximum serialized size is 16,384 bytes."
  - "Billable Duration (GB-s) charges do not accrue during hibernation."
  - Alarms, incoming requests, `setTimeout`, and `setInterval` prevent hibernation. Outbound WebSockets don't hibernate.
  - A single instance can serve "thousands of clients," with no exact cap stated.
  - [Cloudflare DO WebSockets best practices](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- Example: Multiplayer Doom on Workers (May 18, 2021).
  - Doom is compiled to WASM, and `net_websockets.c` tunnels Doom's UDP protocol over WebSockets.
  - Each room is one DO acting as a message router (relay, not authoritative), forwarding packets by fake 4-byte From/To addresses. Up to four players.
  - The authors note weak reconnect handling, no persistence, and that lockstep is poorly suited to modern fast-paced netcode.
  - [Cloudflare blog, Doom multiplayer](https://blog.cloudflare.com/doom-multiplayer-workers)
- Pricing examples (low-reliability source, figures attributed to Cloudflare):
  - Paid plan $5/month minimum, with 1M requests and 400,000 GB-s included, then $0.15/M requests and $12.50/M GB-s.
  - Example: 100 objects at 1 message/sec per connection for 30 days comes to about $419.30/month, mostly duration.
  - [tech-insider.org](https://tech-insider.org/cloudflare-durable-objects-multiplayer-game-server-2026/) (unverified; see source-quality note)

**PartyKit / PartyServer / Cloudflare Agents SDK**
- Cloudflare acquired PartyKit (blog dated April 5, 2024). PartyKit "began as a project to further explore the capabilities of Durable Objects," with "no extra charges ... for commercial purposes." — [Cloudflare blog, Cloudflare acquires PartyKit](https://blog.cloudflare.com/cloudflare-acquires-partykit)
- PartyServer:
  - Library on DOs with `onConnect`, `onMessage`, `broadcast(msg, exclude)`, `onStart`/`onClose`/`onError`/`onRequest`/`onAlarm`, and `static options = { hibernate: true }`.
  - `routePartykitRequest` maps `/parties/:server/:name` to a DO namespace. The client is `partysocket`.
  - [partyserver README](https://cdn.jsdelivr.net/npm/partyserver@0.5.6/README.md)
- Agents SDK state:
  - `this.setState(state)` stores state in SQLite (surviving restarts and hibernation) and broadcasts it to connected clients.
  - `validateStateChange(next, source)` runs before storing and can throw to reject.
  - `onStateChanged(state, source)` runs after; source is `"server"` or a client Connection.
  - The client `useAgent` hook reads and sets state. `this.sql` is for data that need not reach clients.
  - [Cloudflare Agents: Store and sync state](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/)

**Hathora (status)**
- Fireworks AI acquired Hathora, announced March 4, 2026. Gaming support ended May 5, 2026, and the team moved to AI-inference orchestration.
- The migration partner was Nitrado's GameFabric. Named live titles were Splitgate 2, Stormgate, and Predecessor.
- Stormgate's May 1, 2026 update disabled live Versus and Co-op, "removed dependencies on Hathora and Pragma," and moved Campaign, AI Skirmish, and Custom to offline.
- [Supercraft, Hathora shut down May 5 2026](https://crux.supercraft.host/blog/hathora-shut-down-where-to-go-after-may-2026/); [TechSpot, Apr 6 2026](https://www.techspot.com/news/111969-stormgate-servers-go-dark-following-ai-focused-hosting.html)

**Other web frameworks**
- **Rune**: "predict-rollback netcode updates clients immediately and the server resolves conflicts." The app claims "10 million installs across iOS and Android," and Rune pays for servers. — [rune-sdk README](https://cdn.jsdelivr.net/npm/rune-sdk@6.0.1/README.md)
- **Playroom Kit**:
  - `setState`/`getState` for room state and `myPlayer().setState()` for per-player state.
  - "The host is the authority for room state ... On conflict, the host's version wins."
  - Reliable updates go over WebSocket. Unreliable updates (experimental) use a WebRTC data channel with WebSocket fallback.
  - Defaults: reliable for global state, unreliable for per-player state.
  - [Playroom docs, State](https://playroom-docs.vercel.app/features/apps/state)
- **Photon**: Fusion uses state sync and Quantum uses deterministic predict/rollback with inputs only. Fusion engine support is listed for Unity, Unreal (early access), and Godot. The page does not confirm a JS/WebGL SDK. — [Photon Products](https://doc.photonengine.com/photon/current/photon-products)
- **Socket.IO**: volatile events "will not be sent if the underlying connection is not ready." This is UDP-like: otherwise events buffer and replay after reconnect. Acks via callback, with timeouts since 4.4.0. Binary is supported. — [Socket.IO Emitting events](https://socket.io/docs/v4/emitting-events/)
- **uWebSockets.js**: "a standards compliant web server written in 10,000 lines of C++" exposed as a V8 addon. It claims "at least 10x that of Socket.IO" and makes up "the core components of Bun." — [uWebSockets.js GitHub](https://github.com/uNetworking/uWebSockets.js)
- **Lance.gg**: Node server running game logic, with "Extrapolation (client side prediction) with step re-enactment," interpolation, and "TCP via websockets." UDP via WebRTC is planned. Maintenance status is unclear (no release dates visible). — [Lance GitHub](https://github.com/lance-gg/lance)
- **NetplayJS**:
  - P2P WebRTC with rollback (`RollbackWrapper`) or `LockstepWrapper` for state that "can't be rewound."
  - Does "not require game code to be deterministic, but is more efficient if it is": the host sends correcting state when the game isn't deterministic.
  - Version 0.4.1, with components marked WIP.
  - [netplayjs GitHub](https://github.com/rameshvarun/netplayjs)

**WebTransport**
- Secondary source: Safari 26.4 (March 2026) shipped WebTransport, making it Baseline. Chromium has had it since 2022 and Firefox since 2023.
- It offers multiple independent reliable streams (no cross-stream head-of-line blocking) plus unreliable datagrams.
- Node and Deno have no native server, and the usual option is `@fails-components/webtransport` (libquiche binding), which "the Colyseus game server builds on."
- [codercops blog, Sep 2026](https://blog.codercops.com/blog/webtransport-explained-websocket-alternative-2026); datagrams API: [MDN](https://developer.mozilla.org/docs/Web/API/WebTransport/datagrams)

### Inferences
- @colyseus/schema is effectively a typed, binary version of the user's Item/List model:
  - Schema maps to Item (≤63 typed fields), MapSchema/ArraySchema map to List, `refId` maps to item ID, and ChangeTree maps to dirty-property tracking.
  - patchRate coalescing gives "latest value per property per tick."
  - StateView gives per-client filtering, and onAdd/onRemove/onChange/listen are his change events.
  Worth borrowing:
  - a full-state handshake followed by patches;
  - per-instance ref IDs;
  - coalescing per tick;
  - per-field delivery modifiers (`patchOnly`/`fullStateOnly`), which correspond to his ephemeral vs. durable classes;
  - quantized numeric types for game fields;
  - views and subscriptions for interest management.
  What his JSON/JSONL approach gains over Colyseus: schema-less flexibility, human-readable logs, and AI-friendliness. What it loses: binary compactness. JSON is fine below action-game rates.
- On Durable Objects, a room maps naturally to one DO: single-threaded, so no locking; SQLite for the JSONL/op log; hibernation for idle editors and chat rooms.
  - A real-time game with a server tick needs `setInterval` or alarms, which prevents hibernation, so it is billed for duration all session.
  - Turn-based or event-driven rooms (chat, editor, board games) can hibernate between messages.
  - The 1,000 req/s soft limit per object means a 20 Hz tick × 50 players of inbound input would be near the limit if each message counts as a request. Batching inputs helps.
- Hathora's shutdown is a vendor-lock-in warning for managed game-server platforms. Self-hostable options (Colyseus, Nakama) or primitives (DOs) reduce that risk.

### Gaps
- No primary Cloudflare documentation was found on WebTransport or UDP on Workers/DOs. All DO game examples use WebSockets.
- No exact per-DO concurrent WebSocket limit, and no DO memory limit, appears on the fetched limits page.
- Whether Agents SDK `setState` broadcasts full state or diffs is not stated (the page says it broadcasts "the value").
- boardgame.io sync semantics (moves to master, `playerView` secret state) could not be retrieved.
- Rune and Playroom business status or shutdown news: none found (no evidence either way).
- No current maintenance evidence for Lance.gg or Geckos.io.

---

## A4. Which transport for which game genre (WebSocket/TCP vs WebRTC/WebTransport)

### Takeaway
TCP WebSockets are fine for turn-based, board, card, party, and casual real-time games, chat, and editors. Practitioners default to them, and even geckos.io tells newcomers to start there. Unreliable datagrams (WebRTC DataChannels via geckos.io or Playroom's unreliable mode, or WebTransport datagrams now that Safari shipped it) matter for fast action games (shooters, physics, racing). There, a lost position packet should be skipped, not retransmitted, which follows Quake 3's philosophy.

Fighting and other P2P precise-timing games use WebRTC P2P plus rollback (netplayjs).

### Cited Findings
- Quake 3 avoided TCP entirely because reliable transmission added unacceptable latency. Stale data is "not worth sending again." — [Sanglard, Quake 3 network](https://fabiensanglard.net/quake3/network.php)
- Geckos.io pitches WebRTC as "the best way to send fast (unordered and unreliable) messages," but recommends socket.io or WebSocket for those new to multiplayer or without UDP port-forwarding experience. — [geckos.io](https://github.com/geckosio/geckos.io)
- WebTransport puts several reliable streams on one connection (loss on one doesn't stall others: "chat traffic won't freeze game state") plus unreliable datagrams. Real-time multiplayer is "the clearest use case." Server support in Node is still via a native addon. — [codercops (secondary)](https://blog.codercops.com/blog/webtransport-explained-websocket-alternative-2026)
- Playroom splits traffic: reliable over WebSocket for global state, unreliable over WebRTC for per-player state (e.g., positions). — [Playroom docs](https://playroom-docs.vercel.app/features/apps/state)
- Cloudflare's Doom tunneled a UDP-style lockstep protocol over WebSockets through a DO relay for 4 players. It worked but "depends on the player with the slowest connection." — [Cloudflare blog](https://blog.cloudflare.com/doom-multiplayer-workers)
- Nakama recommends keeping payloads within the 1500-byte MTU and sending few messages. — [Nakama docs](https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/llm.md)
- Socket.IO "volatile" events give UDP-like drop-if-not-ready semantics on top of WebSocket. — [Socket.IO docs](https://socket.io/docs/v4/emitting-events/)

### Inferences
- Genre guide:
  - **Turn-based, board, card, trivia, party, Discord Activities:** WebSocket, full-state or delta, no prediction.
  - **Casual real-time (.io games, co-op, top-down):** WebSocket at 10–30 Hz plus interpolation, with local prediction for your own avatar if it feels laggy.
  - **Competitive shooters, physics-heavy, racing:** unreliable datagrams (WebRTC DataChannel or WebTransport) plus a reliable channel for events, prediction, lag compensation, and delta-vs-acked baseline.
  - **Fighting games and 1v1 precise:** P2P WebRTC plus rollback.
- On TCP, emulate "drop stale data" in the application. Coalesce to the latest value per property each tick and never queue old position updates (Socket.IO volatile, Colyseus patchRate). That captures most of UDP's benefit until packet loss triggers TCP head-of-line stalls.
- Since Durable Objects are WebSocket-only in all found sources, a DO-hosted game stack implies the TCP tier. For the user's mixed workload (editor, chat, AI, casual games) that is acceptable.

### Gaps
- No measured data was found comparing WebSocket vs WebRTC/WebTransport latency under packet loss for browser games.
- No source confirms Cloudflare WebTransport availability for Workers or DOs.

---

## A5. Named games, companies, and products using each framework, and how they wire it

### Takeaway
Concrete, sourced deployments exist for Colyseus (Raft Wars, Battle Legends, Lucid Sight, Discord Activities templates), Cloudflare DOs (tldraw sync, Doom demo), and Hathora (Splitgate 2, Stormgate, Predecessor, now migrated). Nakama, Rune, Photon, and PartyKit customer names were not confirmed in fetched sources.

### Cited Findings
- **Colyseus**:
  - Lucid Sight acquired Colyseus (Feb 19, 2021) and said it uses it "in all of our multiplayer games."
  - Raft Wars (Bubblebox), a turn-based physics shooter, "uses Colyseus as the multiplayer solution," with servers for up to 250,000 MAU.
  - Battle Legends (Hammerplay Studios), a battle-royale shooter, hit 5,000+ CCU in soft launch.
  - Ravalmatic (100+ titles) used it for "several" multiplayer games.
  - [BusinessWire, Lucid Sight Acquires Colyseus](https://www.businesswire.com/news/home/20210219005006/en/Lucid-Sight-Acquires-Colyseus-Game-Engine)
- **Colyseus + Discord Activities wiring**:
  - Discord's own React Colyseus example puts players in a room keyed by the Discord `channelId`.
  - The app is served from a `discordsays.com` iframe, and Discord proxies all requests (CSP). External services need URL Mappings in the Discord developer portal.
  - The Webgame Template signs in with Discord for username and leaderboard.
  - [Colyseus blog, Discord Embedded App SDK](https://colyseus.io/blog/discord-embedded-sdk); [Colyseus Discord examples](https://docs.colyseus.io/examples/discord)
- **tldraw on Cloudflare DOs**: one `TLSocketRoom` per room inside a DO, with SQLite persistence, hibernation-aware session snapshots, and assets in R2. tldraw publishes a `tldraw-sync-cloudflare` template. — [tldraw sync docs](https://tldraw.dev/docs/sync); [tldraw-sync-cloudflare](https://github.com/tldraw/tldraw-sync-cloudflare)
- **Cloudflare Doom**: WASM Chocolate Doom, WebSocket tunnel, one DO per room as relay router, Pages for hosting. — [Cloudflare blog](https://blog.cloudflare.com/doom-multiplayer-workers)
- **Hathora (former)**: Splitgate 2, Stormgate, and Predecessor. Customers migrated to Nitrado GameFabric (Docker-native) or elsewhere. Stormgate went offline-only for multiplayer modes. — [Supercraft](https://crux.supercraft.host/blog/hathora-shut-down-where-to-go-after-may-2026/)
- **Figma**: one server process per document, WebSockets, LWW per property. — [Figma blog](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **uWebSockets**: core of Bun. — [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js)
- **Webflow**: the Webflow MCP server drives the live Designer through an "MCP Companion App" that "must remain open in the Webflow Designer for Designer API tools to function." It creates and modifies elements, styles, variables, components, and breakpoints. — [Webflow changelog, MCP supports the Designer](https://developers.webflow.com/data/09042025)
- **Nakama**: a Heroic Labs-sponsored article claims it powers "multiple games in the Top 50 on mobile" and "100's of game titles," but names none. It is promotional and unverified. — [Game Developer (sponsored)](https://www.gamedeveloper.com/console/embracing-the-future-of-open-source-game-servers-with-nakama)

### Inferences
- Discord Activities are a strong, documented fit for a Colyseus-like or DO-room design (room per channelId). For the user's "Discord-like app" goal, the same room-per-channel pattern applies to chat.

### Gaps
- Named production users of Nakama, Rune, Playroom, Photon (web), PartyKit/partyserver, and Geckos.io were not confirmed in fetched sources.
- How Discord's proxy handles the Colyseus WebSocket path is not specified on the Colyseus blog page.

---

## B1. How AI agents build and edit UI live: protocols and products (Oct 2026)

### Takeaway
Two families have emerged:
1. **Declarative UI as data**: the agent streams a JSON component tree restricted to a trusted catalog. Examples are Google A2UI (flat adjacency list plus JSON Pointer data binding over JSONL), Vercel json-render (flat elements map streamed as JSONL patches), and AG-UI shared state (JSON Patch deltas).
2. **Sandboxed HTML apps**: MCP Apps (SEP-1865, Final) uses `ui://` resources with `text/html;profile=mcp-app` in iframes over a postMessage JSON-RPC bridge. ChatGPT's Apps SDK now builds on it.

Vercel's RSC `streamUI` remains experimental. The production path is AI SDK UI tool parts rendered as components.

Canvas tools (tldraw agent, Figma, Webflow MCP, Framer) expose typed edit actions on their document model.

### Cited Findings
**Google A2UI**
- An open-source (Apache 2.0) standard where the agent "sends data, not code." Rendering is restricted to a client-side catalog of trusted components. Renderers exist for Flutter (GenUI SDK), Web Components, and Angular. — [The Decoder, Dec 20 2025](https://the-decoder.com/googles-open-standard-lets-ai-agents-build-user-interfaces-on-the-fly/)
- Spec v0.9 is "the stable protocol family" (production users pointed to v0.9.1). v1.0 is a Candidate and v0.8 Legacy.
- Server-to-client messages: `createSurface` (fixed `surfaceId` and `catalogId`, and a component with id `"root"` is required), `updateComponents`, `updateDataModel` (value at a JSON Pointer `path`; omitting the path replaces the model; omitting the value deletes the key), and `deleteSurface`.
- Components arrive as a flat list and "relationships are defined by ID references in an adjacency list." The client stores a map and builds the tree at render time. Components arriving before `root` are buffered, and missing references render as placeholders.
- Data binding uses JSON Pointer, with relative paths inside list templates. Inputs update the local model immediately, and data goes to the server only when an action fires. Client-to-server `action` and `error` messages (`VALIDATION_FAILED`) exist.
- Transports: A2A and AG-UI bindings, or MCP, SSE, WebSockets, or REST, provided messages are reliable and ordered.
- [A2UI v0.9 spec](https://a2ui.org/specification/v0.9-a2ui/)

**AG-UI (CopilotKit-originated agent↔frontend event protocol)**
- 17 core event types:
  - lifecycle (RunStarted, RunFinished, RunError, StepStarted, StepFinished);
  - text (TEXT_MESSAGE_START/CONTENT/END);
  - tool (TOOL_CALL_START/ARGS/END/RESULT, where ARGS streams partial argument deltas);
  - state (STATE_SNAPSHOT, STATE_DELTA as JSON Patch, MESSAGES_SNAPSHOT);
  - Raw and Custom.
  Draft events: Activity, Reasoning, Meta.
- [CopilotKit blog, 17 AG-UI event types](https://copilotkit.ai/blog/master-the-17-ag-ui-event-types-for-building-agents-the-right-way); [AG-UI State](https://docs.ag-ui.com/concepts/state.md)
- CopilotKit registers React components as LLM tools ("name, description, and typed parameters (props)") and renders them in chat. `useCoAgent` "creates a state object synchronized between the React frontend and the agent backend." — [Better Stack guide, Jun 15 2026](https://betterstack.com/community/guides/ai/copilotkit-agent-native/)

**MCP Apps / MCP-UI / OpenAI Apps SDK**
- SEP-1865 "MCP Apps" has status Final (Extensions Track; created 2025-11-21).
  - UI is predeclared as `ui://` resources referenced from tool metadata, so hosts can prefetch and review it.
  - HTML (`text/html;profile=mcp-app`) runs in mandatory sandboxed iframes. Communication reuses MCP JSON-RPC over postMessage, and hosts may require consent for UI-initiated tool calls.
  - It unifies MCP-UI (adopters: Postman, HuggingFace, Shopify, Goose, ElevenLabs) and OpenAI's Apps SDK (launched Nov 2025).
  - Embedding resources inline in tool results (MCP-UI's original approach) was deferred.
  - [SEP-1865](https://modelcontextprotocol.io/seps/1865-mcp-apps-interactive-user-interfaces-for-mcp.md)
- ChatGPT implements MCP Apps as its foundation:
  - `_meta.ui.resourceUri`
  - `ui/initialize`, `ui/notifications/tool-input`, `ui/notifications/tool-result`, `tools/call` from the iframe, `ui/message`, `ui/update-model-context`.
  - `window.openai.*` is kept as aliases plus extras (`requestCheckout`, `uploadFile`, `requestModal`, `widgetState`).
  - "Treat the resource URI as a cache key."
  - [OpenAI, MCP Apps compatibility in ChatGPT](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt)
- Google contrasts the two: MCP treats UI as a resource (prefab HTML in a sandbox), while A2UI is "native-first." — [The Decoder](https://the-decoder.com/googles-open-standard-lets-ai-agents-build-user-interfaces-on-the-fly/)

**Vercel AI SDK**
- "AI SDK RSC is currently experimental. We recommend using AI SDK UI for production." A migration guide from RSC to UI exists. — [AI SDK RSC reference](https://ai-sdk.dev/docs/reference/ai-sdk-rsc)
- Generative UI in AI SDK UI: tool parts are typed `tool-${toolName}` (since 5.0). Each part has `state` values `input-available`, `output-available`, or `output-error`, and the app renders a component from `part.output`. — [AI SDK UI, Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)
- Partial objects: `streamText` with `Output.object()` on the server and `useObject` on the client, where "results are partial and are displayed as they are received." Examples use optional chaining for missing fields. — [AI SDK UI, Object Generation](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation)
- Vercel json-render (secondary source, March 2026):
  - A Zod-defined catalog of components and actions, and a registry mapping them to React components.
  - The spec is `{ root, elements: { [key]: { type, props, children: [keys], on } } }`, a flat element map.
  - The model streams "JSONL patches," and prior spec context is sent back for iterative updates.
  - `sanitizeSpecProps` guards incomplete streamed output.
  - `$state` references bind data, with Visibility, Action, and Validation providers.
  - [LogRocket](https://blog.logrocket.com/vercel-json-render-dynamic-ui/)

**Canvas and site editors with agents**
- tldraw "Make Real" (Nov 2023): the selected drawing is exported as an image to GPT-4V, which returns HTML/CSS rendered in an iframe shape on the canvas. To iterate, the user annotates and the previous HTML is sent back. The repo passed 10,000 stars within about two weeks. — [tldraw blog, Make Real the story so far](https://tldraw.dev/blog/make-real-the-story-so-far)
- tldraw agent starter kit: see B2 for the action schema and streaming.
- Webflow MCP plus Companion App: a live Designer canvas bridge (see A5). — [Webflow changelog](https://developers.webflow.com/data/09042025)
- Framer AI Agent: "Agent edits stay visible and editable on the Framer canvas." It suggests layouts, rewrites sections, adjusts styling, updates CMS items, and reviews SEO, accessibility, and responsiveness. — [Framer AI Designer](https://www.framer.com/solutions/ai-designer/)
- Puck AI (secondary source): launched July 28, 2026 (0.8.x).
  - A hosted multi-step agent produces Puck Data JSON ("structured JSON that an application can store, version, inspect, edit, and render").
  - "Assembly mode" uses registered components, while "design mode" creates new component types stored in `root.props._dynamicConfig`. Headless `generate()` is available.
  - Streaming output should be treated as a preview: save to a draft and commit only a terminal, validated revision.
  - [AgentPedia](https://agentpedia.codes/blog/puck-ai-0-8-embedded-react-builder-guide)

**Code-generating builders**
- v0 composite model (Jun 1, 2025):
  - retrieval pre-processing;
  - a frontier base model for new or large changes;
  - a "Quick Edit" model for narrow edits ("updating text, fixing syntax errors, or reordering components");
  - an AutoFix model (vercel-autofixer-01) "constantly checking the output stream for errors" and fixing mid-stream, followed by a final pass and linter.
  - [Vercel blog, v0 composite model family](https://vercel.com/blog/v0-composite-model-family)
- bolt.diy (open-source Bolt): the LLM emits XML-like `<boltArtifact>` blocks containing `<boltAction type="file" filePath=...>` or `type="shell"`. These are parsed into commands and run in a WebContainer (Node in WASM). The snippet shows whole-file writes, with diffs computed afterward for review. — [Starlog on bolt.diy](https://starlog.pages.dev/articles/ai-dev-tools/stackblitz-labs-bolt-diy)

### Inferences
- A2UI's model closely matches the user's design and is worth aligning with: a flat map of items by ID, with children as ID lists, `root`, buffering of not-yet-arrived children, and placeholders. That shape is also streaming-friendly, since each component is a self-contained message that can render as soon as its parent exists.
- Two layers of protocols:
  - Transport/event layer (AG-UI: runs, text, tool-call deltas, state snapshot/delta).
  - UI description layer (A2UI or json-render: catalog-constrained component trees).
  The user's delta layer could be exposed as both: an AG-UI-compatible event stream for agent frontends, and an MCP server (tools plus MCP Apps `ui://` views) so external hosts such as ChatGPT and Claude can drive and display his pages.
- "Catalog of trusted components" is the shared security answer (A2UI, json-render, Puck assembly mode, CopilotKit). For the user, the registry of Item types is the catalog the LLM may instantiate.

### Gaps
- Lovable's internal edit mechanism, Builder.io Fusion's agent architecture, and Figma's AI/MCP write APIs were not documented in fetched sources.
- Which non-OpenAI hosts support MCP Apps (as of Oct 2026) was not confirmed in fetched sources, beyond MCP-UI adopters.
- Whether A2UI v1.0 changes the message set was not checked.

---

## B2. Patterns for letting an LLM manipulate an object tree via tool calls, and streaming partial output into live objects

### Takeaway
The robust pattern:
- the model emits small typed operations that reference stable IDs (not array indices), validated against a schema and component catalog;
- each op is applied when complete (or previewed while streaming);
- ops are sanitized (fix or reject bad IDs);
- results are committed to the durable log only after validation.

JSON Patch (RFC 6902) is the common wire format (AG-UI STATE_DELTA, json-render JSONL patches). LLMs mishandle index arithmetic, so stable keys are essential. Provider-side partial-JSON streaming (Anthropic `eager_input_streaming`, AG-UI TOOL_CALL_ARGS) lets UIs show ops as they form, but may produce invalid JSON.

### Cited Findings
- **tldraw agent actions**:
  - Each action is a Zod schema with a `_type` field ("The underscore encourages the model to put this field first"), a title, and a description. An `AgentActionUtil.applyAction()` executes each one.
  - Actions arrive as `Streaming<T>` with a `complete` flag. Some handlers wait: "Don't do anything until the action has finished streaming."
  - "Shapes get created, updated, and deleted incrementally as each action finishes streaming."
  - `sanitizeAction()` corrects model mistakes (e.g., `ensureShapeIdExists()`), and returning null cancels the action.
  - Context sent to the model: a screenshot plus simplified shape formats: BlurryShape (viewport overview), FocusedShape (detailed, and also the output format for creation), and PeripheralShapeCluster (off-screen counts). "This dual approach means the model understands both the visual layout and the underlying data structure."
  - [tldraw Agent starter kit](https://tldraw.dev/starter-kits/agent)
- **JSON Whisperer (EMNLP 2025)**:
  - LLMs generating RFC 6902 patches rather than full documents cut output tokens and kept quality "within 5% of full regeneration."
  - Output tokens dropped from 918 to 529 for Claude. Time fell 42.3% and cost 42.5% (Claude).
  - Failure mode: models "frequently miscalculate these shifts or conflate zero-based and one-based indexing" when array items are removed, and "often miss related updates."
  - Fix (EASE): turn arrays into dictionaries with stable keys plus a `display_order`, giving a 31% token reduction overall.
  - [arXiv 2510.04717](https://arxiv.org/html/2510.04717v1)
- **AG-UI state deltas**: JSON Patch ops (`add`/`remove`/`replace`/`move`/`copy`/`test`) with JSON Pointer paths. The reference client uses `fast-json-patch` non-mutating and applies "atomically (all or none)." It recommends structuring state so partial updates are simple, and keeping a resync-by-snapshot path. — [AG-UI State](https://docs.ag-ui.com/concepts/state.md)
- **AG-UI tool-call streaming**: `TOOL_CALL_ARGS` is "optionally emitted if the tool's arguments are streamed in parts," each with a partial `delta`. — [CopilotKit blog](https://copilotkit.ai/blog/master-the-17-ag-ui-event-types-for-building-agents-the-right-way)
- **Anthropic fine-grained tool streaming (GA)**:
  - Set `eager_input_streaming: true` per tool (this replaces the legacy `fine-grained-tool-streaming-2025-05-14` header). Tool input then streams "without server-side buffering or JSON validation" as `input_json_delta` events with `partial_json`.
  - Warning: "you might receive partial or invalid JSON," and a `max_tokens` stop can cut a parameter mid-way.
  - Accumulate on `content_block_start`/`delta`/`stop`, and on parse failure return `{"INVALID_JSON": ...}` as an `is_error` tool result.
  - [Claude docs, Fine-grained tool streaming](https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming.md)
- **A2UI streaming**: each JSONL line is one complete message (`updateComponents` with components by ID, or `updateDataModel` at a JSON Pointer). The client buffers until `root` exists and renders missing children as placeholders. Data that hasn't arrived yet resolves to undefined and should be handled gracefully. — [A2UI v0.9 spec](https://a2ui.org/specification/v0.9-a2ui/)
- **json-render**: the model is told to "Output ONLY raw JSONL patches" against a flat `elements` map. Prior spec is fed back for iterative editing, and `sanitizeSpecProps` guards incomplete streamed output. — [LogRocket](https://blog.logrocket.com/vercel-json-render-dynamic-ui/)
- **Vercel AI SDK `useObject`**: partial objects render progressively, and `onFinish` gives the typed object or undefined if schema validation fails. — [AI SDK UI, Object Generation](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation)
- **v0's AutoFix**: a model that repairs the output stream mid-flight, an alternative to strict schemas for code output. — [Vercel blog](https://vercel.com/blog/v0-composite-model-family)
- **Puck AI guidance (secondary)**: cap operations per component and in total, compare requested vs. final state, and draft then commit. Open issues describe a never-completing stream and a dropped update. — [AgentPedia](https://agentpedia.codes/blog/puck-ai-0-8-embedded-react-builder-guide)
- **Figma's server-side tree validation**: the server rejects parent changes that would create cycles, and clients park affected objects until the server decides. This is the same validation an LLM op applier needs. — [Figma blog](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)

### Inferences
- A recommended tool surface for the user's framework (synthesized from tldraw, A2UI, JSON Whisperer, and Figma):
  - `create_item({id?, type, parent, after?, props})`
  - `set_props({id, props})`
  - `move_item({id, parent, after})`
  - `delete_item({id})`
  - optionally `batch([...ops])`, applied atomically.
  - IDs are stable strings. Order uses `after`/fractional index, never a numeric array index.
  - `type` is restricted to a catalog enum, and props are validated per type.
  Each op becomes exactly one delta in the existing log, so AI edits, human edits, and replays share one path.
- Streaming tiers:
  1. **Simplest**: apply each tool call when complete (tldraw's default for most actions).
  2. **Smoother**: let the parent op apply first and stream large text props via partial-JSON (Anthropic `eager_input_streaming`), updating an ephemeral preview value. Persist only the final value.
  3. **A2UI-style**: one tool call or JSONL line per component, so the page assembles visibly component by component without a partial-JSON parser.
- Keep AI writes on a "draft" branch or tagged as provisional deltas until the run finishes and validates (Puck guidance, AG-UI atomic patches). On failure, discard. On success, commit to the durable JSONL log. This mirrors prediction then reconciliation in games.
- Give the model a compact view of the tree, not the raw store. tldraw's focused/blurry/peripheral levels of detail map to "selected subtree in detail, siblings as summaries, rest as counts."

### Gaps
- No primary documentation was fetched for specific partial-JSON parser libraries (e.g., partial-json, best-effort-json-parser) or their correctness guarantees.
- No head-to-head study was found comparing JSON Patch tools vs. custom op schemas vs. full-tree regeneration for UI trees specifically (JSON Whisperer used generic JSON documents, about 400 synthetic examples).

---

## B3. Web-editor architecture: how page-builder tools model and persist the page tree

### Takeaway
Every editor stores a JSON tree of typed component nodes with props. Some nest it (Puck content/zones, now slots); others flatten it to a map with parent and child references (Figma, A2UI, json-render, and reportedly Craft.js). Persistence is mostly whole-document JSON save/load (GrapesJS, Craft.js, Puck). Real-time collaborative tools (Figma, tldraw) instead keep a server-authoritative object map with per-property ops and incremental persistence.

### Cited Findings
- **Figma**: `Map<ObjectID, Map<Property, Value>>`, parent link plus fractional-index position stored as one property, LWW per property, server authoritative, one process per document. — [Figma blog](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **Puck**:
  - Data = `{ content: ComponentData[], root: { props }, zones: { "<componentId>:<zoneName>": ComponentData[] } }`.
  - Each item is `{ type, props: { id, ...fields } }`.
  - `zones` "will soon be deprecated, as DropZones have been replaced by" slot fields (nested content inside props).
  - The page does not cover persistence: the app stores the JSON.
  - [Puck Data API](https://puckeditor.com/docs/api-reference/data)
- **GrapesJS**:
  - Project data is JSON with `pages` (each holding components), `styles`, and `assets`, via `editor.getProjectData()`/`loadProjectData()`. "You should only rely on the JSON project data in order to load your project properly."
  - The Storage Manager is `local` (localStorage) or `remote` (`urlLoad`/`urlStore`, POST to save) or custom, with `autosave` and `stepsBeforeSave` (default 1) driven by a dirty counter.
  - [GrapesJS Storage Manager](https://grapesjs.com/docs/modules/Storage.html)
- **Craft.js**: `query.serialize()` produces JSON of all Nodes and `actions.deserialize(json)` replaces all nodes. `<Frame json>` loads on mount, and the docs suggest compressing the JSON before storage. — [Craft.js Save and Load](https://craft.js.org/docs/guides/save-load-state)
- **tldraw**: a record store with authoritative `TLSocketRoom` and incremental SQLite persistence in a DO; binaries go to R2. — [tldraw sync](https://tldraw.dev/docs/sync)
- **A2UI and json-render** (agent-facing UI specs) both use flat ID-keyed maps with child-ID lists. — [A2UI spec](https://a2ui.org/specification/v0.9-a2ui/); [LogRocket json-render](https://blog.logrocket.com/vercel-json-render-dynamic-ui/)
- **Webflow's Designer API** (via MCP) exposes elements, styles, variables, components, and breakpoints as the editable surface. — [Webflow changelog](https://developers.webflow.com/data/09042025)

### Inferences
- The user's Item/List/Page model with an ID per item is the right shape. Use a flat ID-keyed store with parent and order properties (Figma, A2UI) rather than nested arrays. This gives O(1) addressing for deltas and for LLM ops, simple moves, and no index shifting.
- Persist as an append-only JSONL op log plus periodic snapshots (compaction). That combines GrapesJS/Craft.js-style whole-document snapshots for fast load with Figma/tldraw-style incremental ops for collaboration and replay. In a DO, SQLite can hold both: an `ops` table keyed by seq, and a `snapshot` row.
- Separate styles and assets from the tree (GrapesJS styles/assets arrays, tldraw assets in R2) to keep the delta stream small.

### Gaps
- The exact Craft.js serialized node schema (fields such as `type`, `props`, `parent`, `nodes`, `linkedNodes`) was not confirmed from fetched docs.
- No sources were fetched on Plasmic's or Framer's internal data models or persistence.
- Webflow's internal model beyond the Designer API surface is undocumented here.

---

## C. Simplifying concessions: common simple setups, what each gives up, and when you don't need more

### Takeaway
Most web multiplayer and collaborative apps can ship with:
- WebSocket;
- one authoritative room process (a DO or Colyseus room);
- per-property last-writer-wins;
- coalesced deltas (or even full-state snapshots) at a low tick rate;
- no prediction.

Add prediction, interpolation, lag compensation, binary encoding, or UDP only for fast action games. For AI, apply complete, ID-addressed tool ops with validation, rather than streaming partial patches into the live document.

### Cited Findings
- **Low tick rate, turn-based, no prediction**: Nakama's examples use a tick rate of 1 per second, with "once per second for turn-based games" as the low end. Advice: start low and raise gradually. — [Nakama docs](https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/llm.md)
  - Gives up: responsiveness. Every action waits a round trip (about 100 ms at 50 ms each way), which Gambetta says only becomes a real problem toward half a second. — [Gambetta](https://www.gabrielgambetta.com/client-server-game-architecture.html)
- **Snapshots at a low send rate plus interpolation only**:
  - Gives up: latency and smoothness under loss. At 10 snapshots/sec the minimum delay is 100 ms, about 150 ms practically, and 250–350 ms with packet loss. Bandwidth is high if snapshots are full. — [Gaffer, Snapshot Compression](https://gafferongames.com/post/snapshot_compression/)
- **Coalesce to latest value per property per tick** instead of a per-change stream: Colyseus queues "only the latest mutation of each property" per patchRate. — [Colyseus docs](https://docs.colyseus.io/state)
  - Gives up: intermediate values. That's fine for state, but not for event streams.
- **Delta against last acked baseline (Quake 3) instead of a reliable op stream**: makes loss tolerance automatic. — [Sanglard](https://fabiensanglard.net/quake3/network.php)
  - Gives up: history and replay. You keep only snapshots, not an op log.
- **Relay-only server (clients hold state)**: Cloudflare's Doom DO just routes packets. — [Cloudflare blog](https://blog.cloudflare.com/doom-multiplayer-workers)
  - Gives up: anti-cheat, late-join, and reconnect robustness ("handled poorly"), and play is bound to the slowest peer.
- **Host-authoritative (one client is the authority)**: Playroom, where "the host's version wins." — [Playroom docs](https://playroom-docs.vercel.app/features/apps/state)
  - Gives up: cheat resistance and resilience when the host leaves, but needs no server logic.
- **Last-writer-wins per property instead of OT/CRDT**: Figma deliberately chose this. — [Figma blog](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
  - Gives up: merging concurrent edits to the same text property (one whole value wins).
- **Full-state broadcast on every change**: Cloudflare Agents `setState` "broadcasts" state to all clients. — [Cloudflare Agents docs](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/)
  - Gives up: bandwidth as state grows. Whether it diffs is unconfirmed.
- **WebSocket/TCP instead of UDP**: geckos.io itself recommends WebSocket or socket.io for newcomers. — [geckos.io](https://github.com/geckosio/geckos.io)
  - Gives up: head-of-line blocking on loss. Socket.IO's `volatile` approximates drop-stale semantics. — [Socket.IO](https://socket.io/docs/v4/emitting-events/)
- **Hibernating DO rooms with no server tick loop**:
  - Gains: duration charges stop during hibernation.
  - Gives up: any server-driven simulation, since `setTimeout`/`setInterval` and alarms prevent hibernation. — [Cloudflare DO WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- **JSON Patch tool for the LLM**: about 31% token savings and quality within 5% of full regeneration. — [JSON Whisperer](https://arxiv.org/html/2510.04717v1)
  - Gives up: index-based paths break when arrays shift. Use stable keys.
- **Apply AI actions only when each finishes streaming**: tldraw. — [tldraw agent kit](https://tldraw.dev/starter-kits/agent)
  - Gives up: character-by-character visual streaming of large props, but avoids invalid partial JSON, which [Anthropic warns](https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming.md) can occur with eager streaming.
- **Full-file or full-document rewrites by the LLM instead of diffs**: bolt.diy writes whole files. — [Starlog](https://starlog.pages.dev/articles/ai-dev-tools/stackblitz-labs-bolt-diy)
  - Gives up: tokens and latency (JSON Whisperer measured 42% cost savings for patches), and concurrent human edits are clobbered unless the file is locked (bolt.diy uses file locks).
- **Draft then commit for AI output**: Puck guidance (secondary). — [AgentPedia](https://agentpedia.codes/blog/puck-ai-0-8-embedded-react-builder-guide)
  - Gives up: live co-editing with the agent mid-run, in exchange for never persisting half-finished or invalid trees.
- **Pre-built game platform (Hathora) instead of self-hosting**: gives up control. Hathora's shutdown forced Stormgate's multiplayer offline. — [Supercraft](https://crux.supercraft.host/blog/hathora-shut-down-where-to-go-after-may-2026/)

### Inferences
- Default stack recommended for the user's mixed workload: one DO per room/page/channel, WebSocket with hibernation, JSON deltas over a JSONL op log with acked seq numbers for catch-up, per-property LWW, children ordered by parent plus fractional index, and coalescing of ephemeral props per tick (e.g., 20–30 Hz for cursors and drags).
  - This covers the editor, Discord-like chat, turn-based and casual games, and AI ops.
  - Add these only for a specific action game: an input channel with seq numbers, client prediction and reconciliation for the local avatar, about 100 ms interpolation buffers, quantized and binary fields, and possibly a non-DO UDP/WebTransport server.
- When you don't need more:
  - turn-based, board, or card games;
  - party and trivia games (Discord Activities);
  - co-op games tolerant of about 100–150 ms;
  - collaborative editors (Figma-scale design tools ship with server LWW, no CRDT);
  - chat;
  - AI page generation (complete ops with validation).
- When you do need more:
  - competitive shooters or physics: prediction, lag compensation, UDP;
  - fighting games: rollback;
  - collaborative rich-text: a CRDT or OT for text props only. A hybrid works: LWW for structure, Yjs-like text for long-text fields.

### Gaps
- No primary source gives a quantified threshold (players × tick rate × state size) at which full-state snapshots stop being acceptable over WebSocket for browser games.
- Cloudflare's official DO pricing page was not fetched. Pricing figures come from a low-reliability secondary source.
