The streaming door, opened by name: `live()` where you would have written
`load()`. It resolves the same way — the instance, replayed, with
[`loaded`](/framework/ext/JSONL/api/loaded/) set only if the file really had
content — and then keeps calling `changed(this)` once per appended batch for as
long as the tab lives.

```js
const task = new TaskJSONL({ url: base + "task.jsonl" });
await task.live(() => this.$live && this.refresh(task));
if (!task.loaded) return this.legacy();
```

**⚠ `changed` fires for every batch except the first**, which the promise already
reported. Do not render from the callback alone, and do not render twice: await,
render, and let the callback redraw from there.

**⚠ The callback runs outside any captor** — it is a socket message, not a render.
Redraw through `$view.empty(() => …)` or `$view.append(() => …)`, which
re-establishes the captor; factory calls made straight from the callback land
wherever the captor last was.

Off localhost there is no socket, so this **is** `load()` — one fetch, no
subscription, `changed` never called. That is not a degraded mode, it is the
production path: the site is statically hosted and nothing on it may depend on the
dev server. The same fallback catches a server that answers a subscribe with
nothing within 1.5s.

`changed` is optional. `live()` with no callback still streams — the instance
stays current for whoever reads it next — which is how a caller that redraws on
its own schedule opts in.

A probe that comes back empty leaves its subscription **standing**, so the file
streams the moment it is created. When the caller knows it never will be — the
snippet above, once `legacy()` answers — it says so:
[`unsubscribe()`](/framework/ext/JSONL/api/unsubscribe/).

Design record, including the offset contract and the several-readers case:
[live](/framework/ext/JSONL/docs/live/).
