# Live — a log that streams instead of reloading

`load()` fetches the file once. `live()` subscribes to it on the dev server, so
every appended line arrives on the socket and the reader redraws — no reload, no
poll. It is the browser half of the `.jsonl` wire protocol; the server half is
[`Server/plugins/SocketServer/Tail.js`](/framework/dev/Socket/), and the protocol
itself is written down in `dev/Socket/doc/wire.md`.

The motivation was noise: an append to any `.jsonl` used to reload every open tab,
which during a parallel fan-out meant the board reloading every few seconds while
you were reading it.

```js
const task = new TaskJSONL({ url: "/framework/ai/2026-08-15/live-streaming/task.jsonl" });
await task.live(() => $box.empty(() => render(task)));
```

## Opt-in, with fetch as the floor

`live()` is a second door, never a default — `load()` stays exactly as it was, and
a caller that never asks keeps fetching. Off localhost `Socket` is `disabled`, and
`live()` *is* `load()`: the site is statically hosted in production and nothing
here may depend on a server. The same fallback covers a dev server too old to
answer — a subscribe that goes unanswered for 1.5s fetches instead, because a
board that waits forever is worse than a board that stops updating.

## The offset contract

The server sends the byte offset it read up to; the client stores it on the
instance and echoes it back on re-subscribe. **Clients never compute an offset** —
a UTF-8 string's length is not its byte length, and one wrong offset splits a line
in half. `offset` is therefore an opaque token: hold it, hand it back, never do
arithmetic on it.

That token is what makes a reconnect cheap. `live.js` chain-patches
`Socket.prototype.open`, so every registered stream re-subscribes from where it
stopped when `node server.js` restarts — routine here — and only the lines written
in the gap come back.

**⚠ Only the streams that have already answered.** A subscribe sent before the
socket opened is parked on `Socket.ready` and flushes at that same `open()`, so
re-subscribing a stream still waiting for its first frame is a second subscribe for
a file that already has one in flight — which made every board load replay all 15
of its logs twice (30 frames each way, against 15 now). A stream is "in flight"
while its first-frame promise is unsettled, and that is the exact test the chained
`open()` makes.

## One path, several readers

The registry is `Map(url-path → Set)`, not one instance per path, because the day
board and an open task page read the same `task.jsonl` in one SPA session. A
single-entry map let the second reader silently freeze the first.

The Set has a consequence: a second reader's subscribe replays the file from 0 and
that frame reaches **the whole socket**, including readers already at the end. So
each stream ignores a frame whose offset it is already past. The narrow case left
open is a reader mid-file when another subscribes — it would re-apply the overlap,
because a frame carries only the offset it ends at, not the one it starts from.

## Reset means "this file is not what you think"

`jsonl_reset` arrives only for a file that had already streamed and then shrank,
was rewritten, or vanished. The reader calls
[`reset()`](/framework/ext/JSONL/api/reset/) and re-subscribes from 0 — **but
only if something had already streamed**, a guard that keeps the cycle finite:
a post-reset subscribe on a file that stays gone is answered with an *empty
`jsonl` frame*, never another reset, so reset → fresh start is one round trip,
not a loop. A file missing at subscribe time gets that same empty frame with the
subscription left standing — it streams the moment the file exists — and
`loaded` stays unset, which is exactly `load()`'s 404, so the caller can fall
back the way it always did.

`reset()` clears what the replay *appended* — `logs`, `actions`, `skipped`,
`agents`, `chats`, `loaded`. A field an `assign` line set survives, so a rewrite
that *removes* a field leaves the old value in place until reload. Append-only
logs are rewritten by hand and almost never shrink; the alternative (rebuild the
instance) would break every renderer holding a reference to it.

## Leaving a stream

Nothing unsubscribes on navigation — a stale stream redraws a detached node, which
costs nothing and accumulates nothing, since re-registering a path replaces the
entry. The one case that *does* leave is a probe for a file that will never exist:
`ext/AITask` asks every task dir for a `task.jsonl`, and a task from before the log
format answers with an empty batch and a standing subscription. Once its
`session.json` has answered instead, the reader calls
[`unsubscribe()`](/framework/ext/JSONL/api/unsubscribe/) and the server drops it.

The frame goes only when the **last** reader of that path leaves. Same reason the
registry is a Set: one url, several instances, and one of them finishing must not
blind the others.

## Why `JSONL.js` imports `live.js`, and not the other way round

Consumers change nothing but the method name — that only works if the class itself
knows the door exists. `live.js` therefore never imports `JSONL`; it reaches the
replay through the instance it was handed (`s.jsonl.parse(…)`, the instance door
that also counts unparsed lines), which keeps the imports one-directional and works
for any subclass.
