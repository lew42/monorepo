```js
constructor(...args){
    this.loaders = [];

    const { promise, resolve } = Promise.withResolvers();
    this.ready = Object.assign(promise, { resolve });

    this.assign(...args);
    this.instantiate();
}
```

Documented here rather than as a member page because `Doc` renders a member's
real source, and a class's `constructor` descriptor **is the class** — the panel
would print the whole file.

## Usage

`app.js:25` — `window.app = new App({ … })`, once per document. That is the only
construction in the repository.

## Necessity

Essential, and every line is load-bearing:

- **`loaders` and `ready` come first**, so a passed `config()` can already call
  `this.font()` and a caller can already `await app.ready`.
- **`assign()` second**, so everything a site passed — including `render()`,
  `config()`, `logo()`, `brand()` — is in place before boot starts.
- **`instantiate()` last**, unawaited.

## Simplicity

Right-sized, with one cost that used to be unfixed. **The async call is not
awaited**, which is what makes `window.app = new App()` read well — and meant a
throw anywhere outside `load()`'s own try/catch became a silent unhandled
rejection *and* left `app.ready` pending forever. `instantiate()` now wraps its
own body in a try/catch that calls `error()` on the way out, with
`ready.resolve()` moved after the catch so it always runs. [boot](/framework/core/App/doc/boot/).

The ordering trap, stated once: `assign()` runs **after** `loaders` and `ready` are
set, so `new App({ loaders: [x] })` is silently discarded. Nobody has tried it.
