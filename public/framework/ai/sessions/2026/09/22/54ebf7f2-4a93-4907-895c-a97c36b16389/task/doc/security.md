# Security — `call` is `eval` with a nicer name

That is not a metaphor. `Server/plugins/MCP.js`'s `eval` tool already runs arbitrary
code in a browser tab or on the server; `call` is narrower in what it can reach on any
one request, but it is reached the same way — a JSON-RPC-shaped tool a Claude session
calls — and it has to be trusted exactly as little. The dev-server RCE closed
2026-09-19 (`ai/2026-09-19/`) was not a flaw in `eval` itself; it was a wire that let a
non-loopback caller reach it at all. That is the one lesson this design has to not
re-learn.

## What stays loopback-only — everything, unchanged

Every wire the envelope rides is already gated, and the object layer adds no new
door:

- **WebSocket** (`Server/plugins/SocketServer/SocketServer.js`, `local_only()`) checks
  both the TCP peer address (loopback only) and, for a browser caller, the `Origin`
  header — because a WebSocket upgrade is not subject to same-origin policy, so
  loopback alone is not enough once a browser is one of the two ends.
- **`POST /mcp`** on both doors (`Server/plugins/MCP.js`, `Servex/MCP.js`) checks
  `req.socket.remoteAddress` against the same loopback regex and refuses with a 403
  JSON-RPC error before the method name is even read.

`call`, `describe` and `list_objects` are three more tool names on doors that already
refuse everyone but this machine. Nothing about them needs — or gets — a new gate.

## What a target registry refuses

Three layers, each closing a different way in:

1. **Only registered roots.** The registry is a fixed object (`{ servex, app }` on
   Node, `{ app }` in the browser) built once, by hand, at startup. There is no path
   from a dotted string to `process`, `require`, `global`, or any other ambient
   object — `resolve()` only ever walks properties that are already sitting on a
   value someone deliberately put in the registry.
2. **No prototype-chain escape.** `__proto__`, `constructor` and `prototype` are
   refused as path segments outright (`doc/envelope.md`), so a target string can
   never walk from a registered object to `Object.prototype`, a constructor function,
   or anything reachable from one.
3. **`@public` is an allowlist, not a blocklist.** `describe` and `call` both see only
   methods whose JSDoc says `@public`; everything else — `assign`, `initialize`,
   anything nobody thought to mark — does not exist as far as this door is concerned.
   Forgetting to hide a dangerous method is the blocklist failure mode; this design's
   failure mode is instead "forgot to expose a safe one," which just means a tool
   that under-delivers, never one that over-reaches.

## The one rule the owner has to keep in mind

**`@public` is a promise that a method is safe to call from anywhere on this
machine — full stop, the same bar `Servex/MCP.js`'s hand-written tool list already
holds itself to today.** It is not a note for `describe`'s output to look nicer, and
it is not scoped to "safe for the dashboard" or "safe for a trusted agent" — anyone
with code execution on this machine, or LAN reach in the event the loopback gate is
ever loosened, reaches every `@public` method on every registered root. For `servex`
that already includes agent control (`spawn_agent`, `stop_server`) once section A's
tools are folded into this seam (`doc/build-plan.md`), so tagging a method `@public`
is exactly as consequential as adding it to `Servex/MCP.js` by hand — because, once
phase 3 lands, it is the same door.
