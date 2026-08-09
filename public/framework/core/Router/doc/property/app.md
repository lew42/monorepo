The `App` this Router belongs to. Injected, never looked up.

```js
this.router = new Router(this.router, { app: this });   // App.js:63
```

## Usage

Four reads, four different things — which is the whole of what the Router needs
from the outside world:

- `Router.js:67` — `app.styles_loaded()`, awaited before every activation.
- `Router.js:80` — `app.root`, the page the walk starts from.
- `Router.js:111` — `app.navigated?.()`, the post-navigation hook.
- `Router.js:130` — `app.$app`, the element every query is scoped to.

## Necessity

Essential. The Router owns no DOM and no page tree; all four of the above belong
to `App`, and taking them as one injected object is what keeps the constructor
signature at zero named parameters.

**Never `window.app`.** It is a console convenience, it hard-codes one App per
document, and it is `undefined` during boot — `app.js` runs
`window.app = new App()`, so the global is unset while `config()` executes.

## Simplicity

Right-sized as a dependency, arguably wide as an interface: four unrelated members
of a class this one is meant to be independent of. A narrower seam would be
passing the four in, which trades one clear reference for four — worse.

Nothing sets it but `App`, and nothing checks that it was set: a `new Router()`
with no app throws on the first click, in `load_segments`.
