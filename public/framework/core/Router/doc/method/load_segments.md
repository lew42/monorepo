**The walk IS the loader.** No separate resolve step, no route table.

```js
for (const name of url.split("/").filter(Boolean))
    page = await page.child(name);
```

## Usage

`Router.js:52` — `load()`, the only caller.

## Necessity

Essential, and it is the whole reason there is no registry. Each hop awaits
`page.child(name)`, which imports on a miss — so when this returns, every page in
the chain exists root-to-leaf with `parent` and `app` already assigned. One loop,
and the tree is both the router and the chunk map.

`children.get(name)` has three states, and the third is what makes a generated url
free:

```
a Page      here already
null        declared, not loaded  → import it
undefined   never declared        → route() may claim it, else 404
```

So a dynamic url costs **no doomed 404**, and `route()` structurally cannot shadow
a real file — a file you want is a file you declared.

## Simplicity

Right-sized: four lines, and there is nothing to remove. The cost is not in the
code, it is in the shape — the walk is **serial**, RTT + ~16ms per segment, and it
cannot be parallelised blindly because a segment's children are unknown until its
module has run. Knowing them in advance needs a manifest, which is the build step
this framework doesn't have. Numbers in
[measured](/framework/core/Router/docs/measured/).
