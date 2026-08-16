## Usage

**One real direct caller: `FileSaver.delete()`** (`ext/Saver/FileSaver.js:38`
— `socket.rpc("rm", this.path)`), reached from [Saver](/framework/ext/Saver/),
[editor](/framework/ext/editor/) and [Panel](/framework/ext/Panel/). It calls
`rpc()` straight, not through the `write()` (`Socket.js:137`) or `rm()`
(`Socket.js:145`) wrapper methods — both of those remain callers-zero, which
is worth noting: the caller that exists spells its own method name rather
than reaching for the convenience wrapper built for it.

Its mirror image on the server is live, and is worth reading as the shape this
one would take: `Server/plugins/SocketServer/LiveReload.js:32` calls
`socket.rpc("reload")` on every watching socket when a file under `public/`
changes. Same frame, same idea, opposite direction.

## Necessity

No longer purely theoretical — see above. It is the fire-and-forget half —
send `{ method, args }` and never look back — and it is the right default of
the two: most of what a browser would tell a dev server ("I saved this file",
"log this") wants no answer, and a `request()` that nobody awaits is a
resolver leaked into `this.requests` forever.

## Simplicity

As small as it can be: one line, no `await`, no return value. It deliberately
does **not** return the `send()` promise, so `rpc()` can never be mistaken for
something you wait on — the async version has a different name.

The missing semicolon on `this.send({ method, args })` is the only blemish in
the file. ASI covers it; it is noted here so nobody assumes it means something.

`rpc` / `async_rpc` / `request` / `send` is four names for two behaviours. The
readme's `## Proposed` argues for keeping `send`, `request` and `rpc`, dropping
`async_rpc`, and letting callers spell `rpc("ls", dir)` rather than shipping a
one-line wrapper per server method.
