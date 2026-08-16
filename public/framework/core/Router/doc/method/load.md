Resolve a path, wait for what the new page needs, activate it. Returns a boolean.

## Usage

Three callers, and they are the three ways a url changes:

- `App.js:58` — the first paint.
- `Router.js:12` — `popstate` (Back/Forward).
- `Router.js:44` — `go()`, i.e. a click.

## Necessity

Essential, and it is the only place the two pre-activation awaits live:

```js
await this.app.styles_loaded();
await Promise.allSettled(page.chain().map(p => p.loading));
```

Both are here rather than one line later in `activate()`, on purpose —
`activate()` must stay synchronous so a site can wrap the swap in
`document.startViewTransition()`. `allSettled` both times, so a 404'd stylesheet
or a broken child costs a warning rather than every later navigation.
[styles-loaded](/framework/core/Router/docs/styles-loaded/).

**It returns a boolean, not the page.** It used to return the page, to let a
`redirect()` chain off it; that was [backed out](/framework/core/Router/docs/backed-out/) and the boolean
is the verdict.

## Simplicity

Right-sized, and slightly overloaded: it resolves, it settles, and it activates.
The two awaits are the only part that is not obvious, and the reason they sit
here rather than in `activate()` is a comment in the source because there is
nowhere else to see it.
