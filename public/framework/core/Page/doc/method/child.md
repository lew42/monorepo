One url segment → a page: **memory, then `route()`, then the filesystem.**

**Usage** — the walk *is* the loader. `Router.load_segments()` calls it once per
segment (`framework/core/Router/Router.js:73`), `load_all_children()` calls it per
declared name (`Page.class.js:180`), and `ext/tabs` calls it to guarantee the first
tab's label is real (`framework/ext/tabs/tabs.js:40`).

```
children.get(name)  →  a Page      here already
                    →  null        declared, not resolved yet  → Page.load()
                    →  undefined   never declared              → route(), then Page.load()
```

**Necessity** — the class. Everything else about routing is a consequence of this
one method.

**Simplicity** — right-sized, and the ordering is the design, not an accident.
Three states in one Map, and the third slot keeps `route()` honest: it is tried
**only** for a name nobody declared, so a greedy route structurally cannot shadow a
`page.js`. The reverse order was tried and is worse — filesystem first made **every
dynamic url pay a doomed 404** before being claimed.

## An undeclared folder still resolves

The last step is a probe: `Page.load(this.url + name + "/")`. So a `page.js` on disk
that nobody put in a `children` list is reachable — **forgetting to declare costs
the menu entry, not the url.** It used to be a hard 404, on the theory that a loud
failure keeps the list honest; a 404 for a file you can see in the folder is a
puzzle, not a report.

The probe costs one failed import per genuine miss, and nothing for a url that
resolves. `Page.load()` separates *missing* from *broken*, so a syntax error in a
page you just wrote is an error in the console rather than a silent 404.

## And how deep the child then loads

`child(name, levels)`. **The Router passes nothing** — which means the child loads
to its own `depth`, so walking into a page is what deepens it. A number is the
caller's remaining budget, and only `load_all_children()` passes one. Every branch
below ends in `.load_all_children(levels)`, including the two that go through
`add()`, so there is one rule and no branch can forget it. `../declaring.md`.

## Also the one place `app` is handed down

`known.assign({ app: this.app })`, on the walk, to the page about to need it.
Nothing recurses it over the tree at boot. Note the asymmetry: the memory branch
assigns `app`, and the two branches that go through `add()` get it from the adopt
object instead — same result, two code paths.

## Safe to call twice

Two callers racing for the same name both get the same module — the browser's
module registry deduplicates, so `export default new Page()` runs once.

