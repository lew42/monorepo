One class, one WebSocket. It exists to make live reload possible without ever
letting a static production build depend on a server — the localhost gate at
the top of `initialize()` is why every other line in the file is safe to ship.

## The shape

`assign()`-then-`initialize()`, the same constructor shape as every class in
this codebase. `initialize()` sets the defaults and — the load-bearing part —
decides once, synchronously, whether this document may ever talk to a server.
Everything past that point (`connect`, `reconnect`, `send`, `request`) checks
`this.disabled` rather than re-deriving the answer.

## Two correctness traps, both fixed and both invisible if you don't know to look

`connect()`'s `close` listener is the *only* reconnect path — `error` only
logs — because a failed handshake fires both events and reconnecting from each
turned a stopped dev server into a doubling connection storm. And
`reconnect()` never rejects `this.ready`: a pending `.ready` parks a `send()`
until the server comes back, which is what a routine `node server.js` restart
needs; a rejected one would make every later `send()` throw for the rest of
the page's life. Neither shows up in a diff or a test — only in behaviour
during a restart.

## The frame protocol is one `if`

`message()` tells a reply from a server-initiated call with one test:
`data?.index in this.requests` versus `data.method`. There's no envelope
version, no type tag — just an index that doubles as both "this is a reply"
and "here's which pending `request()` it answers". `reload()`, `changed()` and
`eval()` are what the server invokes this way; `jsonl`/`jsonl_reset` land the
same way once [JSONL](/framework/ext/JSONL/) patches them on.

## The MCP reply channel

`open()` announces `hello` with the tab's pathname, and
[`eval`](/framework/dev/Socket/api/eval/) answers the server's one
request-shaped call — evaluated in global scope, promise-awaited, serialized
with a `String()` fallback, every outcome settling the token so
`Server/plugins/SocketServer/Tab.js` never waits on silence. The two-gate
security model (localhost-only connect, loopback-fenced `/mcp`) is stated in
the readme's traps; both must hold.

## The scoped-reload trio

`changed()`, `loaded()` and `restyle()` are the file's second job and its only
DOM-touching code. `changed()` decides, `loaded()` reads
`performance.getEntriesByType("resource")` into pathname → still-swappable, and
`restyle()` bumps `?t=` on the matching `<link>`. Two silent traps live here and
both are commented in place: the swap must mutate the **same element** or
`@layer` order inverts, and a path read as data (`initiatorType` `fetch`) is not
swappable no matter what its extension says.
[`changed`](/framework/dev/Socket/api/changed/) is the long version.

## Improvements

1. **`disabled` should default to `false`.** `initialize()` only ever sets it
   `true` (the off-localhost branch); on localhost it stays `undefined`
   forever. Every read is `if (this.disabled)` so nothing misbehaves, but
   `socket.disabled === false` is never true from the console. One line in
   the defaults block. *(simple, useful — readme's `## Proposed #2`.)*
2. **The client → server half is no longer theoretical, and its shape should
   follow its callers.** `server.js` now wires `Runtime` in (see
   [wire](/framework/dev/Socket/doc/wire/) for the current accounting), and
   `FileSaver.write()`/`delete()` and `DesignTool/audit/twin.js` already call
   `async_rpc`/`rpc` for real. `async_rpc` duplicates `request`; `ls`/`cmd`/
   `log` have never been called by anything. Trimming to `send`/`request`/
   `rpc` and one `write` wrapper (the one real caller's actual shape) would
   cost three call-site edits and remove four names that teach a false
   "unused" story. *(medium, important — was "speculative" when the server
   half was dark; it no longer is.)*
3. **`requests` only grows.** `request()` pushes a resolver and nothing ever
   splices it out once resolved. Zero cost while nothing called `request()`;
   now that `FileSaver` and `twin.js` do, a long editing session accumulates
   dead resolvers. *(simple, useful.)*
4. **`promise()` is a hand-rolled deferred.** `Promise.withResolvers()` is the
   standard replacement, gated only by browser floor. *(simple, speculative —
   do it the day the floor allows.)*
5. **The file is ~225 lines and the third job has arrived.** The scoped-reload
   trio was the second responsibility; `hello`/`eval` is the third. Each would
   split only by patching the prototype from a sibling file — the black magic
   this codebase avoids, for a line count. Still left whole deliberately, but
   the pressure is real now; if a fourth job lands, revisit the shape instead
   of the count. *(medium, later.)*
