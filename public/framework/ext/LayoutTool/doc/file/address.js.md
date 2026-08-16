One line, its own file, because two modules must not each write their own copy
of it. `locate(root, path)` turns a finding's address back into the element it
is about — `mirror.js` clones what it returns, `highlight.js` rings it.

## `:scope >`, or the chain floats

`root.querySelector(path)` does **not** anchor `path` at `root`.
`Element.querySelector` matches its selector against the whole tree and only
then keeps the descendants, so a bare `:nth-child()` chain finds the first
element *of that shape anywhere under the root*. Measured on 13 pages: **5 of
209 findings resolved to the wrong element**, including the top-ranked finding
on `/framework/` — the dev rail's before/after rendered the site's nav rail
twice and captioned it a padding fault.

That is the whole reason this is not written inline at each call site. The full
account, and the second way to get an address wrong (a walk index):
[addressing](/framework/ext/LayoutTool/docs/addressing/).

## An empty path is the root

The analysis root is its own address, so `locate(root, "")` returns `root`. The
dev rail uses exactly that to make its `target` row point at whatever is being
measured.

## Improvements

Nothing ranked: one exported line, two callers, and the reason it is not written
inline at each of them is the whole file. The one thing that could grow here is
the *reverse* — an `address(el, root)` that walks a live element back to a path,
which nothing has needed yet.
