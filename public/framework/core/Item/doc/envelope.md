# The wire envelope

Every `Item` serializes to exactly four keys, `items` omitted when empty:

```json
{ "type": "Item", "id": "…", "data": { }, "items": [ ] }
```

`type` comes from [`wire()`](method/wire.md), `id` and `data` are copied as-is,
`items` is each child's own envelope, recursively — [`toJSON()`](method/toJSON.md)
is the whole implementation, four lines.

## Why flat `data` and not a spread

An earlier shape spread user keys directly onto the node (`item.title` instead
of `item.get("title")`). Rejected: a user key named `items` — or `id`, `type`,
`parent`, `saver` — would collide with the envelope's own keys, and a
convenience that needs a deny-list of reserved names has stopped being a
convenience. Every user key lives under `data`, no exceptions, so the collision
is structurally impossible rather than merely avoided by convention.

## Unknown types round-trip losslessly

[`hydrate()`](method/hydrate.md) never drops a node it doesn't recognize. A
`type` with no [registered](method/register.md) class becomes a plain `Item`
that remembers its original wire name (via an instance-level `this.type`, read
by [`wire()`](method/wire.md) before the registry) — so a document opened
without every block type imported still opens, still edits everywhere except
the unknown node, and still saves back byte-for-byte identical on that node.
The alternative — drop it, or throw — was rejected unanimously: a document you
cannot open at all is a worse failure than one you can't fully edit.

## What is *not* in the envelope

No `parent` (see [that property](property/parent.md) — restored by adoption,
not stored), no dirty flag (cut — see the readme's Verdicts: saving is
document-level, "something changed, write the document," not gated on which
field), no view state, no undo history. `ext/editor`'s `History` snapshots this
same envelope wholesale and restores it through this same `hydrate` path, so
every Ctrl+Z is a live round-trip test of the format above.
