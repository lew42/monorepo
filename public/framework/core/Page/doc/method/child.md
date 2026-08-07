One url segment → a page: **memory, then the filesystem, then no.**

```
children.get(name)  →  a Page      here already
                    →  null        declared, not loaded  → import it
                    →  undefined   never declared        → route() may claim it
```

Three states in one Map, and the third slot is what makes the whole loader work.
An earlier version tried the filesystem first and fell back to `route()`, so
**every dynamic url paid a doomed 404** before being claimed. Checking `route()`
first is worse: a greedy one silently shadows a real file.

Declared children give the third slot, and with it two properties for free:
**only declared names ever hit the network**, and **`route()` structurally cannot
shadow a `page.js`** — because a file you want is a file you declared.

## Also the one place `app` is handed down

Assigned here, on the walk, to the page about to need it. Nothing recurses it over
the tree at boot, so a lazy child gets `app` exactly the way an eager one does.

## Safe to call twice

Two callers racing for the same name both get the same module — the browser's
module registry deduplicates, so `export default new Page()` runs once.
