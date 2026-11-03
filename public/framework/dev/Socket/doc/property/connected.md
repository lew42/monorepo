Whether the handshake has completed **and** `ready` has been resolved. The two
are the same fact, which is the only reason this property is not redundant.

## Usage

- `Socket.js:33` — initialised to `false`.
- `Socket.js:65` — set `true` by `open()`.
- `Socket.js:76` — read by `reconnect()`, then set back to `false`.

Three lines, all inside this class. Nothing outside reads it.

## Necessity

Essential, for exactly one job: telling `reconnect()` whether the current
`ready` promise has been settled. Replacing a still-pending promise strands
every awaiting caller on an object nothing will ever resolve, so `reconnect()`
must know — and a promise cannot be asked its own state.

`this.ws.readyState === WebSocket.OPEN` looks like the same information and is
not. It reports the *socket*; this reports whether **we told anyone**. On the
disabled branch `ready` is resolved with no `ws` in existence at all, and the
first `close` after a failed initial connect must not swap a promise that was
never resolved.

## Simplicity

Right-sized — a boolean read once. The name is the honest one for what
`reconnect()` asks, even though *"has `ready` settled"* is the literal question;
`ready_settled` would be more precise and would read as internal plumbing on a
class whose whole surface is four public names.

It is deliberately **not** exposed as a UI signal. Connection state has no
indicator anywhere in the framework — the console lines from `open()` and
`reconnect()` are the entire report, which is right for a tool that only ever
runs on your own machine.
