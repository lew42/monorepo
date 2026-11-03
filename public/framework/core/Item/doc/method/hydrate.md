The one deserialization path, static, recursive: JSON in, a live `Item` tree
out. **Tolerant of every malformed input** — nothing here throws; every bad
shape is warned once (see [`Item.warned`](../../Item.js) in the source) and
substituted with something safe:

| bad input | recovery |
|---|---|
| not an object at all | treated as `{}` |
| unknown `raw.type` | hydrates as plain `Item`, wire name kept on the instance |
| `data` not a plain object | replaced with `{}` |
| `items` not an array | treated as `[]` |
| duplicate `id` seen earlier in this call | reassigned a fresh one |

**Usage** — `Item.hydrate(json)` for a subtree, `Item.hydrate(json, seen)` when
recursing (children share the parent call's `seen` Set, so a duplicate id is
caught across the whole tree, not just siblings). [`Item.open()`](open.md) is
the async wrapper that also loads and attaches a saver.

**⚠ Rebuilds `parent` by adoption, not by reading a stored backref** — each
child is hydrated and then appended through `item.items.append(kid)`, which is
what sets `parent`. There is no backref in the wire format to read in the first
place; see [`toJSON`](toJSON.md).

Returns a plain `Item` (never the registered subclass) when `raw.type` names a
class that was never [registered](register.md) — "keep, don't drop, don't
throw" was a unanimous council call: a document you cannot open is worse than
one you cannot fully edit.
