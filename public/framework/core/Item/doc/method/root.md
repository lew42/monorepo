Walks `parent` until it runs out, returns the top. On a node with no parent it
returns `this` — a lone Item is its own root, which is what makes
`new Item(...).save()`'s delegation chain terminate correctly instead of
walking into `undefined`.

Linear in tree depth, called on every [`save()`](save.md)/[`delete()`](delete.md)
and by [`contains()`](contains.md)'s sibling checks — fine at any realistic
document depth, and there is no cached shortcut because a cache would need
invalidating on every [`move()`](move.md).
