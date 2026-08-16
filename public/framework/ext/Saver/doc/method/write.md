The extension point. `Saver`'s own `write()` is a stub — `Promise.resolve(false)`
— and `drain()` is the only caller, always with exactly one `item` and always
`await`ed. A new backend implements only this, `load()` and `delete()`; the
queue in the base class is never touched.

**Contract a new backend must keep**: resolve `true` on success, `false` on a
handled failure (never throw — see the improvement below), and never resolve
before the item is durably stored, because `save()`'s caller is waiting on
exactly that.

⚠ **A rejecting `write()` no longer wedges the queue.** `drain()`
(`Saver.js:23`) now wraps the loop in `try/finally`, so `this.writing` always
clears — a rejected write is warned (`console.warn`) and costs that one save,
not every save after it. Still prefer resolving `false` on a handled failure over
throwing: `LocalStorageSaver.write()` does exactly that around `setItem`
(`QuotaExceededError`), which is why the common case never reaches `drain()`'s
catch at all.
