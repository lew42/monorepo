# Server

Dev only — `node server.js` (port 80, `PORT` to override); production is static.
Reuse the one already running. ⚠ Every few days it pins a core (~130%) while still
serving; `pkill` matches nothing on Windows — kill by pid, restart it in your terminal, and
profile it first if you can: [`doc/spin.md`](./doc/spin.md).

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

⚠ **On Windows the watcher locks every directory under `public/` against renaming**
(one `fs.watch` handle per dir; *Permission denied* from `git mv` and `Rename-Item`
alike, files inside untouched). Stop the server, rename, restart (2026-08-17).

## The socket wire is loopback-only

`server.js` loads `DevSocket` — a bare subclass of `SocketServer` — so every
`Socket` plugin (`Runtime`, `Ask`, `Start`, `Tab`, `Tail`) comes in through **one
door**, the WebSocket upgrade. `SocketServer.js` guards it with two checks, and
both have to stand because they refuse different callers:

- **the peer address**, via `MCP.js`'s `loopback()` — the same predicate `/mcp`
  uses. It is the one field a caller cannot choose.
- **the `Origin`**, when one is sent. A WebSocket upgrade is *not* subject to the
  same-origin policy, so any site visited in a local tab can open
  `ws://localhost` — and that request does come from loopback, so only Origin
  refuses it. A browser always sends an honest one; local CLI tooling sends none.

**What was open until 2026-08-16:** only the Origin check existed, and it began
`if (!origin) return true`. Origin is a header the caller writes, so any
non-browser client on the LAN was accepted — and `Runtime`'s `rpc:cmd`
(`child_process.exec`, no allowlist) then ran as the logged-in user. Confirmed by
executing `whoami` over the wire from this machine's LAN address; the server binds
`0.0.0.0` and Windows Firewall has a standing inbound allow for `node.exe`.
`LAW#6` already made this tier localhost-only — the guard just enforces it
server-side, where the client cannot be taken at its word.

**`GET /ai-logs/:id` (`AILogs.js`) is now also `loopback()`-gated (2026-08-17).**
The UUID-shaped id was never a fence: `session_id` is written in plain text
into `task.jsonl` files under `public/framework/ai`, which `express.static`
serves unguarded to the same LAN — so reading one task log handed an attacker
the id needed to fetch the next transcript. Same guard, same import, same
shape as the socket fix above; a loopback caller (the dashboard's own
`replay()` fetch) is unaffected, verified on a throwaway `PORT=8081` instance.

**`GET /screenshot` (`Screenshots.js`) is `loopback()`-gated from birth
(2026-08-17, `shots-in-log`).** Serves screenshots a worker takes outside the
repo (RULE#12) — the session scratchpad, or wherever `Shot.js` wrote the
file — so the AI task dashboard can render them, keyed off a `path` a
`task.jsonl` `shot` line logs. Reading arbitrary files outside `public/` is
the exact hole `AILogs.js` had, so this route was built with the guard rather
than having one added later: same `loopback()` import, plus the path is
confined to `os.tmpdir()` **after** `path.resolve()` — a prefix check on the
raw string is defeated by `..` and by symlinks — and only a fixed image-type
allowlist is served. Verified on a throwaway `PORT=8090` instance (the shared
`:80` instance was never touched or restarted): a loopback request for a real
png under the temp root → `200`/`image/png` at the exact byte count; the same
request from this machine's LAN address (`192.168.1.206`) → `403`; a loopback
request whose `path` resolves outside the temp root via `..` (`Temp\..\..\..\
evil.png` → `C:\Users\mike\evil.png`) → `403`, proving the confinement check
fires *before* the `404` a missing file would otherwise give. A headless
Playwright probe then confirmed the whole loop against 5 real screenshots
logged into a real `task.jsonl`: rendered thumbnails whose `naturalWidth`
matched each PNG exactly on the guarded instance, and a `.missing` fallback
swatch with zero console errors and zero failed requests against the live
`:80` instance, which doesn't have this route registered yet.

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
| `claim` | `{note?, who?, path?}` — ring a tab orange so the owner sees which window an agent drives (`public/framework/dev/Claim/`) |
| `release` | `{path?}` — drop the ring, when the task lands |

**Every `eval` answer ends with the tab's state at answer time** — `visibility`,
`focused`, size — attached inside `Socket.js`'s `reply`, not when the call was made,
because a three-second eval spans a click-away. ⚠ A hidden tab does **not** sleep: it
evaluates fine and stops *rendering*, so no rAF and no ResizeObserver. CSS-driven
layout still measures true (a geometry read forces a reflow); anything the page sizes
in a frame callback is frozen, and that reads as a plausible number, never an error.
`shot` is the escape hatch — its own browser, always rendering.
`ai/2026-08-18/mcp-tab-awareness/`.

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