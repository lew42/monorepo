`Saver.prototype.writing = null`. The in-flight `drain()` promise, or `null`
when the queue is idle. Set once, in `save()` (`Saver.js:13`), cleared once, at
the end of `drain()` (`Saver.js:26`) — nowhere else touches it.

Read through [`saving()`](/framework/ext/Saver/api/saving/), never directly:
`saving()` is the honest boolean, `writing` is the mechanism that makes `save()`
idempotent while a write is running (a second call in the same tick returns the
same promise instead of starting a second `drain()`).

⚠ See the trap on [`write`](/framework/ext/Saver/api/write/) — a rejecting
`write()` used to leave `writing` permanently non-`null`. `drain()`'s
`try/finally` now clears it even on failure, so a rejected write costs one
save, not every save after it.
