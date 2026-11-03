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
[addressing](/framework/ext/DesignTool/doc/addressing/).

## An empty path is the root

The analysis root is its own address, so `locate(root, "")` returns `root`. The
dev rail uses exactly that to make its **target** line ring whatever is being
measured, and `mirror.js` uses it to clone a page-level finding's subject.

⚠ **A FINDING must never take that path.** `dead-space` and `invisible` issue
against the root, so an empty path handed them a ring over the entire viewport —
3440×1440, tagged `div.app`, on 12% of leading findings at 3440. `locate()` is
right and stays as it is; `highlight.js`'s `point()` is what refuses to offer a
ring for an empty address. A target readout ringing the page is information; a
finding ringing the page is not.

## Improvements

Nothing ranked: one exported line, two callers, and the reason it is not written
inline at each of them is the whole file. The one thing that could grow here is
the *reverse* — an `address(el, root)` that walks a live element back to a path,
which nothing has needed yet.
