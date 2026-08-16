The only backend that talks to another module — [`dev/Socket`](/framework/dev/Socket/)
— and the only one whose write can fail for a reason outside this file's
control (no dev server, no connection, server refused). Every failure path
still ends in `false`, never a throw.

## `read_only()` is a warn-once latch

`FileSaver.warned` is a **static**, not an instance property, so the "no dev
socket" warning fires once per page load no matter how many `FileSaver`
instances exist or how many times they try to write — deliberate, because a
save-on-every-keystroke UI off localhost would otherwise fill the console on
the first idle save loop. See [backends](/framework/ext/Saver/docs/backends/)
for why FileSaver is dev-only by design, not by oversight.

## `load()` distinguishes absent from failed

Only a genuine 404 swallows to `null` — "a missing document is the normal
first run," `Saver`'s own contract. Any other bad status (500, a mid-write
partial file, whatever else the server returns) REJECTS instead, so a caller
like `ext/Panel/workspace.js` can tell "not saved yet" apart from "couldn't
check" and refuse to seed a fresh document over one it just failed to read.
A body that doesn't parse as JSON still swallows to `null` — a corrupt file
is present but unreadable, closer to "start fresh" than to a read failure.

## `delete()` is fire-and-forget

`socket.rpc("rm", this.path)` — not `async_rpc` — so the method resolves `true`
the instant the frame is sent, before the server has done anything. `true`
means *sent*, not *removed*. Recorded as open work in `readme.md`; the fix is
one `async_rpc` away, at the cost of one more awaited round trip.

## Improvements

1. **`delete()`'s `true` doesn't mean deleted.** Swap `rpc` for `async_rpc` (the
   pattern `write()` already uses two lines above it) and this file's `delete`
   would tell the truth. *(simple, useful — nothing currently calls `delete()`
   in `public/`, so nothing is wrong *yet*.)*
2. **`read_only()`'s warning names no caller.** `console.warn` says *what*
   failed but not *which* saver or *which* page constructed it — with three
   real callers now instantiating `FileSaver` (`ext/editor`, `ext/Panel`,
   `dev/DevBar`), a stack trace is the only way to tell them apart today.
   Passing `this.path` into the message (it already has one) would cost
   nothing. *(simple, useful.)*
3. **No retry, no reconnect awareness.** A socket that drops mid-write loses
   that write silently — the next `save()` recovers it if one comes, but an
   idle document does not self-heal. Named as open work in `readme.md` already;
   repeating it here because it is this file specifically that would carry the
   fix. *(large, speculative — `Socket` would need to expose "reconnected"
   for this file to hook.)*
