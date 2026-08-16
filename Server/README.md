# Server
Server

```javascript
import Server from "./Server/Server.js";
import SocketServer from "./Server/plugins/SocketServer/SocketServer.js";
import LiveReload from "./Server/plugins/SocketServer/LiveReload.js";

SocketServer.use(LiveReload);
Server.use(SocketServer);
new Server();
```

## Watching public/

One chokidar watcher, in `LiveReload`, feeds two channels — the protocol both
sides build to is `public/framework/dev/Socket/doc/wire.md`.

- **`.jsonl` → `Tail`** (a `Socket` plugin, `DevSocket.Socket.use(Tail)`): the
  subscribed sockets get the appended lines, nothing reloads. A file's byte
  offset always lands just past a `\n`, so a half-written trailing line is left
  unread and every offset a client echoes back on re-subscribe is resumable.
- **everything else → a debounced `changed([url paths])` broadcast**, deduped
  over ~300ms. `changed()` with no path still means "reload everything"
  (`[null]`). A socket muted for a path drops that path from its own batch and
  keeps the rest.

`Directory` rebuilds the two `directory.json` files and reports them by name, so
a new file reloads the boards that list it without reloading the whole site.

## MCP — the dev server's powers as tools

`MCP` (`plugins/MCP.js`) answers `POST /mcp` with hand-rolled JSON-RPC 2.0 —
MCP streamable HTTP in its simplest legal form: one POST, one
`application/json` answer, no session id, no SSE. `.mcp.json` at the repo root
points every Claude session in this repo at it, so the tools arrive as
`mcp__site__pages`, `mcp__site__eval`, `mcp__site__shot`.

| tool | does |
|---|---|
| `pages` | the connected tabs — `[{path, connected_since}]` |
| `eval` | `{code, path?}` run in a live tab, result JSON-serialized. DOM truth without a browser driver |
| `shot` | `{url, selector?, width?, height?}` → a png path, via `Shot.js` and a **globally** installed playwright |

`eval` needs a reply channel the socket wire lacks, so
`plugins/SocketServer/Tab.js` — a `Socket` plugin, `DevSocket.Socket.use(Tab)` —
sends `{method:"eval", args:[code, token]}` and correlates the browser's
`eval_result` by token, giving up after 10s. `Tab` also records the `hello` each
tab sends — on connect, on every SPA navigation (the site's `navigated()` hook),
and before each `eval` — which is what `pages` lists and what `eval`'s optional
`path` matches. Protocol:
`public/framework/dev/Socket/doc/wire.md`.

**⚠ `/mcp` is loopback-only, and that is the whole security model.** The server
binds `0.0.0.0`; a request whose `req.socket.remoteAddress` is not `127.0.0.1`
/ `::1` is refused with a 403 and logged. `eval` runs arbitrary JS in your
browser and `shot` drives a headless chromium — widening this fence hands the
machine to anything on the LAN.

Deliberately not built: `server_config` (nothing worth configuring yet — a tool
with no consumer is API surface forever), auth tokens, SSE streaming, per-session
tool scoping, exposing subagent transcripts.