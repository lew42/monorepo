# Socket — one WebSocket to the dev server; the transport every dev-only feature rides (reload, CSS hot-swap, RPC, MCP eval, JSONL streams)

## Use

```js
new App({ socket: Socket.singleton() });   // public/app.js — the one call site; nothing else news a Socket
```

## Watch out

- Connects on localhost only, by design — that is what keeps production purely static and keeps the eval/write door shut. Suggestion, not law: a deployment that wants it live has to solve auth first (`Server/README.md`). [doc/localhost.md](./doc/localhost.md)
- Never reject `.ready` — a `send()` awaiting a server restart must land, not throw; a rejected `ready` breaks every later `send()` for the life of the page. [doc/backoff.md](./doc/backoff.md)
- Reconnect from `close` only — a failed connect fires `error` *and* `close`; acting on both made a connection storm. [doc/backoff.md](./doc/backoff.md)
- `reload()`, `changed()`, `eval()` are called BY the server through `message()` — a grep finds no callers; they are the live path, not dead code. [doc/wire.md](./doc/wire.md)
- `tab()` is this tab's address, minted in `sessionStorage` and carried by every `hello` — a url path is NOT an address, and two windows on one page used to be indistinguishable. [doc/wire.md](./doc/wire.md)
- `eval()` must never throw — `message()` has no `catch`, so one escape kills frame dispatch (reloads included); reply `{ error }` instead. [doc/method/eval.md](./doc/method/eval.md)
- The dev server runs arbitrary JS in this tab — two gates must both hold: localhost-only here, loopback-only `POST /mcp` in `Server/plugins/MCP.js`. Widening either is a production change. [doc/localhost.md](./doc/localhost.md)
- `changed()` leans on `performance.setResourceTimingBufferSize(100000)` in `/app.js` — delete it and a long-lived tab silently stops reloading. [doc/method/changed.md](./doc/method/changed.md)
- The CSS hot-swap mutates the *existing* `<link>` — replacing the element re-registers its `@layer` names last and inverts every override on the site. [doc/method/changed.md](./doc/method/changed.md)
- `.jsonl` files stream, never reload — a page that does not call `JSONL.live()` sits stale while the file grows. [doc/wire.md](./doc/wire.md)
- Editing `public/index.html` reloads nothing — it is a navigation entry, not a resource entry. Hard-reload by hand. [doc/method/changed.md](./doc/method/changed.md)

## More

- [/framework/dev/Socket/](/framework/dev/Socket/) — the page: guard, server-calls-you, what a save does
- [doc/decisions.md](./doc/decisions.md) — the record: who uses this, the singleton, the reconnect storm, three proposed cuts (none applied)
- [doc/localhost.md](./doc/localhost.md) — the gate is inside the socket, and why
- [doc/backoff.md](./doc/backoff.md) — reconnecting without a storm
- [doc/wire.md](./doc/wire.md) — the whole protocol, both directions: Claude → `POST /mcp` → frame → tab
- Files: `Socket.js` (the class), `/app.js` (the one caller), `Server/plugins/SocketServer/` (the other end)
