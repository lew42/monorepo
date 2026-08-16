A string, assigned once — `this.id ??= crypto.randomUUID()` in the constructor,
never touched after. There is no setter: renaming a node means giving it a new
identity, not this property a new value.

**Usage** — the stable handle everything keyed-by-node needs: selection across a
canvas re-render, a `History` snapshot restore, a duplicated block. `find(id)`
walks the tree for it. `Date.now()` was rejected as the source — it collides
inside the same millisecond, which duplicate-block hits immediately.

**Hydrate keeps a supplied id** rather than reassigning one, so a document round
trips with the same ids it was saved with. A blank one is filled in, and a
duplicate seen twice in one `hydrate()` call is freshened with a new one and
warned once — see [`hydrate`](../method/hydrate.md).
