## Usage

One caller: the `open` listener wired in `connect()` (`Socket.js:54`). Never
called directly.

## Necessity

Essential, and it is three lines of state that three other methods depend on:

- `connected = true` — read by `reconnect()` (`Socket.js:76`) to decide whether
  the pending `ready` promise may be replaced.
- `fails = 0` — resets the backoff, so a connection that survives and later
  drops retries at 250ms rather than continuing an old escalation.
- `ready.resolve()` — releases everything parked in `send()` (`Socket.js:105`).

The green console line is not decoration. Live reload has no UI at all, so
"connected" and "closed, reconnecting in 500ms" are the only feedback that the
dev loop is alive; when the fans spin up and saves stop reloading, this is the
line you look for.

## Simplicity

Right-sized — three assignments and a log, and each one is read somewhere else
in the file. Nothing to remove.

Resetting `fails` **here** rather than in `reconnect()` is the correct side: a
successful connection is the only evidence that the previous failures are over.
Resetting on the attempt instead would make a server that accepts and instantly
drops retry at 250ms forever.
