# Reconnecting without a storm

Restarting `node server.js` is routine. The socket has to come back on its own,
and it has to not make things worse while the server is down.

```js
const delay = Math.min(250 * 2 ** this.fails++, 10000);
```

250ms, 500ms, 1s, 2s, 4s, 8s, 10s, 10s… `fails` is reset by `open()`, so a
connection that survives and later drops starts over at 250ms rather than
continuing an old escalation.

## Two events, one action

A failed connect fires `error` **and then** `close`. The first version
reconnected from both, which meant every failure scheduled *two* attempts, each
of which failed and scheduled two more.

```js
this.ws.addEventListener("close", () => this.reconnect());
this.ws.addEventListener("error", () => console.warn("Socket error."));
```

`Socket.js:60-61`. **When two events always arrive together, only one of them
may act.** That rule is worth more than the backoff curve — the curve slows a
storm down, the single path stops one starting.

`clearTimeout(this.retry)` at the top of `connect()` and the
`if (this.disabled || this.retry) return` at the top of `reconnect()` are the
same idea from the other side: one attempt in flight, ever. `close` can arrive
more than once for one socket.

## The promise swap

```js
if (this.connected) {
    this.connected = false;
    this.ready = promise();
}
```

`Socket.js:76`. Two rules, both silent when broken:

**Never reject `ready`.** A `send()` awaiting it during a restart should land
when the server returns. A rejection makes every later send throw for the life
of the page, and surfaces as an unhandled rejection from a line that reads as
fire-and-forget.

**Only replace it if it resolved.** Replacing a still-pending promise strands
everything already awaiting the old one — a hang with an empty console. The
guard reads `connected` because that flag is true exactly when `ready` has been
resolved.

## What this is not

No jitter, no attempt cap, no `onreconnect` hook, no outbox. This is one browser
tab talking to one local server that you started yourself; a thundering herd
needs more than one member.

A production socket would want all four, plus an ack per frame. That is a
different class with a different name — this one is gated to localhost
([localhost](/framework/dev/Socket/docs/localhost/)) and should stay small
enough to read in one sitting.

The `console.warn` on every attempt is deliberate noise. A socket quietly
retrying forever against a server you forgot to start is indistinguishable from
a socket that works.
