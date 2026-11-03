The [`Item`](/framework/core/Item/) this list belongs to — set once, at
construction: every `Item` builds its `items` with `new List({ owner: this })`.

**This is the entire reason `List` is a class and not a bare array.**
[`adopt()`](../method/adopt.md) reads it to decide what a child's `parent`
becomes (`child.parent = this.owner ?? this`), and [`notify()`](../method/notify.md)
reads it to know who to `emit` on. Take `owner` away and both of those become
free functions a call site has to remember to invoke — which was exactly
Steve's dissenting argument for cutting `List` and using a plain Array instead;
see the readme's Verdicts.

The `?? this` fallback exists for a `List` built without an owner (none of the
framework's own code does this, but nothing prevents it) — it degrades to
`parent = list` rather than throwing on a missing owner.
