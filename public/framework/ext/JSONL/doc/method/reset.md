Forget everything the replay appended — `logs`, `actions`, `skipped`, the
[`unparsed`](/framework/ext/JSONL/api/unparsed/) count, and (on `TaskJSONL`)
`agents` and `chats` — and drop `loaded`, so the instance reads exactly like one
that was never loaded. Returns `this`.

Called on one message only: `jsonl_reset`, when the dev server finds a file it
had already streamed shorter than the offset it last read, or gone. (A file
missing at *subscribe* time never resets — it is answered with an empty batch
and streams when created.) Nothing else in the module calls it, and a renderer
should not — the log is append-only, so "start over" is a statement about the
*file*, not a UI action.

**⚠ It cannot unset what `assign` set.** A line `{"assign": {"now": "…"}}` puts
`now` on the instance the same way the constructor would, and there is no record
of which keys arrived that way. So a rewritten file that *drops* a field leaves
the old value showing until a reload. The alternative — construct a fresh instance
— would break every renderer holding a reference, which is the whole reason the
replay mutates in place.

A subclass that adds an array must override this the same way it overrides
`static verbs`, calling `super.reset()` last:

```js /framework/ext/JSONL/JSONL.js
reset(){
	this.agents = [];
	this.chats = [];
	return super.reset();
}
```

Forgetting it fails silently in exactly one scenario — a reset log doubling its
agent rows — which is why it lives next to the verbs trap in
[task-jsonl](/framework/ext/JSONL/doc/task-jsonl/).
