# The frame, and the half that never runs

Every frame is JSON, and there are exactly two shapes. `message()`
(`Socket.js:87`) tells them apart with one test.

| shape | means | handled by |
|---|---|---|
| `{ index, response }` | a reply to a `request()` you sent | the resolver stored at `requests[index]` |
| `{ method, args }` | **the other side is calling a method on you** | `this[data.method](...args)` |

The correlation id is the array index the resolver was pushed to — no counter,
and the lookup is a subscript.

## The live direction: server → browser

```js
socket.rpc("reload");   // Server/plugins/SocketServer/LiveReload.js:32
```

chokidar sees a write under `public/`, the server sends `{ method: "reload" }`
to every connected socket, and `message()` invokes
[`reload()`](/framework/dev/Socket/api/reload/) on your instance. **That is the
entire shipped feature.**

It also explains why the method looks dead: nothing in `public/` calls
`.reload()`, because the caller is a Node process.

`if (this[data.method])` is the whole safety model. Any method on the socket is
reachable by whatever is on the other end — acceptable only because the gate at
`Socket.js:39` guarantees the other end is `node server.js` on your own machine.

## The dead direction: browser → server

`send`, `request`, `rpc`, `async_rpc`, and the `ls` / `rm` / `write` / `cmd` /
`log` wrappers over them. **Zero callers in `public/`**, sandboxes included.

The server half exists and is switched off:

```js
// server.js:6
// DevSocket.Socket.use(Runtime);
```

`Server/plugins/SocketServer/Runtime.js:20-23` registers `rpc:write`, `rpc:ls`
and `rpc:rm` handlers; without that `use()` line they are never installed. So
the feature is off at **both** ends — a client half and a server half that both
exist and have never been connected.

## What it was for

An in-browser editor: read a file, edit it, write it back. The MVP spec is still
`framework/ext/highlight/editor.md`, and it is the only thing that has ever
wanted `write()`. Until it exists, this half is a claim nothing can check.

The readme's `## Proposed` puts the options side by side. The short version:
`async_rpc` is a second name for `request`, `ls` / `rm` / `write` are one-line
wrappers that save nine characters each and pin three server method names into a
browser class, and the honest minimum is `send` / `request` / `rpc` with callers
spelling their own `rpc("ls", dir)`.

Whatever is decided, the current arrangement is the one that teaches a reader
something false.
