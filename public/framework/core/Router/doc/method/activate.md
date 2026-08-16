The chain diff. **Only what changed.**

```
from   /a/b/c/   [root, a, b, c]
to     /a/x/     [root, a, x]
shared 2         root and a are left completely alone
```

## Usage

`Router.js:61` — `load()`, the only caller.

## Necessity

Essential — the one place a page is shown or hidden. Deactivate deepest-first and
activate shallowest-first, because a container must exist before its child mounts
into it and must not be torn down before its child has left. A sidebar built by an
ancestor is never rebuilt, never loses scroll position and cannot flicker.
[chain-diff](/framework/core/Router/docs/chain-diff/).

Four other things ride along in the same eleven lines, and each is here because it
has to happen exactly once per navigation: `this.active`, `mark()`,
`document.title`, and the scroll reset.

## Simplicity

**No awaits past the group.** The comment on `Router.js:86` is the constraint that
shapes the whole method — a site can wrap this in `document.startViewTransition()`
only because nothing here suspends. That is why the two awaits live one level up,
in [`load`](/framework/core/Router/api/load/).

It does more than its name says, and the candidates for a split are the title and
the scroll reset. Neither is worth a method: both are one line, both are once per
navigation, and moving them means a second thing to call in the right order.
[scroll-reset](/framework/core/Router/docs/scroll-reset/) says why deleting the scroll
line only *looks* safe.

`this.app.navigated?.(page, from)` is duck-typed, so it costs nothing until a site
defines it. [navigated](/framework/core/Router/docs/navigated/).
