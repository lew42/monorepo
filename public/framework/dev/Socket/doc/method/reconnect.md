## Usage

One caller: the `close` listener in `connect()` (`Socket.js:60`). Restarting
`node server.js` is routine, so this runs several times an hour during ordinary
work.

## Necessity

Essential. Without it a dev server restart costs a manual browser reload — which
is the exact chore live reload exists to remove.

Three decisions are packed into eight lines, and each one is a bug that was
fixed:

**`if (this.disabled || this.retry) return`** — one attempt in flight. `close`
can arrive more than once for one socket, and each would have started its own
timer.

**Never reject `ready`.** A `send()` awaiting `ready` while the server restarts
should *land when it comes back*, not throw. A rejected promise would make every
later send throw for the life of the page.

**Only swap in a fresh `ready` if the old one resolved** (`Socket.js:76`).
Replacing a still-pending promise strands everything already awaiting it on an
object nothing will ever settle — a hang with an empty console. `connected` is
the test, because it is true exactly when `ready` has been resolved.

## Simplicity

Right-sized. The backoff is one expression:

```js
const delay = Math.min(250 * 2 ** this.fails++, 10000);
```

250ms, 500ms, 1s, 2s … capped at 10s. No jitter, no max-attempts, no
`onreconnect` hook — this is one browser tab talking to one local server, not a
client fleet against a load balancer. The physics, and what a production socket
would need instead, are in [backoff](/framework/dev/Socket/doc/backoff/).

The `console.warn` per attempt is deliberate noise: a socket quietly retrying
forever against a server you forgot to start is indistinguishable from a socket
that works.
