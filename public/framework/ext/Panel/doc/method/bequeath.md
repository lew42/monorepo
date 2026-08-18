`bequeath(heir)` hands mastership on before `this` stops holding what its
copies read. If `this` has no copies, it's a no-op (`return this`). Otherwise
`heir` — default `copies()[0]` — takes every `Panel.shared` key that is
actually present in `this.data` (raw, not `.get()`, so a value that was only
ever a default never transfers), loses its own `data.mirror` so it becomes
the new master, and every other copy is re-pointed at `heir.id`.

Every structural verb that stops holding what a copy reads calls this first
(or last — see each verb's own doc for the ordering, which matters):
`split()`, `close()`, `absorb()`, and `generate.js`'s `sow()`.

⚠ **The early return is load-bearing on a mirror.** A mirror's own `copies()`
is always empty (mirror-of-a-mirror collapses at creation, so nothing ever
points at a mirror), so calling `bequeath()` unconditionally on a mirror —
which `split()` and `close()`'s subtree walk both do — is safe: it returns
immediately instead of deleting the `mirror` link the caller is carrying
down.

⚠ **`heir` can itself be a fresh, dataless `Panel`** — `split()` passes the
new child it just built. Shared keys land on it for the first time here;
nothing about `bequeath()` requires the heir to have held any of them before.
