```js
styles_loaded(){ return Promise.allSettled(View.stylesheets); }
```

Stylesheets only, settled not resolved. The navigation-time half of the pair.

## Usage

`Router.js:58` — `load()`, before every activation, on every navigation. The only
caller anywhere.

## Necessity

Essential. A page imported on *this* navigation has just called
`View.stylesheet()` at module scope, and its `<link>` is not in
`document.styleSheets` yet — so without this the page paints unstyled and snaps.

**It must not await `loaders`**, and that is why it exists as a second method
rather than a flag on `loaded()`: `loaders` only grows, so one rejected loader
would kill every later navigation. `allSettled` for the same reason at smaller
scale — a 404'd stylesheet costs a warning, not the router.
[loaders](/framework/core/App/docs/loaders/).

## Simplicity

Right-sized, and the two-method split is the correct shape. A single
`loaded({ styles: true })` would be one method with a flag, and the flag would be
wrong in one of the two call sites forever.

The name is the weakest part — it reads like a boolean. `styles_settled()` would be
truer to `allSettled`, and truer to the fact that it resolves whether or not the
sheets arrived. Recorded in the readme; a rename here is a rename in `Router.js`.
