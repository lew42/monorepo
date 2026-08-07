# Only what changed — the chain diff

```js
const shared = this.shared_depth(from, to);
from.slice(shared).reverse().forEach(p => p.deactivate());   // deepest first
to.slice(shared).forEach(p => p.activate());                 // shallowest first
```

Shared leading pages are **never touched** — navigating `/a/b/c/` → `/a/x/` leaves
`root` and `a` completely alone, so a sidebar built by `a` is not rebuilt, does
not lose scroll position, and does not flicker.

Reversed on the way out and forward on the way in, because a container must exist
before its child mounts into it and must not be torn down before its child leaves.

**`order` is gone.** `mark()` used to write `style="order: i"` from the chain
index. Unnecessary: pages are appended root-to-leaf and never moved, so DOM order
is already chain order — and same-depth siblings are never visible together, so
their relative order cannot be observed.
