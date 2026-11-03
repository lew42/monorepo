## Usage

Two callers, both inside this class:

- `Socket.js:40` — `initialize()`, on the localhost branch.
- `Socket.js:84` — `reconnect()`, after the backoff timer fires.

## Necessity

Essential — it is the only place a `WebSocket` is constructed. Four listeners,
and the interesting part is that there are **four events and only three
behaviours**:

| event | what it does |
|---|---|
| `open` | `open()` — resolve `ready`, reset the failure count |
| `message` | `message()` — route the frame |
| `close` | `reconnect()` |
| `error` | `console.warn` and **nothing else** |

A failed connect fires `error` **and then** `close`. Acting on both turned a
stopped dev server into a connection storm: two reconnects per failure, doubling
every round. So `close` is the single reconnect path and `error` only reports.
The rule generalises — **when two events always arrive together, only one of
them may act.**

`clearTimeout(this.retry)` at the top makes the method idempotent from the
outside: calling it while a retry is pending cancels the retry rather than
racing it, so only one attempt is ever in flight.

## Simplicity

Right-sized. The `if (this.disabled) return` guard is redundant today — the only
two callers are already inside the gate — but it makes `socket.connect()` from
the console a no-op on production rather than the one line that defeats the
whole constraint.

The url is derived, never configured: `protocol` from `location.protocol`
(`Socket.js:30`) and host from `location.host`, so the socket always talks to
the server that served the page. There is no `url:` option, and adding one would
be the first way to point a dev socket somewhere it should not go.
