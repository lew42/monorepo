Adoption hands a page a new address — the resolved subtree moves with it.

**Usage** — one caller: `add()`, the adoption point. A page built standalone
derives a url from its own `title` (`naming()`), so by the time it lands in a
`children:` array it already has an address — `/html/` — and the parent's claim
must win: `/web/html/`. Resolved children re-derive by the same rule; a declared
name still `null` in the Map has nothing to move, and resolves later against the
new address.

**Necessity** — arrived with `title → url` in `naming()`. Before that, a
standalone page had no url until adoption and `??=` was enough; the derivation
created the first case where adoption must *overwrite*.

**Simplicity** — one guard, one assignment, one walk. The guard makes it
idempotent, and an alias — a child living at a url that is not
`parent.url + name + "/"` — is deliberately not a case: `nav_for()` already
refuses to honour one, and marking would break on it.
