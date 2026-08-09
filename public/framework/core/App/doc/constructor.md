```js
constructor(...args){
    this.loaders = [];

    const { promise, resolve } = Promise.withResolvers();
    this.ready = Object.assign(promise, { resolve });

    this.assign(...args);
    this.instantiate();
}
```

Documented here rather than as a member page because `classdoc` renders a member's
real source, and a class's `constructor` descriptor **is the class** — the panel
would print the whole file.

## Usage

`app.js:23` — `window.app = new App({ … })`, once per document. That is the only
construction in the repository.

## Necessity

Essential, and every line is load-bearing:

- **`loaders` and `ready` come first**, so a passed `config()` can already call
  `this.font()` and a caller can already `await app.ready`.
- **`assign()` second**, so everything a site passed — including `render()`,
  `config()`, `logo()`, `brand()` — is in place before boot starts.
- **`instantiate()` last**, unawaited.

## Simplicity

Right-sized, with one recorded cost. **The async call is not awaited**, which is
what makes `window.app = new App()` read well — and means a throw anywhere outside
`load()`'s own try/catch becomes a silent unhandled rejection *and* leaves
`app.ready` pending forever. One `.catch(e => this.error(e))` here fixes both.
Recorded rather than done, because the try in `load()` covers the failure that
actually happens: a page module throwing. [boot](/framework/core/App/docs/boot/).

The ordering trap, stated once: `assign()` runs **after** `loaders` and `ready` are
set, so `new App({ loaders: [x] })` is silently discarded. Nobody has tried it.
