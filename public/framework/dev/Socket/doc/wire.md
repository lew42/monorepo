# The wire — Claude to a live tab, and back

The dev server is a hinge between two protocols. A Claude session speaks **HTTP
JSON-RPC** to it over `POST /mcp`; the server speaks the **socket frame protocol**
to every browser tab over one WebSocket. One request crosses four hops:

```
Claude ──POST /mcp──▶ dev server ──eval frame──▶ live tab
       ◀──JSON────────  (Node)    ◀eval_result── (browser)
```

`pages`, `eval` and `shot` are the tools on the HTTP hop. `changed`, `jsonl`,
`eval`, `hello` … are the frames on the ws hop. This file is the contract for
both — and **every example below was captured live** through those same tools,
against this task's own log and this very file.

## Who speaks on each hop

| hop | transport | who may start it | vocabulary |
|---|---|---|---|
| Claude ⇄ dev server | HTTP `POST /mcp`, JSON-RPC 2.0 | Claude | `initialize`, `tools/list`, `tools/call` — the tools `pages` / `eval` / `shot` |
| dev server ⇄ tab | one WebSocket, JSON frames | **either end** | server→tab: `changed`, `jsonl`, `jsonl_reset`, `reload`, `eval` · tab→server: `hello`, `eval_result`, `subscribe`, `unsubscribe`, `ls`/`write`/`rm` |

`shot` is the exception: it never touches the socket. It launches its own headless
chromium and photographs a fresh load of a url, so it sees no tab and no live
state. `pages` and `eval` ride the relay to a *real* tab; `shot` is a side door.

All paths on the ws are **url-paths** — `/framework/x/y.js`, forward slashes,
root-absolute, never `public/…` and never a backslash. Both ends build to that.

---

## Hop 1 — the MCP HTTP call

Hand-rolled MCP streamable HTTP in its simplest legal form: one `POST`, one
`application/json` answer, no session, no SSE (`Server/plugins/MCP.js`,
`Server/README.md`). Three JSON-RPC methods matter.

**`initialize`** — the handshake. The server pins the protocol version (echoing a
known one, else its newest) and hands back its instructions. Captured:

```json
→ {"jsonrpc":"2.0","id":1,"method":"initialize",
   "params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"claude","version":"1"}}}

← {"jsonrpc":"2.0","id":1,"result":{
     "protocolVersion":"2025-11-25",
     "capabilities":{"tools":{}},
     "serverInfo":{"name":"site","title":"lew42 dev site","version":"1.0.0"},
     "instructions":"The site running on localhost. `pages` lists the open tabs, `eval` reads DOM truth from inside one, `shot` takes a png."}}
```

**`tools/list`** — the three tools and their schemas. This *is* the tool contract;
trimmed to the `eval` schema, which is the one worth reading:

```json
→ {"jsonrpc":"2.0","id":2,"method":"tools/list"}

← {"jsonrpc":"2.0","id":2,"result":{"tools":[
     {"name":"pages","description":"List the browser tabs …","inputSchema":{"type":"object","properties":{}}},
     {"name":"eval","description":"Evaluate JavaScript in a live tab …","inputSchema":{"type":"object","required":["code"],
        "properties":{"code":{"type":"string","description":"A JavaScript expression, evaluated at global scope in the tab."},
                      "path":{"type":"string","description":"Which tab, by the url path it reported. Omit for the first connected one."}}}},
     {"name":"shot","description":"Screenshot a url with headless chromium …","inputSchema":{"type":"object","required":["url"],"properties":{…}}}]}}
```

**`tools/call`** — run one. Every result is wrapped `{content:[{type:"text",text}]}`;
`text` is whatever the tool returned as a string. `pages` returns the JSON its name
promises — captured against a tab that had SPA-navigated to `/framework/ai/`:

```json
→ {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"pages","arguments":{}}}

← {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text",
     "text":"[\n  {\n    \"path\": \"/framework/ai/\",\n    \"connected_since\": \"2026-08-15T20:07:52-05:00\"\n  }\n]"}]}}
```

### The loopback fence — the second gate

`eval` runs arbitrary JS in your browser and `shot` drives a headless chromium, so
two gates guard the door and **both** must hold. First, the tab connects only on
localhost and the ws server refuses any non-local `Origin`
([localhost](/framework/dev/Socket/doc/localhost/), `SocketServer.js`). Second,
`POST /mcp` reads `req.socket.remoteAddress` and refuses anything that is not
loopback (`127.0.0.1` / `::1`) with a 403:

```json
← {"jsonrpc":"2.0","id":null,"error":{"code":-32600,"message":"/mcp answers loopback only; refused <addr>"}}
```

That refusal is untriggerable from a loopback client by definition, so its shape is
the source of truth, not a capture — but the neighbouring rejections are captured:
a non-`POST` (`GET /mcp`) answers **HTTP 405**, and a notification (a body with no
`id`) answers **HTTP 202** with an empty payload. Widening either gate hands the
browser to anything else that can reach this machine — it is a hard constraint in
`CLAUDE.md`, not a preference.

---

## Hop 2 — the socket frame

Every frame is JSON, and there are exactly two shapes. The client's `message()`
tells them apart with one test:

| shape | means | handled by |
|---|---|---|
| `{ method, args }` | **the other side is calling a method on you** | `this[method](...args)` |
| `{ index, response }` | a reply to a `request()` you sent | the resolver stored at `requests[index]` |

The correlation id for a `request()` is the array index its resolver was pushed to —
no counter, and the lookup is a subscript. `if (this[data.method])` is the whole
safety model: any method on the socket is reachable by the other end, acceptable
**only** because the localhost gate above guarantees the other end is
`node server.js` on your own machine.

### server → browser

| frame | means | captured example |
|---|---|---|
| `changed` | these files changed — deduped and debounced ~300ms server-side. A missing array, or a `null` inside one, means *"unknown — reload everything"* | `{"method":"changed","args":[["/framework/dev/Socket/doc/wire.md"]]}` |
| `jsonl` | appended complete lines of a subscribed `.jsonl` (raw strings, no trailing `\n`); the trailing number is the server byte `offset` **after** these lines | see below |
| `jsonl_reset` | the file shrank or was rewritten — drop replayed state and re-subscribe from `0` | `{"method":"jsonl_reset","args":["/framework/ai/2026-08-15/wire-reference/task.jsonl"]}` |
| `eval` | run `code` in this tab and answer with `eval_result` carrying the same `token`. MCP's `eval` tool | `{"method":"eval","args":["1 + 1","617a136a-b620-4a1d-959c-6ea8f9df0c42"]}` |
| `reload` | reload unconditionally | *no current sender* — see below |

The `changed` frame above is this file's own: editing `wire.md` while a tap watched
the socket produced exactly that frame. `reload` is the original live-reload
feature and its client handler still lives on `Socket` — but **nothing in `Server/`
sends it any more**; `changed([null])` is the live "reload everything" path. It is
documented because a reader will see the handler and look for the sender.

A `jsonl` frame, captured twice against this task's log — first the **replay** the
server sends the instant you subscribe, then the **incremental** append four log
lines later. The offset walks forward (`737` → `1807`); the client never computes
it, only echoes back one the server sent:

```json
← {"method":"jsonl","args":["/framework/ai/2026-08-15/wire-reference/task.jsonl",
     ["{\"assign\": {\"session_id\": \"2778…\", \"step\": 1}}"], 737]}

← {"method":"jsonl","args":["/framework/ai/2026-08-15/wire-reference/task.jsonl",
     ["{\"assign\": {\"now\": \"read the whole relay …\", \"step\": 2}}",
      "{\"log\": {\"at\": \"2026-08-15T20:12:40-05:00\", …}}",
      "{\"log\": {\"at\": \"2026-08-15T20:13:10-05:00\", …}}",
      "{\"log\": {\"at\": \"2026-08-15T20:15:30-05:00\", …}}"], 1807]}
```

`.jsonl` paths never appear in `changed`. That is the whole point of the split
(`Server/plugins/SocketServer/Tail.js` routes them): an append streams, everything
else reloads.

### browser → server

| frame | means | captured example |
|---|---|---|
| `hello` | *this tab is on this page.* Sent on connect, on every SPA route, and before each `eval` | `{"method":"hello","args":["/framework/ai/"]}` |
| `eval_result` | the answer to an `eval` — `{ value }` (a JSON string, or `String(value)` when that throws) or `{ error }` | `{"method":"eval_result","args":["617a136a-…",{"value":"2"}]}` |
| `subscribe` | stream a `.jsonl` from byte offset `from` (`0` = the whole file). Answered immediately with one `jsonl`, then kept streaming | `{"method":"subscribe","args":["/framework/ai/2026-08-15/wire-reference/task.jsonl",0]}` |
| `unsubscribe` | stop streaming that file. Optional — closing the socket cleans up | `{"method":"unsubscribe","args":["/framework/ai/2026-08-15/wire-reference/task.jsonl"]}` |
| `ls` · `write` · `rm` | the `Runtime` plugin's file commands, sent via `rpc` / `async_rpc` | see reply shape below |

Those last three are the only frames that use the **`{ index, response }` reply
shape**. A real `ls` round trip, captured — the browser stamps an `index`, the
server echoes it back beside the answer:

```json
→ {"method":"ls","args":["/framework/dev/Socket"],"index":0}
← {"index":0,"response":[ … 4 directory entries … ]}
```

**⚠ Clients never compute byte offsets.** A `subscribe`'s `from` is only ever an
offset the server previously sent. A UTF-8 string length is not a byte count, and
guessing one truncates a line mid-character.

---

## One `eval`, end to end

The four hops for a single `mcp__site__eval` call, captured together so the
`token` ties them: an HTTP `tools/call` in, an `eval` frame down the socket, the
tab's `hello` + `eval_result` back up, an HTTP result out.

```json
1. HTTP → {"jsonrpc":"2.0","id":42,"method":"tools/call",
           "params":{"name":"eval","arguments":{"code":"1 + 1"}}}

2. ws   ← {"method":"eval","args":["1 + 1","617a136a-b620-4a1d-959c-6ea8f9df0c42"]}
3. ws   → {"method":"hello","args":["/framework/ai/"]}
4. ws   → {"method":"eval_result","args":["617a136a-b620-4a1d-959c-6ea8f9df0c42",{"value":"2"}]}

5. HTTP ← {"jsonrpc":"2.0","id":42,"result":{"content":[{"type":"text","text":"2"}]}}
```

The ws has no request id in the server→browser direction — `index` belongs to
`request()`, which only the browser sends — so `eval` carries its own correlation
id. The server (`Server/plugins/SocketServer/Tab.js`) generates the `token`, the
browser echoes it on `eval_result`, and the server gives up after 10s. `MCP.js`
only calls `tab.eval(code)`; the token, the timeout and the pending map live in
`Tab`. Step 3 is not noise: [`eval()`](/framework/dev/Socket/api/eval/) re-announces
`hello` *before* it runs the code, so an addressed tab self-heals its page even if
nothing else announced.

---

## `hello` — how a tab stays addressable

`pages` lists what each socket last announced, so a tab is only findable once it has
sent a `hello`. An SPA navigation changes `location.pathname` with **no new
socket**, so the announcement has to be re-sent by whatever knows a route
committed. Three senders, and the wire cannot tell them apart — the capture above
shows it in the act: that socket connected on `/framework/dev/Socket/api/`, yet
announced `/framework/ai/`, because it had navigated twice without reconnecting.

| sender | when |
|---|---|
| `Socket.open()` | connect and every reconnect, with `location.pathname` |
| the site's `navigated()` in `/app.js` | every committed SPA route, with the page's own url — `Router` calls it at the end of `activate()` |
| [`eval()`](/framework/dev/Socket/api/eval/) | before running the code, so an addressed tab self-heals |

**⚠ A site that wires no `navigated()` hook still goes stale**, silently — `pages`
keeps reporting where the tab connected. That is why `eval()` re-announces, and why
`eval` with no `path` (first connected tab) sidesteps the question. Core knows
nothing about sockets on purpose: the announcement is one visible line in the
site's own `app.js`, not a Router import.

## Who implements which half

`Socket` owns `reload` and [`changed`](/framework/dev/Socket/api/changed/) —
reloading this document is the socket's own business. It does **not** implement
`jsonl`, `jsonl_reset` or `subscribe`: those patch onto the prototype from
[JSONL](/framework/ext/JSONL/), the module that knows what a line means.
`dev/` stays a transport; the ext opts in. That split is why the socket has no idea
a task log exists, and why a page that never imports `JSONL` pays nothing for the
streaming half. On the server, `changed`/`reload` come from `LiveReload.js`, the
`.jsonl` tail from `Tail.js`, `eval`/`hello` from `Tab.js`, and `write`/`ls`/`rm`
from `Runtime.js` — four `Socket` plugins over the one WebSocket.

The browser→server file commands (`write`, `ls`, `rm`) are no longer the dead half
they once were: `FileSaver` (persistence for [Saver](/framework/ext/Saver/),
[editor](/framework/ext/editor/), [Panel](/framework/ext/Panel/)) and
[DesignTool audit](/framework/ext/DesignTool/audit/)'s `twin.js` both call in — each
spelling its own `rpc("rm", …)` / `async_rpc("write", …)` rather than the `write()`
/ `rm()` / `ls()` wrapper methods on the class, which stay callers-zero.

## Honest limits

- **`eval` gives up after 10s.** If the tab does not answer within ten seconds
  (`Tab.js`), the call resolves `{ error: "the tab did not answer in 10s" }` and a
  late reply is dropped. `eval()` also **never throws** — every failure path replies
  `{ error }` instead, because `message()` has no `catch` and one escape would kill
  frame dispatch for the life of the page.
- **`hello` staleness self-heals only through `eval`.** A tab that navigated with no
  `navigated()` hook reports its stale connect-time page to `pages` until the next
  `eval` re-announces it.
- **`pages` shows only tabs that have said `hello`.** A socket that connected but has
  not announced a page — the instant before `open()`'s `hello`, or a non-browser ws
  client — is invisible to `pages` (`MCP.tabs()` filters on `tab.page`).
- **`shot` photographs a fresh load, not the live tab.** It launches headless
  chromium and `goto`s the url (`Shot.js`), so unsaved DOM state, an open panel, a
  scroll position — none of it is in the png. Reach for `eval` for anything that is
  not pixels.
- **A brand-new directory can miss its second event** — see below.

## ⚠ A brand-new directory can miss its second event

Observed once, on 2026-08-15, and worth writing down because nothing about it fails
loudly. A subscription was standing on `…/verify-probe/task.jsonl`, a path whose
**directory had never existed**. Creating the file streamed its first line; the next
append streamed nothing, and deleting the file sent no `jsonl_reset` either. The
subscription was alive, the file was growing, and the browser sat on the one line it
had.

The reading: chokidar registers a watcher for a new directory asynchronously, and
the `add` for a file written immediately after `mkdir` can arrive from the parent
directory's scan while the new directory's own watcher never lands. Nothing in this
protocol is implicated — the same sequence in a directory that already existed has
never missed. **Not reproduced since**, in 28 attempts across three variants. So it
is documented rather than patched: a speculative watcher re-add could not be tested
against a failure nobody can summon.

**The symptom, and the recovery.** A task dir created mid-session whose log shows up
once and then stops is this, not a protocol bug. Reload the page — a fresh
`subscribe` replays from `0` and everything written in the gap arrives at once.
