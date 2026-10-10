# The envelope — exact shape

One request shape, one reply shape, everywhere. `target` is a dotted path into a root
registry (`"servex.agents"`); `method` is the name of one `@public` method on whatever
that path resolves to; `args` is a plain array, passed to the method as `(...args)`.

## Request

```json
{ "target": "servex.agents", "method": "list", "args": [] }
```

No `id` in the envelope itself — each wire already has its own way to match a reply to
a request (WebSocket: `Socket.request()`'s `index`; HTTP POST: one request, one
response; MCP: `tools/call`'s own `id`), so the envelope stays the same three fields on
all three and the id lives on the outside, once, per wire.

## Reply — one value

```json
{ "ok": true, "value": [{ "id": "minion-servex-port", "state": "idle" }] }
```

## Reply — an error

```json
{ "ok": false, "error": "refused: \"assign\" on \"servex.agents\" is not @public" }
```

Same shape a refusal and a thrown exception both produce — the caller never has to
tell "the method doesn't exist" from "the method ran and rejected." `doc/security.md`
is what decides which refusals happen and why.

## Reply — streaming (a method that yields)

A method that is an (async) generator sends more than one frame: zero or more
`{ "ok": true, "value": <yielded value>, "done": false }`, then one final
`{ "ok": true, "done": true }` with no `value`. WebSocket carries these as ordinary
`rpc` sends tagged with the same request `index`, since it is already a two-way
socket. HTTP POST has no second frame to send on a single request/response — the
simplest fix, and the one this design picks, is: `call` over HTTP always buffers a
streaming method to completion and returns one reply whose `value` is the array of
everything yielded. MCP's `tools/call` is the same one-shot shape as the HTTP wire
(`Server/plugins/MCP.js`'s and `Servex/MCP.js`'s `post()` are both "one POST, one
JSON answer, no SSE"), so it buffers too. The alternative — teaching MCP a second,
streaming tool per generator method — was rejected: it doubles every streaming
method's tool count for a case (an MCP client watching a live token stream) this
design does not need yet, and WebSocket already covers the one place that wants true
streaming today (`Socket.eval`'s reply, `Append`'s frames).

## How `target` resolves

Dotted path, walked as plain property access from a root registry object
(`{ servex, app }` on the Node side; `{ app }` in the browser, since the browser has
no reach into the Servex process). `"servex.agents"` → `root.servex.agents`. Three
path segments are refused outright, never walked: `__proto__`, `constructor`,
`prototype` — the three ways a dotted path can escape the registry and reach
`Object.prototype` or a constructor function instead of a registered object. See
`doc/security.md` for why that refusal exists even though `@public` alone already
stops most of what it would reach.

## What `describe` exposes

**Decision: only a method whose JSDoc comment carries an `@public` tag, immediately
above the method.** Every other own method — `assign`, `initialize`, a framework
seam meant only for the class's own wiring — is invisible to `list_objects`,
`describe` and `call` alike, exactly as if it were not there.

**Why:** a live object like `servex.agents` (`Servex/agents/Agents.js`) mixes plain
framework plumbing (`assign`, `initialize`, `emit`) with the handful of methods an
operator actually wants to reach (`list`, `stop`, `send`). Every enumerable method
would expose all of it — including things nobody ever meant to be a remote call — and
the JSDoc comment already has to be read to build the tool's description, so asking
for one more tag on that same comment costs nothing extra and turns "everything
except what I forgot to hide" into "nothing except what I named."

**Alternative, rejected:** every enumerable method, with no tag. Simpler to write, but
it is a blocklist in disguise — safe only for as long as nobody adds a method they
forgot was reachable — and that is the exact shape of mistake `doc/security.md`
points at `eval`.

## How it rides each wire

| Wire | Carrier | Where the envelope sits |
|---|---|---|
| Dev server ↔ browser | WebSocket, `Socket.rpc`/`async_rpc` | `{ method: "object", args: [envelope] }` — one more server-called method beside `reload`/`eval`, `Server/plugins/SocketServer/`'s side answers over the same socket |
| Servex ↔ dashboard | HTTP, `POST /mcp` and a plain REST verb | The envelope IS the `tools/call` `arguments` for the three MCP tools; a REST caller posts it as the JSON body of `POST /call` |
| Any Claude session ↔ either | MCP `tools/call` | `params.arguments` is `{ target, method, args }` for `call`, `{ target }` for `describe`, `{}` for `list_objects` |

## JSDoc → tool doc, without a build step

The site has no bundler, so nothing ships a machine-readable doc comment on its own —
the only copy of a JSDoc block is the plain text of the file that defines the method.
Two ways to read it back, both proven in `proto/`:

1. **`Function.prototype.toString()`** — returns the function's own source, but
   **never** a comment written above it. Ruled out; there is nothing to parse.
2. **The defining file's own source text** — `fs.readFileSync` on Node
   (`proto/objects.mjs` reads itself), `fetch()` in the browser, since every module
   here is served as plain text at its own URL (`proto/browser.html` fetches
   `proto/browser-target.mjs`). **Chosen.** Measured: 9.3ms in the browser for one
   fetch + one regex pass over a small module (`shots/browser-describe.png`) — cheap
   enough to run on every `describe` call rather than caching, at this file size; a
   registry with hundreds of large source files would want to cache per mtime, not
   parse on every call, and that is a phase-3 concern, not a paper one.

Parsing itself: find the method's own definition line, then check whether it is
immediately preceded (blank lines aside) by a `/** ... */` block — never a scan from
the top of the file, which a naive lazy regex gets wrong the moment a class has two
methods (the exact bug the browser prototype caught and `proto/objects.mjs` now
fixes — see its `jsdoc()` comment). Tags read: `@public` (the allowlist), `@param`
(one per parameter, kept as raw text), `@returns` (kept, not yet surfaced anywhere).
