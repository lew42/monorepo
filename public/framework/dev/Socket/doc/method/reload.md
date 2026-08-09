## Usage

**Zero callers in `public/`, and it is the only method here that actually
runs.** It is invoked by name, from the server:

- `Server/plugins/SocketServer/LiveReload.js:32` — `socket.rpc("reload")`, for
  every connected socket, whenever chokidar reports a change under `public/`.
- `Socket.js:94` — `this[data.method](...data.args)`, the line that turns that
  frame into this call.

That is the whole live-reload feature. A grep for `.reload()` finds nothing,
which is why this page exists.

## Necessity

Essential — it *is* the dev tier. Everything else in this class is transport for
this one method.

`window.$BLOCKRELOAD` is the escape hatch, and it earns its place: a save while
you are mid-way through a form, a drag, or a console session destroys the state
you were about to inspect. Setting `window.$BLOCKRELOAD = true` from devtools
suspends reloading without stopping the server or the socket.

## Simplicity

Two lines, and right-sized. It does not preserve scroll, diff modules, or
hot-swap anything — a full `location.reload()` is correct for a framework with
**no build step**: every module is a real file the browser already knows how to
re-fetch, so a reload is already the fast path.

One wart: `$BLOCKRELOAD` is a global with a shouty name and no documentation
outside this page. It is read here and set nowhere in the repo. Either it is
API — in which case it belongs on the socket as `socket.blocked` — or it is a
console convenience, which is what it is. Left alone; a property would tempt
someone to build a UI for it.
