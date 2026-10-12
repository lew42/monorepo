# mcp-site-tools

## The ask

Phase 3 of the `ai-server` effort (chat, 2026-08-15):

> there are a lot of other reasons why having claude running in node is a good
> idea... it could use the socket to talk directly to the site, without having
> to use playwright. it could adjust/configure the server in realtime.

Agreed design: the dev server exposes its powers as MCP tools over HTTP, so
EVERY Claude session in this repo (terminal, board-spawned, forked) gets them —
no Agent SDK, no npm dependency. Playwright shrinks to pixels; DOM truth comes
from the live tab over the already-open dev socket.

## What to build

**`Server/plugins/MCP.js`** (new): a hand-rolled MCP endpoint at `POST /mcp`
on the existing express app (registered via the `server.on("express")` hook —
see AILogs.js for the pattern). JSON-RPC 2.0, MCP streamable-HTTP transport in
its simplest legal form: every request answered with a single
`application/json` response (no SSE, no session state). Implement exactly:
`initialize` (advertise `tools` capability + serverInfo), the
`notifications/initialized` notification (accept, 202, no body), `tools/list`,
`tools/call`. Unknown methods → JSON-RPC method-not-found. Consult
https://modelcontextprotocol.io/docs (WebFetch) for the current schema — do
not guess field names; get `protocolVersion` negotiation right.

**⚠ The fence (hard constraint):** the server listens on `0.0.0.0`. `/mcp`
must refuse any request whose `req.socket.remoteAddress` is not loopback
(127.0.0.1 / ::1 / ::ffff:127.0.0.1) — same spirit as SocketServer's origin
check, and `eval` in a tab is the payload. Refuse loudly, log the address.

Three tools (short names — the client prefixes `mcp__site__`):

- **`pages`** — list connected tabs: `[{path, connected_since}]`. Requires the
  browser to report its location: add a minimal `hello` to
  `public/framework/dev/Socket/Socket.js` — on `open()`, send
  `{"method":"hello","args":[location.pathname]}`; server Socket stores it
  (`socket.page = path`). You own this small addition (the browser-side agent
  finished; coordinate with nothing).
- **`eval`** — `{path, code}`: run `code` in the FIRST connected tab whose
  page matches `path`, return the JSON-serialized result. Server→client
  request needs a reply channel the wire lacks: send
  `{"method":"eval","args":[code, token]}`; the browser evaluates and replies
  `{"method":"eval_result","args":[token, result_or_error]}`; server correlates
  by token with a ~10s timeout. Browser side: `Socket.prototype.eval` uses
  indirect eval, serializes with a circular-safe fallback (`String(result)`),
  never throws out of the handler. Document the trap in dev/Socket's readme:
  this is a localhost dev server evaluating in your tab BY DESIGN; the
  loopback fence + localhost-only socket are the boundary.
- **`shot`** — `{url, selector?, width?, height?}`: call the existing
  `Server/plugins/Shot.js` `shot()` and return the png path (text content),
  mirroring Ask.js's usage. Playwright missing → the tool errors with the
  install hint, like shot() already does.

**`.mcp.json`** (repo root, new, checked in): `{"mcpServers": {"site":
{"type": "http", "url": "http://localhost/mcp"}}}` — verify the exact shape
against current docs.

**`server.js`** (root): `Server.use(MCP)` registration. **`Server/README.md`**:
a short MCP section beside the existing channels one.

## Files you own

`Server/plugins/MCP.js`, `.mcp.json`, `server.js` (registration line only),
`Server/README.md` (one section), `public/framework/dev/Socket/Socket.js` +
its `readme.md`/`doc/wire.md` (hello + eval + eval_result additions ONLY —
the file just shipped `changed()`; do not touch that logic), and your task log.
NOT ext/JSONL, NOT ext/AITask (another agent is mid-flight there), NOT
LiveReload/Tail/Directory.

## Verification bar

`node --check` everything. Then live, endpoint-level (scratch scripts in the
scratchpad, never the repo): restart the dev server carefully (netstat for the
PID on :80, `taskkill //F //PID`, relaunch `node server.js` detached, confirm
:80 answers — NEVER pkill), then with node fetch: initialize → tools/list
(three tools, valid schemas) → open a real tab on :80 via globally-installed
playwright → `pages` lists it → `eval` returns `document.title` from it →
`shot` returns a png path that exists → a spoofed non-loopback request shape
is refused (unit-test the fence predicate if you cannot spoof remoteAddress).
Leave the server RUNNING. Log milestones + actions to
`public/framework/ai/2026-08-15/mcp-site-tools/task.jsonl`; stamp the landing
assign (steps are in the launch line) and append the day.jsonl landed line.

## Out of scope (note in Server/README.md, don't build)

`server_config` (nothing worth configuring yet — a tool with no consumer is
API surface forever); auth tokens; SSE streaming; tool scoping per session;
exposing subagent transcripts. CLAUDE.md rules over everything; no npm deps;
files under ~100 lines where achievable; comments = traps only.
