## Usage

**No direct caller** — this one stays internal by design, since `disabled` and
`ready` both have to be checked before a frame goes out. Inside the class it
is what `rpc()` (`Socket.js:125`) and `request()` (`Socket.js:115`) are built
from, and both of *those* now have real callers: `FileSaver` and
`DesignTool/audit/twin.js` (see [wire](/framework/dev/Socket/doc/wire/)). So
this method runs on every save from an editor, even though nothing names it
directly.

The live traffic on this socket also goes the other way: the server calls
[`message()`](/framework/dev/Socket/api/message/), which calls
[`reload()`](/framework/dev/Socket/api/reload/).

## Necessity

No longer purely theoretical. It is the correct shape for the job, and the job
has arrived — see [wire](/framework/dev/Socket/doc/wire/) for the accounting
and the readme's `## Proposed` for what to do about the surrounding names.

The two lines it *does* have are both load-bearing the moment anything calls it:

**`if (this.disabled) return`** — off localhost this no-ops instead of throwing
on a `ws` that was never constructed. Without it, the localhost gate would only
be half a gate: nothing would connect, and every send would still crash.

**`await this.ready`** — a send issued before the handshake completes, or during
a reconnect, is *parked* rather than lost. This is exactly why `reconnect()`
must never reject that promise: a rejection here would surface as an unhandled
rejection from a line that looks like fire-and-forget.

## Simplicity

Right-sized — a guard, an await, a `JSON.stringify`. There is no queue, no
buffering and no delivery guarantee beyond "the promise resolved, so the socket
was open when we wrote"; a socket that closes between the await and the `send`
throws, and the caller sees it.

That is the correct amount of machinery for a dev tool. A production socket
would want an outbox and an ack, and that is a different class.
