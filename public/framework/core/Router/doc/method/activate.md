The chain diff. **Only what changed** — shared leading pages are never touched.

```
from   /a/b/c/   [root, a, b, c]
to     /a/x/     [root, a, x]
shared 2         root and a are left completely alone
```

So a sidebar built by `a` is not rebuilt, does not lose scroll position, and does
not flicker. Reversed on the way out and forward on the way in, because a
container must exist before its child mounts into it, and must not be torn down
before its child has left.

## No awaits past the group

`await this.app.styles_loaded()` happens in `load()`, one level up, deliberately.
**`activate()` must stay synchronous**: that "no awaits past this point" guarantee
is what lets a site wrap the whole swap in `document.startViewTransition()`.

Found by a seat whose missing animation was simply louder than a missing margin
would have been.

## `navigated?.(page, from)`

Duck-typed, so it costs nothing until a site defines it. `from` is passed as well
as `page` because the hook fires on first paint too, and two people independently
re-derived "is this the first navigation" — one from `from.length`, one by
counting — while it was already computed on line one and being thrown away.
