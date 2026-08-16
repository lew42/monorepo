The node's user-state bag — a plain object, always present. The constructor
guards it: anything not a plain object (an array, `null`, a string) becomes `{}`
rather than being kept, so a malformed `data` can never leak into the tree.

**Usage** — read with [`get(key)`](../method/get.md), written with
[`set(key, value)`](../method/set.md). Nothing reaches in and assigns `data`
directly at a call site; that would skip the change event `set()` emits.

**Why not spread flat** onto the Item itself, so `item.title` worked instead of
`item.get("title")`? Rejected — a user key named `items` (or `id`, `type`,
`parent`, `saver`) would collide with the tree's own keys, and a convenience that
needs a deny-list of reserved names is not actually a convenience. Every user key
lives under `data`, with no exceptions, so the collision cannot happen.
