# `live.js`

The browser half of the `.jsonl` wire protocol: it patches `Socket` with the two
methods the dev server calls (`jsonl`, `jsonl_reset`), keeps the registry of who
is reading what, and exports `stream()` — the engine behind
[`JSONL.live()`](/framework/ext/JSONL/api/live/). The whole design record is
[live](/framework/ext/JSONL/doc/live/); this page is what the file itself is for.

## An ext patching core, visibly

`Socket.prototype.jsonl = function(…)` at module scope is the same shape
[`ext/Ask`](/framework/ext/Ask/) uses for `ask_event`, and it has the same
property: **nothing in `public/` calls these methods.** They are invoked by the
dev server, through `Socket.message()`'s method lookup, so a grep for callers
finds none and the ⚠ comment above them is the only warning a reader gets.

`Socket.prototype.open` is *chained*, not replaced — the original is kept in a
`const` and called first. Replacing it would drop the connect log and the `ready`
resolution, and the re-subscribe has to happen after both.

**⚠ It re-subscribes only the streams that have already answered.** A subscribe
sent while the socket was still connecting is parked on `Socket.ready`, and that
parked send flushes at this very `open()` — so re-subscribing a stream still
waiting for its first frame meant every board load replayed all of its files
twice. Measured on the day board: 30 subscribe frames and 30 replays for 15 files
before the guard, 15 and 15 after. `s.first` is the test — still set means "its
subscribe is already in flight", and a stream that HAS answered still re-subscribes
from its stored offset, which is the whole point of chaining `open()`.

## `stream()` resolves once, then calls back

One promise, resolved by the first frame the server sends — `jsonl` **or**
`jsonl_reset`, either settles it, and a missing file answers an *empty* `jsonl`
frame, so the promise cannot hang on a 404. Afterwards each frame
calls `changed(jsonl)`. Splitting the two is deliberate: a renderer awaits the
promise, renders, and only then owns a callback that redraws something that
exists. Firing `changed` for the first frame would call it before the caller had
built anything to redraw.

## The 1.5s deadline

A dev server predating `Tail.js` accepts `rpc:subscribe` and answers nothing at
all, which would park the dashboard on an unresolved promise forever. The timer
unregisters the stream, warns once, and falls back to `load()`. It is a fallback
for a version skew, not for a slow file — the server answers a subscribe
synchronously from disk.

## `drop()` — the only thing that ever unsubscribes

The registry is a Set per path, so `drop(jsonl)` removes **that instance's**
subscriptions and sends the `unsubscribe` frame only when the Set empties: a board
card and an open task page read one url, and one of them leaving must not blind the
other. It settles a stream that never answered rather than clearing its timer, so
a caller awaiting `live()` can never be stranded by a drop.

Its one caller is `ext/AITask`'s legacy fallback — see
[`unsubscribe()`](/framework/ext/JSONL/api/unsubscribe/). Navigation still drops
nothing.

## Improvements

1. **No `unsubscribe` on navigation.** `drop()` exists now, but only the legacy
   probe calls it: navigating away in the SPA still leaves the stream registered
   and its callback redrawing a detached element. Harmless (re-registering the
   same path replaces the entry, so nothing accumulates across visits) and now
   cheap — the machinery is written, it wants a teardown hook to call it, and
   `Page.deactivate()` is the obvious seam. *(simple, useful)*
2. **A frame carries only its end offset.** With two readers at different offsets,
   the second one's replay-from-0 is re-applied by the first if it is mid-file —
   see the last paragraph of [live](/framework/ext/JSONL/doc/live/). A `from`
   in the `jsonl` message would close it exactly; it is a protocol change, so it
   needs the server side in the same breath. *(medium, speculative)*
3. **`WAIT` is a module constant, not an option.** Right, for now — an option is
   API surface forever, and no caller has wanted a different deadline. Recorded so
   the next reader knows it was a decision. *(n/a)*
