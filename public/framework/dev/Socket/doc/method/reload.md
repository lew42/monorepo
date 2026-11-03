## Usage

**Zero callers in `public/`.** It is invoked by name, from the server —
`socket.rpc("reload")` in `Server/plugins/SocketServer/LiveReload.js`, landing
through `message()`'s method lookup — and, since the scoped-reload work, from
[`changed()`](/framework/dev/Socket/api/changed/) one file over, which decides
*whether* to call it.

A grep for `.reload()` used to find nothing at all, which is why this page
exists.

## Necessity

Essential — it is still what a code change ultimately does. `changed()` is the
filter in front of it, not a replacement: it answers *which tabs* and *which
files*, then calls this. The server also still sends bare `reload` frames, so
this must keep working on its own.

`window.$BLOCKRELOAD` is the escape hatch, and it earns its place: a save while
you are mid-way through a form, a drag, or a console session destroys the state
you were about to inspect. Setting `window.$BLOCKRELOAD = true` from devtools
suspends reloading without stopping the server or the socket.

## Simplicity

Two lines, and right-sized. It does not preserve scroll or diff modules — a full
`location.reload()` is correct for a framework with **no build step**: every
module is a real file the browser already knows how to re-fetch, so a reload is
already the fast path. JS hot-module-replacement is deliberately never coming;
the one thing that *is* swapped in place is a stylesheet, and that lives in
`restyle()` rather than here.

One wart: `$BLOCKRELOAD` is a global with a shouty name and no documentation
outside this page. It is read here and set nowhere in the repo. Either it is
API — in which case it belongs on the socket as `socket.blocked` — or it is a
console convenience, which is what it is. Left alone; a property would tempt
someone to build a UI for it.
