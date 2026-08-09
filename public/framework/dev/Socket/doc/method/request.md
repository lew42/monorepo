## Usage

**No caller in `public/`.** Inside the class, `ls()` (`Socket.js:129`),
`rm()` (`Socket.js:145`) and `async_rpc()` (`Socket.js:121`) all wrap it — and
none of those three has a caller either.

The server half that would answer it exists and is **switched off**:
`Server/plugins/SocketServer/Runtime.js:20-23` registers `rpc:write`, `rpc:ls`
and `rpc:rm` handlers, and `server.js:6` reads
`// DevSocket.Socket.use(Runtime);`.

## Necessity

Currently unexercised. It is the ask-and-wait half of the protocol, and the
mechanism is sound: a resolver is pushed onto `this.requests`, its **array index
becomes the correlation id**, and the server echoes that index back on the reply
(`Runtime.js:42` — `this.socket.send({ response: files, index })`).

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
