`mirror(of)` turns `this` into a **live duplicate** of `of`: it writes
`data.mirror = source.id` (where `source` is `of`'s own master, if `of` is
itself a copy — never a mirror of a mirror) and emits `change`, which is what
tells the workspace's root listener to start repainting this panel whenever
the source changes.

```js Panel.js
mirror(of){
	const source = of.master() ?? of;
	if (source === this) return this;

	this.data = { ...this.data, mirror: source.id };
	return this.emit("change", "mirror", source.id);
}
```

⚠ **Collapsing to the original happens at creation, not at read time.** A
mirror-of-a-mirror would let `get()`'s single `master()` lookup chain
indefinitely; resolving `source` once, here, is what keeps that lookup a
single hop forever.

## What a mirror shares, and what it keeps

`Panel.shared` (`template`, `tone`, `align`, `display`, `seed`, `text`) is what
`get()`/`set()` delegate to the master — what the panel **holds** and **looks
like**. `grow`, `mode` and `dir` never delegate: those answer questions about
the *slot* the copy landed in, not about its content, so a duplicate dropped
into a narrow column stays that column's width regardless of what its master
is doing. `text` (`text.js`'s per-run edits) rides along only because
`template` does — both key against the same drawing, so master and mirror
share one key space by construction. Full reasoning, including why a literal
shared `Item` is impossible: [Decisions](/framework/ext/Panel/doc/decisions/).

`PanelDrag.release()` is the usual caller — Alt held at drop calls
`new Panel({ data: { grow: this.item.get("grow") } }).mirror(this.item)` — and
the bar's own `content_copy` button calls it the same way, for a panel you
would rather not drag.
