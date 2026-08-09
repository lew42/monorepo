# Socket — design record

One WebSocket to the dev server. Live reload is the only thing it does in the
shipped configuration; everything else is machinery waiting for a caller.

```js
new App({ socket: Socket.singleton() });   // public/app.js:25
```

## Decisions

**Where does the localhost check live — the call site, or the class?** In the
class (`Socket.js:39`). A call site check means every site that adopts this
writes an environment branch, and every one of them writes it slightly
differently; the day one gets it wrong, production opens a WebSocket to a host
that has no server. Inside, the check runs once and `disabled` short-circuits
`send()` and `request()` (`Socket.js:104`, `Socket.js:110`) so no caller needs a
second guard. **Verdict: in the class**, and it is a constraint rather than a
preference — production is static hosting.

**Reconnect from `error`, from `close`, or both?** A failed connect fires
**both**, in that order. Reconnecting from each turned a stopped dev server into
a connection storm. `close` is the single reconnect path and `error` only logs
(`Socket.js:60`, `Socket.js:61`). **Verdict: one path.** The rule generalises —
when two events always arrive together, only one of them may act.

**Reject `ready` on disconnect, or leave it pending?** Leave it pending. A
`send()` awaiting `ready` while `node server.js` restarts should *land when the
server is back*, not throw — restarting the server is routine. `reconnect()`
only swaps in a fresh promise when the old one had resolved (`Socket.js:76`),
because replacing a still-pending promise strands everything already awaiting
it on a promise nothing will ever settle. **Verdict: never reject.**

**`singleton()`, not `new Socket()` per caller.** One document wants one
connection; a second instance means a second watcher subscription server-side
and two reloads per save. It is a static rather than a module-level `const` so
importing the module opens nothing — `public/app.js:25` is the edge that
connects. Kept: the constructor is still public, because a test wants to build
one without touching the singleton.

**`assign()`-based, like every class here.** `constructor(...args)` →
`assign(...args)` → `initialize()`. Documented once in the
[code-architecture skill](/framework/); not repeated as a member page.

## Traps

- **⚠ Never reject `.ready`** — see above. A rejected `ready` makes every later
  `send()` throw for the life of the page.
- **⚠ `reload()` is called BY the server**, through `message()`'s method lookup
  (`Socket.js:94`). Nothing in `public/` calls it, so a grep for callers finds
  none and it looks dead. It is the one live path.
- **⚠ The gate is part of static compatibility.** `CLAUDE.md` lists it as a hard
  constraint. Widening it — a query flag, an env token — is a production change
  disguised as a dev convenience.

## Proposed

Findings from the every-member audit. **None applied.**

### 1. The whole client → server half has no caller

`send`, `request`, `rpc`, `async_rpc`, `ls`, `rm`, `write`, `cmd`, `log` —
zero call sites in `public/`, sandboxes included. The server side that answers
them exists (`Server/plugins/SocketServer/Runtime.js:20-23`) and is **commented
out of the running server**: `server.js:6` reads
`// DevSocket.Socket.use(Runtime);`. So the feature is off at both ends.

| | keep | delete |
|---|---|---|
| the editor this was built for | not written; `ext/highlight/editor.md` is still a spec | — |
| `Runtime.js` answers `write`/`ls`/`rm` today | uncomment one line and it works | the line has been commented for the life of this repo |
| `async_rpc` vs `request` | — | two names for one call; `async_rpc(m, a)` **is** `request({method, args})` |
| `cmd()` and `log()` | server-callable, like `reload` | both just `console.log` — the server could send `log` and get the same result from one method |

*Options:* (a) keep all of it; (b) delete `async_rpc`, `cmd`, `log` and keep the
`send`/`request`/`rpc`/`ls`/`rm`/`write` set; (c) reduce to `send`/`request`/`rpc`
and let a caller spell its own `rpc("ls", dir)`.

*Weighing:* (a) leaves nine methods that are a claim nothing can check. (c) is
the smallest honest surface — `ls`/`rm`/`write` are three one-liners that save
nine characters each and pin three server method names into a browser class.
(b) splits the difference and keeps the convenience of the three that a future
editor would actually reach for.

**Recommendation: (c)**, plus uncomment `server.js:6` or delete `Runtime.js`.
The current state — a client half and a server half that both exist and are
never connected — is the one arrangement that teaches a reader something false.

### 2. `disabled` is undefined until it is true

`initialize()` sets `this.disabled = true` on the non-localhost branch only
(`Socket.js:42`), so on localhost the property is `undefined` rather than
`false`. Every read is `if (this.disabled)`, so nothing misbehaves — but
`socket.disabled === false` is never true, which is a surprising answer from the
console.

*Options:* (a) leave it; (b) `this.disabled = false` in the defaults block
beside `connected`.

**Recommendation: (b).** One line, and it makes the property honest to read.

### 3. `promise()` is a deferred, and it is local

The `promise()` helper at the top of `Socket.js` attaches `.resolve`/`.reject`
to a promise. `View`/`App` have their own resolve-later needs (`app.ready`,
`styles_loaded`). *Options:* (a) leave it here — one caller, one file;
(b) move it to `util/`. **Recommendation: (a)** until a second caller exists;
`util/`'s stated bar is *two callers that must agree*, and this is one.
`Promise.withResolvers()` is now baseline and replaces the helper outright —
worth doing the day the browser floor allows it.
