The localhost gate's answer, cached. **`true` means this document will never
open a connection.**

## Usage

- `Socket.js:42` — set, on the non-localhost branch of `initialize()`.
- `Socket.js:47` — `connect()` returns early.
- `Socket.js:72` — `reconnect()` returns early.
- `Socket.js:104`, `Socket.js:110` — `send()` and `request()` no-op.

## Necessity

Essential. It is what makes `socket: Socket.singleton()` in `public/app.js:25`
safe to write unconditionally — the one line in the framework that would
otherwise force every adopting site to write an environment check.

Four guards rather than one because there are four ways in: two internal
(`connect`, `reconnect`) and two public (`send`, `request`). Off localhost each
must be inert on its own; a single guard at the top of `initialize()` would stop
the *first* connection and leave a console call or a stray `connect()` able to
defeat the constraint.

## Simplicity

Right-sized, with one finding: it is **only ever set to `true`**. On localhost
the property is never assigned, so it reads `undefined` rather than `false`.
Every consumer writes `if (this.disabled)`, so nothing misbehaves — but
`socket.disabled === false` is never true, which is a surprising answer from a
console. One line in the defaults block fixes it; recorded in the readme's
`## Proposed`.

There is no setter and no way to re-enable. That is deliberate: the gate is part
of static compatibility, not a preference, and a `socket.disabled = false` that
worked would be the first step toward shipping a WebSocket to production.
