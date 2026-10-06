The live `page.jsonl` persistence store for this page (`Item.Store`, or its `Page.Reader` specialization).

```js
page.store: Item.Store              // attached by Page.jsonl()
```

**Usage** — attached during `Page.jsonl(url)`:
`reader = this.Reader.for(url + "page.jsonl")`
`reader.attach(page)` sets `host.store = this` and `this.host = host`.

The store manages:
- **Loading & replaying:** reads `page.jsonl` lines and replays each through `page.set(line)`.
- **Live streaming (localhost):** tails new lines and emits updates via WebSocket stream (`ext/JSONL/live.js`).
- **Appending:** listens for `delta` events bubbling up from `#Item` and child `#List` instances, wraps them into the canonical nested wire shape (`Store.line_for()`), batches them, and flushes them through `FsFile.send()`.

**Difference from `prefs()`:**
- `page.store` is the LIVE `page.jsonl` store (`Item.Store`).
- `page.prefs()` is the `localStorage` key-value helper (formerly called `store()`, renamed 2026-10-02 so the two never collide).
See [`doc/method/prefs.md`](../method/prefs.md) for localStorage.
