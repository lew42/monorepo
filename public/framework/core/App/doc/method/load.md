The one import that isn't behind a click. Everything below the root is a *name*
until the Router walks to it.

```js
this.root = (await Page.load("/"))?.assign({ app: this });
this.router = new Router(this.router, { app: this });
if (!await this.router.load(location.pathname)) throw new Error("404");
```

`this.root` is **the only page handed `app` directly**; every other page gets it
from its parent on the walk, in `Page.child()`.

## The try covers more than the import

`activate()` renders every page in the chain, which runs every `content()` there
is — so a throw in any of them would otherwise skip `inject()` and paint nothing
at all. Wrapping only the import would have left the most common failure (a typo
in a page you just wrote) showing a blank screen with a clean console.

## `new Router(this.router, { app: this })`

No branch, and this is the assign-based constructor earning its keep:
`this.router` may be `undefined`, a POJO of options, or already a Router. Later
args win, so whatever the user passed is layered under what App must inject. Three
cases, one line, nothing to remember.
