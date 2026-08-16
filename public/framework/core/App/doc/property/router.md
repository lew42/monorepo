The `Router`. Also the *options for* the Router, before `load()` runs.

```js
this.router = new Router(this.router, { app: this });   // App.js:61
```

## Usage

- `App.js:61` — constructed, from whatever was already there.
- `App.js:63` — `this.router.load(location.pathname)`, the first navigation.
- Site code — `app.router.go(url)`, the one programmatic navigation.
- `ext/tabs/tabs.js:55`, `ext/catalog/catalog.js:62` — `app?.router?.mark_links()`,
  for links rendered after `mark()` ran.

## Necessity

Essential. It is the site's one handle on navigation, and the only supported way to
reach the Router at all — nothing exports a singleton.

## Simplicity

Right-sized, and the one line above is the clearest example of the assign-based
constructor in the framework: **the property holds the config until it holds the
object.** `this.router` may be `undefined`, a POJO the site passed to `new App({
router: {…} })`, or an already-built Router. Later args win, so App's injection
layers on top with no branch and no case analysis.

The cost is that the property has two types over its lifetime, and the window
between them is inside one method. Nothing reads it before line 68, so it has never
mattered — but it is the reason `router` is not documented as *"a Router"* without
qualification.
