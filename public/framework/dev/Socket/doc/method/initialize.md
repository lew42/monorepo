## Usage

Called once, by the constructor (`Socket.js:22`). Never called again — a
reconnect goes through `connect()`, which reuses everything set here.

It does two things: install the defaults, and **decide whether this document
talks to a server at all**.

```js
if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost"))
    this.connect();
else { this.disabled = true; this.ready.resolve(); }
```

## Necessity

Essential, and the gate is the load-bearing half. Production is static hosting
with nothing to connect to, so a socket that dialled anyway would retry on a
capped backoff forever, in every visitor's tab.

**Why here and not at the call site.** `public/app.js:25` is unconditional —
`socket: Socket.singleton()` — and that is the point. A site adopting this
framework writes no environment check, and cannot write one wrong. See
[localhost](/framework/dev/Socket/docs/localhost/) for the full argument and what it forbids.

`this.ready.resolve()` on the disabled branch is not cosmetic: `send()` awaits
`ready` (`Socket.js:105`), so a permanently pending promise would park every
caller forever instead of no-oping.

## Simplicity

Right-sized, with one finding. The defaults block sets `connected = false` but
leaves `disabled` **unset** on the localhost path, so `socket.disabled` reads
`undefined` rather than `false`. Every consumer writes `if (this.disabled)`, so
nothing misbehaves — but it is a surprising answer from the console, and one
line fixes it. Recorded in the readme's `## Proposed`.

The `.localhost` suffix test is deliberate: `myapp.localhost` resolves to the
loopback in every modern browser and is how a multi-site dev setup is spelled.
