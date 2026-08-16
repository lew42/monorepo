`this.saver ? this.saver.save(this) : this.parent ? this.parent.save() : Promise.resolve(false)`

**Delegates up, always** — a child asking to save persists the whole
**document**, never its own subtree. This is the fix for an executed defect: a
child's `save()` used to write only itself and overwrite the document with a
partial tree. See the readme's Verdicts for the three options weighed
(per-node saver / saver inherited by copy / delegate up) and why delegation won.

**⚠ Resolves `false`, never throws, when nothing in the chain has a saver** —
including a lone unattached `new Item()`. A caller that wants to know *why* a
save did nothing has to check for a saver itself; this method's contract is
just success or not.

Note the argument to `saver.save()` is always `this` at the delegation's
origin, not the root that ends up handling it — see
[`ext/Saver`](/framework/ext/Saver/) for what the saver actually does with it
(in practice, serializes the whole tree from wherever it's attached, not just
the passed node).
