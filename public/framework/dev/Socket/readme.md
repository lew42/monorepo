# Socket — one WebSocket to the dev server; the transport every dev-only feature rides (reload, CSS hot-swap, RPC, MCP eval, JSONL streams)

> **⚠ Converge (the owner, 2026-10-02):** file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [ext/filesystem](/framework/ext/filesystem/) (`FsFile`, `FsDir` → `Dir`), [ext/files](/framework/ext/files/) (the tree UI), [ext/JSONL](/framework/ext/JSONL/), and about 15 direct `Socket` `"append"`/`"write"` calls. Before adding to any of them, consider consolidating: ONE file object (`FsFile`: `read`, `write`, `append`, and a `store` for .jsonl) as the only caller of the dev socket. Logs are appended one line at a time, never rewritten. A `LiveList`'s change events are both the view update and the line that gets appended. Design: [page-item-design.md](/framework/ai/sessions/2026/09/30/proposal-flow/page-item-design.md).

## Use

```js
new App({ socket: Socket.singleton() });   // public/app.js — the one call site; nothing else news a Socket
```

## Watch out

- Tries every host (`wss` on https); the server decides: loopback gets everything, a private LAN peer push traffic and read-only queries (`LAN_OK`, `LAN_QUERY`), a socket relayed by the site gateway the same plus `append` (one JSONL line),  anything else is refused and the client retries quietly. [doc/lan.md](./doc/lan.md) Production stays static: with no server behind it the socket never opens. [doc/localhost.md](./doc/localhost.md)
- Never reject `.ready` — a `send()` awaiting a server restart must land, not throw; a rejected `ready` breaks every later `send()` for the life of the page. [doc/backoff.md](./doc/backoff.md)
- Reconnect from `close` only — a failed connect fires `error` *and* `close`; acting on both made a connection storm. [doc/backoff.md](./doc/backoff.md)
- `reload()`, `changed()`, `eval()` are called BY the server through `message()` — a grep finds no callers; they are the live path, not dead code. [doc/wire.md](./doc/wire.md)
- `tab()` is this tab's address, minted in `sessionStorage` and carried by every `hello` — a url path is NOT an address, and two windows on one page used to be indistinguishable. [doc/wire.md](./doc/wire.md)
- `eval()` must never throw — `message()` has no `catch`, so one escape kills frame dispatch (reloads included); reply `{ error }` instead. [doc/method/eval.md](./doc/method/eval.md)
- The dev server runs arbitrary JS in this tab — two gates must both hold: localhost-only here, loopback-only `POST /mcp` in `Server/plugins/MCP.js`. Widening either is a production change. [doc/localhost.md](./doc/localhost.md)
- A changed **data** file (`.json` `.jsonl` `.md` `.txt` `.csv` the tab *fetched*) fires `socket.on("data", path)` instead of reloading — that one rule removed 203 of the 215 reloads an AI-board tab took on 2026-09-22, nearly all of them `directory.json`. [doc/method/changed.md](./doc/method/changed.md)
- A reload that IS needed stashes the reader's place first — scroll, open `<details>`, the field being typed in — and puts it back. ⚠ `window.scrollY` is always 0 on this site; `.pages` is the scroller. [doc/method/changed.md](./doc/method/changed.md)
- `window.$BLOCKRELOAD` is per-tab, remembered in `sessionStorage`, and now only stops the *reload* — CSS swaps and data events still run while blocked, and each refusal is counted. Not the same thing as the server-side hold. [doc/method/changed.md](./doc/method/changed.md)
- `changed()` leans on `performance.setResourceTimingBufferSize(100000)` in `/app.js` — delete it and a long-lived tab silently stops reloading. [doc/method/changed.md](./doc/method/changed.md)
- The CSS hot-swap mutates the *existing* `<link>` — replacing the element re-registers its `@layer` names last and inverts every override on the site. [doc/method/changed.md](./doc/method/changed.md)
- `.jsonl` files stream, never reload — a page that does not call `JSONL.live()` sits stale while the file grows. [doc/wire.md](./doc/wire.md)
- `hold()` is called BY the server too, like `reload()`/`changed()` — it only stores the holder list and fires a `dev-hold` window event; it never blocks a reload itself (the server simply stops calling `changed()`/`reload()` while held). [doc/method/hold.md](./doc/method/hold.md)
- `mark_stale()` shows a fixed "This page is out of date — reload" pill when a reload was refused (Block) or postponed (mic busy). One click reloads. A postponed reload (mic busy) does reload by itself once the page has been quiet for `QUIET_MS` (30 s, `Socket.js:19`), never sooner. Before any reload `stash()` emits a `stash` event (`:263`) so a view can add what it needs back (the AI sheet: its size), and the new page reads it once as `socket.restored` (`:276`). Cause it fixes: a refused/deferred reload left old code on screen with no sign.
- `window.$BLOCKRELOAD` never affected `.jsonl` streaming — a real 2026-09-19 bug that LOOKED like it did was `ext/JSONL/live.js` keying its stream registry by whatever url a caller passed (`import.meta.resolve()` returns one WITH an origin; the server's replies never carry one), so the subscribe reply never matched and the reader silently went deaf after one fallback fetch. Fixed in `live.js` and defensively in `Server/plugins/SocketServer/Tail.js`.
- Editing `public/index.html` reloads nothing — it is a navigation entry, not a resource entry. Hard-reload by hand. [doc/method/changed.md](./doc/method/changed.md)
- `reconnect()` never reloads the page by itself, only on disconnect — it only retries with backoff. A restart used to look like the page died because nothing said otherwise; `show_reconnecting()`/`hide_reconnecting()` now put a small fixed strip up once the socket has been down 5 s (a short blip never shows it) and take it down the moment `open()` fires. [doc/backoff.md](./doc/backoff.md)

## More

- [/framework/ai/sessions/2026/09/22/f875ec48-d91a-4890-b15f-db197b55aa13/reload-rethink/](/framework/ai/sessions/2026/09/22/f875ec48-d91a-4890-b15f-db197b55aa13/reload-rethink/) — why `changed()` grew a `data` branch: the day it reloaded 215 times, what still needs a reload and why
- [/framework/dev/Socket/](/framework/dev/Socket/) — the page: guard, server-calls-you, what a save does
- [doc/decisions.md](./doc/decisions.md) — the record: who uses this, the singleton, the reconnect storm, three proposed cuts (none applied)
- [doc/lan.md](./doc/lan.md) — a phone on the LAN gets reload and tails, never commands
- [doc/localhost.md](./doc/localhost.md) — the gate is inside the socket, and why
- [doc/backoff.md](./doc/backoff.md) — reconnecting without a storm
- [doc/wire.md](./doc/wire.md) — the whole protocol, both directions: Claude → `POST /mcp` → frame → tab
- [/framework/core/Item/doc/transport.md](/framework/core/Item/doc/transport.md) — how an item's line travels over this socket: numbered `append`, the ack, the resend after a reconnect, the catch-up (the server half: `Server/plugins/SocketServer/readme.md`)
- Tests: `node Server/plugins/SocketServer/Tail.test.mjs` (one offset per socket: no lost update, no double apply)
- Files: `Socket.js` (the class), `/app.js` (the one caller), `Server/plugins/SocketServer/` (the other end)

- Notes: [doc/Socket-notes.md](doc/Socket-notes.md) — history and lessons moved out of the code comments.
