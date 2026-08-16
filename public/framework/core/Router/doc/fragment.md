# A cross-page `#fragment` lands at the top

`click()` hands `go()` the whole url and `go()` walks `new URL(url).pathname`, so the
path resolves the page while history keeps `?q=` and `#section`. That half is fixed.
The scroll position is not: `activate()` ends in an unconditional `scrollTo(0, 0)`.

**The browser cannot help.** Native fragment scrolling moves the *window*, and on
this site the window never moves — the **region** scrolls. So the Router would have
to do it, and at the moment `activate()` runs the target does not exist yet.

Instrumented on `/framework/core/Page/#children`:

```
sync (in activate)   id=false   panel h2 count = 0
microtask 1          id=false   panel h2 count = 4     ← ext/tabs filled the panel
microtask 2          id=true    panel h2 count = 4     ← ext/toc assigned the ids
rAF                  id=true                            (but this is after paint)
```

Two hops, and **both belong to exts** — `ext/tabs` fills a Doc panel in one
microtask, `ext/toc` assigns heading ids in another. Landing on the target means
either:

- **hard-coding that hop count into core** — an invisible timing dependency on a
  tier core may not even import, with nothing to grep and nothing to throw when it
  changes; or
- **deferring to `requestAnimationFrame`** and accepting a visible jump one frame
  after paint, which is exactly the draw-then-sharpen behaviour the eager `loading`
  await exists to remove.

Neither is worth it for a feature nobody has asked for. If it is ever wanted, the
honest shape is a **page-side hook** — the page knows when its own content is final —
rather than the Router guessing. And `.pages` scrolling instead of the window is the
fact that makes the whole problem ours.
