Draws the manifest's own part of the page — `checklist`, `unparsed`, `extra`,
`figures` — into `this.$live`, and is called again for every batch
[`ext/JSONL`'s `live()`](/framework/ext/JSONL/api/live/) streams. `report()`
creates the box; `refresh()` fills and refills it.

```js /framework/ext/AITask/AITask.js
refresh(m){
	this.$live.empty(() => {
		this.checklist(m);
		this.unparsed(m);
		this.extra(m);
		this.figures(m);
	});
}
```

[`unparsed()`](/framework/ext/AITask/api/unparsed/) is silent unless the log had
lines that failed `JSON.parse`. It sits here rather than beside the request because
it is a fact about *this replay*, and it must be recomputed on every batch: an
append can drop a line the previous render knew nothing about.

## Why only three of the six parts

`chat()` and `log()` are *stateful*: the chat panel may hold a half-typed message
(and the server appends a `chat` line to this very file when a turn lands, so a
naive full redraw would wipe the box mid-conversation), and `feed()` owns a poll
loop and a scroll position. `head()` renders the request and the brief, which do
not change while you watch. So the streaming boundary is drawn exactly where the
manifest's *volatile* fields are, and `.ai-live` is that boundary made visible in
the DOM.

**⚠ `empty(fn)`, not a rebuild.** The callback re-establishes the captor — a
streamed batch arrives as a socket message, with no captor of its own, so factory
calls made directly from the callback would land wherever the last render left it.

**⚠ The guard is `this.$live &&`.** `session()` resolves before `report()` runs,
so an early second batch can arrive before the box exists; `refresh()` assumes it
does. A task page that overrides `report()` and never creates `$live` simply never
streams — it does not throw.

Overriding this is how a task's own `page.js` changes what redraws. Overriding
`extra()` — the usual case — needs nothing: it is inside the box already.
