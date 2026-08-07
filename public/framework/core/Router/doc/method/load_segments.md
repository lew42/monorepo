**The walk IS the loader.** There is no separate resolve step and no route table.

```js
for (const name of url.split("/").filter(Boolean))
    page = await page.child(name);
```

Each hop awaits `page.child(name)`, which imports on a miss — so when this
returns, every page in the chain exists, root-to-leaf, with `parent` and `app`
already assigned. One loop, and the tree is both the router and the chunk map.

**Only names a parent declared are ever fetched.** `children.get(name)` has three
states, and the third is what makes a dynamic url free:

```
a Page      here already
null        declared, not loaded  → import it
undefined   never declared        → route() may claim it, else 404
```

So a generated url costs **no doomed 404**, and `route()` structurally cannot
shadow a real file — a file you want is a file you declared.

## The honest cost

The walk is **serial**: RTT + ~16ms per segment, linear. A 5-deep cold link is
1.7s of walking at 150ms RTT. It **cannot be parallelised blindly**, because a
segment's children are unknown until its module has run — knowing them in advance
would need a manifest, which is the build step this framework doesn't have.

Measured on the live site: every cold route fetches **exactly its chain length**.
Inline pages cost zero.
