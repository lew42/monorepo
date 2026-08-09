## Usage

One caller: the `message` listener in `connect()` (`Socket.js:55`). Every frame
the server sends arrives here.

## Necessity

Essential — it is the whole protocol. Two shapes, and the first test decides:

| frame | route |
|---|---|
| `{ index, response }` | resolve the pending `request()` at that index |
| `{ method, args }` | **call that method on `this`** |

The second row is why `reload()` looks dead to a grep: nothing in `public/`
calls it. `Server/plugins/SocketServer/LiveReload.js:32` sends
`{ method: "reload" }` and this line invokes it. **The server calls a method on
your instance** — that is the design, and it is the only live path in the
module.

`if (this[data.method])` is the entire safety model, and it is honest about what
it is: any method on the socket is reachable by the server. That is acceptable
because the server is `node server.js` on your own machine and the gate at
`Socket.js:39` means no other server can ever be on the other end. It would not
be acceptable one inch outside that.

## Simplicity

Right-sized for what it does, with two sharp edges worth naming.

**`data?.index in this.requests`** uses `in` against an array, so it is asking
*"is there a pending resolver at that slot"*. It works, and it reads as a set
membership test. `this.requests[data.index]` with a truthiness check would say
the same thing more plainly.

**`requests` only ever grows** (`Socket.js:113` pushes, nothing splices), so a
long session with many `request()` calls keeps every resolved resolver alive.
Measured as nothing today, because nothing calls `request()` — see
[wire](/framework/dev/Socket/docs/wire/). It is a real leak the moment something does.
