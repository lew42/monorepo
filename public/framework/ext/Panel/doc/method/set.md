`set(key, value)` overrides `Item`'s own setter for exactly one reason: a
**shared** key (`Panel.shared`) on a mirror must write the **master**, not
itself — `this.master()` is only truthy when `data.mirror` names a live panel,
so an ordinary panel's `set()` falls straight through to `super.set()`.

```js Panel.js
set(key, value){
	const to = Panel.shared.includes(key) && this.master();
	return to ? to.set(key, value) : super.set(key, value);
}
```

This is the one-line reason a live duplicate *is* live: the bar's `template`
button calls `item.set("template", …)` exactly as it would on any panel, and
on a mirror that call is silently redirected to the panel it copies. The
caller — the bar, the inspector — never has to know which panel it is holding.

⚠ **A key not in `Panel.shared` always writes locally**, mirror or not —
`grow`, `mode` and `dir` answer questions about a *slot*, not about content, so
a duplicate dropped in a narrow column stays that column's width even while
its template tracks the master. See
[Decisions](/framework/ext/Panel/doc/decisions/) for why the split is drawn
where it is.
