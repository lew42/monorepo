## Usage

**No direct caller in `public/`, but no longer unreached either.** Inside the
class, `ls()` (`Socket.js:129`) and `rm()` (`Socket.js:145`) wrap it and still
have no caller of their own. `async_rpc()` (`Socket.js:121`) also wraps it —
and `async_rpc()` **is** called for real, by `FileSaver.write()`
(`ext/Saver/FileSaver.js:23`) and `DesignTool/audit/twin.js`'s `accept()`. So a
`write` frame built by this method now leaves the browser from two live
features: [Saver](/framework/ext/Saver/) (and its `editor`/`Panel` consumers)
and [DesignTool audit](/framework/ext/DesignTool/audit/).

The server half that would answer it is now wired in:
`Server/plugins/SocketServer/Runtime.js:20-23` registers `rpc:write`, `rpc:ls`
and `rpc:rm` handlers, and `server.js` reads `DevSocket.Socket.use(Runtime);`
— uncommented 2026-08-15, the same day this page was written. See
[wire](/framework/dev/Socket/doc/wire/) for the full accounting; this audit
did not start the dev server to confirm a round trip completes.

## Necessity

No longer purely theoretical. It is the ask-and-wait half of the protocol, and
the mechanism is sound: a resolver is pushed onto `this.requests`, its **array
index becomes the correlation id**, and the server echoes that index back on
the reply (`Runtime.js:42` — `this.socket.send({ response: files, index })`).

Using the array index as the id is a genuinely nice trick — no counter to keep
in sync with the array, and `message()`'s lookup is a subscript. It is also
where the module's one real leak lives: nothing ever removes a resolved
resolver, so `requests` grows for the life of the page.

## Simplicity

Right-sized as written, but note the ordering, which is subtle and correct:

```js
let response = new Promise(resolve => { obj.index = this.requests.push(resolve) - 1; });
await this.send(obj);
return response;
```

The promise executor runs **synchronously**, so `obj.index` is assigned before
`send()` serialises the object. Reordering these two lines — the obvious tidy —
would ship a frame with no `index` and hang every caller.

`async_rpc(method, ...args)` is a second name for `request({ method, args })` and
adds nothing; the readme proposes deleting it.
